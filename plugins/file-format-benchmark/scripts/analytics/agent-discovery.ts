import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { homedir } from 'os';

import { AgentIdEntry, AgentIdsFile, FullTestAgentIdEntry, ReadOnlyAgentIdEntry } from '../types';

/**
 * Discover and classify subagents from a session directory
 * - Read-only agents: have only 1 Read tool invocation
 * - Full test agents: have Write tool invocations (and multiple Reads)
 */
export function discoverAgents(sessionId: string): AgentIdsFile {
  // Step 1: Expand glob and get actual subagent directory
  const actualDir = getSubagentDirectory(sessionId);
  if (!actualDir) {
    throw new Error(`Could not find subagent directory for session: ${sessionId}`);
  }

  // Step 2: List all agent JSONL files
  const agentIds = listAgentIds(actualDir);
  console.log(`Found ${agentIds.length} agents in session ${sessionId}`);

  // Step 3: Grep data file paths → map agentId to metadata
  const dataFileMap = grepDataFilePaths(actualDir);
  console.log(`Found metadata for ${Object.keys(dataFileMap).length} agents from data files`);

  // Step 4: Grep Write operations → identify full test agents
  const writeAgentIds = grepWriteOperations(actualDir);
  console.log(`Found ${writeAgentIds.length} agents with Write operations (full tests)`);

  // Step 5: Classify and split
  const readonly = agentIds
    .filter(id => !writeAgentIds.includes(id))
    .map(id => {
      const metadata = dataFileMap[id];
      if (!metadata) {
        console.warn(`Warning: No metadata found for readonly agent ${id}`);
        return null;
      }
      // metadata already contains agentId from grepDataFilePaths
      return metadata;
    })
    .filter((item): item is ReadOnlyAgentIdEntry => item !== null);

  // Step 6: Group full tests by variant and number them
  const full = groupAndNumberFullTests(
    agentIds.filter(id => writeAgentIds.includes(id)),
    dataFileMap
  );

  return { 
    testConfiguration: {
      formats: [...new Set(readonly.map(x => x.format))],
      variants: [...new Set(readonly.map(x => x.variant))],
      model: "Entered by user",
      thinking: "Entered by user",
      structure: "Entered by user",
      timestamp: new Date().toISOString(),
    },
    readOnlyTests: readonly, 
    fullTests: full 
  };
}

/**
 * Find and resolve the actual subagent directory path
 */
function getSubagentDirectory(sessionId: string): string | null {
  try {
    const projectsDir = path.join(homedir(), '.claude', 'projects');
    if (!fs.existsSync(projectsDir)) {
      return null;
    }

    // Find all project dirs matching pattern
    const projects = fs.readdirSync(projectsDir);
    for (const project of projects) {
      const sessionPath = path.join(projectsDir, project, sessionId, 'subagents');
      if (fs.existsSync(sessionPath)) {
        return sessionPath;
      }
    }
  } catch (error) {
    console.error(`Error finding subagent directory: ${error}`);
  }
  return null;
}

/**
 * List all agent IDs from JSONL files in subagents directory
 * Filenames: agent-{id}.jsonl
 */
function listAgentIds(subagentDir: string): string[] {
  try {
    const files = fs.readdirSync(subagentDir);
    const agentIds = files
      .filter(f => f.startsWith('agent-') && f.endsWith('.jsonl'))
      .map(f => f.replace(/^agent-/, '').replace(/\.jsonl$/, ''));
    return agentIds;
  } catch (error) {
    console.error(`Error listing agent IDs: ${error}`);
    return [];
  }
}

/**
 * Parse metadata from data file path
 * Pattern: {format}_with_{variant}_{recordCount}_{structure}_records
 * Example: json_compact_with_mandatory_80_flat_records.json
 */
function parseDataFileName(filePath: string): Partial<AgentIdEntry> | null {
  // Match pattern: format_with_variant_recordCount_structure_records
  const match = filePath.match(/([a-z0-9_]+)_with_(\w+)_(\d+)_(\w+)_records/i);
  if (!match) {
    return null;
  }

  return {
    format: match[1],
    variant: match[2],
    recordCount: parseInt(match[3], 10),
    structure: match[4]
  };
}

