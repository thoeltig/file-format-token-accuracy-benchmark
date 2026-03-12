/**
 * Benchmarking Analytics Script
 * Calculates token efficiency and accuracy metrics from test results
 */

import * as fs from "fs";
import * as path from "path";
import { discoverAgents } from "./analytics/agent-discovery";
import MetricsExtraction from "./analytics/metrics-extraction";
import { GeneratorResult, MergedValidationReport, QuestionCategory, UserMetrics } from "./types";
import ReportValidator from "./validators/reportValidator";
import { DIRECTORY_ANSWERS_VALIDATION, FILE_AGENT_ID, FILE_ANALYTICS_RESULT, FILE_METADATA, FILE_METRICS, QUESTIONS_DISTRIBUTION, QUESTIONS_WEIGHT_DISTRIBUTION } from "./consts";

interface TestMetrics {
  testCase: string;
  format: string;
  variant: string;
  hasOptionalData: boolean;
  recordCount: number;
  totalValues: number;
  characterCount: number;

  // Read-Only extraction script result
  readTokens: number;
  readDurationInMilliseconds: number;
  readTokensPerMillisecond: number;
  
  // Full test extraction script result
  avgOutputTokens: number;
  avgReasoningDurationInMilliseconds: number;
  avgReasoningTokensPerMillisecond: number;

  // Validation script result
  totalQuestions: number;
  avgNoAnswers: number;
  avgIncorrectAnswers: number;
  avgCorrectAnswers: number;
  avgAccuracyPercent: number;
  avgWeightedAccuracyPercent: number;

  // Calculated metrics section

  // This is only interesting to see how the conversion rate from characters to tokens is.
  charsPerToken: number;
  // Information efficiency: tokens needed per data value. Lower is better - represents how densely packed the format is.
  tokensPerValue: number;  
  // Information efficiency: tokens needed per object. Lower is better - accounts for structural overhead.
  tokensPerObject: number; 
  // Reasoning cost per question answered. Indicates how complex the reasoning task is for this format
  avgOutputTokensPerAnswer: number;
  // Represents information density: how much accuracy per token consumed. Higher values indicate more information delivered per token.
  informationValuePerToken: number;
  // Tokens wasted on inaccurate output that increases context pollution. Higher values indicate format reliability risk.
  costOfInaccuracy: number;
  // Reading + reasoning tokens
  totalTokensUsed: number;

  // Results

  // Effective tokens: assumes lower accuracy wastes tokens. Accounts for format quality via accuracy percentage.
  efficientlyUsedTokens: number;
  // Same as above but weighted by question importance: field retrieval and structure awareness questions weighted higher than aggregation and filtering.
  weightedEfficientlyUsedTokens: number;
  // Combined score (0-100): accuracy weighted 70% + token efficiency weighted 30%.
  // Prioritizes correctness over token usage - a format that is accurate is preferred because inaccuracy will lead to multiple reads and more reasoning.
  // normalizedAmountScore: lower token usage = higher score (max tokens used = 0, min tokens used = 100).
  efficiencyScore: number;
  // Same scoring as efficiencyScore but uses weighted accuracy: field retrieval and structure awareness answers count more than aggregation and filtering
  weightedEfficiencyScore: number;
}

interface AnalyticsOutput {
  timestamp: string;
  testConfigurations: {
    metadataFile: string;
    agentIdsFile: string;
    metricsFile: string;
    model: string;
    thinking: string;
    formats: string[];
    variants: string[];
    recordCounts: number[];
    questionDistribution: [QuestionCategory, number][];
    questionWeightDistribution: [QuestionCategory, number][];
  };
  metrics: TestMetrics[];
  rankings: Record<number, Ranking>;
}

interface Ranking { 
  avgCharsPerToken: number; 
  avgTokensPerValue: number; 
  avgTokensPerObject: number; 
  avgAccuracy: number;
  mostTokenEfficient: RankingEntry[];
  leastTokenUsage: RankingEntry[];
  mostAccurate: RankingEntry[];
  mostAccurateWeighted: RankingEntry[];
  mostEfficiencyScore: RankingEntry[];
  mostWeightedEfficiencyScore: RankingEntry[];
}

