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
function mapValidation(validation) {
    return validation.accuracy.map(x => ({
        format: validation.format,
        category: x.category,
        accuracyPercent: x.accuracyPercent,
        weightedAccuracyPercent: x.weightedAccuracyPercent,
        accuracyByCharPerc: x.charactersOfAnswers.accuracyByCharPerc,
        weightedAccuracyByCharPerc: x.charactersOfAnswers.weightedAccuracyByCharPerc
    }));
}
function extractMetadata(analyticsData) {
    return {
        generatedAt: analyticsData.timestamp || new Date().toISOString(),
        ...analyticsData.testConfigurations
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
        this.aggregated.forEach(x => x.format = x.format.toUpperCase());
        this.validations = validations;
        this.validations.forEach(x => x.format = x.format.toUpperCase());
        this.metadata = metadata;
        this.metadata.formats = [...this.metadata.formats.map(x => x.toUpperCase())];
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
        this.generateAppendices();
        return this.content.join('\n');
    }
    generateTitleAndMetadata() {
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
    generateExecutiveSummary() {
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
        this.heading(4, '1.2.1 Data Generation');
        this.line(`- ${this.uniqueFormats.length} formats tested: ${this.uniqueFormats.join(', ')}`);
        this.line('- 2 variants per format: mandatory (22 fields, dense) and optional (19 mandatory + 3 optional, sparse)');
        this.line(`- Record Counts: ${this.recordCounts.join(', ')}`);
        this.line();
        this.heading(4, '1.2.2 Question Distribution');
        this.line(`- ${this.metadata.questionDistribution.length} question categories reflecting practical use cases:`);
        let fieledretrievalAndStructureAwareness = 0;
        let filteringAndAggregation = 0;
        this.metadata.questionDistribution.forEach((q) => {
            const weight = this.metadata.questionWeightDistribution.find((w) => w[0] === q[0]);
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
        this.line('- **Information Value**: (**Accuracy** % / **Tokens**) * 100');
        this.line();
        const efficiencyScoreAccuracyPortion = this.metadata.efficiencyScoreWeight.find(x => x[0] === "accuracy")?.[1] ?? 0;
        const efficiencyScoreTokenPortion = this.metadata.efficiencyScoreWeight.find(x => x[0] === "tokens")?.[1] ?? 0;
        this.heading(4, '1.3.3 Efficiency Score');
        this.line('Composite metric balancing accuracy with normalized token count (favour towards accuracy). Each efficieny score has an indicator which token count was used in the calculation.');
        this.line(`- **Accuracy To Token Ratio** = ${(efficiencyScoreAccuracyPortion * 100).toFixed(2)} % to ${(efficiencyScoreTokenPortion * 100).toFixed(2)} %`);
        this.line('- **Normalized Tokens** = (((**Max Tokens** + 10) - **Current Tokens**) / ((**Max Tokens** + 10) - (**Min Tokens** - 10))) * 100');
        this.line('- **Normalized Tokens** = (((**Max Tokens** + 10) - **Current Tokens**) / ((**Max Tokens** + 10) - (**Min Tokens** - 10))) * 100');
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
        this.line('However these values cannot be exactly applied to models of the same family or from other providers as token usage, accuracy and latency depend on specific model architectures and tokenizers. While the relative ranking of file formats remains consistent the absolute numbers will vary.');
        this.line('Especially the accuracy and output tokens results will vary because these values are bound to the model size and training, instruction interpretation and reasoning token budget.');
        this.line();
    }
    generateSummaryTLDRFormatRanking(sortedAggregated, mandatoriesVals, optionalsVals) {
        const optionals = sortedAggregated.filter(x => x.variant == 'optional');
        const mandatories = sortedAggregated.filter(x => x.variant == 'mandatory');
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
        this.table(['↑ Total Duration', '↑ Read Tokens', '↑ Output Before Write Tokens', '↑ Output Write Tokens', '↑ Output Tokens', '↑ Total Tokens', '↓ Accuracy', '↓ Eff Score Read', '↓ Eff Score Output', '↓ Eff Score Total', '↓ Accuracy By Character', '↓ Eff Score Read (Acc By Char)', '↓ Eff Score Output (Acc By Char)', '↓ Eff Score Total (Acc By Char)'], manRows);
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
        this.table(['↑ Total Duration', '↑ Read Tokens', '↑ Output Before Write Tokens', '↑ Output Write Tokens', '↑ Output Tokens', '↑ Total Tokens', '↓ Accuracy', '↓ Eff Score Read', '↓ Eff Score Output', '↓ Eff Score Total', '↓ Accuracy By Character', '↓ Eff Score Read (Acc By Char)', '↓ Eff Score Output (Acc By Char)', '↓ Eff Score Total (Acc By Char)'], optRows);
        this.line();
        // 2.1.2 Category Accuracy Ranking
        const formats = [...new Set(this.validations.map(x => x.format))];
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
        this.table([fieldRetrievalLabel, structureAwarenessLabel, filteringLabel, aggregationLabel], manValsRowsAccuracyByCharPerc);
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
        this.table([fieldRetrievalLabel, structureAwarenessLabel, filteringLabel, aggregationLabel], optValsRowsAccuracyByCharPerc);
        this.line();
        // 2.1.4 Conclusion
        this.heading(4, '2.1.4 Conclusion');
        this.line();
        this.line('<ADD_CONTENT_HERE>Analysis here</ADD_CONTENT_HERE>');
        this.line();
    }
    getRankingOfDurationDisplay(format, idx, current, first) {
        if (current > 1000 && first > 1000) {
            return this.getRankingOfAmountDisplay(format, idx, current / 1000, first / 1000, 's');
        }
        return this.getRankingOfAmountDisplay(format, idx, current, first, 'ms');
    }
    getRankingOfAmountDisplay(format, idx, current, first, suffix = '') {
        return format + (idx > 0 ? ` (${(current > first ? '+' : '')}${(current / first * 100 - 100).toFixed(2)}%)` : ` ≈ ${Math.round(current)}${suffix}`);
    }
    getRankingOfPercentageDisplay(format, idx, current, first) {
        return format + (idx > 0 ? ` (${(current > first ? '+' : '')}${(current - first).toFixed(2)}%)` : ` ≈ ${current.toFixed(2)}%`);
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
        const mandatoriesVals = this.validations.filter(x => x.variant === 'mandatory').flatMap(v => mapValidation(v));
        const optionalsVals = this.validations.filter(x => x.variant === 'optional').flatMap(v => mapValidation(v));
        // 2.1 Token Efficiency Analysis
        this.generateSummaryTLDRFormatRanking(sortedAggregated, mandatoriesVals, optionalsVals);
        // 2.2 Comprehensive Benchmark Metrics
        const rows = sortedAggregated.map(item => [
            item.format,
            item.variant.substring(0, 3),
            Math.round(item.readTokens).toString(),
            Math.round(item.outputTokensTotal).toString(),
            Math.round(item.totalTokens).toString(),
            item.charsPerReadToken.toFixed(3),
            item.outputTokensWritePerAnswer.toFixed(3),
            item.accuracyPercent.toFixed(2),
            item.usefulReadTokens.toFixed(3),
            item.wastedReadTokens.toFixed(3),
            item.usefulOutputTokens.toFixed(3),
            item.wastedOutputTokens.toFixed(3),
            item.efficiencyScoreRead.toFixed(2),
            item.efficiencyScoreOutput.toFixed(2),
            item.efficiencyScoreTotal.toFixed(2),
            item.accuracyByCharPerc.toFixed(2),
            item.usefulReadTokensAccuracyByCharPerc.toFixed(3),
            item.wastedReadTokensAccuracyByCharPerc.toFixed(3),
            item.usefulOutputTokensAccuracyByCharPerc.toFixed(3),
            item.wastedOutputTokensAccuracyByCharPerc.toFixed(3),
            item.efficiencyScoreReadAccuracyByCharPerc.toFixed(2),
            item.efficiencyScoreOutputAccuracyByCharPerc.toFixed(2),
            item.efficiencyScoreTotalAccuracyByCharPerc.toFixed(2),
        ]);
        this.heading(3, '2.2 Comprehensive Benchmark Metrics');
        this.table(['Format', 'Variant', 'Read Tokens', 'Output Tokens', 'Total Tokens', 'Char / Read Token', 'Output Write Tokens / Answer',
            'Accuracy (%)', 'Useful Read Tokens', 'Wasted Read Tokens', 'Useful Output Tokens', 'Wasted Output Tokens', 'Eff Score Read', 'Eff Score Output', 'Eff Score Total',
            'Accuracy By Character (%)', 'Useful Read Tokens (Acc By Char)', 'Wasted Read Tokens (Acc By Char)', 'Useful Output Tokens (Acc By Char)', 'Wasted Output Tokens (Acc By Char)', 'Eff Score Read (Acc By Char)', 'Eff Score Output (Acc By Char)', 'Eff Score Total (Acc By Char)'], rows);
        // 2.3 Format Robustness: Mandatory vs Optional
        const mandOptFormatDeltaRows = mandatories.map(x => {
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
        this.table(['Format',
            'Read Tokens Man', 'Read Tokens Opt', 'Diff', 'Diff (%)',
            'Output Before Write Tokens Man', 'Output Before Write Tokens Opt', 'Diff', 'Diff (%)',
            'Output Write Tokens Man', 'Output Write Tokens Opt', 'Diff', 'Diff (%)',
            'Output Tokens Man', 'Output Tokens Opt', 'Diff', 'Diff (%)',
            'Total Tokens Man', 'Total Tokens Opt', 'Diff', 'Diff (%)'], mandOptFormatDeltaRows);
        // 2.4 Performance
        // 2.4.1 Duration & Speed
        const readPerfRows = sortedAggregated.map(item => {
            const totalDurationInMs = item.readDurationInMs + item.outputDurationWriteInMs;
            const totalTokensPerMs = item.readTokensPerMs + item.outputTokensWritePerMs;
            return [
                item.format,
                item.variant.substring(0, 3),
                Math.round(item.readDurationInMs).toString(),
                item.readTokensPerMs.toFixed(3),
                (item.readDurationInMs / item.recordCount).toFixed(2),
                Math.round(item.outputDurationBeforeWriteInMs).toString(),
                Math.round(item.outputDurationWriteInMs).toString(),
                item.outputTokensWritePerMs.toFixed(3),
                (item.outputDurationWriteInMs / item.totalQuestions).toFixed(2),
                Math.round(totalDurationInMs).toString(),
                totalTokensPerMs.toFixed(3),
                (totalDurationInMs / (item.recordCount + item.totalQuestions)).toFixed(2),
                Math.round(item.outputDurationTotalInMs).toString(),
            ];
        });
        this.heading(3, '2.4 Performance');
        this.heading(4, '2.4.1 Metrics');
        this.table(['Format', 'Variant', 'Read (ms)', 'Read (tokens/ms)', 'Rate (ms/record)', 'Output Before Write (ms)', 'Output Write (ms)', 'Output Write (tokens/ms)', 'Rate (ms/question)', 'Read + Output Write (ms)', 'Read + Output Write (tokens/ms)', 'Rate (ms/record+question)', 'Output (ms)'], readPerfRows);
        // 2.4.2 Performance: Mandatory vs Optional Data
        const mandOptSpeedDeltaRows = mandatories.map(x => {
            const manReadDuration = x.readDurationInMs;
            const readDurationDelta = x.readDurationInMsDelta;
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
                manReadDuration.toString(),
                (manReadDuration + readDurationDelta).toString(),
                this.displayDelta(readDurationDelta, 0),
                this.calcDeltaPercentage(manReadDuration, readDurationDelta),
                manOutputDurationBeforeWrite.toFixed(2),
                (manOutputDurationBeforeWrite + outputDurationBeforeWriteDelta).toFixed(2),
                this.displayDelta(outputDurationBeforeWriteDelta, 2),
                this.calcDeltaPercentage(manOutputDurationBeforeWrite, outputDurationBeforeWriteDelta),
                manOutputDurationWrite.toFixed(2),
                (manOutputDurationWrite + outputDurationWriteDelta).toFixed(2),
                this.displayDelta(outputDurationWriteDelta, 2),
                this.calcDeltaPercentage(manOutputDurationWrite, outputDurationWriteDelta),
                manTotalDuration.toFixed(2),
                (manTotalDuration + totalDurationDelta).toFixed(2),
                this.displayDelta(totalDurationDelta, 2),
                this.calcDeltaPercentage(manTotalDuration, totalDurationDelta),
                manOutputDurationTotal.toFixed(2),
                (manOutputDurationTotal + outputDurationTotalDelta).toFixed(2),
                this.displayDelta(outputDurationTotalDelta, 2),
                this.calcDeltaPercentage(manOutputDurationTotal, outputDurationTotalDelta),
            ];
        });
        this.heading(4, '2.4.2 Mandatory vs Optional');
        this.table(['Format',
            'Read Man (ms)', 'Read Opt (ms)', 'Diff (ms)', 'Diff (%)',
            'Output Before Write Man (s)', 'Output Before Write Opt (s)', 'Diff (s)', 'Diff (%)',
            'Output Write Man (s)', 'Output Write Opt (s)', 'Diff (s)', 'Diff (%)',
            'Read + Output Write Man (s)', 'Read + Output Write Opt (s)', 'Diff (s)', 'Diff (%)',
            'Output Man (s)', 'Output Opt (s)', 'Diff (s)', 'Diff (%)'], mandOptSpeedDeltaRows);
        // 2.5.1 Structural Efficiency Metrics
        const structRows = sortedAggregated.map(item => [
            item.format,
            item.variant.substring(0, 3),
            item.charsPerReadToken.toFixed(3),
            item.readTokensPerValue.toFixed(3),
            item.readTokensPerObject.toFixed(3),
            item.informationValuePerReadTokens.toFixed(3),
            item.informationValuePerOutputTokens.toFixed(3),
            item.informationValuePerTotalTokens.toFixed(3),
            item.informationValuePerReadTokensAccuracyByCharPerc.toFixed(3),
            item.informationValuePerOutputTokensAccuracyByCharPerc.toFixed(3),
            item.informationValuePerTotalTokensAccuracyByCharPerc.toFixed(3)
        ]);
        this.heading(3, '2.5 Structural Efficiency');
        this.heading(4, '2.5.1 Metrics');
        this.table(['Format', 'Variant', 'Chars / Read Token', 'Read Tokens / Value', 'Read Tokens / Object', 'Info / Read Token', 'Info / Output Token', 'Info / Total Token', 'Info / Read Token (Acc By Char)', 'Info / Output Token (Acc By Char)', 'Info / Total Token (Acc By Char)'], structRows);
        // 2.5.2 Structural Efficiency: Mandatory vs Optional Data
        const mandOptStructuralDeltaRows = mandatories.map(x => {
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
            ];
        });
        this.heading(4, '2.5.2 Characters And Values: Mandatory vs Optional');
        this.table(['Format', 'Chars / Read Token Man', 'Chars / Read Token Opt', 'Diff', 'Diff (%)', 'Read Tokens / Value Man', 'Read Tokens / Value Opt', 'Diff', 'Diff (%)', 'Read Tokens / Object Man', 'Read Tokens / Object Opt', 'Diff', 'Diff (%)'], mandOptStructuralDeltaRows);
        // 2.5.3 Structural Efficiency: Information: Mandatory vs Optional Data
        const mandOptStructuralInformationDeltaRows = mandatories.map(x => {
            return [
                x.format,
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
        this.heading(4, '2.5.3 Information: Mandatory vs Optional');
        this.table(['Format', 'Info / Read Token Man', 'Info / Read Token Opt', 'Diff', 'Diff (%)', 'Info / Output Token Man', 'Info / Output Token Opt', 'Diff', 'Diff (%)', 'Info / Total Token Man', 'Info / Total Token Opt', 'Diff', 'Diff (%)'], mandOptStructuralInformationDeltaRows);
        // 2.5.4 Structural Efficiency: Information (Accuracy By Character):  Mandatory vs Optional Data
        const mandOptStructuralInformationByCharacterDeltaRows = mandatories.map(x => {
            return [
                x.format,
                x.informationValuePerReadTokensAccuracyByCharPerc.toFixed(3),
                (x.informationValuePerReadTokensAccuracyByCharPerc + x.informationValuePerReadTokensAccuracyByCharPercDelta).toFixed(3),
                this.displayDelta(x.informationValuePerReadTokensAccuracyByCharPercDelta, 3),
                this.calcDeltaPercentage(x.informationValuePerReadTokensAccuracyByCharPerc, x.informationValuePerReadTokensAccuracyByCharPercDelta),
                x.informationValuePerOutputTokensAccuracyByCharPerc.toFixed(3),
                (x.informationValuePerOutputTokensAccuracyByCharPerc + x.informationValuePerOutputTokensAccuracyByCharPercDelta).toFixed(3),
                this.displayDelta(x.informationValuePerOutputTokensAccuracyByCharPercDelta, 3),
                this.calcDeltaPercentage(x.informationValuePerOutputTokensAccuracyByCharPerc, x.informationValuePerOutputTokensAccuracyByCharPercDelta),
                x.informationValuePerTotalTokensAccuracyByCharPerc.toFixed(3),
                (x.informationValuePerTotalTokensAccuracyByCharPerc + x.informationValuePerTotalTokensAccuracyByCharPercDelta).toFixed(3),
                this.displayDelta(x.informationValuePerTotalTokensAccuracyByCharPercDelta, 3),
                this.calcDeltaPercentage(x.informationValuePerTotalTokensAccuracyByCharPerc, x.informationValuePerTotalTokensAccuracyByCharPercDelta),
            ];
        });
        this.heading(4, '2.5.4 Information (Accuracy By Character): Mandatory vs Optional');
        this.table(['Format', 'Info / Read Token (Acc By Char) Man', 'Info / Read Token (Acc By Char) Opt', 'Diff', 'Diff (%)', 'Info / Output Token (Acc By Char) Man', 'Info / Output Token (Acc By Char)  Opt', 'Diff', 'Diff (%)', 'Info / Total Token (Acc By Char) Man', 'Info / Total Token (Acc By Char) Opt', 'Diff', 'Diff (%)'], mandOptStructuralInformationByCharacterDeltaRows);
        // 2.6.1 Token Utilization Efficiency: Metrics
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
        this.heading(3, '2.6 Token Utilization Efficiency');
        this.heading(4, '2.6.1 Metrics');
        this.table(['Format', 'Variant',
            'Read Tokens', 'Useful Read Tokens', 'Wasted Read Tokens',
            'Output Tokens', 'Useful Output Tokens', 'Wasted Output Tokens',
            'Total Tokens', 'Useful Total Tokens', 'Wasted Total Tokens',
            'Accuracy (%)',
            'Eff Score Read', 'Eff Score Output', 'Eff Score Total',
            'Wtd Accuracy (%)',
            'Wtd Eff Score Read', 'Wtd Eff Score Output', 'Wtd Eff Score Total'], effTokenRows);
        // 2.6.2 Read Token Utilization Efficiency: Mandatory vs Optional Data
        const mandOptEffReadTokenDeltaRows = mandatories.map(x => {
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
        this.heading(4, '2.6.2 Read Tokens: Mandatory vs Optional Data');
        this.table(['Format',
            'Read Tokens Man', 'Read Tokens Opt', 'Diff', 'Diff (%)', 'Useful Read Tokens Man', 'Useful Read Tokens Opt', 'Diff', 'Diff (%)', 'Wasted Read Tokens Man', 'Wasted Read Tokens Opt', 'Diff', 'Diff (%)',
            'Accuracy (%) Man', 'Accuracy (%) Opt', 'Diff (%)',
            'Eff Score Read Man', 'Eff Score Read Opt', 'Diff', 'Diff (%)',
            'Wtd Accuracy (%) Man', 'Wtd Accuracy (%) Opt', 'Diff (%)',
            'Wtd Eff Score Read Man', 'Wtd Eff Score Read Opt', 'Diff', 'Diff (%)'], mandOptEffReadTokenDeltaRows);
        // 2.6.3 Output Token Utilization Efficiency: Mandatory vs Optional Data
        const mandOptEffOutputTokenDeltaRows = mandatories.map(x => {
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
        this.heading(4, '2.6.3 Output Tokens: Mandatory vs Optional Data');
        this.table(['Format',
            'Output Tokens Man', 'Output Tokens Opt', 'Diff', 'Diff (%)', 'Useful Output Tokens Man', 'Useful Output Tokens Opt', 'Diff', 'Diff (%)', 'Wasted Output Tokens Man', 'Wasted Output Tokens Opt', 'Diff', 'Diff (%)',
            'Accuracy (%) Man', 'Accuracy (%) Opt', 'Diff (%)',
            'Eff Score Output Man', 'Eff Score Output Opt', 'Diff', 'Diff (%)',
            'Wtd Accuracy (%) Man', 'Wtd Accuracy (%) Opt', 'Diff (%)',
            'Wtd Eff Score Output Man', 'Wtd Eff Score Output Opt', 'Diff', 'Diff (%)'], mandOptEffOutputTokenDeltaRows);
        // 2.6.4 Total Token Utilization Efficiency: Mandatory vs Optional Data
        const mandOptEffTotalTokenDeltaRows = mandatories.map(x => {
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
        this.heading(4, '2.6.4 Total Tokens: Mandatory vs Optional Data');
        this.table(['Format',
            'Total Tokens Man', 'Total Tokens Opt', 'Diff', 'Diff (%)', 'Useful Total Tokens Man', 'Useful Total Tokens Opt', 'Diff', 'Diff (%)', 'Wasted Total Tokens Man', 'Wasted Total Tokens Opt', 'Diff', 'Diff (%)',
            'Accuracy (%) Man', 'Accuracy (%) Opt', 'Diff (%)',
            'Eff Score Total Man', 'Eff Score Total Opt', 'Diff', 'Diff (%)',
            'Wtd Accuracy (%) Man', 'Wtd Accuracy (%) Opt', 'Diff (%)',
            'Wtd Eff Score Total Man', 'Wtd Eff Score Total Opt', 'Diff', 'Diff (%)'], mandOptEffTotalTokenDeltaRows);
        // 2.7.1 Token Utilization Efficiency: Metrics
        const effTokenRowsAccuracyByCharPerc = sortedAggregated.map(item => [
            item.format,
            item.variant.substring(0, 3),
            Math.round(item.readTokens).toString(),
            Math.round(item.usefulReadTokensAccuracyByCharPerc).toString(),
            Math.round(item.wastedReadTokensAccuracyByCharPerc).toString(),
            Math.round(item.outputTokensTotal).toString(),
            Math.round(item.usefulOutputTokensAccuracyByCharPerc).toString(),
            Math.round(item.wastedOutputTokensAccuracyByCharPerc).toString(),
            Math.round(item.totalTokens).toString(),
            Math.round(item.usefulTotalTokensAccuracyByCharPerc).toString(),
            Math.round(item.wastedTotalTokensAccuracyByCharPerc).toString(),
            item.accuracyByCharPerc.toFixed(2),
            item.efficiencyScoreReadAccuracyByCharPerc.toFixed(2),
            item.efficiencyScoreOutputAccuracyByCharPerc.toFixed(2),
            item.efficiencyScoreTotalAccuracyByCharPerc.toFixed(2),
            item.weightedAccuracyByCharPerc.toFixed(2),
            item.weightedEfficiencyScoreReadAccuracyByCharPerc.toFixed(2),
            item.weightedEfficiencyScoreOutputAccuracyByCharPerc.toFixed(2),
            item.weightedEfficiencyScoreTotalAccuracyByCharPerc.toFixed(2),
        ]);
        this.heading(3, '2.7 Token Utilization Efficiency (Accuracy by Character)');
        this.heading(4, '2.7.1 Metrics');
        this.table(['Format', 'Variant',
            'Read Tokens', 'Useful Read Tokens', 'Wasted Read Tokens',
            'Output Tokens', 'Useful Output Tokens', 'Wasted Output Tokens',
            'Total Tokens', 'Useful Total Tokens', 'Wasted Total Tokens',
            'Accuracy by Character (%)',
            'Eff Score Read', 'Eff Score Output', 'Eff Score Total',
            'Wtd Accuracy by Character (%)',
            'Wtd Eff Score Read', 'Wtd Eff Score Output', 'Wtd Eff Score Total'], effTokenRowsAccuracyByCharPerc);
        // 2.7.2 Read Token Utilization Efficiency (Accuracy by Character): Mandatory vs Optional Data
        const mandOptEffReadTokenDeltaRowsAccuracyByCharPerc = mandatories.map(x => {
            const readTokens = Math.round(x.readTokens);
            const usefulReadTokens = Math.round(x.usefulReadTokensAccuracyByCharPerc);
            const wastedReadTokens = Math.round(x.wastedReadTokensAccuracyByCharPerc);
            return [
                x.format,
                readTokens.toString(),
                Math.round(readTokens + x.readTokensDelta).toString(),
                this.displayDelta(x.readTokensDelta, 0),
                this.calcDeltaPercentage(readTokens, x.readTokensDelta),
                usefulReadTokens.toString(),
                Math.round(usefulReadTokens + x.usefulReadTokensAccuracyByCharPercDelta).toString(),
                this.displayDelta(x.usefulReadTokensAccuracyByCharPercDelta, 0),
                this.calcDeltaPercentage(usefulReadTokens, x.usefulReadTokensAccuracyByCharPercDelta),
                wastedReadTokens.toString(),
                Math.round(wastedReadTokens + x.wastedReadTokensAccuracyByCharPercDelta).toString(),
                this.displayDelta(x.wastedReadTokensAccuracyByCharPercDelta, 0),
                this.calcDeltaPercentage(wastedReadTokens, x.wastedReadTokensAccuracyByCharPercDelta),
                x.accuracyByCharPerc.toFixed(2),
                (x.accuracyByCharPerc + x.accuracyByCharPercDelta).toFixed(2),
                this.displayDelta(x.accuracyByCharPercDelta),
                this.calcDeltaPercentage(x.accuracyByCharPerc, x.accuracyByCharPercDelta),
                x.efficiencyScoreReadAccuracyByCharPerc.toFixed(2),
                (x.efficiencyScoreReadAccuracyByCharPerc + x.efficiencyScoreReadAccuracyByCharPercDelta).toFixed(2),
                this.displayDelta(x.efficiencyScoreReadAccuracyByCharPercDelta, 2),
                this.calcDeltaPercentage(x.efficiencyScoreReadAccuracyByCharPerc, x.efficiencyScoreReadAccuracyByCharPercDelta),
                x.weightedAccuracyByCharPerc.toFixed(2),
                (x.weightedAccuracyByCharPerc + x.weightedAccuracyByCharPercDelta).toFixed(2),
                this.displayDelta(x.weightedAccuracyByCharPercDelta),
                this.calcDeltaPercentage(x.weightedAccuracyByCharPerc, x.weightedAccuracyByCharPercDelta),
                x.weightedEfficiencyScoreReadAccuracyByCharPerc.toFixed(2),
                (x.weightedEfficiencyScoreReadAccuracyByCharPerc + x.weightedEfficiencyScoreReadAccuracyByCharPercDelta).toFixed(2),
                this.displayDelta(x.weightedEfficiencyScoreReadAccuracyByCharPercDelta, 2),
                this.calcDeltaPercentage(x.weightedEfficiencyScoreReadAccuracyByCharPerc, x.weightedEfficiencyScoreReadAccuracyByCharPercDelta)
            ];
        });
        this.heading(4, '2.7.2 Read Tokens (Accuracy by Character): Mandatory vs Optional Data');
        this.table(['Format',
            'Read Tokens Man', 'Read Tokens Opt', 'Diff', 'Diff (%)', 'Useful Read Tokens Man', 'Useful Read Tokens Opt', 'Diff', 'Diff (%)', 'Wasted Read Tokens Man', 'Wasted Read Tokens Opt', 'Diff', 'Diff (%)',
            'Accuracy by Character (%) Man', 'Accuracy by Character (%) Opt', 'Diff (%)',
            'Eff Score Read Man', 'Eff Score Read Opt', 'Diff', 'Diff (%)',
            'Wtd Accuracy by Character (%) Man', 'Wtd Accuracy by Character (%) Opt', 'Diff (%)',
            'Wtd Eff Score Read Man', 'Wtd Eff Score Read Opt', 'Diff', 'Diff (%)'], mandOptEffReadTokenDeltaRowsAccuracyByCharPerc);
        // 2.7.3 Output Token Utilization Efficiency (Accuracy by Character): Mandatory vs Optional Data
        const mandOptEffOutputTokenDeltaRowsAccuracyByCharPerc = mandatories.map(x => {
            const outputTokens = Math.round(x.outputTokensTotal);
            const usefulOutputTokens = Math.round(x.usefulOutputTokensAccuracyByCharPerc);
            const wastedOutputTokens = Math.round(x.wastedOutputTokensAccuracyByCharPerc);
            return [
                x.format,
                outputTokens.toString(),
                Math.round(outputTokens + x.outputTokensTotalDelta).toString(),
                this.displayDelta(x.outputTokensTotalDelta, 0),
                this.calcDeltaPercentage(outputTokens, x.outputTokensTotalDelta),
                usefulOutputTokens.toString(),
                Math.round(usefulOutputTokens + x.usefulOutputTokensAccuracyByCharPercDelta).toString(),
                this.displayDelta(x.usefulOutputTokensAccuracyByCharPercDelta, 0),
                this.calcDeltaPercentage(usefulOutputTokens, x.usefulOutputTokensAccuracyByCharPercDelta),
                wastedOutputTokens.toString(),
                Math.round(wastedOutputTokens + x.wastedOutputTokensAccuracyByCharPercDelta).toString(),
                this.displayDelta(x.wastedOutputTokensAccuracyByCharPercDelta, 0),
                this.calcDeltaPercentage(wastedOutputTokens, x.wastedOutputTokensAccuracyByCharPercDelta),
                x.accuracyByCharPerc.toFixed(2),
                (x.accuracyByCharPerc + x.accuracyByCharPercDelta).toFixed(2),
                this.displayDelta(x.accuracyByCharPercDelta),
                this.calcDeltaPercentage(x.accuracyByCharPerc, x.accuracyByCharPercDelta),
                x.efficiencyScoreOutputAccuracyByCharPerc.toFixed(2),
                (x.efficiencyScoreOutputAccuracyByCharPerc + x.efficiencyScoreOutputAccuracyByCharPercDelta).toFixed(2),
                this.displayDelta(x.efficiencyScoreOutputAccuracyByCharPercDelta, 2),
                this.calcDeltaPercentage(x.efficiencyScoreOutputAccuracyByCharPerc, x.efficiencyScoreOutputAccuracyByCharPercDelta),
                x.weightedAccuracyByCharPerc.toFixed(2),
                (x.weightedAccuracyByCharPerc + x.weightedAccuracyByCharPercDelta).toFixed(2),
                this.displayDelta(x.weightedAccuracyByCharPercDelta),
                this.calcDeltaPercentage(x.weightedAccuracyByCharPerc, x.weightedAccuracyByCharPercDelta),
                x.weightedEfficiencyScoreOutputAccuracyByCharPerc.toFixed(2),
                (x.weightedEfficiencyScoreOutputAccuracyByCharPerc + x.weightedEfficiencyScoreOutputAccuracyByCharPercDelta).toFixed(2),
                this.displayDelta(x.weightedEfficiencyScoreOutputAccuracyByCharPercDelta, 2),
                this.calcDeltaPercentage(x.weightedEfficiencyScoreOutputAccuracyByCharPerc, x.weightedEfficiencyScoreOutputAccuracyByCharPercDelta),
            ];
        });
        this.heading(4, '2.7.3 Output Tokens (Accuracy by Character): Mandatory vs Optional Data');
        this.table(['Format',
            'Output Tokens Man', 'Output Tokens Opt', 'Diff', 'Diff (%)', 'Useful Output Tokens Man', 'Useful Output Tokens Opt', 'Diff', 'Diff (%)', 'Wasted Output Tokens Man', 'Wasted Output Tokens Opt', 'Diff', 'Diff (%)',
            'Accuracy by Character (%) Man', 'Accuracy by Character (%) Opt', 'Diff (%)',
            'Eff Score Output Man', 'Eff Score Output Opt', 'Diff', 'Diff (%)',
            'Wtd Accuracy by Character (%) Man', 'Wtd Accuracy by Character (%) Opt', 'Diff (%)',
            'Wtd Eff Score Output Man', 'Wtd Eff Score Output Opt', 'Diff', 'Diff (%)'], mandOptEffOutputTokenDeltaRowsAccuracyByCharPerc);
        // 2.7.4 Total Token Utilization Efficiency (Accuracy by Character): Mandatory vs Optional Data
        const mandOptEffTotalTokenDeltaRowsAccuracyByCharPerc = mandatories.map(x => {
            const totalTokens = Math.round(x.totalTokens);
            const usefulTotalTokens = Math.round(x.usefulTotalTokensAccuracyByCharPerc);
            const wastedTotalTokens = Math.round(x.wastedTotalTokensAccuracyByCharPerc);
            return [
                x.format,
                totalTokens.toString(),
                Math.round(totalTokens + x.totalTokensDelta).toString(),
                this.displayDelta(x.totalTokensDelta, 0),
                this.calcDeltaPercentage(totalTokens, x.totalTokensDelta),
                usefulTotalTokens.toString(),
                Math.round(usefulTotalTokens + x.usefulTotalTokensAccuracyByCharPercDelta).toString(),
                this.displayDelta(x.usefulTotalTokensAccuracyByCharPercDelta, 0),
                this.calcDeltaPercentage(usefulTotalTokens, x.usefulTotalTokensAccuracyByCharPercDelta),
                wastedTotalTokens.toString(),
                Math.round(wastedTotalTokens + x.wastedTotalTokensAccuracyByCharPercDelta).toString(),
                this.displayDelta(x.wastedTotalTokensAccuracyByCharPercDelta, 0),
                this.calcDeltaPercentage(wastedTotalTokens, x.wastedTotalTokensAccuracyByCharPercDelta),
                x.accuracyByCharPerc.toFixed(2),
                (x.accuracyByCharPerc + x.accuracyByCharPercDelta).toFixed(2),
                this.displayDelta(x.accuracyByCharPercDelta),
                this.calcDeltaPercentage(x.accuracyByCharPerc, x.accuracyByCharPercDelta),
                x.efficiencyScoreTotalAccuracyByCharPerc.toFixed(2),
                (x.efficiencyScoreTotalAccuracyByCharPerc + x.efficiencyScoreTotalAccuracyByCharPercDelta).toFixed(2),
                this.displayDelta(x.efficiencyScoreTotalAccuracyByCharPercDelta, 2),
                this.calcDeltaPercentage(x.efficiencyScoreTotalAccuracyByCharPerc, x.efficiencyScoreTotalAccuracyByCharPercDelta),
                x.weightedAccuracyByCharPerc.toFixed(2),
                (x.weightedAccuracyByCharPerc + x.weightedAccuracyByCharPercDelta).toFixed(2),
                this.displayDelta(x.weightedAccuracyByCharPercDelta),
                this.calcDeltaPercentage(x.weightedAccuracyByCharPerc, x.weightedAccuracyByCharPercDelta),
                x.weightedEfficiencyScoreTotalAccuracyByCharPerc.toFixed(2),
                (x.weightedEfficiencyScoreTotalAccuracyByCharPerc + x.weightedEfficiencyScoreTotalAccuracyByCharPercDelta).toFixed(2),
                this.displayDelta(x.weightedEfficiencyScoreTotalAccuracyByCharPercDelta, 2),
                this.calcDeltaPercentage(x.weightedEfficiencyScoreTotalAccuracyByCharPerc, x.weightedEfficiencyScoreTotalAccuracyByCharPercDelta),
            ];
        });
        this.heading(4, '2.7.4 Total Tokens (Accuracy by Character): Mandatory vs Optional Data');
        this.table(['Format',
            'Total Tokens Man', 'Total Tokens Opt', 'Diff', 'Diff (%)', 'Useful Total Tokens Man', 'Useful Total Tokens Opt', 'Diff', 'Diff (%)', 'Wasted Total Tokens Man', 'Wasted Total Tokens Opt', 'Diff', 'Diff (%)',
            'Accuracy by Character (%) Man', 'Accuracy by Character (%) Opt', 'Diff (%)',
            'Eff Score Total Man', 'Eff Score Total Opt', 'Diff', 'Diff (%)',
            'Wtd Accuracy by Character (%) Man', 'Wtd Accuracy by Character (%) Opt', 'Diff (%)',
            'Wtd Eff Score Total Man', 'Wtd Eff Score Total Opt', 'Diff', 'Diff (%)'], mandOptEffTotalTokenDeltaRowsAccuracyByCharPerc);
        // 2.8.1 Answer Quality Breakdown: Metrics
        const answerQualityRows = sortedAggregated.map(item => [
            item.format,
            item.variant.substring(0, 3),
            item.correctAnswers.toFixed(2),
            item.incorrectAnswers.toFixed(2),
            item.noAnswers.toFixed(2),
            item.accuracyPercent.toFixed(2),
            item.expectedChars.toFixed(2),
            item.totalChars.toFixed(2),
            item.correctChars.toFixed(2),
            item.incorrectChars.toFixed(2),
            item.accuracyByCharPerc.toFixed(2),
        ]);
        this.heading(3, '2.8 Answer Per Format Breakdown');
        this.heading(4, '2.8.1 Metrics');
        this.table(['Format', 'Variant', 'Correct Answers', 'Incorrect Answers', 'No Answers', 'Accuracy (%)', 'Expected Characters', 'Output Characters', 'Correct Characters', 'Incorrect Characters', 'Accuracy by Character (%)'], answerQualityRows);
        // 2.8.2 Answer Per Format Breakdown: Mandatory vs Optional Data
        const mandOptAnswerDeltaRows = mandatories.map(x => {
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
                this.displayDelta(x.accuracyDelta)
            ];
        });
        this.heading(4, '2.8.2 Answers: Mandatory vs Optional Data');
        this.table(['Format', 'Correct Man', 'Correct Opt', 'Diff', 'Diff (%)', 'Incorrect Man', 'Incorrect Opt', 'Diff', 'Diff (%)', 'No Answers Man', 'No Answers Opt', 'Diff', 'Diff (%)', 'Accuracy (%) Man', 'Accuracy (%) Opt', 'Diff (%)'], mandOptAnswerDeltaRows);
        // 2.8.3 Answer Per Format Breakdown: Characters: Mandatory vs Optional Data
        const mandOptAnswerDeltaRowsAccuracyByCharPerc = mandatories.map(x => {
            return [
                x.format,
                x.totalChars.toFixed(2),
                (x.totalChars + x.totalCharsDelta).toFixed(2),
                this.displayDelta(x.totalCharsDelta, 0),
                this.calcDeltaPercentage(x.totalChars, x.totalCharsDelta),
                x.correctChars.toFixed(2),
                (x.correctChars + x.correctCharsDelta).toFixed(2),
                this.displayDelta(x.correctCharsDelta, 0),
                this.calcDeltaPercentage(x.correctChars, x.correctCharsDelta),
                x.incorrectChars.toFixed(2),
                (x.incorrectChars + x.incorrectCharsDelta).toFixed(2),
                this.displayDelta(x.incorrectCharsDelta, 0),
                this.calcDeltaPercentage(x.incorrectChars, x.incorrectCharsDelta),
                x.accuracyByCharPerc.toFixed(2),
                (x.accuracyByCharPerc + x.accuracyByCharPercDelta).toFixed(2),
                this.displayDelta(x.accuracyByCharPercDelta)
            ];
        });
        this.heading(4, '2.8.3 Characters: Mandatory vs Optional Data');
        this.table(['Format',
            'Output Characters Man', 'Output Characters Opt', 'Diff', 'Diff (%)',
            'Correct Characters Man', 'Correct Characters Opt', 'Diff', 'Diff (%)',
            'Incorrect Characters Man', 'Incorrect Characters Opt', 'Diff', 'Diff (%)',
            'Accuracy by Character (%) Man', 'Accuracy by Character (%) Opt', 'Diff (%)'], mandOptAnswerDeltaRowsAccuracyByCharPerc);
        // 2.9 Accuracy Per Question Category Analysis
        const categoryRows = sortedAggregated.map(item => {
            const validation = this.validations.find(x => x.format === item.format && x.variant === item.variant && x.recordCount === item.recordCount);
            const retrieval = validation?.accuracy.find(x => x.category === 'field_retrieval');
            const structure = validation?.accuracy.find(x => x.category === 'structure_awareness');
            const filtering = validation?.accuracy.find(x => x.category === 'filtering');
            const aggregation = validation?.accuracy.find(x => x.category === 'aggregation');
            return [
                item.format,
                item.variant.substring(0, 3),
                item.accuracyPercent.toFixed(2),
                retrieval?.accuracyPercent.toFixed(2) ?? '0',
                structure?.accuracyPercent.toFixed(2) ?? '0',
                filtering?.accuracyPercent.toFixed(2) ?? '0',
                aggregation?.accuracyPercent.toFixed(2) ?? '0',
                item.weightedAccuracyByCharPerc.toFixed(2),
                retrieval?.weightedAccuracyPercent.toFixed(2) ?? '0',
                structure?.weightedAccuracyPercent.toFixed(2) ?? '0',
                filtering?.weightedAccuracyPercent.toFixed(2) ?? '0',
                aggregation?.weightedAccuracyPercent.toFixed(2) ?? '0',
            ];
        });
        this.heading(3, '2.9 Accuracy Per Question Category Analysis');
        this.heading(4, '2.9.1 Metrics');
        this.table(['Format', 'Variant', 'Accuracy (%)', 'Field Retrieval (%)', 'Structure Awareness (%)', 'Filtering (%)', 'Aggregation (%)', 'Wtd Acc (%)', 'Wtd Field Retrieval (%)', 'Wtd Structure Awareness (%)', 'Wtd Filtering (%)', 'Wtd Aggregation (%)'], categoryRows);
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
                item.variant.substring(0, 3),
                item.accuracyByCharPerc.toFixed(2),
                retrieval?.charactersOfAnswers.accuracyByCharPerc.toFixed(2) ?? '0',
                structure?.charactersOfAnswers.accuracyByCharPerc.toFixed(2) ?? '0',
                filtering?.charactersOfAnswers.accuracyByCharPerc.toFixed(2) ?? '0',
                aggregation?.charactersOfAnswers.accuracyByCharPerc.toFixed(2) ?? '0',
                item.weightedAccuracyByCharPerc.toFixed(2),
                retrieval?.charactersOfAnswers.weightedAccuracyByCharPerc.toFixed(2) ?? '0',
                structure?.charactersOfAnswers.weightedAccuracyByCharPerc.toFixed(2) ?? '0',
                filtering?.charactersOfAnswers.weightedAccuracyByCharPerc.toFixed(2) ?? '0',
                aggregation?.charactersOfAnswers.weightedAccuracyByCharPerc.toFixed(2) ?? '0',
            ];
        });
        this.heading(3, '2.10 Accuracy By Character Per Question Category Analysis');
        this.heading(4, '2.10.1 Metrics');
        this.table(['Format', 'Variant', 'Accuracy By Character (%)', 'Field Retrieval (%)', 'Structure Awareness (%)', 'Filtering (%)', 'Aggregation (%)', 'Wtd Acc By Char (%)', 'Wtd Field Retrieval (%)', 'Wtd Structure Awareness (%)', 'Wtd Filtering (%)', 'Wtd Aggregation (%)'], categoryRowsAccuracyByCharPerc);
        this.diffMandOptAccuracyByCharacterPerCategory('2.10.2', 'field_retrieval', mandatoriesVals, optionalsVals);
        this.diffMandOptAccuracyByCharacterPerCategory('2.10.3', 'structure_awareness', mandatoriesVals, optionalsVals);
        this.diffMandOptAccuracyByCharacterPerCategory('2.10.4', 'filtering', mandatoriesVals, optionalsVals);
        this.diffMandOptAccuracyByCharacterPerCategory('2.10.5', 'aggregation', mandatoriesVals, optionalsVals);
    }
    calcDeltaPercentage(manVal, optManDelta, fixed = 2) {
        return this.displayDelta(manVal > 0 ? (optManDelta / manVal) * 100 : 0, fixed);
    }
    displayDelta(percentage, fixed = 2) {
        return (percentage > 0 ? ' +' : '') + percentage.toFixed(fixed);
    }
    diffMandOptAccuracyPerCategory(idx, category, mandatoriesVals, optionalsVals) {
        this.heading(4, `${idx} ${this.getQuestionCategoryLabel(category)}: Mandatory vs Optional`);
        this.line();
        const categoryMandOptRows = this.uniqueFormats.map(fmt => {
            const man = mandatoriesVals.find(x => x.category === category && x.format == fmt);
            const opt = optionalsVals.find(x => x.category === category && x.format == fmt);
            return this.getAccuracyPerCategoryRow(fmt, man?.accuracyPercent ?? 0, opt?.accuracyPercent ?? 0, man?.weightedAccuracyPercent ?? 0, opt?.weightedAccuracyPercent ?? 0);
        }).filter(r => r !== null);
        this.printAccuracyPerCategoryTable(categoryMandOptRows);
    }
    diffMandOptAccuracyByCharacterPerCategory(idx, category, mandatoriesVals, optionalsVals) {
        this.heading(4, `${idx} ${this.getQuestionCategoryLabel(category)}: Mandatory vs Optional`);
        this.line();
        const categoryMandOptRows = this.uniqueFormats.map(fmt => {
            const man = mandatoriesVals.find(x => x.category === category && x.format == fmt);
            const opt = optionalsVals.find(x => x.category === category && x.format == fmt);
            return this.getAccuracyPerCategoryRow(fmt, man?.accuracyByCharPerc ?? 0, opt?.accuracyByCharPerc ?? 0, man?.weightedAccuracyByCharPerc ?? 0, opt?.weightedAccuracyByCharPerc ?? 0);
        }).filter(r => r !== null);
        this.printAccuracyPerCategoryTable(categoryMandOptRows);
    }
    getAccuracyPerCategoryRow(fmt, man, opt, manWtd, optWtd) {
        return [
            fmt,
            man.toFixed(2),
            opt.toFixed(2),
            this.displayDelta(opt - man),
            manWtd.toFixed(2),
            optWtd.toFixed(2),
            this.displayDelta(optWtd - manWtd),
        ];
    }
    printAccuracyPerCategoryTable(categoryMandOptRows) {
        this.table(['Format', 'Man (%)', 'Opt (%)', 'Diff (%)', 'Wdt Man (%)', 'Wdt Opt (%)', 'Diff (%)'], categoryMandOptRows);
    }
    generateAppendices() {
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
