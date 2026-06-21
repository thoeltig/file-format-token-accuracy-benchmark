/**
 * Benchmarking Analytics Script
 * Calculates token efficiency and accuracy metrics from test results
 */

import * as fs from "fs";
import * as path from "path";
import { discoverAgents } from "./analytics/agent-discovery";
import MetricsExtraction from "./analytics/metrics-extraction";
import { AnalyticsOutput, GeneratorResult, MergedValidationReport, TestMetrics, UserMetrics } from "./types";
import ReportValidator from "./validators/reportValidator";
import { DIRECTORY_ANSWERS_VALIDATION, EFFICIENCY_SCORE_WEIGHT, FILE_AGENT_ID, FILE_ANALYTICS_RESULT, FILE_METADATA, FILE_METRICS, QUESTIONS_DISTRIBUTION, QUESTIONS_WEIGHT_DISTRIBUTION } from "./consts";
import { roundTo3Digits } from "./shared";

class BenchmarkAnalytics {
  private outputDir: string;
  private validationDir: string;
  private metadataFile: string;
  private outputFile: string;
  private metricsFile: string;
  private agentIdsFile: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
    this.agentIdsFile = path.join(outputDir, FILE_AGENT_ID);
    this.validationDir = path.join(outputDir, DIRECTORY_ANSWERS_VALIDATION);
    this.metadataFile = path.join(outputDir, FILE_METADATA);
    this.outputFile = path.join(outputDir, FILE_ANALYTICS_RESULT);
    this.metricsFile = path.join(outputDir, FILE_METRICS);
  }

  public analyze(): void {
    console.log("Extracting metrics from agent transcripts...");
    const userMetrics = this.extractMetrics();
    if(userMetrics.length === 0){
      return;
    }

    console.log("Validating results...");
    const validationResults = this.validateResults();
    if(validationResults.size === 0){
      return;
    }

    console.log("Loading metadata...");
    const metadata = this.loadMetadata();

    console.log("Calculating metrics...");
    const testMetrics = this.calculateMetrics(userMetrics, metadata, validationResults);
    if(testMetrics.length === 0){
      return;
    }

    console.log("Orchestrate analytic file...");
    const analytics = this.generateAnalytics(testMetrics);

    console.log(`Writing results to ${this.outputFile}...`);
    this.writeOutput(analytics);

    console.log("✓ Analytics complete");
    console.log(`\nResults saved to: ${this.outputFile}`);
  }

  private extractMetrics(): UserMetrics[] {
    try {
      const extraction = new MetricsExtraction(this.agentIdsFile, this.metricsFile);
      return extraction.extract();
    } catch (err) {
      throw new Error(`Metrics extraction failed: ${err}`);
    }
  }

  private loadMetadata(): GeneratorResult {
    const content = fs.readFileSync(this.metadataFile, "utf-8");
    return JSON.parse(content) as GeneratorResult;
  }

  private validateResults(): Map<string, MergedValidationReport> {    
    const results = new Map<string, MergedValidationReport>();

    if (!fs.existsSync(this.validationDir)) {
      console.warn(`Validation directory not found: ${this.validationDir}`);
      return results;
    }

    try {
      const validator = new ReportValidator(this.outputDir);
      var reports = validator.validate();
      reports.forEach(x => {
        const key = this.getLookupKey(x.format, x.structure, x.recordCount, x.variant === 'optional');
        results.set(key, x);
      });
    } catch (err) {
      throw new Error(`Validation failed: ${err}`);
    }

    return results;
  }

  private calculateMetrics(
    userMetrics: UserMetrics[],
    metadata: GeneratorResult,
    validationResults: Map<string, MergedValidationReport>
  ): TestMetrics[] {
    const metrics: TestMetrics[] = [];

    // Build lookup map from metadata
    const datasetMap = new Map<string, any>();
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
    
    const minMaxRecordCount:Map<number, {minRead:number, maxRead:number, minOutput:number, maxOutput:number, minTotal:number, maxTotal:number}> = new Map();
    for (const userMetric of userMetrics) {
      const entry = minMaxRecordCount.get(userMetric.recordCount);
      if(!entry){
        minMaxRecordCount.set(userMetric.recordCount, {
          minRead: userMetric.readTokens,
          maxRead: userMetric.readTokens,
          minOutput: userMetric.outputTokensTotal,
          maxOutput: userMetric.outputTokensTotal,
          minTotal: userMetric.totalTokens,
          maxTotal: userMetric.totalTokens
        });
      }else{
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
      
      const accuracyPercPartOfScore = validation.accuracy.accuracyPercent * EFFICIENCY_SCORE_WEIGHT.accuracy;
      const weightedAccuracyPercPartOfScore = validation.accuracy.weightedAccuracyPercent * EFFICIENCY_SCORE_WEIGHT.accuracy;
      const accuracyByCharPercPartOfScore = validation.accuracy.charactersOfAnswers.accuracyByCharPerc * EFFICIENCY_SCORE_WEIGHT.accuracy;
      const weightedAccuracyByCharPercPartOfScore = validation.accuracy.charactersOfAnswers.weightedAccuracyByCharPerc * EFFICIENCY_SCORE_WEIGHT.accuracy;

      const normalizedReadTokensScore = entry ? this.normalizedAmountScore(entry.minRead-10, entry.maxRead+10, userMetric.readTokens) * EFFICIENCY_SCORE_WEIGHT.tokens : 0;
      const normalizedOutputTokensScore = entry ? this.normalizedAmountScore(entry.minOutput-10, entry.maxOutput+10, userMetric.outputTokensTotal) * EFFICIENCY_SCORE_WEIGHT.tokens : 0;
      const normalizedTotalTokensScore = entry ? this.normalizedAmountScore(entry.minTotal-10, entry.maxTotal+10, userMetric.totalTokens) * EFFICIENCY_SCORE_WEIGHT.tokens : 0;
      
      metrics.push({
        testCase: userMetric.testCase,
        format: userMetric.format,
        variant: userMetric.variant,
        fullTestRuns: userMetric.testRuns,
        hasOptionalData: userMetric.hasOptionalData,
        recordCount: userMetric.recordCount,
        totalValues: datasetInfo.totalValues,
        characterCount: datasetInfo.characterCount,

        readTokens: userMetric.readTokens,
        readDurationInMs: userMetric.readDurationInMs,
        readTokensPerMs: roundTo3Digits(userMetric.readTokens / userMetric.readDurationInMs),

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
        
        outputTokensBeforeWritePerMs: roundTo3Digits(userMetric.outputTokensBeforeWrite / userMetric.outputDurationBeforeWriteInMs),
        outputTokensWritePerMs: roundTo3Digits(userMetric.outputTokensWrite / userMetric.outputDurationWriteInMs),
        outputTokensTotalPerMs: roundTo3Digits(userMetric.outputTokensTotal / userMetric.outputDurationTotalInMs),

        totalQuestions: validation.totalQuestions,
        noAnswers: validation.totalQuestions - validation.accuracy.correct - validation.accuracy.incorrect,
        incorrectAnswers: validation.accuracy.incorrect,
        correctAnswers: validation.accuracy.correct,
        accuracyPercent: validation.accuracy.accuracyPercent,
        accuracyDriftPercentMin: validation.accuracy.accuracyDriftPercMin,
        accuracyDriftPercentMax: validation.accuracy.accuracyDriftPercMax,
        weightedAccuracyPercent: validation.accuracy.weightedAccuracyPercent,
        weightedAccuracyDriftPercentMax: validation.accuracy.weightedAccuracyDriftPercMax,
        weightedAccuracyDriftPercentMin: validation.accuracy.weightedAccuracyDriftPercMin,

        charsPerReadToken: roundTo3Digits(datasetInfo.characterCount / userMetric.readTokens),
        readTokensPerValue: roundTo3Digits(userMetric.readTokens / datasetInfo.totalValues),
        readTokensPerObject: roundTo3Digits(userMetric.readTokens / datasetInfo.recordCount),
        outputTokensWritePerAnswer: roundTo3Digits(userMetric.outputTokensWrite / validation.totalQuestions),
        informationValuePerReadTokens: roundTo3Digits((validation.accuracy.accuracyPercent / userMetric.readTokens) * 100),
        informationValuePerOutputTokens: roundTo3Digits((validation.accuracy.accuracyPercent / userMetric.outputTokensTotal) * 100),
        informationValuePerTotalTokens: roundTo3Digits((validation.accuracy.accuracyPercent / userMetric.totalTokens) * 100),
        
        totalTokens: userMetric.totalTokens,
        totalTokensDriftPercMin: userMetric.totalTokensDriftPercMin,
        totalTokensDriftPercMax: userMetric.totalTokensDriftPercMax,

        wastedReadTokens: roundTo3Digits(userMetric.readTokens * (1 - accuracy)),
        wastedOutputTokens: roundTo3Digits(userMetric.outputTokensTotal * (1 - accuracy)),
        wastedTotalTokens: roundTo3Digits(userMetric.totalTokens * (1 - accuracy)),
        usefulReadTokens: roundTo3Digits(userMetric.readTokens * accuracy),
        usefulOutputTokens: roundTo3Digits(userMetric.outputTokensTotal * accuracy),
        usefulTotalTokens: roundTo3Digits(userMetric.totalTokens * accuracy),
        
        weightedWastedReadTokens: roundTo3Digits(userMetric.readTokens * (1 - weightedAccuracy)),
        weightedWastedOutputTokens: roundTo3Digits(userMetric.outputTokensTotal * (1 - weightedAccuracy)),
        weightedWastedTotalTokens: roundTo3Digits(userMetric.totalTokens * (1 - weightedAccuracy)),
        weightedUsefulReadTokens: roundTo3Digits(userMetric.readTokens * weightedAccuracy),
        weightedUsefulOutputTokens: roundTo3Digits(userMetric.outputTokensTotal * weightedAccuracy),
        weightedUsefulTotalTokens: roundTo3Digits(userMetric.totalTokens * weightedAccuracy),
        
        efficiencyScoreRead: roundTo3Digits(accuracyPercPartOfScore + normalizedReadTokensScore),
        efficiencyScoreOutput: roundTo3Digits(accuracyPercPartOfScore + normalizedOutputTokensScore),
        efficiencyScoreTotal: roundTo3Digits(accuracyPercPartOfScore + normalizedTotalTokensScore),
        weightedEfficiencyScoreRead: roundTo3Digits(weightedAccuracyPercPartOfScore + normalizedReadTokensScore),
        weightedEfficiencyScoreOutput: roundTo3Digits(weightedAccuracyPercPartOfScore + normalizedOutputTokensScore),
        weightedEfficiencyScoreTotal: roundTo3Digits(weightedAccuracyPercPartOfScore + normalizedTotalTokensScore),
        
        expectedChars: validation.accuracy.charactersOfAnswers.expected,
        correctChars: validation.accuracy.charactersOfAnswers.correct,
        incorrectChars: validation.accuracy.charactersOfAnswers.incorrect,
        totalChars: validation.accuracy.charactersOfAnswers.total,

        accuracyByCharPerc: validation.accuracy.charactersOfAnswers.accuracyByCharPerc,
        accuracyByCharPercDriftMin: validation.accuracy.charactersOfAnswers.accuracyByCharPercDriftMin,
        accuracyByCharPercDriftMax: validation.accuracy.charactersOfAnswers.accuracyByCharPercDriftMax,
        weightedAccuracyByCharPerc: validation.accuracy.charactersOfAnswers.weightedAccuracyByCharPerc,
        weightedAccuracyByCharPercDriftMax: validation.accuracy.charactersOfAnswers.weightedAccuracyByCharPercDriftMax,
        weightedAccuracyByCharPercDriftMin: validation.accuracy.charactersOfAnswers.weightedAccuracyByCharPercDriftMin,
        
        informationValuePerReadTokensAccuracyByCharPerc: roundTo3Digits((validation.accuracy.charactersOfAnswers.accuracyByCharPerc / userMetric.readTokens) * 100),
        informationValuePerOutputTokensAccuracyByCharPerc: roundTo3Digits((validation.accuracy.charactersOfAnswers.accuracyByCharPerc / userMetric.outputTokensTotal) * 100),
        informationValuePerTotalTokensAccuracyByCharPerc: roundTo3Digits((validation.accuracy.charactersOfAnswers.accuracyByCharPerc / userMetric.totalTokens) * 100),
        
        wastedReadTokensAccuracyByCharPerc: roundTo3Digits(userMetric.readTokens * (1 - accuracyByCharPerc)),
        wastedOutputTokensAccuracyByCharPerc: roundTo3Digits(userMetric.outputTokensTotal * (1 - accuracyByCharPerc)),
        wastedTotalTokensAccuracyByCharPerc: roundTo3Digits(userMetric.totalTokens * (1 - accuracyByCharPerc)),
        usefulReadTokensAccuracyByCharPerc: roundTo3Digits(userMetric.readTokens * accuracyByCharPerc),
        usefulOutputTokensAccuracyByCharPerc: roundTo3Digits(userMetric.outputTokensTotal * accuracyByCharPerc),
        usefulTotalTokensAccuracyByCharPerc: roundTo3Digits(userMetric.totalTokens * accuracyByCharPerc),
        
        weightedWastedReadTokensAccuracyByCharPerc: roundTo3Digits(userMetric.readTokens * (1 - weightedAccuracyByCharPerc)),
        weightedWastedOutputTokensAccuracyByCharPerc: roundTo3Digits(userMetric.outputTokensTotal * (1 - weightedAccuracyByCharPerc)),
        weightedWastedTotalTokensAccuracyByCharPerc: roundTo3Digits(userMetric.totalTokens * (1 - weightedAccuracyByCharPerc)),
        weightedUsefulReadTokensAccuracyByCharPerc: roundTo3Digits(userMetric.readTokens * weightedAccuracyByCharPerc),
        weightedUsefulOutputTokensAccuracyByCharPerc: roundTo3Digits(userMetric.outputTokensTotal * weightedAccuracyByCharPerc),
        weightedUsefulTotalTokensAccuracyByCharPerc: roundTo3Digits(userMetric.totalTokens * weightedAccuracyByCharPerc),
        
        efficiencyScoreReadAccuracyByCharPerc: roundTo3Digits(accuracyByCharPercPartOfScore + normalizedReadTokensScore),
        efficiencyScoreOutputAccuracyByCharPerc: roundTo3Digits(accuracyByCharPercPartOfScore + normalizedOutputTokensScore),
        efficiencyScoreTotalAccuracyByCharPerc: roundTo3Digits(accuracyByCharPercPartOfScore + normalizedTotalTokensScore),
        weightedEfficiencyScoreReadAccuracyByCharPerc: roundTo3Digits(weightedAccuracyByCharPercPartOfScore + normalizedReadTokensScore),
        weightedEfficiencyScoreOutputAccuracyByCharPerc: roundTo3Digits(weightedAccuracyByCharPercPartOfScore + normalizedOutputTokensScore),
        weightedEfficiencyScoreTotalAccuracyByCharPerc: roundTo3Digits(weightedAccuracyByCharPercPartOfScore + normalizedTotalTokensScore),
      });
    }

    return metrics;
  }

  private getLookupKey(format: string, structure: string, recordCount: number, hasOptionalData: boolean): string {
    return `${format}_${structure}_${recordCount}_${hasOptionalData ? 'optional' : 'mandatory'}`;
  }

  private normalizedAmountScore(min: number, max: number, value: number): number{
    return ((max-value)/(max-min))*100;
  }

  private generateAnalytics(metrics: TestMetrics[]): AnalyticsOutput {
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
          ["accuracy",EFFICIENCY_SCORE_WEIGHT.accuracy],
          ["tokens",EFFICIENCY_SCORE_WEIGHT.tokens],
        ],
        questionDistribution: [
          ["field_retrieval", QUESTIONS_DISTRIBUTION["field_retrieval"]],
          ["filtering", QUESTIONS_DISTRIBUTION["filtering"]],
          ["aggregation", QUESTIONS_DISTRIBUTION["aggregation"]],
          ["structure_awareness", QUESTIONS_DISTRIBUTION["structure_awareness"]]
        ],
        questionWeightDistribution: [
          ["field_retrieval", QUESTIONS_WEIGHT_DISTRIBUTION["field_retrieval"]],
          ["filtering", QUESTIONS_WEIGHT_DISTRIBUTION["filtering"]],
          ["aggregation", QUESTIONS_WEIGHT_DISTRIBUTION["aggregation"]],
          ["structure_awareness", QUESTIONS_WEIGHT_DISTRIBUTION["structure_awareness"]]
        ],
      },
      metrics
    };
  }
  
  private writeOutput(analytics: AnalyticsOutput): void {
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
  let sessionId: string | undefined;
  let outputDir: string | undefined;

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
  
  const needToLoadMetrics = fs.existsSync(path.join(outputDir, FILE_METRICS)) === false;
  if (needToLoadMetrics && !sessionId) {
    console.error("Usage: node dist/analytics.js --session-id <id> --output <dir>");
    process.exit(1);
  }

  try {
    if(needToLoadMetrics && sessionId){
      // Step 1: Discover agents from session and generate agent_ids.json if not already done
      console.log(`\nStep 1: Discovering agents from session ${sessionId}...`);
      var agentIds = discoverAgents(sessionId);
      
      // Write agent_ids.json
      const agentIdsFile = path.join(outputDir, FILE_AGENT_ID);
      fs.writeFileSync(agentIdsFile, JSON.stringify(agentIds, null, 2));
    }
    else{      
      console.log(`\nStep 1: Skip agent id extraction, metrics file already exists...`);
    }

    // Step 2: Run analytics with discovered agent IDs
    console.log(`\nStep 2: Running analytics...`);
    const analytics = new BenchmarkAnalytics(outputDir);
    analytics.analyze();
  } catch (err) {
    console.error(`Error: ${err}`);
    process.exit(1);
  }
}

export default BenchmarkAnalytics;
