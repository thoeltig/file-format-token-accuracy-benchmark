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
} from "../types";

interface AnswerCounter {
  correct: number;
  incorrect: number; 
  notSet: number; 
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
    const map: Map<QuestionCategory, AnswerCounter> = new Map();

    for (const answerAndQuestion of answersAndQuestions) {
      let counter = map.get(answerAndQuestion.category);
      if(!counter){
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

      if(result.correct){        
        counter.correct++;
      }else{   
        counter.incorrect++;
      }
      map.set(answerAndQuestion.category, counter);
    }

    // Calculate accuracy
    const correctCount = results.filter((r) => r.correct).length;
    const totalValidatable = results.length;
    const mapAsArray = [...map.entries()];
    const weightedAccuracyPercent = mapAsArray.reduce((sum, x) => sum + ToPercentage((x[1].correct / (x[1].correct+x[1].incorrect+x[1].notSet))*QUESTIONS_WEIGHT_DISTRIBUTION[x[0]]), 0);
    const expectedCharactersOfAnswers = results.map(x => this.getAnswerLength(x.expectedAnswer)).reduce((sum, x) => sum + x, 0);
    const correctCharactersOfAnswers = results.filter(x => x.correct === true).map(x => this.getAnswerLength(x.expectedAnswer)).reduce((sum, x) => sum + x, 0);
    const incorrectCharactersOfAnswers = results.filter(x => x.correct === false).map(x => this.getAnswerLength(x.givenAnswer)).reduce((sum, x) => sum + x, 0);

    return {
      format: format,
      totalQuestions: totalValidatable,
      results,
      accuracy: {
        correct: correctCount,
        incorrect: totalValidatable - correctCount,
        accuracyPercent: ToPercentage(correctCount / totalValidatable),
        weightedAccuracyPercent: weightedAccuracyPercent
      },
      charactersOfAnswers: {
        expected: expectedCharactersOfAnswers,
        correct: correctCharactersOfAnswers,
        incorrect: incorrectCharactersOfAnswers,
        accuracyByCharPerc: ToPercentage(correctCharactersOfAnswers / expectedCharactersOfAnswers)
      },
      accuracyPerCategory: mapAsArray.map<CategoryAnswerAccuracy>(x => {
        const category = x[0];
        const counter = x[1];
        return {      
          category: category,    
          correct: counter.correct,
          incorrect: counter.incorrect,
          unanswered: counter.notSet,
          accuracyPercent: ToPercentage(counter.correct / (counter.correct+counter.incorrect+counter.notSet)),
          weightedAccuracyPercent: ToPercentage((counter.correct / (counter.correct+counter.incorrect+counter.notSet)) * QUESTIONS_WEIGHT_DISTRIBUTION[category]),
        };
      })
    };
  }

  private getAnswerLength(answer: string | number | string[] | boolean): number{    
    if(!answer)
      return 0;

    if(Array.isArray(answer))
      return answer.map(x => x.length).reduce((sum, x) => sum + x, 0);

    return String(answer).length;
  }

  private validateSingleAnswer(question: AnswerAndQuestion, providedAnswer: ProvidedAnswer): ValidationResult {
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
        const arrayResult = this.validateArraySet(providedAnswer.answer, expected.value as string[]);
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
  private validateExact(given: string, expected: string): boolean {
    return given.toLowerCase().trim() === expected.toLowerCase().trim();
  }

  /**
   * Numeric validation with tolerance
   */
  private validateNumeric(given: unknown, expected: unknown, tolerance: number): {correct: boolean; confidence: number} {
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
  private validateArraySet(given: unknown, expected: string[]): {correct: boolean; confidence: number} {
    let givenItems: string[] = [];

    if (Array.isArray(given)) {
      givenItems = given.map((item) => String(item).toLowerCase().trim());
    } else if (typeof given === "string") {
      // Try to parse comma-separated list
      givenItems = given.split(",").map((item) => item.toLowerCase().trim());
    } else {
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
