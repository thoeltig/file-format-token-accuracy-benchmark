import * as fs from 'fs';
import * as path from 'path';
import { QuestionCategory, MergedValidationReport, TestMetrics, AnalyticsOutput, Metrics } from '../types';

// ============================================================================
// LOCAL TYPES
// ============================================================================

export type AllQuestionCategory = QuestionCategory | "multiple_steps";

export interface AggregatedMetric extends Metrics {
  charsPerTokenDelta: number;
  tokensPerValueDelta: number;
  tokensPerObjectDelta: number;
  readDurationInMillisecondsDelta: number;
  outputDurationInMillisecondsDelta: number;
  absOutputDurationDriftPerc: number;
  totalDurationInMilliseconds: number;
  totalDurationInMillisecondsDelta: number;
  readTokensDelta: number;
  outputTokensDelta: number;
  absOutputTokensDriftPerc: number;
  totalTokensDelta: number;
  efficientlyUsedTokensyDelta: number;
  costOfInaccuracyDelta: number;
  correctAnswersDelta: number;
  incorrectAnswersDelta: number;
  accuracyDelta: number;
  absAccuracyDriftPerc: number;
  weightedAccuracyDelta: number;
  absweightedAccuracyDriftPerc: number;
  efficiencyDelta: number;
  weightedEfficiencyDelta: number;
  informationValuePerTokenDelta: number;
}

export interface CategoryAccuracy {
  category: AllQuestionCategory;
  accuracyPercent: number;
  weightedAccuracyPercent: number;
  correct: number;
  incorrect: number;
  unanswered: number;
}

export interface ValidationSummary {
  format: string;
  variant: string;
  recordCount: number;
  accuracy: CategoryAccuracy[];
}

// ============================================================================
// LOADERS
// ============================================================================

export function loadAnalyticsResults(jsonPath: string): AnalyticsOutput {
  const resolvedPath = path.resolve(jsonPath);
  const content = fs.readFileSync(resolvedPath, 'utf-8');
  const data = JSON.parse(content);

  if (!data.metrics || !Array.isArray(data.metrics)) {
    throw new Error('Invalid analytics JSON: missing or invalid metrics array');
  }

  return data;
}

