"use strict";
/**
 * Benchmarking orchestrator
 * Main entry point for generating test data, questionnaires, and coordinating test execution
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenchmarkingOrchestrator = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const generateProductDataGenerator_1 = require("./generators/generateProductDataGenerator");
const index_1 = require("./converters/index");
const questions_1 = require("./generators/questions");
const answerValidator_1 = require("./validators/answerValidator");
const consts_1 = require("./consts");
class BenchmarkingOrchestrator {
    outputDir;
    constructor(outputDir = "benchmarking") {
        this.outputDir = outputDir;
        this.ensureDirectories();
    }
    ensureDirectories() {
        let fullPath;
        for (const dir of consts_1.DIRECTORIES) {
            fullPath = path.join(this.outputDir, dir);
            this.createDirectory(fullPath);
        }
        for (const format of consts_1.FORMATS) {
            fullPath = path.join(this.outputDir, consts_1.DIRECTORY_DATA, format);
            this.createDirectory(fullPath);
            fullPath = path.join(this.outputDir, consts_1.DIRECTORY_SUBAGENT_OUTPUT, format);
            this.createDirectory(fullPath);
        }
    }
    createDirectory(fullPath) {
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
    }
    /**
     * Generate all test data and questionnaires
     */
    generateAllTestData() {
        const filesCreated = [];
        for (const allFieldsManadatory of consts_1.VARIANTS) {
            const fieldsMandatoryText = allFieldsManadatory ? 'mandatory' : 'optional';
            console.log(`Generating test data with ${consts_1.RECORD_COUNT} records per file and all data ${fieldsMandatoryText}...\n`);
            // Generate data
            const dataToUse = (0, generateProductDataGenerator_1.generateProductDataGenerator)(consts_1.RECORD_COUNT, allFieldsManadatory);
            const recordCount = dataToUse.records.length;
            // Generate questionnaire
            const answersAndQuestions = (0, questions_1.generateQuestionnaire)(dataToUse);
            const answersAndQuestionsFileName = `questions_and_answers_with_${fieldsMandatoryText}_${recordCount}_records.json`;
            const answersAndQuestionsFilePath = path.join(this.outputDir, consts_1.DIRECTORY_ANSWERS_VALIDATION, answersAndQuestionsFileName);
            const questionnaireFileName = `questions_with_${fieldsMandatoryText}_${recordCount}_records.json`;
            const questionnaireFilePath = path.join(this.outputDir, consts_1.DIRECTORY_QUESTIONS, questionnaireFileName);
            const answerTemplateFileName = `answers_with_${fieldsMandatoryText}_${recordCount}_records_template.json`;
            const answerTemplateFilePath = path.join(this.outputDir, consts_1.DIRECTORY_ANSWERS_TEMPLATE, answerTemplateFileName);
            const questionaireWithAnswers = {
                metadata: {
                    recordCount: dataToUse.metadata.recordCount,
                    fieldCount: dataToUse.metadata.fieldCount,
                    totalValues: dataToUse.metadata.totalValues,
                    totalQuestions: answersAndQuestions.length,
                    generatedAt: new Date().toISOString(),
                    questionFilePath: questionnaireFilePath,
                    answerTemplateFilePath: answerTemplateFilePath
                },
                answersAndQuestions: answersAndQuestions,
            };
            // Write answer and questions for validation
            fs.writeFileSync(answersAndQuestionsFilePath, JSON.stringify(questionaireWithAnswers));
            console.log(`✓ Questions and answers: ${answersAndQuestionsFilePath} (${answersAndQuestions.length} questions)`);
            // Write questions
            const questionsForTest = {
                instructions: `If you are asked for a single value like a text, number or count then set it as a string to the answer field like this: {"questionId":200,"answer":"value1"}. If you are asked for multiple values at the same time then set them as comma separated string to the answer field like this: {"questionId":201,"answer":"value1,value2,value3"}. IMPORTANT: When extracting dates, return them exactly as they appear in the data as plain text strings in YYYY-MM-DD format. Never convert to Date objects or perform any timezone operations.`,
                questions: answersAndQuestions.map(x => ({ id: x.id, question: x.question }))
            };
            fs.writeFileSync(questionnaireFilePath, JSON.stringify(questionsForTest));
            console.log(`✓ Questions: ${questionnaireFileName} (${questionsForTest.questions.length} questions)`);
            // Generate empty answer template
            const answerTemplate = {
                metadata: {
                    format: "",
                    questionsFilePath: questionnaireFilePath,
                    dataFilePath: "",
                },
                answers: answersAndQuestions.map((q) => ({ questionId: q.id, answer: "" }))
            };
            fs.writeFileSync(answerTemplateFilePath, JSON.stringify(answerTemplate));
            console.log(`✓ Answer template: ${answerTemplateFileName}`);
            // Prepare result
            const generatedFiles = {
                recordCount: consts_1.RECORD_COUNT,
                fieldCount: dataToUse.metadata.fieldCount,
                totalValues: dataToUse.metadata.totalValues,
                questionCount: questionsForTest.questions.length,
                answersAndQuestionsForValidationFilePath: answersAndQuestionsFilePath,
                questionnaireFilePath: questionnaireFilePath,
                answerTemplateFilePath: answerTemplateFilePath,
                dataAndOutput: []
            };
            // Generate array formats
            for (const format of consts_1.FORMATS) {
                console.log(`Generating ${format.toUpperCase()} file with ${fieldsMandatoryText} ${consts_1.RECORD_COUNT} flat records`);
                // Convert to format
                const fileContent = (0, index_1.convertToFormat)(dataToUse, format);
                const fileExt = this.getFileExtension(format);
                const dataFileName = `${format}_with_${fieldsMandatoryText}_${recordCount}_flat_records.${fileExt}`;
                const dataFilePath = path.join(this.outputDir, consts_1.DIRECTORY_DATA, format, dataFileName);
                const expectedOutputFilePath = path.join(this.outputDir, consts_1.DIRECTORY_SUBAGENT_OUTPUT, format, `answers_with_${fieldsMandatoryText}_${recordCount}_flat_records.json`);
                fs.writeFileSync(dataFilePath, fileContent);
                const content = fs.readFileSync(dataFilePath, "utf-8"); // Read file again to get actual content size     
                const characterCount = content.length;
                console.log(`✓ Data: ${dataFileName} (${characterCount} chars, ${recordCount} flat data set rows and ${fieldsMandatoryText} data)`);
                // Track result
                generatedFiles.dataAndOutput.push({
                    structure: "flat",
                    format: format,
                    allFieldsManadatory: allFieldsManadatory,
                    dataFilePath: dataFilePath,
                    expectedOutputFilePath: expectedOutputFilePath,
                    metadata: {
                        characterCount: characterCount,
                        avgCharacterCountPerRecord: characterCount / generatedFiles.recordCount,
                        avgCharacterCountPerValue: characterCount / generatedFiles.totalValues
                    }
                });
            }
            // Generate nested formats (without CSV because it can not display nested structure)
            for (const format of consts_1.FORMATS.filter(x => x !== "csv")) {
                console.log(`Generating ${format.toUpperCase()} file with ${fieldsMandatoryText} ${consts_1.RECORD_COUNT} nested records`);
                // Convert to format
                const nestedObjects = (0, generateProductDataGenerator_1.convertToNestedObject)(dataToUse);
                const fileContent = (0, index_1.convertToFormat)(nestedObjects, format);
                const characterCount = fileContent.length;
                const fileExt = this.getFileExtension(format);
                const dataFileName = `${format}_with_${fieldsMandatoryText}_${recordCount}_nested_records.${fileExt}`;
                const dataFilePath = path.join(this.outputDir, consts_1.DIRECTORY_DATA, format, dataFileName);
                const expectedOutputFilePath = path.join(this.outputDir, consts_1.DIRECTORY_SUBAGENT_OUTPUT, format, `answers_with_${fieldsMandatoryText}_${recordCount}_nested_records.json`);
                fs.writeFileSync(dataFilePath, fileContent);
                console.log(`✓ Data: ${dataFileName} (${characterCount} chars, ${recordCount} nested data set rows and ${fieldsMandatoryText} data)`);
                // Track result
                generatedFiles.dataAndOutput.push({
                    structure: "nested",
                    format: format,
                    allFieldsManadatory: allFieldsManadatory,
                    dataFilePath: dataFilePath,
                    expectedOutputFilePath: expectedOutputFilePath,
                    metadata: {
                        characterCount: characterCount,
                        avgCharacterCountPerRecord: characterCount / generatedFiles.recordCount,
                        avgCharacterCountPerValue: characterCount / generatedFiles.totalValues
                    }
                });
            }
            filesCreated.push(generatedFiles);
        }
        // Write metadata
        const results = {
            generatedAt: new Date().toISOString(),
            filesPerRecordCount: filesCreated
        };
        const metadataPath = path.join(this.outputDir, consts_1.FILE_METADATA);
        fs.writeFileSync(metadataPath, JSON.stringify(results));
        console.log(`Metadata written to ${metadataPath}`);
        return results;
    }
    /**
     * Validate answers from a test execution
     */
    validateTestResults(subagentAnswerFilePath, metaDataFilePath) {
        if (!fs.existsSync(subagentAnswerFilePath)) {
            throw new Error(`Answers file not found: ${subagentAnswerFilePath}`);
        }
        if (!fs.existsSync(metaDataFilePath)) {
            throw new Error(`Meta data file not found: ${metaDataFilePath}`);
        }
        const generatorResult = JSON.parse(fs.readFileSync(metaDataFilePath, "utf-8"));
        let format;
        let generatedFiles;
        let questionaireWithAnswers;
        generatorResult.filesPerRecordCount.forEach((files) => {
            files.dataAndOutput.forEach((dataAndOutput) => {
                if (dataAndOutput.expectedOutputFilePath === subagentAnswerFilePath) {
                    generatedFiles = files;
                    format = dataAndOutput.format;
                    questionaireWithAnswers = JSON.parse(fs.readFileSync(files.answersAndQuestionsForValidationFilePath, "utf-8"));
                }
            });
        });
        if (!questionaireWithAnswers || !format || !generatedFiles) {
            throw new Error('Answers and questions for validation file not found. Provided subagent output filepath does not match expected output filepath in meta data file.');
        }
        const answerData = JSON.parse(fs.readFileSync(subagentAnswerFilePath, "utf-8"));
        const report = (0, answerValidator_1.validateAnswers)(format, answerData, questionaireWithAnswers.answersAndQuestions);
        // Write validation report
        const reportFileName = `${format}_${generatedFiles.recordCount}_validation.json`;
        const reportPath = path.join(this.outputDir, consts_1.DIRECTORY_RESULTS, reportFileName);
        fs.writeFileSync(reportPath, JSON.stringify(report));
        return report;
    }
    getFileExtension(format) {
        const extensions = {
            csv: "csv",
            json_pretty: "json",
            json_compact: "json",
            toon_safe: "toon",
            toon_unsafe: "toon",
            xml_pretty: "xml",
            xml_compact: "xml",
            yaml: "yaml",
        };
        return extensions[format];
    }
}
exports.BenchmarkingOrchestrator = BenchmarkingOrchestrator;
// CLI entry point
if (require.main === module) {
    const args = process.argv.slice(2);
    let outputDir = "benchmarking";
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case "--output":
                outputDir = args[++i];
                break;
        }
    }
    if (!outputDir) {
        console.error("Usage: node dist/orchestrator.js --output <dir>");
        process.exit(1);
    }
    const orchestrator = new BenchmarkingOrchestrator(outputDir);
    const logSeparator = "=".repeat(60);
    console.log(`\n${logSeparator}`);
    console.log("BENCHMARKING FRAMEWORK - TEST DATA GENERATION");
    console.log(`${logSeparator}\n`);
    const results = orchestrator.generateAllTestData();
    if (!results || results.filesPerRecordCount.length === 0) {
        console.log(`File generation failed..`);
    }
    else {
        console.log(`${logSeparator}`);
        const fileCount = consts_1.FORMATS.length * consts_1.VARIANTS.length;
        console.log(`Generated ${fileCount} dataset(s) with questionnaires`);
        console.log(`Output directory: ${outputDir}`);
        console.log(`${logSeparator}\n`);
    }
}
exports.default = BenchmarkingOrchestrator;
