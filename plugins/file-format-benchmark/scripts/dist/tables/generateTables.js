#!/usr/bin/env node
"use strict";
/**
 * TypeScript Table Generation for Benchmark Analytics
 * Generates comprehensive markdown tables from analytics_results.json and validation results
 *
 * Usage: node dist/tables/generateTables.js \
 *   --json-path PATH \
 *   --results-path PATH
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tableLoaders_1 = require("./tableLoaders");
const tableGenerators_1 = require("./tableGenerators");
// ============================================================================
// CLI PARSING
// ============================================================================
function parseArgs(args) {
    let jsonPath = '../benchmark_format_all_variant_all_haiku_off/analytics_results.json';
    let resultsPath = '../benchmark_format_all_variant_all_haiku_off/results';
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--json-path' && args[i + 1]) {
            jsonPath = args[++i];
        }
        else if (args[i] === '--results-path' && args[i + 1]) {
            resultsPath = args[++i];
        }
    }
    return { jsonPath, resultsPath };
}
// ============================================================================
// MAIN
// ============================================================================
async function main() {
    try {
        const { jsonPath, resultsPath } = parseArgs(process.argv.slice(2));
        // Load and aggregate analytics data
        console.log('Loading analytics results...');
        const analyticsData = (0, tableLoaders_1.loadAnalyticsResults)(jsonPath);
        const aggregated = (0, tableLoaders_1.aggregateMetrics)(analyticsData.metrics);
        // Load validation results
        console.log('Loading validation results...');
        const validations = (0, tableLoaders_1.loadValidationResults)(resultsPath);
        // Derive unique values
        const uniqueFormats = [...new Set(aggregated.map(a => a.format))].sort();
        const recordCounts = [...new Set(aggregated.map(a => a.recordCount))].sort((a, b) => b - a);
        console.log(`Loaded ${aggregated.length} aggregated metrics`);
        console.log(`Loaded ${validations.length} validation summaries`);
        console.log(`Found ${uniqueFormats.length} formats: ${uniqueFormats.join(', ')}`);
        console.log(`Found ${recordCounts.length} record counts: ${recordCounts.join(', ')}`);
        console.log('\n');
        // Generate all tables
        (0, tableGenerators_1.generateComprehensiveTable)(aggregated);
        (0, tableGenerators_1.generateReadTokensTable)(aggregated, recordCounts, uniqueFormats);
        (0, tableGenerators_1.generateTotalTokensTable)(aggregated, recordCounts, uniqueFormats);
        (0, tableGenerators_1.generateAccuracyTable)(aggregated, recordCounts, uniqueFormats);
        (0, tableGenerators_1.generateEfficiencyTable)(aggregated, recordCounts, uniqueFormats);
        (0, tableGenerators_1.generateCostOfInaccuracyTable)(aggregated, recordCounts, uniqueFormats);
        (0, tableGenerators_1.generateTokensPerCharTable)(aggregated, recordCounts, uniqueFormats);
        (0, tableGenerators_1.generateRankingsTable)(aggregated, recordCounts);
        (0, tableGenerators_1.generateMandatoryOptionalComparisonTable)(aggregated, recordCounts, uniqueFormats);
        (0, tableGenerators_1.generateCostAnalysisTable)(aggregated, recordCounts, uniqueFormats);
        (0, tableGenerators_1.generateRawVsWeightedDeltaTable)(aggregated, recordCounts, uniqueFormats);
        (0, tableGenerators_1.generateInfoValueTable)(aggregated, recordCounts, uniqueFormats);
        (0, tableGenerators_1.generateSummaryStatisticsTable)(aggregated, recordCounts);
        // Generate new per-topic accuracy tables
        (0, tableGenerators_1.generateCategoryAccuracyByFormatTable)(validations, recordCounts, uniqueFormats);
        (0, tableGenerators_1.generateCategoryMandatoryOptionalDeltaTable)(validations, recordCounts, uniqueFormats);
        (0, tableGenerators_1.generateCategoryDifficultyRankingTable)(validations, recordCounts);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error: ${message}`);
        process.exit(1);
    }
}
main();
