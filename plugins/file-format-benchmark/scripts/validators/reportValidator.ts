#!/usr/bin/env node
/**
 * Validate all answers against ground truth questionnaires
 * Automatically finds all test output files recursively and aggregates 3 test runs per format/variant/recordCount
 * Usage: node validate.js --subagent-outputs <dir> --validation-dir <dir> --results-dir <dir>
 */

import * as fs from "fs";
import * as path from "path";
import { AnswerValidator } from "./answerValidator";
import { AnswerAndQuestion, Format, QuestionnaireWithAnswers, AnswerTemplate, MergedValidationReport, QuestionsAndProvidedAnswers } from "../types";
import { DIRECTORY_ANSWERS_VALIDATION, DIRECTORY_RESULTS, DIRECTORY_SUBAGENT_OUTPUT } from "../consts";
import { roundTo2Digits, roundTo3Digits, ToPercentage } from "../shared";

// Find all test 1 files recursively (these define the test cases)
interface TestCase {
    format: string;
    structure: string;
    variant: string;
    recordCount: number;
    answerFiles: string[];
}

class ReportValidator {
    private subagentOutputsDir: string;
    private validationDir: string;
    private resultsDir: string;

    constructor(outputDir: string) {
        this.subagentOutputsDir = path.join(outputDir, DIRECTORY_SUBAGENT_OUTPUT);
        this.validationDir = path.join(outputDir, DIRECTORY_ANSWERS_VALIDATION);
        this.resultsDir = path.join(outputDir, DIRECTORY_RESULTS);
    }

    public validate(): MergedValidationReport[] {
        console.log("Loading agent IDs from file...");
        // Ensure output directory exists
        if (!fs.existsSync(this.resultsDir)) {
            fs.mkdirSync(this.resultsDir, { recursive: true });
        }

        const results: MergedValidationReport[] = [];

        const testCases = [...this.findTestCases(this.subagentOutputsDir).values()];
        if (testCases.length === 0) {
            console.error("Error: No test cases found in", this.subagentOutputsDir);
            return results;
        }

        console.log(`\nFound ${testCases.length} test cases to validate\n`);

        // Validate all test cases
        const validator = new AnswerValidator();

        for (const testCase of testCases) {
            const validationKeyFile = path.join(this.validationDir, `questions_and_answers_with_${testCase.variant}_${testCase.recordCount}_records.json`);

            if (!fs.existsSync(validationKeyFile)) {
                console.warn(`⚠ Skipping ${testCase.format}_${testCase.structure}_${testCase.variant}_${testCase.recordCount}: validation data not found`);
                continue;
            }

            const validationData = JSON.parse(fs.readFileSync(validationKeyFile, "utf-8")) as QuestionnaireWithAnswers;
            const groundTruthQuestions: AnswerAndQuestion[] = validationData.answersAndQuestions;
            
            const report: MergedValidationReport = {
                format: testCase.format as Format,
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
                        accuracyByCharPerc: 0,
                        accuracyByCharDriftPercMin: 0,
                        accuracyByCharDriftPercMax: 0
                    }
                },
                perRunAccuracy:[],
                questionsAndProvidedAnswers: groundTruthQuestions.map<QuestionsAndProvidedAnswers>(x => {
                    return {
                        questionId: x.id,
                        category: x.category,
                        question: x.question,
                        expectedAnswer: x.expectedAnswer.value,
                        answers:[],
                    };
                })
            };