/**
 * Grep for data file Read operations across all agents
 * Builds map: agentId → {format, structure, variant, recordCount}
 */
function grepDataFilePaths(subagentDir: string): Record<string, AgentIdEntry> {
  const map: Record<string, AgentIdEntry> = {};

  try {
    // Grep for "name":"Read" in all JSONL files
    const grepCmd = `grep -h '"name":"Read"' "${subagentDir}"/*.jsonl`;
    const output = execSync(grepCmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });

    // Parse each line as JSON to extract file_path
    const lines = output.split('\n').filter(l => l.trim());
    for (const line of lines) {
      try {
        // Extract JSON object from line (may be nested in line)
        const match = line.match(/"name":"Read"[^}]*"file_path":"([^"]+)"/);
        if (!match) continue;

        const filePath = match[1];
        const metadata = parseDataFileName(filePath);
        if (!metadata || !metadata.format) continue;

        // Extract agentId from parent line - we need to parse differently
        // For now, we'll scan all lines and build map per agent below
      } catch (e) {
        // Skip malformed lines
      }
    }

    // Better approach: read each JSONL file and extract agent ID + Read operations
    const agentIds = listAgentIds(subagentDir);
    for (const agentId of agentIds) {
      const agentFile = path.join(subagentDir, `agent-${agentId}.jsonl`);
      const content = fs.readFileSync(agentFile, 'utf-8');

      // Find first Read tool with file_path
      const readMatch = content.match(/"name":"Read"[^}]*"file_path":"([^"]+)"/);
      if (!readMatch) continue;

      const filePath = readMatch[1];
      const metadata = parseDataFileName(filePath);
      if (metadata && metadata.format) {
        map[agentId] = {
          agentId,
          format: metadata.format as string,
          structure: metadata.structure as string,
          variant: metadata.variant as string,
          recordCount: metadata.recordCount as number,
          timestamp: new Date().toISOString()
        };
      }
    }
  } catch (error) {
    console.error(`Error grepping data file paths: ${error}`);
  }

  return map;
}

/**
 * Grep for Write tool operations to identify full test agents
 */
function grepWriteOperations(subagentDir: string): string[] {
  const writeAgentIds = new Set<string>();

  try {
    // Get all agent IDs that contain "name":"Write"
    const agentIds = listAgentIds(subagentDir);
    for (const agentId of agentIds) {
      const agentFile = path.join(subagentDir, `agent-${agentId}.jsonl`);
      const content = fs.readFileSync(agentFile, 'utf-8');

      if (content.includes('"name":"Write"')) {
        writeAgentIds.add(agentId);
      }
    }
  } catch (error) {
    console.error(`Error grepping Write operations: ${error}`);
  }

  return Array.from(writeAgentIds);
}

/**
 * Group full test agents by (format, structure, variant) and number them 1, 2, 3
 */
function groupAndNumberFullTests(
  fullAgentIds: string[],
  dataFileMap: Record<string, AgentIdEntry>
): FullTestAgentIdEntry[] {
  // Group by (format, structure, variant)
  const groups: Record<string, string[]> = {};

  for (const agentId of fullAgentIds) {
    const metadata = dataFileMap[agentId];
    if (!metadata) {
      console.warn(`Warning: No metadata found for full test agent ${agentId}`);
      continue;
    }

    const key = `${metadata.format}|${metadata.structure}|${metadata.variant}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(agentId);
  }

  // Flatten and number
  const result: FullTestAgentIdEntry[] = [];
  for (const [key, agentIds] of Object.entries(groups)) {
    const [format, structure, variant] = key.split('|');
    const metadata = dataFileMap[agentIds[0]];

    // Sort for consistent ordering
    agentIds.sort();

    agentIds.forEach((agentId, index) => {
      result.push({
        agentId,
        format,
        structure,
        variant,
        recordCount: metadata.recordCount,
        testRun: index + 1,
        timestamp: new Date().toISOString()
      });
    });
  }

  return result;
}