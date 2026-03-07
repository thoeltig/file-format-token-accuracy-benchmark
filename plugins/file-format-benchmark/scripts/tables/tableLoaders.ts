import * as fs from 'fs';
import * as path from 'path';
import { QuestionCategory, MergedValidationReport, TestMetrics } from '../types';

// ============================================================================
// LOCAL TYPES
// ============================================================================

export type AllQuestionCategory = QuestionCategory | "multiple_steps";

export interface AggregatedMetric {
  format: string;
  variant: string;
  recordCount: number;
  readTokens: number;
  readDurationInMilliseconds: number;
  readTokensPerMillisecond: number;
  avgOutputTokens: number;
  totalTokensUsed: number;
  charsPerToken: number;
  tokensPerValue: number;
  tokensPerObject: number;
  avgAccuracyPercent: number;
  avgWeightedAccuracyPercent: number;
  informationValuePerToken: number;
  costOfInaccuracy: number;
  efficiencyScore: number;
  weightedEfficiencyScore: number;
  accuracyDelta?: number;
  weightedAccuracyDelta?: number;
  efficiencyDelta?: number;
  weightedEfficiencyDelta?: number;
  variantImpact?: number;
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

interface AnalyticsData {
  metrics: TestMetrics[];
}

// ============================================================================
// LOADERS
// ============================================================================

export function loadAnalyticsResults(jsonPath: string): AnalyticsData {
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
      totalTokensUsed: 0,
      charsPerToken: 0,
      tokensPerValue: 0,
      tokensPerObject: 0,
      avgAccuracyPercent: 0,
      avgWeightedAccuracyPercent: 0,
      informationValuePerToken: 0,
      costOfInaccuracy: 0,
      efficiencyScore: 0,
      weightedEfficiencyScore: 0,
    };

    tests.forEach(t => {
      avgTest.readTokens += t.readTokens;
      avgTest.readDurationInMilliseconds += t.readDurationInMilliseconds;
      avgTest.readTokensPerMillisecond += t.readTokensPerMillisecond;
      avgTest.avgOutputTokens += t.avgOutputTokens;
      avgTest.totalTokensUsed += t.totalTokensUsed;
      avgTest.charsPerToken += t.charsPerToken;
      avgTest.tokensPerValue += t.tokensPerValue;
      avgTest.tokensPerObject += t.tokensPerObject;
      avgTest.avgAccuracyPercent += t.avgAccuracyPercent;
      avgTest.avgWeightedAccuracyPercent += t.avgWeightedAccuracyPercent;
      avgTest.informationValuePerToken += t.informationValuePerToken;
      avgTest.costOfInaccuracy += t.costOfInaccuracy;
      avgTest.efficiencyScore += t.efficiencyScore;
      avgTest.weightedEfficiencyScore += t.weightedEfficiencyScore;
    });

    const count = tests.length;
    avgTest.readTokens /= count;
    avgTest.readDurationInMilliseconds /= count;
    avgTest.readTokensPerMillisecond /= count;
    avgTest.avgOutputTokens /= count;
    avgTest.totalTokensUsed /= count;
    avgTest.charsPerToken /= count;
    avgTest.tokensPerValue /= count;
    avgTest.tokensPerObject /= count;
    avgTest.avgAccuracyPercent /= count;
    avgTest.avgWeightedAccuracyPercent /= count;
    avgTest.informationValuePerToken /= count;
    avgTest.costOfInaccuracy /= count;
    avgTest.efficiencyScore /= count;
    avgTest.weightedEfficiencyScore /= count;

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
      item.accuracyDelta = optional.avgAccuracyPercent - mandatory.avgAccuracyPercent;
      item.weightedAccuracyDelta = optional.avgWeightedAccuracyPercent - mandatory.avgWeightedAccuracyPercent;
      item.efficiencyDelta = optional.efficiencyScore - mandatory.efficiencyScore;
      item.weightedEfficiencyDelta = optional.weightedEfficiencyScore - mandatory.weightedEfficiencyScore;
      item.variantImpact = ((optional.informationValuePerToken / mandatory.informationValuePerToken - 1) * 100);
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
