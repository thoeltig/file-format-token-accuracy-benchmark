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
 *   - Executive Summary
 *   - 1. Methodology
 *   - 1.2 Test Design
 *   - 1.3 Metrics Definition
 *   - 1.4 Token Usage Measurements
 *   - 2. Results
 *   - 2.1 TLDR: Token Efficiency Analysis
 *   - 2.2 Comprehensive Benchmark Metrics
 *   - 2.3 Format Robustness: Mandatory vs Optional
 *   - 2.4 Performance
 *   - 2.5 Structural Efficiency
 *   - 2.6 Token Utilization Efficiency
 *   - 2.7 Answer Per Format Breakdown
 *   - 2.8 Accuracy Per Question Category Analysis
 *   - 4. Appendices
 *   - 4.1 Appendix A: Test Infrastructure
 *   - 4.2 Appendix B: Benchmark Configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import { loadAnalyticsResults, aggregateMetrics, loadValidationResults, AggregatedMetric, ValidationSummary, AllQuestionCategory } from './tableLoaders';
import { AnalyticsOutput, QuestionCategory } from '../types';
import { FILE_ANALYTICS_RESULT } from '../consts';

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

  interface MappingType {
    format: string;
    category: AllQuestionCategory;
    accuracyPercent: number;
  };

function extractMetadata(analyticsData: AnalyticsOutput): Metadata {
  return {
    generatedAt: analyticsData.timestamp || new Date().toISOString(),
    model: analyticsData.testConfigurations.model,
    thinking: analyticsData.testConfigurations.thinking,
    structure: analyticsData.testConfigurations.structure,
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
    this.generateAppendices();

    return this.content.join('\n');
  }

  private generateTitleAndMetadata(): void {
    this.heading(1, 'File Format Token Efficiency Benchmark: Comprehensive Report');
    this.line(`- **Date**: ${new Date(this.metadata.generatedAt).toISOString().split('T')[0]}`);
    this.line(`- **Model**: ${this.metadata.model}`);
    this.line(`- **Thinking**: ${this.metadata.thinking}`);
    this.line(`- **Data Structure**: ${this.metadata.structure}`);
    this.line(`- **Formats Tested**: ${this.uniqueFormats.length} (${this.uniqueFormats.map(f => f.toUpperCase()).join(', ')})`);
    this.line(`- **Record Counts**: ${this.recordCounts.join(', ')}`);
    this.line(`- **Status**: First iteration`);    
    this.line();
  }

  private generateExecutiveSummary(): void {
    this.heading(2, 'Executive Summary');
    this.line();
    this.line(`This benchmark evaluates token efficiency and information accuracy across ${this.uniqueFormats.length} file formats using ${this.metadata.model} as the inference model. The research addresses a critical but underexplored problem: **not all tokens are equally useful**. A format that uses fewer tokens but produces inaccurate results wastes both tokens and context, while a format that accurately conveys information may justify higher token cost.`);
    this.line();

    this.heading(3, 'Key Findings');
    this.line();
    this.line('<ADD_CONTENT_HERE>Insert 5-7 key findings from analysis</ADD_CONTENT_HERE>');
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

    this.line('**Question Distribution:**');
    this.line(`- ${this.metadata.questionDistribution.length} question categories reflecting practical use cases:`);

    let fieledretrievalAndStructureAwareness = 0;
    let filteringAndAggregation = 0;
    this.metadata.questionDistribution.forEach((q: any) => {
      const weight = this.metadata.questionWeightDistribution.find((w: any) => w[0] === q[0]);
      const weightPerc = weight ? (weight[1] * 100) : 0;

      let questionCategoryDescription = '';

      switch (q[0]) {
        case "field_retrieval":
          questionCategoryDescription = 'Extract specific values from specific records';
          fieledretrievalAndStructureAwareness += weightPerc;
          break;
        case "structure_awareness":
          questionCategoryDescription = 'Understand data shape, organization, metadata';
          fieledretrievalAndStructureAwareness += weightPerc;
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
    this.line(`- Field retrieval + structure awareness = ${fieledretrievalAndStructureAwareness.toFixed(2)}%`);
    this.line(`   - These represent the file format itself. Understanding "what data exists and how it's organized" which is fundamental to avoiding context confusion.`);
    this.line(`- Filtering + aggregation = ${filteringAndAggregation.toFixed(2)}%`);
    this.line(`   - These represent more the "intellectual" aspect of the model and will differ greatly depending on the model. Also if done deterministic the model still needs to do field retrieval and structure awareness on the result.`);
    this.line();
    
    this.heading(3, '1.3 Metrics Definition');
    this.line();
    this.line('**Token Metrics:**');
    this.line('- `readTokens`: Tokens consumed reading the data file');
    this.line('- `outputTokens`: Tokens consumed during inference (answering questions + creating the file content)');
    this.line('- `totalTokens`: readTokens + outputTokens');
    this.line();
    this.line('**Accuracy Metrics:**');
    this.line('- `accuracy`: Correct answers / total questions');
    this.line('- `weightedAccuracy`: Accuracy weighted by question category importanc');
    this.line();
    this.line('**Information Value Metrics:**');
    this.line('- `informationValuePerToken`: (accuracy% / totalTokens) × 100');
    this.line('- `costOfInaccuracy`: totalTokens × (1 - accuracy% / 100) — tokens wasted on inaccurate output');
    this.line();
    this.line('**Efficiency Score:**');
    this.line('- Composite metric balancing accuracy with normalized token cost (favour towards accuracy)')
    this.line('- normalizedTokenCost = (((maxTotalTokens+10)-currenTotalTokens)/((maxTotalTokens+10)-(minTotalTokens-10)))*100')
    this.line('- `efficiencyScore`: (accuracy% x 0.7) + (normalizedTokenCost * 0.3)');
    this.line('- `weightedEfficiencyScore`: (weightedAccuracy% x 0.7) + (normalizedTokenCost * 0.3)');
    this.line();
        
    this.heading(3, '1.4 Token Usage Measurements');
    this.line();
    this.line('Tokens usage measured in this benchmark are no estimates but the real token usage the model used in this test. The token usage is reported to the user indirectly in the conversation transcript. Both read and output Tokens are directly extracted from the transcripts of the subagents:');
    this.line('- **Read Tokens**: For each data file a single read subagent is invoked with the only prompt to read the file at the provided filepath and return "Done" once finished and do nothing more. The token extraction script searches for the read tool result and extracts only the read tokens of it.');
    this.line('- **Output Tokens**: For each data file three "benchmark-full-test" subagent are invoked with data, questions and answers template files and the instructions to read everything and answer all questions in a single write tool use. The token extraction script aggregates all output tokens until and including the write tool result.');
    this.line();
  }

  private generateSummaryTLDRFormatRanking(sortedAggregated: AggregatedMetric[]){
    const optionals = sortedAggregated.filter(x => x.variant == 'optional');
    const mandatories = sortedAggregated.filter(x => x.variant == 'mandatory');

    // 2.1.1 Best results
    const optionalLowestTokenCost = optionals.reduce((min, a) => a.totalTokensUsed < min.totalTokensUsed ? a : min);
    const mandatoryLowestTokenCost = mandatories.reduce((min, a) => a.totalTokensUsed < min.totalTokensUsed ? a : min);
    
    const optionalLowestReadTokenCost = optionals.reduce((min, a) => a.readTokens < min.readTokens ? a : min);
    const mandatoryLowestReadTokenCost = mandatories.reduce((min, a) => a.readTokens < min.readTokens ? a : min);
    
    const optionalLowestOutputTokenCost = optionals.reduce((min, a) => a.avgOutputTokens < min.avgOutputTokens ? a : min);
    const mandatoryLowestOutputTokenCost = mandatories.reduce((min, a) => a.avgOutputTokens < min.avgOutputTokens ? a : min);

    const optionalLowestOutputTokensDriftPerc = optionals.reduce((min, a) => a.absOutputTokensDriftPerc < min.absOutputTokensDriftPerc ? a : min);
    const mandatoryLowestOutputTokensDriftPerc = mandatories.reduce((min, a) => a.absOutputTokensDriftPerc < min.absOutputTokensDriftPerc ? a : min);
        
    const optionalHighestAccuracy = optionals.reduce((max, a) => a.accuracyPercent > max.accuracyPercent ? a : max);
    const mandatoryHighestAccuracy = mandatories.reduce((max, a) => a.accuracyPercent > max.accuracyPercent ? a : max);
    
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
    this.line('*Note: All columns ranked best-to-worst. ↑ = lower value is better (ascending). ↓ = higher value is better (descending).*');
    this.line();
    this.heading(4, '2.1.1 Best results');
    this.line();
    this.line('- Lowest total token cost:');
    this.line(`   - Optional: ${optionalLowestTokenCost.format.toUpperCase()} ${Math.round(optionalLowestTokenCost.totalTokensUsed)} tokens`);
    this.line(`   - Mandatory: ${mandatoryLowestTokenCost.format.toUpperCase()} ${Math.round(mandatoryLowestTokenCost.totalTokensUsed)} tokens`);
    this.line('- Lowest read token cost:');
    this.line(`   - Optional: ${optionalLowestReadTokenCost.format.toUpperCase()} ${Math.round(optionalLowestReadTokenCost.readTokens)} tokens`);
    this.line(`   - Mandatory: ${mandatoryLowestReadTokenCost.format.toUpperCase()} ${Math.round(mandatoryLowestReadTokenCost.readTokens)} tokens`);
    this.line('- Lowest output token cost:');
    this.line(`   - Optional: ${optionalLowestOutputTokenCost.format.toUpperCase()} ${Math.round(optionalLowestOutputTokenCost.avgOutputTokens)} tokens`);
    this.line(`   - Mandatory: ${mandatoryLowestOutputTokenCost.format.toUpperCase()} ${Math.round(mandatoryLowestOutputTokenCost.avgOutputTokens)} tokens`);
    this.line('- Lowest output token cost drift:');
    this.line(`   - Optional: ${optionalLowestOutputTokensDriftPerc.format.toUpperCase()} ↓ ${optionalLowestOutputTokensDriftPerc.minOutputTokensDriftPerc.toFixed(2)}% ↑ ${optionalLowestOutputTokensDriftPerc.maxOutputTokensDriftPerc.toFixed(2)}%`);
    this.line(`   - Mandatory: ${mandatoryLowestOutputTokensDriftPerc.format.toUpperCase()} ↓ ${mandatoryLowestOutputTokensDriftPerc.minOutputTokensDriftPerc.toFixed(2)}% ↑ ${mandatoryLowestOutputTokensDriftPerc.maxOutputTokensDriftPerc.toFixed(2)}%`);
    this.line('- Highest accuracy:');
    this.line(`   - Optional: ${optionalHighestAccuracy.format.toUpperCase()} ${optionalHighestAccuracy.accuracyPercent.toFixed(2)}%`);
    this.line(`   - Mandatory: ${mandatoryHighestAccuracy.format.toUpperCase()} ${mandatoryHighestAccuracy.accuracyPercent.toFixed(2)}%`);
    this.line('- Lowest accuracy drift:');
    this.line(`   - Optional: ${optionalLowestAccuracyDriftPerc.format.toUpperCase()} ↓ ${optionalLowestAccuracyDriftPerc.accuracyDriftPercentMin.toFixed(2)}% ↑ ${optionalLowestAccuracyDriftPerc.accuracyDriftPercentMax.toFixed(2)}%`);
    this.line(`   - Mandatory: ${mandatoryLowestAccuracyDriftPerc.format.toUpperCase()} ↓ ${mandatoryLowestAccuracyDriftPerc.accuracyDriftPercentMin.toFixed(2)}% ↑ ${mandatoryLowestAccuracyDriftPerc.accuracyDriftPercentMax.toFixed(2)}%`);
    this.line('- Most useful tokens:');    
    this.line(`   - Optional: ${optionalMostUsedTokens.format.toUpperCase()} ${Math.round(optionalMostUsedTokens.efficientlyUsedTokens)} / ${Math.round(optionalMostUsedTokens.totalTokensUsed)} tokens`);
    this.line(`   - Mandatory: ${mandatoryMostUsedTokens.format.toUpperCase()} ${Math.round(mandatoryMostUsedTokens.efficientlyUsedTokens)} / ${Math.round(mandatoryMostUsedTokens.totalTokensUsed)} tokens`);
    this.line('- Highest token efficiency (%/token):');
    this.line(`   - Optional: ${optionalHighestTokenEfficiency.format.toUpperCase()} ${optionalHighestTokenEfficiency.efficiencyScore.toFixed(2)}`);
    this.line(`   - Mandatory: ${mandatoryHighestTokenEfficiency.format.toUpperCase()} ${mandatoryHighestTokenEfficiency.efficiencyScore.toFixed(2)}`);
    this.line('- Lowest delta (optional-mandatory):');
    this.line(`   - Total tokens: ${lowestTotalTokensDelta.format.toUpperCase()} ${Math.round(lowestTotalTokensDelta.totalTokensDelta)} tokens`);
    this.line(`   - Accuracy: ${lowestAccuracyDelta.format.toUpperCase()} ${lowestAccuracyDelta.accuracyDelta.toFixed(2)}%`);
    this.line(`   - Token efficiency: ${lowestEfficiencyDelta.format.toUpperCase()} ${lowestEfficiencyDelta.efficiencyDelta.toFixed(2)}`);
    this.line();

    // 2.1.2 Worst results
    const optionalHighestTokenCost = optionals.reduce((max, a) => a.totalTokensUsed > max.totalTokensUsed ? a : max);
    const mandatoryHighestTokenCost = mandatories.reduce((max, a) => a.totalTokensUsed > max.totalTokensUsed ? a : max);
    
    const optionalHighestReadTokenCost = optionals.reduce((max, a) => a.readTokens > max.readTokens ? a : max);
    const mandatoryHighestReadTokenCost = mandatories.reduce((max, a) => a.readTokens > max.readTokens ? a : max);
    
    const optionalHighestOutputTokenCost = optionals.reduce((max, a) => a.avgOutputTokens > max.avgOutputTokens ? a : max);
    const mandatoryHighestOutputTokenCost = mandatories.reduce((max, a) => a.avgOutputTokens > max.avgOutputTokens ? a : max);
        
    const optionalHighestOutputTokensDriftPerc = optionals.reduce((max, a) => a.absOutputTokensDriftPerc > max.absOutputTokensDriftPerc ? a : max);
    const mandatoryHighestOutputTokensDriftPerc = mandatories.reduce((max, a) => a.absOutputTokensDriftPerc > max.absOutputTokensDriftPerc ? a : max);
    
    const optionalLowestAccuracy = optionals.reduce((min, a) => a.accuracyPercent < min.accuracyPercent ? a : min);
    const mandatoryLowestAccuracy = mandatories.reduce((min, a) => a.accuracyPercent < min.accuracyPercent ? a : min);
    
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
    this.line('- Highest read token cost:');
    this.line(`   - Optional: ${optionalHighestReadTokenCost.format.toUpperCase()} ${Math.round(optionalHighestReadTokenCost.readTokens)} tokens`);
    this.line(`   - Mandatory: ${mandatoryHighestReadTokenCost.format.toUpperCase()} ${Math.round(mandatoryHighestReadTokenCost.readTokens)} tokens`);
    this.line('- Highest output token cost:');
    this.line(`   - Optional: ${optionalHighestOutputTokenCost.format.toUpperCase()} ${Math.round(optionalHighestOutputTokenCost.avgOutputTokens)} tokens`);
    this.line(`   - Mandatory: ${mandatoryHighestOutputTokenCost.format.toUpperCase()} ${Math.round(mandatoryHighestOutputTokenCost.avgOutputTokens)} tokens`);
    this.line('- Highest output token drift:');
    this.line(`   - Optional: ${optionalHighestOutputTokensDriftPerc.format.toUpperCase()} ↓ ${optionalHighestOutputTokensDriftPerc.minOutputTokensDriftPerc.toFixed(2)}% ↑ ${optionalHighestOutputTokensDriftPerc.maxOutputTokensDriftPerc.toFixed(2)}%`);
    this.line(`   - Mandatory: ${mandatoryHighestOutputTokensDriftPerc.format.toUpperCase()} ↓ ${mandatoryHighestOutputTokensDriftPerc.minOutputTokensDriftPerc.toFixed(2)}% ↑ ${mandatoryHighestOutputTokensDriftPerc.maxOutputTokensDriftPerc.toFixed(2)}%`);
    this.line('- Lowest accuracy:');
    this.line(`   - Optional: ${optionalLowestAccuracy.format.toUpperCase()} ${optionalLowestAccuracy.accuracyPercent.toFixed(2)}%`);
    this.line(`   - Mandatory: ${mandatoryLowestAccuracy.format.toUpperCase()} ${mandatoryLowestAccuracy.accuracyPercent.toFixed(2)}%`);
    this.line('- Highest accuracy drift:');
    this.line(`   - Optional: ${optionalHighestAccuracyDriftPerc.format.toUpperCase()} ↓ ${optionalHighestAccuracyDriftPerc.accuracyDriftPercentMin.toFixed(2)}% ↑ ${optionalHighestAccuracyDriftPerc.accuracyDriftPercentMax.toFixed(2)}%`);
    this.line(`   - Mandatory: ${mandatoryHighestAccuracyDriftPerc.format.toUpperCase()} ↓ ${mandatoryHighestAccuracyDriftPerc.accuracyDriftPercentMin.toFixed(2)}% ↑ ${mandatoryHighestAccuracyDriftPerc.accuracyDriftPercentMax.toFixed(2)}%`);
    this.line('- Most wasted tokens:');    
    this.line(`   - Optional: ${optionaMostWastedTokens.format.toUpperCase()} ${Math.round(optionaMostWastedTokens.costOfInaccuracy)} / ${Math.round(optionaMostWastedTokens.totalTokensUsed)} tokens`);
    this.line(`   - Mandatory: ${mandatoryMostWastedTokens.format.toUpperCase()} ${Math.round(mandatoryMostWastedTokens.costOfInaccuracy)} / ${Math.round(mandatoryMostWastedTokens.totalTokensUsed)} tokens`);
    this.line('- Lowest token efficiency (%/token):');
    this.line(`   - Optional: ${optionalLowestTokenEfficiency.format.toUpperCase()} ${optionalLowestTokenEfficiency.efficiencyScore.toFixed(2)}`);
    this.line(`   - Mandatory: ${mandatoryLowestTokenEfficiency.format.toUpperCase()} ${mandatoryLowestTokenEfficiency.efficiencyScore.toFixed(2)}`);
    this.line('- Highest delta (optional-mandatory):');
    this.line(`   - Total tokens: ${highestTotalTokensDelta.format.toUpperCase()} ${Math.round(highestTotalTokensDelta.totalTokensDelta)} tokens`);
    this.line(`   - Accuracy: ${highestAccuracyDelta.format.toUpperCase()} ${highestAccuracyDelta.accuracyDelta.toFixed(2)}%`);
    this.line(`   - Token efficiency: ${highestEfficiencyDelta.format.toUpperCase()} ${highestEfficiencyDelta.efficiencyDelta.toFixed(2)}`);
    this.line();

    // 2.1.3 Format Ranking
    const sortedByTotalDurationMandatories = [...mandatories].sort((ob1, ob2) => ob1.totalDurationInMs > ob2.totalDurationInMs ? 1 : ob1.totalDurationInMs < ob2.totalDurationInMs ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].totalDurationInMs / 1000, arr[0].totalDurationInMs / 1000, 's'));
    const sortedByReadTokensMandatories = [...mandatories].sort((ob1, ob2) => ob1.readTokens > ob2.readTokens ? 1 : ob1.readTokens < ob2.readTokens ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].readTokens, arr[0].readTokens));
    const sortedByOutputTokensMandatories = [...mandatories].sort((ob1, ob2) => ob1.avgOutputTokens > ob2.avgOutputTokens ? 1 : ob1.avgOutputTokens < ob2.avgOutputTokens ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].avgOutputTokens, arr[0].avgOutputTokens));
    const sortedByTotalTokensMandatories = [...mandatories].sort((ob1, ob2) => ob1.totalTokensUsed > ob2.totalTokensUsed ? 1 : ob1.totalTokensUsed < ob2.totalTokensUsed ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].totalTokensUsed, arr[0].totalTokensUsed));
    const sortedByCostOfInaccuracyMandatories = [...mandatories].sort((ob1, ob2) => ob1.costOfInaccuracy > ob2.costOfInaccuracy ? 1 : ob1.costOfInaccuracy < ob2.costOfInaccuracy ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].costOfInaccuracy, arr[0].costOfInaccuracy));
    const sortedByAccuracyMandatories = [...mandatories].sort((ob1, ob2) => ob1.accuracyPercent < ob2.accuracyPercent ? 1 : ob1.accuracyPercent > ob2.accuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyPercent, arr[0].accuracyPercent));
    const sortedByWeightedAccuracyMandatories = [...mandatories].sort((ob1, ob2) => ob1.weightedAccuracyPercent < ob2.weightedAccuracyPercent ? 1 : ob1.weightedAccuracyPercent > ob2.weightedAccuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].weightedAccuracyPercent, arr[0].weightedAccuracyPercent));
    const sortedByEfficiencyScoreMandatories = [...mandatories].sort((ob1, ob2) => ob1.efficiencyScore < ob2.efficiencyScore ? 1 : ob1.efficiencyScore > ob2.efficiencyScore ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScore, arr[0].efficiencyScore));
    const sortedByWeightedEfficiencyScoreMandatories = [...mandatories].sort((ob1, ob2) => ob1.weightedEfficiencyScore < ob2.weightedEfficiencyScore ? 1 : ob1.weightedEfficiencyScore > ob2.weightedEfficiencyScore ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].weightedEfficiencyScore, arr[0].weightedEfficiencyScore));

    const manRows = mandatories.map((_, i) => [
      sortedByTotalDurationMandatories[i],
      sortedByReadTokensMandatories[i],
      sortedByOutputTokensMandatories[i],
      sortedByTotalTokensMandatories[i],
      sortedByCostOfInaccuracyMandatories[i],
      sortedByAccuracyMandatories[i],
      sortedByWeightedAccuracyMandatories[i],
      sortedByEfficiencyScoreMandatories[i],
      sortedByWeightedEfficiencyScoreMandatories[i],
    ]);

    this.heading(4, '2.1.3 Format Ranking');
    this.line();
    this.heading(5, 'Mandatory');
    this.line();
    this.table(
      ['↑ Total Duration', '↑ Read Tokens', '↑ Output Tokens', '↑ Total Tokens', '↑ Wasted Tokens','↓ Accuracy', '↓ Wtd Accuracy', '↓ Eff Score','↓ Wtd Eff Score'],
      manRows
    );
    this.line();
    
    const sortedByTotalDurationOptionals = [...optionals].sort((ob1, ob2) => ob1.totalDurationInMs > ob2.totalDurationInMs ? 1 : ob1.totalDurationInMs < ob2.totalDurationInMs ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].totalDurationInMs / 1000, arr[0].totalDurationInMs / 1000, 's'));
    const sortedByReadTokensOptionals = [...optionals].sort((ob1, ob2) => ob1.readTokens > ob2.readTokens ? 1 : ob1.readTokens < ob2.readTokens ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].readTokens, arr[0].readTokens));
    const sortedByOutputTokensOptionals = [...optionals].sort((ob1, ob2) => ob1.avgOutputTokens > ob2.avgOutputTokens ? 1 : ob1.avgOutputTokens < ob2.avgOutputTokens ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].avgOutputTokens, arr[0].avgOutputTokens));
    const sortedByTotalTokensOptionals = [...optionals].sort((ob1, ob2) => ob1.totalTokensUsed > ob2.totalTokensUsed ? 1 : ob1.totalTokensUsed < ob2.totalTokensUsed ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].totalTokensUsed, arr[0].totalTokensUsed));
    const sortedByCostOfInaccuracyOptionals = [...optionals].sort((ob1, ob2) => ob1.costOfInaccuracy > ob2.costOfInaccuracy ? 1 : ob1.costOfInaccuracy < ob2.costOfInaccuracy ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].costOfInaccuracy, arr[0].costOfInaccuracy));
    const sortedByAccuracyOptionals = [...optionals].sort((ob1, ob2) => ob1.accuracyPercent < ob2.accuracyPercent ? 1 : ob1.accuracyPercent > ob2.accuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyPercent, arr[0].accuracyPercent));
    const sortedByWeightedAccuracyOptionals = [...optionals].sort((ob1, ob2) => ob1.weightedAccuracyPercent < ob2.weightedAccuracyPercent ? 1 : ob1.weightedAccuracyPercent > ob2.weightedAccuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].weightedAccuracyPercent, arr[0].weightedAccuracyPercent));
    const sortedByEfficiencyScoreOptionals = [...optionals].sort((ob1, ob2) => ob1.efficiencyScore < ob2.efficiencyScore ? 1 : ob1.efficiencyScore > ob2.efficiencyScore ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScore, arr[0].efficiencyScore));
    const sortedByWeightedEfficiencyScoreOptionals = [...optionals].sort((ob1, ob2) => ob1.weightedEfficiencyScore < ob2.weightedEfficiencyScore ? 1 : ob1.weightedEfficiencyScore > ob2.weightedEfficiencyScore ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].weightedEfficiencyScore, arr[0].weightedEfficiencyScore));
    
    const optRows = mandatories.map((_, i) => [
      sortedByTotalDurationOptionals[i],
      sortedByReadTokensOptionals[i],
      sortedByOutputTokensOptionals[i],
      sortedByTotalTokensOptionals[i],
      sortedByCostOfInaccuracyOptionals[i],
      sortedByAccuracyOptionals[i],
      sortedByWeightedAccuracyOptionals[i],
      sortedByEfficiencyScoreOptionals[i],
      sortedByWeightedEfficiencyScoreOptionals[i],
    ]);

    this.heading(5, 'Optional');
    this.line();
    this.table(
      ['↑ Total Duration', '↑ Read Tokens', '↑ Output Tokens', '↑ Total Tokens', '↑ Wasted Tokens','↓ Acc', '↓ Wtd Acc', '↓ Eff Score','↓ Wtd Eff Score'],
      optRows
    );
    this.line();
    
    // 2.1.4 Category Accuracy Ranking
    const formats: string[] = [...new Set(this.validations.map(x => x.format))];
    const mandatoriesVals: MappingType[] = this.validations.filter(x=>x.variant === 'mandatory').flatMap(v => v.accuracy.map<MappingType>(x => ({ format: v.format, category: x.category, accuracyPercent: x.accuracyPercent})));
    const optionalsVals: MappingType[] = this.validations.filter(x=>x.variant === 'optional').flatMap(v => v.accuracy.map<MappingType>(x => ({ format: v.format, category: x.category, accuracyPercent: x.accuracyPercent})));

    const manSortedByFieldRetrieval = mandatoriesVals.filter(x => x.category === 'field_retrieval').sort((ob1, ob2) => ob1.accuracyPercent < ob2.accuracyPercent ? 1 : ob1.accuracyPercent > ob2.accuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyPercent, arr[0].accuracyPercent));
    const manSortedByStructureAwareness = mandatoriesVals.filter(x => x.category === 'structure_awareness').sort((ob1, ob2) => ob1.accuracyPercent < ob2.accuracyPercent ? 1 : ob1.accuracyPercent > ob2.accuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyPercent, arr[0].accuracyPercent));
    const manSortedByFiltering = mandatoriesVals.filter(x => x.category === 'filtering').sort((ob1, ob2) => ob1.accuracyPercent < ob2.accuracyPercent ? 1 : ob1.accuracyPercent > ob2.accuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyPercent, arr[0].accuracyPercent));
    const manSortedByAggregation = mandatoriesVals.filter(x => x.category === 'aggregation').sort((ob1, ob2) => ob1.accuracyPercent < ob2.accuracyPercent ? 1 : ob1.accuracyPercent > ob2.accuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyPercent, arr[0].accuracyPercent));
    
    const manValsRows = formats.map((_, i) => [
      manSortedByFieldRetrieval[i],
      manSortedByStructureAwareness[i],
      manSortedByFiltering[i],
      manSortedByAggregation[i],
    ]);

    const prefixArrowDown = '↓ ';
    const fieldRetrievalLabel = prefixArrowDown + this.getQuestionCategoryLabel('field_retrieval');
    const aggregationLabel = prefixArrowDown + this.getQuestionCategoryLabel('aggregation');
    const filteringLabel = prefixArrowDown + this.getQuestionCategoryLabel('filtering');
    const structureAwarenessLabel = prefixArrowDown + this.getQuestionCategoryLabel('structure_awareness');

    this.heading(4, '2.1.4 Category Accuracy Ranking');
    this.line();
    this.heading(5, 'Mandatory');
    this.line();
    this.table(
      [fieldRetrievalLabel, structureAwarenessLabel, filteringLabel, aggregationLabel],
      manValsRows
    );
    this.line();
    
    const optSortedByFieldRetrieval = optionalsVals.filter(x => x.category === 'field_retrieval').sort((ob1, ob2) => ob1.accuracyPercent < ob2.accuracyPercent ? 1 : ob1.accuracyPercent > ob2.accuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyPercent, arr[0].accuracyPercent));
    const optSortedByStructureAwareness = optionalsVals.filter(x => x.category === 'structure_awareness').sort((ob1, ob2) => ob1.accuracyPercent < ob2.accuracyPercent ? 1 : ob1.accuracyPercent > ob2.accuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyPercent, arr[0].accuracyPercent));
    const optSortedByFiltering = optionalsVals.filter(x => x.category === 'filtering').sort((ob1, ob2) => ob1.accuracyPercent < ob2.accuracyPercent ? 1 : ob1.accuracyPercent > ob2.accuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyPercent, arr[0].accuracyPercent));
    const optSortedByAggregation = optionalsVals.filter(x => x.category === 'aggregation').sort((ob1, ob2) => ob1.accuracyPercent < ob2.accuracyPercent ? 1 : ob1.accuracyPercent > ob2.accuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyPercent, arr[0].accuracyPercent));
    
    const optValsRows = formats.map((_, i) => [
      optSortedByFieldRetrieval[i],
      optSortedByStructureAwareness[i],
      optSortedByFiltering[i],
      optSortedByAggregation[i],
    ]);

    this.heading(5, 'Optional');
    this.line();
    this.table(
      [fieldRetrievalLabel, structureAwarenessLabel, filteringLabel, aggregationLabel],
      optValsRows
    );
    this.line();

    // 2.1.5 Conclusion
    this.heading(4, '2.1.5 Conclusion');
    this.line();
    this.line('<ADD_CONTENT_HERE>Analysis here</ADD_CONTENT_HERE>');
    this.line();
  }
  
  private getRankingOfAmountDisplay(format: string, idx: number, current: number, first: number, suffix: string = ''){
    return format.toUpperCase() + (idx > 0 ? ` (${(current > first ?'+' : '')}${(current/first*100-100).toFixed(1)}%)` : ` ≈ ${Math.round(current)}${suffix}`);
  }
  
  private getRankingOfPercentageDisplay(format: string, idx: number, current: number, first: number){
    return format.toUpperCase() + (idx > 0 ? ` (${(current > first ?'+' : '')}${(current-first).toFixed(1)}%)` : ` ≈ ${Math.round(current)}%`);
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
      item.charsPerReadToken.toFixed(3),
      item.informationValuePerToken.toFixed(3),
      item.outputTokensPerAnswer.toFixed(3),
      item.accuracyPercent.toFixed(2),
      item.weightedEfficiencyScore.toFixed(2),
      item.efficientlyUsedTokens.toFixed(3),
      item.costOfInaccuracy.toFixed(3),
      item.efficiencyScore.toFixed(2),
      item.weightedEfficiencyScore.toFixed(2),
    ]);

    this.heading(3, '2.2 Comprehensive Benchmark Metrics');
    this.table(
      ['Format', 'Variant', 'Read Tokens', 'Output Tokens', 'Total', 'Char/Token', 'Info/Token', 'Token/Answer', 'Accuracy (%)', 'Wtd Accuracy (%)', 'Used Tokens', 'Wasted Tokens', 'Eff Score', 'Wtd Eff Score'],
      rows
    );

    // 2.3 Format Robustness: Mandatory vs Optional
    const mandOptFormatDeltaRows = mandatories.map(x =>{   
      const mandReadTokensUsed = Math.round(x.readTokens);
      const readTokenDiff = Math.round(x.readTokensDelta);  
      const optReadTokensUsed = mandReadTokensUsed + readTokenDiff;

      const mandOutputTokensUsed = Math.round(x.avgOutputTokens);
      const outputTokenDiff = Math.round(x.outputTokensDelta);  
      const optOutputTokensUsed = mandOutputTokensUsed + outputTokenDiff;

      const mandTotalTokensUsed = Math.round(x.totalTokensUsed);
      const totalTokenDiff = Math.round(x.totalTokensDelta);  
      const optTotalTokensUsed = mandTotalTokensUsed + totalTokenDiff;
      return [
        x.format.toUpperCase(),
        mandReadTokensUsed.toString(),
        optReadTokensUsed.toString(),
        this.displayDelta(readTokenDiff, 0),
        this.calcDeltaPercentage(mandReadTokensUsed, readTokenDiff),        
        mandOutputTokensUsed.toString(),
        optOutputTokensUsed.toString(),
        this.displayDelta(outputTokenDiff, 0),
        this.calcDeltaPercentage(mandOutputTokensUsed, outputTokenDiff),
        mandTotalTokensUsed.toString(),
        optTotalTokensUsed.toString(),
        this.displayDelta(totalTokenDiff, 0),
        this.calcDeltaPercentage(mandTotalTokensUsed, totalTokenDiff),
        x.weightedAccuracyPercent.toFixed(2),
        (x.weightedAccuracyPercent + x.weightedAccuracyDelta).toFixed(2),
        this.displayDelta(x.weightedAccuracyDelta),
        x.weightedEfficiencyScore.toFixed(2),
        (x.weightedEfficiencyScore + x.weightedEfficiencyDelta).toFixed(2),
        this.displayDelta(x.weightedEfficiencyDelta, 2)
      ];
    });
    
    this.heading(3, '2.3 Format Robustness: Mandatory vs Optional');
    this.table(
      ['Format', 'Read Tokens Man', 'Read Tokens Opt', 'Diff', 'Diff (%)', 'Output Tokens Man', 'Output Tokens Opt', 'Diff', 'Diff (%)', 'Total Tokens Man', 'Total Tokens Opt', 'Diff', 'Diff (%)', 'Wtd Accuracy Man (%)', 'Wtd Accuracy Opt (%)', 'Diff (%)', 'Wtd Eff Score Man', 'Wtd Eff Score Opt', 'Diff'],
      mandOptFormatDeltaRows
    );

    // 2.4 Performance
    // 2.4.1 Duration & Speed
    const readPerfRows = sortedAggregated.map(item => {
      const totalDurationInMs = item.readDurationInMs+item.avgReasoningDurationInMs;
      const totalTokensPerMs = item.readTokensPerMs+item.avgReasoningTokensPerMs;
      return [
        item.format.toUpperCase(),
        item.variant.substring(0, 3),
        Math.round(item.readDurationInMs).toString(),
        item.readTokensPerMs.toFixed(3),
        (item.readDurationInMs / item.recordCount).toFixed(2),
        Math.round(item.avgReasoningDurationInMs).toString(),
        item.avgReasoningTokensPerMs.toFixed(3),
        (item.avgReasoningDurationInMs / item.totalQuestions).toFixed(2),
        Math.round(totalDurationInMs).toString(),
        totalTokensPerMs.toFixed(3),
        (totalDurationInMs / (item.recordCount + item.totalQuestions)).toFixed(2),
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
      const manReadDuration = x.readDurationInMs;
      const readDurationDelta = x.readDurationInMsDelta;
      const manOutputDuration = x.avgReasoningDurationInMs / 1000;
      const outputDurationDelta = x.outputDurationInMsDelta / 1000;
      const manTotalDuration = manReadDuration / 1000 + manOutputDuration;
      const totalDurationDelta = x.totalDurationInMsDelta / 1000;
      return [
        x.format.toUpperCase(),
        manReadDuration.toString(),
        (manReadDuration + readDurationDelta).toString(),
        this.displayDelta(readDurationDelta, 0),
        this.calcDeltaPercentage(manReadDuration, readDurationDelta),
        manOutputDuration.toFixed(2),
        (manOutputDuration + outputDurationDelta).toFixed(2),
        this.displayDelta(outputDurationDelta, 2),
        this.calcDeltaPercentage(manOutputDuration, outputDurationDelta),
        manTotalDuration.toFixed(2),
        (manTotalDuration + totalDurationDelta).toFixed(2),
        this.displayDelta(totalDurationDelta, 2),
        this.calcDeltaPercentage(manTotalDuration, totalDurationDelta),
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
      item.charsPerReadToken.toFixed(3),
      item.readTokensPerValue.toFixed(3),
      item.readTokensPerObject.toFixed(3),
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
        x.charsPerReadToken.toFixed(3),
        (x.charsPerReadToken + x.charsPerReadTokenDelta).toFixed(3),
        this.displayDelta(x.charsPerReadTokenDelta, 3),
        this.calcDeltaPercentage(x.charsPerReadToken, x.charsPerReadTokenDelta),
        x.readTokensPerValue.toFixed(3),
        (x.readTokensPerValue + x.readTokensPerValueDelta).toFixed(3),
        this.displayDelta(x.readTokensPerValueDelta, 3),
        this.calcDeltaPercentage(x.readTokensPerValue, x.readTokensPerValueDelta),
        x.readTokensPerObject.toFixed(3),
        (x.readTokensPerObject + x.readTokensPerObjectDelta).toFixed(3),
        this.displayDelta(x.readTokensPerObjectDelta, 3),
        this.calcDeltaPercentage(x.readTokensPerObject, x.readTokensPerObjectDelta),
        x.informationValuePerToken.toFixed(3),
        (x.informationValuePerToken + x.informationValuePerTokenDelta).toFixed(3),
        this.displayDelta(x.informationValuePerTokenDelta, 3),
        this.calcDeltaPercentage(x.informationValuePerToken, x.informationValuePerTokenDelta),
      ];
    });
    
    this.heading(4, '2.5.2 Mandatory vs Optional');
    this.table(
      ['Format', 'Char/Token Man', 'Char/Token Opt', 'Diff', 'Diff (%)', 'Token/Value Man', 'Token/Value Opt', 'Diff', 'Diff (%)', 'Token/Object Man', 'Token/Object Opt', 'Diff', 'Diff (%)', 'Info/Token Man', 'Info/Token Opt', 'Diff', 'Diff (%)'],
      mandOptStructuralDeltaRows
    );

    // 2.6.1 Token Utilization Efficiency: Metrics
    const effTokenRows = sortedAggregated.map(item => [
      item.format.toUpperCase(),
      item.variant.substring(0, 3),
      Math.round(item.totalTokensUsed).toString(),
      Math.round(item.efficientlyUsedTokens).toString(),
      Math.round(item.costOfInaccuracy).toString(),
      item.accuracyPercent.toFixed(2),
      item.weightedAccuracyPercent.toFixed(2),
      item.efficiencyScore.toFixed(2),
      item.weightedEfficiencyScore.toFixed(2),
    ]);

    this.heading(3, '2.6 Token Utilization Efficiency');
    this.heading(4, '2.6.1 Metrics'); 
    this.table(
      ['Format', 'Variant', 'Total Tokens', 'Useful Tokens', 'Wasted Tokens','Accuracy (%)', 'Wtd Accuracy (%)', 'Eff Score',  'Wtd Eff Score', ],
      effTokenRows
    );

    // 2.6.2 Token Utilization Efficiency: Mandatory vs Optional Data
    const mandOptEffTokenDeltaRows = mandatories.map(x =>{  
      const totalTokensUsed = Math.round(x.totalTokensUsed);
      const efficientlyUsedTokens = Math.round(x.efficientlyUsedTokens);
      const wastedTokens = Math.round(x.costOfInaccuracy);
      return [
        x.format.toUpperCase(),
        totalTokensUsed.toString(),
        Math.round(totalTokensUsed + x.totalTokensDelta).toString(),
        this.displayDelta(x.totalTokensDelta, 0),
        this.calcDeltaPercentage(totalTokensUsed, x.totalTokensDelta),
        efficientlyUsedTokens.toString(),
        Math.round(efficientlyUsedTokens + x.efficientlyUsedTokensyDelta).toString(),
        this.displayDelta(x.efficientlyUsedTokensyDelta, 0),
        this.calcDeltaPercentage(efficientlyUsedTokens, x.efficientlyUsedTokensyDelta),
        wastedTokens.toString(),
        Math.round(wastedTokens + x.costOfInaccuracyDelta).toString(),
        this.displayDelta(x.costOfInaccuracyDelta, 0),
        this.calcDeltaPercentage(wastedTokens, x.costOfInaccuracyDelta),
        x.accuracyPercent.toFixed(2),
        (x.accuracyPercent + x.accuracyDelta).toFixed(2),
        this.displayDelta(x.accuracyDelta),
        x.efficiencyScore.toFixed(2),
        (x.efficiencyScore + x.efficiencyDelta).toString(),
        this.displayDelta(x.efficiencyDelta, 2),
        this.calcDeltaPercentage(x.efficiencyScore, x.efficiencyDelta),
      ];
    });
    
    this.heading(4, '2.6.2 Mandatory vs Optional Data');
    this.table(
      ['Format', 'Total Tokens Man', 'Total Tokens Opt', 'Diff', 'Diff (%)', 'Useful Tokens Man', 'Useful Tokens Opt', 'Diff', 'Diff (%)', 'Wasted Tokens Man', 'Wasted Tokens Opt', 'Diff', 'Diff (%)', 'Accuracy (%) Man', 'Accuracy (%) Opt', 'Diff (%)', 'Eff Score Man', 'Eff Score Opt', 'Diff', 'Diff (%)'],
      mandOptEffTokenDeltaRows
    );
    
    // 2.7.1 Answer Quality Breakdown: Metrics
    const answerQualityRows = sortedAggregated.map(item => [
      item.format.toUpperCase(),
      item.variant.substring(0, 3),
      item.correctAnswers.toString(),
      item.incorrectAnswers.toString(),
      item.noAnswers.toString(),
      item.accuracyPercent.toFixed(2),
    ]);
    
    this.heading(3, '2.7 Answer Per Format Breakdown');
    this.heading(4, '2.7.1 Metrics'); 
    this.table(
      ['Format', 'Variant', 'Correct Answers', 'Incorrect Answers', 'No Answers',  'Accuracy (%)'],
      answerQualityRows
    );
    
    // 2.7.2 Answer Per Format Breakdown: Mandatory vs Optional Data
    const mandOptAnswerDeltaRows = mandatories.map(x =>{    
      return [
        x.format.toUpperCase(),
        x.correctAnswers.toString(),
        (x.correctAnswers + x.correctAnswersDelta).toString(),
        this.displayDelta(x.correctAnswersDelta, 0),
        this.calcDeltaPercentage(x.correctAnswers, x.correctAnswersDelta),
        x.incorrectAnswers.toString(),
        (x.incorrectAnswers + x.incorrectAnswersDelta).toString(),
        this.displayDelta(x.incorrectAnswersDelta, 0),
        this.calcDeltaPercentage(x.incorrectAnswers, x.incorrectAnswersDelta),
        x.noAnswers.toString(),
        (x.noAnswers + x.noAnswersDelta).toString(),
        this.displayDelta(x.noAnswersDelta, 0),
        this.calcDeltaPercentage(x.noAnswers, x.noAnswersDelta),
        x.accuracyPercent.toFixed(2),
        (x.accuracyPercent + x.accuracyDelta).toFixed(2),
        this.displayDelta(x.accuracyDelta)
      ];
    });
    
    this.heading(4, '2.7.2 Mandatory vs Optional Data');
    this.table(
      ['Format', 'Correct Man', 'Correct Opt', 'Diff', 'Diff (%)', 'Incorrect Man', 'Incorrect Opt', 'Diff', 'Diff (%)', 'No Answers Man', 'No Answers Opt', 'Diff', 'Diff (%)', 'Accuracy (%) Man', 'Accuracy (%) Opt', 'Diff (%)'],
      mandOptAnswerDeltaRows
    );

    const categoryRows = sortedAggregated.map(item => {
      const validation = this.validations.find(x => x.format === item.format && x.variant === item.variant && x.recordCount === item.recordCount);
      const retrieval = validation?.accuracy.find(x => x.category === 'field_retrieval')?.accuracyPercent ?? 0;
      const structure = validation?.accuracy.find(x => x.category === 'structure_awareness')?.accuracyPercent ?? 0;
      const filtering = validation?.accuracy.find(x => x.category === 'filtering')?.accuracyPercent ?? 0;
      const aggregation = validation?.accuracy.find(x => x.category === 'aggregation')?.accuracyPercent ?? 0;

      return [
      item.format.toUpperCase(),
      item.variant.substring(0, 3),
      item.accuracyPercent.toFixed(2),
      retrieval.toFixed(2),
      structure.toFixed(2),
      filtering.toFixed(2),
      aggregation.toFixed(2),
    ]});
    
    this.heading(3, '2.8 Accuracy Per Question Category Analysis');
    this.heading(4, '2.8.1 Metrics'); 
    this.table(
      ['Format', 'Variant', 'Accuracy (%)', 'Field Retrieval (%)', 'Structure Awareness (%)', 'Filtering (%)', 'Aggregation (%)'],
      categoryRows
    );

    this.diffMandOptAccuracyPerCategory(2, 'field_retrieval');
    this.diffMandOptAccuracyPerCategory(3, 'structure_awareness');
    this.diffMandOptAccuracyPerCategory(4, 'filtering');
    this.diffMandOptAccuracyPerCategory(5, 'aggregation');
  }

  private calcDeltaPercentage(manVal: number, optManDelta: number, fixed: number = 2): string {
    return this.displayDelta(manVal > 0 ? (optManDelta / manVal) * 100 : 0, fixed)
  }
  
  private displayDelta(percentage: number, fixed: number = 2): string {
    return (percentage > 0 ?' +' : '') + percentage.toFixed(fixed)
  }

  private diffMandOptAccuracyPerCategory(idx:number, category: QuestionCategory): void { 
    this.heading(4, `2.8.${idx} ${this.getQuestionCategoryLabel(category)}: Mandatory vs Optional`); 
    this.line();

    const mandatoriesVals: MappingType[] = this.validations.filter(x=>x.variant === 'mandatory').flatMap(v => v.accuracy.map<MappingType>(x => ({ format: v.format, category: x.category, accuracyPercent: x.accuracyPercent})));
    const optionalsVals: MappingType[] = this.validations.filter(x=>x.variant === 'optional').flatMap(v => v.accuracy.map<MappingType>(x => ({ format: v.format, category: x.category, accuracyPercent: x.accuracyPercent})));

    const categoryMandOptRows = this.uniqueFormats.map(fmt => {
      const mandRetrieval = mandatoriesVals.find(x => x.category === category && x.format == fmt)?.accuracyPercent ?? 0;
      const optRetrieval = optionalsVals.find(x => x.category === category && x.format == fmt)?.accuracyPercent ?? 0;

      const diffRetrieval = optRetrieval - mandRetrieval;

      return [
        fmt.toUpperCase(),
        mandRetrieval.toFixed(2),
        optRetrieval.toFixed(2),
        this.displayDelta(diffRetrieval),
      ];
    }).filter(r => r !== null) as string[][];

    this.table(
      ['Format', 'Mand (%)', 'Opt (%)', 'Diff (%)'],
      categoryMandOptRows
    );
  }

  private generateAppendices(): void {
    this.heading(2, '4. Appendices');
    this.line();

    this.heading(3, '4.1 Appendix A: Test Infrastructure');
    this.line(`- **Test Date**: ${new Date(this.metadata.generatedAt).toISOString().split('T')[0]}`);
    this.line(`- **Model**: ${this.metadata.model}`);
    this.line(`- **Thinking**: ${this.metadata.thinking}`);
    this.line(`- **Structure**: ${this.metadata.structure}`);
    this.line(`- **Formats Tested**: ${this.metadata.formats.map(f => f.toUpperCase()).join(', ')}`);
    this.line(`- **Record Counts**: ${this.recordCounts.join(', ')}`);
    this.line(`- **Total Test Cases**: ${this.aggregated.length}`);
    this.line();

    this.heading(3, '4.2 Appendix B: Benchmark Configuration');
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
    this.line('- **Test run in**: Claude Code < 2.1.86');
    this.line('- **Data Source**: `analytics_results.json`');
    this.line('- **Publication**: Open source research in [GitHub repository](https://github.com/thoeltig/file-format-token-accuracy-benchmark-results)');
    this.line('- **Licensed under**: [CC BY 4.0](https://github.com/thoeltig/file-format-token-accuracy-benchmark-results/LICENSE)');
    this.line('- **Related Benchmark Results**:');
    this.line('   - [Report - flat structure & thinking off](https://github.com/thoeltig/file-format-token-accuracy-benchmark-results)');
    this.line('   - [Report - flat structure & thinking on](https://github.com/thoeltig/file-format-token-accuracy-benchmark-results)');
    this.line('   - [Report - nested structure & thinking off](https://github.com/thoeltig/file-format-token-accuracy-benchmark-results)');
    this.line('   - [Report - nested structure & thinking on](https://github.com/thoeltig/file-format-token-accuracy-benchmark-results)');
    this.line('- **Format Specifics**: [README](https://github.com/thoeltig/file-format-token-accuracy-benchmark#format-specifics)');
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
    const jsonPath = path.join(benchmarkFolder, FILE_ANALYTICS_RESULT);
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
