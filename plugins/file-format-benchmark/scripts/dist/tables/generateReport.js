#!/usr/bin/env node
"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const tableLoaders_1 = require("./tableLoaders");
// ============================================================================
// CLI PARSING
// ============================================================================
function parseArgs(args) {
    let benchmarkFolder = process.cwd();
    for (let i = 0; i < args.length; i++) {
        if ((args[i] === '--output-folder' || args[i] === '--folder') && args[i + 1]) {
            benchmarkFolder = args[++i];
        }
    }
    return { benchmarkFolder };
}
;
function extractMetadata(analyticsData) {
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
    content = [];
    aggregated;
    validations;
    uniqueFormats;
    recordCounts;
    metadata;
    constructor(aggregated, validations, metadata) {
        this.aggregated = aggregated;
        this.validations = validations;
        this.metadata = metadata;
        this.uniqueFormats = metadata.formats.sort();
        this.recordCounts = metadata.recordCounts.sort((a, b) => b - a);
    }
    line(text = '') {
        this.content.push(text);
    }
    heading(level, text) {
        this.line('#'.repeat(level) + ' ' + text);
    }
    hr() {
        this.line('---\n');
    }
    table(headers, rows) {
        this.line('| ' + headers.join(' | ') + ' |');
        this.line('|' + headers.map(() => '---|').join(''));
        rows.forEach(row => {
            this.line('| ' + row.join(' | ') + ' |');
        });
        this.line();
    }
    generate() {
        this.generateTitleAndMetadata();
        this.generateExecutiveSummary();
        this.generateMethodology();
        this.generateResults();
        this.generateFormatAnalysis();
        this.generateConclusions();
        this.generateAppendices();
        return this.content.join('\n');
    }
    generateTitleAndMetadata() {
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
    generateExecutiveSummary() {
        this.heading(2, 'Executive Summary');
        this.line('This benchmark evaluates token efficiency and information accuracy across ' +
            this.uniqueFormats.length + ' file formats using ' + this.metadata.model +
            ' as the inference model. The research addresses a critical but underexplored problem: **not all tokens are equally useful**. ' +
            'A format that uses fewer tokens but produces inaccurate results wastes both tokens and context, while a format that accurately conveys information may justify higher token cost.');
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
    generateMethodology() {
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
            this.metadata.questionDistribution.forEach((q) => {
                const weight = this.metadata.questionWeightDistribution.find((w) => w[0] === q[0]);
                const weightPerc = weight ? (weight[1] * 100) : 0;
                let questionCategory = '';
                let questionCategoryDescription = '';
                switch (q[0]) {
                    case "field_retrieval":
                        questionCategory = 'Field Retrieval';
                        questionCategoryDescription = 'Extract specific values from specific records';
                        fieledRetrivalAndStructureAwareness += weightPerc;
                        break;
                    case "structure_awareness":
                        questionCategory = 'Structure Awareness';
                        questionCategoryDescription = 'Understand data shape, organization, metadata';
                        fieledRetrivalAndStructureAwareness += weightPerc;
                        break;
                    case "filtering":
                        questionCategory = 'Filtering';
                        questionCategoryDescription = 'Count records matching criteria';
                        filteringAndAggregation += weightPerc;
                        break;
                    case "aggregation":
                        questionCategory = 'Aggregation';
                        questionCategoryDescription = 'Sum, average, min/max calculations';
                        filteringAndAggregation += weightPerc;
                        break;
                }
                this.line(`   - **${questionCategory} (${q[1]} questions, ${weightPerc.toFixed(3)}% weight):** ${questionCategoryDescription}`);
            });
            this.line();
            this.line('**Weighting Rationale:**');
            this.line(`- Field retrieval + structure awareness = ${fieledRetrivalAndStructureAwareness.toFixed(3)}%`);
            this.line(`   - These represent the file format itself. Understanding "what data exists and how it's organized" which is fundamental to avoiding context confusion.`);
            this.line(`- Filtering + aggregation = ${filteringAndAggregation.toFixed(3)}%`);
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
        this.line('- Composite metric balancing accuracy with normalized token cost (favour towards accuracy)');
        this.line('- normalizedTokenCost = (((maxTotalTokens+10)-currenTotalTokens)/((maxTotalTokens+10)-(minTotalTokens-10)))*100');
        this.line('- `efficiencyScore`: (accuracy% x 0.3) + (normalizedTokenCost * 0.3)');
        this.line('- `weightedEfficiencyScore`: (weightedAccuracy% x 0.3) + (normalizedTokenCost * 0.3)');
        this.line();
        this.hr();
    }
    generateResults() {
        this.heading(2, '2. Results');
        this.line();
        this.heading(3, '2.1 Comprehensive Benchmark Metrics');
        this.line();
        // Sort by format then variant (alphabetically)
        const sortedAggregated = [...this.aggregated].sort((ob1, ob2) => {
            if (ob1.format > ob2.format) {
                return 1;
            }
            else if (ob1.format < ob2.format) {
                return -1;
            }
            if (ob1.variant < ob2.variant) {
                return -1;
            }
            else if (ob1.variant > ob2.variant) {
                return 1;
            }
            else {
                return 0;
            }
        });
        const rows = sortedAggregated.map(item => [
            item.format.toUpperCase(),
            item.recordCount.toString(),
            item.variant.substring(0, 3),
            Math.round(item.readTokens).toString(),
            Math.round(item.avgOutputTokens).toString(),
            Math.round(item.totalTokensUsed).toString(),
            item.charsPerToken.toFixed(3),
            item.informationValuePerToken.toFixed(3),
            item.avgOutputTokensPerAnswer.toFixed(3),
            item.avgAccuracyPercent.toFixed(2),
            item.avgWeightedAccuracyPercent.toFixed(2),
        ]);
        this.table(['Format', 'Records', 'Variant', 'Read Tokens', 'Output Tokens', 'Total', 'Tokens/Char', 'Info/Token', 'Token/Answer', 'Raw Acc (%)', 'Wtd Acc (%)'], rows);
        this.heading(3, '2.2 Token Efficiency Analysis');
        this.line();
        this.line('<ADD_CONTENT_HERE: Analyze token cost patterns across formats>');
        this.line();
        this.line('- Lowest token cost formats:');
        this.line('- Highest token efficiency (chars/token):');
        this.line('- Linear scaling observations:');
        this.line();
        this.heading(3, '2.3 Accuracy Analysis');
        this.line();
        this.line('<ADD_CONTENT_HERE: Analyze accuracy patterns and divergence from previous tests>');
        this.line();
        this.line('- Best performing formats:');
        this.line('- Format weaknesses:');
        this.line('- Mandatory vs optional impact:');
        this.line();
        this.heading(3, '2.4 Format Robustness: Mandatory vs Optional Data');
        const mandOptRows = this.uniqueFormats.map(fmt => {
            const mand = this.aggregated.find(a => a.format === fmt && a.variant === 'mandatory' && a.recordCount === this.recordCounts[0]);
            const opt = this.aggregated.find(a => a.format === fmt && a.variant === 'optional' && a.recordCount === this.recordCounts[0]);
            if (!mand || !opt)
                return null;
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
        }).filter(r => r !== null);
        this.table(['Format', 'Tokens (Mand)', 'Tokens (Opt)', 'Token Diff', 'Token Change (%)', 'Acc Mand (%)', 'Acc Opt (%)', 'Acc Diff (%)'], mandOptRows);
        this.heading(3, '2.5 Performance Metrics (Duration & Speed)');
        this.line();
        const readPerfRows = sortedAggregated.map(item => {
            const totalDurationInMilliseconds = item.readDurationInMilliseconds + item.avgReasoningDurationInMilliseconds;
            const totalTokensPerMillisecond = item.readTokensPerMillisecond + item.avgReasoningTokensPerMillisecond;
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
        this.table(['Format', 'Variant', 'Read Duration (ms)', 'Read Speed (tokens/ms)', 'Ratio (ms/record)', 'Output Duration (ms)', 'Output Speed (tokens/ms)', 'Ratio (ms/question)', 'Total Duration (ms)', 'Total Speed (tokens/ms)', 'Ratio (ms/record+question)'], readPerfRows);
        this.heading(3, '2.6 Structural Efficiency Metrics');
        this.line();
        const structRows = sortedAggregated.map(item => [
            item.format.toUpperCase(),
            item.variant.substring(0, 3),
            item.charsPerToken.toFixed(3),
            item.tokensPerValue.toFixed(3),
            item.tokensPerObject.toFixed(3)
        ]);
        this.table(['Format', 'Variant', 'Chars/Token', 'Tokens/Value', 'Tokens/Object'], structRows);
        this.heading(3, '2.7 Answer Quality Breakdown');
        this.line();
        const answerQualityRows = sortedAggregated.map(item => [
            item.format.toUpperCase(),
            item.variant.substring(0, 3),
            Math.round(item.avgCorrectAnswers).toString(),
            Math.round(item.avgIncorrectAnswers).toString(),
            Math.round(item.avgNoAnswers).toString(),
            item.avgAccuracyPercent.toFixed(2),
        ]);
        this.table(['Format', 'Variant', 'Correct Answers', 'Incorrect Answers', 'No Answers', 'Raw Acc (%)'], answerQualityRows);
        this.heading(3, '2.8 Token Utilization Efficiency');
        this.line();
        const effTokenRows = sortedAggregated.map(item => [
            item.format.toUpperCase(),
            item.variant.substring(0, 3),
            item.avgAccuracyPercent.toFixed(2),
            Math.round(item.totalTokensUsed).toString(),
            Math.round(item.efficientlyUsedTokens).toString(),
            Math.round(item.costOfInaccuracy).toString(),
            item.efficiencyScore.toFixed(2),
            item.weightedEfficiencyScore.toFixed(2),
        ]);
        this.table(['Format', 'Variant', 'Raw Acc (%)', 'Total Tokens', 'Utilized Tokens', 'Wasted Tokens', 'Efficiency Score', 'Wtd Efficiency',], effTokenRows);
        this.heading(3, '2.9 Category Performance Analysis');
        this.line();
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
            ];
        });
        this.table(['Format', 'Variant', 'Raw Acc (%)', 'Field Retrieval (%)', 'Structure Awareness (%)', 'Filtering (%)', 'Aggregation (%)'], categoryRows);
        this.diffMandOptAccuracyPerCategory('Field Retrieval', 'field_retrieval');
        this.diffMandOptAccuracyPerCategory('Structure Awareness', 'structure_awareness');
        this.diffMandOptAccuracyPerCategory('Filtering', 'filtering');
        this.diffMandOptAccuracyPerCategory('Aggregation', 'aggregation');
        this.line();
        this.generateCategoryAccuracyTables();
        this.line('<ADD_CONTENT_HERE: Analyze performance across question categories>');
        this.line('- Field retrieval performance:');
        this.line('- Structure awareness patterns:');
        this.line('- Aggregation/filtering challenges:');
        this.line('- Per-format strengths and weaknesses:\n');
        this.hr();
    }
    diffMandOptAccuracyPerCategory(label, category) {
        this.heading(4, `${label} Delta: Mandatory vs Optional`);
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
        }).filter(r => r !== null);
        this.table(['Format', 'Mand (%)', 'Opt (%)', 'Diff (%)'], categoryMandOptRows);
    }
    generateCategoryAccuracyTables() {
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
                        const vals = this.validations.filter(v => v.format === fmt && v.recordCount === recCount);
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
                    this.line(`| ${idx + 1} | ${stat.category} | ${stat.avgAccuracy.toFixed(2)} | ${stat.easiest.toUpperCase()} | ${stat.hardest.toUpperCase()} |`);
                });
            }
            this.line();
        });
    }
    generateFormatAnalysis() {
        this.heading(2, 'Format-Specific Analysis');
        this.uniqueFormats.forEach(format => {
            const formatData = this.aggregated.filter(a => a.format === format);
            if (formatData.length === 0)
                return;
            const best = formatData.reduce((max, curr) => curr.avgWeightedAccuracyPercent > max.avgWeightedAccuracyPercent ? curr : max);
            this.heading(3, format.toUpperCase() + ': Detailed Analysis');
            this.line('**Performance Summary:**\n' +
                `- Best Configuration: ${best.recordCount}-record ${best.variant} (${best.avgWeightedAccuracyPercent.toFixed(2)}% weighted accuracy)\n` +
                `- Token Cost Range: ${Math.round(Math.min(...formatData.map(d => d.totalTokensUsed)))} - ${Math.round(Math.max(...formatData.map(d => d.totalTokensUsed)))} tokens\n` +
                `- Average Weighted Accuracy: ${(formatData.reduce((sum, d) => sum + d.avgWeightedAccuracyPercent, 0) / formatData.length).toFixed(2)}%\n`);
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
    generateConclusions() {
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
    generateAppendices() {
        this.heading(2, 'Appendices');
        this.heading(3, 'Appendix A: Complete Data Tables');
        this.heading(4, 'A.1 Token Cost Breakdown by Format and Variant');
        // Sort by format then variant (alphabetically)
        const sortedForAppendix = [...this.aggregated].sort((ob1, ob2) => {
            if (ob1.format > ob2.format) {
                return 1;
            }
            else if (ob1.format < ob2.format) {
                return -1;
            }
            if (ob1.variant < ob2.variant) {
                return -1;
            }
            else if (ob1.variant > ob2.variant) {
                return 1;
            }
            else {
                return 0;
            }
        });
        const tokenRows = sortedForAppendix.map(item => [
            item.format.toUpperCase(),
            item.recordCount.toString(),
            item.variant.substring(0, 3),
            Math.round(item.readTokens).toString(),
            Math.round(item.avgOutputTokens).toString(),
            Math.round(item.totalTokensUsed).toString(),
        ]);
        this.table(['Format', 'Records', 'Variant', 'Read Tokens', 'Output Tokens', 'Total Tokens'], tokenRows);
        this.heading(4, 'A.2 Accuracy Comparison');
        const accRows = sortedForAppendix.map(item => [
            item.format.toUpperCase(),
            item.recordCount.toString(),
            item.variant.substring(0, 3),
            item.avgAccuracyPercent.toFixed(2),
            item.avgWeightedAccuracyPercent.toFixed(2),
            (item.avgWeightedAccuracyPercent - item.avgAccuracyPercent).toFixed(2),
        ]);
        this.table(['Format', 'Records', 'Variant', 'Raw Accuracy (%)', 'Weighted Accuracy (%)', 'Delta (%)'], accRows);
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
        this.table(['Format', 'Records', 'Variant', 'Info/Token', 'Efficiency', 'Wtd Efficiency', 'Cost Inaccuracy'], effRows);
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
            this.metadata.questionDistribution.forEach((q) => {
                const weight = this.metadata.questionWeightDistribution.find((w) => w[0] === q[0]);
                const weightPercent = weight ? (weight[1] * 100).toFixed(2) : '0.0';
                this.line(`- ${q[0]}: ${q[1]} questions (${weightPercent}% weight)`);
            });
        }
        else {
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
async function main() {
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
        const analyticsData = (0, tableLoaders_1.loadAnalyticsResults)(jsonPath);
        const aggregated = (0, tableLoaders_1.aggregateMetrics)(analyticsData.metrics);
        const metadata = extractMetadata(analyticsData);
        console.log('Loading validation results...');
        const validations = (0, tableLoaders_1.loadValidationResults)(resultsPath);
        console.log(`Loaded ${aggregated.length} aggregated metrics`);
        console.log(`Loaded ${validations.length} validation summaries`);
        const generator = new ReportGenerator(aggregated, validations, metadata);
        const report = generator.generate();
        fs.writeFileSync(reportPath, report, 'utf-8');
        const placeholderCount = report.split('<ADD_CONTENT_HERE').length - 1;
        console.log(`✓ Report generated: ${reportPath}`);
        console.log(`✓ ${placeholderCount} placeholder sections ready for analysis`);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error: ${message}`);
        process.exit(1);
    }
}
main();
