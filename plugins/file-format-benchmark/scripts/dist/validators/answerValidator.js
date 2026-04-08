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
                    correct: 0,
                    incorrect: 0,
                    notSet: 0,
                };
            }
            const providedAnswer = answerTemplate.answers.find((a) => a.questionId === answerAndQuestion.id);
            if (!providedAnswer) {
                results.push({
                    questionId: answerAndQuestion.id,
                    question: answerAndQuestion.question,
                    givenAnswer: "NOT_ANSWERED",
                    expectedAnswer: answerAndQuestion.expectedAnswer.value,
                    correct: false,
                    category: answerAndQuestion.category,
                    method: answerAndQuestion.expectedAnswer.validationMethod
                });
                counter.notSet++;
                map.set(answerAndQuestion.category, counter);
                continue;
            }
            const result = this.validateSingleAnswer(answerAndQuestion, providedAnswer);
            results.push(result);
            if (result.correct) {
                counter.correct++;
            }
            else {
                counter.incorrect++;
            }
            map.set(answerAndQuestion.category, counter);
        }
        // Calculate accuracy
        const correctCount = results.filter((r) => r.correct).length;
        const totalValidatable = results.length;
        const mapAsArray = [...map.entries()];
        const weightedAccuracyPercent = mapAsArray.reduce((sum, x) => sum + (0, shared_1.ToPercentage)((x[1].correct / (x[1].correct + x[1].incorrect + x[1].notSet)) * consts_1.QUESTIONS_WEIGHT_DISTRIBUTION[x[0]]), 0);
        return {
            format: format,
            totalQuestions: totalValidatable,
            results,
            accuracy: {
                correct: correctCount,
                incorrect: totalValidatable - correctCount,
                accuracyPercent: (0, shared_1.ToPercentage)(correctCount / totalValidatable),
                weightedAccuracyPercent: weightedAccuracyPercent
            },
            charactersOfAnswers: {
                expected: results.map(x => this.getAnswerLength(x.expectedAnswer)).reduce((sum, x) => sum + x, 0),
                correct: results.filter(x => x.correct === true).map(x => this.getAnswerLength(x.givenAnswer)).reduce((sum, x) => sum + x, 0),
                incorrect: results.filter(x => x.correct === false).map(x => this.getAnswerLength(x.givenAnswer)).reduce((sum, x) => sum + x, 0)
            },
            accuracyPerCategory: mapAsArray.map(x => {
                const category = x[0];
                const counter = x[1];
                return {
                    category: category,
                    correct: counter.correct,
                    incorrect: counter.incorrect,
                    unanswered: counter.notSet,
                    accuracyPercent: (0, shared_1.ToPercentage)(counter.correct / (counter.correct + counter.incorrect + counter.notSet)),
                    weightedAccuracyPercent: (0, shared_1.ToPercentage)((counter.correct / (counter.correct + counter.incorrect + counter.notSet)) * consts_1.QUESTIONS_WEIGHT_DISTRIBUTION[category]),
                };
            })
        };
    }
    getAnswerLength(answer) {
        if (!answer)
            return 0;
        if (Array.isArray(answer))
            return answer.map(x => x.length).reduce((sum, x) => sum + x, 0);
        return String(answer).length;
    }
    validateSingleAnswer(question, providedAnswer) {
        const expected = question.expectedAnswer;
        let correct = false;
        switch (expected.validationMethod) {
            case "exact":
                correct = this.validateExact(String(providedAnswer.answer), String(expected.value));
                break;
            case "numeric":
                const result = this.validateNumeric(providedAnswer.answer, expected.value, expected.tolerance || 0);
                correct = result.correct;
                break;
            case "array_set":
                const arrayResult = this.validateArraySet(providedAnswer.answer, expected.value);
                correct = arrayResult.correct;
                break;
        }
        return {
            questionId: question.id,
            question: question.question,
            givenAnswer: providedAnswer.answer,
            expectedAnswer: expected.value,
            correct,
            category: question.category,
            method: expected.validationMethod,
        };
    }
    /**
     * Exact string match (case-insensitive)
     */
    validateExact(given, expected) {
        return given.toLowerCase().trim() === expected.toLowerCase().trim();
    }
    /**
     * Numeric validation with tolerance
     */
    validateNumeric(given, expected, tolerance) {
        const givenNum = this.parseNumber(given);
        const expectedNum = this.parseNumber(expected);
        if (givenNum === null || expectedNum === null) {
            return { correct: false, confidence: 0 };
        }
        const diff = Math.abs(givenNum - expectedNum);
        const correct = diff <= tolerance;
        const confidence = correct ? 1 : Math.max(0, 1 - diff / (expectedNum + 1));
        return { correct, confidence };
    }
    /**
     * Array/set validation - check if given answer contains all expected items
     */
    validateArraySet(given, expected) {
        let givenItems = [];
        if (Array.isArray(given)) {
            givenItems = given.map((item) => String(item).toLowerCase().trim());
        }
        else if (typeof given === "string") {
            // Try to parse comma-separated list
            givenItems = given.split(",").map((item) => item.toLowerCase().trim());
        }
        else {
            return { correct: false, confidence: 0 };
        }
        const expectedSet = new Set(expected.map((item) => item.toLowerCase().trim()));
        const givenSet = new Set(givenItems);
        // Check if all expected items are in given items
        let matchCount = 0;
        for (const item of expectedSet) {
            if (givenSet.has(item)) {
                matchCount++;
            }
        }
        const correct = matchCount === expectedSet.size;
        const confidence = matchCount / expectedSet.size;
        return { correct, confidence };
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
