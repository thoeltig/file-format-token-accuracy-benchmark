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

function extractMetadata(analyticsData: any): any {
  const metadata = analyticsData.metadata || {
    generatedAt: new Date().toISOString(),
    model: 'Claude Haiku 4.5',
    thinking: 'off',
    structure: 'flat',
  };

  return {
    generatedAt: metadata.generatedAt,
    model: metadata.model || 'Claude Haiku 4.5',
    thinking: metadata.thinking || 'off',
    structure: metadata.structure || 'flat',
    questionDistribution: metadata.questionDistribution || [],
    questionWeightDistribution: metadata.questionWeightDistribution || [],
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
  private metadata: any;

  constructor(
    aggregated: AggregatedMetric[],
    validations: ValidationSummary[],
    metadata: any
  ) {
    this.aggregated = aggregated;
    this.validations = validations;
    this.metadata = metadata;
    this.uniqueFormats = [...new Set(aggregated.map(a => a.format))].sort();
    this.recordCounts = [...new Set(aggregated.map(a => a.recordCount))].sort((a, b) => b - a);
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
    this.line(
      `**Date**: ${new Date(this.metadata.generatedAt).toISOString().split('T')[0]}`
    );
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
      ' as the inference model. The research addresses the critical question: **which file format ' +
      'delivers maximum information value per token consumed?**\n'
    );

    this.heading(3, 'Key Findings');
    this.line('<ADD_CONTENT_HERE: Insert 5-7 key findings from analysis>');
    this.line('1. Finding 1');
    this.line('2. Finding 2');
    this.line('3. Finding 3');
    this.line('4. Finding 4');
    this.line('5. Finding 5');
    this.line();
    this.hr();
  }

  private generateMethodology(): void {
    this.heading(2, 'Methodology');

    this.heading(3, 'Research Purpose');
    this.line(
      'The underlying question: **Which file format delivers maximum information value per token consumed?**\n' +
      'This requires measuring:\n' +
      '- **Token Cost**: How many tokens does each format consume for equivalent data?\n' +
      '- **Information Fidelity**: How accurately can the model understand and answer questions about the data?\n' +
      '- **Robustness**: How consistent is performance across data variants (mandatory vs optional fields)?\n'
    );

    this.heading(3, 'Test Design');
    this.line(`**Data:**\n` +
      `- Formats: ${this.uniqueFormats.length} (${this.uniqueFormats.map(f => f.toUpperCase()).join(', ')})\n` +
      `- Record Counts: ${this.recordCounts.join(', ')}\n` +
      `- Variants: Mandatory (complete data) and Optional (sparse data)\n`
    );

    if (this.metadata.questionDistribution && this.metadata.questionDistribution.length > 0) {
      this.line('**Question Distribution:**\n');
      this.metadata.questionDistribution.forEach((q: any) => {
        const weight = this.metadata.questionWeightDistribution.find((w: any) => w[0] === q[0]);
        const weightPercent = weight ? (weight[1] * 100).toFixed(2) : '0.0';
        this.line(`- ${q[0]}: ${q[1]} questions (${weightPercent}% weight)`);
      });
      this.line();
    }

    this.heading(3, 'Metrics Definition');
    this.line('**Token Metrics:**\n' +
      '- `readTokens`: Tokens consumed reading the data file\n' +
      '- `reasoningTokens`: Tokens consumed during inference\n' +
      '- `totalTokens`: readTokens + reasoningTokens\n'
    );
    this.line('**Accuracy Metrics:**\n' +
      '- `rawAccuracy`: Correct answers / total questions\n' +
      '- `weightedAccuracy`: Accuracy weighted by question category importance\n'
    );
    this.line('**Information Value Metrics:**\n' +
      '- `informationValuePerToken`: (accuracy% / totalTokens) × 100\n' +
      '- `costOfInaccuracy`: totalTokens × (1 - accuracy%) — tokens wasted on inaccurate output\n'
    );
    this.line('**Efficiency Score:**\n' +
      '- Composite metric balancing accuracy with token cost\n'
    );
    this.hr();
  }

  private generateResults(): void {
    this.heading(2, 'Results');

    this.heading(3, '2.1 Comprehensive Benchmark Metrics');

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

    const rows = sortedAggregated.map(item => [
      item.format.toUpperCase(),
      item.recordCount.toString(),
      item.variant.substring(0, 3),
      Math.round(item.readTokens).toString(),
      Math.round(item.avgOutputTokens).toString(),
      Math.round(item.totalTokensUsed).toString(),
      item.charsPerToken.toFixed(3),
      item.avgAccuracyPercent.toFixed(2),
      item.avgWeightedAccuracyPercent.toFixed(2),
      item.informationValuePerToken.toFixed(3),
    ]);
    this.table(
      ['Format', 'Records', 'Variant', 'Read Tokens', 'Output Tokens', 'Total', 'Tokens/Char', 'Raw Acc (%)', 'Wtd Acc (%)', 'Info/Token'],
      rows
    );

    this.heading(3, '2.2 Token Efficiency Analysis');
    this.line('<ADD_CONTENT_HERE: Analyze token cost patterns across formats>');
    this.line('- Lowest token cost formats:');
    this.line('- Highest token efficiency (chars/token):');
    this.line('- Linear scaling observations:\n');

    this.heading(3, '2.3 Accuracy Analysis');
    this.line('<ADD_CONTENT_HERE: Analyze accuracy patterns and divergence from previous tests>');
    this.line('- Best performing formats:');
    this.line('- Format weaknesses:');
    this.line('- Mandatory vs optional impact:\n');

    this.heading(3, '2.4 Format Robustness: Mandatory vs Optional Data');
    const mandOptRows = this.uniqueFormats.map(fmt => {
      const mand = this.aggregated.find(a => a.format === fmt && a.variant === 'mandatory' && a.recordCount === this.recordCounts[0]);
      const opt = this.aggregated.find(a => a.format === fmt && a.variant === 'optional' && a.recordCount === this.recordCounts[0]);
      if (!mand || !opt) return null;

      const mandTotalTokensUsed = Math.round(mand.totalTokensUsed);
      const optTotalTokensUsed = Math.round(opt.totalTokensUsed);
      const tokenDiff = optTotalTokensUsed - mandTotalTokensUsed;
      const tokenPct = ((tokenDiff / mandTotalTokensUsed) * 100).toFixed(2);
      const accDiff = (opt.avgWeightedAccuracyPercent - mand.avgWeightedAccuracyPercent).toFixed(2);

      return [
        fmt.toUpperCase(),
        mandTotalTokensUsed.toString(),
        optTotalTokensUsed.toString(),
        tokenDiff.toString(),
        tokenPct,
        mand.avgWeightedAccuracyPercent.toFixed(2),
        opt.avgWeightedAccuracyPercent.toFixed(2),
        accDiff,
      ];
    }).filter(r => r !== null) as string[][];

    this.table(
      ['Format', 'Tokens (Mand)', 'Tokens (Opt)', 'Token Diff', 'Token Change (%)', 'Acc Mand (%)', 'Acc Opt (%)', 'Acc Diff (%)'],
      mandOptRows
    );

    this.heading(3, '2.5 Performance Metrics (Duration & Speed)');
    this.line('**Read Phase Performance:**\n');
    const readPerfRows = sortedAggregated.map(item => {
      //const metric = this.aggregated.find(a => a.format === item.format && a.variant === item.variant && a.recordCount === item.recordCount);
      return [
        item.format.toUpperCase(),
        item.recordCount.toString(),
        item.variant.substring(0, 3),
        Math.round(item.readDurationInMilliseconds).toString(),
        item.readTokensPerMillisecond.toFixed(3)
      ];
    });
    this.table(
      ['Format', 'Records', 'Variant', 'Read Duration (ms)', 'Read Speed (tokens/ms)'],
      readPerfRows
    );
    this.line('*Note: Duration metrics available in metrics.json per test case*\n');

    this.heading(3, '2.6 Structural Efficiency Metrics');
    const structRows = sortedAggregated.map(item => [
      item.format.toUpperCase(),
      item.recordCount.toString(),
      item.variant.substring(0, 3),
      item.charsPerToken.toFixed(3),
      item.tokensPerValue.toFixed(3),
      item.tokensPerObject.toFixed(3)
    ]);
    this.table(
      ['Format', 'Records', 'Variant', 'Chars/Token', 'Tokens/Value', 'Tokens/Object'],
      structRows
    );
    this.line('*Note: Tokens/Value and Tokens/Object metrics available in metrics.json*\n');

    this.heading(3, '2.7 Answer Quality Breakdown');
    this.line('**Detailed Question Answer Distribution:**\n');
    this.line('<ADD_CONTENT_HERE: Analyze which formats have better answer quality (correct vs incorrect vs unanswered)>');
    this.line('*Note: Answer breakdown (avgCorrectAnswers, avgIncorrectAnswers, avgNoAnswers) available in metrics.json per test case*\n');

    this.heading(3, '2.8 Token Utilization Efficiency');
    this.line('**Efficiently Used vs Wasted Tokens:**\n');
    const effTokenRows = sortedAggregated.map(item => [
      item.format.toUpperCase(),
      item.recordCount.toString(),
      item.variant.substring(0, 3),
      Math.round(item.totalTokensUsed).toString(),
      item.efficiencyScore.toFixed(2),
      item.weightedEfficiencyScore.toFixed(2),
      item.costOfInaccuracy.toFixed(3),
    ]);
    this.table(
      ['Format', 'Records', 'Variant', 'Total Tokens', 'Efficiency Score', 'Wtd Efficiency', 'Wasted Tokens'],
      effTokenRows
    );
    this.line();

    this.heading(3, '2.9 Category Performance Analysis');
    this.generateCategoryAccuracyTables();
    this.line('<ADD_CONTENT_HERE: Analyze performance across question categories>');
    this.line('- Field retrieval performance:');
    this.line('- Structure awareness patterns:');
    this.line('- Aggregation/filtering challenges:');
    this.line('- Per-format strengths and weaknesses:\n');

    this.hr();
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
      this.line(`\n#### Per-Category Accuracy (${recCount}-Record Dataset):\n`);

      this.uniqueFormats.forEach(format => {
        const formatValidations = this.validations.filter(
          v => v.format === format && v.recordCount === recCount
        );

        if (formatValidations.length === 0) return;

        this.line(`**${format.toUpperCase()}:**\n`);
        this.line('| Category | Mandatory (%) | Optional (%) |');
        this.line('|----------|--------------|--------------|');

        categories.forEach(category => {
          const mandatoryVal = formatValidations.find(v => v.variant === 'mandatory');
          const optionalVal = formatValidations.find(v => v.variant === 'optional');

          const mandatoryAcc = mandatoryVal?.accuracy.find(a => a.category === category)?.accuracyPercent || 0;
          const optionalAcc = optionalVal?.accuracy.find(a => a.category === category)?.accuracyPercent || 0;

          this.line(
            `| ${category} | ${mandatoryAcc.toFixed(2)} | ${optionalAcc.toFixed(2)} |`
          );
        });

        this.line();
      });

      // Category delta table
      this.line(`\n#### Category Delta: Mandatory vs Optional (${recCount}-Record Dataset):\n`);
      this.line('| Category | ' + this.uniqueFormats.map(f => f.toUpperCase()).join(' | ') + ' |');
      this.line('|---|' + this.uniqueFormats.map(() => '---|').join(''));

      categories.forEach(category => {
        const deltas = this.uniqueFormats.map(fmt => {
          const mandatory = this.validations.find(
            v => v.format === fmt && v.variant === 'mandatory' && v.recordCount === recCount
          );
          const optional = this.validations.find(
            v => v.format === fmt && v.variant === 'optional' && v.recordCount === recCount
          );

          const mandatoryAcc = mandatory?.accuracy.find(a => a.category === category)?.accuracyPercent || 0;
          const optionalAcc = optional?.accuracy.find(a => a.category === category)?.accuracyPercent || 0;
          const delta = (optionalAcc - mandatoryAcc).toFixed(2);

          return delta + '%';
        });

        this.line(`| ${category} | ${deltas.join(' | ')} |`);
      });

      this.line();

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
      ['Format', 'Records', 'Variant', 'Raw Accuracy (%)', 'Weighted Accuracy (%)', 'Delta (%)'],
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
    this.line(`**Model**: ${this.metadata.model}`);
    this.line(`**Extended Thinking**: ${this.metadata.thinking}`);
    this.line(`**Test Date**: ${new Date(this.metadata.generatedAt).toISOString()}`);
    this.line(`**Total Test Cases**: ${this.aggregated.length}`);
    this.line(`**Formats Tested**: ${this.uniqueFormats.length}`);
    this.line(`**Record Counts**: ${this.recordCounts.join(', ')}\n`);

    this.heading(3, 'Appendix D: Benchmark Configuration');
    this.line('**Question Distribution:**\n');
    if (this.metadata.questionDistribution && this.metadata.questionDistribution.length > 0) {
      this.metadata.questionDistribution.forEach((q: any) => {
        const weight = this.metadata.questionWeightDistribution.find((w: any) => w[0] === q[0]);
        const weightPercent = weight ? (weight[1] * 100).toFixed(2) : '0.0';
        this.line(`- ${q[0]}: ${q[1]} questions (${weightPercent}% weight)`);
      });
    } else {
      this.line('<ADD_CONTENT_HERE: Question distribution details>');
    }
    this.line();

    this.line('---\n');
    this.line('- **Report Generated**: ' + new Date().toISOString().split('T')[0]);
    this.line('- **Data Source**: `analytics_results.json`');
    this.line('- **Status**: Template ready for content addition');
    this.line('- **Next Step**: Fill in <ADD_CONTENT_HERE> sections with analysis findings');
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
