/**
 * Format converter orchestrator
 * Routes to appropriate format converter
 */

import { FlatArrayDataSet, Format, NestedDataSet } from "../types";
import { convertToCsv } from "./csv";
import { convertToPrettyJson, convertToMinifiedJson } from "./json";
import { convertToXmlPretty, convertToXmlCompact } from "./xml";
import { convertToYaml } from "./yaml";
import { encode } from "@toon-format/toon";

export function convertToFormat(data: FlatArrayDataSet | NestedDataSet, format: Format): string {
  switch (format) {
    case "csv":
      return convertToCsv(data);
    case "json_pretty":
      return convertToPrettyJson(data);
    case "json_compact":
      return convertToMinifiedJson(data);
    case "xml_pretty":
      return convertToXmlPretty(data);
    case "xml_compact":
      return convertToXmlCompact(data);
    case "yaml":
      return convertToYaml(data);
    case "toon_keyfold":
      return encode(data.records, { keyFolding: 'safe' });
    case "toon_default":
      return encode(data.records, { keyFolding: 'off' });
    default:
      const _exhaustive: never = format;
      return _exhaustive;
  }
}