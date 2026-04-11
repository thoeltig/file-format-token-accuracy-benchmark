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
 *   - 2.6 Output Write Token Utilization Efficiency (Accuracy By Char)
 *   - 2.7 Token Utilization Efficiency
 *   - 2.8 Answer Per Format Breakdown
 *   - 2.9 Accuracy Per Question Category Analysis
 *   - 4. Appendices
 *   - 4.1 Appendix A: Test Infrastructure
 *   - 4.2 Appendix B: Benchmark Configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import { loadAnalyticsResults, aggregateMetrics, loadValidationResults, AggregatedMetric, ValidationSummary, AllQuestionCategory } from './tableLoaders';
import { AnalyticsOutput, QuestionCategory, TestMetadata } from '../types';
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

interface Metadata extends TestMetadata {
  generatedAt: string;
}

interface MappingType {
  format: string;
  category: AllQuestionCategory;
  accuracyPercent: number;
};

function extractMetadata(analyticsData: AnalyticsOutput): Metadata {
  return {
    generatedAt: analyticsData.timestamp || new Date().toISOString(),
    ...analyticsData.testConfigurations
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
    this.aggregated.forEach(x => x.format = x.format.toUpperCase());
    this.validations = validations;
    this.validations.forEach(x => x.format = x.format.toUpperCase());
    this.metadata = metadata;
    this.metadata.formats = [...this.metadata.formats.map(x => x.toUpperCase())];
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
    this.line(`- **Formats Tested**: ${this.uniqueFormats.length} (${this.uniqueFormats.join(', ')})`);
    this.line(`- **Record Counts**: ${this.recordCounts.join(', ')}`);
    this.line(`- **Status**: First iteration`);    
    this.line();
  }

  private generateExecutiveSummary(): void {
    this.heading(2, 'Executive Summary');
    this.line();
    this.line(`This benchmark evaluates token efficiency and information accuracy across ${this.uniqueFormats.length} file formats using ${this.metadata.model} as the inference model. The research addresses a critical but underexplored problem: **not all tokens are equally useful**. A format that uses fewer tokens but produces inaccurate results wastes both tokens and context while a format that accurately conveys information may justify higher token cost.`);
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
    this.heading(4, '1.2.1 Data Generation');
    this.line(`- ${this.uniqueFormats.length} formats tested: ${this.uniqueFormats.join(', ')}`);
    this.line('- 2 variants per format: mandatory (22 fields, dense) and optional (19 mandatory + 3 optional, sparse)');
    this.line(`- Record Counts: ${this.recordCounts.join(', ')}`);
    this.line();

    this.heading(4, '1.2.2 Question Distribution');
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
    
    this.heading(4, '1.2.3 Weighting Rationale');
    this.line(`- **Field retrieval + structure awareness** = ${fieledretrievalAndStructureAwareness.toFixed(2)}%`);
    this.line(`   - These represent the file format itself. Understanding "what data exists and how it's organized" which is fundamental to avoiding context confusion.`);
    this.line(`- **Filtering + aggregation** = ${filteringAndAggregation.toFixed(2)}%`);
    this.line(`   - These represent more the "intellectual" aspect of the model and will differ greatly depending on the model. Also if done deterministic the model still needs to do field retrieval and structure awareness on the result.`);
    this.line();
    
    this.heading(3, '1.3 Metrics Definition');
    this.line();
    this.heading(4, '1.3.1 Token Metrics');
    this.line('- **Read Tokens**: Tokens consumed reading the data file');
    this.line('- **Output Tokens**: Tokens consumed during inference (answering questions and creating the file content)');
    this.line('- **Total Tokens**: **Read Tokens** + **Output Tokens**');
    this.line();
    this.heading(4, '1.3.2 Accuracy Metrics');
    this.line('- **Accuracy By Char**: Correct char per answers / expected characters per answer');
    this.line('- **Accuracy**: Correct answers / total questions');
    this.line('- **Weighted Accuracy**: Accuracy weighted by question category importance');
    this.line();

    const efficiencyScoreAccuracyPortion = this.metadata.efficiencyScoreWeight.find(x => x[0] === "accuracy")?.[1] ?? 0;
    const efficiencyScoreTokenPortion = this.metadata.efficiencyScoreWeight.find(x => x[0] === "tokens")?.[1] ?? 0;
    this.heading(4, '1.3.3 Efficiency Score');
    this.line('Composite metric balancing accuracy with normalized token count (favour towards accuracy). Each efficieny score has an indicator which token count was used in the calculation.')
    this.line('- **Normalized Tokens** = (((**Max Tokens** + 10) - **Current Tokens**) / ((**Max Tokens** + 10) - (**Min Tokens** - 10))) * 100')
    this.line(`- **Efficiency Score**: (**Accuracy** % x ${efficiencyScoreAccuracyPortion}) + (**Normalized Tokens** * ${efficiencyScoreTokenPortion})`);
    this.line(`- **Weighted Efficiency Score**: (**Weighted Accuracy** % x ${efficiencyScoreAccuracyPortion}) + (**Normalized Tokens** * ${efficiencyScoreTokenPortion})`);
    this.line();
        
    this.heading(3, '1.4 Token Usage Measurements');
    this.line();
    this.line('Tokens usage measured in this benchmark are no estimates but the real token usage the model used in this test. The token usage is reported to the user indirectly in the conversation transcript. Both read and output tokens are directly extracted from the transcripts of the subagents:');
    this.line('- **Read Tokens**: For each data file a single read subagent is invoked with the only prompt to read the file at the provided filepath and return "Done" once finished and do nothing more. The token extraction script searches for the read tool result and extracts only the read tokens of it.');
    this.line('- **Output Tokens**: For each data file multiple "benchmark-full-test" subagent are invoked with data, questions and answers template files and the instructions to read everything and answer all questions in a single write tool use. The token extraction script aggregates all output tokens until and including the write tool result.');
    this.line('   - **Output Before Write Tokens**: The output tokens which the model needed for reading the provided files and instructions.');
    this.line('   - **Output Write Tokens**: The output tokens the model used to create the output and write the answers file.');
    this.line();
    
    this.heading(3, '1.5 Important Note');
    this.line();
    this.line(`These results are specific to Claude Code using the ${this.metadata.model} model. They serve as a rule of thumb for choosing the best file format depending on the use case.`);
    this.line('However these values cannot be exactly applied to models of the same family or from other providers as token usage, accuracy and latency depend on specific model architectures and tokenizers. While the relative ranking of file formats remains consistent the absolute numbers will vary.');
    this.line('Especially the accuracy and output tokens results will vary because these values are bound to the model size and training, instruction interpretation and reasoning token budget.');
    this.line();
  }

  private generateSummaryTLDRFormatRanking(sortedAggregated: AggregatedMetric[]){
    const optionals = sortedAggregated.filter(x => x.variant == 'optional');
    const mandatories = sortedAggregated.filter(x => x.variant == 'mandatory');

    // 2.1.1 Best results
    const optionalLowestTotaLTokenCost = optionals.reduce((min, a) => a.totalTokens < min.totalTokens ? a : min);
    const mandatoryLowestTotaLTokenCost = mandatories.reduce((min, a) => a.totalTokens < min.totalTokens ? a : min);
    
    const optionalLowestReadTokenCost = optionals.reduce((min, a) => a.readTokens < min.readTokens ? a : min);
    const mandatoryLowestReadTokenCost = mandatories.reduce((min, a) => a.readTokens < min.readTokens ? a : min);
        
    const optionalLowestOutputTokenTotalCost = optionals.reduce((min, a) => a.outputTokensTotal < min.outputTokensTotal ? a : min);
    const mandatoryLowestOutputTokenTotalCost = mandatories.reduce((min, a) => a.outputTokensTotal < min.outputTokensTotal ? a : min);
    
    const optionalLowestOutputTokensTotalDriftPerc = optionals.reduce((min, a) => a.absOutputTokensTotalDriftPerc < min.absOutputTokensTotalDriftPerc ? a : min);
    const mandatoryLowestOutputTokensTotalDriftPerc = mandatories.reduce((min, a) => a.absOutputTokensTotalDriftPerc < min.absOutputTokensTotalDriftPerc ? a : min);
            
    const optionalHighestAccuracy = optionals.reduce((max, a) => a.accuracyPercent > max.accuracyPercent ? a : max);
    const mandatoryHighestAccuracy = mandatories.reduce((max, a) => a.accuracyPercent > max.accuracyPercent ? a : max);
    
    const optionalLowestAccuracyDriftPerc = optionals.reduce((min, a) => a.absAccuracyDriftPerc < min.absAccuracyDriftPerc ? a : min);
    const mandatoryLowestAccuracyDriftPerc = mandatories.reduce((min, a) => a.absAccuracyDriftPerc < min.absAccuracyDriftPerc ? a : min);

    const optionalMostUsefulReadTokens = optionals.reduce((max, a) => a.usefulReadTokens > max.usefulReadTokens ? a : max);
    const mandatoryMostUsefulReadTokens = mandatories.reduce((max, a) => a.usefulReadTokens > max.usefulReadTokens ? a : max);

    const optionalMostUsefulOutputTokens = optionals.reduce((max, a) => a.usefulOutputTokens > max.usefulOutputTokens ? a : max);
    const mandatoryMostUsefulOutputTokens = mandatories.reduce((max, a) => a.usefulOutputTokens > max.usefulOutputTokens ? a : max);
    
    const optionalHighestEfficiencyScoreRead = optionals.reduce((max, a) => a.efficiencyScoreRead > max.efficiencyScoreRead ? a : max);
    const mandatoryHighestEfficiencyScoreRead = mandatories.reduce((max, a) => a.efficiencyScoreRead > max.efficiencyScoreRead ? a : max);
    
    const optionalHighestEfficiencyScoreOutput = optionals.reduce((max, a) => a.efficiencyScoreOutput > max.efficiencyScoreOutput ? a : max);
    const mandatoryHighestEfficiencyScoreOutput = mandatories.reduce((max, a) => a.efficiencyScoreOutput > max.efficiencyScoreOutput ? a : max);
    
    const optionalHighestAccuracyByCharPerc = optionals.reduce((max, a) => a.accuracyByCharPerc > max.accuracyByCharPerc ? a : max);
    const mandatoryHighestAccuracyByCharPerc = mandatories.reduce((max, a) => a.accuracyByCharPerc > max.accuracyByCharPerc ? a : max);
    
    const optionalLowestAccuracyByCharDriftPerc = optionals.reduce((min, a) => a.absAccuracyByCharDriftPerc < min.absAccuracyByCharDriftPerc ? a : min);
    const mandatoryLowestAccuracyByCharDriftPerc = mandatories.reduce((min, a) => a.absAccuracyByCharDriftPerc < min.absAccuracyByCharDriftPerc ? a : min);
    
    const optionalMostUsefulOutputWriteTokensByCharAccuracy = optionals.reduce((max, a) => a.usefulOutputWriteTokensByCharAccuracy > max.usefulOutputWriteTokensByCharAccuracy ? a : max);
    const mandatoryMostUsefulOutputWriteTokensByCharAccuracy = mandatories.reduce((max, a) => a.usefulOutputWriteTokensByCharAccuracy > max.usefulOutputWriteTokensByCharAccuracy ? a : max);
    
    const optionalHighestEfficiencyScoreOutputWriteTokensByCharAccuracy = optionals.reduce((max, a) => a.efficiencyScoreOutputWriteTokensByCharAccuracy > max.efficiencyScoreOutputWriteTokensByCharAccuracy ? a : max);
    const mandatoryHighestEfficiencyScoreOutputWriteTokensByCharAccuracy = mandatories.reduce((max, a) => a.efficiencyScoreOutputWriteTokensByCharAccuracy > max.efficiencyScoreOutputWriteTokensByCharAccuracy ? a : max);
        
    const lowestReadTokensDelta = sortedAggregated.reduce((min, a) => Math.abs(a.readTokensDelta) < Math.abs(min.readTokensDelta) ? a : min);
    const lowestOutputTokensTotalDelta = sortedAggregated.reduce((min, a) => Math.abs(a.outputTokensTotalDelta) < Math.abs(min.outputTokensTotalDelta) ? a : min);
    const lowestAccuracyDelta = sortedAggregated.reduce((min, a) => Math.abs(a.accuracyDelta) < Math.abs(min.accuracyDelta) ? a : min);
    const lowestEfficiencyScoreReadDelta = sortedAggregated.reduce((min, a) => Math.abs(a.efficiencyScoreReadDelta) < Math.abs(min.efficiencyScoreReadDelta) ? a : min);
    const lowestEfficiencyScoreOutputDelta = sortedAggregated.reduce((min, a) => Math.abs(a.efficiencyScoreOutputDelta) < Math.abs(min.efficiencyScoreOutputDelta) ? a : min);
    const lowestAccuracyByCharPercDelta = sortedAggregated.reduce((min, a) => Math.abs(a.accuracyByCharPercDelta) < Math.abs(min.accuracyByCharPercDelta) ? a : min);
    const lowestEfficiencyScoreOutputWriteTokensByCharAccuracyDelta = sortedAggregated.reduce((min, a) => Math.abs(a.efficiencyScoreOutputWriteTokensByCharAccuracyDelta) < Math.abs(min.efficiencyScoreOutputWriteTokensByCharAccuracyDelta) ? a : min);
    
    this.heading(3, '2.1 TLDR: Token Efficiency Analysis');
    this.line();
    this.line('*Note: All columns ranked best-to-worst. ↑ = lower value is better (ascending). ↓ = higher value is better (descending).*');
    this.line();
    this.heading(4, '2.1.1 Best results');
    this.line();
    this.line('- Lowest total token cost:');
    this.line(`   - Optional: ${optionalLowestTotaLTokenCost.format} ${Math.round(optionalLowestTotaLTokenCost.totalTokens)} tokens`);
    this.line(`   - Mandatory: ${mandatoryLowestTotaLTokenCost.format} ${Math.round(mandatoryLowestTotaLTokenCost.totalTokens)} tokens`);
    this.line('- Lowest read token cost:');
    this.line(`   - Optional: ${optionalLowestReadTokenCost.format} ${Math.round(optionalLowestReadTokenCost.readTokens)} tokens`);
    this.line(`   - Mandatory: ${mandatoryLowestReadTokenCost.format} ${Math.round(mandatoryLowestReadTokenCost.readTokens)} tokens`);
    this.line('- Lowest output token cost:');
    this.line(`   - Optional: ${optionalLowestOutputTokenTotalCost.format} ${Math.round(optionalLowestOutputTokenTotalCost.outputTokensTotal)} tokens`);
    this.line(`   - Mandatory: ${mandatoryLowestOutputTokenTotalCost.format} ${Math.round(mandatoryLowestOutputTokenTotalCost.outputTokensTotal)} tokens`);
    this.line('- Lowest output token cost drift:');
    this.line(`   - Optional: ${optionalLowestOutputTokensTotalDriftPerc.format} ↓ ${optionalLowestOutputTokensTotalDriftPerc.outputTokensTotalDriftPercMin.toFixed(2)}% ↑ ${optionalLowestOutputTokensTotalDriftPerc.outputTokensTotalDriftPercMax.toFixed(2)}%`);
    this.line(`   - Mandatory: ${mandatoryLowestOutputTokensTotalDriftPerc.format} ↓ ${mandatoryLowestOutputTokensTotalDriftPerc.outputTokensTotalDriftPercMin.toFixed(2)}% ↑ ${mandatoryLowestOutputTokensTotalDriftPerc.outputTokensTotalDriftPercMax.toFixed(2)}%`);
    this.line('- Highest accuracy:');
    this.line(`   - Optional: ${optionalHighestAccuracy.format} ${optionalHighestAccuracy.accuracyPercent.toFixed(2)}%`);
    this.line(`   - Mandatory: ${mandatoryHighestAccuracy.format} ${mandatoryHighestAccuracy.accuracyPercent.toFixed(2)}%`);
    this.line('- Lowest accuracy drift:');
    this.line(`   - Optional: ${optionalLowestAccuracyDriftPerc.format} ↓ ${optionalLowestAccuracyDriftPerc.accuracyDriftPercentMin.toFixed(2)}% ↑ ${optionalLowestAccuracyDriftPerc.accuracyDriftPercentMax.toFixed(2)}%`);
    this.line(`   - Mandatory: ${mandatoryLowestAccuracyDriftPerc.format} ↓ ${mandatoryLowestAccuracyDriftPerc.accuracyDriftPercentMin.toFixed(2)}% ↑ ${mandatoryLowestAccuracyDriftPerc.accuracyDriftPercentMax.toFixed(2)}%`);
    this.line('- Most useful read tokens:');
    this.line(`   - Optional: ${optionalMostUsefulReadTokens.format} ${Math.round(optionalMostUsefulReadTokens.usefulReadTokens)} / ${Math.round(optionalMostUsefulReadTokens.readTokens)} tokens`);
    this.line(`   - Mandatory: ${mandatoryMostUsefulReadTokens.format} ${Math.round(mandatoryMostUsefulReadTokens.usefulReadTokens)} / ${Math.round(mandatoryMostUsefulReadTokens.readTokens)} tokens`);
    this.line('- Most useful output tokens:');
    this.line(`   - Optional: ${optionalMostUsefulOutputTokens.format} ${Math.round(optionalMostUsefulOutputTokens.usefulOutputTokens)} / ${Math.round(optionalMostUsefulOutputTokens.outputTokensTotal)} tokens`);
    this.line(`   - Mandatory: ${mandatoryMostUsefulOutputTokens.format} ${Math.round(mandatoryMostUsefulOutputTokens.usefulOutputTokens)} / ${Math.round(mandatoryMostUsefulOutputTokens.outputTokensTotal)} tokens`);
    this.line('- Highest read efficiency (%/token):');
    this.line(`   - Optional: ${optionalHighestEfficiencyScoreRead.format} ${optionalHighestEfficiencyScoreRead.efficiencyScoreRead.toFixed(2)}`);
    this.line(`   - Mandatory: ${mandatoryHighestEfficiencyScoreRead.format} ${mandatoryHighestEfficiencyScoreRead.efficiencyScoreRead.toFixed(2)}`);
    this.line('- Highest output efficiency (%/token):');
    this.line(`   - Optional: ${optionalHighestEfficiencyScoreOutput.format} ${optionalHighestEfficiencyScoreOutput.efficiencyScoreOutput.toFixed(2)}`);
    this.line(`   - Mandatory: ${mandatoryHighestEfficiencyScoreOutput.format} ${mandatoryHighestEfficiencyScoreOutput.efficiencyScoreOutput.toFixed(2)}`);
    this.line('- Highest accuracy by char:');
    this.line(`   - Optional: ${optionalHighestAccuracyByCharPerc.format} ${optionalHighestAccuracyByCharPerc.accuracyByCharPerc.toFixed(2)}%`);
    this.line(`   - Mandatory: ${mandatoryHighestAccuracyByCharPerc.format} ${mandatoryHighestAccuracyByCharPerc.accuracyByCharPerc.toFixed(2)}%`);
    this.line('- Lowest accuracy by char drift:');
    this.line(`   - Optional: ${optionalLowestAccuracyByCharDriftPerc.format} ↓ ${optionalLowestAccuracyByCharDriftPerc.accuracyByCharDriftPercMin.toFixed(2)}% ↑ ${optionalLowestAccuracyByCharDriftPerc.accuracyByCharDriftPercMax.toFixed(2)}%`);
    this.line(`   - Mandatory: ${mandatoryLowestAccuracyByCharDriftPerc.format} ↓ ${mandatoryLowestAccuracyByCharDriftPerc.accuracyByCharDriftPercMin.toFixed(2)}% ↑ ${mandatoryLowestAccuracyByCharDriftPerc.accuracyByCharDriftPercMax.toFixed(2)}%`);
    this.line('- Most useful output write tokens (Acc By Char):');
    this.line(`   - Optional: ${optionalMostUsefulOutputWriteTokensByCharAccuracy.format} ${Math.round(optionalMostUsefulOutputWriteTokensByCharAccuracy.usefulOutputWriteTokensByCharAccuracy)} / ${Math.round(optionalMostUsefulOutputWriteTokensByCharAccuracy.outputTokensWrite)} tokens`);
    this.line(`   - Mandatory: ${mandatoryMostUsefulOutputWriteTokensByCharAccuracy.format} ${Math.round(mandatoryMostUsefulOutputWriteTokensByCharAccuracy.usefulOutputWriteTokensByCharAccuracy)} / ${Math.round(mandatoryMostUsefulOutputWriteTokensByCharAccuracy.outputTokensWrite)} tokens`);
    this.line('- Highest output write efficiency (Acc By Char) (%/token):');
    this.line(`   - Optional: ${optionalHighestEfficiencyScoreOutputWriteTokensByCharAccuracy.format} ${optionalHighestEfficiencyScoreOutputWriteTokensByCharAccuracy.efficiencyScoreOutputWriteTokensByCharAccuracy.toFixed(2)}`);
    this.line(`   - Mandatory: ${mandatoryHighestEfficiencyScoreOutputWriteTokensByCharAccuracy.format} ${mandatoryHighestEfficiencyScoreOutputWriteTokensByCharAccuracy.efficiencyScoreOutputWriteTokensByCharAccuracy.toFixed(2)}`);
    this.line('- Lowest delta (optional-mandatory):');
    this.line(`   - Read tokens: ${lowestReadTokensDelta.format} ${Math.round(lowestReadTokensDelta.readTokensDelta)} tokens`);
    this.line(`   - Output tokens: ${lowestOutputTokensTotalDelta.format} ${Math.round(lowestOutputTokensTotalDelta.outputTokensTotalDelta)} tokens`);
    this.line(`   - Accuracy: ${lowestAccuracyDelta.format} ${lowestAccuracyDelta.accuracyDelta.toFixed(2)}%`);
    this.line(`   - Read efficiency: ${lowestEfficiencyScoreReadDelta.format} ${lowestEfficiencyScoreReadDelta.efficiencyScoreReadDelta.toFixed(2)}`);
    this.line(`   - Output efficiency: ${lowestEfficiencyScoreOutputDelta.format} ${lowestEfficiencyScoreOutputDelta.efficiencyScoreOutputDelta.toFixed(2)}`);
    this.line(`   - Accuracy by char: ${lowestAccuracyByCharPercDelta.format} ${lowestAccuracyByCharPercDelta.accuracyByCharPercDelta.toFixed(2)}%`);
    this.line(`   - Output write efficiency (Acc By Char): ${lowestEfficiencyScoreOutputWriteTokensByCharAccuracyDelta.format} ${lowestEfficiencyScoreOutputWriteTokensByCharAccuracyDelta.efficiencyScoreOutputWriteTokensByCharAccuracyDelta.toFixed(2)}`);
    this.line();

    // 2.1.2 Worst results
    const optionalHighestTotaLTokenCost = optionals.reduce((max, a) => a.totalTokens > max.totalTokens ? a : max);
    const mandatoryHighestTotaLTokenCost = mandatories.reduce((max, a) => a.totalTokens > max.totalTokens ? a : max);
    
    const optionalHighestReadTokenCost = optionals.reduce((max, a) => a.readTokens > max.readTokens ? a : max);
    const mandatoryHighestReadTokenCost = mandatories.reduce((max, a) => a.readTokens > max.readTokens ? a : max);
    
    const optionalHighestOutputTokenTotalCost = optionals.reduce((max, a) => a.outputTokensTotal > max.outputTokensTotal ? a : max);
    const mandatoryHighestOutputTokenTotalCost = mandatories.reduce((max, a) => a.outputTokensTotal > max.outputTokensTotal ? a : max);
        
    const optionalHighestOutputTokensTotalDriftPerc = optionals.reduce((max, a) => a.absOutputTokensTotalDriftPerc > max.absOutputTokensTotalDriftPerc ? a : max);
    const mandatoryHighestOutputTokensTotalDriftPerc = mandatories.reduce((max, a) => a.absOutputTokensTotalDriftPerc > max.absOutputTokensTotalDriftPerc ? a : max);
    
    const optionalLowestAccuracy = optionals.reduce((min, a) => a.accuracyPercent < min.accuracyPercent ? a : min);
    const mandatoryLowestAccuracy = mandatories.reduce((min, a) => a.accuracyPercent < min.accuracyPercent ? a : min);
    
    const optionalHighestAccuracyDriftPerc = optionals.reduce((max, a) => a.absAccuracyDriftPerc > max.absAccuracyDriftPerc ? a : max);
    const mandatoryHighestAccuracyDriftPerc = mandatories.reduce((max, a) => a.absAccuracyDriftPerc > max.absAccuracyDriftPerc ? a : max);
    
    const optionaMostWastedReadTokens = optionals.reduce((max, a) => a.wastedReadTokens > max.wastedReadTokens ? a : max);
    const mandatoryMostWastedReadTokens = mandatories.reduce((max, a) => a.wastedReadTokens > max.wastedReadTokens ? a : max);

    const optionaMostWastedOutputTokens = optionals.reduce((max, a) => a.wastedOutputTokens > max.wastedOutputTokens ? a : max);
    const mandatoryMostWastedOutputTokens = mandatories.reduce((max, a) => a.wastedOutputTokens > max.wastedOutputTokens ? a : max);

    const optionalLowestTokenEfficiencyRead = optionals.reduce((min, a) => a.efficiencyScoreRead < min.efficiencyScoreRead ? a : min);
    const mandatoryLowestTokenEfficiencyRead = mandatories.reduce((min, a) => a.efficiencyScoreRead < min.efficiencyScoreRead ? a : min);

    const optionalLowestTokenEfficiencyOutput = optionals.reduce((min, a) => a.efficiencyScoreOutput < min.efficiencyScoreOutput ? a : min);
    const mandatoryLowestTokenEfficiencyOutput = mandatories.reduce((min, a) => a.efficiencyScoreOutput < min.efficiencyScoreOutput ? a : min);
    
    const optionalLowestAccuracyByCharPerc = optionals.reduce((min, a) => a.accuracyByCharPerc < min.accuracyByCharPerc ? a : min);
    const mandatoryLowestAccuracyByCharPerc = mandatories.reduce((min, a) => a.accuracyByCharPerc < min.accuracyByCharPerc ? a : min);
    
    const optionalHighestAccuracyByCharDriftPerc = optionals.reduce((max, a) => a.absAccuracyByCharDriftPerc > max.absAccuracyByCharDriftPerc ? a : max);
    const mandatoryHighestAccuracyByCharDriftPerc = mandatories.reduce((max, a) => a.absAccuracyByCharDriftPerc > max.absAccuracyByCharDriftPerc ? a : max);
    
    const optionaMostWastedOutputWriteTokensByCharAccuracy = optionals.reduce((max, a) => a.wastedOutputWriteTokensByCharAccuracy > max.wastedOutputWriteTokensByCharAccuracy ? a : max);
    const mandatoryMostWastedOutputWriteTokensByCharAccuracy = mandatories.reduce((max, a) => a.wastedOutputWriteTokensByCharAccuracy > max.wastedOutputWriteTokensByCharAccuracy ? a : max);
    
    const optionalLowestTokenEfficiencyScoreOutputWriteTokensByCharAccuracy = optionals.reduce((min, a) => a.efficiencyScoreOutputWriteTokensByCharAccuracy < min.efficiencyScoreOutputWriteTokensByCharAccuracy ? a : min);
    const mandatoryLowestTokenEfficiencyScoreOutputWriteTokensByCharAccuracy = mandatories.reduce((min, a) => a.efficiencyScoreOutputWriteTokensByCharAccuracy < min.efficiencyScoreOutputWriteTokensByCharAccuracy ? a : min);

    const highestReadTokensDelta = sortedAggregated.reduce((max, a) => Math.abs(a.readTokensDelta) > Math.abs(max.readTokensDelta) ? a : max);
    const highestOutputTokensTotalDelta = sortedAggregated.reduce((max, a) => Math.abs(a.outputTokensTotalDelta) > Math.abs(max.outputTokensTotalDelta) ? a : max);
    const highestAccuracyDelta = sortedAggregated.reduce((max, a) => Math.abs(a.accuracyDelta) > Math.abs(max.accuracyDelta) ? a : max);
    const highestEfficiencyScoreReadDelta = sortedAggregated.reduce((max, a) => Math.abs(a.efficiencyScoreReadDelta) > Math.abs(max.efficiencyScoreReadDelta) ? a : max);
    const highestEfficiencyScoreOutputDelta = sortedAggregated.reduce((max, a) => Math.abs(a.efficiencyScoreOutputDelta) > Math.abs(max.efficiencyScoreOutputDelta) ? a : max);
    const highestAccuracyByCharPercDelta = sortedAggregated.reduce((max, a) => Math.abs(a.accuracyByCharPercDelta) > Math.abs(max.accuracyByCharPercDelta) ? a : max);
    const highestEfficiencyScoreOutputWriteTokensByCharAccuracyDelta = sortedAggregated.reduce((max, a) => Math.abs(a.efficiencyScoreOutputWriteTokensByCharAccuracyDelta) > Math.abs(max.efficiencyScoreOutputWriteTokensByCharAccuracyDelta) ? a : max);

    this.heading(4, '2.1.2 Worst results');
    this.line();
    this.line('- Highest total token cost:');
    this.line(`   - Optional: ${optionalHighestTotaLTokenCost.format} ${Math.round(optionalHighestTotaLTokenCost.totalTokens)} tokens`);
    this.line(`   - Mandatory: ${mandatoryHighestTotaLTokenCost.format} ${Math.round(mandatoryHighestTotaLTokenCost.totalTokens)} tokens`);
    this.line('- Highest read token cost:');
    this.line(`   - Optional: ${optionalHighestReadTokenCost.format} ${Math.round(optionalHighestReadTokenCost.readTokens)} tokens`);
    this.line(`   - Mandatory: ${mandatoryHighestReadTokenCost.format} ${Math.round(mandatoryHighestReadTokenCost.readTokens)} tokens`);
    this.line('- Highest output token cost:');
    this.line(`   - Optional: ${optionalHighestOutputTokenTotalCost.format} ${Math.round(optionalHighestOutputTokenTotalCost.outputTokensTotal)} tokens`);
    this.line(`   - Mandatory: ${mandatoryHighestOutputTokenTotalCost.format} ${Math.round(mandatoryHighestOutputTokenTotalCost.outputTokensTotal)} tokens`);
    this.line('- Highest output token drift:');
    this.line(`   - Optional: ${optionalHighestOutputTokensTotalDriftPerc.format} ↓ ${optionalHighestOutputTokensTotalDriftPerc.outputTokensTotalDriftPercMin.toFixed(2)}% ↑ ${optionalHighestOutputTokensTotalDriftPerc.outputTokensTotalDriftPercMax.toFixed(2)}%`);
    this.line(`   - Mandatory: ${mandatoryHighestOutputTokensTotalDriftPerc.format} ↓ ${mandatoryHighestOutputTokensTotalDriftPerc.outputTokensTotalDriftPercMin.toFixed(2)}% ↑ ${mandatoryHighestOutputTokensTotalDriftPerc.outputTokensTotalDriftPercMax.toFixed(2)}%`);
    this.line('- Lowest accuracy:');
    this.line(`   - Optional: ${optionalLowestAccuracy.format} ${optionalLowestAccuracy.accuracyPercent.toFixed(2)}%`);
    this.line(`   - Mandatory: ${mandatoryLowestAccuracy.format} ${mandatoryLowestAccuracy.accuracyPercent.toFixed(2)}%`);
    this.line('- Highest accuracy drift:');
    this.line(`   - Optional: ${optionalHighestAccuracyDriftPerc.format} ↓ ${optionalHighestAccuracyDriftPerc.accuracyDriftPercentMin.toFixed(2)}% ↑ ${optionalHighestAccuracyDriftPerc.accuracyDriftPercentMax.toFixed(2)}%`);
    this.line(`   - Mandatory: ${mandatoryHighestAccuracyDriftPerc.format} ↓ ${mandatoryHighestAccuracyDriftPerc.accuracyDriftPercentMin.toFixed(2)}% ↑ ${mandatoryHighestAccuracyDriftPerc.accuracyDriftPercentMax.toFixed(2)}%`);
    this.line('- Most wasted read tokens:');
    this.line(`   - Optional: ${optionaMostWastedReadTokens.format} ${Math.round(optionaMostWastedReadTokens.wastedReadTokens)} / ${Math.round(optionaMostWastedReadTokens.readTokens)} tokens`);
    this.line(`   - Mandatory: ${mandatoryMostWastedReadTokens.format} ${Math.round(mandatoryMostWastedReadTokens.wastedReadTokens)} / ${Math.round(mandatoryMostWastedReadTokens.readTokens)} tokens`);
    this.line('- Most wasted output tokens:');
    this.line(`   - Optional: ${optionaMostWastedOutputTokens.format} ${Math.round(optionaMostWastedOutputTokens.wastedOutputTokens)} / ${Math.round(optionaMostWastedOutputTokens.outputTokensTotal)} tokens`);
    this.line(`   - Mandatory: ${mandatoryMostWastedOutputTokens.format} ${Math.round(mandatoryMostWastedOutputTokens.wastedOutputTokens)} / ${Math.round(mandatoryMostWastedOutputTokens.outputTokensTotal)} tokens`);
    this.line('- Lowest read efficiency (%/token):');
    this.line(`   - Optional: ${optionalLowestTokenEfficiencyRead.format} ${optionalLowestTokenEfficiencyRead.efficiencyScoreRead.toFixed(2)}`);
    this.line(`   - Mandatory: ${mandatoryLowestTokenEfficiencyRead.format} ${mandatoryLowestTokenEfficiencyRead.efficiencyScoreRead.toFixed(2)}`);
    this.line('- Lowest output efficiency (%/token):');
    this.line(`   - Optional: ${optionalLowestTokenEfficiencyOutput.format} ${optionalLowestTokenEfficiencyOutput.efficiencyScoreOutput.toFixed(2)}`);
    this.line(`   - Mandatory: ${mandatoryLowestTokenEfficiencyOutput.format} ${mandatoryLowestTokenEfficiencyOutput.efficiencyScoreOutput.toFixed(2)}`);
    this.line('- Lowest accuracy by char:');
    this.line(`   - Optional: ${optionalLowestAccuracyByCharPerc.format} ${optionalLowestAccuracyByCharPerc.accuracyByCharPerc.toFixed(2)}%`);
    this.line(`   - Mandatory: ${mandatoryLowestAccuracyByCharPerc.format} ${mandatoryLowestAccuracyByCharPerc.accuracyByCharPerc.toFixed(2)}%`);
    this.line('- Highest accuracy by char drift:');
    this.line(`   - Optional: ${optionalHighestAccuracyByCharDriftPerc.format} ↓ ${optionalHighestAccuracyByCharDriftPerc.accuracyByCharDriftPercMin.toFixed(2)}% ↑ ${optionalHighestAccuracyByCharDriftPerc.accuracyByCharDriftPercMax.toFixed(2)}%`);
    this.line(`   - Mandatory: ${mandatoryHighestAccuracyByCharDriftPerc.format} ↓ ${mandatoryHighestAccuracyByCharDriftPerc.accuracyByCharDriftPercMin.toFixed(2)}% ↑ ${mandatoryHighestAccuracyByCharDriftPerc.accuracyByCharDriftPercMax.toFixed(2)}%`);
    this.line('- Most wasted output write tokens (Acc By Char):');
    this.line(`   - Optional: ${optionaMostWastedOutputWriteTokensByCharAccuracy.format} ${Math.round(optionaMostWastedOutputWriteTokensByCharAccuracy.usefulOutputWriteTokensByCharAccuracy)} / ${Math.round(optionaMostWastedOutputWriteTokensByCharAccuracy.outputTokensWrite)} tokens`);
    this.line(`   - Mandatory: ${mandatoryMostWastedOutputWriteTokensByCharAccuracy.format} ${Math.round(mandatoryMostWastedOutputWriteTokensByCharAccuracy.usefulOutputWriteTokensByCharAccuracy)} / ${Math.round(mandatoryMostWastedOutputWriteTokensByCharAccuracy.outputTokensWrite)} tokens`);
    this.line('- Lowest output write efficiency (Acc By Char) (%/token):');
    this.line(`   - Optional: ${optionalLowestTokenEfficiencyScoreOutputWriteTokensByCharAccuracy.format} ${optionalLowestTokenEfficiencyScoreOutputWriteTokensByCharAccuracy.efficiencyScoreOutputWriteTokensByCharAccuracy.toFixed(2)}`);
    this.line(`   - Mandatory: ${mandatoryLowestTokenEfficiencyScoreOutputWriteTokensByCharAccuracy.format} ${mandatoryLowestTokenEfficiencyScoreOutputWriteTokensByCharAccuracy.efficiencyScoreOutputWriteTokensByCharAccuracy.toFixed(2)}`);      
    this.line('- Highest delta (optional-mandatory):');
    this.line(`   - Read tokens: ${highestReadTokensDelta.format} ${Math.round(highestReadTokensDelta.readTokensDelta)} tokens`);
    this.line(`   - Output tokens: ${highestOutputTokensTotalDelta.format} ${Math.round(highestOutputTokensTotalDelta.outputTokensTotalDelta)} tokens`);
    this.line(`   - Accuracy: ${highestAccuracyDelta.format} ${highestAccuracyDelta.accuracyDelta.toFixed(2)}%`);
    this.line(`   - Read efficiency: ${highestEfficiencyScoreReadDelta.format} ${highestEfficiencyScoreReadDelta.efficiencyScoreReadDelta.toFixed(2)}`);
    this.line(`   - Output efficiency: ${highestEfficiencyScoreOutputDelta.format} ${highestEfficiencyScoreOutputDelta.efficiencyScoreOutputDelta.toFixed(2)}`);
    this.line(`   - Accuracy by char: ${highestAccuracyByCharPercDelta.format} ${highestAccuracyByCharPercDelta.accuracyByCharPercDelta.toFixed(2)}%`);
    this.line(`   - Output write efficiency (Acc By Char): ${highestEfficiencyScoreOutputWriteTokensByCharAccuracyDelta.format} ${highestEfficiencyScoreOutputWriteTokensByCharAccuracyDelta.efficiencyScoreOutputWriteTokensByCharAccuracyDelta.toFixed(2)}`);
    this.line();

    // 2.1.3 Format Ranking
    const sortedByTotalDurationMandatories = [...mandatories].sort((ob1, ob2) => ob1.outputDurationTotalInMs > ob2.outputDurationTotalInMs ? 1 : ob1.outputDurationTotalInMs < ob2.outputDurationTotalInMs ? -1 : 0).map((x, i, arr) => this.getRankingOfDurationDisplay(x.format, i, arr[i].outputDurationTotalInMs, arr[0].outputDurationTotalInMs));
    const sortedByReadTokensMandatories = [...mandatories].sort((ob1, ob2) => ob1.readTokens > ob2.readTokens ? 1 : ob1.readTokens < ob2.readTokens ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].readTokens, arr[0].readTokens));
    const sortedByOutputTokensBeforeWriteMandatories = [...mandatories].sort((ob1, ob2) => ob1.outputTokensBeforeWrite > ob2.outputTokensBeforeWrite ? 1 : ob1.outputTokensBeforeWrite < ob2.outputTokensBeforeWrite ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].outputTokensBeforeWrite, arr[0].outputTokensBeforeWrite));
    const sortedByOutputTokensWriteMandatories = [...mandatories].sort((ob1, ob2) => ob1.outputTokensWrite > ob2.outputTokensWrite ? 1 : ob1.outputTokensWrite < ob2.outputTokensWrite ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].outputTokensWrite, arr[0].outputTokensWrite));
    const sortedByOutputTokensTotalMandatories = [...mandatories].sort((ob1, ob2) => ob1.outputTokensTotal > ob2.outputTokensTotal ? 1 : ob1.outputTokensTotal < ob2.outputTokensTotal ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].outputTokensTotal, arr[0].outputTokensTotal));
    const sortedByTotalTokensMandatories = [...mandatories].sort((ob1, ob2) => ob1.totalTokens > ob2.totalTokens ? 1 : ob1.totalTokens < ob2.totalTokens ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].totalTokens, arr[0].totalTokens));
    const sortedByAccuracyByCharMandatories = [...mandatories].sort((ob1, ob2) => ob1.accuracyByCharPerc < ob2.accuracyByCharPerc ? 1 : ob1.accuracyByCharPerc > ob2.accuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyByCharPerc, arr[0].accuracyByCharPerc));
    const sortedByEfficiencyScoreOutputWriteByCharByCharMandatories = [...mandatories].sort((ob1, ob2) => ob1.efficiencyScoreOutputWriteTokensByCharAccuracy < ob2.efficiencyScoreOutputWriteTokensByCharAccuracy ? 1 : ob1.efficiencyScoreOutputWriteTokensByCharAccuracy > ob2.efficiencyScoreOutputWriteTokensByCharAccuracy ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreOutputWriteTokensByCharAccuracy, arr[0].efficiencyScoreOutputWriteTokensByCharAccuracy));
    const sortedByAccuracyMandatories = [...mandatories].sort((ob1, ob2) => ob1.accuracyPercent < ob2.accuracyPercent ? 1 : ob1.accuracyPercent > ob2.accuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyPercent, arr[0].accuracyPercent));
    const sortedByEfficiencyScoreReadMandatories = [...mandatories].sort((ob1, ob2) => ob1.efficiencyScoreRead < ob2.efficiencyScoreRead ? 1 : ob1.efficiencyScoreRead > ob2.efficiencyScoreRead ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreRead, arr[0].efficiencyScoreRead));
    const sortedByEfficiencyScoreOutputMandatories = [...mandatories].sort((ob1, ob2) => ob1.efficiencyScoreOutput < ob2.efficiencyScoreOutput ? 1 : ob1.efficiencyScoreOutput > ob2.efficiencyScoreOutput ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreOutput, arr[0].efficiencyScoreOutput));
    const sortedByEfficiencyScoreTotalMandatories = [...mandatories].sort((ob1, ob2) => ob1.efficiencyScoreTotal < ob2.efficiencyScoreTotal ? 1 : ob1.efficiencyScoreTotal > ob2.efficiencyScoreTotal ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreTotal, arr[0].efficiencyScoreTotal));
    
    const manRows = mandatories.map((_, i) => [
      sortedByTotalDurationMandatories[i],
      sortedByReadTokensMandatories[i],
      sortedByOutputTokensBeforeWriteMandatories[i],
      sortedByOutputTokensWriteMandatories[i],
      sortedByOutputTokensTotalMandatories[i],
      sortedByTotalTokensMandatories[i],
      sortedByAccuracyByCharMandatories[i],
      sortedByEfficiencyScoreOutputWriteByCharByCharMandatories[i],
      sortedByAccuracyMandatories[i],
      sortedByEfficiencyScoreReadMandatories[i],
      sortedByEfficiencyScoreOutputMandatories[i],
      sortedByEfficiencyScoreTotalMandatories[i],
    ]);

    this.heading(4, '2.1.3 Format Ranking');
    this.line();
    this.heading(5, 'Mandatory');
    this.line();
    this.table(
      ['↑ Total Duration', '↑ Read Tokens', '↑ Output Before Write Tokens', '↑ Output Write Tokens', '↑ Output Tokens', '↑ Total Tokens', '↓ Accuracy By Char', '↓ Eff Score Output Write (Acc By Char)', '↓ Accuracy', '↓ Eff Score Read', '↓ Eff Score Output', '↓ Eff Score Total'],
      manRows
    );
    this.line();
    
    const sortedByTotalDurationOptionals = [...optionals].sort((ob1, ob2) => ob1.outputDurationTotalInMs > ob2.outputDurationTotalInMs ? 1 : ob1.outputDurationTotalInMs < ob2.outputDurationTotalInMs ? -1 : 0).map((x, i, arr) => this.getRankingOfDurationDisplay(x.format, i, arr[i].outputDurationTotalInMs, arr[0].outputDurationTotalInMs));
    const sortedByReadTokensOptionals = [...optionals].sort((ob1, ob2) => ob1.readTokens > ob2.readTokens ? 1 : ob1.readTokens < ob2.readTokens ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].readTokens, arr[0].readTokens));
    const sortedByOutputTokensBeforeWriteOptionals = [...optionals].sort((ob1, ob2) => ob1.outputTokensBeforeWrite > ob2.outputTokensBeforeWrite ? 1 : ob1.outputTokensBeforeWrite < ob2.outputTokensBeforeWrite ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].outputTokensBeforeWrite, arr[0].outputTokensBeforeWrite));
    const sortedByOutputTokensWriteOptionals = [...optionals].sort((ob1, ob2) => ob1.outputTokensWrite > ob2.outputTokensWrite ? 1 : ob1.outputTokensWrite < ob2.outputTokensWrite ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].outputTokensWrite, arr[0].outputTokensWrite));
    const sortedByOutputTokensTotalOptionals = [...optionals].sort((ob1, ob2) => ob1.outputTokensTotal > ob2.outputTokensTotal ? 1 : ob1.outputTokensTotal < ob2.outputTokensTotal ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].outputTokensTotal, arr[0].outputTokensTotal));
    const sortedByTotalTokensOptionals = [...optionals].sort((ob1, ob2) => ob1.totalTokens > ob2.totalTokens ? 1 : ob1.totalTokens < ob2.totalTokens ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].totalTokens, arr[0].totalTokens));
    const sortedByAccuracyByCharOptionals = [...optionals].sort((ob1, ob2) => ob1.accuracyByCharPerc < ob2.accuracyByCharPerc ? 1 : ob1.accuracyByCharPerc > ob2.accuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyByCharPerc, arr[0].accuracyByCharPerc));
    const sortedByEfficiencyScoreOutputWriteByCharByCharOptionals = [...optionals].sort((ob1, ob2) => ob1.efficiencyScoreOutputWriteTokensByCharAccuracy < ob2.efficiencyScoreOutputWriteTokensByCharAccuracy ? 1 : ob1.efficiencyScoreOutputWriteTokensByCharAccuracy > ob2.efficiencyScoreOutputWriteTokensByCharAccuracy ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreOutputWriteTokensByCharAccuracy, arr[0].efficiencyScoreOutputWriteTokensByCharAccuracy));
    const sortedByAccuracyOptionals = [...optionals].sort((ob1, ob2) => ob1.accuracyPercent < ob2.accuracyPercent ? 1 : ob1.accuracyPercent > ob2.accuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyPercent, arr[0].accuracyPercent));
    const sortedByEfficiencyScoreReadOptionals = [...optionals].sort((ob1, ob2) => ob1.efficiencyScoreRead < ob2.efficiencyScoreRead ? 1 : ob1.efficiencyScoreRead > ob2.efficiencyScoreRead ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreRead, arr[0].efficiencyScoreRead));
    const sortedByEfficiencyScoreOutputOptionals = [...optionals].sort((ob1, ob2) => ob1.efficiencyScoreOutput < ob2.efficiencyScoreOutput ? 1 : ob1.efficiencyScoreOutput > ob2.efficiencyScoreOutput ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreOutput, arr[0].efficiencyScoreOutput));
    const sortedByEfficiencyScoreTotalOptionals = [...optionals].sort((ob1, ob2) => ob1.efficiencyScoreTotal < ob2.efficiencyScoreTotal ? 1 : ob1.efficiencyScoreTotal > ob2.efficiencyScoreTotal ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreTotal, arr[0].efficiencyScoreTotal));
    
    const optRows = mandatories.map((_, i) => [
      sortedByTotalDurationOptionals[i],
      sortedByReadTokensOptionals[i],
      sortedByOutputTokensBeforeWriteOptionals[i],
      sortedByOutputTokensWriteOptionals[i],
      sortedByOutputTokensTotalOptionals[i],
      sortedByTotalTokensOptionals[i],
      sortedByAccuracyByCharOptionals[i],
      sortedByEfficiencyScoreOutputWriteByCharByCharOptionals[i],
      sortedByAccuracyOptionals[i],
      sortedByEfficiencyScoreReadOptionals[i],
      sortedByEfficiencyScoreOutputOptionals[i],
      sortedByEfficiencyScoreTotalOptionals[i],
    ]);

    this.heading(5, 'Optional');
    this.line();
    this.table(
      ['↑ Total Duration', '↑ Read Tokens', '↑ Output Before Write Tokens', '↑ Output Write Tokens', '↑ Output Tokens', '↑ Total Tokens', '↓ Accuracy By Char', '↓ Eff Score Output Write (Acc By Char)', '↓ Accuracy', '↓ Eff Score Read', '↓ Eff Score Output', '↓ Eff Score Total'],
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

  private getRankingOfDurationDisplay(format: string, idx: number, current: number, first: number){
    if(current > 1000 && first > 1000){
      return this.getRankingOfAmountDisplay(format, idx, current / 1000, first / 1000, 's');
    }

    return this.getRankingOfAmountDisplay(format, idx, current, first, 'ms');
  }
  
  private getRankingOfAmountDisplay(format: string, idx: number, current: number, first: number, suffix: string = ''){
    return format + (idx > 0 ? ` (${(current > first ?'+' : '')}${(current/first*100-100).toFixed(1)}%)` : ` ≈ ${Math.round(current)}${suffix}`);
  }
  
  private getRankingOfPercentageDisplay(format: string, idx: number, current: number, first: number){
    return format + (idx > 0 ? ` (${(current > first ?'+' : '')}${(current-first).toFixed(1)}%)` : ` ≈ ${Math.round(current)}%`);
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
      item.format,
      item.variant.substring(0, 3),
      Math.round(item.readTokens).toString(),
      Math.round(item.outputTokensTotal).toString(),
      Math.round(item.totalTokens).toString(),
      item.charsPerReadToken.toFixed(3),
      item.outputTokensWritePerAnswer.toFixed(3),
      item.accuracyByCharPerc.toFixed(2),
      item.usefulOutputWriteTokensByCharAccuracy.toFixed(2),
      item.wastedOutputWriteTokensByCharAccuracy.toFixed(2),
      item.efficiencyScoreOutputWriteTokensByCharAccuracy.toFixed(2),
      item.accuracyPercent.toFixed(2),
      item.usefulReadTokens.toFixed(3),
      item.wastedReadTokens.toFixed(3),
      item.usefulOutputTokens.toFixed(3),
      item.wastedOutputTokens.toFixed(3),
      item.efficiencyScoreRead.toFixed(2),
      item.efficiencyScoreOutput.toFixed(2),
      item.efficiencyScoreTotal.toFixed(2),
    ]);

    this.heading(3, '2.2 Comprehensive Benchmark Metrics');
    this.table(
      ['Format', 'Variant', 'Read Tokens', 'Output Tokens', 'Total Tokens', 'Char / Read Token', 'Output Write Tokens / Answer', 'Accuracy By Char (%)', 'Useful Output Write Tokens (Acc By Char)', 'Wasted Output Write Tokens (Acc By Char)', 'Eff Score Output Write (Acc By Char)', 'Accuracy (%)', 'Useful Read Tokens', 'Wasted Read Tokens', 'Useful Output Tokens', 'Wasted Output Tokens', 'Eff Score Read', 'Eff Score Output', 'Eff Score Total'],
      rows
    );

    // 2.3 Format Robustness: Mandatory vs Optional
    const mandOptFormatDeltaRows = mandatories.map(x =>{   
      const mandReadTokensUsed = Math.round(x.readTokens);
      const readTokenDiff = Math.round(x.readTokensDelta);  
      const optReadTokensUsed = mandReadTokensUsed + readTokenDiff;
      
      const mandOutputTokensBeforeWrite = Math.round(x.outputTokensBeforeWrite);
      const outputTokensBeforeWriteDiff = Math.round(x.outputTokensBeforeWriteDelta);  
      const optOutputTokensBeforeWrite = mandOutputTokensBeforeWrite + outputTokensBeforeWriteDiff;
      
      const mandOutputTokensWrite = Math.round(x.outputTokensWrite);
      const outputTokensWriteDiff = Math.round(x.outputTokensWriteDelta);  
      const optOutputTokensWrite = mandOutputTokensWrite + outputTokensWriteDiff;

      const mandOutputTokensTotal = Math.round(x.outputTokensTotal);
      const outputTokensTotalDiff = Math.round(x.outputTokensTotalDelta);  
      const optOutputTokensTotal = mandOutputTokensTotal + outputTokensTotalDiff;

      const mandtotalTokens = Math.round(x.totalTokens);
      const totalTokenDiff = Math.round(x.totalTokensDelta);  
      const optTotalTokensUsed = mandtotalTokens + totalTokenDiff;
      return [
        x.format,
        mandReadTokensUsed.toString(),
        optReadTokensUsed.toString(),
        this.displayDelta(readTokenDiff, 0),
        this.calcDeltaPercentage(mandReadTokensUsed, readTokenDiff),
        mandOutputTokensBeforeWrite.toString(),
        optOutputTokensBeforeWrite.toString(),
        this.displayDelta(outputTokensBeforeWriteDiff, 0),
        this.calcDeltaPercentage(mandOutputTokensBeforeWrite, outputTokensBeforeWriteDiff),
        mandOutputTokensWrite.toString(),
        optOutputTokensWrite.toString(),
        this.displayDelta(outputTokensWriteDiff, 0),
        this.calcDeltaPercentage(mandOutputTokensWrite, outputTokensWriteDiff),
        mandOutputTokensTotal.toString(),
        optOutputTokensTotal.toString(),
        this.displayDelta(outputTokensTotalDiff, 0),
        this.calcDeltaPercentage(mandOutputTokensTotal, outputTokensTotalDiff),
        mandtotalTokens.toString(),
        optTotalTokensUsed.toString(),
        this.displayDelta(totalTokenDiff, 0),
        this.calcDeltaPercentage(mandtotalTokens, totalTokenDiff),
      ];
    });
    
    this.heading(3, '2.3 Format Robustness: Mandatory vs Optional');
    this.table(
      ['Format', 
        'Read Tokens Man', 'Read Tokens Opt', 'Diff', 'Diff (%)', 
        'Output Before Write Tokens Man', 'Output Before Write Tokens Opt', 'Diff', 'Diff (%)',  
        'Output Write Tokens Man', 'Output Write Tokens Opt', 'Diff', 'Diff (%)', 
        'Output Tokens Man', 'Output Tokens Opt', 'Diff', 'Diff (%)', 
        'Total Tokens Man', 'Total Tokens Opt', 'Diff', 'Diff (%)'],
      mandOptFormatDeltaRows
    );

    // 2.4 Performance
    // 2.4.1 Duration & Speed
    const readPerfRows = sortedAggregated.map(item => {
      const totalDurationInMs = item.readDurationInMs+item.outputDurationWriteInMs;
      const totalTokensPerMs = item.readTokensPerMs+item.outputTokensWritePerMs;
      return [
        item.format,
        item.variant.substring(0, 3),
        Math.round(item.readDurationInMs).toString(),
        item.readTokensPerMs.toFixed(3),
        (item.readDurationInMs / item.recordCount).toFixed(2),
        Math.round(item.outputDurationWriteInMs).toString(),
        item.outputTokensWritePerMs.toFixed(3),
        (item.outputDurationWriteInMs / item.totalQuestions).toFixed(2),
        Math.round(totalDurationInMs).toString(),
        totalTokensPerMs.toFixed(3),
        (totalDurationInMs / (item.recordCount + item.totalQuestions)).toFixed(2),
      ];
    });
    
    this.heading(3, '2.4 Performance');
    this.heading(4, '2.4.1 Metrics');
    this.table(
      ['Format', 'Variant', 'Read (ms)', 'Read (tokens/ms)', 'Rate (ms/record)', 'Output Write (ms)', 'Output Write (tokens/ms)', 'Rate (ms/question)', 'Read + Output Write (ms)', 'Read + Output Write (tokens/ms)', 'Rate (ms/record+question)'],
      readPerfRows
    );
    
    // 2.4.2 Performance: Mandatory vs Optional Data
    const mandOptSpeedDeltaRows = mandatories.map(x =>{    
      const manReadDuration = x.readDurationInMs;
      const readDurationDelta = x.readDurationInMsDelta;
      const manOutputDurationWrite = x.outputDurationWriteInMs / 1000;
      const outputDurationWriteDelta = x.outputDurationWriteInMsDelta / 1000;
      const manTotalDuration = manReadDuration / 1000 + manOutputDurationWrite;
      const totalDurationDelta = readDurationDelta / 1000 + outputDurationWriteDelta;
      return [
        x.format,
        manReadDuration.toString(),
        (manReadDuration + readDurationDelta).toString(),
        this.displayDelta(readDurationDelta, 0),
        this.calcDeltaPercentage(manReadDuration, readDurationDelta),
        manOutputDurationWrite.toFixed(2),
        (manOutputDurationWrite + outputDurationWriteDelta).toFixed(2),
        this.displayDelta(outputDurationWriteDelta, 2),
        this.calcDeltaPercentage(manOutputDurationWrite, outputDurationWriteDelta),
        manTotalDuration.toFixed(2),
        (manTotalDuration + totalDurationDelta).toFixed(2),
        this.displayDelta(totalDurationDelta, 2),
        this.calcDeltaPercentage(manTotalDuration, totalDurationDelta),
      ];
    });
    
    this.heading(4, '2.4.2 Mandatory vs Optional');
    this.table(
      ['Format', 'Read Man (ms)', 'Read Opt (ms)', 'Diff (ms)', 'Diff (%)', 'Output Write Man (s)', 'Output Write Opt (s)', 'Diff (s)', 'Diff (%)', 'Read + Output Write Man (s)', 'Read + Output Write Opt (s)', 'Diff (s)', 'Diff (%)'],
      mandOptSpeedDeltaRows
    );

    // 2.5.1 Structural Efficiency Metrics
    const structRows = sortedAggregated.map(item => [
      item.format,
      item.variant.substring(0, 3),
      item.charsPerReadToken.toFixed(3),
      item.readTokensPerValue.toFixed(3),
      item.readTokensPerObject.toFixed(3),
      item.informationValuePerReadTokens.toFixed(3),
      item.informationValuePerOutputTokens.toFixed(3),
      item.informationValuePerTotalTokens.toFixed(3)
    ]);
    
    this.heading(3, '2.5 Structural Efficiency');
    this.heading(4, '2.5.1 Metrics');
    this.table(
      ['Format', 'Variant', 'Chars / Read Token', 'Read Tokens / Value', 'Read Tokens / Object', 'Info / Read Token', 'Info / Output Token', 'Info / Total Token'],
      structRows
    );

    // 2.5.2 Structural Efficiency: Mandatory vs Optional Data
    const mandOptStructuralDeltaRows = mandatories.map(x =>{    
      return [
        x.format,
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
        x.informationValuePerReadTokens.toFixed(3),
        (x.informationValuePerReadTokens + x.informationValuePerReadTokensDelta).toFixed(3),
        this.displayDelta(x.informationValuePerReadTokensDelta, 3),
        this.calcDeltaPercentage(x.informationValuePerReadTokens, x.informationValuePerReadTokensDelta),        
        x.informationValuePerOutputTokens.toFixed(3),
        (x.informationValuePerOutputTokens + x.informationValuePerOutputTokensDelta).toFixed(3),
        this.displayDelta(x.informationValuePerOutputTokensDelta, 3),
        this.calcDeltaPercentage(x.informationValuePerOutputTokens, x.informationValuePerOutputTokensDelta),        
        x.informationValuePerTotalTokens.toFixed(3),
        (x.informationValuePerTotalTokens + x.informationValuePerTotalTokensDelta).toFixed(3),
        this.displayDelta(x.informationValuePerTotalTokensDelta, 3),
        this.calcDeltaPercentage(x.informationValuePerTotalTokens, x.informationValuePerTotalTokensDelta),
      ];
    });
    
    this.heading(4, '2.5.2 Mandatory vs Optional');
    this.table(
      ['Format', 'Chars / Read Token Man', 'Chars / Read Token Opt', 'Diff', 'Diff (%)', 'Read Tokens / Value Man', 'Read Tokens / Value Opt', 'Diff', 'Diff (%)', 'Read Tokens / Object Man', 'Read Tokens / Object Opt', 'Diff', 'Diff (%)', 'Info / Read Token Man', 'Info / Read Token Opt', 'Diff', 'Diff (%)', 'Info / Output Token Man', 'Info / Output Token Opt', 'Diff', 'Diff (%)', 'Info / Total Token Man', 'Info / Total Token Opt', 'Diff', 'Diff (%)'],
      mandOptStructuralDeltaRows
    );

    // 2.6.1 Output Write Token Utilization Efficiency (Accuracy By Char): Metrics
    const effTokenAccByCharRows = sortedAggregated.map(item => [
      item.format,
      item.variant.substring(0, 3),
      Math.round(item.outputTokensWrite).toString(),
      Math.round(item.usefulOutputWriteTokensByCharAccuracy).toString(),
      Math.round(item.wastedOutputWriteTokensByCharAccuracy).toString(),
      item.accuracyByCharPerc.toFixed(2),
      item.efficiencyScoreOutputWriteTokensByCharAccuracy.toFixed(2),
    ]);
    
    this.heading(3, '2.6 Output Write Token Utilization Efficiency (Accuracy By Char)');
    this.heading(4, '2.6.1 Metrics'); 
    this.table(
      ['Format', 'Variant', 'Output Write Tokens', 'Useful Output Write Tokens (Acc By Char)', 'Wasted Output Write Tokens (Acc By Char)', 'Accuracy by Char (%)', 'Eff Score Output Write (Acc By Char)'],
      effTokenAccByCharRows
    );
    
    // 2.6.2 Output Write Token Utilization Efficiency (Accuracy By Char): Mandatory vs Optional Data
    const mandOptEffOutputWriteTokenAccByCharDeltaRows = mandatories.map(x =>{
      const outputTokensWrite = Math.round(x.outputTokensWrite);
      const usefulOutputWriteTokensByCharAccuracy = Math.round(x.usefulOutputWriteTokensByCharAccuracy);
      const wastedOutputWriteTokensByCharAccuracy = Math.round(x.wastedOutputWriteTokensByCharAccuracy);
      return [
        x.format,
        outputTokensWrite.toString(),
        Math.round(outputTokensWrite + x.outputTokensWriteDelta).toString(),
        this.displayDelta(x.outputTokensWriteDelta, 0),
        this.calcDeltaPercentage(outputTokensWrite, x.outputTokensWriteDelta),
        usefulOutputWriteTokensByCharAccuracy.toString(),
        Math.round(usefulOutputWriteTokensByCharAccuracy + x.usefulOutputWriteTokensByCharAccuracyDelta).toString(),
        this.displayDelta(x.usefulOutputWriteTokensByCharAccuracyDelta, 0),
        this.calcDeltaPercentage(usefulOutputWriteTokensByCharAccuracy, x.usefulOutputWriteTokensByCharAccuracyDelta),
        wastedOutputWriteTokensByCharAccuracy.toString(),
        Math.round(wastedOutputWriteTokensByCharAccuracy + x.wastedOutputWriteTokensByCharAccuracyDelta).toString(),
        this.displayDelta(x.wastedOutputWriteTokensByCharAccuracyDelta, 0),
        this.calcDeltaPercentage(wastedOutputWriteTokensByCharAccuracy, x.wastedOutputWriteTokensByCharAccuracyDelta),
        x.accuracyByCharPerc.toFixed(2),
        (x.accuracyByCharPerc + x.accuracyByCharPercDelta).toFixed(2),
        this.displayDelta(x.accuracyByCharPercDelta),
        this.calcDeltaPercentage(x.accuracyByCharPerc, x.accuracyByCharPercDelta),
        x.efficiencyScoreOutputWriteTokensByCharAccuracy.toFixed(2),
        (x.efficiencyScoreOutputWriteTokensByCharAccuracy + x.efficiencyScoreOutputWriteTokensByCharAccuracyDelta).toFixed(2),
        this.displayDelta(x.efficiencyScoreOutputWriteTokensByCharAccuracyDelta, 2),
        this.calcDeltaPercentage(x.efficiencyScoreOutputWriteTokensByCharAccuracy, x.efficiencyScoreOutputWriteTokensByCharAccuracyDelta)
      ];
    });
    
    this.heading(4, '2.6.2 Mandatory vs Optional');
    this.table(
      ['Format', 
        'Output Write Tokens Man', 'Output Write Tokens Opt', 'Diff', 'Diff (%)', 'Useful Output Write Tokens (Acc By Char) Man', 'Useful Output Write Tokens (Acc By Char) Opt', 'Diff', 'Diff (%)', 'Wasted Output Write Tokens (Acc By Char) Man', 'Wasted Output Write Tokens (Acc By Char) Opt', 'Diff', 'Diff (%)',
        'Accuracy By Char (%) Man', 'Accuracy By Char (%) Opt', 'Diff (%)', 
        'Eff Score Output Write (Acc By Char) Man', 'Eff Score Output Write (Acc By Char) Opt', 'Diff', 'Diff (%)'],
      mandOptEffOutputWriteTokenAccByCharDeltaRows
    );

    // 2.7.1 Token Utilization Efficiency: Metrics
    const effTokenRows = sortedAggregated.map(item => [
      item.format,
      item.variant.substring(0, 3),
      Math.round(item.readTokens).toString(),
      Math.round(item.usefulReadTokens).toString(),
      Math.round(item.wastedReadTokens).toString(),
      Math.round(item.outputTokensTotal).toString(),
      Math.round(item.usefulOutputTokens).toString(),
      Math.round(item.wastedOutputTokens).toString(),
      Math.round(item.totalTokens).toString(),
      Math.round(item.usefulTotalTokens).toString(),
      Math.round(item.wastedTotalTokens).toString(),
      item.accuracyPercent.toFixed(2),
      item.efficiencyScoreRead.toFixed(2),
      item.efficiencyScoreOutput.toFixed(2),
      item.efficiencyScoreTotal.toFixed(2),
      item.weightedAccuracyPercent.toFixed(2),
      item.weightedEfficiencyScoreRead.toFixed(2),
      item.weightedEfficiencyScoreOutput.toFixed(2),
      item.weightedEfficiencyScoreTotal.toFixed(2),
    ]);
    
    this.heading(3, '2.7 Token Utilization Efficiency');
    this.heading(4, '2.7.1 Metrics'); 
    this.table(
      ['Format', 'Variant', 
        'Read Tokens', 'Useful Read Tokens', 'Wasted Read Tokens', 
        'Output Tokens', 'Useful Output Tokens', 'Wasted Output Tokens', 
        'Total Tokens', 'Useful Total Tokens', 'Wasted Total Tokens', 
        'Accuracy (%)',
        'Eff Score Read', 'Eff Score Output', 'Eff Score Total', 
        'Wtd Accuracy (%)',
        'Wtd Eff Score Read', 'Wtd Eff Score Output', 'Wtd Eff Score Total'],
      effTokenRows
    );

    // 2.7.2 Read Token Utilization Efficiency: Mandatory vs Optional Data
    const mandOptEffReadTokenDeltaRows = mandatories.map(x =>{
      const readTokens = Math.round(x.readTokens);
      const usefulReadTokens = Math.round(x.usefulReadTokens);
      const wastedReadTokens = Math.round(x.wastedReadTokens);
      return [
        x.format,
        readTokens.toString(),
        Math.round(readTokens + x.readTokensDelta).toString(),
        this.displayDelta(x.readTokensDelta, 0),
        this.calcDeltaPercentage(readTokens, x.readTokensDelta),
        usefulReadTokens.toString(),
        Math.round(usefulReadTokens + x.usefulReadTokensDelta).toString(),
        this.displayDelta(x.usefulReadTokensDelta, 0),
        this.calcDeltaPercentage(usefulReadTokens, x.usefulReadTokensDelta),
        wastedReadTokens.toString(),
        Math.round(wastedReadTokens + x.wastedReadTokensDelta).toString(),
        this.displayDelta(x.wastedReadTokensDelta, 0),
        this.calcDeltaPercentage(wastedReadTokens, x.wastedReadTokensDelta),
        x.accuracyPercent.toFixed(2),
        (x.accuracyPercent + x.accuracyDelta).toFixed(2),
        this.displayDelta(x.accuracyDelta),
        this.calcDeltaPercentage(x.accuracyPercent, x.accuracyDelta),
        x.efficiencyScoreRead.toFixed(2),
        (x.efficiencyScoreRead + x.efficiencyScoreReadDelta).toFixed(2),
        this.displayDelta(x.efficiencyScoreReadDelta, 2),
        this.calcDeltaPercentage(x.efficiencyScoreRead, x.efficiencyScoreReadDelta),
        x.weightedAccuracyPercent.toFixed(2),
        (x.weightedAccuracyPercent + x.weightedAccuracyDelta).toFixed(2),
        this.displayDelta(x.weightedAccuracyDelta),
        this.calcDeltaPercentage(x.weightedAccuracyPercent, x.weightedAccuracyDelta),
        x.weightedEfficiencyScoreRead.toFixed(2),
        (x.weightedEfficiencyScoreRead + x.weightedEfficiencyScoreReadDelta).toFixed(2),
        this.displayDelta(x.weightedEfficiencyScoreReadDelta, 2),
        this.calcDeltaPercentage(x.weightedEfficiencyScoreRead, x.weightedEfficiencyScoreReadDelta)
      ];
    });
    
    this.heading(4, '2.7.2 Read Tokens Mandatory vs Optional Data');
    this.table(
      ['Format', 
        'Read Tokens Man', 'Read Tokens Opt', 'Diff', 'Diff (%)', 'Useful Read Tokens Man', 'Useful Read Tokens Opt', 'Diff', 'Diff (%)', 'Wasted Read Tokens Man', 'Wasted Read Tokens Opt', 'Diff', 'Diff (%)',
        'Accuracy (%) Man', 'Accuracy (%) Opt', 'Diff (%)', 
        'Eff Score Read Man', 'Eff Score Read Opt', 'Diff', 'Diff (%)',
        'Wtd Accuracy (%) Man', 'Wtd Accuracy (%) Opt', 'Diff (%)', 
        'Wtd Eff Score Read Man', 'Wtd Eff Score Read Opt', 'Diff', 'Diff (%)'],
      mandOptEffReadTokenDeltaRows
    );
    
    // 2.7.3 Output Token Utilization Efficiency: Mandatory vs Optional Data
    const mandOptEffOutputTokenDeltaRows = mandatories.map(x =>{
      const outputTokens = Math.round(x.outputTokensTotal);
      const usefulOutputTokens = Math.round(x.usefulOutputTokens);
      const wastedOutputTokens = Math.round(x.wastedOutputTokens);
      return [
        x.format,   
        outputTokens.toString(),
        Math.round(outputTokens + x.outputTokensTotalDelta).toString(),
        this.displayDelta(x.outputTokensTotalDelta, 0),
        this.calcDeltaPercentage(outputTokens, x.outputTokensTotalDelta),
        usefulOutputTokens.toString(),
        Math.round(usefulOutputTokens + x.usefulOutputTokensDelta).toString(),
        this.displayDelta(x.usefulOutputTokensDelta, 0),
        this.calcDeltaPercentage(usefulOutputTokens, x.usefulOutputTokensDelta),
        wastedOutputTokens.toString(),
        Math.round(wastedOutputTokens + x.wastedOutputTokensDelta).toString(),
        this.displayDelta(x.wastedOutputTokensDelta, 0),
        this.calcDeltaPercentage(wastedOutputTokens, x.wastedOutputTokensDelta),
        x.accuracyPercent.toFixed(2),
        (x.accuracyPercent + x.accuracyDelta).toFixed(2),
        this.displayDelta(x.accuracyDelta),
        this.calcDeltaPercentage(x.accuracyPercent, x.accuracyDelta),
        x.efficiencyScoreOutput.toFixed(2),
        (x.efficiencyScoreOutput + x.efficiencyScoreOutputDelta).toFixed(2),
        this.displayDelta(x.efficiencyScoreOutputDelta, 2),
        this.calcDeltaPercentage(x.efficiencyScoreOutput, x.efficiencyScoreOutputDelta),
        x.weightedAccuracyPercent.toFixed(2),
        (x.weightedAccuracyPercent + x.weightedAccuracyDelta).toFixed(2),
        this.displayDelta(x.weightedAccuracyDelta),
        this.calcDeltaPercentage(x.weightedAccuracyPercent, x.weightedAccuracyDelta),
        x.weightedEfficiencyScoreOutput.toFixed(2),
        (x.weightedEfficiencyScoreOutput + x.weightedEfficiencyScoreOutputDelta).toFixed(2),
        this.displayDelta(x.weightedEfficiencyScoreOutputDelta, 2),
        this.calcDeltaPercentage(x.weightedEfficiencyScoreOutput, x.weightedEfficiencyScoreOutputDelta),
      ];
    });
    
    this.heading(4, '2.7.3 Output Tokens Mandatory vs Optional Data');
    this.table(
      ['Format',
        'Output Tokens Man', 'Output Tokens Opt', 'Diff', 'Diff (%)', 'Useful Output Tokens Man', 'Useful Output Tokens Opt', 'Diff', 'Diff (%)', 'Wasted Output Tokens Man', 'Wasted Output Tokens Opt', 'Diff', 'Diff (%)',
        'Accuracy (%) Man', 'Accuracy (%) Opt', 'Diff (%)',
        'Eff Score Output Man', 'Eff Score Output Opt', 'Diff', 'Diff (%)',
        'Wtd Accuracy (%) Man', 'Wtd Accuracy (%) Opt', 'Diff (%)',
        'Wtd Eff Score Output Man', 'Wtd Eff Score Output Opt', 'Diff', 'Diff (%)'],
      mandOptEffOutputTokenDeltaRows
    );
    
    // 2.7.4 Total Token Utilization Efficiency: Mandatory vs Optional Data
    const mandOptEffTotalTokenDeltaRows = mandatories.map(x =>{
      const totalTokens = Math.round(x.totalTokens);
      const usefulTotalTokens = Math.round(x.usefulTotalTokens);
      const wastedTotalTokens = Math.round(x.wastedTotalTokens);
      return [
        x.format,
        totalTokens.toString(),
        Math.round(totalTokens + x.totalTokensDelta).toString(),
        this.displayDelta(x.totalTokensDelta, 0),
        this.calcDeltaPercentage(totalTokens, x.totalTokensDelta),
        usefulTotalTokens.toString(),
        Math.round(usefulTotalTokens + x.usefulTotalTokensDelta).toString(),
        this.displayDelta(x.usefulTotalTokensDelta, 0),
        this.calcDeltaPercentage(usefulTotalTokens, x.usefulTotalTokensDelta),
        wastedTotalTokens.toString(),
        Math.round(wastedTotalTokens + x.wastedTotalTokensDelta).toString(),
        this.displayDelta(x.wastedTotalTokensDelta, 0),
        this.calcDeltaPercentage(wastedTotalTokens, x.wastedTotalTokensDelta),
        x.accuracyPercent.toFixed(2),
        (x.accuracyPercent + x.accuracyDelta).toFixed(2),
        this.displayDelta(x.accuracyDelta),
        this.calcDeltaPercentage(x.accuracyPercent, x.accuracyDelta),
        x.efficiencyScoreTotal.toFixed(2),
        (x.efficiencyScoreTotal + x.efficiencyScoreTotalDelta).toFixed(2),
        this.displayDelta(x.efficiencyScoreTotalDelta, 2),
        this.calcDeltaPercentage(x.efficiencyScoreTotal, x.efficiencyScoreTotalDelta),
        x.weightedAccuracyPercent.toFixed(2),
        (x.weightedAccuracyPercent + x.weightedAccuracyDelta).toFixed(2),
        this.displayDelta(x.weightedAccuracyDelta),
        this.calcDeltaPercentage(x.weightedAccuracyPercent, x.weightedAccuracyDelta),
        x.weightedEfficiencyScoreTotal.toFixed(2),
        (x.weightedEfficiencyScoreTotal + x.weightedEfficiencyScoreTotalDelta).toFixed(2),
        this.displayDelta(x.weightedEfficiencyScoreTotalDelta, 2),
        this.calcDeltaPercentage(x.weightedEfficiencyScoreTotal, x.weightedEfficiencyScoreTotalDelta),
      ];
    });
    
    this.heading(4, '2.7.4 Total Tokens Mandatory vs Optional Data');
    this.table(
      ['Format', 
        'Total Tokens Man', 'Total Tokens Opt', 'Diff', 'Diff (%)', 'Useful Total Tokens Man', 'Useful Total Tokens Opt', 'Diff', 'Diff (%)', 'Wasted Total Tokens Man', 'Wasted Total Tokens Opt', 'Diff', 'Diff (%)', 
        'Accuracy (%) Man', 'Accuracy (%) Opt', 'Diff (%)', 
        'Eff Score Total Man', 'Eff Score Total Opt', 'Diff', 'Diff (%)',
        'Wtd Accuracy (%) Man', 'Wtd Accuracy (%) Opt', 'Diff (%)', 
        'Wtd Eff Score Total Man', 'Wtd Eff Score Total Opt', 'Diff', 'Diff (%)'],
      mandOptEffTotalTokenDeltaRows
    );

    // 2.8.1 Answer Quality Breakdown: Metrics
    const answerQualityRows = sortedAggregated.map(item => [
      item.format,
      item.variant.substring(0, 3),
      item.correctAnswers.toFixed(2),
      item.incorrectAnswers.toFixed(2),
      item.noAnswers.toFixed(2),
      item.accuracyPercent.toFixed(2),
      item.accuracyByCharPerc.toFixed(2),
    ]);
    
    this.heading(3, '2.8 Answer Per Format Breakdown');
    this.heading(4, '2.8.1 Metrics'); 
    this.table(
      ['Format', 'Variant', 'Correct Answers', 'Incorrect Answers', 'No Answers',  'Accuracy (%)',  'Accuracy by Char (%)'],
      answerQualityRows
    );
    
    // 2.8.2 Answer Per Format Breakdown: Mandatory vs Optional Data
    const mandOptAnswerDeltaRows = mandatories.map(x =>{    
      return [
        x.format,
        x.correctAnswers.toFixed(2),
        (x.correctAnswers + x.correctAnswersDelta).toFixed(2),
        this.displayDelta(x.correctAnswersDelta, 0),
        this.calcDeltaPercentage(x.correctAnswers, x.correctAnswersDelta),
        x.incorrectAnswers.toFixed(2),
        (x.incorrectAnswers + x.incorrectAnswersDelta).toFixed(2),
        this.displayDelta(x.incorrectAnswersDelta, 0),
        this.calcDeltaPercentage(x.incorrectAnswers, x.incorrectAnswersDelta),
        x.noAnswers.toFixed(2),
        (x.noAnswers + x.noAnswersDelta).toFixed(2),
        this.displayDelta(x.noAnswersDelta, 0),
        this.calcDeltaPercentage(x.noAnswers, x.noAnswersDelta),
        x.accuracyPercent.toFixed(2),
        (x.accuracyPercent + x.accuracyDelta).toFixed(2),
        this.displayDelta(x.accuracyDelta),
        x.accuracyByCharPerc.toFixed(2),
        (x.accuracyByCharPerc + x.accuracyByCharPercDelta).toFixed(2),
        this.displayDelta(x.accuracyByCharPerc)
      ];
    });
    
    this.heading(4, '2.8.2 Mandatory vs Optional Data');
    this.table(
      ['Format', 'Correct Man', 'Correct Opt', 'Diff', 'Diff (%)', 'Incorrect Man', 'Incorrect Opt', 'Diff', 'Diff (%)', 'No Answers Man', 'No Answers Opt', 'Diff', 'Diff (%)', 'Accuracy (%) Man', 'Accuracy (%) Opt', 'Diff (%)', 'Accuracy by Char (%) Man', 'Accuracy by Char (%) Opt', 'Diff (%)'],
      mandOptAnswerDeltaRows
    );

    const categoryRows = sortedAggregated.map(item => {
      const validation = this.validations.find(x => x.format === item.format && x.variant === item.variant && x.recordCount === item.recordCount);
      const retrieval = validation?.accuracy.find(x => x.category === 'field_retrieval')?.accuracyPercent ?? 0;
      const structure = validation?.accuracy.find(x => x.category === 'structure_awareness')?.accuracyPercent ?? 0;
      const filtering = validation?.accuracy.find(x => x.category === 'filtering')?.accuracyPercent ?? 0;
      const aggregation = validation?.accuracy.find(x => x.category === 'aggregation')?.accuracyPercent ?? 0;

      return [
      item.format,
      item.variant.substring(0, 3),
      item.accuracyPercent.toFixed(2),
      retrieval.toFixed(2),
      structure.toFixed(2),
      filtering.toFixed(2),
      aggregation.toFixed(2),
    ]});
    
    this.heading(3, '2.9 Accuracy Per Question Category Analysis');
    this.heading(4, '2.9.1 Metrics'); 
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
    return this.displayDelta(manVal > 0 ? (optManDelta / manVal) * 100 : 0, fixed);
  }
  
  private displayDelta(percentage: number, fixed: number = 2): string {
    return (percentage > 0 ?' +' : '') + percentage.toFixed(fixed);
  }

  private diffMandOptAccuracyPerCategory(idx:number, category: QuestionCategory): void { 
    this.heading(4, `2.9.${idx} ${this.getQuestionCategoryLabel(category)}: Mandatory vs Optional`); 
    this.line();

    const mandatoriesVals: MappingType[] = this.validations.filter(x=>x.variant === 'mandatory').flatMap(v => v.accuracy.map<MappingType>(x => ({ format: v.format, category: x.category, accuracyPercent: x.accuracyPercent})));
    const optionalsVals: MappingType[] = this.validations.filter(x=>x.variant === 'optional').flatMap(v => v.accuracy.map<MappingType>(x => ({ format: v.format, category: x.category, accuracyPercent: x.accuracyPercent})));

    const categoryMandOptRows = this.uniqueFormats.map(fmt => {
      const mandRetrieval = mandatoriesVals.find(x => x.category === category && x.format == fmt)?.accuracyPercent ?? 0;
      const optRetrieval = optionalsVals.find(x => x.category === category && x.format == fmt)?.accuracyPercent ?? 0;

      const diffRetrieval = optRetrieval - mandRetrieval;

      return [
        fmt,
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
    this.heading(2, '3. Appendices');
    this.line();

    this.heading(3, '3.1 Appendix A: Test Infrastructure');
    this.line(`- **Test Date**: ${new Date(this.metadata.generatedAt).toISOString().split('T')[0]}`);
    this.line(`- **Model**: ${this.metadata.model}`);
    this.line(`- **Thinking**: ${this.metadata.thinking}`);
    this.line(`- **Structure**: ${this.metadata.structure}`);
    this.line(`- **Formats Tested**: ${this.metadata.formats.join(', ')}`);
    this.line(`- **Record Counts**: ${this.recordCounts.join(', ')}`);
    this.line(`- **Total Test Cases**: ${this.aggregated.length}`);
    this.line();

    this.heading(3, '3.2 Appendix B: Benchmark Configuration');
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