interface RankingEntry { 
  format: string; 
  hasOptionalData: boolean; 
  recordCount: number; 
  charsPerToken: number; 
  tokensUsed: number; 
  tokensPerValue: number; 
  tokensPerObject: number; 
  accuracyPercent: number; 
  efficientlyUsedTokens: number; 
  efficiencyScore: number;
  weightedAccuracyPercent: number; 
  weightedEfficientlyUsedTokens: number; 
  weightedEfficiencyScore: number;
 }

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

    console.log("Generating insights...");
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
    
    const minMaxRecordCount:Map<number, {min:number, max:number}> = new Map();
    for (const userMetric of userMetrics) {
      const tokens = userMetric.readTokens + userMetric.outputTokens;
      const entry = minMaxRecordCount.get(userMetric.recordCount);
      if(!entry){
        minMaxRecordCount.set(userMetric.recordCount, {min: tokens, max: tokens});
      }else{
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
      const normalizedAmountScore = entry ? this.normalizedAmountScore(entry.min-10, entry.max+10, totalTokensUsed) : 0;
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
        efficiencyScore: parseFloat(((validation.accuracy.accuracyPercent*0.7) + (normalizedAmountScore*0.3)).toFixed(3)),
        weightedEfficiencyScore: parseFloat(((validation.accuracy.weightedAccuracyPercent*0.7) + (normalizedAmountScore*0.3)).toFixed(3)),
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
      rankings,
      metrics
    };
  }
  
  private generateRanking(metrics: TestMetrics[]): Record<number, Ranking> {
    const recordCounts = [...new Set(metrics.map((m) => m.recordCount))].sort((a, b) => b - a);    
    const byRecordCount: Record<number, Ranking> = {};

    const rankingCount = 4;

    for (const recordCount of recordCounts) {
      const formatMetrics = metrics.filter((m) => m.recordCount === recordCount);
      const avgCharsPerToken = Math.round(formatMetrics.reduce((sum, m) => sum + m.charsPerToken, 0) / formatMetrics.length*1000)/1000;
      const avgTokensPerValue = Math.round(formatMetrics.reduce((sum, m) => sum + m.tokensPerValue, 0) / formatMetrics.length*1000)/1000;
      const avgTokensPerObject = Math.round(formatMetrics.reduce((sum, m) => sum + m.tokensPerObject, 0) / formatMetrics.length*1000)/1000;
      const avgAccuracy = Math.round(formatMetrics.reduce((sum, m) => sum + m.avgAccuracyPercent, 0) / formatMetrics.length*1000)/1000;

      const mostTokenEfficient:RankingEntry[] =[];
      const sortedByCharsPerToken = formatMetrics.sort((a, b) => b.charsPerToken - a.charsPerToken);
      
      for (let i = 0; i < sortedByCharsPerToken.length && i < rankingCount; i++) {
        mostTokenEfficient[i] = this.createRankingEntry(sortedByCharsPerToken[i]);
      }

      const leastTokenUsage:RankingEntry[] = [];
      const sortedByTokenUsage = formatMetrics.sort((a, b) => a.totalTokensUsed - b.totalTokensUsed);
      
      for (let i = 0; i < sortedByTokenUsage.length && i < rankingCount; i++) {
        leastTokenUsage[i] = this.createRankingEntry(sortedByTokenUsage[i]);
      }

      const mostAccurate:RankingEntry[] = [];
      const sortedByAccurate = formatMetrics.sort((a, b) => b.avgAccuracyPercent - a.avgAccuracyPercent);
      
      for (let i = 0; i < sortedByAccurate.length && i < rankingCount; i++) {
        mostAccurate[i] = this.createRankingEntry(sortedByAccurate[i]);
      }
      
      const mostWeightedAccuracy:RankingEntry[] = [];
      const sortedByWeightedAccuracyPercent = formatMetrics.sort((a, b) => b.avgWeightedAccuracyPercent - a.avgWeightedAccuracyPercent);
      
      for (let i = 0; i < sortedByWeightedAccuracyPercent.length && i < rankingCount; i++) {
        mostWeightedAccuracy[i] = this.createRankingEntry(sortedByWeightedAccuracyPercent[i]);
      }
      
      const mostEfficiencyScore:RankingEntry[] = [];
      const sortedByEfficiencyScore = formatMetrics.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
      
      for (let i = 0; i < sortedByEfficiencyScore.length && i < rankingCount; i++) {
        mostEfficiencyScore[i] = this.createRankingEntry(sortedByEfficiencyScore[i]);
      }
      
      const mostWeightedEfficiencyScore:RankingEntry[] = [];
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

  private createRankingEntry(metric: TestMetrics): RankingEntry{
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

  private writeOutput(analytics: AnalyticsOutput): void {
    const dir = path.dirname(this.outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const output = { ...analytics, metrics: analytics.metrics };
    fs.writeFileSync(this.outputFile, JSON.stringify(output, null, 4));
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
