"use strict";
/**
 * JSON format converter
 * Converts base dataset to minified JSON
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToMinifiedJson = exports.convertToPrettyJson = void 0;
function convertToPrettyJson(data) {
    return JSON.stringify(data.records, null, 2);
}
exports.convertToPrettyJson = convertToPrettyJson;
function convertToMinifiedJson(data) {
    return JSON.stringify(data.records);
}
exports.convertToMinifiedJson = convertToMinifiedJson;