export function aggregateMetrics(metrics: TestMetrics[]): AggregatedMetric[] {
  // Group by format, variant, AND record count
  const byFormatVariantRecord: { [key: string]: TestMetrics[] } = {};

  metrics.forEach(m => {
    const variant = m.hasOptionalData ? 'optional' : 'mandatory';
    const key = `${m.format}||${variant}||${m.recordCount}`;
    if (!byFormatVariantRecord[key]) {
      byFormatVariantRecord[key] = [];
    }
    byFormatVariantRecord[key].push(m);
  });

  // Aggregate metrics per format+variant+recordCount combo
  const aggregated: AggregatedMetric[] = [];

  Object.entries(byFormatVariantRecord).forEach(([key, tests]) => {
    const [format, variant, recordCountStr] = key.split('||');
    const recordCount = parseInt(recordCountStr, 10);

    // Average across multiple test runs for same format+variant+recordCount
    const avgTest: AggregatedMetric = {
      format,
      variant,
      recordCount,
      readTokens: 0,
      readDurationInMilliseconds: 0,
      readTokensPerMillisecond: 0,
      avgOutputTokens: 0,
      minOutputTokensDriftPerc: 0,
      maxOutputTokensDriftPerc: 0,
      avgReasoningDurationInMilliseconds: 0,
      minReasoningDurationDriftPerc: 0,
      maxReasoningDurationDriftPerc: 0,
      avgReasoningTokensPerMillisecond: 0,
      totalQuestions: 0,
      avgNoAnswers: 0,
      avgIncorrectAnswers: 0,
      avgCorrectAnswers: 0,
      avgAccuracyPercent: 0,
      minAccuracyDriftPercent: 0,
      maxAccuracyDriftPercent: 0, 
      avgWeightedAccuracyPercent: 0,
      minWeightedAccuracyDriftPercent: 0,
      maxWeightedAccuracyDriftPercent: 0,
      charsPerToken: 0,
      tokensPerValue: 0,
      tokensPerObject: 0,
      avgOutputTokensPerAnswer: 0,
      informationValuePerToken: 0,
      costOfInaccuracy: 0,
      totalTokensUsed: 0,
      efficientlyUsedTokens: 0,
      weightedEfficientlyUsedTokens: 0,
      efficiencyScore: 0,
      weightedEfficiencyScore: 0,
      readTokensDelta: 0,
      outputTokensDelta: 0,
      totalTokensDelta: 0,
      efficientlyUsedTokensyDelta: 0,
      costOfInaccuracyDelta: 0,
      correctAnswersDelta: 0,
      incorrectAnswersDelta: 0,
      accuracyDelta: 0,
      weightedAccuracyDelta: 0,
      efficiencyDelta: 0,
      weightedEfficiencyDelta: 0,
      informationValuePerTokenDelta: 0,
      readDurationInMillisecondsDelta: 0,
      outputDurationInMillisecondsDelta: 0,
      totalDurationInMilliseconds: 0,
      totalDurationInMillisecondsDelta: 0,
      charsPerTokenDelta: 0,
      tokensPerValueDelta: 0,
      tokensPerObjectDelta: 0,
      absOutputDurationDriftPerc: 0,
      absOutputTokensDriftPerc: 0,
      absAccuracyDriftPerc: 0,
      absweightedAccuracyDriftPerc: 0
    };

    tests.forEach(t => {
      avgTest.readTokens += t.readTokens;
      avgTest.readDurationInMilliseconds += t.readDurationInMilliseconds;
      avgTest.readTokensPerMillisecond += t.readTokensPerMillisecond;
      avgTest.avgOutputTokens += t.avgOutputTokens;
      avgTest.minOutputTokensDriftPerc += t.minOutputTokensDriftPerc;
      avgTest.maxOutputTokensDriftPerc += t.maxOutputTokensDriftPerc;
      avgTest.avgReasoningDurationInMilliseconds += t.avgReasoningDurationInMilliseconds;
      avgTest.minReasoningDurationDriftPerc += t.minReasoningDurationDriftPerc;
      avgTest.maxReasoningDurationDriftPerc += t.maxReasoningDurationDriftPerc;
      avgTest.avgReasoningTokensPerMillisecond += t.avgReasoningTokensPerMillisecond;      
      avgTest.totalDurationInMilliseconds = t.readDurationInMilliseconds + t.avgReasoningDurationInMilliseconds;
      avgTest.totalQuestions += t.totalQuestions;
      avgTest.avgNoAnswers += t.avgNoAnswers;
      avgTest.avgIncorrectAnswers += t.avgIncorrectAnswers;
      avgTest.avgCorrectAnswers += t.avgCorrectAnswers;
      avgTest.avgAccuracyPercent += t.avgAccuracyPercent;
      avgTest.minAccuracyDriftPercent += t.minAccuracyDriftPercent;
      avgTest.maxAccuracyDriftPercent += t.maxAccuracyDriftPercent;
      avgTest.avgWeightedAccuracyPercent += t.avgWeightedAccuracyPercent;
      avgTest.minWeightedAccuracyDriftPercent += t.minWeightedAccuracyDriftPercent;
      avgTest.maxWeightedAccuracyDriftPercent += t.maxWeightedAccuracyDriftPercent;
      avgTest.charsPerToken += t.charsPerToken;
      avgTest.tokensPerValue += t.tokensPerValue;
      avgTest.tokensPerObject += t.tokensPerObject;
      avgTest.avgOutputTokensPerAnswer += t.avgOutputTokensPerAnswer;
      avgTest.informationValuePerToken += t.informationValuePerToken;
      avgTest.costOfInaccuracy += t.costOfInaccuracy;
      avgTest.totalTokensUsed += t.totalTokensUsed;
      avgTest.efficientlyUsedTokens += t.efficientlyUsedTokens;
      avgTest.weightedEfficientlyUsedTokens += t.weightedEfficientlyUsedTokens;
      avgTest.efficiencyScore += t.efficiencyScore;
      avgTest.weightedEfficiencyScore += t.weightedEfficiencyScore;
    });

    const count = tests.length;
    avgTest.readTokens /= count;
    avgTest.readDurationInMilliseconds /= count;
    avgTest.readTokensPerMillisecond /= count;
    avgTest.avgOutputTokens /= count;
    avgTest.minOutputTokensDriftPerc /= count;
    avgTest.maxOutputTokensDriftPerc /= count;
    avgTest.avgReasoningDurationInMilliseconds /= count;
    avgTest.minReasoningDurationDriftPerc /= count;
    avgTest.maxReasoningDurationDriftPerc /= count;
    avgTest.avgReasoningTokensPerMillisecond /= count;
    avgTest.totalDurationInMilliseconds /= count;
    avgTest.totalQuestions /= count;
    avgTest.avgNoAnswers /= count;
    avgTest.avgIncorrectAnswers /= count;
    avgTest.avgCorrectAnswers /= count;
    avgTest.avgAccuracyPercent /= count;
    avgTest.minAccuracyDriftPercent /= count;
    avgTest.maxAccuracyDriftPercent /= count;
    avgTest.avgWeightedAccuracyPercent /= count;
    avgTest.minWeightedAccuracyDriftPercent /= count;
    avgTest.maxWeightedAccuracyDriftPercent /= count;
    avgTest.charsPerToken /= count;
    avgTest.tokensPerValue /= count;
    avgTest.tokensPerObject /= count;
    avgTest.avgOutputTokensPerAnswer /= count;
    avgTest.informationValuePerToken /= count;
    avgTest.costOfInaccuracy /= count;
    avgTest.totalTokensUsed /= count;
    avgTest.efficientlyUsedTokens /= count;
    avgTest.weightedEfficientlyUsedTokens /= count;
    avgTest.efficiencyScore /= count;
    avgTest.weightedEfficiencyScore /= count;
    avgTest.absOutputDurationDriftPerc = Math.abs(avgTest.minReasoningDurationDriftPerc) + avgTest.maxReasoningDurationDriftPerc;
    avgTest.absOutputTokensDriftPerc = Math.abs(avgTest.minOutputTokensDriftPerc) + avgTest.maxOutputTokensDriftPerc;
    avgTest.absAccuracyDriftPerc = Math.abs(avgTest.minAccuracyDriftPercent) + avgTest.maxAccuracyDriftPercent;
    avgTest.absweightedAccuracyDriftPerc = Math.abs(avgTest.minWeightedAccuracyDriftPercent) + avgTest.maxWeightedAccuracyDriftPercent;
    
    aggregated.push(avgTest);
  });

  // Calculate deltas
  aggregated.forEach(item => {
    const mandatory = aggregated.find(
      a => a.format === item.format && a.variant === 'mandatory' && a.recordCount === item.recordCount
    );
    const optional = aggregated.find(
      a => a.format === item.format && a.variant === 'optional' && a.recordCount === item.recordCount
    );

    if (mandatory && optional) {
      item.readTokensDelta = optional.readTokens - mandatory.readTokens;
      item.outputTokensDelta = optional.avgOutputTokens - mandatory.avgOutputTokens;
      item.totalTokensDelta = optional.totalTokensUsed - mandatory.totalTokensUsed;
      item.efficientlyUsedTokensyDelta = optional.efficientlyUsedTokens - mandatory.efficientlyUsedTokens;
      item.costOfInaccuracyDelta = optional.costOfInaccuracy - mandatory.costOfInaccuracy;
      item.accuracyDelta = optional.avgAccuracyPercent - mandatory.avgAccuracyPercent;
      item.weightedAccuracyDelta = optional.avgWeightedAccuracyPercent - mandatory.avgWeightedAccuracyPercent;
      item.correctAnswersDelta = optional.avgCorrectAnswers - mandatory.avgCorrectAnswers;
      item.incorrectAnswersDelta = optional.avgIncorrectAnswers - mandatory.avgIncorrectAnswers;
      item.efficiencyDelta = optional.efficiencyScore - mandatory.efficiencyScore;
      item.weightedEfficiencyDelta = optional.weightedEfficiencyScore - mandatory.weightedEfficiencyScore;
      item.charsPerTokenDelta = optional.charsPerToken - mandatory.charsPerToken;
      item.tokensPerValueDelta = optional.tokensPerValue - mandatory.tokensPerValue;
      item.tokensPerObjectDelta = optional.tokensPerObject - mandatory.tokensPerObject;
      item.informationValuePerTokenDelta = optional.informationValuePerToken - mandatory.informationValuePerToken;
      item.readDurationInMillisecondsDelta = optional.readDurationInMilliseconds - mandatory.readDurationInMilliseconds;
      item.outputDurationInMillisecondsDelta = optional.avgReasoningDurationInMilliseconds - mandatory.avgReasoningDurationInMilliseconds;
      item.totalDurationInMillisecondsDelta = optional.totalDurationInMilliseconds - mandatory.totalDurationInMilliseconds;
    }
  });

  return aggregated;
}

