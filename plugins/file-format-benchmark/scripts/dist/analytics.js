"use strict";
/**
 * Benchmarking Analytics Script
 * Calculates token efficiency and accuracy metrics from test results
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const agent_discovery_1 = require("./analytics/agent-discovery");
const metrics_extraction_1 = __importDefault(require("./analytics/metrics-extraction"));
const reportValidator_1 = __importDefault(require("./validators/reportValidator"));
const consts_1 = require("./consts");
class BenchmarkAnalytics {
    outputDir;
    validationDir;
    metadataFile;
    outputFile;
    metricsFile;
    agentIdsFile;
    constructor(agentIdsFile, outputDir) {
        this.agentIdsFile = agentIdsFile;
        this.outputDir = outputDir;
        this.validationDir = path.join(outputDir, consts_1.DIRECTORY_ANSWERS_VALIDATION);
        this.metadataFile = path.join(this.outputDir, consts_1.FILE_METADATA);
        this.outputFile = path.join(outputDir, consts_1.FILE_ANALYTICS_RESULT);
        this.metricsFile = path.join(outputDir, consts_1.FILE_METRICS);
    }
    analyze() {
        console.log("Extracting metrics from agent transcripts...");
        const userMetrics = this.extractMetrics();
        console.log("Validating results...");
        const validationResults = this.validateResults();
        console.log("Loading metadata...");
        const metadata = this.loadMetadata();
        console.log("Calculating metrics...");
        const testMetrics = this.calculateMetrics(userMetrics, metadata, validationResults);
        console.log("Generating insights...");
        const analytics = this.generateAnalytics(testMetrics);
        console.log(`Writing results to ${this.outputFile}...`);
        this.writeOutput(analytics);
        console.log("✓ Analytics complete");
        console.log(`\nResults saved to: ${this.outputFile}`);
    }
    extractMetrics() {
        if (!fs.existsSync(this.agentIdsFile)) {
            console.warn(`AgentId file not found: ${this.agentIdsFile}`);
            return [];
        }
        try {
            const extraction = new metrics_extraction_1.default(this.agentIdsFile, this.metricsFile);
            return extraction.extract();
        }
        catch (err) {
            throw new Error(`Metrics extraction failed: ${err}`);
        }
    }
    loadMetadata() {
        const content = fs.readFileSync(this.metadataFile, "utf-8");
        return JSON.parse(content);
    }
    validateResults() {
        const results = new Map();
        if (!fs.existsSync(this.validationDir)) {
            console.warn(`Validation directory not found: ${this.validationDir}`);
            return results;
        }
        try {
            const validator = new reportValidator_1.default(this.outputDir);
            var reports = validator.validate();
            reports.forEach(x => {
                const key = this.getLookupKey(x.format, x.structure, x.recordCount, x.variant === 'optional');
                results.set(key, x);
            });
        }
        catch (err) {
            throw new Error(`Validation failed: ${err}`);
        }
        return results;
    }
    calculateMetrics(userMetrics, metadata, validationResults) {
        const metrics = [];
        // Build lookup map from metadata
        const datasetMap = new Map();
        const filesArray = metadata.filesPerRecordCount || [];
        for (const file of filesArray) {
            if (Array.isArray(file.dataAndOutput)) {
                for (const dataAndOutput of file.dataAndOutput) {
                    const key = this.getLookupKey(dataAndOutput.format, dataAndOutput.structure, file.recordCount, dataAndOutput.allFieldsManadatory === false);
                    datasetMap.set(key, {
                        format: dataAndOutput.format,
                        recordCount: file.recordCount,
                        totalValues: file.totalValues,
                        characterCount: dataAndOutput.metadata.characterCount,
                        questionCount: file.questionCount,
                    });
                }
            }
        }
        const minMaxRecordCount = new Map();
        for (const userMetric of userMetrics) {
            const tokens = userMetric.readTokens + userMetric.outputTokens;
            const entry = minMaxRecordCount.get(userMetric.recordCount);
            if (!entry) {
                minMaxRecordCount.set(userMetric.recordCount, { min: tokens, max: tokens });
            }
            else {
                entry.max = entry.max < tokens ? tokens : entry.max;
                entry.min = entry.min > tokens ? tokens : entry.min;
                minMaxRecordCount.set(userMetric.recordCount, entry);
            }
        }
        // Process each test case
        for (const userMetric of userMetrics) {
            const lookupKey = this.getLookupKey(userMetric.format, userMetric.structure, userMetric.recordCount, userMetric.hasOptionalData);
            const datasetInfo = datasetMap.get(lookupKey);
            if (!datasetInfo) {
                console.warn(`Dataset info not found for: ${lookupKey}`);
                continue;
            }
            const validation = validationResults.get(lookupKey);
            if (!validation) {
                console.warn(`Validation info not found for: ${lookupKey}`);
                continue;
            }
            const entry = minMaxRecordCount.get(userMetric.recordCount);
            const totalTokensUsed = userMetric.readTokens + userMetric.outputTokens;
            const normalizedAmountScore = entry ? this.normalizedAmountScore(entry.min - 10, entry.max + 10, totalTokensUsed) : 0;
            metrics.push({
                testCase: userMetric.testCase,
                format: userMetric.format,
                variant: userMetric.variant,
                hasOptionalData: userMetric.hasOptionalData,
                recordCount: userMetric.recordCount,
                totalValues: datasetInfo.totalValues,
                characterCount: datasetInfo.characterCount,
                readTokens: userMetric.readTokens,
                readDurationInMilliseconds: userMetric.readDurationInMilliseconds,
                readTokensPerMillisecond: parseFloat((userMetric.readTokens / userMetric.readDurationInMilliseconds).toFixed(3)),
                avgOutputTokens: userMetric.outputTokens,
                avgReasoningDurationInMilliseconds: userMetric.reasoningDurationInMilliseconds,
                avgReasoningTokensPerMillisecond: parseFloat((userMetric.outputTokens / userMetric.reasoningDurationInMilliseconds).toFixed(3)),
                totalQuestions: validation.totalQuestions,
                avgNoAnswers: validation.totalQuestions - validation.accuracy.correct - validation.accuracy.incorrect,
                avgIncorrectAnswers: validation.accuracy.incorrect,
                avgCorrectAnswers: validation.accuracy.correct,
                avgAccuracyPercent: validation.accuracy.accuracyPercent,
                avgWeightedAccuracyPercent: validation.accuracy.weightedAccuracyPercent,
                charsPerToken: parseFloat((datasetInfo.characterCount / userMetric.readTokens).toFixed(3)),
                tokensPerValue: parseFloat((userMetric.readTokens / datasetInfo.totalValues).toFixed(3)),
                tokensPerObject: parseFloat((userMetric.readTokens / datasetInfo.recordCount).toFixed(3)),
                avgOutputTokensPerAnswer: parseFloat((userMetric.outputTokens / validation.totalQuestions).toFixed(3)),
                informationValuePerToken: parseFloat(((validation.accuracy.accuracyPercent / totalTokensUsed) * 100).toFixed(3)),
                costOfInaccuracy: parseFloat((totalTokensUsed * (1 - (validation.accuracy.accuracyPercent / 100))).toFixed(3)),
                totalTokensUsed: totalTokensUsed,
                efficientlyUsedTokens: parseFloat((totalTokensUsed * (validation.accuracy.accuracyPercent / 100)).toFixed(3)),
                weightedEfficientlyUsedTokens: parseFloat((totalTokensUsed * (validation.accuracy.weightedAccuracyPercent / 100)).toFixed(3)),
                efficiencyScore: parseFloat(((validation.accuracy.accuracyPercent * 0.7) + (normalizedAmountScore * 0.3)).toFixed(3)),
                weightedEfficiencyScore: parseFloat(((validation.accuracy.weightedAccuracyPercent * 0.7) + (normalizedAmountScore * 0.3)).toFixed(3)),
            });
        }
        return metrics;
    }
    getLookupKey(format, structure, recordCount, hasOptionalData) {
        return `${format}_${structure}_${recordCount}_${hasOptionalData ? 'optional' : 'mandatory'}`;
    }
    normalizedAmountScore(min, max, value) {
        return ((max - value) / (max - min)) * 100;
    }
    generateAnalytics(metrics) {
        if (metrics.length === 0) {
            throw new Error("No metrics to analyze");
        }
        const rankings = this.generateRanking(metrics);
        const formats = [...new Set(metrics.map((m) => m.format))];
        const variants = [...new Set(metrics.map((m) => m.variant))];
        const recordCounts = [...new Set(metrics.map((m) => m.recordCount))].sort((a, b) => b - a);
        return {
            timestamp: new Date().toISOString(),
            testConfigurations: {
                metadataFile: this.metadataFile,
                agentIdsFile: this.agentIdsFile,
                metricsFile: this.metricsFile,
                model: "Entered by user",
                thinking: "Entered by user",
                formats,
                variants,
                recordCounts,
                questionDistribution: [
                    ["field_retrieval", consts_1.QUESTIONS_DISTRIBUTION["field_retrieval"]],
                    ["filtering", consts_1.QUESTIONS_DISTRIBUTION["filtering"]],
                    ["aggregation", consts_1.QUESTIONS_DISTRIBUTION["aggregation"]],
                    ["structure_awareness", consts_1.QUESTIONS_DISTRIBUTION["structure_awareness"]]
                ],
                questionWeightDistribution: [
                    ["field_retrieval", consts_1.QUESTIONS_WEIGHT_DISTRIBUTION["field_retrieval"]],
                    ["filtering", consts_1.QUESTIONS_WEIGHT_DISTRIBUTION["filtering"]],
                    ["aggregation", consts_1.QUESTIONS_WEIGHT_DISTRIBUTION["aggregation"]],
                    ["structure_awareness", consts_1.QUESTIONS_WEIGHT_DISTRIBUTION["structure_awareness"]]
                ],
            },
            rankings,
            metrics
        };
    }
    generateRanking(metrics) {
        const recordCounts = [...new Set(metrics.map((m) => m.recordCount))].sort((a, b) => b - a);
        const byRecordCount = {};
        const rankingCount = 4;
        for (const recordCount of recordCounts) {
            const formatMetrics = metrics.filter((m) => m.recordCount === recordCount);
            const avgCharsPerToken = Math.round(formatMetrics.reduce((sum, m) => sum + m.charsPerToken, 0) / formatMetrics.length * 1000) / 1000;
            const avgTokensPerValue = Math.round(formatMetrics.reduce((sum, m) => sum + m.tokensPerValue, 0) / formatMetrics.length * 1000) / 1000;
            const avgTokensPerObject = Math.round(formatMetrics.reduce((sum, m) => sum + m.tokensPerObject, 0) / formatMetrics.length * 1000) / 1000;
            const avgAccuracy = Math.round(formatMetrics.reduce((sum, m) => sum + m.avgAccuracyPercent, 0) / formatMetrics.length * 1000) / 1000;
            const mostTokenEfficient = [];
            const sortedByCharsPerToken = formatMetrics.sort((a, b) => b.charsPerToken - a.charsPerToken);
            for (let i = 0; i < sortedByCharsPerToken.length && i < rankingCount; i++) {
                mostTokenEfficient[i] = this.createRankingEntry(sortedByCharsPerToken[i]);
            }
            const leastTokenUsage = [];
            const sortedByTokenUsage = formatMetrics.sort((a, b) => a.totalTokensUsed - b.totalTokensUsed);
            for (let i = 0; i < sortedByTokenUsage.length && i < rankingCount; i++) {
                leastTokenUsage[i] = this.createRankingEntry(sortedByTokenUsage[i]);
            }
            const mostAccurate = [];
            const sortedByAccurate = formatMetrics.sort((a, b) => b.avgAccuracyPercent - a.avgAccuracyPercent);
            for (let i = 0; i < sortedByAccurate.length && i < rankingCount; i++) {
                mostAccurate[i] = this.createRankingEntry(sortedByAccurate[i]);
            }
            const mostWeightedAccuracy = [];
            const sortedByWeightedAccuracyPercent = formatMetrics.sort((a, b) => b.avgWeightedAccuracyPercent - a.avgWeightedAccuracyPercent);
            for (let i = 0; i < sortedByWeightedAccuracyPercent.length && i < rankingCount; i++) {
                mostWeightedAccuracy[i] = this.createRankingEntry(sortedByWeightedAccuracyPercent[i]);
            }
            const mostEfficiencyScore = [];
            const sortedByEfficiencyScore = formatMetrics.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
            for (let i = 0; i < sortedByEfficiencyScore.length && i < rankingCount; i++) {
                mostEfficiencyScore[i] = this.createRankingEntry(sortedByEfficiencyScore[i]);
            }
            const mostWeightedEfficiencyScore = [];
            const sortedByWeightedEfficiencyScore = formatMetrics.sort((a, b) => b.weightedEfficiencyScore - a.weightedEfficiencyScore);
            for (let i = 0; i < sortedByWeightedEfficiencyScore.length && i < rankingCount; i++) {
                mostWeightedEfficiencyScore[i] = this.createRankingEntry(sortedByWeightedEfficiencyScore[i]);
            }
            byRecordCount[recordCount] = {
                avgCharsPerToken,
                avgTokensPerValue,
                avgTokensPerObject,
                avgAccuracy,
                mostTokenEfficient: mostTokenEfficient,
                leastTokenUsage: leastTokenUsage,
                mostAccurate: mostAccurate,
                mostAccurateWeighted: mostWeightedAccuracy,
                mostEfficiencyScore: mostEfficiencyScore,
                mostWeightedEfficiencyScore: mostWeightedEfficiencyScore
            };
        }
        return byRecordCount;
    }
    createRankingEntry(metric) {
        return {
            format: metric.format,
            hasOptionalData: metric.hasOptionalData,
            recordCount: metric.recordCount,
            charsPerToken: metric.charsPerToken,
            tokensUsed: metric.totalTokensUsed,
            tokensPerValue: metric.tokensPerValue,
            tokensPerObject: metric.tokensPerObject,
            accuracyPercent: metric.avgAccuracyPercent,
            efficientlyUsedTokens: metric.efficientlyUsedTokens,
            efficiencyScore: metric.efficiencyScore,
            weightedAccuracyPercent: metric.avgWeightedAccuracyPercent,
            weightedEfficientlyUsedTokens: metric.weightedEfficientlyUsedTokens,
            weightedEfficiencyScore: metric.weightedEfficiencyScore
        };
    }
    writeOutput(analytics) {
        const dir = path.dirname(this.outputFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const output = { ...analytics, metrics: analytics.metrics };
        fs.writeFileSync(this.outputFile, JSON.stringify(output));
    }
}
// CLI entry point
if (require.main === module) {
    const args = process.argv.slice(2);
    let outputDir;
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case "--output":
                outputDir = args[++i];
                break;
        }
    }
    if (!outputDir) {
        console.error("Usage: node dist/analytics.js --session-id <id> --output <dir>");
        process.exit(1);
    }
    try {
        // Step 1: Discover agents from session and generate agent_ids.json
        console.log(`\nStep 1: Discovering agents from session...`);
        var agentIds = (0, agent_discovery_1.discoverAgents)();
        // Write agent_ids.json
        const agentIdsFile = path.join(outputDir, 'agent_ids.json');
        fs.writeFileSync(agentIdsFile, JSON.stringify(agentIds, null, 2));
        // Step 2: Run analytics with discovered agent IDs
        console.log(`\nStep 2: Running analytics...`);
        const analytics = new BenchmarkAnalytics(agentIdsFile, outputDir);
        analytics.analyze();
    }
    catch (err) {
        console.error(`Error: ${err}`);
        process.exit(1);
    }
}
exports.default = BenchmarkAnalytics;
