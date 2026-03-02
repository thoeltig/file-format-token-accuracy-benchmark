"use strict";
/**
 * XML format converter
 * Converts flat and nested datasets to XML format (pretty and compact)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToXmlCompact = exports.convertToXmlPretty = exports.convertToXml = void 0;
const FIRST_LINE = '<?xml version="1.0" encoding="utf-8"?>';
const PRODUCTS_TAG_OPEN = "<products>";
const PRODUCTS_TAG_CLOSE = "</products>";
const PRODUCT_TAG_OPEN = "<product>";
const PRODUCT_TAG_CLOSE = "</product>";
function convertToXml(data) {
    return convertToXmlPretty(data);
}
exports.convertToXml = convertToXml;
function convertToXmlPretty(data) {
    const lines = [FIRST_LINE];
    lines.push(PRODUCTS_TAG_OPEN);
    for (const record of data.records) {
        lines.push(recordToXmlPretty(record, 1));
    }
    lines.push(PRODUCTS_TAG_CLOSE);
    return lines.join("\n");
}
exports.convertToXmlPretty = convertToXmlPretty;
function convertToXmlCompact(data) {
    let xml = FIRST_LINE + PRODUCTS_TAG_OPEN;
    for (const record of data.records) {
        xml += recordToXmlCompact(record);
    }
    xml += PRODUCTS_TAG_CLOSE;
    return xml;
}
exports.convertToXmlCompact = convertToXmlCompact;
/**
 * Convert a record to pretty XML with proper indentation
 */
function recordToXmlPretty(record, indent) {
    const lines = [];
    const pad = createPad(indent);
    lines.push(pad + PRODUCT_TAG_OPEN);
    for (const [tag, value] of Object.entries(record)) {
        if (value === null || value === undefined) {
            lines.push(`${pad}  ${createEmptyTag(tag)}`);
        }
        else if (isObject(value)) {
            // Nested object
            lines.push(`${pad}  ${createOpenTag(tag)}`);
            lines.push(...objectToXmlPretty(value, indent + 2));
            lines.push(`${pad}  ${createCloseTag(tag)}`);
        }
        else {
            const escaped = escapeXml(String(value));
            lines.push(`${pad}  ${createValueTag(tag, escaped)}`);
        }
    }
    lines.push(pad + PRODUCT_TAG_CLOSE);
    return lines.join("\n");
}
/**
 * Convert a nested object to pretty XML
 */
function objectToXmlPretty(obj, indent) {
    const lines = [];
    const pad = createPad(indent);
    for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined) {
            lines.push(pad + createEmptyTag(key));
        }
        else if (isObject(value)) {
            // Deeply nested object
            lines.push(pad + createOpenTag(key));
            lines.push(...objectToXmlPretty(value, indent + 1));
            lines.push(pad + createCloseTag(key));
        }
        else {
            const escaped = escapeXml(String(value));
            lines.push(pad + createValueTag(key, escaped));
        }
    }
    return lines;
}
/**
 * Convert a record to compact XML (no whitespace)
 */
function recordToXmlCompact(record) {
    let xml = PRODUCT_TAG_OPEN;
    for (const [tag, value] of Object.entries(record)) {
        if (value === null || value === undefined) {
            xml += createEmptyTag(tag);
        }
        else if (isObject(value)) {
            xml += objectToXmlCompact(value, tag);
        }
        else {
            const escaped = escapeXml(String(value));
            xml += createValueTag(tag, escaped);
        }
    }
    xml += PRODUCT_TAG_CLOSE;
    return xml;
}
/**
 * Convert a nested object to compact XML (no whitespace)
 */
function objectToXmlCompact(obj, key) {
    let xml = createOpenTag(key);
    for (const [tag, value] of Object.entries(obj)) {
        if (value === null || value === undefined) {
            xml += createEmptyTag(tag);
        }
        else if (isObject(value)) {
            xml += objectToXmlCompact(value, tag);
        }
        else {
            const escaped = escapeXml(String(value));
            xml += createValueTag(tag, escaped);
        }
    }
    xml += createCloseTag(key);
    return xml;
}
function createOpenTag(tag) {
    return `<${tag}>`;
}
function createCloseTag(tag) {
    return `</${tag}>`;
}
function createEmptyTag(tag) {
    return `<${tag}/>`;
}
function createValueTag(tag, value) {
    return createOpenTag(tag) + value + createCloseTag(tag);
}
function createPad(indent) {
    return "  ".repeat(indent);
}
/**
 * Check if value is an object (not array, not null)
 */
function isObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
/**
 * Escape XML special characters
 */
function escapeXml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
