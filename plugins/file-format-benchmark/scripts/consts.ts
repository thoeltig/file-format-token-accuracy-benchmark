import { Directory, Format } from "./types";

export const DIRECTORY_DATA:Directory = "data";
export const DIRECTORY_ANSWERS_VALIDATION:Directory  = "answers_validation";
export const DIRECTORY_QUESTIONS:Directory = "questions";
export const DIRECTORY_ANSWERS_TEMPLATE:Directory  = "answers_template";
export const DIRECTORY_SUBAGENT_OUTPUT:Directory  = "subagent_outputs";
export const DIRECTORY_RESULTS:Directory  = "results";
export const DIRECTORIES: Directory[] = [DIRECTORY_DATA, DIRECTORY_ANSWERS_VALIDATION, DIRECTORY_QUESTIONS, DIRECTORY_ANSWERS_TEMPLATE, DIRECTORY_SUBAGENT_OUTPUT, DIRECTORY_RESULTS];

export const FORMATS: Format[] = ["csv", "json_pretty", "json_compact", "toon_safe", "toon_unsafe", "xml_pretty", "xml_compact", "yaml"];

export const FILE_AGENT_ID:string = 'agent_ids.json';
export const FILE_METADATA:string = "metadata.json";
export const FILE_ANALYTICS_RESULT:string  = "analytics_results.json";
export const FILE_METRICS:string = "metrics.json";

export const RECORD_COUNT = 31;
export const VARIANTS: boolean[] = [true, false];
export const QUESTIONS_COUNT = 125;
export const QUESTIONS_DISTRIBUTION = {
    field_retrieval: 60,
    structure_awareness: 27, 
    filtering: 21, 
    aggregation: 21
};

export const QUESTIONS_WEIGHT_DISTRIBUTION = {
    field_retrieval: 0.375,
    structure_awareness: 0.29167, 
    filtering: 0.20833, 
    aggregation: 0.125
};