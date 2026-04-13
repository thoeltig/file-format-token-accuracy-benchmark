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
const shared_1 = require("./shared");
class BenchmarkAnalytics {
    outputDir;
    validationDir;
    metadataFile;
    outputFile;
    metricsFile;
    agentIdsFile;
    constructor(outputDir) {
        this.outputDir = outputDir;
        this.agentIdsFile = path.join(outputDir, consts_1.FILE_AGENT_ID);
        this.validationDir = path.join(outputDir, consts_1.DIRECTORY_ANSWERS_VALIDATION);
        this.metadataFile = path.join(outputDir, consts_1.FILE_METADATA);
        this.outputFile = path.join(outputDir, consts_1.FILE_ANALYTICS_RESULT);
        this.metricsFile = path.join(outputDir, consts_1.FILE_METRICS);
    }
    analyze() {
        console.log("Extracting metrics from agent transcripts...");
        const userMetrics = this.extractMetrics();
        if (userMetrics.length === 0) {
            return;
        }
        console.log("Validating results...");
        const validationResults = this.validateResults();
        if (validationResults.size === 0) {
            return;
        }
        console.log("Loading metadata...");
        const metadata = this.loadMetadata();
        console.log("Calculating metrics...");
        const testMetrics = this.calculateMetrics(userMetrics, metadata, validationResults);
        if (testMetrics.length === 0) {
            return;
        }
        console.log("Orchestrate analytic file...");
        const analytics = this.generateAnalytics(testMetrics);
        console.log(`Writing results to ${this.outputFile}...`);
        this.writeOutput(analytics);
        console.log("✓ Analytics complete");
        console.log(`\nResults saved to: ${this.outputFile}`);
    }
    extractMetrics() {
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
            const entry = minMaxRecordCount.get(userMetric.recordCount);
            if (!entry) {
                minMaxRecordCount.set(userMetric.recordCount, {
                    minRead: userMetric.readTokens,
                    maxRead: userMetric.readTokens,
                    minOutput: userMetric.outputTokensTotal,
                    maxOutput: userMetric.outputTokensTotal,
                    minTotal: userMetric.totalTokens,
                    maxTotal: userMetric.totalTokens
                });
            }
            else {
                entry.minRead = entry.minRead > userMetric.readTokens ? userMetric.readTokens : entry.minRead;
                entry.maxRead = entry.maxRead < userMetric.readTokens ? userMetric.readTokens : entry.maxRead;
                entry.minOutput = entry.minOutput > userMetric.outputTokensTotal ? userMetric.outputTokensTotal : entry.minOutput;
                entry.maxOutput = entry.maxOutput < userMetric.outputTokensTotal ? userMetric.outputTokensTotal : entry.maxOutput;
                entry.minTotal = entry.minTotal > userMetric.totalTokens ? userMetric.totalTokens : entry.minTotal;
                entry.maxTotal = entry.maxTotal < userMetric.totalTokens ? userMetric.totalTokens : entry.maxTotal;
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
            const accuracy = validation.accuracy.accuracyPercent / 100;
            const weightedAccuracy = validation.accuracy.weightedAccuracyPercent / 100;
            const accuracyByCharPerc = validation.accuracy.charactersOfAnswers.accuracyByCharPerc / 100;
            const weightedAccuracyByCharPerc = validation.accuracy.charactersOfAnswers.weightedAccuracyByCharPerc / 100;
            const accuracyPercPartOfScore = validation.accuracy.accuracyPercent * consts_1.EFFICIENCY_SCORE_WEIGHT.accuracy;
            const weightedAccuracyPercPartOfScore = validation.accuracy.weightedAccuracyPercent * consts_1.EFFICIENCY_SCORE_WEIGHT.accuracy;
            const accuracyByCharPercPartOfScore = validation.accuracy.charactersOfAnswers.accuracyByCharPerc * consts_1.EFFICIENCY_SCORE_WEIGHT.accuracy;
            const weightedAccuracyByCharPercPartOfScore = validation.accuracy.charactersOfAnswers.weightedAccuracyByCharPerc * consts_1.EFFICIENCY_SCORE_WEIGHT.accuracy;
            const normalizedReadTokensScore = entry ? this.normalizedAmountScore(entry.minRead - 10, entry.maxRead + 10, userMetric.readTokens) * consts_1.EFFICIENCY_SCORE_WEIGHT.tokens : 0;
            const normalizedOutputTokensScore = entry ? this.normalizedAmountScore(entry.minOutput - 10, entry.maxOutput + 10, userMetric.outputTokensTotal) * consts_1.EFFICIENCY_SCORE_WEIGHT.tokens : 0;
            const normalizedTotalTokensScore = entry ? this.normalizedAmountScore(entry.minTotal - 10, entry.maxTotal + 10, userMetric.totalTokens) * consts_1.EFFICIENCY_SCORE_WEIGHT.tokens : 0;
            metrics.push({
                testCase: userMetric.testCase,
                format: userMetric.format,
                variant: userMetric.variant,
                hasOptionalData: userMetric.hasOptionalData,
                recordCount: userMetric.recordCount,
                totalValues: datasetInfo.totalValues,
                characterCount: datasetInfo.characterCount,
                readTokens: userMetric.readTokens,
                readDurationInMs: userMetric.readDurationInMs,
                readTokensPerMs: (0, shared_1.roundTo3Digits)(userMetric.readTokens / userMetric.readDurationInMs),
                outputTokensBeforeWrite: userMetric.outputTokensBeforeWrite,
                outputTokensBeforeWriteDriftPercMin: userMetric.outputTokensBeforeWriteDriftPercMin,
                outputTokensBeforeWriteDriftPercMax: userMetric.outputTokensBeforeWriteDriftPercMax,
                outputTokensWrite: userMetric.outputTokensWrite,
                outputTokensWriteDriftPercMin: userMetric.outputTokensWriteDriftPercMin,
                outputTokensWriteDriftPercMax: userMetric.outputTokensWriteDriftPercMax,
                outputTokensTotal: userMetric.outputTokensTotal,
                outputTokensTotalDriftPercMin: userMetric.outputTokensTotalDriftPercMin,
                outputTokensTotalDriftPercMax: userMetric.outputTokensTotalDriftPercMax,
                outputDurationBeforeWriteInMs: userMetric.outputDurationBeforeWriteInMs,
                outputDurationBeforeWriteDriftPercMin: userMetric.outputDurationBeforeWriteDriftPercMin,
                outputDurationBeforeWriteDriftPercMax: userMetric.outputDurationBeforeWriteDriftPercMax,
                outputDurationWriteInMs: userMetric.outputDurationWriteInMs,
                outputDurationWriteDriftPercMin: userMetric.outputDurationWriteDriftPercMin,
                outputDurationWriteDriftPercMax: userMetric.outputDurationWriteDriftPercMax,
                outputDurationTotalInMs: userMetric.outputDurationTotalInMs,
                outputDurationTotalDriftPercMin: userMetric.outputDurationTotalDriftPercMin,
                outputDurationTotalDriftPercMax: userMetric.outputDurationTotalDriftPercMax,
                outputTokensBeforeWritePerMs: (0, shared_1.roundTo3Digits)(userMetric.outputTokensBeforeWrite / userMetric.outputDurationBeforeWriteInMs),
                outputTokensWritePerMs: (0, shared_1.roundTo3Digits)(userMetric.outputTokensWrite / userMetric.outputDurationWriteInMs),
                outputTokensTotalPerMs: (0, shared_1.roundTo3Digits)(userMetric.outputTokensTotal / userMetric.outputDurationTotalInMs),
                totalQuestions: validation.totalQuestions,
                noAnswers: validation.totalQuestions - validation.accuracy.correct - validation.accuracy.incorrect,
                incorrectAnswers: validation.accuracy.incorrect,
                correctAnswers: validation.accuracy.correct,
                accuracyPercent: validation.accuracy.accuracyPercent,
                accuracyDriftPercentMin: validation.accuracy.accuracyDriftPercMin,
                accuracyDriftPercentMax: validation.accuracy.accuracyDriftPercMax,
                weightedAccuracyPercent: validation.accuracy.weightedAccuracyPercent,
                weightedAccuracyDriftPercentMax: validation.accuracy.weightedAccuracyDriftPercMin,
                weightedAccuracyDriftPercentMin: validation.accuracy.weightedAccuracyDriftPercMax,
                charsPerReadToken: (0, shared_1.roundTo3Digits)(datasetInfo.characterCount / userMetric.readTokens),
                readTokensPerValue: (0, shared_1.roundTo3Digits)(userMetric.readTokens / datasetInfo.totalValues),
                readTokensPerObject: (0, shared_1.roundTo3Digits)(userMetric.readTokens / datasetInfo.recordCount),
                outputTokensWritePerAnswer: (0, shared_1.roundTo3Digits)(userMetric.outputTokensWrite / validation.totalQuestions),
                informationValuePerReadTokens: (0, shared_1.roundTo3Digits)((validation.accuracy.accuracyPercent / userMetric.readTokens) * 100),
                informationValuePerOutputTokens: (0, shared_1.roundTo3Digits)((validation.accuracy.accuracyPercent / userMetric.outputTokensTotal) * 100),
                informationValuePerTotalTokens: (0, shared_1.roundTo3Digits)((validation.accuracy.accuracyPercent / userMetric.totalTokens) * 100),
                totalTokens: userMetric.totalTokens,
                totalTokensDriftPercMin: userMetric.totalTokensDriftPercMin,
                totalTokensDriftPercMax: userMetric.totalTokensDriftPercMax,
                wastedReadTokens: (0, shared_1.roundTo3Digits)(userMetric.readTokens * (1 - accuracy)),
                wastedOutputTokens: (0, shared_1.roundTo3Digits)(userMetric.outputTokensTotal * (1 - accuracy)),
                wastedTotalTokens: (0, shared_1.roundTo3Digits)(userMetric.totalTokens * (1 - accuracy)),
                usefulReadTokens: (0, shared_1.roundTo3Digits)(userMetric.readTokens * accuracy),
                usefulOutputTokens: (0, shared_1.roundTo3Digits)(userMetric.outputTokensTotal * accuracy),
                usefulTotalTokens: (0, shared_1.roundTo3Digits)(userMetric.totalTokens * accuracy),
                weightedWastedReadTokens: (0, shared_1.roundTo3Digits)(userMetric.readTokens * (1 - weightedAccuracy)),
                weightedWastedOutputTokens: (0, shared_1.roundTo3Digits)(userMetric.outputTokensTotal * (1 - weightedAccuracy)),
                weightedWastedTotalTokens: (0, shared_1.roundTo3Digits)(userMetric.totalTokens * (1 - weightedAccuracy)),
                weightedUsefulReadTokens: (0, shared_1.roundTo3Digits)(userMetric.readTokens * weightedAccuracy),
                weightedUsefulOutputTokens: (0, shared_1.roundTo3Digits)(userMetric.outputTokensTotal * weightedAccuracy),
                weightedUsefulTotalTokens: (0, shared_1.roundTo3Digits)(userMetric.totalTokens * weightedAccuracy),
                efficiencyScoreRead: (0, shared_1.roundTo3Digits)(accuracyPercPartOfScore + normalizedReadTokensScore),
                efficiencyScoreOutput: (0, shared_1.roundTo3Digits)(accuracyPercPartOfScore + normalizedOutputTokensScore),
                efficiencyScoreTotal: (0, shared_1.roundTo3Digits)(accuracyPercPartOfScore + normalizedTotalTokensScore),
                weightedEfficiencyScoreRead: (0, shared_1.roundTo3Digits)(weightedAccuracyPercPartOfScore + normalizedReadTokensScore),
                weightedEfficiencyScoreOutput: (0, shared_1.roundTo3Digits)(weightedAccuracyPercPartOfScore + normalizedOutputTokensScore),
                weightedEfficiencyScoreTotal: (0, shared_1.roundTo3Digits)(weightedAccuracyPercPartOfScore + normalizedTotalTokensScore),
                expectedChars: validation.accuracy.charactersOfAnswers.expected,
                correctChars: validation.accuracy.charactersOfAnswers.correct,
                incorrectChars: validation.accuracy.charactersOfAnswers.incorrect,
                totalChars: validation.accuracy.charactersOfAnswers.total,
                accuracyByCharPerc: validation.accuracy.charactersOfAnswers.accuracyByCharPerc,
                accuracyByCharPercDriftMin: validation.accuracy.charactersOfAnswers.accuracyByCharPercDriftMin,
                accuracyByCharPercDriftMax: validation.accuracy.charactersOfAnswers.accuracyByCharPercDriftMax,
                weightedAccuracyByCharPerc: validation.accuracy.charactersOfAnswers.weightedAccuracyByCharPerc,
                weightedAccuracyByCharPercDriftMax: validation.accuracy.charactersOfAnswers.weightedAccuracyByCharPercDriftMin,
                weightedAccuracyByCharPercDriftMin: validation.accuracy.charactersOfAnswers.weightedAccuracyByCharPercDriftMax,
                informationValuePerReadTokensAccuracyByCharPerc: (0, shared_1.roundTo3Digits)((validation.accuracy.charactersOfAnswers.accuracyByCharPerc / userMetric.readTokens) * 100),
                informationValuePerOutputTokensAccuracyByCharPerc: (0, shared_1.roundTo3Digits)((validation.accuracy.charactersOfAnswers.accuracyByCharPerc / userMetric.outputTokensTotal) * 100),
                informationValuePerTotalTokensAccuracyByCharPerc: (0, shared_1.roundTo3Digits)((validation.accuracy.charactersOfAnswers.accuracyByCharPerc / userMetric.totalTokens) * 100),
                wastedReadTokensAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(userMetric.readTokens * (1 - accuracyByCharPerc)),
                wastedOutputTokensAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(userMetric.outputTokensTotal * (1 - accuracyByCharPerc)),
                wastedTotalTokensAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(userMetric.totalTokens * (1 - accuracyByCharPerc)),
                usefulReadTokensAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(userMetric.readTokens * accuracyByCharPerc),
                usefulOutputTokensAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(userMetric.outputTokensTotal * accuracyByCharPerc),
                usefulTotalTokensAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(userMetric.totalTokens * accuracyByCharPerc),
                weightedWastedReadTokensAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(userMetric.readTokens * (1 - weightedAccuracyByCharPerc)),
                weightedWastedOutputTokensAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(userMetric.outputTokensTotal * (1 - weightedAccuracyByCharPerc)),
                weightedWastedTotalTokensAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(userMetric.totalTokens * (1 - weightedAccuracyByCharPerc)),
                weightedUsefulReadTokensAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(userMetric.readTokens * weightedAccuracyByCharPerc),
                weightedUsefulOutputTokensAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(userMetric.outputTokensTotal * weightedAccuracyByCharPerc),
                weightedUsefulTotalTokensAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(userMetric.totalTokens * weightedAccuracyByCharPerc),
                efficiencyScoreReadAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(accuracyByCharPercPartOfScore + normalizedReadTokensScore),
                efficiencyScoreOutputAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(accuracyByCharPercPartOfScore + normalizedOutputTokensScore),
                efficiencyScoreTotalAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(accuracyByCharPercPartOfScore + normalizedTotalTokensScore),
                weightedEfficiencyScoreReadAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(weightedAccuracyByCharPercPartOfScore + normalizedReadTokensScore),
                weightedEfficiencyScoreOutputAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(weightedAccuracyByCharPercPartOfScore + normalizedOutputTokensScore),
                weightedEfficiencyScoreTotalAccuracyByCharPerc: (0, shared_1.roundTo3Digits)(weightedAccuracyByCharPercPartOfScore + normalizedTotalTokensScore),
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
                structure: "Entered by user",
                formats,
                variants,
                recordCounts,
                efficiencyScoreWeight: [
                    ["accuracy", consts_1.EFFICIENCY_SCORE_WEIGHT.accuracy],
                    ["tokens", consts_1.EFFICIENCY_SCORE_WEIGHT.tokens],
                ],
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
            metrics
        };
    }
    writeOutput(analytics) {
        const dir = path.dirname(this.outputFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const output = { ...analytics, metrics: analytics.metrics };
        fs.writeFileSync(this.outputFile, JSON.stringify(output, null, 2));
    }
}
// CLI entry point
if (require.main === module) {
    const args = process.argv.slice(2);
    let sessionId;
    let outputDir;
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case "--session-id":
                sessionId = args[++i];
                break;
            case "--output":
                outputDir = args[++i];
                break;
        }
    }
    if (!outputDir) {
        console.error("Usage: node dist/analytics.js --session-id <id> --output <dir>");
        process.exit(1);
    }
    const needToLoadMetrics = fs.existsSync(path.join(outputDir, consts_1.FILE_METRICS)) === false;
    if (needToLoadMetrics && !sessionId) {
        console.error("Usage: node dist/analytics.js --session-id <id> --output <dir>");
        process.exit(1);
    }
    try {
        if (needToLoadMetrics && sessionId) {
            // Step 1: Discover agents from session and generate agent_ids.json if not already done
            console.log(`\nStep 1: Discovering agents from session ${sessionId}...`);
            var agentIds = (0, agent_discovery_1.discoverAgents)(sessionId);
            // Write agent_ids.json
            const agentIdsFile = path.join(outputDir, consts_1.FILE_AGENT_ID);
            fs.writeFileSync(agentIdsFile, JSON.stringify(agentIds, null, 2));
        }
        else {
            console.log(`\nStep 1: Skip agent id extraction, metrics file already exists...`);
        }
        // Step 2: Run analytics with discovered agent IDs
        console.log(`\nStep 2: Running analytics...`);
        const analytics = new BenchmarkAnalytics(outputDir);
        analytics.analyze();
    }
    catch (err) {
        console.error(`Error: ${err}`);
        process.exit(1);
    }
}
exports.default = BenchmarkAnalytics;