export function loadValidationResults(resultsPath: string): ValidationSummary[] {
  const resolvedPath = path.resolve(resultsPath);
  const files = fs.readdirSync(resolvedPath).filter(f => f.endsWith('_validation.json'));

  const validations: ValidationSummary[] = [];

  files.forEach(file => {
    const filePath = path.join(resolvedPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content) as MergedValidationReport;

    // Average accuracyPerCategory across all runs
    const categoryMap: { [key in AllQuestionCategory]?: { correct: number; incorrect: number; unanswered: number; accuracy: number; weightedAccuracy: number } } = {};

    if (data.perRunAccuracy && Array.isArray(data.perRunAccuracy)) {
      data.perRunAccuracy.forEach(run => {
        if (run.accuracyPerCategory && Array.isArray(run.accuracyPerCategory)) {
          run.accuracyPerCategory.forEach(cat => {
            const catName = cat.category as AllQuestionCategory;
            if (!categoryMap[catName]) {
              categoryMap[catName] = {
                correct: 0,
                incorrect: 0,
                unanswered: 0,
                accuracy: 0,
                weightedAccuracy: 0,
              };
            }
            const entry = categoryMap[catName];
            if (entry) {
              entry.correct += cat.correct;
              entry.incorrect += cat.incorrect;
              entry.unanswered += cat.unanswered;
              entry.accuracy += cat.accuracyPercent;
              entry.weightedAccuracy += cat.weightedAccuracyPercent;
            }
          });
        }
      });

      // Average the values
      const runCount = data.perRunAccuracy.length;
      const accuracy: CategoryAccuracy[] = [];
      Object.entries(categoryMap).forEach(([catName, stats]) => {
        if (stats) {
          accuracy.push({
            category: catName as AllQuestionCategory,
            accuracyPercent: stats.accuracy / runCount,
            weightedAccuracyPercent: stats.weightedAccuracy / runCount,
            correct: stats.correct / runCount,
            incorrect: stats.incorrect / runCount,
            unanswered: stats.unanswered / runCount,
          });
        }
      });

      validations.push({
        format: data.format,
        variant: data.variant,
        recordCount: data.recordCount,
        accuracy,
      });
    }
  });

  return validations;
}
