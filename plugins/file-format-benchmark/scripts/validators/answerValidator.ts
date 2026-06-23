/**
 * Answer validator
 * Validates answers deterministically with support for fuzzy matching on deductions
 */

import { QUESTIONS_WEIGHT_DISTRIBUTION } from "../consts";
import { ToPercentage } from "../shared";
import {
  AnswerTemplate,
  ValidationResult,
  ValidationReport,
  ProvidedAnswer,
  AnswerAndQuestion,
  Format,
  CategoryAnswerAccuracy,
  QuestionCategory,
  ValidationStats,
} from "../types";

interface AggregatedStats {
  totalCount: number;
  correctCount: number;
  incorrectCount: number;
  noAnswerCount: number;
  expectedChars: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
}

export class AnswerValidator {
  /**
   * Validate all answers against questionnaire
   */
  public validateAnswers(
    format: Format,
    answerTemplate: AnswerTemplate,
    answersAndQuestions: AnswerAndQuestion[]
  ): ValidationReport {
    const results: ValidationResult[] = [];
    const map: Map<QuestionCategory, AggregatedStats> = new Map();

    for (const answerAndQuestion of answersAndQuestions) {
      let counter = map.get(answerAndQuestion.category);
      if(!counter){
        counter = {
          totalCount: 0,
          correctCount: 0,
          incorrectCount: 0,
          noAnswerCount: 0,
          expectedChars: 0,
          correctChars: 0,
          incorrectChars: 0,
          totalChars: 0,
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
           
      if(result.stats.correct){
        counter.correctCount++;
      }else{
        counter.incorrectCount++;
      }

      counter.expectedChars += result.stats.expectedChars;
      counter.correctChars += result.stats.correctChars;
      counter.incorrectChars += result.stats.incorrectChars;
      counter.totalChars += result.stats.totalChars;
      map.set(answerAndQuestion.category, counter);
    }

    // Calculate accuracy
    const stats: AggregatedStats = {
      totalCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      noAnswerCount: 0,
      expectedChars: 0,
      correctChars: 0,
      incorrectChars: 0,
      totalChars: 0,
    };
    results.forEach(x => {
      stats.totalCount++;

      if(x.stats.correct){
        stats.correctCount++;
      }else{
        stats.incorrectCount++;
      }

      stats.expectedChars += x.stats.expectedChars;
      stats.correctChars += x.stats.correctChars;
      stats.incorrectChars += x.stats.incorrectChars;
      stats.totalChars += x.stats.totalChars;
    });

    const mapAsArray = [...map.entries()];
    const weightedAccuracyPercent = mapAsArray.reduce((sum, x) => sum + ToPercentage((x[1].correctCount / x[1].totalCount) * QUESTIONS_WEIGHT_DISTRIBUTION[x[0]]), 0);
    const weightedAccuracyByCharPercent = mapAsArray.reduce((sum, x) => sum + ToPercentage((x[1].correctChars / x[1].totalChars) * QUESTIONS_WEIGHT_DISTRIBUTION[x[0]]), 0);
    return {
      format: format,
      totalQuestions: stats.totalCount,
      results,
      accuracy: {
        correct: stats.correctCount,
        incorrect: stats.incorrectCount,
        accuracyPercent: ToPercentage(stats.correctCount / stats.totalCount),
        weightedAccuracyPercent: weightedAccuracyPercent
      },
      charactersOfAnswers: {
        expected: stats.expectedChars,
        correct: stats.correctChars,
        incorrect: stats.incorrectChars,
        total: stats.totalChars,
        accuracyByCharPerc: ToPercentage(stats.correctChars / stats.totalChars),
        weightedAccuracyByCharPerc: weightedAccuracyByCharPercent
      },
      accuracyPerCategory: mapAsArray.map<CategoryAnswerAccuracy>(x => {
        const category = x[0];
        const counter = x[1];
        const weight = QUESTIONS_WEIGHT_DISTRIBUTION[category];
        const accuracy = counter.correctCount / counter.totalCount;
        const weightedAccuracy = accuracy * weight;
        const accuracyByCharPerc = counter.correctChars / counter.totalChars;
        const weightedAccuracyByCharPerc = accuracyByCharPerc * weight;

        return {      
          category: category,    
          correct: counter.correctCount,
          incorrect: counter.incorrectCount,
          unanswered: counter.noAnswerCount,
          accuracyPercent: ToPercentage(accuracy),
          weightedAccuracyPercent: ToPercentage(weightedAccuracy),
          charactersOfAnswers: {
            expected: counter.expectedChars,
            correct: counter.correctChars,
            incorrect: counter.incorrectChars,
            total: counter.totalChars,
            accuracyByCharPerc: ToPercentage(accuracyByCharPerc),
            weightedAccuracyByCharPerc: ToPercentage(weightedAccuracyByCharPerc),
          }
        };
      })
    };
  }

  private getExpectedAnswerLength(question: AnswerAndQuestion): number {
    const expected = question.expectedAnswer;

    switch (expected.validationMethod) {
      case "exact":
        return String(expected.value).length;

      case "numeric":
        return this.parseNumber(expected.value)?.toString().length ?? 0;

      case "array_set":
        return (expected.value as string[]).reduce((sum, curr) => sum + curr.length, 0);
    }
  }

  private validateSingleAnswer(question: AnswerAndQuestion, providedAnswer: ProvidedAnswer): ValidationResult {
    const expected = question.expectedAnswer;
    let stats:ValidationStats;

    switch (expected.validationMethod) {
      case "exact":
        stats = this.validateExact(String(providedAnswer.answer), String(expected.value));
        break;

      case "numeric":
        stats = this.validateNumeric(providedAnswer.answer, expected.value, expected.tolerance || 0);
        break;

      case "array_set":
        stats = this.validateArraySet(providedAnswer.answer, expected.value as string[]);
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
  private validateExact(given: string, expected: string): ValidationStats {
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
  private validateNumeric(given: unknown, expected: unknown, tolerance: number): ValidationStats {
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

  private getAccuracyFromStrings(expectedStr: string, givenStr: string): {
      expectedChars: number;
      correctChars: number;
      incorrectChars: number;
      totalChars: number;
      accuracyByChar: number;
    }{
    const expectedChars = expectedStr.length;
    const givenChars = givenStr.length;
    let correctChars = 0;
    let incorrectChars = 0;

    for (let i = 0; i < givenChars; i++) {
      if(expectedStr.charCodeAt(i) == givenStr.charCodeAt(i)) {
        correctChars += 1;
      } else {
        incorrectChars += 1;
      }
    }

    if(expectedChars > givenChars){      
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
  private validateArraySet(given: unknown, expected: string[]): ValidationStats {
    if(expected.length == 0 && (Array.isArray(given) || typeof given === "string") && given.length === 0){
      return {
        correct: true,
        expectedChars: 0,
        correctChars: 0,
        incorrectChars: 0,
        totalChars: 0,
        accuracyByChar: 0
      };
    }

    const expectedChars = expected.reduce((sum, curr) => sum + curr.length, 0);
    let givenItems: string[] = [];

    if (Array.isArray(given)) {
      givenItems = given.map((item) => String(item));
    } else if (typeof given === "string") {
      // Try to parse comma-separated list
      givenItems = given.split(",");
    } else {
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
    const foundIdx = new Set<number>();

    // Check if all expected items are in given items
    let matchCount = 0;
    let incorrectChars = 0;
    let correctChars = 0;

    for (const item of givenItems) {
      const length = item.length;
      const itemTrimmed = item.toLowerCase().trim();
      const idx = expectedTrimmedValues.findIndex((x,i) => x === itemTrimmed && foundIdx.has(i) === false);

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
      const idx = givenTrimmedValues.findIndex((x,i) => x === itemTrimmed && foundIdx.has(i) === false);

      if (idx > -1) {
        foundIdx.add(idx);
      } else {
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

  private calcAccuracyByChar(correctChars: number, totalChars: number): number{
    if(correctChars === 0 || totalChars === 0){
      return 0;
    }

    return correctChars / totalChars;
  }

  /**
   * Parse number from string or number type
   */
  private parseNumber(value: unknown): number | null {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }
}

export function validateAnswers(
  format: Format,
  answerTemplate: AnswerTemplate,
  questions: AnswerAndQuestion[]
): ValidationReport {
  const validator = new AnswerValidator();
  return validator.validateAnswers(format, answerTemplate, questions);
}
