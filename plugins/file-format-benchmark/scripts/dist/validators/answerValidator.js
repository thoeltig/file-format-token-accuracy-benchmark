"use strict";
/**
 * Answer validator
 * Validates answers deterministically with support for fuzzy matching on deductions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAnswers = exports.AnswerValidator = void 0;
const consts_1 = require("../consts");
const shared_1 = require("../shared");
class AnswerValidator {
    /**
     * Validate all answers against questionnaire
     */
    validateAnswers(format, answerTemplate, answersAndQuestions) {
        const results = [];
        const map = new Map();
        for (const answerAndQuestion of answersAndQuestions) {
            let counter = map.get(answerAndQuestion.category);
            if (!counter) {
                counter = {
                    totalCount: 0,
                    correctCount: 0,
                    incorrectCount: 0,
                    noAnswerCount: 0,
                    expectedChars: 0,
                    correctChars: 0,
                    incorrectChars: 0,
                    totalChars: 0,
                    accuracyByChar: 0,
                };
            }
            counter.totalCount++;
            const providedAnswer = answerTemplate.answers.find((a) => a.questionId === answerAndQuestion.id);
            if (!providedAnswer) {
                const expectedCharCount = this.getExpectedAnswerLength(answerAndQuestion);
                results.push({
                    questionId: answerAndQuestion.id,
                    question: answerAndQuestion.question,
                    givenAnswer: "NOT_ANSWERED",
                    expectedAnswer: answerAndQuestion.expectedAnswer.value,
                    stats: {
                        correct: false,
                        expectedChars: expectedCharCount,
                        correctChars: 0,
                        incorrectChars: 0,
                        totalChars: 0,
                        accuracyByChar: 0,
                    },
                    category: answerAndQuestion.category,
                    method: answerAndQuestion.expectedAnswer.validationMethod
                });
                counter.noAnswerCount++;
                counter.expectedChars += expectedCharCount;
                map.set(answerAndQuestion.category, counter);
                continue;
            }
            const result = this.validateSingleAnswer(answerAndQuestion, providedAnswer);
            results.push(result);
            if (result.stats.correct) {
                counter.correctCount++;
            }
            else {
                counter.incorrectCount++;
            }
            counter.expectedChars += result.stats.expectedChars;
            counter.correctChars += result.stats.correctChars;
            counter.incorrectChars += result.stats.incorrectChars;
            counter.totalChars += result.stats.totalChars;
            counter.accuracyByChar += result.stats.accuracyByChar;
            map.set(answerAndQuestion.category, counter);
        }
        // Calculate accuracy
        const totalResultCount = results.length;
        const stats = {
            totalCount: 0,
            correctCount: 0,
            incorrectCount: 0,
            noAnswerCount: 0,
            expectedChars: 0,
            correctChars: 0,
            incorrectChars: 0,
            totalChars: 0,
            accuracyByChar: 0,
        };
        results.forEach(x => {
            stats.totalCount++;
            if (x.stats.correct) {
                stats.correctCount++;
            }
            else {
                stats.incorrectCount++;
            }
            stats.expectedChars += x.stats.expectedChars;
            stats.correctChars += x.stats.correctChars;
            stats.incorrectChars += x.stats.incorrectChars;
            stats.totalChars += x.stats.totalChars;
            stats.accuracyByChar += x.stats.accuracyByChar;
        });
        stats.accuracyByChar /= totalResultCount;
        const mapAsArray = [...map.entries()];
        const weightedAccuracyPercent = mapAsArray.reduce((sum, x) => sum + (0, shared_1.ToPercentage)((x[1].correctCount / x[1].totalCount) * consts_1.QUESTIONS_WEIGHT_DISTRIBUTION[x[0]]), 0);
        return {
            format: format,
            totalQuestions: totalResultCount,
            results,
            accuracy: {
                correct: stats.correctCount,
                incorrect: stats.incorrectCount,
                accuracyPercent: (0, shared_1.ToPercentage)(stats.correctCount / stats.totalCount),
                weightedAccuracyPercent: weightedAccuracyPercent
            },
            charactersOfAnswers: {
                expected: stats.expectedChars,
                correct: stats.correctChars,
                incorrect: stats.incorrectChars,
                total: stats.totalChars,
                accuracyByCharPerc: (0, shared_1.ToPercentage)(stats.accuracyByChar)
            },
            accuracyPerCategory: mapAsArray.map(x => {
                const category = x[0];
                const counter = x[1];
                const accuracy = counter.correctCount / counter.totalCount;
                const weightedAccuracy = accuracy * consts_1.QUESTIONS_WEIGHT_DISTRIBUTION[category];
                return {
                    category: category,
                    correct: counter.correctCount,
                    incorrect: counter.incorrectCount,
                    unanswered: counter.noAnswerCount,
                    accuracyPercent: (0, shared_1.ToPercentage)(accuracy),
                    weightedAccuracyPercent: (0, shared_1.ToPercentage)(weightedAccuracy),
                    charactersOfAnswers: {
                        expected: counter.expectedChars,
                        correct: counter.correctChars,
                        incorrect: counter.incorrectChars,
                        total: counter.totalChars,
                        accuracyByCharPerc: (0, shared_1.ToPercentage)(counter.accuracyByChar / counter.totalCount),
                    }
                };
            })
        };
    }
    getExpectedAnswerLength(question) {
        const expected = question.expectedAnswer;
        switch (expected.validationMethod) {
            case "exact":
                return String(expected.value).length;
            case "numeric":
                return this.parseNumber(expected.value)?.toString().length ?? 0;
            case "array_set":
                return expected.value.reduce((sum, curr) => sum + curr.length, 0);
        }
    }
    validateSingleAnswer(question, providedAnswer) {
        const expected = question.expectedAnswer;
        let stats;
        switch (expected.validationMethod) {
            case "exact":
                stats = this.validateExact(String(providedAnswer.answer), String(expected.value));
                break;
            case "numeric":
                stats = this.validateNumeric(providedAnswer.answer, expected.value, expected.tolerance || 0);
                break;
            case "array_set":
                stats = this.validateArraySet(providedAnswer.answer, expected.value);
                break;
        }
        return {
            questionId: question.id,
            question: question.question,
            givenAnswer: providedAnswer.answer,
            expectedAnswer: expected.value,
            stats,
            category: question.category,
            method: expected.validationMethod,
        };
    }
    /**
     * Exact string match (case-insensitive)
     */
    validateExact(given, expected) {
        const expectedStr = expected.toLowerCase().trim();
        const givenStr = given.toLowerCase().trim();
        const correct = givenStr === expectedStr;
        return {
            correct,
            ...this.getAccuracyFromStrings(expected, given)
        };
    }
    /**
     * Numeric validation with tolerance
     */
    validateNumeric(given, expected, tolerance) {
        const givenNum = this.parseNumber(given);
        const givenStr = givenNum?.toFixed(3) ?? "";
        const expectedNum = this.parseNumber(expected);
        const expectedStr = expectedNum?.toFixed(3) ?? "";
        if (givenNum === null || expectedNum === null) {
            return {
                correct: false,
                expectedChars: expectedStr.length,
                correctChars: 0,
                incorrectChars: givenStr.length,
                totalChars: givenStr.length,
                accuracyByChar: 0,
            };
        }
        const diff = Math.abs(givenNum - expectedNum);
        const correct = diff <= tolerance;
        return {
            correct,
            ...this.getAccuracyFromStrings(expectedStr, givenStr)
        };
    }
    getAccuracyFromStrings(expectedStr, givenStr) {
        const expectedChars = expectedStr.length;
        const givenChars = givenStr.length;
        let correctChars = 0;
        let incorrectChars = 0;
        for (let i = 0; i < givenChars; i++) {
            if (expectedStr.charCodeAt(i) == givenStr.charCodeAt(i)) {
                correctChars += 1;
            }
            else {
                incorrectChars += 1;
            }
        }
        if (expectedChars > givenChars) {
            incorrectChars += expectedChars - givenChars;
        }
        const totalChars = correctChars + incorrectChars;
        return {
            expectedChars,
            correctChars,
            incorrectChars,
            totalChars,
            accuracyByChar: this.calcAccuracyByChar(correctChars, totalChars),
        };
    }
    /**
     * Array/set validation - check if given answer contains all expected items
     */
    validateArraySet(given, expected) {
        const expectedChars = expected.reduce((sum, curr) => sum + curr.length, 0);
        let givenItems = [];
        if (Array.isArray(given)) {
            givenItems = given.map((item) => String(item));
        }
        else if (typeof given === "string") {
            // Try to parse comma-separated list
            givenItems = given.split(",");
        }
        else {
            return {
                correct: false,
                expectedChars,
                correctChars: 0,
                incorrectChars: 0,
                totalChars: 0,
                accuracyByChar: 0
            };
        }
        const expectedTrimmedValues = [...expected.map((item) => item.toLowerCase().trim())];
        const givenTrimmedValues = [...givenItems.map((item) => item.toLowerCase().trim())];
        const foundIdx = new Set();
        // Check if all expected items are in given items
        let matchCount = 0;
        let incorrectChars = 0;
        let correctChars = 0;
        for (const item of givenItems) {
            const length = item.length;
            const itemTrimmed = item.toLowerCase().trim();
            const idx = expectedTrimmedValues.findIndex((x, i) => x === itemTrimmed && foundIdx.has(i) === false);
            if (idx > -1) {
                foundIdx.add(idx);
                matchCount += 1;
                correctChars += length;
            }
            else {
                incorrectChars += length;
            }
        }
        foundIdx.clear();
        for (const item of expected) {
            const itemTrimmed = item.toLowerCase().trim();
            const idx = givenTrimmedValues.findIndex((x, i) => x === itemTrimmed && foundIdx.has(i) === false);
            if (idx > -1) {
                foundIdx.add(idx);
            }
            else {
                incorrectChars += item.length;
            }
        }
        const totalChars = correctChars + incorrectChars;
        return {
            correct: matchCount === expected.length && matchCount === givenItems.length,
            expectedChars,
            correctChars,
            incorrectChars,
            totalChars,
            accuracyByChar: this.calcAccuracyByChar(correctChars, totalChars)
        };
    }
    calcAccuracyByChar(correctChars, totalChars) {
        if (correctChars === 0 || totalChars === 0) {
            return 0;
        }
        return correctChars / totalChars;
    }
    /**
     * Parse number from string or number type
     */
    parseNumber(value) {
        if (typeof value === "number")
            return value;
        if (typeof value === "string") {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? null : parsed;
        }
        return null;
    }
}
exports.AnswerValidator = AnswerValidator;
function validateAnswers(format, answerTemplate, questions) {
    const validator = new AnswerValidator();
    return validator.validateAnswers(format, answerTemplate, questions);
}
exports.validateAnswers = validateAnswers;
