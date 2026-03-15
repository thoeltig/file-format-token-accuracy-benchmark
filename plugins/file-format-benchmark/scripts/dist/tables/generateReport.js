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
const consts_1 = require("../consts");
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
;
function extractMetadata(analyticsData) {
    return {
        generatedAt: new Date().toISOString(),
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
        this.line(`- **Date**: ${new Date(this.metadata.generatedAt).toISOString().split('T')[0]}`);
        this.line(`- **Model**: ${this.metadata.model}`);
        this.line(`- **Extended Thinking**: ${this.metadata.thinking}`);
        this.line(`- **Data Structure**: ${this.metadata.structure}`);
        this.line(`- **Formats Tested**: ${this.uniqueFormats.length} (${this.uniqueFormats.map(f => f.toUpperCase()).join(', ')})`);
        this.line(`- **Record Counts**: ${this.recordCounts.join(', ')}`);
        this.line(`- **Status**: First iteration`);
        this.line();
    }
    generateExecutiveSummary() {
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
        this.line('**Question Distribution:**');
        this.line(`- ${this.metadata.questionDistribution.length} question categories reflecting practical use cases:`);
        let fieledRetrivalAndStructureAwareness = 0;
        let filteringAndAggregation = 0;
        this.metadata.questionDistribution.forEach((q) => {
            const weight = this.metadata.questionWeightDistribution.find((w) => w[0] === q[0]);
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
        this.line(`   - These represent more the "intellectual" aspect of the model and will differ greatly depending on the model. Also if done deterministic the model still needs to do field retrival and structure awarness on the result.`);
        this.line();
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
        this.line('- `efficiencyScore`: (accuracy% x 0.7) + (normalizedTokenCost * 0.3)');
        this.line('- `weightedEfficiencyScore`: (weightedAccuracy% x 0.7) + (normalizedTokenCost * 0.3)');
        this.line();
        this.heading(3, '1.4 Token Usage Measurements');
        this.line();
        this.line('Tokens usage measured in this benchmark are no estimates but the real token usage the model used in this test. The token usage is reported to the user indirectly in the conversation transcript. Both read and output Tokens are directly extracted from the transcripts of the subagents:');
        this.line('- **Read Tokens**: For each data file a single read subagent is invoked with the only prompt to read the file at the provided filepath and return "Done" once finished and do nothing more. The tokens extraction script searches for the read tool use result and extracted the tokens for that action from it.');
        this.line('- **Output Tokens**: For each data file a three full tests subagent are invoked with all necessary files and the test setup and the instruction to write a file once with the answers. The token extraction script searches for the write tool use result and extracted the tokens for that action from it.');
    }
    generateSummaryTLDRFormatRanking(sortedAggregated) {
        const optionals = sortedAggregated.filter(x => x.variant == 'optional');
        const mandatories = sortedAggregated.filter(x => x.variant == 'mandatory');
        // 2.1.1 Best results
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
        this.line('*Note: All columns ranked best-to-worst. ↑ = lower value is better (ascending). ↓ = higher value is better (descending).*');
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
        // 2.1.2 Worst results
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
        // 2.1.3 Format Ranking
        const sortedByTotalDurationMandatories = [...mandatories].sort((ob1, ob2) => ob1.totalDurationInMilliseconds > ob2.totalDurationInMilliseconds ? 1 : ob1.totalDurationInMilliseconds < ob2.totalDurationInMilliseconds ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].totalDurationInMilliseconds, arr[0].totalDurationInMilliseconds, 's'));
        const sortedByTotalTokensMandatories = [...mandatories].sort((ob1, ob2) => ob1.totalTokensUsed > ob2.totalTokensUsed ? 1 : ob1.totalTokensUsed < ob2.totalTokensUsed ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].totalTokensUsed, arr[0].totalTokensUsed));
        const sortedByCostOfInaccuracyMandatories = [...mandatories].sort((ob1, ob2) => ob1.costOfInaccuracy > ob2.costOfInaccuracy ? 1 : ob1.costOfInaccuracy < ob2.costOfInaccuracy ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].costOfInaccuracy, arr[0].costOfInaccuracy));
        const sortedByAccuracyMandatories = [...mandatories].sort((ob1, ob2) => ob1.avgAccuracyPercent < ob2.avgAccuracyPercent ? 1 : ob1.avgAccuracyPercent > ob2.avgAccuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].avgAccuracyPercent, arr[0].avgAccuracyPercent));
        const sortedByWeightedAccuracyMandatories = [...mandatories].sort((ob1, ob2) => ob1.avgWeightedAccuracyPercent < ob2.avgWeightedAccuracyPercent ? 1 : ob1.avgWeightedAccuracyPercent > ob2.avgWeightedAccuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].avgWeightedAccuracyPercent, arr[0].avgWeightedAccuracyPercent));
        const sortedByEfficiencyScoreMandatories = [...mandatories].sort((ob1, ob2) => ob1.efficiencyScore < ob2.efficiencyScore ? 1 : ob1.efficiencyScore > ob2.efficiencyScore ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScore, arr[0].efficiencyScore));
        const sortedByWeightedEfficiencyScoreMandatories = [...mandatories].sort((ob1, ob2) => ob1.weightedEfficiencyScore < ob2.weightedEfficiencyScore ? 1 : ob1.weightedEfficiencyScore > ob2.weightedEfficiencyScore ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].weightedEfficiencyScore, arr[0].weightedEfficiencyScore));
        const manRows = mandatories.map((_, i) => [
            sortedByTotalDurationMandatories[i],
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
        this.table(['↑ Total Duration', '↑ Total Tokens', '↑ Wasted Tokens', '↓ Acc', '↓ Wtd Acc', '↓ Eff Score', '↓ Wtd Eff Score'], manRows);
        this.line();
        const sortedByTotalDurationOptionals = [...optionals].sort((ob1, ob2) => ob1.totalDurationInMilliseconds > ob2.totalDurationInMilliseconds ? 1 : ob1.totalDurationInMilliseconds < ob2.totalDurationInMilliseconds ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].totalDurationInMilliseconds, arr[0].totalDurationInMilliseconds, 's'));
        const sortedByTotalTokensOptionals = [...optionals].sort((ob1, ob2) => ob1.totalTokensUsed > ob2.totalTokensUsed ? 1 : ob1.totalTokensUsed < ob2.totalTokensUsed ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].totalTokensUsed, arr[0].totalTokensUsed));
        const sortedByCostOfInaccuracyOptionals = [...optionals].sort((ob1, ob2) => ob1.costOfInaccuracy > ob2.costOfInaccuracy ? 1 : ob1.costOfInaccuracy < ob2.costOfInaccuracy ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].costOfInaccuracy, arr[0].costOfInaccuracy));
        const sortedByAccuracyOptionals = [...optionals].sort((ob1, ob2) => ob1.avgAccuracyPercent < ob2.avgAccuracyPercent ? 1 : ob1.avgAccuracyPercent > ob2.avgAccuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].avgAccuracyPercent, arr[0].avgAccuracyPercent));
        const sortedByWeightedAccuracyOptionals = [...optionals].sort((ob1, ob2) => ob1.avgWeightedAccuracyPercent < ob2.avgWeightedAccuracyPercent ? 1 : ob1.avgWeightedAccuracyPercent > ob2.avgWeightedAccuracyPercent ? -1 : 0).map((x, i, arr) => this.getRankingOfPercentageDisplay(x.format, i, arr[i].avgWeightedAccuracyPercent, arr[0].avgWeightedAccuracyPercent));
        const sortedByEfficiencyScoreOptionals = [...optionals].sort((ob1, ob2) => ob1.efficiencyScore < ob2.efficiencyScore ? 1 : ob1.efficiencyScore > ob2.efficiencyScore ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].efficiencyScore, arr[0].efficiencyScore));
        const sortedByWeightedEfficiencyScoreOptionals = [...optionals].sort((ob1, ob2) => ob1.weightedEfficiencyScore < ob2.weightedEfficiencyScore ? 1 : ob1.weightedEfficiencyScore > ob2.weightedEfficiencyScore ? -1 : 0).map((x, i, arr) => this.getRankingOfAmountDisplay(x.format, i, arr[i].weightedEfficiencyScore, arr[0].weightedEfficiencyScore));
        const optRows = mandatories.map((_, i) => [
            sortedByTotalDurationOptionals[i],
            sortedByTotalTokensOptionals[i],
            sortedByCostOfInaccuracyOptionals[i],
            sortedByAccuracyOptionals[i],
            sortedByWeightedAccuracyOptionals[i],
            sortedByEfficiencyScoreOptionals[i],
            sortedByWeightedEfficiencyScoreOptionals[i],
        ]);
        this.heading(5, 'Optional');
        this.line();
        this.table(['↑ Total Duration)', '↑ Total Tokens', '↑ Wasted Tokens', '↓ Acc', '↓ Wtd Acc', '↓ Eff Score', '↓ Wtd Eff Score'], optRows);
        this.line();
        // 2.1.4 Category Accuracy Ranking
        const formats = [...new Set(this.validations.map(x => x.format))];
        const mandatoriesVals = this.validations.filter(x => x.variant === 'mandatory').flatMap(v => v.accuracy.map(x => ({ format: v.format, category: x.category, accuracyPercent: x.accuracyPercent })));
        const optionalsVals = this.validations.filter(x => x.variant === 'optional').flatMap(v => v.accuracy.map(x => ({ format: v.format, category: x.category, accuracyPercent: x.accuracyPercent })));
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
        const suffix = ' %';
        const fieldRetrievalLabel = prefixArrowDown + this.getQuestionCategoryLabel('field_retrieval') + suffix;
        const aggregationLabel = prefixArrowDown + this.getQuestionCategoryLabel('aggregation') + suffix;
        const filteringLabel = prefixArrowDown + this.getQuestionCategoryLabel('filtering') + suffix;
        const structureAwarenessLabel = prefixArrowDown + this.getQuestionCategoryLabel('structure_awareness') + suffix;
        this.heading(4, '2.1.4 Category Accuracy Ranking');
        this.line();
        this.heading(5, 'Mandatory');
        this.line();
        this.table([fieldRetrievalLabel, structureAwarenessLabel, filteringLabel, aggregationLabel], manValsRows);
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
        this.table([fieldRetrievalLabel, structureAwarenessLabel, filteringLabel, aggregationLabel], optValsRows);
        this.line();
        // 2.1.5 Conclusion
        this.heading(4, '2.1.5 Conclusion');
        this.line();
        this.line('<ADD_CONTENT_HERE>Analysis here</ADD_CONTENT_HERE>');
        this.line();
    }
    getRankingOfAmountDisplay(format, idx, current, first, suffix = '') {
        return format + (idx > 0 ? ` (${(current > first ? ' +' : '')}${(current / first * 100 - 100).toFixed(1)} %)` : ` ≈ ${Math.round(current)} ${suffix}`);
    }
    getRankingOfPercentageDisplay(format, idx, current, first) {
        return format + (idx > 0 ? ` (${(current > first ? ' +' : '')}${(current - first).toFixed(1)} %)` : ` ≈ ${Math.round(current)} %`);
    }
    generateResults() {
        this.heading(2, '2. Results');
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
        this.table(['Format', 'Variant', 'Read Tokens', 'Output Tokens', 'Total', 'Tokens/Char', 'Info/Token', 'Token/Answer', 'Acc (%)', 'Wtd Acc (%)', 'Used Tokens', 'Wasted Tokens', 'Eff Score', 'Wtd Eff Score'], rows);
        // 2.3 Format Robustness: Mandatory vs Optional
        const mandOptFormatDeltaRows = mandatories.map(x => {
            const mandTotalTokensUsed = Math.round(x.totalTokensUsed);
            const tokenDiff = Math.round(x.totalTokensDelta);
            const optTotalTokensUsed = mandTotalTokensUsed + tokenDiff;
            return [
                x.format.toUpperCase(),
                mandTotalTokensUsed.toString(),
                optTotalTokensUsed.toString(),
                this.displayDelta(tokenDiff, 0),
                this.calcDeltaPercentage(mandTotalTokensUsed, tokenDiff),
                x.avgAccuracyPercent.toFixed(2),
                (x.avgAccuracyPercent + x.accuracyDelta).toFixed(2),
                this.displayDelta(x.accuracyDelta),
                x.avgWeightedAccuracyPercent.toFixed(2),
                (x.avgWeightedAccuracyPercent + x.weightedAccuracyDelta).toFixed(2),
                this.displayDelta(x.weightedAccuracyDelta),
                x.efficiencyScore.toFixed(2),
                (x.efficiencyScore + x.efficiencyDelta).toFixed(2),
                this.displayDelta(x.efficiencyDelta),
                x.weightedEfficiencyScore.toFixed(2),
                (x.weightedEfficiencyScore + x.weightedEfficiencyDelta).toFixed(2),
                this.displayDelta(x.weightedEfficiencyDelta, 2)
            ];
        });
        this.heading(3, '2.3 Format Robustness: Mandatory vs Optional');
        this.table(['Format', 'Tokens Man', 'Tokens Opt', 'Diff', 'Diff (%)', 'Acc Man (%)', 'Acc Opt (%)', 'Diff (%)', 'Wtd Acc Man (%)', 'Wtd Acc Opt (%)', 'Diff (%)', 'Eff Score Man', 'Eff Score Opt', 'Diff', 'Wtd Eff Score Man', 'Wtd Eff Score Opt', 'Diff'], mandOptFormatDeltaRows);
        // 2.4 Performance
        // 2.4.1 Duration & Speed
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
        this.heading(3, '2.4 Performance');
        this.heading(4, '2.4.1 Metrics');
        this.table(['Format', 'Variant', 'Read (ms)', 'Read (tokens/ms)', 'Rate (ms/record)', 'Output (ms)', 'Output (tokens/ms)', 'Rate (ms/question)', 'Total (ms)', 'Total (tokens/ms)', 'Rate (ms/record+question)'], readPerfRows);
        // 2.4.2 Performance: Mandatory vs Optional Data
        const mandOptSpeedDeltaRows = mandatories.map(x => {
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
        this.table(['Format', 'Read Man (ms)', 'Read Opt (ms)', 'Diff (ms)', 'Diff (%)', 'Output Man (s)', 'Output Opt (s)', 'Diff (s)', 'Diff (%)', 'Total Man (s)', 'Total Opt (s)', 'Diff (s)', 'Diff (%)'], mandOptSpeedDeltaRows);
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
        this.table(['Format', 'Variant', 'Char/Token', 'Token/Value', 'Token/Object', 'Info/Token'], structRows);
        // 2.5.2 Structural Efficiency: Mandatory vs Optional Data
        const mandOptStructuralDeltaRows = mandatories.map(x => {
            return [
                x.format.toUpperCase(),
                x.charsPerToken.toFixed(3),
                (x.charsPerToken + x.charsPerTokenDelta).toFixed(3),
                this.displayDelta(x.charsPerTokenDelta, 3),
                this.calcDeltaPercentage(x.charsPerToken, x.charsPerTokenDelta),
                x.tokensPerValue.toFixed(3),
                (x.tokensPerValue + x.tokensPerValueDelta).toFixed(3),
                this.displayDelta(x.tokensPerValueDelta, 3),
                this.calcDeltaPercentage(x.tokensPerValue, x.tokensPerValueDelta),
                x.tokensPerObject.toFixed(3),
                (x.tokensPerObject + x.tokensPerObjectDelta).toFixed(3),
                this.displayDelta(x.tokensPerObjectDelta, 3),
                this.calcDeltaPercentage(x.tokensPerObject, x.tokensPerObjectDelta),
                x.informationValuePerToken.toFixed(3),
                (x.informationValuePerToken + x.informationValuePerTokenDelta).toFixed(3),
                this.displayDelta(x.informationValuePerTokenDelta, 3),
                this.calcDeltaPercentage(x.informationValuePerToken, x.informationValuePerTokenDelta),
            ];
        });
        this.heading(4, '2.5.2 Mandatory vs Optional');
        this.table(['Format', 'Char/Token Man', 'Char/Token Opt', 'Diff', 'Diff (%)', 'Token/Value Man', 'Token/Value Opt', 'Diff', 'Diff (%)', 'Token/Object Man', 'Token/Object Opt', 'Diff', 'Diff (%)', 'Info/Token Man', 'Info/Token Opt', 'Diff', 'Diff (%)'], mandOptStructuralDeltaRows);
        // 2.6.1 Token Utilization Efficiency: Metrics
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
        this.heading(3, '2.6 Token Utilization Efficiency');
        this.heading(4, '2.6.1 Metrics');
        this.table(['Format', 'Variant', 'Total Tokens', 'Useful Tokens', 'Wasted Tokens', 'Acc (%)', 'Wtd Acc (%)', 'Eff Score', 'Wtd Eff Score',], effTokenRows);
        // 2.6.2 Token Utilization Efficiency: Mandatory vs Optional Data
        const mandOptEffTokenDeltaRows = mandatories.map(x => {
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
                x.avgAccuracyPercent.toFixed(2),
                (x.avgAccuracyPercent + x.accuracyDelta).toFixed(2),
                this.displayDelta(x.accuracyDelta),
                x.efficiencyScore.toFixed(2),
                (x.efficiencyScore + x.efficiencyDelta).toString(),
                this.displayDelta(x.efficiencyDelta, 2),
                this.calcDeltaPercentage(x.efficiencyScore, x.efficiencyDelta),
            ];
        });
        this.heading(4, '2.6.2 Mandatory vs Optional Data');
        this.table(['Format', 'Total Tokens Man', 'Total Tokens Opt', 'Diff', 'Diff (%)', 'Useful Tokens Man', 'Useful Tokens Opt', 'Diff', 'Diff (%)', 'Wasted Tokens Man', 'Wasted Tokens Opt', 'Diff', 'Diff (%)', 'Acc (%) Man', 'Acc (%) Opt', 'Diff (%)', 'Eff Score Man', 'Eff Score Opt', 'Diff', 'Diff (%)'], mandOptEffTokenDeltaRows);
        // 2.7.1 Answer Quality Breakdown: Metrics
        const answerQualityRows = sortedAggregated.map(item => [
            item.format.toUpperCase(),
            item.variant.substring(0, 3),
            item.avgCorrectAnswers.toString(),
            item.avgIncorrectAnswers.toString(),
            item.avgNoAnswers.toString(),
            item.avgAccuracyPercent.toFixed(2),
        ]);
        this.heading(3, '2.7 Answer Per Format Breakdown');
        this.heading(4, '2.7.1 Metrics');
        this.table(['Format', 'Variant', 'Correct Answers', 'Incorrect Answers', 'No Answers', 'Acc (%)'], answerQualityRows);
        // 2.7.2 Answer Per Format Breakdown: Mandatory vs Optional Data
        const mandOptAnswerDeltaRows = mandatories.map(x => {
            return [
                x.format.toUpperCase(),
                x.avgCorrectAnswers.toString(),
                (x.avgCorrectAnswers + x.correctAnswersDelta).toString(),
                this.displayDelta(x.correctAnswersDelta, 0),
                this.calcDeltaPercentage(x.avgCorrectAnswers, x.correctAnswersDelta),
                x.avgIncorrectAnswers.toString(),
                (x.avgIncorrectAnswers + x.incorrectAnswersDelta).toString(),
                this.displayDelta(x.incorrectAnswersDelta, 0),
                this.calcDeltaPercentage(x.avgIncorrectAnswers, x.incorrectAnswersDelta),
                x.avgNoAnswers.toString(),
                (x.avgNoAnswers + x.noAnswersDelta).toString(),
                this.displayDelta(x.noAnswersDelta, 0),
                this.calcDeltaPercentage(x.avgNoAnswers, x.noAnswersDelta),
                x.avgAccuracyPercent.toFixed(2),
                (x.avgAccuracyPercent + x.accuracyDelta).toFixed(2),
                this.displayDelta(x.accuracyDelta)
            ];
        });
        this.heading(4, '2.7.2 Mandatory vs Optional Data');
        this.table(['Format', 'Correct Man', 'Correct Opt', 'Diff', 'Diff (%)', 'Incorrect Man', 'Incorrect Opt', 'Diff', 'Diff (%)', 'No Answers Man', 'No Answers Opt', 'Diff', 'Diff (%)', 'Acc (%) Man', 'Acc (%) Opt', 'Diff (%)'], mandOptAnswerDeltaRows);
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
        this.heading(3, '2.8 Accuracy Per Question Category Analysis');
        this.heading(4, '2.8.1 Metrics');
        this.table(['Format', 'Variant', 'Acc (%)', 'Field Retrieval (%)', 'Structure Awareness (%)', 'Filtering (%)', 'Aggregation (%)'], categoryRows);
        this.diffMandOptAccuracyPerCategory(2, 'field_retrieval');
        this.diffMandOptAccuracyPerCategory(3, 'structure_awareness');
        this.diffMandOptAccuracyPerCategory(4, 'filtering');
        this.diffMandOptAccuracyPerCategory(5, 'aggregation');
    }
    calcDeltaPercentage(manVal, optManDelta, fixed = 2) {
        return this.displayDelta(manVal > 0 ? (optManDelta / manVal) * 100 : 0, fixed);
    }
    displayDelta(percentage, fixed = 2) {
        return (percentage > 0 ? ' +' : '') + percentage.toFixed(fixed);
    }
    diffMandOptAccuracyPerCategory(idx, category) {
        this.heading(4, `2.8.${idx} ${this.getQuestionCategoryLabel(category)}: Mandatory vs Optional`);
        this.line();
        const mandatoriesVals = this.validations.filter(x => x.variant === 'mandatory').flatMap(v => v.accuracy.map(x => ({ format: v.format, category: x.category, accuracyPercent: x.accuracyPercent })));
        const optionalsVals = this.validations.filter(x => x.variant === 'optional').flatMap(v => v.accuracy.map(x => ({ format: v.format, category: x.category, accuracyPercent: x.accuracyPercent })));
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
        }).filter(r => r !== null);
        this.table(['Format', 'Mand (%)', 'Opt (%)', 'Diff (%)'], categoryMandOptRows);
    }
    generateFormatAnalysis() {
        this.heading(2, '3. Format-Specific Analysis');
        this.uniqueFormats.forEach((format, idx, _) => {
            const formatData = this.aggregated.filter(a => a.format === format);
            if (formatData.length === 0)
                return;
            const num = idx + 1;
            this.heading(3, `3.${num} Detailed Analysis: ${format.toUpperCase()}`);
            this.line();
            this.heading(4, `3.${num}.1 Performance Summary`);
            this.line();
            this.line(`- Token Duration Range: ${Math.round(Math.min(...formatData.map(d => d.totalDurationInMilliseconds / 1000)))} - ${Math.round(Math.max(...formatData.map(d => d.totalDurationInMilliseconds / 1000)))} seconds`);
            this.line(`- Token Cost Range: ${Math.round(Math.min(...formatData.map(d => d.totalTokensUsed)))} - ${Math.round(Math.max(...formatData.map(d => d.totalTokensUsed)))} tokens`);
            this.line(`- Wasted Token Range: ${Math.round(Math.min(...formatData.map(d => d.costOfInaccuracy)))} - ${Math.round(Math.max(...formatData.map(d => d.costOfInaccuracy)))} tokens`);
            this.line(`- Accuracy Range: ${(Math.min(...formatData.map(d => d.avgAccuracyPercent))).toFixed(2)} - ${(Math.max(...formatData.map(d => d.avgAccuracyPercent))).toFixed(2)} %`);
            this.line(`- Efficiency Score Range: ${(Math.min(...formatData.map(d => d.efficiencyScore))).toFixed(2)} - ${(Math.max(...formatData.map(d => d.efficiencyScore))).toFixed(2)}`);
            this.line();
            this.heading(4, `3.${num}.2 Strengths`);
            this.line();
            this.line('- <ADD_CONTENT_HERE>List format strengths based on category and variant analysis</ADD_CONTENT_HERE>');
            this.line('- ');
            this.line('- ');
            this.line();
            this.heading(4, `3.${num}.3 Weaknesses`);
            this.line();
            this.line('- <ADD_CONTENT_HERE>List format weaknesses and failure modes</ADD_CONTENT_HERE>');
            this.line('- ');
            this.line('- ');
            this.line();
            this.heading(4, `3.${num}.4 Use Case Recommendation`);
            this.line();
            this.line('- <ADD_CONTENT_HERE>When and why to use this format (✓ Use when, ❌ Avoid when)</ADD_CONTENT_HERE>');
            this.line('- ');
            this.line('- ');
            this.line();
            this.heading(4, `3.${num}.5 Trade-offs`);
            this.line();
            this.line('- <ADD_CONTENT_HERE>Discuss accuracy vs token cost trade-offs specific to this format</ADD_CONTENT_HERE>');
            this.line('- ');
            this.line('- ');
            this.line();
        });
    }
    generateConclusions() {
        this.heading(2, '4. Conclusions & Recommendations');
        this.line();
        this.heading(3, '4.1 Format Selection Framework');
        this.line();
        this.line('| Scenario | Recommended Format | Alternative | Avoid |');
        this.line('|----------|------------------|------------|-------|');
        this.line('| <ADD_CONTENT_HERE>Scenario 1</ADD_CONTENT_HERE> | <FORMAT> | <FORMAT> | <FORMAT> |');
        this.line('| <ADD_CONTENT_HERE>Scenario 2</ADD_CONTENT_HERE> | <FORMAT> | <FORMAT> | <FORMAT> |');
        this.line('| <ADD_CONTENT_HERE>Scenario 3</ADD_CONTENT_HERE> | <FORMAT> | <FORMAT> | <FORMAT> |');
        this.line('| <ADD_CONTENT_HERE>Scenario 4</ADD_CONTENT_HERE> | <FORMAT> | <FORMAT> | <FORMAT> |');
        this.line('| <ADD_CONTENT_HERE>Scenario 5</ADD_CONTENT_HERE> | <FORMAT> | <FORMAT> | <FORMAT> |');
        this.line();
        this.heading(3, '4.2 Token Efficiency vs Accuracy Trade-off');
        this.line('<ADD_CONTENT_HERE>Discuss the fundamental trade-off between token cost and accuracy</ADD_CONTENT_HERE>');
        this.line('- Cheapest format (tokens):');
        this.line('- Most accurate format:');
        this.line('- Best efficiency score:');
        this.line('- Recommendation for different budgets:');
        this.line();
        this.heading(3, '4.3 Scaling Characteristics');
        this.line('<ADD_CONTENT_HERE>Analyze how formats scale with record count and data complexity</ADD_CONTENT_HERE>');
        this.line('- Linear scaling validation:');
        this.line('- Fixed overhead (per-format):');
        this.line('- Recommendations for large datasets:');
        this.line();
        this.heading(3, '4.4 Open Research Questions');
        this.line('<ADD_CONTENT_HERE>List questions for future iterations</ADD_CONTENT_HERE>');
        this.line('1. Questions 1');
        this.line('2. Questions 2');
        this.line('3. Questions 3');
        this.line('4. Questions 4');
        this.line('5. Questions 5');
        this.line();
    }
    generateAppendices() {
        this.heading(2, '5. Appendices');
        this.line();
        this.heading(3, '5.1 Appendix A: Test Infrastructure');
        this.line(`- **Test Date**: ${new Date(this.metadata.generatedAt).toISOString().split('T')[0]}`);
        this.line(`- **Model**: ${this.metadata.model}`);
        this.line(`- **Extended Thinking**: ${this.metadata.thinking}`);
        this.line(`- **Structure**: ${this.metadata.structure}`);
        this.line(`- **Formats Tested**: ${this.metadata.formats.join(', ')}`);
        this.line(`- **Record Counts**: ${this.recordCounts.join(', ')}`);
        this.line(`- **Total Test Cases**: ${this.aggregated.length}`);
        this.line();
        this.heading(3, '5.2 Appendix B: Benchmark Configuration');
        this.metadata.questionDistribution.forEach((q) => {
            const weight = this.metadata.questionWeightDistribution.find((w) => w[0] === q[0]);
            const weightPercent = weight ? (weight[1] * 100).toFixed(2) : '0.0';
            this.line(`- **${this.getQuestionCategoryLabel(q[0])}**: ${q[1]} questions (${weightPercent}% weight)`);
        });
        this.line();
        this.line('---');
        this.line();
        this.line('- **Report Generated**: ' + new Date().toISOString().split('T')[0]);
        this.line('- **Written by**: [Thore Höltig](https://github.com/thoeltig)');
        this.line('- **With the help of**: Claude Sonnet 4.6');
        this.line('- **Data Source**: `analytics_results.json`');
        this.line('- **Publication**: Open source research in [GitHub repository](https://github.com/thoeltig/file-format-token-accuracy-benchmark-results)');
        this.line('- **Related Benchmark Results**: [Report1](https://github.com/thoeltig/file-format-token-accuracy-benchmark-results), [Report2](https://github.com/thoeltig/file-format-token-accuracy-benchmark-results), [Report3](https://github.com/thoeltig/file-format-token-accuracy-benchmark-results)');
        this.line('- **Format Specifics**: [README](https://github.com/thoeltig/file-format-token-accuracy-benchmark#format-specifics)');
        this.line('- **Benchmark Tool**: Claude Code Plugin in [GitHub repository](https://github.com/thoeltig/file-format-token-accuracy-benchmark)');
    }
    getQuestionCategoryLabel(category) {
        switch (category) {
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
async function main() {
    try {
        const config = parseArgs(process.argv.slice(2));
        const benchmarkFolder = path.resolve(config.benchmarkFolder);
        // Construct fixed file paths
        const jsonPath = path.join(benchmarkFolder, consts_1.FILE_ANALYTICS_RESULT);
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
