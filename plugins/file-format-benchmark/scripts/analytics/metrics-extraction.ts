/**
 * Metrics Extraction Module
 * Extracts read and output tokens from agent transcripts
 * Combines both into a single metrics.json file
 */

import * as fs from "fs";
import * as path from "path";
import { AgentIdsFile, FullTestAgentIdEntry, ReadOnlyAgentIdEntry, UserMetrics } from "../types";
import { calcDriftPerc, roundTo3Digits } from "../shared";

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
  durationBeforeWriteMs: number;
  durationBeforeWriteMsMin: number;
  durationBeforeWriteMsMax: number;
  durationWriteMs: number;
  durationWriteMsMin: number;
  durationWriteMsMax: number;
  durationTotalMs: number;
  durationTotalMsMin: number;
  durationTotalMsMax: number;
  // Output tokens contain the tokens generated for the output of the LLM and include the reasoning tokens
  outputTokensBeforeWrite: number;
  outputTokensBeforeWriteMin: number;
  outputTokensBeforeWriteMax: number;
  outputTokensWrite: number;
  outputTokensWriteMin: number;
  outputTokensWriteMax: number;
  outputTokensTotal: number;
  outputTokensTotalMin: number;
  outputTokensTotalMax: number;
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
      totalBeforeWriteDuration: number;
      totalWriteDurationMs: number;
      totalDurationMs: number;
      averageBeforeWriteDurationMs: number;
      averageWriteDurationMs: number;
      averageDurationMs: number;
      totalBeforeWriteOutputTokens: number;
      totalWriteOutputTokens: number;
      totalOutputTokens: number;
      averageBeforeWriteOutputTokens: number;
      averageWriteOutputTokens: number;
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

      const metric = this.extractFileTokensFromTranscript(transcript, entry.agentId);

      if(metric) {
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

  private extractFileTokensFromTranscript(jsonlPath: string, agentId: string): {
    file: string;
    path: string;
    structure: string;
    tokens: number;
    time_ms: number | null;
    agentId: string;
  } | null {
    try {
      const lines = fs.readFileSync(jsonlPath, "utf-8").split("\n");

      // Track Read tool uses with their file paths and timestamps
      const readToolUses: Map<string, { file_path: string; tool_use_timestamp: string }> = new Map();
      const readToolResults: Map<string, { file_path: string; read_duration: number | null }> = new Map();

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

            if(data.parentUuid && readToolResults.has(data.parentUuid)) {
              const entry = readToolResults.get(data.parentUuid)!;

              if (msg.usage) {
                // Use cache_creation_input_tokens for read metrics
                // Total tokens for this read operation (newly created input)
                const cache_creation = msg.usage.cache_creation_input_tokens || 0;
                if(cache_creation === 0){                  
                  console.warn(`Warning reading transcript ${jsonlPath}: Skipped extraction because zero tokens were found which points to a faulty or aborted run`);
                  return null;
                }

                // Calculate time difference
                const file_name = path.basename(entry.file_path);

                // Extract structure (flat or nested) from filename
                // Pattern: *_flat_records.json or *_nested_records.json
                let structure = "unknown";
                if (file_name.includes("_flat_")) {
                  structure = "flat";
                } else if (file_name.includes("_nested_")) {
                  structure = "nested";
                }
                
                return {
                  file: file_name,
                  path: entry.file_path,
                  structure,
                  tokens: cache_creation,
                  time_ms: entry.read_duration,
                  agentId,
                };
              }
            }
            else if (Array.isArray(content)) {
              for (const item of content) {
                if (item && item.type === "tool_use" && item.name === "Read") {
                  const file_path = item.input?.file_path || "";
                  if (file_path) {
                    const tool_use_id = item.id || "";
                    readToolUses.set(tool_use_id, {
                      file_path,
                      tool_use_timestamp: data.timestamp || "",
                    });
                  }
                }
              }                
            }
          }
          else if(data.type === "user" && data.uuid) {
            const msg = data.message || {};
            const content = msg.content || [];

            if (Array.isArray(content)) {
              for (const item of content) {
                // Check if this tool_use_id is in our read tool uses and store t
                if (item && item.type === "tool_result" && item.tool_use_id && readToolUses.has(item.tool_use_id)) {
                  const entry = readToolUses.get(item.tool_use_id)!;
                  const read_duration = this.getDuration(entry.tool_use_timestamp, data.timestamp);
                  readToolResults.set(data.uuid, {
                    file_path: entry.file_path,
                    read_duration: read_duration
                  });
                }
              }
            }          
          }
        } catch (e) {          
          console.error(`Error reading transcript ${jsonlPath}: ${e}`);
        }
      }
    } catch (err) {
      console.warn(`Error reading transcript ${jsonlPath}: ${err}`);
    }

    console.warn(`Error reading transcript ${jsonlPath}: No return`);
    return null;
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
          durationBeforeWriteMs: metrics.duration_before_write_ms,
          durationBeforeWriteMsMin: metrics.duration_before_write_ms,
          durationBeforeWriteMsMax: metrics.duration_before_write_ms,
          durationWriteMs: metrics.duration_write_ms,
          durationWriteMsMin: metrics.duration_write_ms,
          durationWriteMsMax: metrics.duration_write_ms,
          durationTotalMs: metrics.duration_total_ms,
          durationTotalMsMin: metrics.duration_total_ms,
          durationTotalMsMax: metrics.duration_total_ms,
          outputTokensBeforeWrite: metrics.output_tokens_before_write,
          outputTokensBeforeWriteMin: metrics.output_tokens_before_write,
          outputTokensBeforeWriteMax: metrics.output_tokens_before_write,
          outputTokensWrite: metrics.output_tokens_write,
          outputTokensWriteMin: metrics.output_tokens_write,
          outputTokensWriteMax: metrics.output_tokens_write,
          outputTokensTotal: metrics.output_tokens_total,
          outputTokensTotalMin: metrics.output_tokens_total,
          outputTokensTotalMax: metrics.output_tokens_total,
        });
      }
    }

    return resultsMap;
  }

  private extractFullTestMetrics(jsonlPath: string): {
    duration_before_write_ms: number;
    duration_write_ms: number;
    duration_total_ms: number;
    output_tokens_before_write: number;
    output_tokens_write: number;
    output_tokens_total: number;
  } | null {
    try {
      const lines = fs.readFileSync(jsonlPath, "utf-8").split("\n");

      // Accumulate output tokens only until first Write tool call
      let first_timestamp: string | null = null;
      let last_before_write_timestamp: string | null = null;
      let last_timestamp: string | null = null;
      let output_tokens_before_write = 0;
      let output_tokens_write = 0;
      let message_count = 0;

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const data = JSON.parse(line);

          if (data.timestamp) {
            if (!first_timestamp) {
              // Get the start timestamp of the benchmark run
              first_timestamp = data.timestamp;
            }
          }
          
          // Extract output tokens from all assistant messages until write tool use
          if (data.type === "assistant") {
            const msg = data.message || {};
            if (msg && msg.usage) {
              const outputTokens = msg.usage.output_tokens || 0;

              if (outputTokens > 0) {
                // Add all output tokens in assistent messages that the transcript contains; these are a mix of output generation and reasoning to hide the exact reasoning tokens count
                output_tokens_before_write += outputTokens;
                message_count++;
              }

              const content = msg.content;
              if (Array.isArray(content)) {
                for (const item of content) {
                  if (item && item.type === "tool_use" && item.name === "Write") {      
                    // If the file is written for the first time the benchmark is finished; substract the output tokens from the before write sum and store the write output separate for later calculations
                    last_timestamp = data.timestamp;
                    output_tokens_write = outputTokens;
                    output_tokens_before_write -= outputTokens;
                    break;
                  }
                }
              }

              if(last_timestamp) {
                // If write was extracted break the line loop
                break;
              }

              // Get get the timestamp of the last assistant message before write tool use
              last_before_write_timestamp = data.timestamp;
            }
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }

      // Calculate durations
      const duration_before_write_ms = this.getDuration(first_timestamp, last_before_write_timestamp);
      const duration_write_ms = this.getDuration(last_before_write_timestamp, last_timestamp);
      const duration_ms = this.getDuration(first_timestamp, last_timestamp);

      if (first_timestamp && message_count > 0) {
        return {
          duration_before_write_ms: duration_before_write_ms || 0,
          duration_write_ms: duration_write_ms || 0,
          duration_total_ms: duration_ms || 0,
          output_tokens_before_write: output_tokens_before_write,
          output_tokens_write: output_tokens_write,
          output_tokens_total: output_tokens_before_write + output_tokens_write,
        };
      }
    } catch (err) {
      console.warn(`Error reading transcript ${jsonlPath}: ${err}`);
    }

    console.warn(`Error reading transcript ${jsonlPath}: No return`);
    return null;
  }

  private getDuration(first_timestamp: string | null, second_timestamp: string | null): number | null{
    if (first_timestamp && second_timestamp) {
      try {
        const start_dt = new Date(first_timestamp);
        const end_dt = new Date(second_timestamp);
        return end_dt.getTime() - start_dt.getTime();
      } catch (e) {
        // Skip time calculation if parsing fails
      }
    }

    return null;
  }

  private combineMetrics(readMetrics: ReadMetricsFile[], reasoningMetricsMap: Map<string, ReasoningMetricsFile[]>): CombinedMetrics {
    // Aggregate reasoning metrics by grouping test runs
    const reasoningFiles: ReasoningMetricsFile[] = [];

    for (const [_, metrics] of reasoningMetricsMap) {
      const metricsFilesCount = metrics.length;

      if (metricsFilesCount > 0) {
        const firstMetric = metrics[0];

        reasoningFiles.push({
          format: firstMetric.format,
          structure: firstMetric.structure,
          variant: firstMetric.variant,
          recordCount: firstMetric.recordCount,
          testRuns: metricsFilesCount,
          durationBeforeWriteMs: roundTo3Digits(metrics.reduce((sum, m) => sum + m.durationBeforeWriteMs, 0) / metricsFilesCount),
          durationBeforeWriteMsMin: Math.min(...metrics.map(x=>x.durationBeforeWriteMs)),
          durationBeforeWriteMsMax: Math.max(...metrics.map(x=>x.durationBeforeWriteMs)),
          durationWriteMs: roundTo3Digits(metrics.reduce((sum, m) => sum + m.durationWriteMs, 0) / metricsFilesCount),
          durationWriteMsMin: Math.min(...metrics.map(x=>x.durationWriteMs)),
          durationWriteMsMax: Math.max(...metrics.map(x=>x.durationWriteMs)),
          durationTotalMs: roundTo3Digits(metrics.reduce((sum, m) => sum + m.durationTotalMs, 0) / metricsFilesCount),
          durationTotalMsMin: Math.min(...metrics.map(x=>x.durationTotalMs)),
          durationTotalMsMax: Math.max(...metrics.map(x=>x.durationTotalMs)),
          outputTokensBeforeWrite: roundTo3Digits(metrics.reduce((sum, m) => sum + m.outputTokensBeforeWrite, 0) / metricsFilesCount),
          outputTokensBeforeWriteMin: Math.min(...metrics.map(x=>x.outputTokensBeforeWrite)),
          outputTokensBeforeWriteMax: Math.max(...metrics.map(x=>x.outputTokensBeforeWrite)),
          outputTokensWrite: roundTo3Digits(metrics.reduce((sum, m) => sum + m.outputTokensWrite, 0) / metricsFilesCount),
          outputTokensWriteMin: Math.min(...metrics.map(x=>x.outputTokensWrite)),
          outputTokensWriteMax: Math.max(...metrics.map(x=>x.outputTokensWrite)),
          outputTokensTotal: roundTo3Digits(metrics.reduce((sum, m) => sum + m.outputTokensTotal, 0) / metricsFilesCount),
          outputTokensTotalMin: Math.min(...metrics.map(x=>x.outputTokensTotal)),
          outputTokensTotalMax: Math.max(...metrics.map(x=>x.outputTokensTotal)),
        });
      }
    }

    // Calculate summaries
    const total_read_tokens = readMetrics.reduce((sum, m) => sum + m.readTokens, 0);
    const total_read_duration = readMetrics.reduce((sum, m) => sum + m.readDurationMs, 0);

    const total_duration = reasoningFiles.reduce((sum, m) => sum + m.durationTotalMs, 0);
    const before_write_duration = reasoningFiles.reduce((sum, m) => sum + m.durationBeforeWriteMs, 0);
    const write_duration = reasoningFiles.reduce((sum, m) => sum + m.durationWriteMs, 0);
    const total_output = reasoningFiles.reduce((sum, m) => sum + m.outputTokensTotal, 0);
    const before_write_output = reasoningFiles.reduce((sum, m) => sum + m.outputTokensBeforeWrite, 0);
    const write_output = reasoningFiles.reduce((sum, m) => sum + m.outputTokensWrite, 0);
    
    const reasoningFilesCount = reasoningFiles.length;
    const readMetricsFilesCount = readMetrics.length;

    return {
      read: {
        files: readMetrics,
        summary: {
          totalFiles: readMetricsFilesCount,
          totalReadTokens: total_read_tokens,
          totalReadDurationMs: roundTo3Digits(total_read_duration),
          averageReadTokens: readMetricsFilesCount > 0 ? roundTo3Digits(total_read_tokens / readMetricsFilesCount) : 0,
          averageDurationMs: readMetricsFilesCount > 0 ? roundTo3Digits(total_read_duration / readMetricsFilesCount) : 0,
        },
      },
      reasoning: {
        files: reasoningFiles,
        summary: {
          totalTestCases: reasoningFilesCount,
          totalBeforeWriteDuration: roundTo3Digits(before_write_duration),
          totalWriteDurationMs: roundTo3Digits(write_duration),
          totalDurationMs: roundTo3Digits(total_duration),
          averageBeforeWriteDurationMs: reasoningFilesCount > 0 ? roundTo3Digits(before_write_duration / reasoningFilesCount) : 0,
          averageWriteDurationMs: reasoningFilesCount > 0 ? roundTo3Digits(write_duration / reasoningFilesCount) : 0,
          averageDurationMs: reasoningFilesCount > 0 ? roundTo3Digits(total_duration / reasoningFilesCount) : 0,
          totalBeforeWriteOutputTokens: roundTo3Digits(before_write_output),
          totalWriteOutputTokens: roundTo3Digits(write_output),
          totalOutputTokens: roundTo3Digits(total_output),
          averageBeforeWriteOutputTokens: reasoningFilesCount > 0 ? roundTo3Digits(before_write_output / reasoningFilesCount) : 0,
          averageWriteOutputTokens: reasoningFilesCount > 0 ? roundTo3Digits(write_output / reasoningFilesCount) : 0,
          averageOutputTokens: reasoningFilesCount > 0 ? roundTo3Digits(total_output / reasoningFilesCount) : 0,
        },
      },
    };
  }

  private writeOutput(metrics: CombinedMetrics): void {
    const dir = path.dirname(this.outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.outputFile, JSON.stringify(metrics, null, 2));
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
          console.error(`  - ${r.format}_${r.structure}_${r.variant}_${r.recordCount}: ${r.outputTokensTotal} tokens`);
        });
        throw new Error(`No read data found for ${key}`);
      }

      const totalTokens = readData.readTokens + reasoning.outputTokensTotal;

      merged.push({
        testCase: `${reasoning.format}_${reasoning.structure}_${reasoning.recordCount}_${reasoning.variant}`,
        format: reasoning.format,
        structure: reasoning.structure,
        variant: reasoning.variant,
        recordCount: reasoning.recordCount,
        hasOptionalData: reasoning.variant !== "mandatory",
        readDurationInMs: readData.readDurationMs,
        readTokens: readData.readTokens,
        outputDurationBeforeWriteInMs: reasoning.durationBeforeWriteMs,
        outputDurationBeforeWriteDriftPercMax: calcDriftPerc(reasoning.durationBeforeWriteMs, reasoning.durationBeforeWriteMsMax),
        outputDurationBeforeWriteDriftPercMin: calcDriftPerc(reasoning.durationBeforeWriteMs, reasoning.durationBeforeWriteMsMin),
        outputDurationWriteInMs: reasoning.durationWriteMs,
        outputDurationWriteDriftPercMax: calcDriftPerc(reasoning.durationWriteMs, reasoning.durationWriteMsMax),
        outputDurationWriteDriftPercMin: calcDriftPerc(reasoning.durationWriteMs, reasoning.durationWriteMsMin),
        outputDurationTotalInMs: reasoning.durationTotalMs,
        outputDurationTotalDriftPercMax: calcDriftPerc(reasoning.durationTotalMs, reasoning.durationTotalMsMax),
        outputDurationTotalDriftPercMin: calcDriftPerc(reasoning.durationTotalMs, reasoning.durationTotalMsMin),
        outputTokensBeforeWrite: reasoning.outputTokensBeforeWrite,
        outputTokensBeforeWriteDriftPercMax: calcDriftPerc(reasoning.outputTokensBeforeWrite, reasoning.outputTokensBeforeWriteMax),
        outputTokensBeforeWriteDriftPercMin: calcDriftPerc(reasoning.outputTokensBeforeWrite, reasoning.outputTokensBeforeWriteMin),
        outputTokensWrite: reasoning.outputTokensWrite,
        outputTokensWriteDriftPercMax: calcDriftPerc(reasoning.outputTokensWrite, reasoning.outputTokensWriteMax),
        outputTokensWriteDriftPercMin: calcDriftPerc(reasoning.outputTokensWrite, reasoning.outputTokensWriteMin),
        outputTokensTotal: reasoning.outputTokensTotal,
        outputTokensTotalDriftPercMax: calcDriftPerc(reasoning.outputTokensTotal, reasoning.outputTokensTotalMax),
        outputTokensTotalDriftPercMin: calcDriftPerc(reasoning.outputTokensTotal, reasoning.outputTokensTotalMin),
        totalTokens: totalTokens,
        totalTokensDriftPercMax: calcDriftPerc(totalTokens, readData.readTokens + reasoning.outputTokensTotalMax),
        totalTokensDriftPercMin: calcDriftPerc(totalTokens, readData.readTokens + reasoning.outputTokensTotalMin),
      });
    }

    return merged;
  }
}

export default MetricsExtraction;
