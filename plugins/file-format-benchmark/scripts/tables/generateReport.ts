#!/usr/bin/env node
/**
 * TypeScript Report Generation for Benchmark Analytics
 * Generates comprehensive structured markdown report from analytics_results.json and validation results
 *
 * Template-based report with placeholders for analysis sections
 * Output: Single markdown document ready for publication with manual content additions
 *
 * Usage: node dist/tables/generateReport.js --output-folder /path/to/benchmark
 *
 * Expected folder structure:
 *   /path/to/benchmark/
 *   ├── analytics_results.json
 *   ├── metrics.json
 *   ├── results/
 *   └── BENCHMARK_REPORT.md (output)
 *
 * Report Sections:
 *   - 2.1: Comprehensive Benchmark Metrics
 *   - 2.2: Token Efficiency Analysis
 *   - 2.3: Accuracy Analysis
 *   - 2.4: Format Robustness (Mandatory vs Optional)
 *   - 2.5: Performance Metrics (Duration & Speed)
 *   - 2.6: Structural Efficiency (Tokens/Value, Tokens/Object)
 *   - 2.7: Answer Quality Breakdown
 *   - 2.8: Token Utilization Efficiency
 *   - 2.9: Category Performance Analysis
 *   - Appendix B: Detailed Performance Data
 *   - Appendix C: Test Infrastructure
 *   - Appendix D: Benchmark Configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import { loadAnalyticsResults, aggregateMetrics, loadValidationResults, AggregatedMetric, ValidationSummary } from './tableLoaders';
import { AnalyticsOutput, QuestionCategory } from '../types';

interface ReportConfig {
  benchmarkFolder: string;
}

// ============================================================================
// CLI PARSING
// ============================================================================

function parseArgs(args: string[]): ReportConfig {
  let benchmarkFolder = process.cwd();

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--output-folder' || args[i] === '--folder') && args[i + 1]) {
      benchmarkFolder = args[++i];
    }
  }

  return { benchmarkFolder };
}

// ============================================================================
// METADATA EXTRACTION
// ============================================================================

interface Metadata {
  generatedAt: string;
  model: string,
  thinking: string;
  structure: string;
  formats: string[];
  variants: string[];
  recordCounts: number[];
  questionDistribution: [QuestionCategory, number][];
  questionWeightDistribution: [QuestionCategory, number][];
};

function extractMetadata(analyticsData: AnalyticsOutput): Metadata {
  return {
    generatedAt: new Date().toISOString(),
    model: 'Claude Haiku 4.5',
    thinking: 'off',
    structure: 'flat',
    formats: analyticsData.testConfigurations.formats || [],
    variants: analyticsData.testConfigurations.variants || [],
    recordCounts: analyticsData.testConfigurations.recordCounts || [],
    questionDistribution: analyticsData.testConfigurations.questionDistribution || [],
    questionWeightDistribution: analyticsData.testConfigurations.questionWeightDistribution || [],
  };
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

class ReportGenerator {
  private content: string[] = [];
  private aggregated: AggregatedMetric[];
  private validations: ValidationSummary[];
  private uniqueFormats: string[];
  private recordCounts: number[];
  private metadata: Metadata;

  constructor(
    aggregated: AggregatedMetric[],
    validations: ValidationSummary[],
    metadata: Metadata
  ) {
    this.aggregated = aggregated;
    this.validations = validations;
    this.metadata = metadata;
    this.uniqueFormats = metadata.formats.sort();
    this.recordCounts = metadata.recordCounts.sort((a, b) => b - a);
  }

  private line(text: string = ''): void {
    this.content.push(text);
  }
  
  private heading(level: number, text: string): void {
    this.line('#'.repeat(level) + ' ' + text);
  }

  private hr(): void {
    this.line('---\n');
  }

  private table(headers: string[], rows: string[][]): void {
    this.line('| ' + headers.join(' | ') + ' |');
    this.line('|' + headers.map(() => '---|').join(''));
    rows.forEach(row => {
      this.line('| ' + row.join(' | ') + ' |');
    });
    this.line();
  }

  generate(): string {
    this.generateTitleAndMetadata();
    this.generateExecutiveSummary();
    this.generateMethodology();
    this.generateResults();
    this.generateFormatAnalysis();
    this.generateConclusions();
    this.generateAppendices();

    return this.content.join('\n');
  }

  private generateTitleAndMetadata(): void {
    this.heading(1, 'File Format Token Efficiency Benchmark: Comprehensive Report');
    this.line(`**Date**: ${new Date(this.metadata.generatedAt).toISOString().split('T')[0]}`);
    this.line(`- **Model**: ${this.metadata.model}`);
    this.line(`- **Extended Thinking**: ${this.metadata.thinking}`);
    this.line(`- **Data Structure**: ${this.metadata.structure}`);
    this.line(`- **Formats Tested**: ${this.uniqueFormats.length} (${this.uniqueFormats.map(f => f.toUpperCase()).join(', ')})`);
    this.line(`- **Record Counts**: ${this.recordCounts.join(', ')}`);
    this.line(`- **Status**: First iteration\n`);
    this.hr();
  }

  private generateExecutiveSummary(): void {
    this.heading(2, 'Executive Summary');
    this.line(
      'This benchmark evaluates token efficiency and information accuracy across ' +
      this.uniqueFormats.length + ' file formats using ' + this.metadata.model +
      ' as the inference model. The research addresses a critical but underexplored problem: **not all tokens are equally useful**. ' +
      'A format that uses fewer tokens but produces inaccurate results wastes both tokens and context, while a format that accurately conveys information may justify higher token cost.'
    );
    this.line();

    this.heading(3, 'Key Findings');
    this.line();
    this.line('<ADD_CONTENT_HERE: Insert 5-7 key findings from analysis>');
    this.line();
    this.line('1. Finding 1');
    this.line();
    this.line('2. Finding 2');
    this.line();
    this.line('3. Finding 3');
    this.line();
    this.line('4. Finding 4');
    this.line();
    this.line('5. Finding 5');
    this.line();
    this.hr();
  }

  private generateMethodology(): void {
    this.heading(2, '1. Methodology');
    this.line();

    this.heading(3, '1.1 Research Purpose');
    this.line();
    this.line('The underlying question: **Which file format delivers maximum information value per token consumed?**');
    this.line();
    this.line('This requires measuring:');
    this.line('- **Token Cost**: How many tokens does each format consume for equivalent data?');
    this.line('- **Information Fidelity**: How accurately can the model understand and answer questions about the data?');
    this.line('- **Robustness**: How consistent is performance across data variants (mandatory vs optional fields)?');
    this.line();

    this.heading(3, '1.2 Test Design');
    this.line();
    this.line('**Data Generation:**');
    this.line(`- ${this.uniqueFormats.length} formats tested: ${this.uniqueFormats.map(f => f.toUpperCase()).join(', ')}`);
    this.line('- 2 variants per format: mandatory (22 fields, dense) and optional (19 mandatory + 3 optional, sparse)');
    this.line(`- Record Counts: ${this.recordCounts.join(', ')}`);
    this.line();

    if (this.metadata.questionDistribution && this.metadata.questionDistribution.length > 0) {
      this.line('**Question Distribution:**');
      this.line(`- ${this.metadata.questionDistribution.length} question categories reflecting practical use cases:`);

      let fieledRetrivalAndStructureAwareness = 0;
      let filteringAndAggregation = 0;
      this.metadata.questionDistribution.forEach((q: any) => {
        const weight = this.metadata.questionWeightDistribution.find((w: any) => w[0] === q[0]);
        const weightPerc = weight ? (weight[1] * 100) : 0;

        let questionCategoryDescription = '';

        switch (q[0]) {
          case "field_retrieval":
            questionCategoryDescription = 'Extract specific values from specific records';
            fieledRetrivalAndStructureAwareness += weightPerc;
            break;
          case "structure_awareness":
            questionCategoryDescription = 'Understand data shape, organization, metadata';
            fieledRetrivalAndStructureAwareness += weightPerc;
            break;
          case "filtering":
            questionCategoryDescription = 'Count records matching criteria';
            filteringAndAggregation += weightPerc;
            break;
          case "aggregation":
            questionCategoryDescription = 'Sum, average, min/max calculations';
            filteringAndAggregation += weightPerc;
            break;
        }

        this.line(`   - **${this.getQuestionCategoryLabel(q[0])} (${q[1]} questions, ${weightPerc.toFixed(2)}% weight):** ${questionCategoryDescription}`);
      });
      this.line();
      
      this.line('**Weighting Rationale:**');
      this.line(`- Field retrieval + structure awareness = ${fieledRetrivalAndStructureAwareness.toFixed(2)}%`);
      this.line(`   - These represent the file format itself. Understanding "what data exists and how it's organized" which is fundamental to avoiding context confusion.`);
      this.line(`- Filtering + aggregation = ${filteringAndAggregation.toFixed(2)}%`);
      this.line(`   - These represent more the "intellactual" aspect of the model and will differ greatly depending on the model. Also if done deterministic the model still needs to do field retrival and structure awarness on the result.`);
      this.line();
    }
    
    this.heading(3, '1.3 Metrics Definition');
    this.line();
    this.line('**Token Metrics:**');
    this.line('- `readTokens`: Tokens consumed reading the data file');
    this.line('- `outputTokens`: Tokens consumed during inference (answering questions + creating the file content)');
    this.line('- `totalTokens`: readTokens + outputTokens');
    this.line();
    this.line('**Accuracy Metrics:**');
    this.line('- `rawAccuracy`: Correct answers / total questions');
    this.line('- `weightedAccuracy`: Accuracy weighted by question category importanc');
    this.line();
    this.line('**Information Value Metrics:**');
    this.line('- `informationValuePerToken`: (accuracy% / totalTokens) × 100');
    this.line('- `costOfInaccuracy`: totalTokens × (1 - accuracy% / 100) — tokens wasted on inaccurate output');
    this.line();
    this.line('**Efficiency Score:**');
    this.line('- Composite metric balancing accuracy with normalized token cost (favour towards accuracy)')
    this.line('- normalizedTokenCost = (((maxTotalTokens+10)-currenTotalTokens)/((maxTotalTokens+10)-(minTotalTokens-10)))*100')
    this.line('- `efficiencyScore`: (accuracy% x 0.3) + (normalizedTokenCost * 0.3)');
    this.line('- `weightedEfficiencyScore`: (weightedAccuracy% x 0.3) + (normalizedTokenCost * 0.3)');
    this.line();
    this.hr();
  }

  private generateSummaryTLDRFormatRanking(sortedAggregated: AggregatedMetric[]){
    const optionals = sortedAggregated.filter(x => x.variant == 'optional');
    const mandatories = sortedAggregated.filter(x => x.variant == 'mandatory');

    const optionalLowestTokenCost = optionals.reduce((min, a) => a.totalTokensUsed < min.totalTokensUsed ? a : min);
    const mandatoryLowestTokenCost = mandatories.reduce((min, a) => a.totalTokensUsed < min.totalTokensUsed ? a : min);

    const optionalLowestOutputTokensDriftPerc = optionals.reduce((min, a) => a.absOutputTokensDriftPerc < min.absOutputTokensDriftPerc ? a : min);
    const mandatoryLowestOutputTokensDriftPerc = mandatories.reduce((min, a) => a.absOutputTokensDriftPerc < min.absOutputTokensDriftPerc ? a : min);
        
    const optionalHighestAccuracy = optionals.reduce((max, a) => a.avgAccuracyPercent > max.avgAccuracyPercent ? a : max);
    const mandatoryHighestAccuracy = mandatories.reduce((max, a) => a.avgAccuracyPercent > max.avgAccuracyPercent ? a : max);
    
    const optionalLowestAccuracyDriftPerc = optionals.reduce((min, a) => a.absAccuracyDriftPerc < min.absAccuracyDriftPerc ? a : min);
    const mandatoryLowestAccuracyDriftPerc = mandatories.reduce((min, a) => a.absAccuracyDriftPerc < min.absAccuracyDriftPerc ? a : min);

    const optionalMostUsedTokens = optionals.reduce((max, a) => a.efficientlyUsedTokens > max.efficientlyUsedTokens ? a : max);
    const mandatoryMostUsedTokens = mandatories.reduce((max, a) => a.efficientlyUsedTokens > max.efficientlyUsedTokens ? a : max);
    
    const optionalHighestTokenEfficiency = optionals.reduce((max, a) => a.efficiencyScore > max.efficiencyScore ? a : max);
    const mandatoryHighestTokenEfficiency = mandatories.reduce((max, a) => a.efficiencyScore > max.efficiencyScore ? a : max);
        
    const lowestTotalTokensDelta = sortedAggregated.reduce((min, a) => Math.abs(a.totalTokensDelta) < Math.abs(min.totalTokensDelta) ? a : min);
    const lowestAccuracyDelta = sortedAggregated.reduce((min, a) => Math.abs(a.accuracyDelta) < Math.abs(min.accuracyDelta) ? a : min);
    const lowestEfficiencyDelta = sortedAggregated.reduce((min, a) => Math.abs(a.efficiencyDelta) < Math.abs(min.efficiencyDelta) ? a : min);
    
    this.heading(3, '2.1 TLDR: Token Efficiency Analysis');
    this.line();
    this.heading(4, '2.1.1 Best results');
    this.line();
    this.line('- Lowest total token cost:');
    this.line(`   - Optional: ${optionalLowestTokenCost.format.toUpperCase()} ${Math.round(optionalLowestTokenCost.totalTokensUsed)} tokens`);
    this.line(`   - Mandatory: ${mandatoryLowestTokenCost.format.toUpperCase()} ${Math.round(mandatoryLowestTokenCost.totalTokensUsed)} tokens`);
    this.line('- Lowest output token cost drift:');
    this.line(`   - Optional: ${optionalLowestOutputTokensDriftPerc.format.toUpperCase()} ↓ ${optionalLowestOutputTokensDriftPerc.minOutputTokensDriftPerc.toFixed(2)} % ↑ ${optionalLowestOutputTokensDriftPerc.maxOutputTokensDriftPerc.toFixed(2)} %`);
    this.line(`   - Mandatory: ${mandatoryLowestOutputTokensDriftPerc.format.toUpperCase()} ↓ ${mandatoryLowestOutputTokensDriftPerc.minOutputTokensDriftPerc.toFixed(2)} % ↑ ${mandatoryLowestOutputTokensDriftPerc.maxOutputTokensDriftPerc.toFixed(2)} %`);
    this.line('- Highest accuracy:');
    this.line(`   - Optional: ${optionalHighestAccuracy.format.toUpperCase()} ${optionalHighestAccuracy.avgAccuracyPercent.toFixed(2)} %`);
    this.line(`   - Mandatory: ${mandatoryHighestAccuracy.format.toUpperCase()} ${mandatoryHighestAccuracy.avgAccuracyPercent.toFixed(2)} %`);
    this.line('- Lowest accuracy drift:');
    this.line(`   - Optional: ${optionalLowestAccuracyDriftPerc.format.toUpperCase()} ↓ ${optionalLowestAccuracyDriftPerc.minAccuracyDriftPercent.toFixed(2)} % ↑ ${optionalLowestAccuracyDriftPerc.maxAccuracyDriftPercent.toFixed(2)} %`);
    this.line(`   - Mandatory: ${mandatoryLowestAccuracyDriftPerc.format.toUpperCase()} ↓ ${mandatoryLowestAccuracyDriftPerc.minAccuracyDriftPercent.toFixed(2)} % ↑ ${mandatoryLowestAccuracyDriftPerc.maxAccuracyDriftPercent.toFixed(2)} %`);
    this.line('- Most useful tokens:');    
    this.line(`   - Optional: ${optionalMostUsedTokens.format.toUpperCase()} ${Math.round(optionalMostUsedTokens.efficientlyUsedTokens)} / ${Math.round(optionalMostUsedTokens.totalTokensUsed)} tokens`);
    this.line(`   - Mandatory: ${mandatoryMostUsedTokens.format.toUpperCase()} ${Math.round(mandatoryMostUsedTokens.efficientlyUsedTokens)} / ${Math.round(mandatoryMostUsedTokens.totalTokensUsed)} tokens`);
    this.line('- Highest token efficiency (%/token):');
    this.line(`   - Optional: ${optionalHighestTokenEfficiency.format.toUpperCase()} ${optionalHighestTokenEfficiency.efficiencyScore.toFixed(2)}`);
    this.line(`   - Mandatory: ${mandatoryHighestTokenEfficiency.format.toUpperCase()} ${mandatoryHighestTokenEfficiency.efficiencyScore.toFixed(2)}`);
    this.line('- Lowest delta (optional-mandatory):');
    this.line(`   - Total tokens: ${lowestTotalTokensDelta.format.toUpperCase()} ${Math.round(lowestTotalTokensDelta.totalTokensDelta)} tokens`);
    this.line(`   - Accuracy: ${lowestAccuracyDelta.format.toUpperCase()} ${lowestAccuracyDelta.accuracyDelta.toFixed(2)} %`);
    this.line(`   - Token efficiency: ${lowestEfficiencyDelta.format.toUpperCase()} ${lowestEfficiencyDelta.efficiencyDelta.toFixed(2)}`);
    this.line();

    const optionalHighestTokenCost = optionals.reduce((max, a) => a.totalTokensUsed > max.totalTokensUsed ? a : max);
    const mandatoryHighestTokenCost = mandatories.reduce((max, a) => a.totalTokensUsed > max.totalTokensUsed ? a : max);
    
    const optionalHighestOutputTokensDriftPerc = optionals.reduce((max, a) => a.absOutputTokensDriftPerc > max.absOutputTokensDriftPerc ? a : max);
    const mandatoryHighestOutputTokensDriftPerc = mandatories.reduce((max, a) => a.absOutputTokensDriftPerc > max.absOutputTokensDriftPerc ? a : max);
    
    const optionalLowestAccuracy = optionals.reduce((min, a) => a.avgAccuracyPercent < min.avgAccuracyPercent ? a : min);
    const mandatoryLowestAccuracy = mandatories.reduce((min, a) => a.avgAccuracyPercent < min.avgAccuracyPercent ? a : min);
    
    const optionalHighestAccuracyDriftPerc = optionals.reduce((max, a) => a.absAccuracyDriftPerc > max.absAccuracyDriftPerc ? a : max);
    const mandatoryHighestAccuracyDriftPerc = mandatories.reduce((max, a) => a.absAccuracyDriftPerc > max.absAccuracyDriftPerc ? a : max);
    
    const optionaMostWastedTokens = optionals.reduce((max, a) => a.costOfInaccuracy > max.costOfInaccuracy ? a : max);
    const mandatoryMostWastedTokens = mandatories.reduce((max, a) => a.costOfInaccuracy > max.costOfInaccuracy ? a : max);

    const optionalLowestTokenEfficiency = optionals.reduce((min, a) => a.efficiencyScore < min.efficiencyScore ? a : min);
    const mandatoryLowestTokenEfficiency = mandatories.reduce((min, a) => a.efficiencyScore < min.efficiencyScore ? a : min);

    const highestTotalTokensDelta = sortedAggregated.reduce((max, a) => Math.abs(a.totalTokensDelta) > Math.abs(max.totalTokensDelta) ? a : max);
    const highestAccuracyDelta = sortedAggregated.reduce((max, a) => Math.abs(a.accuracyDelta) > Math.abs(max.accuracyDelta) ? a : max);
    const highestEfficiencyDelta = sortedAggregated.reduce((max, a) => Math.abs(a.efficiencyDelta) > Math.abs(max.efficiencyDelta) ? a : max);

    this.heading(4, '2.1.2 Worst results');
    this.line();
    this.line('- Highest total token cost:');
    this.line(`   - Optional: ${optionalHighestTokenCost.format.toUpperCase()} ${Math.round(optionalHighestTokenCost.totalTokensUsed)} tokens`);
    this.line(`   - Mandatory: ${mandatoryHighestTokenCost.format.toUpperCase()} ${Math.round(mandatoryHighestTokenCost.totalTokensUsed)} tokens`);
    this.line('- Highest output token drift:');
    this.line(`   - Optional: ${optionalHighestOutputTokensDriftPerc.format.toUpperCase()} ↓ ${optionalHighestOutputTokensDriftPerc.minOutputTokensDriftPerc.toFixed(2)} % ↑ ${optionalHighestOutputTokensDriftPerc.maxOutputTokensDriftPerc.toFixed(2)} %`);
    this.line(`   - Mandatory: ${mandatoryHighestOutputTokensDriftPerc.format.toUpperCase()} ↓ ${mandatoryHighestOutputTokensDriftPerc.minOutputTokensDriftPerc.toFixed(2)} % ↑ ${mandatoryHighestOutputTokensDriftPerc.maxOutputTokensDriftPerc.toFixed(2)} %`);
    this.line('- Lowest accuracy:');
    this.line(`   - Optional: ${optionalLowestAccuracy.format.toUpperCase()} ${optionalLowestAccuracy.avgAccuracyPercent.toFixed(2)} %`);
    this.line(`   - Mandatory: ${mandatoryLowestAccuracy.format.toUpperCase()} ${mandatoryLowestAccuracy.avgAccuracyPercent.toFixed(2)} %`);
    this.line('- Highest accuracy drift:');
    this.line(`   - Optional: ${optionalHighestAccuracyDriftPerc.format.toUpperCase()} ↓ ${optionalHighestAccuracyDriftPerc.minAccuracyDriftPercent.toFixed(2)} % ↑ ${optionalHighestAccuracyDriftPerc.maxAccuracyDriftPercent.toFixed(2)} %`);
    this.line(`   - Mandatory: ${mandatoryHighestAccuracyDriftPerc.format.toUpperCase()} ↓ ${mandatoryHighestAccuracyDriftPerc.minAccuracyDriftPercent.toFixed(2)} % ↑ ${mandatoryHighestAccuracyDriftPerc.maxAccuracyDriftPercent.toFixed(2)} %`);
    this.line('- Most wasted tokens:');    
    this.line(`   - Optional: ${optionaMostWastedTokens.format.toUpperCase()} ${Math.round(optionaMostWastedTokens.costOfInaccuracy)} / ${Math.round(optionaMostWastedTokens.totalTokensUsed)} tokens`);
    this.line(`   - Mandatory: ${mandatoryMostWastedTokens.format.toUpperCase()} ${Math.round(mandatoryMostWastedTokens.costOfInaccuracy)} / ${Math.round(mandatoryMostWastedTokens.totalTokensUsed)} tokens`);
    this.line('- Lowest token efficiency (%/token):');
    this.line(`   - Optional: ${optionalLowestTokenEfficiency.format.toUpperCase()} ${optionalLowestTokenEfficiency.efficiencyScore.toFixed(2)}`);
    this.line(`   - Mandatory: ${mandatoryLowestTokenEfficiency.format.toUpperCase()} ${mandatoryLowestTokenEfficiency.efficiencyScore.toFixed(2)}`);
    this.line('- Highest delta (optional-mandatory):');
    this.line(`   - Total tokens: ${highestTotalTokensDelta.format.toUpperCase()} ${Math.round(highestTotalTokensDelta.totalTokensDelta)} tokens`);
    this.line(`   - Accuracy: ${highestAccuracyDelta.format.toUpperCase()} ${highestAccuracyDelta.accuracyDelta.toFixed(2)} %`);
    this.line(`   - Token efficiency: ${highestEfficiencyDelta.format.toUpperCase()} ${highestEfficiencyDelta.efficiencyDelta.toFixed(2)}`);
    this.line();

    const sortedByTotalTokensOptionals = [...optionals].sort((ob1, ob2) => ob1.totalTokensUsed > ob2.totalTokensUsed ? 1 : ob1.totalTokensUsed < ob2.totalTokensUsed ? -1 : 0).map(x => x.format);
    const sortedByTotalTokensMandatories = [...mandatories].sort((ob1, ob2) => ob1.totalTokensUsed > ob2.totalTokensUsed ? 1 : ob1.totalTokensUsed < ob2.totalTokensUsed ? -1 : 0).map(x => x.format);
    const sortedByEfficientlyUsedTokensOptionals = [...optionals].sort((ob1, ob2) => ob1.efficientlyUsedTokens < ob2.efficientlyUsedTokens ? 1 : ob1.efficientlyUsedTokens > ob2.efficientlyUsedTokens ? -1 : 0).map(x => x.format);
    const sortedByEfficientlyUsedTokensMandatories = [...mandatories].sort((ob1, ob2) => ob1.efficientlyUsedTokens < ob2.efficientlyUsedTokens ? 1 : ob1.efficientlyUsedTokens > ob2.efficientlyUsedTokens ? -1 : 0).map(x => x.format);
    const sortedByCostOfInaccuracyOptionals = [...optionals].sort((ob1, ob2) => ob1.costOfInaccuracy > ob2.costOfInaccuracy ? 1 : ob1.costOfInaccuracy < ob2.costOfInaccuracy ? -1 : 0).map(x => x.format);
    const sortedByCostOfInaccuracyMandatories = [...mandatories].sort((ob1, ob2) => ob1.costOfInaccuracy > ob2.costOfInaccuracy ? 1 : ob1.costOfInaccuracy < ob2.costOfInaccuracy ? -1 : 0).map(x => x.format);
    const sortedByAccuracyOptionals = [...optionals].sort((ob1, ob2) => ob1.avgAccuracyPercent < ob2.avgAccuracyPercent ? 1 : ob1.avgAccuracyPercent > ob2.avgAccuracyPercent ? -1 : 0).map(x => x.format);
    const sortedByAccuracyMandatories = [...mandatories].sort((ob1, ob2) => ob1.avgAccuracyPercent < ob2.avgAccuracyPercent ? 1 : ob1.avgAccuracyPercent > ob2.avgAccuracyPercent ? -1 : 0).map(x => x.format);
    const sortedByWeightedAccuracyOptionals = [...optionals].sort((ob1, ob2) => ob1.avgWeightedAccuracyPercent < ob2.avgWeightedAccuracyPercent ? 1 : ob1.avgWeightedAccuracyPercent > ob2.avgWeightedAccuracyPercent ? -1 : 0).map(x => x.format);
    const sortedByWeightedAccuracyMandatories = [...mandatories].sort((ob1, ob2) => ob1.avgWeightedAccuracyPercent < ob2.avgWeightedAccuracyPercent ? 1 : ob1.avgWeightedAccuracyPercent > ob2.avgWeightedAccuracyPercent ? -1 : 0).map(x => x.format);
    const sortedByEfficiencyScoreOptionals = [...optionals].sort((ob1, ob2) => ob1.efficiencyScore < ob2.efficiencyScore ? 1 : ob1.efficiencyScore > ob2.efficiencyScore ? -1 : 0).map(x => x.format);
    const sortedByEfficiencyScoreMandatories = [...mandatories].sort((ob1, ob2) => ob1.efficiencyScore < ob2.efficiencyScore ? 1 : ob1.efficiencyScore > ob2.efficiencyScore ? -1 : 0).map(x => x.format);
    const sortedByWeightedEfficiencyScoreOptionals = [...optionals].sort((ob1, ob2) => ob1.weightedEfficiencyScore < ob2.weightedEfficiencyScore ? 1 : ob1.weightedEfficiencyScore > ob2.weightedEfficiencyScore ? -1 : 0).map(x => x.format);
    const sortedByWeightedEfficiencyScoreMandatories = [...mandatories].sort((ob1, ob2) => ob1.weightedEfficiencyScore < ob2.weightedEfficiencyScore ? 1 : ob1.weightedEfficiencyScore > ob2.weightedEfficiencyScore ? -1 : 0).map(x => x.format);

    const rows = mandatories.map((_, i) => [
      sortedByTotalTokensOptionals[i],
      sortedByTotalTokensMandatories[i],
      sortedByEfficientlyUsedTokensOptionals[i],
      sortedByEfficientlyUsedTokensMandatories[i],
      sortedByCostOfInaccuracyOptionals[i],
      sortedByCostOfInaccuracyMandatories[i],
      sortedByAccuracyOptionals[i],
      sortedByAccuracyMandatories[i],
      sortedByWeightedAccuracyOptionals[i],
      sortedByWeightedAccuracyMandatories[i],
      sortedByEfficiencyScoreOptionals[i],
      sortedByEfficiencyScoreMandatories[i],
      sortedByWeightedEfficiencyScoreOptionals[i],
      sortedByWeightedEfficiencyScoreMandatories[i],
    ]);

    this.heading(4, '2.1.3 Format Ranking');
    this.line();
    this.table(
      ['↑ Total Opt', '↑ Total Man', '↓ Used Tokens Opt', '↓ Used Tokens Man', '↑ Wasted Tokens Opt', '↑ Wasted Tokens Man', '↓ Acc (%) Opt', '↓ Acc (%) Man', '↓ Wtd Acc (%) Opt', '↓ Wtd Acc (%) Man', '↓ Eff Score Opt', '↓ Eff Score Man', '↓ Wtd Eff Score Opt', '↓ Wtd Eff Score Man'],
      rows
    );
    this.line();

    this.heading(4, '2.1.4 Conclussion');
    this.line();
    this.line('<ADD_CONTENT_HERE>Analyze token usage patterns here</ADD_CONTENT_HERE>');
    this.line();
  }

  private generateResults(): void {
    this.heading(2, '2. Results');
    this.line();

    // Sort by format then variant (alphabetically)
    const sortedAggregated = [...this.aggregated].sort((ob1, ob2) =>{
        if (ob1.format > ob2.format) {
          return 1;
        } else if (ob1.format < ob2.format) { 
            return -1;
        }

        if (ob1.variant < ob2.variant) { 
            return -1;
        } else if (ob1.variant > ob2.variant) {
            return 1
        } else {
            return 0;
        }
      }
    );
    const mandatories = sortedAggregated.filter(x => x.variant == 'mandatory');
    
    // 2.1 Token Efficiency Analysis
    this.generateSummaryTLDRFormatRanking(sortedAggregated);

    // 2.2 Comprehensive Benchmark Metrics
    const rows = sortedAggregated.map(item => [
      item.format.toUpperCase(),
      item.variant.substring(0, 3),
      Math.round(item.readTokens).toString(),
      Math.round(item.avgOutputTokens).toString(),
      Math.round(item.totalTokensUsed).toString(),
      item.charsPerToken.toFixed(3),
      item.informationValuePerToken.toFixed(3),
      item.avgOutputTokensPerAnswer.toFixed(3),
      item.avgAccuracyPercent.toFixed(2),
      item.weightedEfficiencyScore.toFixed(2),
      item.efficientlyUsedTokens.toFixed(3),
      item.costOfInaccuracy.toFixed(3),
      item.efficiencyScore.toFixed(2),
      item.weightedEfficiencyScore.toFixed(2),
    ]);

    this.heading(3, '2.2 Comprehensive Benchmark Metrics');
    this.table(
      ['Format', 'Variant', 'Read Tokens', 'Output Tokens', 'Total', 'Tokens/Char', 'Info/Token', 'Token/Answer', 'Acc (%)', 'Wtd Acc (%)', 'Used Tokens', 'Wasted Tokens', 'Eff Score', 'Wtd Eff Score'],
      rows
    );

    // 2.3 Format Robustness: Mandatory vs Optional
    const mandOptFormatDeltaRows = mandatories.map(x =>{    
      const mandTotalTokensUsed = Math.round(x.totalTokensUsed);
      const tokenDiff = Math.round(x.totalTokensDelta);  
      const optTotalTokensUsed = mandTotalTokensUsed + tokenDiff;
      return [
        x.format.toUpperCase(),
        mandTotalTokensUsed.toString(),
        optTotalTokensUsed.toString(),
        tokenDiff.toString(),
        ((tokenDiff / mandTotalTokensUsed) * 100).toFixed(2),
        x.avgAccuracyPercent.toFixed(2),
        (x.avgAccuracyPercent + x.accuracyDelta).toFixed(2),
        x.accuracyDelta.toFixed(2),
        x.avgWeightedAccuracyPercent.toFixed(2),
        (x.avgWeightedAccuracyPercent + x.weightedAccuracyDelta).toFixed(2),
        x.weightedAccuracyDelta.toFixed(2),
        x.efficiencyScore.toFixed(2),
        (x.efficiencyScore + x.efficiencyDelta).toFixed(2),
        x.efficiencyDelta.toFixed(2),
        x.weightedEfficiencyScore.toFixed(2),
        (x.weightedEfficiencyScore + x.weightedEfficiencyDelta).toFixed(2),
        x.weightedEfficiencyDelta.toFixed(2),
      ];
    });
    
    this.heading(3, '2.3 Format Robustness: Mandatory vs Optional');
    this.table(
      ['Format', 'Tokens Man', 'Tokens Opt', 'Diff', 'Diff (%)', 'Acc Man (%)', 'Acc Opt (%)', 'Diff (%)', 'Wtd Acc Man (%)', 'Wtd Acc Opt (%)', 'Diff (%)', 'Eff Man (%)', 'Eff Opt (%)', 'Diff (%)'],
      mandOptFormatDeltaRows
    );

    // 2.4 Performance
    // 2.4.1 Duration & Speed
    const readPerfRows = sortedAggregated.map(item => {
      const totalDurationInMilliseconds = item.readDurationInMilliseconds+item.avgReasoningDurationInMilliseconds;
      const totalTokensPerMillisecond = item.readTokensPerMillisecond+item.avgReasoningTokensPerMillisecond;
      return [
        item.format.toUpperCase(),
        item.variant.substring(0, 3),
        Math.round(item.readDurationInMilliseconds).toString(),
        item.readTokensPerMillisecond.toFixed(3),
        (item.readDurationInMilliseconds / item.recordCount).toFixed(2),
        Math.round(item.avgReasoningDurationInMilliseconds).toString(),
        item.avgReasoningTokensPerMillisecond.toFixed(3),
        (item.avgReasoningDurationInMilliseconds / item.totalQuestions).toFixed(2),
        Math.round(totalDurationInMilliseconds).toString(),
        totalTokensPerMillisecond.toFixed(3),
        (totalDurationInMilliseconds / (item.recordCount + item.totalQuestions)).toFixed(2),
      ];
    });
    
    this.heading(3, '2.4 Performance');
    this.heading(4, '2.4.1 Metrics');
    this.table(
      ['Format', 'Variant', 'Read (ms)', 'Read (tokens/ms)', 'Rate (ms/record)', 'Output (ms)', 'Output (tokens/ms)', 'Rate (ms/question)', 'Total (ms)', 'Total (tokens/ms)', 'Rate (ms/record+question)'],
      readPerfRows
    );
    
    // 2.4.2 Performance: Mandatory vs Optional Data
    const mandOptSpeedDeltaRows = mandatories.map(x =>{    
      const manReadDuration = x.readDurationInMilliseconds;
      const readDurationDelta = x.readDurationInMillisecondsDelta;
      const manOutputDuration = x.avgReasoningDurationInMilliseconds / 1000;
      const outputDurationDelta = x.outputDurationInMillisecondsDelta / 1000;
      const manTotalDuration = manReadDuration / 1000 + manOutputDuration;
      const totalDurationDelta = x.totalDurationInMillisecondsDelta / 1000;
      return [
        x.format.toUpperCase(),
        manReadDuration.toString(),
        (manReadDuration + readDurationDelta).toString(),
        readDurationDelta.toString(),
        ((readDurationDelta / manReadDuration) * 100).toFixed(2),
        manOutputDuration.toFixed(2),
        (manOutputDuration + outputDurationDelta).toFixed(2),
        outputDurationDelta.toFixed(2),
        ((outputDurationDelta / manOutputDuration) * 100).toFixed(2),
        manTotalDuration.toFixed(2),
        (manTotalDuration + totalDurationDelta).toFixed(2),
        totalDurationDelta.toFixed(2),
        ((totalDurationDelta / manTotalDuration) * 100).toFixed(2),
      ];
    });
    
    this.heading(4, '2.4.2 Mandatory vs Optional');
    this.table(
      ['Format', 'Read Man (ms)', 'Read Opt (ms)', 'Diff (ms)', 'Diff (%)', 'Output Man (s)', 'Output Opt (s)', 'Diff (s)', 'Diff (%)', 'Total Man (s)', 'Total Opt (s)', 'Diff (s)', 'Diff (%)'],
      mandOptSpeedDeltaRows
    );

    // 2.5.1 Structural Efficiency Metrics
    const structRows = sortedAggregated.map(item => [
      item.format.toUpperCase(),
      item.variant.substring(0, 3),
      item.charsPerToken.toFixed(3),
      item.tokensPerValue.toFixed(3),
      item.tokensPerObject.toFixed(3),
      item.informationValuePerToken.toFixed(3)
    ]);
    
    this.heading(3, '2.5 Structural Efficiency');
    this.heading(4, '2.5.1 Metrics');
    this.table(
      ['Format', 'Variant', 'Char/Token', 'Token/Value', 'Token/Object', 'Info/Token'],
      structRows
    );

    // 2.5.2 Structural Efficiency: Mandatory vs Optional Data
    const mandOptStructuralDeltaRows = mandatories.map(x =>{    
      return [
        x.format.toUpperCase(),
        x.charsPerToken.toFixed(3),
        (x.charsPerToken + x.charsPerTokenDelta).toFixed(3),
        x.charsPerTokenDelta.toFixed(3),
        ((x.charsPerTokenDelta / x.charsPerToken) * 100).toFixed(2),
        x.tokensPerValue.toFixed(3),
        (x.tokensPerValue + x.tokensPerValueDelta).toFixed(3),
        x.tokensPerValueDelta.toFixed(3),
        ((x.tokensPerValueDelta / x.tokensPerValue) * 100).toFixed(2),
        x.tokensPerObject.toFixed(3),
        (x.tokensPerObject + x.tokensPerObjectDelta).toFixed(3),
        x.tokensPerObjectDelta.toFixed(3),
        ((x.tokensPerObjectDelta / x.tokensPerObject) * 100).toFixed(2),
        x.informationValuePerToken.toFixed(3),
        (x.informationValuePerToken + x.informationValuePerTokenDelta).toFixed(3),
        x.informationValuePerTokenDelta.toFixed(3),
        ((x.informationValuePerTokenDelta / x.informationValuePerToken) * 100).toFixed(2),
      ];
    });
    
    this.heading(4, '2.5.2 Mandatory vs Optional');
    this.table(
      ['Format', 'Char/Token Man', 'Char/Token Opt', 'Diff', 'Diff (%)', 'Token/Value Man', 'Token/Value Opt', 'Diff', 'Diff (%)', 'Token/Object Man', 'Token/Object Opt', 'Diff', 'Diff (%)', 'Info/Token Man', 'Info/Token Opt', 'Diff', 'Diff (%)'],
      mandOptStructuralDeltaRows
    );

    // 2.6 Answer Quality Breakdown
    const answerQualityRows = sortedAggregated.map(item => [
      item.format.toUpperCase(),
      item.variant.substring(0, 3),
      Math.round(item.avgCorrectAnswers).toString(),
      Math.round(item.avgIncorrectAnswers).toString(),
      Math.round(item.avgNoAnswers).toString(),
      item.avgAccuracyPercent.toFixed(2),
    ]);
    
    this.heading(3, '2.6 Answer Quality Breakdown');
    this.heading(4, '2.6.1 Metrics'); 
    this.table(
      ['Format', 'Variant', 'Correct Answers', 'Incorrect Answers', 'No Answers',  'Acc (%)'],
      answerQualityRows
    );

    // 2.7 Token Utilization Efficiency
    const effTokenRows = sortedAggregated.map(item => [
      item.format.toUpperCase(),
      item.variant.substring(0, 3),
      Math.round(item.totalTokensUsed).toString(),
      Math.round(item.efficientlyUsedTokens).toString(),
      Math.round(item.costOfInaccuracy).toString(),
      item.avgAccuracyPercent.toFixed(2),
      item.avgWeightedAccuracyPercent.toFixed(2),
      item.efficiencyScore.toFixed(2),
      item.weightedEfficiencyScore.toFixed(2),
    ]);
    
    this.heading(3, '2.7 Token Utilization Efficiency');
    this.heading(4, '2.7.1 Metrics'); 
    this.table(
      ['Format', 'Variant', 'Total Tokens', 'Useful Tokens', 'Wasted Tokens','Acc (%)', 'Wtd Acc (%)', 'Eff Score',  'Wtd Eff Score', ],
      effTokenRows
    );

    // 2.8 Category Performance Analysis
    const categoryRows = sortedAggregated.map(item => {
      const validation = this.validations.find(x => x.format === item.format && x.variant === item.variant && x.recordCount === item.recordCount);
      const retrieval = validation?.accuracy.find(x => x.category === 'field_retrieval')?.accuracyPercent ?? 0;
      const structure = validation?.accuracy.find(x => x.category === 'structure_awareness')?.accuracyPercent ?? 0;
      const filtering = validation?.accuracy.find(x => x.category === 'filtering')?.accuracyPercent ?? 0;
      const aggregation = validation?.accuracy.find(x => x.category === 'aggregation')?.accuracyPercent ?? 0;

      return [
      item.format.toUpperCase(),
      item.variant.substring(0, 3),
      item.avgAccuracyPercent.toFixed(2),
      retrieval.toFixed(2),
      structure.toFixed(2),
      filtering.toFixed(2),
      aggregation.toFixed(2),
    ]});
    
    this.heading(3, '2.8 Category Performance Analysis');
    this.heading(4, '2.8.1 Metrics'); 
    this.table(
      ['Format', 'Variant', 'Acc (%)', 'Field Retrieval (%)', 'Structure Awareness (%)', 'Filtering (%)', 'Aggregation (%)'],
      categoryRows
    );

    this.diffMandOptAccuracyPerCategory(2, 'field_retrieval');
    this.diffMandOptAccuracyPerCategory(3, 'structure_awareness');
    this.diffMandOptAccuracyPerCategory(4, 'filtering');
    this.diffMandOptAccuracyPerCategory(5, 'aggregation');

    this.line();
    this.generateCategoryAccuracyTables();
    this.line('<ADD_CONTENT_HERE: Analyze performance across question categories>');
    this.line('- Field retrieval performance:');
    this.line('- Structure awareness patterns:');
    this.line('- Aggregation/filtering challenges:');
    this.line('- Per-format strengths and weaknesses:\n');

    this.hr();
  }

  private diffMandOptAccuracyPerCategory(idx:number, category: QuestionCategory): void { 
    this.heading(4, `2.8.${idx} ${this.getQuestionCategoryLabel(category)}: Mandatory vs Optional`); 
    this.line();

    const categoryMandOptRows = this.uniqueFormats.map(fmt => {
      const mandValidation = this.validations.find(x => x.format === fmt && x.variant === 'mandatory' && x.recordCount === this.recordCounts[0]);
      const mandRetrieval = mandValidation?.accuracy.find(x => x.category === category)?.accuracyPercent ?? 0;
      
      const optValidation = this.validations.find(x => x.format === fmt && x.variant === 'optional' && x.recordCount === this.recordCounts[0]);
      const optRetrieval = optValidation?.accuracy.find(x => x.category === category)?.accuracyPercent ?? 0;

      const diffRetrieval = optRetrieval - mandRetrieval;

      return [
        fmt.toUpperCase(),
        mandRetrieval.toFixed(2),
        optRetrieval.toFixed(2),
        diffRetrieval.toFixed(2),
      ];
    }).filter(r => r !== null) as string[][];

    this.table(
      ['Format', 'Mand (%)', 'Opt (%)', 'Diff (%)'],
      categoryMandOptRows
    );
  }

  private generateCategoryAccuracyTables(): void {
    if (this.validations.length === 0) {
      this.line('*Category accuracy data not available*\n');
      return;
    }

    // Extract unique record counts and categories from validations
    const recordCounts = [...new Set(this.validations.map(v => v.recordCount))].sort((a, b) => b - a);
    const categories = [...new Set(this.validations.flatMap(v => v.accuracy.map(a => a.category)))].sort();

    recordCounts.forEach(recCount => {    
      // Category difficulty ranking
      this.line(`\n#### Category Difficulty Ranking (${recCount}-Record Dataset):\n`);
      this.line('| Rank | Category | Avg Accuracy (%) | Easiest Format | Hardest Format |');
      this.line('|------|----------|--------------|----------------|----------------|');

      if (categories.length > 0) {
        const categoryStats = categories.map(cat => {
          const accuracies = this.uniqueFormats.map(fmt => {
            const vals = this.validations.filter(
              v => v.format === fmt && v.recordCount === recCount
            );
            const avg = vals.length > 0
              ? vals.reduce((sum, v) => {
                  const catAcc = v.accuracy.find(a => a.category === cat)?.accuracyPercent || 0;
                  return sum + catAcc;
                }, 0) / vals.length
              : 0;
            return { format: fmt, accuracy: avg };
          });

          const avgAccuracy = accuracies.reduce((sum, a) => sum + a.accuracy, 0) / accuracies.length;
          const easiest = accuracies.reduce((max, a) => a.accuracy > max.accuracy ? a : max);
          const hardest = accuracies.reduce((min, a) => a.accuracy < min.accuracy ? a : min);

          return { category: cat, avgAccuracy, easiest: easiest.format, hardest: hardest.format };
        }).sort((a, b) => b.avgAccuracy - a.avgAccuracy);

        categoryStats.forEach((stat, idx) => {
          this.line(
            `| ${idx + 1} | ${stat.category} | ${stat.avgAccuracy.toFixed(2)} | ${stat.easiest.toUpperCase()} | ${stat.hardest.toUpperCase()} |`
          );
        });
      }

      this.line();
    });
  }

  private generateFormatAnalysis(): void {
    this.heading(2, 'Format-Specific Analysis');

    this.uniqueFormats.forEach(format => {
      const formatData = this.aggregated.filter(a => a.format === format);
      if (formatData.length === 0) return;

      const best = formatData.reduce((max, curr) =>
        curr.avgWeightedAccuracyPercent > max.avgWeightedAccuracyPercent ? curr : max
      );

      this.heading(3, format.toUpperCase() + ': Detailed Analysis');

      this.line('**Performance Summary:**\n' +
        `- Best Configuration: ${best.recordCount}-record ${best.variant} (${best.avgWeightedAccuracyPercent.toFixed(2)}% weighted accuracy)\n` +
        `- Token Cost Range: ${Math.round(Math.min(...formatData.map(d => d.totalTokensUsed)))} - ${Math.round(Math.max(...formatData.map(d => d.totalTokensUsed)))} tokens\n` +
        `- Average Weighted Accuracy: ${(formatData.reduce((sum, d) => sum + d.avgWeightedAccuracyPercent, 0) / formatData.length).toFixed(2)}%\n`
      );

      this.line('**Strengths:**');
      this.line('<ADD_CONTENT_HERE: List format strengths based on category and variant analysis>');
      this.line('- ');
      this.line('- \n');

      this.line('**Weaknesses:**');
      this.line('<ADD_CONTENT_HERE: List format weaknesses and failure modes>');
      this.line('- ');
      this.line('- \n');

      this.line('**Use Case Recommendation:**');
      this.line('<ADD_CONTENT_HERE: When and why to use this format>');
      this.line('- ✓ Use when:');
      this.line('- ❌ Avoid when:\n');

      this.line('**Trade-offs:**');
      this.line('<ADD_CONTENT_HERE: Discuss accuracy vs token cost trade-offs specific to this format>\n');

      this.hr();
    });
  }

  private generateConclusions(): void {
    this.heading(2, 'Conclusions & Recommendations');

    this.heading(3, 'Format Selection Framework');
    this.line('**Decision Matrix:**\n');
    this.line('| Scenario | Recommended Format | Alternative | Avoid |');
    this.line('|----------|------------------|------------|-------|');
    this.line('| <ADD_SCENARIO_1> | <FORMAT> | <FORMAT> | <FORMAT> |');
    this.line('| <ADD_SCENARIO_2> | <FORMAT> | <FORMAT> | <FORMAT> |');
    this.line('| <ADD_SCENARIO_3> | <FORMAT> | <FORMAT> | <FORMAT> |');
    this.line('| <ADD_SCENARIO_4> | <FORMAT> | <FORMAT> | <FORMAT> |');
    this.line('| <ADD_SCENARIO_5> | <FORMAT> | <FORMAT> | <FORMAT> |\n');

    this.heading(3, 'Token Efficiency vs Accuracy Trade-off');
    this.line('<ADD_CONTENT_HERE: Discuss the fundamental trade-off between token cost and accuracy>');
    this.line('- Cheapest format (tokens):');
    this.line('- Most accurate format:');
    this.line('- Best efficiency score:');
    this.line('- Recommendation for different budgets:\n');

    this.heading(3, 'Scaling Characteristics');
    this.line('<ADD_CONTENT_HERE: Analyze how formats scale with record count and data complexity>');
    this.line('- Linear scaling validation:');
    this.line('- Fixed overhead (per-format):');
    this.line('- Recommendations for large datasets:\n');

    this.heading(3, 'Open Research Questions');
    this.line('<ADD_CONTENT_HERE: List questions for future iterations>');
    this.line('1. Questions 1');
    this.line('2. Questions 2');
    this.line('3. Questions 3');
    this.line('4. Questions 4');
    this.line('5. Questions 5\n');

    this.hr();
  }

  private generateAppendices(): void {
    this.heading(2, 'Appendices');

    this.heading(3, 'Appendix A: Complete Data Tables');

    this.heading(4, 'A.1 Token Cost Breakdown by Format and Variant');

    // Sort by format then variant (alphabetically)
    const sortedForAppendix = [...this.aggregated].sort((ob1, ob2) =>{
        if (ob1.format > ob2.format) {
          return 1;
        } else if (ob1.format < ob2.format) { 
            return -1;
        }

        if (ob1.variant < ob2.variant) { 
            return -1;
        } else if (ob1.variant > ob2.variant) {
            return 1
        } else {
            return 0;
        }
      }
    );

    const tokenRows = sortedForAppendix.map(item => [
      item.format.toUpperCase(),
      item.recordCount.toString(),
      item.variant.substring(0, 3),
      Math.round(item.readTokens).toString(),
      Math.round(item.avgOutputTokens).toString(),
      Math.round(item.totalTokensUsed).toString(),
    ]);
    this.table(
      ['Format', 'Records', 'Variant', 'Read Tokens', 'Output Tokens', 'Total Tokens'],
      tokenRows
    );

    this.heading(4, 'A.2 Accuracy Comparison');
    const accRows = sortedForAppendix.map(item => [
      item.format.toUpperCase(),
      item.recordCount.toString(),
      item.variant.substring(0, 3),
      item.avgAccuracyPercent.toFixed(2),
      item.avgWeightedAccuracyPercent.toFixed(2),
      (item.avgWeightedAccuracyPercent - item.avgAccuracyPercent).toFixed(2),
    ]);
    this.table(
      ['Format', 'Records', 'Variant', 'Accuracy (%)', 'Weighted Accuracy (%)', 'Delta (%)'],
      accRows
    );

    this.heading(4, 'A.3 Efficiency and Cost Analysis');
    const effRows = sortedForAppendix.map(item => [
      item.format.toUpperCase(),
      item.recordCount.toString(),
      item.variant.substring(0, 3),
      item.informationValuePerToken.toFixed(3),
      item.efficiencyScore.toFixed(2),
      item.weightedEfficiencyScore.toFixed(2),
      item.costOfInaccuracy.toFixed(3),
    ]);
    this.table(
      ['Format', 'Records', 'Variant', 'Info/Token', 'Efficiency', 'Wtd Efficiency', 'Cost Inaccuracy'],
      effRows
    );

    this.heading(3, 'Appendix B: Detailed Performance Data');

    this.heading(4, 'B.1 Read & Output Performance');
    this.line('| Format | Records | Variant | Output Tokens | Reasoning Duration (ms) | Q Count | Correct | Incorrect | Unanswered |');
    this.line('|---|---|---|---|---|---|---|---|---|');
    this.line('*Note: These detailed metrics are extracted from metrics.json*');
    this.line('- Read duration shows file read performance');
    this.line('- Reasoning duration shows inference/thinking time');
    this.line('- Q Count and answer distribution shows answer quality');
    this.line();

    this.heading(4, 'B.2 Structural Efficiency (Per Value/Object)');
    this.line('| Format | Records | Variant | Tokens/Value | Tokens/Object | Output/Answer |');
    this.line('|---|---|---|---|---|---|');
    this.line('*Note: These metrics show format overhead at different granularities*');
    this.line('- Tokens/Value: Lower = less overhead per data element');
    this.line('- Tokens/Object: Lower = less overhead per record');
    this.line('- Output/Answer: Shows answer conciseness');
    this.line();

    this.heading(4, 'B.3 Token Utilization Details');
    this.line('| Format | Records | Variant | Efficiently Used Tokens | Weighted Utilized | Utilization % |');
    this.line('|---|---|---|---|---|---|');
    this.line('*Note: These metrics break down token usage into utilized vs wasted*');
    this.line('- Efficiently Used: Tokens that contributed to correct answers');
    this.line('- Weighted Utilized: Same but weighted by question importance');
    this.line('- Utilization %: Percentage of tokens producing useful output');
    this.line();

    this.heading(3, 'Appendix C: Test Infrastructure');
    this.line(`- **Test Date**: ${new Date(this.metadata.generatedAt).toISOString().split('T')[0]}`);
    this.line(`- **Model**: ${this.metadata.model}`);
    this.line(`- **Extended Thinking**: ${this.metadata.thinking}`);
    this.line(`- **Structure**: <ADD_STRUCTURE>`);
    this.line(`- **Formats Tested**: ${this.metadata.formats.join(', ')}`);
    this.line(`- **Record Counts**: ${this.recordCounts.join(', ')}`);
    this.line(`- **Total Test Cases**: ${this.aggregated.length}`);

    this.heading(3, 'Appendix D: Benchmark Configuration');
    this.metadata.questionDistribution.forEach((q: any) => {
      const weight = this.metadata.questionWeightDistribution.find((w: any) => w[0] === q[0]);
      const weightPercent = weight ? (weight[1] * 100).toFixed(2) : '0.0';
      this.line(`- **${this.getQuestionCategoryLabel(q[0])}**: ${q[1]} questions (${weightPercent}% weight)`);
    });
    this.line();

    this.line('---');
    this.line();
    this.line('- **Report Generated**: ' + new Date().toISOString().split('T')[0]);
    this.line('- **Written by**: [Thore Höltig](https://github.com/thoeltig)');
    this.line('- **With the help of**: <ADD_MODEL_NAME>');
    this.line('- **Data Source**: `analytics_results.json`');
    this.line('- **Publication**: Open source research in [GitHub repository](https://github.com/thoeltig/file-format-token-accuracy-benchmark-results)');
    this.line('- **Benchmark Tool**: Claude Code Plugin in [GitHub repository](https://github.com/thoeltig/file-format-token-accuracy-benchmark)');
  }
  
  getQuestionCategoryLabel(category: QuestionCategory): string{
    switch(category){
      case 'field_retrieval':
        return 'Field Retrieval';
      case 'structure_awareness':
        return 'Structure Awareness';
      case 'filtering':
        return 'Filtering';
      case 'aggregation':
        return 'Aggregation';
    }
  } 
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  try {
    const config = parseArgs(process.argv.slice(2));
    const benchmarkFolder = path.resolve(config.benchmarkFolder);

    // Construct fixed file paths
    const jsonPath = path.join(benchmarkFolder, 'analytics_results.json');
    const resultsPath = path.join(benchmarkFolder, 'results');
    const reportPath = path.join(benchmarkFolder, 'BENCHMARK_REPORT.md');

    // Verify files exist
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`analytics_results.json not found in ${benchmarkFolder}`);
    }
    if (!fs.existsSync(resultsPath)) {
      throw new Error(`results directory not found in ${benchmarkFolder}`);
    }

    console.log(`Reading from: ${benchmarkFolder}`);
    console.log('Loading analytics results...');
    const analyticsData = loadAnalyticsResults(jsonPath);
    const aggregated = aggregateMetrics(analyticsData.metrics);
    const metadata = extractMetadata(analyticsData);

    console.log('Loading validation results...');
    const validations = loadValidationResults(resultsPath);

    console.log(`Loaded ${aggregated.length} aggregated metrics`);
    console.log(`Loaded ${validations.length} validation summaries`);

    const generator = new ReportGenerator(aggregated, validations, metadata);
    const report = generator.generate();

    fs.writeFileSync(reportPath, report, 'utf-8');

    const placeholderCount = report.split('<ADD_CONTENT_HERE').length - 1;
    console.log(`✓ Report generated: ${reportPath}`);
    console.log(`✓ ${placeholderCount} placeholder sections ready for analysis`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

main();
