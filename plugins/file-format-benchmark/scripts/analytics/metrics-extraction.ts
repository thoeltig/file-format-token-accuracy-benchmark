/**
 * Metrics Extraction Module
 * Extracts read and reasoning metrics from agent transcripts
 * Combines both into a single metrics.json file
 */

import * as fs from "fs";
import * as path from "path";
import { AgentIdsFile, FullTestAgentIdEntry, ReadOnlyAgentIdEntry, UserMetrics } from "../types";

interface ReadMetricsFile {
  file: string;
  path: string;
  agentId: string;
  format: string;
  structure: string;
  variant: string;
  recordCount: number;
  readTokens: number;
  readDurationMs: number;
}

interface ReasoningMetricsFile {
  format: string;
  structure: string;
  variant: string;
  recordCount: number;
  testRuns: number;
  durationMs: number;
  durationMsMin: number;
  durationMsMax: number;
  // Output tokens contain the tokens generated for the output of the LLM and include the reasoning tokens
  outputTokens: number;
  outputTokensMin: number;
  outputTokensMax: number;
}

interface CombinedMetrics {
  read: {
    files: ReadMetricsFile[];
    summary: {
      totalFiles: number;
      totalReadTokens: number;
      totalReadDurationMs: number;
      averageReadTokens: number;
      averageDurationMs: number;
    };
  };
  reasoning: {
    files: ReasoningMetricsFile[];
    summary: {
      totalTestCases: number;
      totalDurationMs: number;
      totalOutputTokens: number;
      averageDurationMs: number;
      averageOutputTokens: number;
    };
  };
}

class MetricsExtraction {
  private agentIdsFile: string;
  private projectsDir: string;
  private outputFile: string;

  constructor(agentIdsFile: string, outputFile: string, projectsDir?: string) {
    this.agentIdsFile = agentIdsFile;
    this.outputFile = outputFile;
    this.projectsDir = projectsDir || path.join(process.env.HOME || process.env.USERPROFILE || "~", ".claude", "projects");
  }

  public extract(): UserMetrics[] {
    if (fs.existsSync(this.outputFile)) {
      try{
        const content = fs.readFileSync(this.outputFile, "utf-8");
        const combined = JSON.parse(content) as CombinedMetrics;
        console.log("✓ Metrics loaded");
        return this.mergeCombinedMetrics(combined);
      }
      catch{ }
    }
    
    if (!fs.existsSync(this.agentIdsFile)) {
      console.warn(`AgentId file not found: ${this.agentIdsFile}`);
      return [];
    }

    console.log("Loading agent IDs from file...");
    const agentIds = this.loadAgentIds();

    console.log("Finding transcript files...");
    const readTranscripts = this.findTranscriptFiles(agentIds.readOnlyTests.map(t => t.agentId));
    const fullTranscripts = this.findTranscriptFiles(agentIds.fullTests.map(t => t.agentId));

    // Check if any transcripts were found
    if (readTranscripts.size === 0 && fullTranscripts.size === 0) {
      throw new Error(
        `No transcripts found!\n\n` +
        `Searched for:\n` +
        `  - ${agentIds.readOnlyTests.length} read-only tests\n` +
        `  - ${agentIds.fullTests.length} full tests\n\n` +
        `Transcript location: ${this.projectsDir}\n\n` +
        `Possible causes:\n` +
        `  1. Agent tasks have not completed or were interrupted\n` +
        `  2. Incorrect agent IDs in agent_ids.json\n` +
        `  3. Transcripts are stored in a non-standard location\n\n` +
        `Agent IDs:\n` +
        `  Read-only: ${agentIds.readOnlyTests.map(t => t.agentId).join(", ")}\n` +
        `  Full tests: ${agentIds.fullTests.map(t => t.agentId).join(", ")}`
      );
    }

    console.log(`✓ Found ${readTranscripts.size} read transcripts and ${fullTranscripts.size} full transcripts`);

    console.log("Extracting read metrics...");
    const readMetrics = this.extractReadMetrics(readTranscripts, agentIds.readOnlyTests);

    console.log("Extracting reasoning metrics...");
    const reasoningMetrics = this.extractReasoningMetrics(fullTranscripts, agentIds.fullTests);

    console.log("Combining metrics...");
    const combined = this.combineMetrics(readMetrics, reasoningMetrics);

    console.log(`Writing results to ${this.outputFile}...`);
    this.writeOutput(combined);

    console.log("✓ Metrics extraction complete");

    return this.mergeCombinedMetrics(combined);
  }

