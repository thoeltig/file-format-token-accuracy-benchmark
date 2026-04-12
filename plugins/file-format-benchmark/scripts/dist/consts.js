"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUESTIONS_WEIGHT_DISTRIBUTION = exports.QUESTIONS_DISTRIBUTION = exports.QUESTIONS_COUNT = exports.EFFICIENCY_SCORE_WEIGHT = exports.VARIANTS = exports.RECORD_COUNT = exports.FILE_METRICS = exports.FILE_ANALYTICS_RESULT = exports.FILE_METADATA = exports.FILE_AGENT_ID = exports.FORMATS = exports.DIRECTORIES = exports.DIRECTORY_RESULTS = exports.DIRECTORY_SUBAGENT_OUTPUT = exports.DIRECTORY_ANSWERS_TEMPLATE = exports.DIRECTORY_QUESTIONS = exports.DIRECTORY_ANSWERS_VALIDATION = exports.DIRECTORY_DATA = void 0;
exports.DIRECTORY_DATA = "data";
exports.DIRECTORY_ANSWERS_VALIDATION = "answers_validation";
exports.DIRECTORY_QUESTIONS = "questions";
exports.DIRECTORY_ANSWERS_TEMPLATE = "answers_template";
exports.DIRECTORY_SUBAGENT_OUTPUT = "subagent_outputs";
exports.DIRECTORY_RESULTS = "results";
exports.DIRECTORIES = [exports.DIRECTORY_DATA, exports.DIRECTORY_ANSWERS_VALIDATION, exports.DIRECTORY_QUESTIONS, exports.DIRECTORY_ANSWERS_TEMPLATE, exports.DIRECTORY_SUBAGENT_OUTPUT, exports.DIRECTORY_RESULTS];
exports.FORMATS = ["csv", "json_pretty", "json_compact", "toon_default", "toon_keyfold", "xml_pretty", "xml_compact", "yaml"];
exports.FILE_AGENT_ID = 'agent_ids.json';
exports.FILE_METADATA = "metadata.json";
exports.FILE_ANALYTICS_RESULT = "analytics_results.json";
exports.FILE_METRICS = "metrics.json";
exports.RECORD_COUNT = 31;
exports.VARIANTS = [true, false];
exports.EFFICIENCY_SCORE_WEIGHT = {
    accuracy: 0.66,
    tokens: 0.33
};
exports.QUESTIONS_COUNT = 125;
exports.QUESTIONS_DISTRIBUTION = {
    field_retrieval: 60,
    structure_awareness: 27,
    filtering: 21,
    aggregation: 21
};
exports.QUESTIONS_WEIGHT_DISTRIBUTION = {
    field_retrieval: 0.375,
    structure_awareness: 0.29167,
    filtering: 0.20833,
    aggregation: 0.125
};
