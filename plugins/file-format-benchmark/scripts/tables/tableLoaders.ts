import * as fs from 'fs';
import * as path from 'path';
import { QuestionCategory, MergedValidationReport, TestMetrics, AnalyticsOutput, Metrics } from '../types';

// ============================================================================
// LOCAL TYPES
// ============================================================================

export type AllQuestionCategory = QuestionCategory | "multiple_steps";

export interface AggregatedMetric extends Metrics {
  charsPerReadTokenDelta: number;
  readTokensPerValueDelta: number;
  readTokensPerObjectDelta: number;
  readDurationInMsDelta: number;
  outputDurationBeforeWriteInMsDelta: number;
  outputDurationWriteInMsDelta: number;
  outputDurationTotalInMsDelta: number;
  absOutputDurationBeforeWriteDriftPerc: number;
  absOutputDurationWriteDriftPerc: number;
  absOutputDurationTotalDriftPerc: number;
  readTokensDelta: number;
  outputTokensBeforeWriteDelta: number;
  outputTokensWriteDelta: number;
  outputTokensTotalDelta: number;
  absOutputTokensBeforeWriteDriftPerc: number;
  absOutputTokensWriteDriftPerc: number;
  absOutputTokensTotalDriftPerc: number;
  totalTokensDelta: number;
  usefulReadTokensDelta: number;
  usefulOutputTokensDelta: number;
  usefulTotalTokensDelta: number;  
  wastedReadTokensDelta: number;
  wastedOutputTokensDelta: number;
  wastedTotalTokensDelta: number;
  correctAnswersDelta: number;
  incorrectAnswersDelta: number;
  noAnswersDelta: number;
  accuracyDelta: number;
  absAccuracyDriftPerc: number;
  weightedAccuracyDelta: number;
  absWeightedAccuracyDriftPerc: number;
  efficiencyScoreReadDelta: number;
  efficiencyScoreOutputDelta: number;
  efficiencyScoreTotalDelta: number;
  weightedEfficiencyScoreReadDelta: number;
  weightedEfficiencyScoreOutputDelta: number;
  weightedEfficiencyScoreTotalDelta: number;
  informationValuePerReadTokensDelta: number;
  informationValuePerOutputTokensDelta: number;
  informationValuePerTotalTokensDelta: number;
  absAccuracyByCharDriftPerc: number;
  accuracyByCharPercDelta: number;
  usefulOutputWriteTokensByCharAccuracyDelta: number;
  wastedOutputWriteTokensByCharAccuracyDelta: number;
  efficiencyScoreOutputWriteTokensByCharAccuracyDelta: number;
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
      readDurationInMs: 0,
      readTokensPerMs: 0,
      outputTokensBeforeWrite: 0,
      outputTokensBeforeWriteDriftPercMin: 0,
      outputTokensBeforeWriteDriftPercMax: 0,
      outputTokensWrite: 0,
      outputTokensWriteDriftPercMin: 0,
      outputTokensWriteDriftPercMax: 0,
      outputTokensTotal: 0,
      outputTokensTotalDriftPercMin: 0,
      outputTokensTotalDriftPercMax: 0,
      outputDurationBeforeWriteInMs: 0,
      outputDurationBeforeWriteDriftPercMin: 0,
      outputDurationBeforeWriteDriftPercMax: 0,
      outputDurationWriteInMs: 0,
      outputDurationWriteDriftPercMin: 0,
      outputDurationWriteDriftPercMax: 0,
      outputDurationTotalInMs: 0,
      outputDurationTotalDriftPercMin: 0,
      outputDurationTotalDriftPercMax: 0,
      outputTokensBeforeWritePerMs: 0,
      outputTokensWritePerMs: 0,
      outputTokensTotalPerMs: 0,
      totalQuestions: 0,
      noAnswers: 0,
      incorrectAnswers: 0,
      correctAnswers: 0,
      accuracyPercent: 0,
      accuracyDriftPercentMin: 0,
      accuracyDriftPercentMax: 0,
      weightedAccuracyPercent: 0,
      weightedAccuracyDriftPercentMin: 0,
      weightedAccuracyDriftPercentMax: 0,
      charsPerReadToken: 0,
      readTokensPerValue: 0,
      readTokensPerObject: 0,
      outputTokensWritePerAnswer: 0,
      informationValuePerReadTokens: 0,
      informationValuePerOutputTokens: 0,
      informationValuePerTotalTokens: 0,
      totalTokens: 0,
      totalTokensDriftPercMin: 0,
      totalTokensDriftPercMax: 0,
      wastedReadTokens: 0,
      wastedOutputTokens: 0,
      wastedTotalTokens: 0,
      usefulReadTokens: 0,
      usefulOutputTokens: 0,
      usefulTotalTokens: 0,
      weightedWastedReadTokens: 0,
      weightedWastedOutputTokens: 0,
      weightedWastedTotalTokens: 0,
      weightedUsefulReadTokens: 0,
      weightedUsefulOutputTokens: 0,
      weightedUsefulTotalTokens: 0,
      efficiencyScoreRead: 0,
      efficiencyScoreOutput: 0,
      efficiencyScoreTotal: 0,
      weightedEfficiencyScoreRead: 0,
      weightedEfficiencyScoreOutput: 0,
      weightedEfficiencyScoreTotal: 0,
      readTokensDelta: 0,
      outputTokensBeforeWriteDelta: 0,
      outputTokensWriteDelta: 0,
      outputTokensTotalDelta: 0,
      totalTokensDelta: 0,
      usefulReadTokensDelta: 0,
      usefulOutputTokensDelta: 0,
      usefulTotalTokensDelta: 0,
      wastedReadTokensDelta: 0,
      wastedOutputTokensDelta: 0,
      wastedTotalTokensDelta: 0,
      correctAnswersDelta: 0,
      incorrectAnswersDelta: 0,
      noAnswersDelta: 0,
      accuracyDelta: 0,
      weightedAccuracyDelta: 0,
      efficiencyScoreReadDelta: 0,
      efficiencyScoreOutputDelta: 0,
      efficiencyScoreTotalDelta: 0,
      weightedEfficiencyScoreReadDelta: 0,
      weightedEfficiencyScoreOutputDelta: 0,
      weightedEfficiencyScoreTotalDelta: 0,
      informationValuePerReadTokensDelta: 0,
      informationValuePerOutputTokensDelta: 0,
      informationValuePerTotalTokensDelta: 0,
      readDurationInMsDelta: 0,
      outputDurationBeforeWriteInMsDelta: 0,
      outputDurationWriteInMsDelta: 0,
      outputDurationTotalInMsDelta: 0,
      charsPerReadTokenDelta: 0,
      readTokensPerValueDelta: 0,
      readTokensPerObjectDelta: 0,
      absOutputDurationBeforeWriteDriftPerc: 0,
      absOutputDurationWriteDriftPerc: 0,
      absOutputDurationTotalDriftPerc: 0,
      absOutputTokensBeforeWriteDriftPerc: 0,
      absOutputTokensWriteDriftPerc: 0,
      absOutputTokensTotalDriftPerc: 0,
      absAccuracyDriftPerc: 0,
      absWeightedAccuracyDriftPerc: 0,
      accuracyByCharPerc: 0,
      accuracyByCharDriftPercMin: 0,
      accuracyByCharDriftPercMax: 0,
      wastedOutputWriteTokensByCharAccuracy: 0,
      usefulOutputWriteTokensByCharAccuracy: 0,
      efficiencyScoreOutputWriteTokensByCharAccuracy: 0,
      absAccuracyByCharDriftPerc: 0,
      accuracyByCharPercDelta: 0,
      usefulOutputWriteTokensByCharAccuracyDelta: 0,
      wastedOutputWriteTokensByCharAccuracyDelta: 0,
      efficiencyScoreOutputWriteTokensByCharAccuracyDelta: 0,
    };

    tests.forEach(t => {
      avgTest.readTokens += t.readTokens;
      avgTest.readDurationInMs += t.readDurationInMs;
      avgTest.readTokensPerMs += t.readTokensPerMs;
      avgTest.outputTokensBeforeWrite += t.outputTokensBeforeWrite;
      avgTest.outputTokensBeforeWriteDriftPercMin += t.outputTokensBeforeWriteDriftPercMin;
      avgTest.outputTokensBeforeWriteDriftPercMax += t.outputTokensBeforeWriteDriftPercMax;
      avgTest.outputTokensWrite += t.outputTokensWrite;
      avgTest.outputTokensWriteDriftPercMin += t.outputTokensWriteDriftPercMin;
      avgTest.outputTokensWriteDriftPercMax += t.outputTokensWriteDriftPercMax;
      avgTest.outputTokensTotal += t.outputTokensTotal;
      avgTest.outputTokensTotalDriftPercMin += t.outputTokensTotalDriftPercMin;
      avgTest.outputTokensTotalDriftPercMax += t.outputTokensTotalDriftPercMax;
      avgTest.outputDurationBeforeWriteInMs += t.outputDurationBeforeWriteInMs;
      avgTest.outputDurationBeforeWriteDriftPercMin += t.outputDurationBeforeWriteDriftPercMin;
      avgTest.outputDurationBeforeWriteDriftPercMax += t.outputDurationBeforeWriteDriftPercMax;
      avgTest.outputDurationWriteInMs += t.outputDurationWriteInMs;
      avgTest.outputDurationWriteDriftPercMin += t.outputDurationWriteDriftPercMin;
      avgTest.outputDurationWriteDriftPercMax += t.outputDurationWriteDriftPercMax;
      avgTest.outputDurationTotalInMs += t.outputDurationTotalInMs;
      avgTest.outputDurationTotalDriftPercMin += t.outputDurationTotalDriftPercMin;
      avgTest.outputDurationTotalDriftPercMax += t.outputDurationTotalDriftPercMax;
      avgTest.outputTokensBeforeWritePerMs += t.outputTokensBeforeWritePerMs;
      avgTest.outputTokensWritePerMs += t.outputTokensWritePerMs;
      avgTest.outputTokensTotalPerMs += t.outputTokensTotalPerMs;
      avgTest.totalQuestions += t.totalQuestions;
      avgTest.noAnswers += t.noAnswers;
      avgTest.incorrectAnswers += t.incorrectAnswers;
      avgTest.correctAnswers += t.correctAnswers;
      avgTest.accuracyPercent += t.accuracyPercent;
      avgTest.accuracyDriftPercentMin += t.accuracyDriftPercentMin;
      avgTest.accuracyDriftPercentMax += t.accuracyDriftPercentMax;
      avgTest.weightedAccuracyPercent += t.weightedAccuracyPercent;
      avgTest.weightedAccuracyDriftPercentMin += t.weightedAccuracyDriftPercentMin;
      avgTest.weightedAccuracyDriftPercentMax += t.weightedAccuracyDriftPercentMax;
      avgTest.charsPerReadToken += t.charsPerReadToken;
      avgTest.readTokensPerValue += t.readTokensPerValue;
      avgTest.readTokensPerObject += t.readTokensPerObject;
      avgTest.outputTokensWritePerAnswer += t.outputTokensWritePerAnswer;
      avgTest.informationValuePerReadTokens += t.informationValuePerReadTokens;
      avgTest.informationValuePerOutputTokens += t.informationValuePerOutputTokens;
      avgTest.informationValuePerTotalTokens += t.informationValuePerTotalTokens;
      avgTest.totalTokens += t.totalTokens;
      avgTest.totalTokensDriftPercMin += t.totalTokensDriftPercMin;
      avgTest.totalTokensDriftPercMax += t.totalTokensDriftPercMax;
      avgTest.wastedReadTokens += t.wastedReadTokens;
      avgTest.wastedOutputTokens += t.wastedOutputTokens;
      avgTest.wastedTotalTokens += t.wastedTotalTokens;
      avgTest.usefulReadTokens += t.usefulReadTokens;
      avgTest.usefulOutputTokens += t.usefulOutputTokens;
      avgTest.usefulTotalTokens += t.usefulTotalTokens;
      avgTest.weightedWastedReadTokens += t.weightedWastedReadTokens;
      avgTest.weightedWastedOutputTokens += t.weightedWastedOutputTokens;
      avgTest.weightedWastedTotalTokens += t.weightedWastedTotalTokens;
      avgTest.weightedUsefulReadTokens += t.weightedUsefulReadTokens;
      avgTest.weightedUsefulOutputTokens += t.weightedUsefulOutputTokens;
      avgTest.weightedUsefulTotalTokens += t.weightedUsefulTotalTokens;
      avgTest.efficiencyScoreRead += t.efficiencyScoreRead;
      avgTest.efficiencyScoreOutput += t.efficiencyScoreOutput;
      avgTest.efficiencyScoreTotal += t.efficiencyScoreTotal;
      avgTest.weightedEfficiencyScoreRead += t.weightedEfficiencyScoreRead;
      avgTest.weightedEfficiencyScoreOutput += t.weightedEfficiencyScoreOutput;
      avgTest.weightedEfficiencyScoreTotal += t.weightedEfficiencyScoreTotal;
      avgTest.accuracyByCharPerc += t.accuracyByCharPerc;
      avgTest.accuracyByCharDriftPercMin += t.accuracyByCharDriftPercMin;
      avgTest.accuracyByCharDriftPercMax += t.accuracyByCharDriftPercMax;
      avgTest.wastedOutputWriteTokensByCharAccuracy += t.wastedOutputWriteTokensByCharAccuracy;
      avgTest.usefulOutputWriteTokensByCharAccuracy += t.usefulOutputWriteTokensByCharAccuracy;
      avgTest.efficiencyScoreOutputWriteTokensByCharAccuracy += t.efficiencyScoreOutputWriteTokensByCharAccuracy;
    });

    const count = tests.length;
    avgTest.readTokens /= count;
    avgTest.readDurationInMs /= count;
    avgTest.readTokensPerMs /= count;
    avgTest.outputTokensBeforeWrite /= count;
    avgTest.outputTokensBeforeWriteDriftPercMin /= count;
    avgTest.outputTokensBeforeWriteDriftPercMax /= count;
    avgTest.outputTokensWrite /= count;
    avgTest.outputTokensWriteDriftPercMin /= count;
    avgTest.outputTokensWriteDriftPercMax /= count;
    avgTest.outputTokensTotal /= count;
    avgTest.outputTokensTotalDriftPercMin /= count;
    avgTest.outputTokensTotalDriftPercMax /= count;
    avgTest.outputDurationBeforeWriteInMs /= count;
    avgTest.outputDurationBeforeWriteDriftPercMin /= count;
    avgTest.outputDurationBeforeWriteDriftPercMax /= count;
    avgTest.outputDurationWriteInMs /= count;
    avgTest.outputDurationWriteDriftPercMin /= count;
    avgTest.outputDurationWriteDriftPercMax /= count;
    avgTest.outputDurationTotalInMs /= count;
    avgTest.outputDurationTotalDriftPercMin /= count;
    avgTest.outputDurationTotalDriftPercMax /= count;
    avgTest.outputTokensBeforeWritePerMs /= count;
    avgTest.outputTokensWritePerMs /= count;
    avgTest.outputTokensTotalPerMs /= count;
    avgTest.totalQuestions/= count;
    avgTest.noAnswers /= count;
    avgTest.incorrectAnswers /= count;
    avgTest.correctAnswers /= count;
    avgTest.accuracyPercent /= count;
    avgTest.accuracyDriftPercentMin /= count;
    avgTest.accuracyDriftPercentMax /= count;
    avgTest.weightedAccuracyPercent /= count;
    avgTest.weightedAccuracyDriftPercentMin /= count;
    avgTest.weightedAccuracyDriftPercentMax /= count;
    avgTest.charsPerReadToken /= count;
    avgTest.readTokensPerValue /= count;
    avgTest.readTokensPerObject /= count;
    avgTest.outputTokensWritePerAnswer /= count;
    avgTest.informationValuePerReadTokens /= count;
    avgTest.informationValuePerOutputTokens /= count;
    avgTest.informationValuePerTotalTokens /= count;
    avgTest.totalTokens /= count;
    avgTest.totalTokensDriftPercMin /= count;
    avgTest.totalTokensDriftPercMax /= count;
    avgTest.wastedReadTokens /= count;
    avgTest.wastedOutputTokens /= count;
    avgTest.wastedTotalTokens /= count;
    avgTest.usefulReadTokens /= count;
    avgTest.usefulOutputTokens /= count;
    avgTest.usefulTotalTokens /= count;
    avgTest.weightedWastedReadTokens /= count;
    avgTest.weightedWastedOutputTokens /= count;
    avgTest.weightedWastedTotalTokens /= count;
    avgTest.weightedUsefulReadTokens /= count;
    avgTest.weightedUsefulOutputTokens /= count;
    avgTest.weightedUsefulTotalTokens /= count;
    avgTest.efficiencyScoreRead /= count;
    avgTest.efficiencyScoreOutput /= count;
    avgTest.efficiencyScoreTotal /= count;
    avgTest.weightedEfficiencyScoreRead /= count;
    avgTest.weightedEfficiencyScoreOutput /= count;
    avgTest.weightedEfficiencyScoreTotal /= count;
    avgTest.accuracyByCharPerc/= count;
    avgTest.accuracyByCharDriftPercMin /= count;
    avgTest.accuracyByCharDriftPercMax /= count;
    avgTest.wastedOutputWriteTokensByCharAccuracy /= count;
    avgTest.usefulOutputWriteTokensByCharAccuracy /= count;
    avgTest.efficiencyScoreOutputWriteTokensByCharAccuracy /= count;
    avgTest.absOutputDurationBeforeWriteDriftPerc = Math.abs(avgTest.outputDurationBeforeWriteDriftPercMin) + avgTest.outputDurationBeforeWriteDriftPercMax;
    avgTest.absOutputDurationWriteDriftPerc = Math.abs(avgTest.outputDurationWriteDriftPercMin) + avgTest.outputDurationWriteDriftPercMax;
    avgTest.absOutputDurationTotalDriftPerc = Math.abs(avgTest.outputDurationTotalDriftPercMin) + avgTest.outputDurationTotalDriftPercMax;
    avgTest.absOutputTokensBeforeWriteDriftPerc = Math.abs(avgTest.outputTokensBeforeWriteDriftPercMin) + avgTest.outputTokensBeforeWriteDriftPercMax;
    avgTest.absOutputTokensWriteDriftPerc = Math.abs(avgTest.outputTokensWriteDriftPercMin) + avgTest.outputTokensWriteDriftPercMax;
    avgTest.absOutputTokensTotalDriftPerc = Math.abs(avgTest.outputTokensTotalDriftPercMin) + avgTest.outputTokensTotalDriftPercMax;
    avgTest.absAccuracyDriftPerc = Math.abs(avgTest.accuracyDriftPercentMin) + avgTest.accuracyDriftPercentMax;
    avgTest.absWeightedAccuracyDriftPerc = Math.abs(avgTest.weightedAccuracyDriftPercentMin) + avgTest.weightedAccuracyDriftPercentMax;
    avgTest.absAccuracyByCharDriftPerc = Math.abs(avgTest.accuracyByCharDriftPercMin) + avgTest.accuracyByCharDriftPercMax;
    
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
      item.outputTokensBeforeWriteDelta = optional.outputTokensBeforeWrite - mandatory.outputTokensBeforeWrite;
      item.outputTokensWriteDelta = optional.outputTokensWrite - mandatory.outputTokensWrite;
      item.outputTokensTotalDelta = optional.outputTokensTotal - mandatory.outputTokensTotal;
      item.totalTokensDelta = optional.totalTokens - mandatory.totalTokens;
      item.usefulReadTokensDelta = optional.usefulReadTokens - mandatory.usefulReadTokens;
      item.usefulOutputTokensDelta = optional.usefulOutputTokens - mandatory.usefulOutputTokens;
      item.usefulTotalTokensDelta = optional.usefulTotalTokens - mandatory.usefulTotalTokens;
      item.wastedReadTokensDelta = optional.wastedReadTokens - mandatory.wastedReadTokens;
      item.wastedOutputTokensDelta = optional.wastedOutputTokens - mandatory.wastedOutputTokens;
      item.wastedTotalTokensDelta = optional.wastedTotalTokens - mandatory.wastedTotalTokens;
      item.accuracyDelta = optional.accuracyPercent - mandatory.accuracyPercent;
      item.weightedAccuracyDelta = optional.weightedAccuracyPercent - mandatory.weightedAccuracyPercent;
      item.correctAnswersDelta = optional.correctAnswers - mandatory.correctAnswers;
      item.incorrectAnswersDelta = optional.incorrectAnswers - mandatory.incorrectAnswers;
      item.noAnswersDelta = optional.noAnswers - mandatory.noAnswers;
      item.efficiencyScoreReadDelta = optional.efficiencyScoreRead - mandatory.efficiencyScoreRead;
      item.efficiencyScoreOutputDelta = optional.efficiencyScoreOutput - mandatory.efficiencyScoreOutput;
      item.efficiencyScoreTotalDelta = optional.efficiencyScoreTotal - mandatory.efficiencyScoreTotal;
      item.weightedEfficiencyScoreReadDelta = optional.weightedEfficiencyScoreRead - mandatory.weightedEfficiencyScoreRead;
      item.weightedEfficiencyScoreOutputDelta = optional.weightedEfficiencyScoreOutput - mandatory.weightedEfficiencyScoreOutput;
      item.weightedEfficiencyScoreTotalDelta = optional.weightedEfficiencyScoreTotal - mandatory.weightedEfficiencyScoreTotal;
      item.charsPerReadTokenDelta = optional.charsPerReadToken - mandatory.charsPerReadToken;
      item.readTokensPerValueDelta = optional.readTokensPerValue - mandatory.readTokensPerValue;
      item.readTokensPerObjectDelta = optional.readTokensPerObject - mandatory.readTokensPerObject;
      item.informationValuePerReadTokensDelta = optional.informationValuePerReadTokens - mandatory.informationValuePerReadTokens;
      item.informationValuePerOutputTokensDelta = optional.informationValuePerOutputTokens - mandatory.informationValuePerOutputTokens;
      item.informationValuePerTotalTokensDelta = optional.informationValuePerTotalTokens - mandatory.informationValuePerTotalTokens;
      item.readDurationInMsDelta = optional.readDurationInMs - mandatory.readDurationInMs;
      item.outputDurationBeforeWriteInMsDelta = optional.outputDurationBeforeWriteInMs - mandatory.outputDurationBeforeWriteInMs;
      item.outputDurationWriteInMsDelta = optional.outputDurationWriteInMs - mandatory.outputDurationWriteInMs;
      item.outputDurationTotalInMsDelta = optional.outputDurationTotalInMs - mandatory.outputDurationTotalInMs;
      item.accuracyByCharPercDelta = optional.accuracyByCharPerc - mandatory.accuracyByCharPerc;      
      item.usefulOutputWriteTokensByCharAccuracyDelta = optional.usefulOutputWriteTokensByCharAccuracy - mandatory.usefulOutputWriteTokensByCharAccuracy;
      item.wastedOutputWriteTokensByCharAccuracyDelta = optional.wastedOutputWriteTokensByCharAccuracy - mandatory.wastedOutputWriteTokensByCharAccuracy;
      item.efficiencyScoreOutputWriteTokensByCharAccuracyDelta = optional.efficiencyScoreOutputWriteTokensByCharAccuracy - mandatory.efficiencyScoreOutputWriteTokensByCharAccuracy;
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
