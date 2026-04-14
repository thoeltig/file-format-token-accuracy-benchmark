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
 *   - 2.7 Token Utilization Efficiency (Accuracy By Char)
 *   - 2.8 Answer Per Format Breakdown
 *   - 2.9 Accuracy Per Question Category Analysis
 *   - 2.10 Accuracy By Character Per Question Category Analysis
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
  weightedAccuracyPercent: number;
  accuracyByCharPerc: number;
  weightedAccuracyByCharPerc: number;
};

function mapValidation(validation: ValidationSummary){
  return validation.accuracy.map<MappingType>(x => ({ 
    format: validation.format, 
    category: x.category, 
    accuracyPercent: x.accuracyPercent, 
    weightedAccuracyPercent: x.weightedAccuracyPercent, 
    accuracyByCharPerc: x.charactersOfAnswers.accuracyByCharPerc,
    weightedAccuracyByCharPerc: x.charactersOfAnswers.weightedAccuracyByCharPerc
  }));
}

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
    this.aggregated.forEach(x => {
      x.format = x.format.toUpperCase();
      x.variant = x.variant.substring(0, 3);
    });
    this.validations = validations;
    this.validations.forEach(x => {
      x.format = x.format.toUpperCase();
      x.variant = x.variant.substring(0, 3);
    });
    this.metadata = metadata;
    this.metadata.formats = [...this.metadata.formats.map(x => x.toUpperCase())];
    this.metadata.variants = [...this.metadata.variants.map(x => x.substring(0, 3))];
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

      this.line(`   - **${this.getQuestionCategoryLabel(q[0])} (${q[1]} questions, ${this.printRounded(weightPerc)}% weight):** ${questionCategoryDescription}`);
    });
    this.line();
    
    this.heading(4, '1.2.3 Weighting Rationale');
    this.line(`- **Field retrieval + structure awareness** = ${this.printRounded(fieledretrievalAndStructureAwareness)}%`);
    this.line(`   - These represent the file format itself. Understanding "what data exists and how it's organized" which is fundamental to avoiding context confusion.`);
    this.line(`- **Filtering + aggregation** = ${this.printRounded(filteringAndAggregation)}%`);
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
    this.line('- **Information Value**: (**Accuracy** % / **Tokens**) * 100');
    this.line();

    const efficiencyScoreAccuracyPortion = this.metadata.efficiencyScoreWeight.find(x => x[0] === "accuracy")?.[1] ?? 0;
    const efficiencyScoreTokenPortion = this.metadata.efficiencyScoreWeight.find(x => x[0] === "tokens")?.[1] ?? 0;
    this.heading(4, '1.3.3 Efficiency Score');
    this.line('Composite metric balancing accuracy with normalized token count (favour towards accuracy). Each efficieny score has an indicator which token count was used in the calculation.')
    this.line(`- **Accuracy To Token Ratio** = ${this.printRounded(efficiencyScoreAccuracyPortion * 100,)} % to ${this.printRounded(efficiencyScoreTokenPortion * 100)} %`)
    this.line('- **Normalized Tokens** = (((**Max Tokens** + 10) - **Current Tokens**) / ((**Max Tokens** + 10) - (**Min Tokens** - 10))) * 100')
    this.line('- **Normalized Tokens** = (((**Max Tokens** + 10) - **Current Tokens**) / ((**Max Tokens** + 10) - (**Min Tokens** - 10))) * 100')
    this.line(`- **Efficiency Score**: (**Accuracy** % * ${efficiencyScoreAccuracyPortion}) + (**Normalized Tokens** * ${efficiencyScoreTokenPortion})`);
    this.line(`- **Weighted Efficiency Score**: (**Weighted Accuracy** % * ${efficiencyScoreAccuracyPortion}) + (**Normalized Tokens** * ${efficiencyScoreTokenPortion})`);
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
    this.line('However these values cannot be exactly applied to models of the same family or from other providers as token usage, accuracy and latency depend on specific model architectures and tokenizers. Also file reads will produce different characters depending on the used harness because some add marker characters, line numbers or additional information. While the relative ranking of file formats remains consistent the absolute numbers will vary.');
    this.line('Especially the accuracy and output tokens results will vary because these values are bound to the model size and training, instruction interpretation and reasoning token budget.');
    this.line();
  }

  private generateSummaryTLDRFormatRanking(sortedAggregated: AggregatedMetric[], mandatoriesVals: MappingType[], optionalsVals: MappingType[]){
    const optionals = sortedAggregated.filter(x => x.variant == 'opt');
    const mandatories = sortedAggregated.filter(x => x.variant == 'man');

    this.heading(3, '2.1 TLDR: Token Efficiency Analysis');
    this.line();
    this.line('*Note: All columns ranked best-to-worst. ↑ = lower value is better (ascending). ↓ = higher value is better (descending).*');
    this.line();
  
    // 2.1.1 Format Ranking
    const sortedByTotalDurationMandatories = [...mandatories].sort((ob1, ob2) => ob1.outputDurationTotalInMs > ob2.outputDurationTotalInMs ? 1 : ob1.outputDurationTotalInMs < ob2.outputDurationTotalInMs ? -1 : 0).map((x, i, arr) => this.getRankingOfDurationDisplay(x.format, i, arr[i].outputDurationTotalInMs, arr[0].outputDurationTotalInMs));
    const sortedByReadTokensMandatories = [...mandatories].sort((ob1, ob2) => ob1.readTokens > ob2.readTokens ? 1 : ob1.readTokens < ob2.readTokens ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].readTokens, arr[0].readTokens));
    const sortedByOutputTokensBeforeWriteMandatories = [...mandatories].sort((ob1, ob2) => ob1.outputTokensBeforeWrite > ob2.outputTokensBeforeWrite ? 1 : ob1.outputTokensBeforeWrite < ob2.outputTokensBeforeWrite ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].outputTokensBeforeWrite, arr[0].outputTokensBeforeWrite));
    const sortedByOutputTokensWriteMandatories = [...mandatories].sort((ob1, ob2) => ob1.outputTokensWrite > ob2.outputTokensWrite ? 1 : ob1.outputTokensWrite < ob2.outputTokensWrite ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].outputTokensWrite, arr[0].outputTokensWrite));
    const sortedByOutputTokensTotalMandatories = [...mandatories].sort((ob1, ob2) => ob1.outputTokensTotal > ob2.outputTokensTotal ? 1 : ob1.outputTokensTotal < ob2.outputTokensTotal ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].outputTokensTotal, arr[0].outputTokensTotal));
    const sortedByTotalTokensMandatories = [...mandatories].sort((ob1, ob2) => ob1.totalTokens > ob2.totalTokens ? 1 : ob1.totalTokens < ob2.totalTokens ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].totalTokens, arr[0].totalTokens));
    const sortedByAccuracyMandatories = [...mandatories].sort((ob1, ob2) => ob1.accuracyPercent < ob2.accuracyPercent ? 1 : ob1.accuracyPercent > ob2.accuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyPercent, arr[0].accuracyPercent));
    const sortedByEfficiencyScoreReadMandatories = [...mandatories].sort((ob1, ob2) => ob1.efficiencyScoreRead < ob2.efficiencyScoreRead ? 1 : ob1.efficiencyScoreRead > ob2.efficiencyScoreRead ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreRead, arr[0].efficiencyScoreRead));
    const sortedByEfficiencyScoreOutputMandatories = [...mandatories].sort((ob1, ob2) => ob1.efficiencyScoreOutput < ob2.efficiencyScoreOutput ? 1 : ob1.efficiencyScoreOutput > ob2.efficiencyScoreOutput ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreOutput, arr[0].efficiencyScoreOutput));
    const sortedByEfficiencyScoreTotalMandatories = [...mandatories].sort((ob1, ob2) => ob1.efficiencyScoreTotal < ob2.efficiencyScoreTotal ? 1 : ob1.efficiencyScoreTotal > ob2.efficiencyScoreTotal ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreTotal, arr[0].efficiencyScoreTotal));
    const sortedByAccuracyByCharPercMandatories = [...mandatories].sort((ob1, ob2) => ob1.accuracyByCharPerc < ob2.accuracyByCharPerc ? 1 : ob1.accuracyByCharPerc > ob2.accuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyByCharPerc, arr[0].accuracyByCharPerc));
    const sortedByEfficiencyScoreReadAccuracyByCharPercMandatories = [...mandatories].sort((ob1, ob2) => ob1.efficiencyScoreReadAccuracyByCharPerc < ob2.efficiencyScoreReadAccuracyByCharPerc ? 1 : ob1.efficiencyScoreReadAccuracyByCharPerc > ob2.efficiencyScoreReadAccuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreReadAccuracyByCharPerc, arr[0].efficiencyScoreReadAccuracyByCharPerc));
    const sortedByEfficiencyScoreOutputAccuracyByCharPercMandatories = [...mandatories].sort((ob1, ob2) => ob1.efficiencyScoreOutputAccuracyByCharPerc < ob2.efficiencyScoreOutputAccuracyByCharPerc ? 1 : ob1.efficiencyScoreOutputAccuracyByCharPerc > ob2.efficiencyScoreOutputAccuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreOutputAccuracyByCharPerc, arr[0].efficiencyScoreOutputAccuracyByCharPerc));
    const sortedByEfficiencyScoreTotalAccuracyByCharPercMandatories = [...mandatories].sort((ob1, ob2) => ob1.efficiencyScoreTotalAccuracyByCharPerc < ob2.efficiencyScoreTotalAccuracyByCharPerc ? 1 : ob1.efficiencyScoreTotalAccuracyByCharPerc > ob2.efficiencyScoreTotalAccuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreTotalAccuracyByCharPerc, arr[0].efficiencyScoreTotalAccuracyByCharPerc));
    
    const manRows = mandatories.map((_, i) => [
      sortedByTotalDurationMandatories[i],
      sortedByReadTokensMandatories[i],
      sortedByOutputTokensBeforeWriteMandatories[i],
      sortedByOutputTokensWriteMandatories[i],
      sortedByOutputTokensTotalMandatories[i],
      sortedByTotalTokensMandatories[i],
      sortedByAccuracyMandatories[i],
      sortedByEfficiencyScoreReadMandatories[i],
      sortedByEfficiencyScoreOutputMandatories[i],
      sortedByEfficiencyScoreTotalMandatories[i],
      sortedByAccuracyByCharPercMandatories[i],
      sortedByEfficiencyScoreReadAccuracyByCharPercMandatories[i],
      sortedByEfficiencyScoreOutputAccuracyByCharPercMandatories[i],
      sortedByEfficiencyScoreTotalAccuracyByCharPercMandatories[i],
    ]);

    this.heading(4, '2.1.1 Format Ranking');
    this.line();
    this.heading(5, 'Mandatory');
    this.line();
    this.table(
      ['↑ Total Duration', '↑ Read Tokens', '↑ Output Before Write Tokens', '↑ Output Write Tokens', '↑ Output Tokens', '↑ Total Tokens', '↓ Accuracy', '↓ Eff Score Read', '↓ Eff Score Output', '↓ Eff Score Total', '↓ Accuracy By Character', '↓ Eff Score Read (Acc By Char)', '↓ Eff Score Output (Acc By Char)', '↓ Eff Score Total (Acc By Char)'],
      manRows
    );
    this.line();
    
    const sortedByTotalDurationOptionals = [...optionals].sort((ob1, ob2) => ob1.outputDurationTotalInMs > ob2.outputDurationTotalInMs ? 1 : ob1.outputDurationTotalInMs < ob2.outputDurationTotalInMs ? -1 : 0).map((x, i, arr) => this.getRankingOfDurationDisplay(x.format, i, arr[i].outputDurationTotalInMs, arr[0].outputDurationTotalInMs));
    const sortedByReadTokensOptionals = [...optionals].sort((ob1, ob2) => ob1.readTokens > ob2.readTokens ? 1 : ob1.readTokens < ob2.readTokens ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].readTokens, arr[0].readTokens));
    const sortedByOutputTokensBeforeWriteOptionals = [...optionals].sort((ob1, ob2) => ob1.outputTokensBeforeWrite > ob2.outputTokensBeforeWrite ? 1 : ob1.outputTokensBeforeWrite < ob2.outputTokensBeforeWrite ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].outputTokensBeforeWrite, arr[0].outputTokensBeforeWrite));
    const sortedByOutputTokensWriteOptionals = [...optionals].sort((ob1, ob2) => ob1.outputTokensWrite > ob2.outputTokensWrite ? 1 : ob1.outputTokensWrite < ob2.outputTokensWrite ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].outputTokensWrite, arr[0].outputTokensWrite));
    const sortedByOutputTokensTotalOptionals = [...optionals].sort((ob1, ob2) => ob1.outputTokensTotal > ob2.outputTokensTotal ? 1 : ob1.outputTokensTotal < ob2.outputTokensTotal ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].outputTokensTotal, arr[0].outputTokensTotal));
    const sortedByTotalTokensOptionals = [...optionals].sort((ob1, ob2) => ob1.totalTokens > ob2.totalTokens ? 1 : ob1.totalTokens < ob2.totalTokens ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].totalTokens, arr[0].totalTokens));
    const sortedByAccuracyOptionals = [...optionals].sort((ob1, ob2) => ob1.accuracyPercent < ob2.accuracyPercent ? 1 : ob1.accuracyPercent > ob2.accuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyPercent, arr[0].accuracyPercent));
    const sortedByEfficiencyScoreReadOptionals = [...optionals].sort((ob1, ob2) => ob1.efficiencyScoreRead < ob2.efficiencyScoreRead ? 1 : ob1.efficiencyScoreRead > ob2.efficiencyScoreRead ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreRead, arr[0].efficiencyScoreRead));
    const sortedByEfficiencyScoreOutputOptionals = [...optionals].sort((ob1, ob2) => ob1.efficiencyScoreOutput < ob2.efficiencyScoreOutput ? 1 : ob1.efficiencyScoreOutput > ob2.efficiencyScoreOutput ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreOutput, arr[0].efficiencyScoreOutput));
    const sortedByEfficiencyScoreTotalOptionals = [...optionals].sort((ob1, ob2) => ob1.efficiencyScoreTotal < ob2.efficiencyScoreTotal ? 1 : ob1.efficiencyScoreTotal > ob2.efficiencyScoreTotal ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreTotal, arr[0].efficiencyScoreTotal));
    const sortedByAccuracyByCharPercOptionals = [...optionals].sort((ob1, ob2) => ob1.accuracyByCharPerc < ob2.accuracyByCharPerc ? 1 : ob1.accuracyByCharPerc > ob2.accuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyByCharPerc, arr[0].accuracyByCharPerc));
    const sortedByEfficiencyScoreReadAccuracyByCharPercOptionals = [...optionals].sort((ob1, ob2) => ob1.efficiencyScoreReadAccuracyByCharPerc < ob2.efficiencyScoreReadAccuracyByCharPerc ? 1 : ob1.efficiencyScoreReadAccuracyByCharPerc > ob2.efficiencyScoreReadAccuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreReadAccuracyByCharPerc, arr[0].efficiencyScoreReadAccuracyByCharPerc));
    const sortedByEfficiencyScoreOutputAccuracyByCharPercOptionals = [...optionals].sort((ob1, ob2) => ob1.efficiencyScoreOutputAccuracyByCharPerc < ob2.efficiencyScoreOutputAccuracyByCharPerc ? 1 : ob1.efficiencyScoreOutputAccuracyByCharPerc > ob2.efficiencyScoreOutputAccuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreOutputAccuracyByCharPerc, arr[0].efficiencyScoreOutputAccuracyByCharPerc));
    const sortedByEfficiencyScoreTotalAccuracyByCharPercOptionals = [...optionals].sort((ob1, ob2) => ob1.efficiencyScoreTotalAccuracyByCharPerc < ob2.efficiencyScoreTotalAccuracyByCharPerc ? 1 : ob1.efficiencyScoreTotalAccuracyByCharPerc > ob2.efficiencyScoreTotalAccuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScoreTotalAccuracyByCharPerc, arr[0].efficiencyScoreTotalAccuracyByCharPerc));
    
    const optRows = mandatories.map((_, i) => [
      sortedByTotalDurationOptionals[i],
      sortedByReadTokensOptionals[i],
      sortedByOutputTokensBeforeWriteOptionals[i],
      sortedByOutputTokensWriteOptionals[i],
      sortedByOutputTokensTotalOptionals[i],
      sortedByTotalTokensOptionals[i],
      sortedByAccuracyOptionals[i],
      sortedByEfficiencyScoreReadOptionals[i],
      sortedByEfficiencyScoreOutputOptionals[i],
      sortedByEfficiencyScoreTotalOptionals[i],
      sortedByAccuracyByCharPercOptionals[i],
      sortedByEfficiencyScoreReadAccuracyByCharPercOptionals[i],
      sortedByEfficiencyScoreOutputAccuracyByCharPercOptionals[i],
      sortedByEfficiencyScoreTotalAccuracyByCharPercOptionals[i],
    ]);

    this.heading(5, 'Optional');
    this.line();
    this.table(
      ['↑ Total Duration', '↑ Read Tokens', '↑ Output Before Write Tokens', '↑ Output Write Tokens', '↑ Output Tokens', '↑ Total Tokens', '↓ Accuracy', '↓ Eff Score Read', '↓ Eff Score Output', '↓ Eff Score Total', '↓ Accuracy By Character', '↓ Eff Score Read (Acc By Char)', '↓ Eff Score Output (Acc By Char)', '↓ Eff Score Total (Acc By Char)'],
      optRows
    );
    this.line();
    
    // 2.1.2 Category Accuracy Ranking
    const formats: string[] = [...new Set(this.validations.map(x => x.format))];
    
    const prefixArrowDown = '↓ ';
    const fieldRetrievalLabel = prefixArrowDown + this.getQuestionCategoryLabel('field_retrieval');
    const aggregationLabel = prefixArrowDown + this.getQuestionCategoryLabel('aggregation');
    const filteringLabel = prefixArrowDown + this.getQuestionCategoryLabel('filtering');
    const structureAwarenessLabel = prefixArrowDown + this.getQuestionCategoryLabel('structure_awareness');

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

    this.heading(4, '2.1.2 Category Accuracy Ranking');
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

    // 2.1.3 Category Accuracy By Character Ranking
    const manSortedByFieldRetrievalAccuracyByCharPerc = mandatoriesVals.filter(x => x.category === 'field_retrieval').sort((ob1, ob2) => ob1.accuracyByCharPerc < ob2.accuracyByCharPerc ? 1 : ob1.accuracyByCharPerc > ob2.accuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyByCharPerc, arr[0].accuracyByCharPerc));
    const manSortedByStructureAwarenessAccuracyByCharPerc = mandatoriesVals.filter(x => x.category === 'structure_awareness').sort((ob1, ob2) => ob1.accuracyByCharPerc < ob2.accuracyByCharPerc ? 1 : ob1.accuracyByCharPerc > ob2.accuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyByCharPerc, arr[0].accuracyByCharPerc));
    const manSortedByFilteringAccuracyByCharPerc = mandatoriesVals.filter(x => x.category === 'filtering').sort((ob1, ob2) => ob1.accuracyByCharPerc < ob2.accuracyByCharPerc ? 1 : ob1.accuracyByCharPerc > ob2.accuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyByCharPerc, arr[0].accuracyByCharPerc));
    const manSortedByAggregationAccuracyByCharPerc = mandatoriesVals.filter(x => x.category === 'aggregation').sort((ob1, ob2) => ob1.accuracyByCharPerc < ob2.accuracyByCharPerc ? 1 : ob1.accuracyByCharPerc > ob2.accuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyByCharPerc, arr[0].accuracyByCharPerc));
    
    const manValsRowsAccuracyByCharPerc = formats.map((_, i) => [
      manSortedByFieldRetrievalAccuracyByCharPerc[i],
      manSortedByStructureAwarenessAccuracyByCharPerc[i],
      manSortedByFilteringAccuracyByCharPerc[i],
      manSortedByAggregationAccuracyByCharPerc[i],
    ]);

    this.heading(4, '2.1.3 Category Accuracy By Character Ranking');
    this.line();
    this.heading(5, 'Mandatory');
    this.line();
    this.table(
      [fieldRetrievalLabel, structureAwarenessLabel, filteringLabel, aggregationLabel],
      manValsRowsAccuracyByCharPerc
    );
    this.line();
    
    const optSortedByFieldRetrievalAccuracyByCharPerc = optionalsVals.filter(x => x.category === 'field_retrieval').sort((ob1, ob2) => ob1.accuracyByCharPerc < ob2.accuracyByCharPerc ? 1 : ob1.accuracyByCharPerc > ob2.accuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyByCharPerc, arr[0].accuracyByCharPerc));
    const optSortedByStructureAwarenessAccuracyByCharPerc = optionalsVals.filter(x => x.category === 'structure_awareness').sort((ob1, ob2) => ob1.accuracyByCharPerc < ob2.accuracyByCharPerc ? 1 : ob1.accuracyByCharPerc > ob2.accuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyByCharPerc, arr[0].accuracyByCharPerc));
    const optSortedByFilteringAccuracyByCharPerc = optionalsVals.filter(x => x.category === 'filtering').sort((ob1, ob2) => ob1.accuracyByCharPerc < ob2.accuracyByCharPerc ? 1 : ob1.accuracyByCharPerc > ob2.accuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyByCharPerc, arr[0].accuracyByCharPerc));
    const optSortedByAggregationAccuracyByCharPerc = optionalsVals.filter(x => x.category === 'aggregation').sort((ob1, ob2) => ob1.accuracyByCharPerc < ob2.accuracyByCharPerc ? 1 : ob1.accuracyByCharPerc > ob2.accuracyByCharPerc ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].accuracyByCharPerc, arr[0].accuracyByCharPerc));
    
    const optValsRowsAccuracyByCharPerc = formats.map((_, i) => [
      optSortedByFieldRetrievalAccuracyByCharPerc[i],
      optSortedByStructureAwarenessAccuracyByCharPerc[i],
      optSortedByFilteringAccuracyByCharPerc[i],
      optSortedByAggregationAccuracyByCharPerc[i],
    ]);

    this.heading(5, 'Optional');
    this.line();
    this.table(
      [fieldRetrievalLabel, structureAwarenessLabel, filteringLabel, aggregationLabel],
      optValsRowsAccuracyByCharPerc
    );
    this.line();

    // 2.1.4 Conclusion
    this.heading(4, '2.1.4 Conclusion');
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
    return format + (idx > 0 ? ` (${this.printRounded(current/first*100-100, 2, true)}%)` : ` ≈ ${this.printRounded(current, 0)}${suffix}`);
  }
  
  private getRankingOfPercentageDisplay(format: string, idx: number, current: number, first: number){
    return format + (idx > 0 ? ` (${this.printRounded(current-first, 2, true)}%)` : ` ≈ ${this.printRounded(current)}%`);
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
    const mandatories = sortedAggregated.filter(x => x.variant == 'man');
    const mandatoriesVals: MappingType[] = this.validations.filter(x=>x.variant === 'man').flatMap(v => mapValidation(v));
    const optionalsVals: MappingType[] = this.validations.filter(x=>x.variant === 'opt').flatMap(v => mapValidation(v));

    // 2.1 Token Efficiency Analysis
    this.generateSummaryTLDRFormatRanking(sortedAggregated, mandatoriesVals, optionalsVals);

    // 2.2 Comprehensive Benchmark Metrics
    const rows = sortedAggregated.map(item => [
      item.format,
      item.variant,
      this.printRounded(item.readTokens, 0),
      this.printRounded(item.outputTokensTotal, 0),
      this.printRounded(item.totalTokens, 0),
      this.printRounded(item.charsPerReadToken),
      this.printRounded(item.outputTokensWritePerAnswer),
      this.printRounded(item.accuracyPercent),
      this.printRounded(item.usefulReadTokens, 0),
      this.printRounded(item.wastedReadTokens, 0),
      this.printRounded(item.usefulOutputTokens, 0),
      this.printRounded(item.wastedOutputTokens, 0),
      this.printRounded(item.efficiencyScoreRead),
      this.printRounded(item.efficiencyScoreOutput),
      this.printRounded(item.efficiencyScoreTotal),
      this.printRounded(item.accuracyByCharPerc),
      this.printRounded(item.usefulReadTokensAccuracyByCharPerc, 0),
      this.printRounded(item.wastedReadTokensAccuracyByCharPerc, 0),
      this.printRounded(item.usefulOutputTokensAccuracyByCharPerc, 0),
      this.printRounded(item.wastedOutputTokensAccuracyByCharPerc, 0),
      this.printRounded(item.efficiencyScoreReadAccuracyByCharPerc),
      this.printRounded(item.efficiencyScoreOutputAccuracyByCharPerc),
      this.printRounded(item.efficiencyScoreTotalAccuracyByCharPerc),
    ]);

    this.heading(3, '2.2 Comprehensive Benchmark Metrics');
    this.table(
      ['Format', 'Variant', 'Read Tokens', 'Output Tokens', 'Total Tokens', 'Char / Read Token', 'Output Write Tokens / Answer', 
        'Accuracy (%)', 'Useful Read Tokens', 'Wasted Read Tokens', 'Useful Output Tokens', 'Wasted Output Tokens', 'Eff Score Read', 'Eff Score Output', 'Eff Score Total', 
        'Accuracy By Character (%)', 'Useful Read Tokens (Acc By Char)', 'Wasted Read Tokens (Acc By Char)', 'Useful Output Tokens (Acc By Char)', 'Wasted Output Tokens (Acc By Char)', 'Eff Score Read (Acc By Char)', 'Eff Score Output (Acc By Char)', 'Eff Score Total (Acc By Char)'],
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
        this.printRounded(mandReadTokensUsed, 0),
        this.printRounded(optReadTokensUsed, 0),
        this.displayDelta(readTokenDiff, 0),
        this.calcDeltaPercentage(mandReadTokensUsed, readTokenDiff),
        this.printRounded(mandOutputTokensBeforeWrite, 0),
        this.printRounded(optOutputTokensBeforeWrite, 0),
        this.displayDelta(outputTokensBeforeWriteDiff, 0),
        this.calcDeltaPercentage(mandOutputTokensBeforeWrite, outputTokensBeforeWriteDiff),
        this.printRounded(mandOutputTokensWrite, 0),
        this.printRounded(optOutputTokensWrite, 0),
        this.displayDelta(outputTokensWriteDiff, 0),
        this.calcDeltaPercentage(mandOutputTokensWrite, outputTokensWriteDiff),
        this.printRounded(mandOutputTokensTotal, 0),
        this.printRounded(optOutputTokensTotal, 0),
        this.displayDelta(outputTokensTotalDiff, 0),
        this.calcDeltaPercentage(mandOutputTokensTotal, outputTokensTotalDiff),
        this.printRounded(mandtotalTokens, 0),
        this.printRounded(optTotalTokensUsed, 0),
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
      const readDuration = Math.round(item.readDurationInMs);
      const outputDurationWrite = Math.round(item.outputDurationWriteInMs);

      const totalDurationInMs = readDuration+outputDurationWrite;
      const totalTokensPerMs = item.readTokensPerMs+item.outputTokensWritePerMs;
      return [
        item.format,
        item.variant,
        this.printRounded(readDuration, 0),
        this.printRounded(item.readTokensPerMs),
        this.printRounded(readDuration / item.recordCount),
        this.printRounded(item.outputDurationBeforeWriteInMs, 0),
        this.printRounded(outputDurationWrite, 0),
        this.printRounded(item.outputTokensWritePerMs),
        this.printRounded(outputDurationWrite / item.totalQuestions),
        this.printRounded(totalDurationInMs, 0),
        this.printRounded(totalTokensPerMs),
        this.printRounded(totalDurationInMs / (item.recordCount + item.totalQuestions)),
        this.printRounded(item.outputDurationTotalInMs, 0),
      ];
    });
    
    this.heading(3, '2.4 Performance');
    this.heading(4, '2.4.1 Metrics');
    this.table(
      ['Format', 'Variant', 'Read (ms)', 'Read (tokens/ms)', 'Rate (ms/record)', 'Output Before Write (ms)', 'Output Write (ms)', 'Output Write (tokens/ms)', 'Rate (ms/question)', 'Read + Output Write (ms)', 'Read + Output Write (tokens/ms)', 'Rate (ms/record+question)', 'Output (ms)'],
      readPerfRows
    );
    
    // 2.4.2 Performance: Mandatory vs Optional Data
    const mandOptSpeedDeltaRows = mandatories.map(x =>{    
      const manReadDuration = Math.round(x.readDurationInMs);
      const readDurationDelta = Math.round(x.readDurationInMsDelta);
      const manOutputDurationBeforeWrite = x.outputDurationBeforeWriteInMs / 1000;
      const outputDurationBeforeWriteDelta = x.outputDurationBeforeWriteInMsDelta / 1000;
      const manOutputDurationWrite = x.outputDurationWriteInMs / 1000;
      const outputDurationWriteDelta = x.outputDurationWriteInMsDelta / 1000;
      const manTotalDuration = manReadDuration / 1000 + manOutputDurationWrite;
      const totalDurationDelta = readDurationDelta / 1000 + outputDurationWriteDelta;
      const manOutputDurationTotal = x.outputDurationTotalInMs / 1000;
      const outputDurationTotalDelta = x.outputDurationTotalInMsDelta / 1000;
      return [
        x.format,
        this.printRounded(manReadDuration, 0),
        this.printRounded(manReadDuration + readDurationDelta, 0),
        this.displayDelta(readDurationDelta, 0),
        this.calcDeltaPercentage(manReadDuration, readDurationDelta),
        this.printRounded(manOutputDurationBeforeWrite),
        this.printRounded(manOutputDurationBeforeWrite + outputDurationBeforeWriteDelta),
        this.displayDelta(outputDurationBeforeWriteDelta),
        this.calcDeltaPercentage(manOutputDurationBeforeWrite, outputDurationBeforeWriteDelta),
        this.printRounded(manOutputDurationWrite),
        this.printRounded(manOutputDurationWrite + outputDurationWriteDelta),
        this.displayDelta(outputDurationWriteDelta),
        this.calcDeltaPercentage(manOutputDurationWrite, outputDurationWriteDelta),
        this.printRounded(manTotalDuration),
        this.printRounded(manTotalDuration + totalDurationDelta),
        this.displayDelta(totalDurationDelta),
        this.calcDeltaPercentage(manTotalDuration, totalDurationDelta),
        this.printRounded(manOutputDurationTotal),
        this.printRounded(manOutputDurationTotal + outputDurationTotalDelta),
        this.displayDelta(outputDurationTotalDelta),
        this.calcDeltaPercentage(manOutputDurationTotal, outputDurationTotalDelta),
      ];
    });
    
    this.heading(4, '2.4.2 Mandatory vs Optional');
    this.table(
      ['Format', 
        'Read Man (ms)', 'Read Opt (ms)', 'Diff (ms)', 'Diff (%)', 
        'Output Before Write Man (s)', 'Output Before Write Opt (s)', 'Diff (s)', 'Diff (%)', 
        'Output Write Man (s)', 'Output Write Opt (s)', 'Diff (s)', 'Diff (%)', 
        'Read + Output Write Man (s)', 'Read + Output Write Opt (s)', 'Diff (s)', 'Diff (%)',
        'Output Man (s)', 'Output Opt (s)', 'Diff (s)', 'Diff (%)'],
      mandOptSpeedDeltaRows
    );

    // 2.5.1 Structural Efficiency Metrics
    const structRows = sortedAggregated.map(item => [
      item.format,
      item.variant,
      this.printRounded(item.charsPerReadToken),
      this.printRounded(item.readTokensPerValue),
      this.printRounded(item.readTokensPerObject),
      this.printRounded(item.informationValuePerReadTokens),
      this.printRounded(item.informationValuePerOutputTokens),
      this.printRounded(item.informationValuePerTotalTokens),
      this.printRounded(item.informationValuePerReadTokensAccuracyByCharPerc),
      this.printRounded(item.informationValuePerOutputTokensAccuracyByCharPerc),
      this.printRounded(item.informationValuePerTotalTokensAccuracyByCharPerc)
    ]);
    
    this.heading(3, '2.5 Structural Efficiency');
    this.heading(4, '2.5.1 Metrics');
    this.table(
      ['Format', 'Variant', 'Chars / Read Token', 'Read Tokens / Value', 'Read Tokens / Object', 'Info / Read Token', 'Info / Output Token', 'Info / Total Token', 'Info / Read Token (Acc By Char)', 'Info / Output Token (Acc By Char)', 'Info / Total Token (Acc By Char)'],
      structRows
    );

    // 2.5.2 Structural Efficiency: Mandatory vs Optional Data
    const mandOptStructuralDeltaRows = mandatories.map(x =>{    
      return [
        x.format,
        this.printRounded(x.charsPerReadToken),
        this.printRounded(x.charsPerReadToken + x.charsPerReadTokenDelta),
        this.displayDelta(x.charsPerReadTokenDelta),
        this.calcDeltaPercentage(x.charsPerReadToken, x.charsPerReadTokenDelta),
        this.printRounded(x.readTokensPerValue),
        this.printRounded(x.readTokensPerValue + x.readTokensPerValueDelta),
        this.displayDelta(x.readTokensPerValueDelta),
        this.calcDeltaPercentage(x.readTokensPerValue, x.readTokensPerValueDelta),
        this.printRounded(x.readTokensPerObject),
        this.printRounded(x.readTokensPerObject + x.readTokensPerObjectDelta),
        this.displayDelta(x.readTokensPerObjectDelta),
        this.calcDeltaPercentage(x.readTokensPerObject, x.readTokensPerObjectDelta),
      ];
    });
    
    this.heading(4, '2.5.2 Characters And Values: Mandatory vs Optional');
    this.table(
      ['Format', 'Chars / Read Token Man', 'Chars / Read Token Opt', 'Diff', 'Diff (%)', 'Read Tokens / Value Man', 'Read Tokens / Value Opt', 'Diff', 'Diff (%)', 'Read Tokens / Object Man', 'Read Tokens / Object Opt', 'Diff', 'Diff (%)'],
      mandOptStructuralDeltaRows
    );
    
    // 2.5.3 Structural Efficiency: Information: Mandatory vs Optional Data
    const mandOptStructuralInformationDeltaRows = mandatories.map(x =>{    
      return [
        x.format,
        this.printRounded(x.informationValuePerReadTokens),
        this.printRounded(x.informationValuePerReadTokens + x.informationValuePerReadTokensDelta),
        this.displayDelta(x.informationValuePerReadTokensDelta),
        this.calcDeltaPercentage(x.informationValuePerReadTokens, x.informationValuePerReadTokensDelta),
        this.printRounded(x.informationValuePerOutputTokens),
        this.printRounded(x.informationValuePerOutputTokens + x.informationValuePerOutputTokensDelta),
        this.displayDelta(x.informationValuePerOutputTokensDelta),
        this.calcDeltaPercentage(x.informationValuePerOutputTokens, x.informationValuePerOutputTokensDelta),
        this.printRounded(x.informationValuePerTotalTokens),
        this.printRounded(x.informationValuePerTotalTokens + x.informationValuePerTotalTokensDelta),
        this.displayDelta(x.informationValuePerTotalTokensDelta),
        this.calcDeltaPercentage(x.informationValuePerTotalTokens, x.informationValuePerTotalTokensDelta),
      ];
    });
    
    this.heading(4, '2.5.3 Information: Mandatory vs Optional');
    this.table(
      ['Format', 'Info / Read Token Man', 'Info / Read Token Opt', 'Diff', 'Diff (%)', 'Info / Output Token Man', 'Info / Output Token Opt', 'Diff', 'Diff (%)', 'Info / Total Token Man', 'Info / Total Token Opt', 'Diff', 'Diff (%)'],
      mandOptStructuralInformationDeltaRows
    );
        
    // 2.5.4 Structural Efficiency: Information (Accuracy By Character):  Mandatory vs Optional Data
    const mandOptStructuralInformationByCharacterDeltaRows = mandatories.map(x =>{    
      return [
        x.format,
        this.printRounded(x.informationValuePerReadTokensAccuracyByCharPerc),
        this.printRounded(x.informationValuePerReadTokensAccuracyByCharPerc + x.informationValuePerReadTokensAccuracyByCharPercDelta),
        this.displayDelta(x.informationValuePerReadTokensAccuracyByCharPercDelta),
        this.calcDeltaPercentage(x.informationValuePerReadTokensAccuracyByCharPerc, x.informationValuePerReadTokensAccuracyByCharPercDelta),
        this.printRounded(x.informationValuePerOutputTokensAccuracyByCharPerc),
        this.printRounded(x.informationValuePerOutputTokensAccuracyByCharPerc + x.informationValuePerOutputTokensAccuracyByCharPercDelta),
        this.displayDelta(x.informationValuePerOutputTokensAccuracyByCharPercDelta),
        this.calcDeltaPercentage(x.informationValuePerOutputTokensAccuracyByCharPerc, x.informationValuePerOutputTokensAccuracyByCharPercDelta),
        this.printRounded(x.informationValuePerTotalTokensAccuracyByCharPerc),
        this.printRounded(x.informationValuePerTotalTokensAccuracyByCharPerc + x.informationValuePerTotalTokensAccuracyByCharPercDelta),
        this.displayDelta(x.informationValuePerTotalTokensAccuracyByCharPercDelta),
        this.calcDeltaPercentage(x.informationValuePerTotalTokensAccuracyByCharPerc, x.informationValuePerTotalTokensAccuracyByCharPercDelta),
      ];
    });
    
    this.heading(4, '2.5.4 Information (Accuracy By Character): Mandatory vs Optional');
    this.table(
      ['Format', 'Info / Read Token (Acc By Char) Man', 'Info / Read Token (Acc By Char) Opt', 'Diff', 'Diff (%)', 'Info / Output Token (Acc By Char) Man', 'Info / Output Token (Acc By Char)  Opt', 'Diff', 'Diff (%)', 'Info / Total Token (Acc By Char) Man', 'Info / Total Token (Acc By Char) Opt', 'Diff', 'Diff (%)'],
      mandOptStructuralInformationByCharacterDeltaRows
    );

    // 2.6.1 Token Utilization Efficiency: Metrics
    const effTokenRows = sortedAggregated.map(item => [
      item.format,
      item.variant,
      this.printRounded(item.readTokens, 0),
      this.printRounded(item.usefulReadTokens, 0),
      this.printRounded(item.wastedReadTokens, 0),
      this.printRounded(item.outputTokensTotal, 0),
      this.printRounded(item.usefulOutputTokens, 0),
      this.printRounded(item.wastedOutputTokens, 0),
      this.printRounded(item.totalTokens, 0),
      this.printRounded(item.usefulTotalTokens, 0),
      this.printRounded(item.wastedTotalTokens, 0),
      this.printRounded(item.accuracyPercent),
      this.printRounded(item.efficiencyScoreRead),
      this.printRounded(item.efficiencyScoreOutput),
      this.printRounded(item.efficiencyScoreTotal),
      this.printRounded(item.weightedAccuracyPercent),
      this.printRounded(item.weightedEfficiencyScoreRead),
      this.printRounded(item.weightedEfficiencyScoreOutput),
      this.printRounded(item.weightedEfficiencyScoreTotal),
    ]);
    
    this.heading(3, '2.6 Token Utilization Efficiency');
    this.heading(4, '2.6.1 Metrics'); 
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

    // 2.6.2 Read Token Utilization Efficiency: Mandatory vs Optional Data
    const mandOptEffReadTokenDeltaRows = mandatories.map(x =>{
      const readTokens = Math.round(x.readTokens);
      const usefulReadTokens = Math.round(x.usefulReadTokens);
      const wastedReadTokens = Math.round(x.wastedReadTokens);
      return [
        x.format,
        this.printRounded(readTokens, 0),
        this.printRounded(readTokens + x.readTokensDelta, 0),
        this.displayDelta(x.readTokensDelta, 0),
        this.calcDeltaPercentage(readTokens, x.readTokensDelta),
        this.printRounded(usefulReadTokens, 0),
        this.printRounded(usefulReadTokens + x.usefulReadTokensDelta, 0),
        this.displayDelta(x.usefulReadTokensDelta, 0),
        this.calcDeltaPercentage(usefulReadTokens, x.usefulReadTokensDelta),
        this.printRounded(wastedReadTokens, 0),
        this.printRounded(wastedReadTokens + x.wastedReadTokensDelta, 0),
        this.displayDelta(x.wastedReadTokensDelta, 0),
        this.calcDeltaPercentage(wastedReadTokens, x.wastedReadTokensDelta),
        this.printRounded(x.accuracyPercent),
        this.printRounded(x.accuracyPercent + x.accuracyDelta),
        this.displayDelta(x.accuracyDelta),
        this.printRounded(x.efficiencyScoreRead),
        this.printRounded(x.efficiencyScoreRead + x.efficiencyScoreReadDelta),
        this.displayDelta(x.efficiencyScoreReadDelta),
        this.calcDeltaPercentage(x.efficiencyScoreRead, x.efficiencyScoreReadDelta),
        this.printRounded(x.weightedAccuracyPercent),
        this.printRounded(x.weightedAccuracyPercent + x.weightedAccuracyDelta),
        this.displayDelta(x.weightedAccuracyDelta),
        this.printRounded(x.weightedEfficiencyScoreRead),
        this.printRounded(x.weightedEfficiencyScoreRead + x.weightedEfficiencyScoreReadDelta),
        this.displayDelta(x.weightedEfficiencyScoreReadDelta),
        this.calcDeltaPercentage(x.weightedEfficiencyScoreRead, x.weightedEfficiencyScoreReadDelta)
      ];
    });
    
    this.heading(4, '2.6.2 Read Tokens: Mandatory vs Optional Data');
    this.table(
      ['Format', 
        'Read Tokens Man', 'Read Tokens Opt', 'Diff', 'Diff (%)', 'Useful Read Tokens Man', 'Useful Read Tokens Opt', 'Diff', 'Diff (%)', 'Wasted Read Tokens Man', 'Wasted Read Tokens Opt', 'Diff', 'Diff (%)',
        'Accuracy (%) Man', 'Accuracy (%) Opt', 'Diff (%)', 
        'Eff Score Read Man', 'Eff Score Read Opt', 'Diff', 'Diff (%)',
        'Wtd Accuracy (%) Man', 'Wtd Accuracy (%) Opt', 'Diff (%)', 
        'Wtd Eff Score Read Man', 'Wtd Eff Score Read Opt', 'Diff', 'Diff (%)'],
      mandOptEffReadTokenDeltaRows
    );
    
    // 2.6.3 Output Token Utilization Efficiency: Mandatory vs Optional Data
    const mandOptEffOutputTokenDeltaRows = mandatories.map(x =>{
      const outputTokens = Math.round(x.outputTokensTotal);
      const usefulOutputTokens = Math.round(x.usefulOutputTokens);
      const wastedOutputTokens = Math.round(x.wastedOutputTokens);
      return [
        x.format,   
        this.printRounded(outputTokens, 0),
        this.printRounded(outputTokens + x.outputTokensTotalDelta, 0),
        this.displayDelta(x.outputTokensTotalDelta, 0),
        this.calcDeltaPercentage(outputTokens, x.outputTokensTotalDelta),
        this.printRounded(usefulOutputTokens, 0),
        this.printRounded(usefulOutputTokens + x.usefulOutputTokensDelta, 0),
        this.displayDelta(x.usefulOutputTokensDelta, 0),
        this.calcDeltaPercentage(usefulOutputTokens, x.usefulOutputTokensDelta),
        this.printRounded(wastedOutputTokens, 0),
        this.printRounded(wastedOutputTokens + x.wastedOutputTokensDelta, 0),
        this.displayDelta(x.wastedOutputTokensDelta, 0),
        this.calcDeltaPercentage(wastedOutputTokens, x.wastedOutputTokensDelta),
        this.printRounded(x.accuracyPercent),
        this.printRounded(x.accuracyPercent + x.accuracyDelta),
        this.displayDelta(x.accuracyDelta),
        this.printRounded(x.efficiencyScoreOutput),
        this.printRounded(x.efficiencyScoreOutput + x.efficiencyScoreOutputDelta),
        this.displayDelta(x.efficiencyScoreOutputDelta),
        this.calcDeltaPercentage(x.efficiencyScoreOutput, x.efficiencyScoreOutputDelta),
        this.printRounded(x.weightedAccuracyPercent),
        this.printRounded(x.weightedAccuracyPercent + x.weightedAccuracyDelta),
        this.displayDelta(x.weightedAccuracyDelta),
        this.printRounded(x.weightedEfficiencyScoreOutput),
        this.printRounded(x.weightedEfficiencyScoreOutput + x.weightedEfficiencyScoreOutputDelta),
        this.displayDelta(x.weightedEfficiencyScoreOutputDelta),
        this.calcDeltaPercentage(x.weightedEfficiencyScoreOutput, x.weightedEfficiencyScoreOutputDelta),
      ];
    });
    
    this.heading(4, '2.6.3 Output Tokens: Mandatory vs Optional Data');
    this.table(
      ['Format',
        'Output Tokens Man', 'Output Tokens Opt', 'Diff', 'Diff (%)', 'Useful Output Tokens Man', 'Useful Output Tokens Opt', 'Diff', 'Diff (%)', 'Wasted Output Tokens Man', 'Wasted Output Tokens Opt', 'Diff', 'Diff (%)',
        'Accuracy (%) Man', 'Accuracy (%) Opt', 'Diff (%)',
        'Eff Score Output Man', 'Eff Score Output Opt', 'Diff', 'Diff (%)',
        'Wtd Accuracy (%) Man', 'Wtd Accuracy (%) Opt', 'Diff (%)',
        'Wtd Eff Score Output Man', 'Wtd Eff Score Output Opt', 'Diff', 'Diff (%)'],
      mandOptEffOutputTokenDeltaRows
    );
    
    // 2.6.4 Total Token Utilization Efficiency: Mandatory vs Optional Data
    const mandOptEffTotalTokenDeltaRows = mandatories.map(x =>{
      const totalTokens = Math.round(x.totalTokens);
      const usefulTotalTokens = Math.round(x.usefulTotalTokens);
      const wastedTotalTokens = Math.round(x.wastedTotalTokens);
      return [
        x.format,
        this.printRounded(totalTokens, 0),
        this.printRounded(totalTokens + x.totalTokensDelta, 0),
        this.displayDelta(x.totalTokensDelta, 0),
        this.calcDeltaPercentage(totalTokens, x.totalTokensDelta),
        this.printRounded(usefulTotalTokens, 0),
        this.printRounded(usefulTotalTokens + x.usefulTotalTokensDelta, 0),
        this.displayDelta(x.usefulTotalTokensDelta, 0),
        this.calcDeltaPercentage(usefulTotalTokens, x.usefulTotalTokensDelta),
        this.printRounded(wastedTotalTokens, 0),
        this.printRounded(wastedTotalTokens + x.wastedTotalTokensDelta, 0),
        this.displayDelta(x.wastedTotalTokensDelta, 0),
        this.calcDeltaPercentage(wastedTotalTokens, x.wastedTotalTokensDelta),
        this.printRounded(x.accuracyPercent),
        this.printRounded(x.accuracyPercent + x.accuracyDelta),
        this.displayDelta(x.accuracyDelta),
        this.printRounded(x.efficiencyScoreTotal),
        this.printRounded(x.efficiencyScoreTotal + x.efficiencyScoreTotalDelta),
        this.displayDelta(x.efficiencyScoreTotalDelta),
        this.calcDeltaPercentage(x.efficiencyScoreTotal, x.efficiencyScoreTotalDelta),
        this.printRounded(x.weightedAccuracyPercent),
        this.printRounded(x.weightedAccuracyPercent + x.weightedAccuracyDelta),
        this.displayDelta(x.weightedAccuracyDelta),
        this.printRounded(x.weightedEfficiencyScoreTotal),
        this.printRounded(x.weightedEfficiencyScoreTotal + x.weightedEfficiencyScoreTotalDelta),
        this.displayDelta(x.weightedEfficiencyScoreTotalDelta),
        this.calcDeltaPercentage(x.weightedEfficiencyScoreTotal, x.weightedEfficiencyScoreTotalDelta),
      ];
    });
    
    this.heading(4, '2.6.4 Total Tokens: Mandatory vs Optional Data');
    this.table(
      ['Format', 
        'Total Tokens Man', 'Total Tokens Opt', 'Diff', 'Diff (%)', 'Useful Total Tokens Man', 'Useful Total Tokens Opt', 'Diff', 'Diff (%)', 'Wasted Total Tokens Man', 'Wasted Total Tokens Opt', 'Diff', 'Diff (%)', 
        'Accuracy (%) Man', 'Accuracy (%) Opt', 'Diff (%)', 
        'Eff Score Total Man', 'Eff Score Total Opt', 'Diff', 'Diff (%)',
        'Wtd Accuracy (%) Man', 'Wtd Accuracy (%) Opt', 'Diff (%)', 
        'Wtd Eff Score Total Man', 'Wtd Eff Score Total Opt', 'Diff', 'Diff (%)'],
      mandOptEffTotalTokenDeltaRows
    );

    // 2.7.1 Token Utilization Efficiency: Metrics
    const effTokenRowsAccuracyByCharPerc = sortedAggregated.map(item => [
      item.format,
      item.variant,
      this.printRounded(item.readTokens, 0),
      this.printRounded(item.usefulReadTokensAccuracyByCharPerc, 0),
      this.printRounded(item.wastedReadTokensAccuracyByCharPerc, 0),
      this.printRounded(item.outputTokensTotal, 0),
      this.printRounded(item.usefulOutputTokensAccuracyByCharPerc, 0),
      this.printRounded(item.wastedOutputTokensAccuracyByCharPerc, 0),
      this.printRounded(item.totalTokens, 0),
      this.printRounded(item.usefulTotalTokensAccuracyByCharPerc, 0),
      this.printRounded(item.wastedTotalTokensAccuracyByCharPerc, 0),
      this.printRounded(item.accuracyByCharPerc),
      this.printRounded(item.efficiencyScoreReadAccuracyByCharPerc),
      this.printRounded(item.efficiencyScoreOutputAccuracyByCharPerc),
      this.printRounded(item.efficiencyScoreTotalAccuracyByCharPerc),
      this.printRounded(item.weightedAccuracyByCharPerc),
      this.printRounded(item.weightedEfficiencyScoreReadAccuracyByCharPerc),
      this.printRounded(item.weightedEfficiencyScoreOutputAccuracyByCharPerc),
      this.printRounded(item.weightedEfficiencyScoreTotalAccuracyByCharPerc),
    ]);
    
    this.heading(3, '2.7 Token Utilization Efficiency (Accuracy by Character)');
    this.heading(4, '2.7.1 Metrics'); 
    this.table(
      ['Format', 'Variant', 
        'Read Tokens', 'Useful Read Tokens', 'Wasted Read Tokens', 
        'Output Tokens', 'Useful Output Tokens', 'Wasted Output Tokens', 
        'Total Tokens', 'Useful Total Tokens', 'Wasted Total Tokens', 
        'Accuracy by Character (%)',
        'Eff Score Read', 'Eff Score Output', 'Eff Score Total', 
        'Wtd Accuracy by Character (%)',
        'Wtd Eff Score Read', 'Wtd Eff Score Output', 'Wtd Eff Score Total'],
      effTokenRowsAccuracyByCharPerc
    );

    // 2.7.2 Read Token Utilization Efficiency (Accuracy by Character): Mandatory vs Optional Data
    const mandOptEffReadTokenDeltaRowsAccuracyByCharPerc = mandatories.map(x =>{
      const readTokens = Math.round(x.readTokens);
      const usefulReadTokens = Math.round(x.usefulReadTokensAccuracyByCharPerc);
      const wastedReadTokens = Math.round(x.wastedReadTokensAccuracyByCharPerc);
      return [
        x.format,
        this.printRounded(readTokens, 0),
        this.printRounded(readTokens + x.readTokensDelta, 0),
        this.displayDelta(x.readTokensDelta, 0),
        this.calcDeltaPercentage(readTokens, x.readTokensDelta),
        this.printRounded(usefulReadTokens, 0),
        this.printRounded(usefulReadTokens + x.usefulReadTokensAccuracyByCharPercDelta, 0),
        this.displayDelta(x.usefulReadTokensAccuracyByCharPercDelta, 0),
        this.calcDeltaPercentage(usefulReadTokens, x.usefulReadTokensAccuracyByCharPercDelta),
        this.printRounded(wastedReadTokens, 0),
        this.printRounded(wastedReadTokens + x.wastedReadTokensAccuracyByCharPercDelta, 0),
        this.displayDelta(x.wastedReadTokensAccuracyByCharPercDelta, 0),
        this.calcDeltaPercentage(wastedReadTokens, x.wastedReadTokensAccuracyByCharPercDelta),
        this.printRounded(x.accuracyByCharPerc),
        this.printRounded(x.accuracyByCharPerc + x.accuracyByCharPercDelta),
        this.displayDelta(x.accuracyByCharPercDelta),
        this.printRounded(x.efficiencyScoreReadAccuracyByCharPerc),
        this.printRounded(x.efficiencyScoreReadAccuracyByCharPerc + x.efficiencyScoreReadAccuracyByCharPercDelta),
        this.displayDelta(x.efficiencyScoreReadAccuracyByCharPercDelta),
        this.calcDeltaPercentage(x.efficiencyScoreReadAccuracyByCharPerc, x.efficiencyScoreReadAccuracyByCharPercDelta),
        this.printRounded(x.weightedAccuracyByCharPerc),
        this.printRounded(x.weightedAccuracyByCharPerc + x.weightedAccuracyByCharPercDelta),
        this.displayDelta(x.weightedAccuracyByCharPercDelta),
        this.printRounded(x.weightedEfficiencyScoreReadAccuracyByCharPerc),
        this.printRounded(x.weightedEfficiencyScoreReadAccuracyByCharPerc + x.weightedEfficiencyScoreReadAccuracyByCharPercDelta),
        this.displayDelta(x.weightedEfficiencyScoreReadAccuracyByCharPercDelta),
        this.calcDeltaPercentage(x.weightedEfficiencyScoreReadAccuracyByCharPerc, x.weightedEfficiencyScoreReadAccuracyByCharPercDelta)
      ];
    });
    
    this.heading(4, '2.7.2 Read Tokens (Accuracy by Character): Mandatory vs Optional Data');
    this.table(
      ['Format', 
        'Read Tokens Man', 'Read Tokens Opt', 'Diff', 'Diff (%)', 'Useful Read Tokens Man', 'Useful Read Tokens Opt', 'Diff', 'Diff (%)', 'Wasted Read Tokens Man', 'Wasted Read Tokens Opt', 'Diff', 'Diff (%)',
        'Accuracy by Character (%) Man', 'Accuracy by Character (%) Opt', 'Diff (%)', 
        'Eff Score Read Man', 'Eff Score Read Opt', 'Diff', 'Diff (%)',
        'Wtd Accuracy by Character (%) Man', 'Wtd Accuracy by Character (%) Opt', 'Diff (%)', 
        'Wtd Eff Score Read Man', 'Wtd Eff Score Read Opt', 'Diff', 'Diff (%)'],
      mandOptEffReadTokenDeltaRowsAccuracyByCharPerc
    );
    
    // 2.7.3 Output Token Utilization Efficiency (Accuracy by Character): Mandatory vs Optional Data
    const mandOptEffOutputTokenDeltaRowsAccuracyByCharPerc = mandatories.map(x =>{
      const outputTokens = Math.round(x.outputTokensTotal);
      const usefulOutputTokens = Math.round(x.usefulOutputTokensAccuracyByCharPerc);
      const wastedOutputTokens = Math.round(x.wastedOutputTokensAccuracyByCharPerc);
      return [
        x.format,   
        this.printRounded(outputTokens, 0),
        this.printRounded(outputTokens + x.outputTokensTotalDelta, 0),
        this.displayDelta(x.outputTokensTotalDelta, 0),
        this.calcDeltaPercentage(outputTokens, x.outputTokensTotalDelta),
        this.printRounded(usefulOutputTokens, 0),
        this.printRounded(usefulOutputTokens + x.usefulOutputTokensAccuracyByCharPercDelta, 0),
        this.displayDelta(x.usefulOutputTokensAccuracyByCharPercDelta, 0),
        this.calcDeltaPercentage(usefulOutputTokens, x.usefulOutputTokensAccuracyByCharPercDelta),
        this.printRounded(wastedOutputTokens, 0),
        this.printRounded(wastedOutputTokens + x.wastedOutputTokensAccuracyByCharPercDelta, 0),
        this.displayDelta(x.wastedOutputTokensAccuracyByCharPercDelta, 0),
        this.calcDeltaPercentage(wastedOutputTokens, x.wastedOutputTokensAccuracyByCharPercDelta),
        this.printRounded(x.accuracyByCharPerc),
        this.printRounded(x.accuracyByCharPerc + x.accuracyByCharPercDelta),
        this.displayDelta(x.accuracyByCharPercDelta),
        this.printRounded(x.efficiencyScoreOutputAccuracyByCharPerc),
        this.printRounded(x.efficiencyScoreOutputAccuracyByCharPerc + x.efficiencyScoreOutputAccuracyByCharPercDelta),
        this.displayDelta(x.efficiencyScoreOutputAccuracyByCharPercDelta),
        this.calcDeltaPercentage(x.efficiencyScoreOutputAccuracyByCharPerc, x.efficiencyScoreOutputAccuracyByCharPercDelta),
        this.printRounded(x.weightedAccuracyByCharPerc),
        this.printRounded(x.weightedAccuracyByCharPerc + x.weightedAccuracyByCharPercDelta),
        this.displayDelta(x.weightedAccuracyByCharPercDelta),
        this.printRounded(x.weightedEfficiencyScoreOutputAccuracyByCharPerc),
        this.printRounded(x.weightedEfficiencyScoreOutputAccuracyByCharPerc + x.weightedEfficiencyScoreOutputAccuracyByCharPercDelta),
        this.displayDelta(x.weightedEfficiencyScoreOutputAccuracyByCharPercDelta),
        this.calcDeltaPercentage(x.weightedEfficiencyScoreOutputAccuracyByCharPerc, x.weightedEfficiencyScoreOutputAccuracyByCharPercDelta),
      ];
    });
    
    this.heading(4, '2.7.3 Output Tokens (Accuracy by Character): Mandatory vs Optional Data');
    this.table(
      ['Format',
        'Output Tokens Man', 'Output Tokens Opt', 'Diff', 'Diff (%)', 'Useful Output Tokens Man', 'Useful Output Tokens Opt', 'Diff', 'Diff (%)', 'Wasted Output Tokens Man', 'Wasted Output Tokens Opt', 'Diff', 'Diff (%)',
        'Accuracy by Character (%) Man', 'Accuracy by Character (%) Opt', 'Diff (%)',
        'Eff Score Output Man', 'Eff Score Output Opt', 'Diff', 'Diff (%)',
        'Wtd Accuracy by Character (%) Man', 'Wtd Accuracy by Character (%) Opt', 'Diff (%)',
        'Wtd Eff Score Output Man', 'Wtd Eff Score Output Opt', 'Diff', 'Diff (%)'],
      mandOptEffOutputTokenDeltaRowsAccuracyByCharPerc
    );
    
    // 2.7.4 Total Token Utilization Efficiency (Accuracy by Character): Mandatory vs Optional Data
    const mandOptEffTotalTokenDeltaRowsAccuracyByCharPerc = mandatories.map(x =>{
      const totalTokens = Math.round(x.totalTokens);
      const usefulTotalTokens = Math.round(x.usefulTotalTokensAccuracyByCharPerc);
      const wastedTotalTokens = Math.round(x.wastedTotalTokensAccuracyByCharPerc);
      return [
        x.format,
        this.printRounded(totalTokens, 0),
        this.printRounded(totalTokens + x.totalTokensDelta, 0),
        this.displayDelta(x.totalTokensDelta, 0),
        this.calcDeltaPercentage(totalTokens, x.totalTokensDelta),
        this.printRounded(usefulTotalTokens, 0),
        this.printRounded(usefulTotalTokens + x.usefulTotalTokensAccuracyByCharPercDelta, 0),
        this.displayDelta(x.usefulTotalTokensAccuracyByCharPercDelta, 0),
        this.calcDeltaPercentage(usefulTotalTokens, x.usefulTotalTokensAccuracyByCharPercDelta),
        this.printRounded(wastedTotalTokens, 0),
        this.printRounded(wastedTotalTokens + x.wastedTotalTokensAccuracyByCharPercDelta, 0),
        this.displayDelta(x.wastedTotalTokensAccuracyByCharPercDelta, 0),
        this.calcDeltaPercentage(wastedTotalTokens, x.wastedTotalTokensAccuracyByCharPercDelta),
        this.printRounded(x.accuracyByCharPerc),
        this.printRounded(x.accuracyByCharPerc + x.accuracyByCharPercDelta),
        this.displayDelta(x.accuracyByCharPercDelta),
        this.printRounded(x.efficiencyScoreTotalAccuracyByCharPerc),
        this.printRounded(x.efficiencyScoreTotalAccuracyByCharPerc + x.efficiencyScoreTotalAccuracyByCharPercDelta),
        this.displayDelta(x.efficiencyScoreTotalAccuracyByCharPercDelta),
        this.calcDeltaPercentage(x.efficiencyScoreTotalAccuracyByCharPerc, x.efficiencyScoreTotalAccuracyByCharPercDelta),
        this.printRounded(x.weightedAccuracyByCharPerc),
        this.printRounded(x.weightedAccuracyByCharPerc + x.weightedAccuracyByCharPercDelta),
        this.displayDelta(x.weightedAccuracyByCharPercDelta),
        this.printRounded(x.weightedEfficiencyScoreTotalAccuracyByCharPerc),
        this.printRounded(x.weightedEfficiencyScoreTotalAccuracyByCharPerc + x.weightedEfficiencyScoreTotalAccuracyByCharPercDelta),
        this.displayDelta(x.weightedEfficiencyScoreTotalAccuracyByCharPercDelta),
        this.calcDeltaPercentage(x.weightedEfficiencyScoreTotalAccuracyByCharPerc, x.weightedEfficiencyScoreTotalAccuracyByCharPercDelta),
      ];
    });
    
    this.heading(4, '2.7.4 Total Tokens (Accuracy by Character): Mandatory vs Optional Data');
    this.table(
      ['Format', 
        'Total Tokens Man', 'Total Tokens Opt', 'Diff', 'Diff (%)', 'Useful Total Tokens Man', 'Useful Total Tokens Opt', 'Diff', 'Diff (%)', 'Wasted Total Tokens Man', 'Wasted Total Tokens Opt', 'Diff', 'Diff (%)', 
        'Accuracy by Character (%) Man', 'Accuracy by Character (%) Opt', 'Diff (%)', 
        'Eff Score Total Man', 'Eff Score Total Opt', 'Diff', 'Diff (%)',
        'Wtd Accuracy by Character (%) Man', 'Wtd Accuracy by Character (%) Opt', 'Diff (%)', 
        'Wtd Eff Score Total Man', 'Wtd Eff Score Total Opt', 'Diff', 'Diff (%)'],
      mandOptEffTotalTokenDeltaRowsAccuracyByCharPerc
    );

    // 2.8.1 Answer Quality Breakdown: Metrics
    const answerQualityRows = sortedAggregated.map(item => [
      item.format,
      item.variant,
      this.printRounded(item.correctAnswers, 0),
      this.printRounded(item.incorrectAnswers, 0),
      this.printRounded(item.noAnswers, 0),
      this.printRounded(item.accuracyPercent),
      this.printRounded(item.expectedChars, 0),
      this.printRounded(item.totalChars, 0),
      this.printRounded(item.correctChars, 0),
      this.printRounded(item.incorrectChars, 0),
      this.printRounded(item.accuracyByCharPerc),
    ]);
    
    this.heading(3, '2.8 Answer Per Format Breakdown');
    this.heading(4, '2.8.1 Metrics'); 
    this.table(
      ['Format', 'Variant', 'Correct Answers', 'Incorrect Answers', 'No Answers',  'Accuracy (%)', 'Expected Characters', 'Output Characters', 'Correct Characters', 'Incorrect Characters',  'Accuracy by Character (%)'],
      answerQualityRows
    );
    
    // 2.8.2 Answer Per Format Breakdown: Mandatory vs Optional Data
    const mandOptAnswerDeltaRows = mandatories.map(x =>{
      const correctAnswers = Math.round(x.correctAnswers);
      const incorrectAnswers = Math.round(x.incorrectAnswers);
      const noAnswers = Math.round(x.noAnswers);
      return [
        x.format,
        this.printRounded(correctAnswers, 0),
        this.printRounded(correctAnswers + x.correctAnswersDelta, 0),
        this.displayDelta(x.correctAnswersDelta, 0),
        this.calcDeltaPercentage(correctAnswers, x.correctAnswersDelta),
        this.printRounded(incorrectAnswers, 0),
        this.printRounded(incorrectAnswers + x.incorrectAnswersDelta, 0),
        this.displayDelta(x.incorrectAnswersDelta, 0),
        this.calcDeltaPercentage(incorrectAnswers, x.incorrectAnswersDelta),
        this.printRounded(noAnswers, 0),
        this.printRounded(noAnswers + x.noAnswersDelta, 0),
        this.displayDelta(x.noAnswersDelta, 0),
        this.calcDeltaPercentage(noAnswers, x.noAnswersDelta),
        this.printRounded(x.accuracyPercent),
        this.printRounded(x.accuracyPercent + x.accuracyDelta),
        this.displayDelta(x.accuracyDelta)
      ];
    });
    
    this.heading(4, '2.8.2 Answers: Mandatory vs Optional Data');
    this.table(
      ['Format', 'Correct Man', 'Correct Opt', 'Diff', 'Diff (%)', 'Incorrect Man', 'Incorrect Opt', 'Diff', 'Diff (%)', 'No Answers Man', 'No Answers Opt', 'Diff', 'Diff (%)', 'Accuracy (%) Man', 'Accuracy (%) Opt', 'Diff (%)'],
      mandOptAnswerDeltaRows
    );
    
    // 2.8.3 Answer Per Format Breakdown: Characters: Mandatory vs Optional Data
    const mandOptAnswerDeltaRowsAccuracyByCharPerc = mandatories.map(x =>{    
      const totalChars = Math.round(x.totalChars);
      const correctChars = Math.round(x.correctChars);
      const incorrectChars = Math.round(x.incorrectChars);
      return [
        x.format,
        this.printRounded(totalChars, 0),
        this.printRounded(totalChars + x.totalCharsDelta, 0),
        this.displayDelta(x.totalCharsDelta, 0),
        this.calcDeltaPercentage(totalChars, x.totalCharsDelta),
        this.printRounded(correctChars, 0),
        this.printRounded(correctChars + x.correctCharsDelta, 0),
        this.displayDelta(x.correctCharsDelta, 0),
        this.calcDeltaPercentage(correctChars, x.correctCharsDelta),
        this.printRounded(incorrectChars, 0),
        this.printRounded(incorrectChars + x.incorrectCharsDelta, 0),
        this.displayDelta(x.incorrectCharsDelta, 0),
        this.calcDeltaPercentage(incorrectChars, x.incorrectCharsDelta),
        this.printRounded(x.accuracyByCharPerc),
        this.printRounded(x.accuracyByCharPerc + x.accuracyByCharPercDelta),
        this.printRounded(x.accuracyByCharPercDelta)
      ];
    });
    
    this.heading(4, '2.8.3 Characters: Mandatory vs Optional Data');
    this.table(
      ['Format', 
        'Output Characters Man', 'Output Characters Opt', 'Diff', 'Diff (%)', 
        'Correct Characters Man', 'Correct Characters Opt', 'Diff', 'Diff (%)', 
        'Incorrect Characters Man', 'Incorrect Characters Opt', 'Diff', 'Diff (%)', 
        'Accuracy by Character (%) Man', 'Accuracy by Character (%) Opt', 'Diff (%)'],
      mandOptAnswerDeltaRowsAccuracyByCharPerc
    );

    // 2.9 Accuracy Per Question Category Analysis
    const categoryRows = sortedAggregated.map(item => {
      const validation = this.validations.find(x => x.format === item.format && x.variant === item.variant && x.recordCount === item.recordCount);
      const retrieval = validation?.accuracy.find(x => x.category === 'field_retrieval');
      const structure = validation?.accuracy.find(x => x.category === 'structure_awareness');
      const filtering = validation?.accuracy.find(x => x.category === 'filtering');
      const aggregation = validation?.accuracy.find(x => x.category === 'aggregation');

      return [
      item.format,
      item.variant,
      this.printRounded(item.accuracyPercent),
      this.printRounded(retrieval?.accuracyPercent),
      this.printRounded(structure?.accuracyPercent),
      this.printRounded(filtering?.accuracyPercent),
      this.printRounded(aggregation?.accuracyPercent),
      this.printRounded(item.weightedAccuracyByCharPerc),
      this.printRounded(retrieval?.weightedAccuracyPercent),
      this.printRounded(structure?.weightedAccuracyPercent),
      this.printRounded(filtering?.weightedAccuracyPercent),
      this.printRounded(aggregation?.weightedAccuracyPercent),
    ]});
    
    this.heading(3, '2.9 Accuracy Per Question Category Analysis');
    this.heading(4, '2.9.1 Metrics'); 
    this.table(
      ['Format', 'Variant', 'Accuracy (%)', 'Field Retrieval (%)', 'Structure Awareness (%)', 'Filtering (%)', 'Aggregation (%)', 'Wtd Acc (%)', 'Wtd Field Retrieval (%)', 'Wtd Structure Awareness (%)', 'Wtd Filtering (%)', 'Wtd Aggregation (%)'],
      categoryRows
    );

    this.diffMandOptAccuracyPerCategory('2.9.2', 'field_retrieval', mandatoriesVals, optionalsVals);
    this.diffMandOptAccuracyPerCategory('2.9.3', 'structure_awareness', mandatoriesVals, optionalsVals);
    this.diffMandOptAccuracyPerCategory('2.9.4', 'filtering', mandatoriesVals, optionalsVals);
    this.diffMandOptAccuracyPerCategory('2.9.5', 'aggregation', mandatoriesVals, optionalsVals);
    
    // 2.10 Accuracy By Character Per Question Category Analysis
    const categoryRowsAccuracyByCharPerc = sortedAggregated.map(item => {
      const validation = this.validations.find(x => x.format === item.format && x.variant === item.variant && x.recordCount === item.recordCount);
      const retrieval = validation?.accuracy.find(x => x.category === 'field_retrieval');
      const structure = validation?.accuracy.find(x => x.category === 'structure_awareness');
      const filtering = validation?.accuracy.find(x => x.category === 'filtering');
      const aggregation = validation?.accuracy.find(x => x.category === 'aggregation');

      return [
      item.format,
      item.variant,
      this.printRounded(item.accuracyByCharPerc),
      this.printRounded(retrieval?.charactersOfAnswers.accuracyByCharPerc),
      this.printRounded(structure?.charactersOfAnswers.accuracyByCharPerc),
      this.printRounded(filtering?.charactersOfAnswers.accuracyByCharPerc),
      this.printRounded(aggregation?.charactersOfAnswers.accuracyByCharPerc),
      this.printRounded(item.weightedAccuracyByCharPerc),
      this.printRounded(retrieval?.charactersOfAnswers.weightedAccuracyByCharPerc),
      this.printRounded(structure?.charactersOfAnswers.weightedAccuracyByCharPerc),
      this.printRounded(filtering?.charactersOfAnswers.weightedAccuracyByCharPerc),
      this.printRounded(aggregation?.charactersOfAnswers.weightedAccuracyByCharPerc),
    ]});
    
    this.heading(3, '2.10 Accuracy By Character Per Question Category Analysis');
    this.heading(4, '2.10.1 Metrics'); 
    this.table(
      ['Format', 'Variant', 'Accuracy By Character (%)', 'Field Retrieval (%)', 'Structure Awareness (%)', 'Filtering (%)', 'Aggregation (%)', 'Wtd Acc By Char (%)', 'Wtd Field Retrieval (%)', 'Wtd Structure Awareness (%)', 'Wtd Filtering (%)', 'Wtd Aggregation (%)'],
      categoryRowsAccuracyByCharPerc
    );

    this.diffMandOptAccuracyByCharacterPerCategory('2.10.2', 'field_retrieval', mandatoriesVals, optionalsVals);
    this.diffMandOptAccuracyByCharacterPerCategory('2.10.3', 'structure_awareness', mandatoriesVals, optionalsVals);
    this.diffMandOptAccuracyByCharacterPerCategory('2.10.4', 'filtering', mandatoriesVals, optionalsVals);
    this.diffMandOptAccuracyByCharacterPerCategory('2.10.5', 'aggregation', mandatoriesVals, optionalsVals);
  }

  private calcDeltaPercentage(manVal: number, optManDelta: number, decimalPlaces: number = 2): string {  
    const manRounded = this.round(manVal, decimalPlaces);
    const optRounded = this.round(optManDelta, decimalPlaces);
    return this.printRounded(manRounded !== 0 && optRounded !== 0 ? (optManDelta / manVal) * 100 : 0, decimalPlaces, true)
  }
  
  private displayDelta(percentage: number, decimalPlaces: number = 2): string {
    return this.printRounded(percentage, decimalPlaces, true);
  }
  
  private printRounded(num: number | null | undefined, decimalPlaces: number = 2, addSign: boolean = false): string {
    if(!num || num === 0){      
      switch(decimalPlaces)
      {
        case 0:
          return '0';
        case 1:
          return '0.0';
        case 2:
          return '0.00';
        case 3:
          return '0.000';
      }
      
      return '0';
    }

    const numRounded = this.round(num, decimalPlaces);
    return (addSign && numRounded > 0 ? '+' : '') + numRounded.toFixed(decimalPlaces);
  }

  private round(num: number, decimalPlaces: number = 2): number{
    let factor = 1;
    switch(decimalPlaces)
    {
      case 0:
        factor = 1;
        break;
      case 1:
        factor = 10;
        break;
      case 2:
        factor = 100;
        break;
      case 3:
        factor = 1000;
        break;
    }

    return Math.round(num * factor) / factor;
  }

  private diffMandOptAccuracyPerCategory(idx:string, category: QuestionCategory, mandatoriesVals: MappingType[], optionalsVals: MappingType[]): void { 
    this.heading(4, `${idx} ${this.getQuestionCategoryLabel(category)}: Mandatory vs Optional`); 
    this.line();

    const categoryMandOptRows = this.uniqueFormats.map(fmt => {
      const man = mandatoriesVals.find(x => x.category === category && x.format == fmt);
      const opt = optionalsVals.find(x => x.category === category && x.format == fmt);
      return this.getAccuracyPerCategoryRow(fmt, man?.accuracyPercent ?? 0, opt?.accuracyPercent ?? 0, man?.weightedAccuracyPercent ?? 0, opt?.weightedAccuracyPercent ?? 0);
    }).filter(r => r !== null) as string[][];

    this.printAccuracyPerCategoryTable(categoryMandOptRows);
  }
  
  private diffMandOptAccuracyByCharacterPerCategory(idx:string, category: QuestionCategory, mandatoriesVals: MappingType[], optionalsVals: MappingType[]): void { 
    this.heading(4, `${idx} ${this.getQuestionCategoryLabel(category)}: Mandatory vs Optional`); 
    this.line();

    const categoryMandOptRows = this.uniqueFormats.map(fmt => {
      const man = mandatoriesVals.find(x => x.category === category && x.format == fmt);
      const opt = optionalsVals.find(x => x.category === category && x.format == fmt);
      return this.getAccuracyPerCategoryRow(fmt, man?.accuracyByCharPerc ?? 0, opt?.accuracyByCharPerc ?? 0, man?.weightedAccuracyByCharPerc ?? 0, opt?.weightedAccuracyByCharPerc ?? 0);
    }).filter(r => r !== null) as string[][];

    this.printAccuracyPerCategoryTable(categoryMandOptRows);
  }

  private getAccuracyPerCategoryRow(fmt: string, man: number, opt: number, manWtd: number, optWtd: number){
    return [
      fmt,
      this.printRounded(man),
      this.printRounded(opt),
      this.displayDelta(opt - man),
      this.printRounded(manWtd),
      this.printRounded(optWtd),
      this.displayDelta(optWtd - manWtd),
    ];
  }

  private printAccuracyPerCategoryTable(categoryMandOptRows: string[][]): void {
    this.table(
      ['Format', 'Man (%)', 'Opt (%)', 'Diff (%)', 'Wdt Man (%)', 'Wdt Opt (%)', 'Diff (%)'],
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
      const weightPercent = this.printRounded(weight ? weight[1] * 100 : 0);
      this.line(`- **${this.getQuestionCategoryLabel(q[0])}**: ${q[1]} questions (${weightPercent}% weight)`);
    });
    this.line();

    this.line('---');
    this.line();
    this.line('- **Report Generated**: ' + new Date().toISOString().split('T')[0]);
    this.line('- **Written by**: [Thore Höltig](https://github.com/thoeltig)');
    this.line('- **Test run in**: Claude Code 2.1.73');
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
