"use strict";
/**
 * Format converter orchestrator
 * Routes to appropriate format converter
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToFormat = void 0;
const csv_1 = require("./csv");
const json_1 = require("./json");
const xml_1 = require("./xml");
const yaml_1 = require("./yaml");
const toon_1 = require("@toon-format/toon");
function convertToFormat(data, format) {
    switch (format) {
        case "csv":
            return (0, csv_1.convertToCsv)(data);
        case "json_pretty":
            return (0, json_1.convertToPrettyJson)(data);
        case "json_compact":
            return (0, json_1.convertToMinifiedJson)(data);
        case "xml_pretty":
            return (0, xml_1.convertToXmlPretty)(data);
        case "xml_compact":
            return (0, xml_1.convertToXmlCompact)(data);
        case "yaml":
            return (0, yaml_1.convertToYaml)(data);
        case "toon_keyfold":
            return (0, toon_1.encode)(data.records, { keyFolding: 'safe' });
        case "toon_default":
            return (0, toon_1.encode)(data.records, { keyFolding: 'off' });
        default:
            const _exhaustive = format;
            return _exhaustive;
    }
}
exports.convertToFormat = convertToFormat;
