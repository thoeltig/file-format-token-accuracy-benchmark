/**
 * CSV format converter
 * Converts base dataset to CSV with proper handling of optional fields
 */

import { FlatArrayDataSet, NestedDataSet } from "../types";

export function convertToCsv(data: FlatArrayDataSet | NestedDataSet): string {
  // CSV only supports flat data
  if ("nestingLevels" in data.metadata) {
    return "";
  }

  if (data.records.length === 0) {
    return "";
  }

  // Collect all possible field names from all records
  const allFields = new Set<string>();
  data.records.forEach((record) => {
    Object.keys(record).forEach((key) => allFields.add(key));
  });

  // Sort fields for consistency
  const headers = Array.from(allFields);

  // Create CSV header
  const csvLines: string[] = [headers.map(escapeCsvField).join(",")];

  // Create CSV rows
  for (const record of data.records) {
    const row = headers.map((field) => {
      const value = record[field];
      if (value === null || value === undefined) {
        return ""; // Empty field for optional/missing values
      }
      return escapeCsvField(String(value));
    });
    csvLines.push(row.join(","));
  }

  return csvLines.join("\n");
}

/**
 * Escape CSV fields (quote if contains comma, newline, or quotes)
 */
function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes("\n") || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
