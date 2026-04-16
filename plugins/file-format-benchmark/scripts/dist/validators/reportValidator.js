#!/usr/bin/env node
"use strict";
/**
 * Validate all answers against ground truth questionnaires
 * Automatically finds all test output files recursively and aggregates 3 test runs per format/variant/recordCount
 * Usage: node validate.js --subagent-outputs <dir> --validation-dir <dir> --results-dir <dir>
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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const answerValidator_1 = require("./answerValidator");
const consts_1 = require("../consts");
const shared_1 = require("../shared");
class ReportValidator {
    subagentOutputsDir;
    validationDir;
    resultsDir;
    constructor(outputDir) {
        this.subagentOutputsDir = path.join(outputDir, consts_1.DIRECTORY_SUBAGENT_OUTPUT);
        this.validationDir = path.join(outputDir, consts_1.DIRECTORY_ANSWERS_VALIDATION);
        this.resultsDir = path.join(outputDir, consts_1.DIRECTORY_RESULTS);
    }
    validate() {
        console.log("Loading agent IDs from file...");
        // Ensure output directory exists
        if (!fs.existsSync(this.resultsDir)) {
            fs.mkdirSync(this.resultsDir, { recursive: true });
        }
        const results = [];
        const testCases = [...this.findTestCases(this.subagentOutputsDir).values()];
        if (testCases.length === 0) {
            console.error("Error: No test cases found in", this.subagentOutputsDir);
            return results;
        }
        console.log(`\nFound ${testCases.length} test cases to validate\n`);
        // Validate all test cases
        const validator = new answerValidator_1.AnswerValidator();
        for (const testCase of testCases) {
            const validationKeyFile = path.join(this.validationDir, `questions_and_answers_with_${testCase.variant}_${testCase.recordCount}_records.json`);
            if (!fs.existsSync(validationKeyFile)) {
                console.warn(`⚠ Skipping ${testCase.format}_${testCase.structure}_${testCase.variant}_${testCase.recordCount}: validation data not found`);
                continue;
            }
            const validationData = JSON.parse(fs.readFileSync(validationKeyFile, "utf-8"));
            const groundTruthQuestions = validationData.answersAndQuestions;
            const report = {
                format: testCase.format,
                structure: testCase.structure,
                variant: testCase.variant,
                recordCount: testCase.recordCount,
                testRuns: testCase.answerFiles.length,
                totalQuestions: validationData.metadata.totalQuestions,
                accuracy: {
                    correct: 0,
                    incorrect: 0,
                    accuracyPercent: 0,
                    accuracyDriftPercMin: 0,
                    accuracyDriftPercMax: 0,
                    weightedAccuracyPercent: 0,
                    weightedAccuracyDriftPercMin: 0,
                    weightedAccuracyDriftPercMax: 0,
                    charactersOfAnswers: {
                        expected: 0,
                        correct: 0,
                        incorrect: 0,
                        total: 0,
                        accuracyByCharPerc: 0,
                        accuracyByCharPercDriftMin: 0,
                        accuracyByCharPercDriftMax: 0,
                        weightedAccuracyByCharPerc: 0,
                        weightedAccuracyByCharPercDriftMin: 0,
                        weightedAccuracyByCharPercDriftMax: 0
                    }
                },
                perRunAccuracy: [],
                questionsAndProvidedAnswers: groundTruthQuestions.map(x => {
                    return {
                        questionId: x.id,
                        category: x.category,
                        question: x.question,
                        expectedAnswer: x.expectedAnswer.value,
                        answers: [],
                    };
                })
            };
            for (let i = 0; i < testCase.answerFiles.length; i++) {
                const answersFile = testCase.answerFiles[i];
                const answersData = JSON.parse(fs.readFileSync(answersFile, "utf-8"));
                const format = testCase.format;
                const answerTemplate = {
                    metadata: {
                        format: format,
                        questionsFilePath: validationKeyFile,
                        dataFilePath: answersData.metadata?.dataFilePath || "unknown",
                    },
                    answers: answersData.answers,
                };
                const validationResult = validator.validateAnswers(format, answerTemplate, groundTruthQuestions);
                report.perRunAccuracy.push({
                    run: i + 1,
                    correct: validationResult.accuracy.correct,
                    incorrect: validationResult.accuracy.incorrect,
                    accuracyPercent: validationResult.accuracy.accuracyPercent,
                    weightedAccuracyPercent: validationResult.accuracy.weightedAccuracyPercent,
                    accuracyPerCategory: validationResult.accuracyPerCategory,
                    charactersOfAnswers: {
                        expected: validationResult.charactersOfAnswers.expected,
                        correct: validationResult.charactersOfAnswers.correct,
                        incorrect: validationResult.charactersOfAnswers.incorrect,
                        total: validationResult.charactersOfAnswers.total,
                        accuracyByCharPerc: validationResult.charactersOfAnswers.accuracyByCharPerc,
                        weightedAccuracyByCharPerc: validationResult.charactersOfAnswers.weightedAccuracyByCharPerc
                    }
                });
                validationResult.results.forEach(x => {
                    const questionsAndProvidedAnswer = report.questionsAndProvidedAnswers.find(y => y.questionId == x.questionId);
                    questionsAndProvidedAnswer?.answers.push({
                        givenAnswer: x.givenAnswer,
                        correct: x.stats.correct
                    });
                });
            }
            // Aggregate results from all 3 runs
            report.accuracy.correct = (0, shared_1.roundTo2Digits)(report.perRunAccuracy.reduce((sum, r) => sum + r.correct, 0) / report.perRunAccuracy.length);
            report.accuracy.incorrect = (0, shared_1.roundTo2Digits)(report.perRunAccuracy.reduce((sum, r) => sum + r.incorrect, 0) / report.perRunAccuracy.length);
            report.accuracy.accuracyPercent = (0, shared_1.roundTo2Digits)(report.perRunAccuracy.reduce((sum, r) => sum + r.accuracyPercent, 0) / report.perRunAccuracy.length);
            report.accuracy.weightedAccuracyPercent = (0, shared_1.roundTo2Digits)(report.perRunAccuracy.reduce((sum, r) => sum + r.weightedAccuracyPercent, 0) / report.perRunAccuracy.length);
            report.accuracy.accuracyDriftPercMin = (0, shared_1.calcDriftPerc)(report.accuracy.accuracyPercent, Math.min(...report.perRunAccuracy.map(x => x.accuracyPercent)));
            report.accuracy.accuracyDriftPercMax = (0, shared_1.calcDriftPerc)(report.accuracy.accuracyPercent, Math.max(...report.perRunAccuracy.map(x => x.accuracyPercent)));
            report.accuracy.weightedAccuracyDriftPercMin = (0, shared_1.calcDriftPerc)(report.accuracy.weightedAccuracyPercent, Math.min(...report.perRunAccuracy.map(x => x.weightedAccuracyPercent)));
            report.accuracy.weightedAccuracyDriftPercMax = (0, shared_1.calcDriftPerc)(report.accuracy.weightedAccuracyPercent, Math.max(...report.perRunAccuracy.map(x => x.weightedAccuracyPercent)));
            const avgAccuracyByCharPercent = (0, shared_1.roundTo2Digits)(report.perRunAccuracy.reduce((sum, r) => sum + r.charactersOfAnswers.accuracyByCharPerc, 0) / report.perRunAccuracy.length);
            const avgWeightedAccuracyByCharPercent = (0, shared_1.roundTo2Digits)(report.perRunAccuracy.reduce((sum, r) => sum + r.charactersOfAnswers.weightedAccuracyByCharPerc, 0) / report.perRunAccuracy.length);
            report.accuracy.charactersOfAnswers = {
                expected: (0, shared_1.roundTo3Digits)(report.perRunAccuracy.reduce((sum, r) => sum + r.charactersOfAnswers.expected, 0) / report.perRunAccuracy.length),
                correct: (0, shared_1.roundTo3Digits)(report.perRunAccuracy.reduce((sum, r) => sum + r.charactersOfAnswers.correct, 0) / report.perRunAccuracy.length),
                incorrect: (0, shared_1.roundTo3Digits)(report.perRunAccuracy.reduce((sum, r) => sum + r.charactersOfAnswers.incorrect, 0) / report.perRunAccuracy.length),
                total: (0, shared_1.roundTo3Digits)(report.perRunAccuracy.reduce((sum, r) => sum + r.charactersOfAnswers.total, 0) / report.perRunAccuracy.length),
                accuracyByCharPerc: avgAccuracyByCharPercent,
                accuracyByCharPercDriftMin: (0, shared_1.calcDriftPerc)(avgAccuracyByCharPercent, Math.min(...report.perRunAccuracy.map(x => x.charactersOfAnswers.accuracyByCharPerc))),
                accuracyByCharPercDriftMax: (0, shared_1.calcDriftPerc)(avgAccuracyByCharPercent, Math.max(...report.perRunAccuracy.map(x => x.charactersOfAnswers.accuracyByCharPerc))),
                weightedAccuracyByCharPerc: avgWeightedAccuracyByCharPercent,
                weightedAccuracyByCharPercDriftMin: (0, shared_1.calcDriftPerc)(avgAccuracyByCharPercent, Math.min(...report.perRunAccuracy.map(x => x.charactersOfAnswers.weightedAccuracyByCharPerc))),
                weightedAccuracyByCharPercDriftMax: (0, shared_1.calcDriftPerc)(avgAccuracyByCharPercent, Math.max(...report.perRunAccuracy.map(x => x.charactersOfAnswers.weightedAccuracyByCharPerc)))
            };
            console.log(`${testCase.format.padEnd(15)} ${testCase.structure.padEnd(8)} ${testCase.variant.padEnd(10)} ${String(testCase.recordCount).padEnd(4)}`);
            console.log(`Accuracy by question: ${report.accuracy.accuracyPercent === 100 ? "✓" : report.accuracy.accuracyPercent >= 90 ? "◐" : "✗"} → ${report.accuracy.accuracyPercent}%`);
            console.log(`Accuracy by output char: ${avgAccuracyByCharPercent === 100 ? "✓" : avgAccuracyByCharPercent >= 90 ? "◐" : "✗"} → ${avgAccuracyByCharPercent}%`);
            // Save aggregated results
            const outputFile = path.join(this.resultsDir, `${testCase.format}_${testCase.structure}_${testCase.variant}_${testCase.recordCount}_validation.json`);
            fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
            results.push(report);
        }
        console.log(`\n✓ Validation complete. Results saved to: ${this.resultsDir}\n`);
        return results;
    }
    findTestCases(dir) {
        const map = new Map();
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                const innerMap = this.findTestCases(fullPath);
                innerMap.forEach((value, key) => {
                    let testCase = map.get(key);
                    if (!testCase) {
                        map.set(key, value);
                    }
                    else {
                        value.answerFiles.forEach(x => testCase?.answerFiles.push(x));
                        map.set(key, testCase);
                    }
                });
            }
            else if (entry.isFile()) {
                // Extract structure, variant, recordCount from filename
                // Format: answers_for_{structure}_{variant}_{recordCount}_records_{testRun}.json
                // Example: answers_for_flat_mandatory_60_records_1.json
                const match = entry.name.match(/^answers_for_(.+?)_(.+?)_(\d+)_records_(\d+)\.json$/);
                if (match) {
                    const format = path.basename(path.dirname(fullPath));
                    const structure = match[1];
                    const variant = match[2];
                    const recordCount = parseInt(match[3]);
                    const key = `${format}_${structure}_${variant}_${recordCount}`;
                    let testCase = map.get(key);
                    if (!testCase) {
                        testCase = {
                            format: format,
                            structure: structure,
                            variant: variant,
                            recordCount: recordCount,
                            answerFiles: [fullPath]
                        };
                    }
                    else {
                        testCase.answerFiles.push(fullPath);
                    }
                    map.set(key, testCase);
                }
                else {
                    console.warn(`Found file with wrong name format '${entry.name}' in the folder '${path.basename(path.dirname(fullPath))}'. Expected format: 'answers_for_(.+?)_(.+?)_(\d+)_records_(\d+)\.json' Example: 'answers_for_flat_mandatory_60_records_1.json'`);
                }
            }
        }
        return map;
    }
}
exports.default = ReportValidator;