            for (let i = 0; i < testCase.answerFiles.length; i++) {
                const answersFile = testCase.answerFiles[i];
                const answersData = JSON.parse(fs.readFileSync(answersFile, "utf-8")) as AnswerTemplate;

                const format = testCase.format as Format;
                const answerTemplate: AnswerTemplate = {
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
                        accuracyByCharPerc: validationResult.charactersOfAnswers.accuracyByCharPerc
                    }
                });

                validationResult.results.forEach(x => {
                    const questionsAndProvidedAnswer = report.questionsAndProvidedAnswers.find(y => y.questionId == x.questionId);
                    questionsAndProvidedAnswer?.answers.push({
                        givenAnswer: x.givenAnswer,
                        correct: x.correct
                    });
                });
            }

            // Aggregate results from all 3 runs
            report.accuracy.correct =  roundTo2Digits(report.perRunAccuracy.reduce((sum, r) => sum + r.correct, 0) / report.perRunAccuracy.length);
            report.accuracy.incorrect =  roundTo2Digits(report.perRunAccuracy.reduce((sum, r) => sum + r.incorrect, 0) / report.perRunAccuracy.length);
            report.accuracy.accuracyPercent =  roundTo2Digits(report.perRunAccuracy.reduce((sum, r) => sum + r.accuracyPercent, 0) / report.perRunAccuracy.length);
            report.accuracy.weightedAccuracyPercent =  roundTo2Digits(report.perRunAccuracy.reduce((sum, r) => sum + r.weightedAccuracyPercent, 0) / report.perRunAccuracy.length);
            
            report.accuracy.accuracyDriftPercMin = this.calcDriftPerc(report.accuracy.accuracyPercent, Math.min(...report.perRunAccuracy.map(x => x.accuracyPercent)));
            report.accuracy.accuracyDriftPercMax = this.calcDriftPerc(report.accuracy.accuracyPercent, Math.max(...report.perRunAccuracy.map(x => x.accuracyPercent)));
            report.accuracy.weightedAccuracyDriftPercMin = this.calcDriftPerc(report.accuracy.weightedAccuracyPercent, Math.min(...report.perRunAccuracy.map(x => x.weightedAccuracyPercent)));
            report.accuracy.weightedAccuracyDriftPercMax = this.calcDriftPerc(report.accuracy.weightedAccuracyPercent, Math.max(...report.perRunAccuracy.map(x => x.weightedAccuracyPercent)));
            
            const avgAccuracyByCharPercent = ToPercentage(report.perRunAccuracy.reduce((sum, r) => sum + r.charactersOfAnswers.accuracyByCharPerc, 0) / report.perRunAccuracy.length);
            report.accuracy.charactersOfAnswers = {
                expected: roundTo3Digits(report.perRunAccuracy.reduce((sum, r) => sum + r.charactersOfAnswers.expected, 0) / report.perRunAccuracy.length),
                correct: roundTo3Digits(report.perRunAccuracy.reduce((sum, r) => sum + r.charactersOfAnswers.correct, 0) / report.perRunAccuracy.length),
                incorrect: roundTo3Digits(report.perRunAccuracy.reduce((sum, r) => sum + r.charactersOfAnswers.incorrect, 0) / report.perRunAccuracy.length),
                accuracyByCharPerc: avgAccuracyByCharPercent,
                accuracyByCharDriftPercMin: this.calcDriftPerc(avgAccuracyByCharPercent, Math.min(...report.perRunAccuracy.map(x => x.charactersOfAnswers.accuracyByCharPerc))),
                accuracyByCharDriftPercMax: this.calcDriftPerc(avgAccuracyByCharPercent, Math.max(...report.perRunAccuracy.map(x => x.charactersOfAnswers.accuracyByCharPerc)))
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
    
    private calcDriftPerc(avg: number, val: number): number{
        return Math.round(((val - avg) / avg) * 100 * 100) / 100;
    }
    
    private findTestCases(dir: string): Map<string,TestCase> {
        const map: Map<string,TestCase> = new Map();
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                const innerMap = this.findTestCases(fullPath);
                innerMap.forEach((value, key)=>{
                    let testCase = map.get(key);
                    if(!testCase){
                        map.set(key, value);
                    }else{
                        value.answerFiles.forEach(x => testCase?.answerFiles.push(x));
                        map.set(key, testCase);
                    }  
                });
            } else if (entry.isFile()) {
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
                    if(!testCase){
                        testCase = {
                            format: format,
                            structure: structure,
                            variant: variant,
                            recordCount: recordCount,
                            answerFiles: [fullPath]
                        }
                    }else{
                        testCase.answerFiles.push(fullPath);
                    }  

                    map.set(key, testCase);
                }else{
                    console.warn(`Found file with wrong name format '${entry.name}' in the folder '${path.basename(path.dirname(fullPath))}'. Expected format: 'answers_for_(.+?)_(.+?)_(\d+)_records_(\d+)\.json' Example: 'answers_for_flat_mandatory_60_records_1.json'`);
                }
            }
        }
        
        return map;
    }
}

export default ReportValidator;