  private loadAgentIds(): AgentIdsFile {
    try {
      const content = fs.readFileSync(this.agentIdsFile, "utf-8");
      const parsed = JSON.parse(content);

      // Validate structure
      if (!parsed.testConfiguration) {
        throw new Error("Missing 'testConfiguration' field in agent_ids.json");
      }
      if (!Array.isArray(parsed.readOnlyTests)) {
        throw new Error("Missing 'readOnlyTests' array in agent_ids.json");
      }
      if (!Array.isArray(parsed.fullTests)) {
        throw new Error("Missing 'fullTests' array in agent_ids.json");
      }

      return parsed as AgentIdsFile;
    } catch (err) {
      const exampleFormat = {
        testConfiguration: {
          formats: ["json_compact", "csv"],
          variants: ["optional", "mandatory"],
          model: "haiku",
          thinking: "off",
          timestamp: "2026-01-27T23:40:00.000Z"
        },
        readOnlyTests: [
          {
            format: "json_compact",
            variant: "mandatory",
            recordCount: 60,
            agentId: "aa71437",
            timestamp: "2026-01-27T23:33:00.000Z"
          }
        ],
        fullTests: [
          {
            format: "json_compact",
            variant: "mandatory",
            recordCount: 60,
            agentId: "af47870",
            testRun: 1,
            timestamp: "2026-01-27T23:34:00.000Z"
          }
        ]
      };

      const errorMsg = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Failed to load agent IDs from ${this.agentIdsFile}:\n` +
        `Error: ${errorMsg}\n\n` +
        `Expected format:\n${JSON.stringify(exampleFormat, null, 2)}`
      );
    }
  }

  private findTranscriptFiles(agentIds: string[]): Map<string, string> {
    const found = new Map<string, string>();
    const notFound: string[] = [];

    // Check if projects directory exists
    if (!fs.existsSync(this.projectsDir)) {
      console.error(`Error: Projects directory not found: ${this.projectsDir}`);
      console.error(`Claude Code stores transcripts in: ~/.claude/projects/`);
      console.error(`Expand ~ to your home directory and verify the path exists.`);
    }

    for (const agentId of agentIds) {
      const filename = `agent-${agentId}.jsonl`;
      const match = this.findFileRecursive(this.projectsDir, filename);

      if (match) {
        found.set(agentId, match);
      } else {
        notFound.push(agentId);
        console.warn(`Warning: No transcript found for agent ID: ${agentId}`);
        console.warn(`  Expected file: agent-${agentId}.jsonl`);
        console.warn(`  Search directory: ${this.projectsDir}`);
      }
    }

    // If many transcripts are missing, provide additional guidance
    if (notFound.length > 0 && notFound.length === agentIds.length) {
      console.error(`\n⚠️  ERROR: No transcripts found for any agent IDs!`);
      console.error(`This usually means:`);
      console.error(`  1. The agent tasks have not completed yet`);
      console.error(`  2. The transcripts are stored in a different location than: ${this.projectsDir}`);
      console.error(`  3. The agent IDs are incorrect`);
      console.error(`\nAgent IDs searched: ${agentIds.join(", ")}`);
    }

    return found;
  }

  private findFileRecursive(dir: string, filename: string): string | null {
    if (!fs.existsSync(dir)) {
      return null;
    }

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isFile() && entry.name === filename) {
          return fullPath;
        }

        if (entry.isDirectory()) {
          const result = this.findFileRecursive(fullPath, filename);
          if (result) {
            return result;
          }
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }

    return null;
  }

  private extractReadMetrics(transcripts: Map<string, string>, agentIdEntries: ReadOnlyAgentIdEntry[]): ReadMetricsFile[] {
    const results: ReadMetricsFile[] = [];

    for (const entry of agentIdEntries) {
      const transcript = transcripts.get(entry.agentId);
      if (!transcript) {
        console.warn(`No transcript found for read-only agent: ${entry.agentId}`);
        continue;
      }

      const metricsFromTranscript = this.extractFileTokensFromTranscript(transcript, entry.agentId);

      for (const metric of metricsFromTranscript) {
        results.push({
          file: metric.file,
          path: metric.path,
          agentId: metric.agentId,
          format: entry.format,
          structure: metric.structure,
          variant: entry.variant,
          recordCount: entry.recordCount,
          readTokens: metric.tokens,
          readDurationMs: metric.time_ms || 0,
        });
      }
    }

    return results;
  }

  private extractFileTokensFromTranscript(jsonlPath: string, agentId: string): Array<{
    file: string;
    path: string;
    structure: string;
    tokens: number;
    time_ms: number | null;
    agentId: string;
  }> {
    const results: Array<{
      file: string;
      path: string;
      structure: string;
      tokens: number;
      time_ms: number | null;
      agentId: string;
    }> = [];

    try {
      const lines = fs.readFileSync(jsonlPath, "utf-8").split("\n");

      // Track Read tool uses with their file paths and timestamps
      const readToolUses: Map<string, { file_path: string; timestamp: string }> = new Map();

      // First pass: find all tool_use Read operations with file_path and timestamps
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        try {
          const data = JSON.parse(line);

          // Look for assistant messages with Read tool_use
          if (data.type === "assistant") {
            const msg = data.message || {};
            const content = msg.content || [];

            if (Array.isArray(content)) {
              for (const item of content) {
                if (item && item.type === "tool_use" && item.name === "Read") {
                  const file_path = item.input?.file_path || "";
                  if (file_path) {
                    const tool_use_id = item.id || "";
                    readToolUses.set(tool_use_id, {
                      file_path,
                      timestamp: data.timestamp || "",
                    });
                  }
                }
              }
            }
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }

      // Second pass: find tool_result entries and extract token metrics from following assistant message
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        try {
          const data = JSON.parse(line);

          // Look for user messages with tool_result
          if (data.type === "user") {
            const msg = data.message || {};
            const content = msg.content || [];

            if (Array.isArray(content)) {
              for (const item of content) {
                if (item && item.type === "tool_result") {
                  const tool_use_id = item.tool_use_id || "";

                  // Check if this tool_use_id is in our Read tool uses
                  if (readToolUses.has(tool_use_id)) {
                    const { file_path, timestamp: tool_use_timestamp } = readToolUses.get(tool_use_id)!;
                    const result_timestamp = data.timestamp || "";

                    // Look ahead to find the next assistant message with usage metrics
                    for (let j = i + 1; j < lines.length && j < i + 5; j++) {
                      try {
                        const next_line = lines[j];
                        if (!next_line.trim()) continue;

                        const next_data = JSON.parse(next_line);

                        // Find assistant message with usage
                        if (next_data.type === "assistant") {
                          const next_msg = next_data.message || {};

                          if (next_msg && next_msg.usage) {
                            const usage = next_msg.usage;
                            // Use cache_creation_input_tokens for read metrics
                            const cache_creation = usage.cache_creation_input_tokens || 0;
                            // Total tokens for this read operation (newly created input)
                            const total_tokens = cache_creation;

                            // Calculate time difference
                            let time_ms: number | null = null;
                            if (tool_use_timestamp && result_timestamp) {
                              try {
                                const tool_use_dt = new Date(tool_use_timestamp);
                                const result_dt = new Date(result_timestamp);
                                time_ms = result_dt.getTime() - tool_use_dt.getTime();
                              } catch (e) {
                                // Skip time calculation if parsing fails
                              }
                            }

                            const file_name = path.basename(file_path);

                            // Extract structure (flat or nested) from filename
                            // Pattern: *_flat_records.json or *_nested_records.json
                            let structure = "unknown";
                            if (file_name.includes("_flat_")) {
                              structure = "flat";
                            } else if (file_name.includes("_nested_")) {
                              structure = "nested";
                            }

                            results.push({
                              file: file_name,
                              path: file_path,
                              structure,
                              tokens: total_tokens,
                              time_ms,
                              agentId,
                            });
                          }
                          break; // Stop looking after finding assistant message
                        }
                      } catch (e) {
                        // Skip invalid lines
                      }
                    }
                  }
                }
              }
            }
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }
    } catch (err) {
      console.warn(`Error reading transcript ${jsonlPath}: ${err}`);
    }

    return results;
  }

  private extractReasoningMetrics(transcripts: Map<string, string>, agentIdEntries: FullTestAgentIdEntry[]): Map<string, ReasoningMetricsFile[]> {
    const resultsMap = new Map<string, ReasoningMetricsFile[]>();

    for (const entry of agentIdEntries) {
      const transcript = transcripts.get(entry.agentId);
      if (!transcript) {
        console.warn(`No transcript found for full-test agent: ${entry.agentId}`);
        continue;
      }

      const metrics = this.extractFullTestMetrics(transcript);

      if (metrics) {
        const key = `${entry.format}_${entry.structure}_${entry.variant}_${entry.recordCount}`;

        if (!resultsMap.has(key)) {
          resultsMap.set(key, []);
        }

        resultsMap.get(key)!.push({
          format: entry.format,
          structure: entry.structure,
          variant: entry.variant,
          recordCount: entry.recordCount,
          testRuns: 0, // Will be set during aggregation
          durationMs: metrics.duration_ms || 0,
          durationMsMin: metrics.duration_ms || 0,
          durationMsMax: metrics.duration_ms || 0,
          outputTokens: metrics.output_tokens,
          outputTokensMin: metrics.output_tokens,
          outputTokensMax: metrics.output_tokens,
        });
      }
    }

    return resultsMap;
  }

  private extractFullTestMetrics(jsonlPath: string): {
    duration_ms: number | null;
    output_tokens: number;
  } | null {
    try {
      const lines = fs.readFileSync(jsonlPath, "utf-8").split("\n");

      // Find the first Write tool_use to know when to stop tracking
      let first_write_timestamp: string | null = null;

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          const msg = data.message || {};

          if (msg && msg.content) {
            const content = msg.content;
            if (Array.isArray(content)) {
              for (const item of content) {
                if (item && item.type === "tool_use" && item.name === "Write") {                  
                  first_write_timestamp = data.timestamp;
                  break;
                }
              }
            }
          }

          if (first_write_timestamp) break;
        } catch (e) {
          // Skip invalid JSON lines
        }
      }

      // Second pass: accumulate metrics only until first Write tool call
      let first_timestamp: string | null = null;
      let last_timestamp: string | null = null;
      let total_output_tokens = 0;
      let message_count = 0;

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const data = JSON.parse(line);
          const timestamp = data.timestamp;

          // Stop processing once we hit the first Write tool call
          if (first_write_timestamp && timestamp && timestamp >= first_write_timestamp) {
            last_timestamp = timestamp;
            break;
          }

          if (timestamp) {
            if (!first_timestamp) {
              first_timestamp = timestamp;
            }
            last_timestamp = timestamp;
          }

          // Extract usage information from assistant messages (before Write)
          if (data.type === "assistant") {
            const msg = data.message || {};
            if (msg && msg.usage) {
              const output = msg.usage.output_tokens || 0;

              if (output > 0) {
                total_output_tokens += output;
                message_count++;
              }
            }
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }

      // Calculate total duration
      let duration_ms: number | null = null;
      if (first_timestamp && last_timestamp) {
        try {
          const start_dt = new Date(first_timestamp);
          const end_dt = new Date(last_timestamp);
          duration_ms = end_dt.getTime() - start_dt.getTime();
        } catch (e) {
          // Skip time calculation if parsing fails
        }
      }

      if (first_timestamp && message_count > 0) {
        return {
          duration_ms,
          output_tokens: total_output_tokens,
        };
      }
    } catch (err) {
      console.warn(`Error reading transcript ${jsonlPath}: ${err}`);
    }

    return null;
  }

  private combineMetrics(readMetrics: ReadMetricsFile[], reasoningMetricsMap: Map<string, ReasoningMetricsFile[]>): CombinedMetrics {
    // Aggregate reasoning metrics by grouping test runs
    const reasoningFiles: ReasoningMetricsFile[] = [];

    for (const [_, metrics] of reasoningMetricsMap) {
      const metricsFilesCount = metrics.length;

      if (metricsFilesCount > 0) {
        const avg_duration = metrics.reduce((sum, m) => sum + m.durationMs, 0) / metricsFilesCount;
        const avg_output = metrics.reduce((sum, m) => sum + m.outputTokens, 0) / metricsFilesCount;
        const firstMetric = metrics[0];

        reasoningFiles.push({
          format: firstMetric.format,
          structure: firstMetric.structure,
          variant: firstMetric.variant,
          recordCount: firstMetric.recordCount,
          testRuns: metricsFilesCount,
          durationMs: parseFloat(avg_duration.toFixed(3)),
          durationMsMin: Math.min(...metrics.map(x=>x.durationMs)),
          durationMsMax: Math.max(...metrics.map(x=>x.durationMs)),
          outputTokens: parseFloat(avg_output.toFixed(3)),
          outputTokensMin: Math.min(...metrics.map(x=>x.outputTokens)),
          outputTokensMax: Math.max(...metrics.map(x=>x.outputTokens)),
        });
      }
    }

    // Calculate summaries
    const total_read_tokens = readMetrics.reduce((sum, m) => sum + m.readTokens, 0);
    const total_read_duration = readMetrics.reduce((sum, m) => sum + m.readDurationMs, 0);

    const total_duration = reasoningFiles.reduce((sum, m) => sum + m.durationMs, 0);
    const total_output = reasoningFiles.reduce((sum, m) => sum + m.outputTokens, 0);
    
    const reasoningFilesCount = reasoningFiles.length;
    const readMetricsFilesCount = readMetrics.length;

    return {
      read: {
        files: readMetrics,
        summary: {
          totalFiles: readMetricsFilesCount,
          totalReadTokens: total_read_tokens,
          totalReadDurationMs: parseFloat(total_read_duration.toFixed(3)),
          averageReadTokens: readMetricsFilesCount > 0 ? parseFloat((total_read_tokens / readMetricsFilesCount).toFixed(3)) : 0,
          averageDurationMs: readMetricsFilesCount > 0 ? parseFloat((total_read_duration / readMetricsFilesCount).toFixed(3)) : 0,
        },
      },
      reasoning: {
        files: reasoningFiles,
        summary: {
          totalTestCases: reasoningFilesCount,
          totalDurationMs: parseFloat(total_duration.toFixed(3)),
          totalOutputTokens: parseFloat(total_output.toFixed(3)),
          averageDurationMs: reasoningFilesCount > 0 ? parseFloat((total_duration / reasoningFilesCount).toFixed(3)) : 0,
          averageOutputTokens: reasoningFilesCount > 0 ? parseFloat((total_output / reasoningFilesCount).toFixed(3)) : 0,
        },
      },
    };
  }

  private writeOutput(metrics: CombinedMetrics): void {
    const dir = path.dirname(this.outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.outputFile, JSON.stringify(metrics, null, 4));
  }

  private mergeCombinedMetrics(combinedMetrics: CombinedMetrics): UserMetrics[] {
    const merged: UserMetrics[] = [];

    // Group read metrics by format+structure+variant+recordCount
    const readMap = new Map<string, ReadMetricsFile>();
    for (const read of combinedMetrics.read.files) {
      const key = `${read.format}_${read.structure}_${read.variant}_${read.recordCount}`;
      readMap.set(key, read);
    }

    // Merge with reasoning metrics
    for (const reasoning of combinedMetrics.reasoning.files) {
      const key = `${reasoning.format}_${reasoning.structure}_${reasoning.variant}_${reasoning.recordCount}`;
      const readData = readMap.get(key);

      if (!readData) {
        console.error(`\n❌ ERROR: Mismatch between read and reasoning metrics`);
        console.error(`\nLooking for: ${key}`);
        console.error(`\nAvailable read test cases (${combinedMetrics.read.files.length}):`);
        if (combinedMetrics.read.files.length === 0) {
          console.error(`  NONE - No read metrics were extracted!`);
          console.error(`  This means: Read-only test transcripts were not parsed correctly`);
          console.error(`  Check that agent IDs are correct and transcripts exist`);
        } else {
          combinedMetrics.read.files.forEach(r => {
            console.error(`  - ${r.format}_${r.structure}_${r.variant}_${r.recordCount}: ${r.readTokens} tokens`);
          });
        }
        console.error(`\nAvailable reasoning output test cases (${combinedMetrics.reasoning.files.length}):`);
        combinedMetrics.reasoning.files.forEach(r => {
          console.error(`  - ${r.format}_${r.structure}_${r.variant}_${r.recordCount}: ${r.outputTokens} tokens`);
        });
        throw new Error(`No read data found for ${key}`);
      }

      merged.push({
        testCase: `${reasoning.format}_${reasoning.structure}_${reasoning.recordCount}_${reasoning.variant}`,
        format: reasoning.format,
        structure: reasoning.structure,
        variant: reasoning.variant,
        recordCount: reasoning.recordCount,
        hasOptionalData: reasoning.variant !== "mandatory",
        readDurationInMilliseconds: readData.readDurationMs,
        readTokens: readData.readTokens,
        reasoningDurationInMilliseconds: reasoning.durationMs,
        reasoningDurationDriftPercMax: this.calcDriftPerc(reasoning.durationMs, reasoning.durationMsMax),
        reasoningDurationDriftPercMin: this.calcDriftPerc(reasoning.durationMs, reasoning.durationMsMin),
        outputTokens: reasoning.outputTokens,
        outputTokensDriftPercMin: this.calcDriftPerc(reasoning.outputTokens, reasoning.outputTokensMin),
        outputTokensDriftPercMax: this.calcDriftPerc(reasoning.outputTokens, reasoning.outputTokensMax),
      });
    }

    return merged;
  }  

  private calcDriftPerc(avg: number, val: number): number{
    return ((val - avg) / avg) * 100;
  }
}

export default MetricsExtraction;
