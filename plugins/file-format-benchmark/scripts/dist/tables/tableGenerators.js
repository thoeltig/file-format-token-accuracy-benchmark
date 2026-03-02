"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCategoryDifficultyRankingTable = exports.generateCategoryMandatoryOptionalDeltaTable = exports.generateCategoryAccuracyByFormatTable = exports.generateSummaryStatisticsTable = exports.generateInfoValueTable = exports.generateRawVsWeightedDeltaTable = exports.generateCostAnalysisTable = exports.generateMandatoryOptionalComparisonTable = exports.generateRankingsTable = exports.generateTokensPerCharTable = exports.generateCostOfInaccuracyTable = exports.generateEfficiencyTable = exports.generateAccuracyTable = exports.generateTotalTokensTable = exports.generateReadTokensTable = exports.generateComprehensiveTable = void 0;
// ============================================================================
// EXISTING TABLES (1:1 port from JS)
// ============================================================================
function generateComprehensiveTable(aggregated) {
    console.log('\n=== COMPREHENSIVE BENCHMARK METRICS TABLE ===\n');
    console.log('| Format | Records | Variant | Read Tokens | Reasoning | Total | Tokens/Char | Raw Acc | Wtd Acc | Info/Token | Cost Inaccuracy | Efficiency | Wtd Efficiency |');
    console.log('|--------|---------|---------|-------------|-----------|-------|-------------|---------|---------|------------|-----------------|------------|-----------------|');
    aggregated.forEach(item => {
        const fmt = item.format.toUpperCase();
        const rec = item.recordCount;
        const var_ = item.variant.substring(0, 3);
        console.log(`| ${fmt} | ${rec} | ${var_} | ${Math.round(item.readTokens)} | ${Math.round(item.avgEstimatedReasoningTokens)} | ${Math.round(item.totalTokensUsed)} | ${item.charsPerToken.toFixed(2)} | ${item.avgAccuracyPercent.toFixed(1)}% | ${item.avgWeightedAccuracyPercent.toFixed(1)}% | ${item.informationValuePerToken.toFixed(3)} | ${Math.round(item.costOfInaccuracy)} | ${item.efficiencyScore.toFixed(1)} | ${item.weightedEfficiencyScore.toFixed(1)} |`);
    });
}
exports.generateComprehensiveTable = generateComprehensiveTable;
function generateReadTokensTable(aggregated, recordCounts, uniqueFormats) {
    console.log('\n\n=== READ TOKENS ===\n');
    recordCounts.forEach(recCount => {
        console.log(`**${recCount}-Record Variants:**\n| Format | Mandatory | Optional |`);
        console.log('|--------|-----------|----------|');
        uniqueFormats.forEach(fmt => {
            const mand = aggregated.find(a => a.format === fmt && a.variant === 'mandatory' && a.recordCount === recCount);
            const opt = aggregated.find(a => a.format === fmt && a.variant === 'optional' && a.recordCount === recCount);
            if (mand && opt) {
                console.log(`| ${fmt.toUpperCase()} | ${Math.round(mand.readTokens)} | ${Math.round(opt.readTokens)} |`);
            }
        });
        console.log();
    });
}
exports.generateReadTokensTable = generateReadTokensTable;
function generateTotalTokensTable(aggregated, recordCounts, uniqueFormats) {
    console.log('\n\n=== TOTAL TOKENS (Read + Reasoning) ===\n');
    recordCounts.forEach(recCount => {
        console.log(`**${recCount}-Record Variants:**\n| Format | Mandatory | Optional |`);
        console.log('|--------|-----------|----------|');
        uniqueFormats.forEach(fmt => {
            const mand = aggregated.find(a => a.format === fmt && a.variant === 'mandatory' && a.recordCount === recCount);
            const opt = aggregated.find(a => a.format === fmt && a.variant === 'optional' && a.recordCount === recCount);
            if (mand && opt) {
                console.log(`| ${fmt.toUpperCase()} | ${Math.round(mand.totalTokensUsed)} | ${Math.round(opt.totalTokensUsed)} |`);
            }
        });
        console.log();
    });
}
exports.generateTotalTokensTable = generateTotalTokensTable;
function generateAccuracyTable(aggregated, recordCounts, uniqueFormats) {
    console.log('\n\n=== ACCURACY (Raw vs Weighted) ===\n');
    recordCounts.forEach(recCount => {
        console.log(`**${recCount}-Record Variants:**\n| Format | Raw Mand | Raw Opt | Wtd Mand | Wtd Opt | Delta (Raw) | Delta (Wtd) |`);
        console.log('|--------|----------|--------|----------|--------|-------------|-------------|');
        uniqueFormats.forEach(fmt => {
            const mand = aggregated.find(a => a.format === fmt && a.variant === 'mandatory' && a.recordCount === recCount);
            const opt = aggregated.find(a => a.format === fmt && a.variant === 'optional' && a.recordCount === recCount);
            if (mand && opt) {
                const rawDelta = (opt.avgAccuracyPercent - mand.avgAccuracyPercent).toFixed(1);
                const wtdDelta = (opt.avgWeightedAccuracyPercent - mand.avgWeightedAccuracyPercent).toFixed(1);
                console.log(`| ${fmt.toUpperCase()} | ${mand.avgAccuracyPercent.toFixed(1)}% | ${opt.avgAccuracyPercent.toFixed(1)}% | ${mand.avgWeightedAccuracyPercent.toFixed(1)}% | ${opt.avgWeightedAccuracyPercent.toFixed(1)}% | ${rawDelta} | ${wtdDelta} |`);
            }
        });
        console.log();
    });
}
exports.generateAccuracyTable = generateAccuracyTable;
function generateEfficiencyTable(aggregated, recordCounts, uniqueFormats) {
    console.log('\n\n=== EFFICIENCY METRICS ===\n');
    recordCounts.forEach(recCount => {
        console.log(`**${recCount}-Record Variants:**\n| Format | Info/Token Mand | Info/Token Opt | Variant Impact | Efficiency Mand | Efficiency Opt | Wtd Eff Mand | Wtd Eff Opt |`);
        console.log('|--------|-----------------|----------------|-----------------|-----------------|----------------|--------------|-------------|');
        uniqueFormats.forEach(fmt => {
            const mand = aggregated.find(a => a.format === fmt && a.variant === 'mandatory' && a.recordCount === recCount);
            const opt = aggregated.find(a => a.format === fmt && a.variant === 'optional' && a.recordCount === recCount);
            if (mand && opt) {
                const impact = ((opt.informationValuePerToken / mand.informationValuePerToken - 1) * 100).toFixed(1);
                console.log(`| ${fmt.toUpperCase()} | ${mand.informationValuePerToken.toFixed(3)} | ${opt.informationValuePerToken.toFixed(3)} | ${impact}% | ${mand.efficiencyScore.toFixed(1)} | ${opt.efficiencyScore.toFixed(1)} | ${mand.weightedEfficiencyScore.toFixed(1)} | ${opt.weightedEfficiencyScore.toFixed(1)} |`);
            }
        });
        console.log();
    });
}
exports.generateEfficiencyTable = generateEfficiencyTable;
function generateCostOfInaccuracyTable(aggregated, recordCounts, uniqueFormats) {
    console.log('\n\n=== COST OF INACCURACY (tokens wasted) ===\n');
    recordCounts.forEach(recCount => {
        console.log(`**${recCount}-Record Variants:**\n| Format | Mandatory | Optional |`);
        console.log('|--------|-----------|----------|');
        uniqueFormats.forEach(fmt => {
            const mand = aggregated.find(a => a.format === fmt && a.variant === 'mandatory' && a.recordCount === recCount);
            const opt = aggregated.find(a => a.format === fmt && a.variant === 'optional' && a.recordCount === recCount);
            if (mand && opt) {
                console.log(`| ${fmt.toUpperCase()} | ${Math.round(mand.costOfInaccuracy)} | ${Math.round(opt.costOfInaccuracy)} |`);
            }
        });
        console.log();
    });
}
exports.generateCostOfInaccuracyTable = generateCostOfInaccuracyTable;
function generateTokensPerCharTable(aggregated, recordCounts, uniqueFormats) {
    console.log('\n\n=== TOKENS PER CHARACTER ===\n');
    recordCounts.forEach(recCount => {
        console.log(`**${recCount}-Record Variants:**\n| Format | Mandatory | Optional |`);
        console.log('|--------|-----------|----------|');
        uniqueFormats.forEach(fmt => {
            const mand = aggregated.find(a => a.format === fmt && a.variant === 'mandatory' && a.recordCount === recCount);
            const opt = aggregated.find(a => a.format === fmt && a.variant === 'optional' && a.recordCount === recCount);
            if (mand && opt) {
                console.log(`| ${fmt.toUpperCase()} | ${mand.charsPerToken.toFixed(3)} | ${opt.charsPerToken.toFixed(3)} |`);
            }
        });
        console.log();
    });
}
exports.generateTokensPerCharTable = generateTokensPerCharTable;
function generateRankingsTable(aggregated, recordCounts) {
    console.log('\n\n=== RANKINGS BY METRIC ===\n');
    recordCounts.forEach(recCount => {
        console.log(`**${recCount}-Record Dataset:**\n`);
        // Most token efficient
        const mandatoryTests = aggregated.filter(a => a.variant === 'mandatory' && a.recordCount === recCount).sort((a, b) => a.totalTokensUsed - b.totalTokensUsed);
        console.log('Most Token Efficient (lowest total tokens):\n| Rank | Format | Tokens | Weighted Accuracy | Tokens/Accuracy |');
        console.log('|------|--------|--------|-------------------|-----------------|');
        mandatoryTests.slice(0, 7).forEach((item, idx) => {
            const tokensPerAcc = (item.totalTokensUsed / item.avgWeightedAccuracyPercent).toFixed(1);
            console.log(`| ${idx + 1} | ${item.format.toUpperCase()} | ${Math.round(item.totalTokensUsed)} | ${item.avgWeightedAccuracyPercent.toFixed(1)}% | ${tokensPerAcc} |`);
        });
        // Most accurate
        const byAccuracy = aggregated.filter(a => a.variant === 'mandatory' && a.recordCount === recCount).sort((a, b) => b.avgWeightedAccuracyPercent - a.avgWeightedAccuracyPercent);
        console.log('\nHighest Weighted Accuracy:\n| Rank | Format | Weighted Accuracy | Total Tokens | Tokens/Accuracy |');
        console.log('|------|--------|-------------------|--------------|-----------------|');
        byAccuracy.slice(0, 7).forEach((item, idx) => {
            const tokensPerAcc = (item.totalTokensUsed / item.avgWeightedAccuracyPercent).toFixed(1);
            console.log(`| ${idx + 1} | ${item.format.toUpperCase()} | ${item.avgWeightedAccuracyPercent.toFixed(1)}% | ${Math.round(item.totalTokensUsed)} | ${tokensPerAcc} |`);
        });
        // Best efficiency score
        const byWtdEff = aggregated.filter(a => a.variant === 'mandatory' && a.recordCount === recCount).sort((a, b) => b.weightedEfficiencyScore - a.weightedEfficiencyScore);
        console.log('\nBest Weighted Efficiency Score:\n| Rank | Format | Efficiency Score | Weighted Accuracy | Total Tokens |');
        console.log('|------|--------|------------------|-------------------|--------------|');
        byWtdEff.slice(0, 7).forEach((item, idx) => {
            console.log(`| ${idx + 1} | ${item.format.toUpperCase()} | ${item.weightedEfficiencyScore.toFixed(1)} | ${item.avgWeightedAccuracyPercent.toFixed(1)}% | ${Math.round(item.totalTokensUsed)} |`);
        });
        console.log();
    });
}
exports.generateRankingsTable = generateRankingsTable;
function generateMandatoryOptionalComparisonTable(aggregated, recordCounts, uniqueFormats) {
    console.log('\n\n=== MANDATORY VS OPTIONAL COMPARISON ===\n');
    recordCounts.forEach(recCount => {
        console.log(`**${recCount}-Record Dataset:**\n| Format | Tokens Mand | Tokens Opt | Token Diff | Token % Change | Acc Mand | Acc Opt | Acc Diff | Eff Mand | Eff Opt | Eff Diff | Eff % Change |`);
        console.log('|--------|------------|-----------|-----------|----------------|----------|---------|----------|----------|---------|----------|--------------|');
        uniqueFormats.forEach(fmt => {
            const mand = aggregated.find(a => a.format === fmt && a.variant === 'mandatory' && a.recordCount === recCount);
            const opt = aggregated.find(a => a.format === fmt && a.variant === 'optional' && a.recordCount === recCount);
            if (mand && opt) {
                const tokenDiff = opt.totalTokensUsed - mand.totalTokensUsed;
                const tokenPctChange = ((opt.totalTokensUsed / mand.totalTokensUsed - 1) * 100).toFixed(1);
                const accDiff = (opt.avgWeightedAccuracyPercent - mand.avgWeightedAccuracyPercent).toFixed(1);
                const effDiff = (opt.weightedEfficiencyScore - mand.weightedEfficiencyScore).toFixed(1);
                const effPctChange = ((opt.weightedEfficiencyScore / mand.weightedEfficiencyScore - 1) * 100).toFixed(1);
                const tokenSign = parseFloat(tokenPctChange) > 0 ? '+' : '';
                const effSign = parseFloat(effPctChange) > 0 ? '+' : '';
                console.log(`| ${fmt.toUpperCase()} | ${Math.round(mand.totalTokensUsed)} | ${Math.round(opt.totalTokensUsed)} | ${Math.round(tokenDiff)} | ${tokenSign}${tokenPctChange}% | ${mand.avgWeightedAccuracyPercent.toFixed(1)}% | ${opt.avgWeightedAccuracyPercent.toFixed(1)}% | ${accDiff} | ${mand.weightedEfficiencyScore.toFixed(1)} | ${opt.weightedEfficiencyScore.toFixed(1)} | ${effDiff} | ${effSign}${effPctChange}% |`);
            }
        });
        console.log();
    });
}
exports.generateMandatoryOptionalComparisonTable = generateMandatoryOptionalComparisonTable;
function generateCostAnalysisTable(aggregated, recordCounts, uniqueFormats) {
    console.log('\n\n=== COST ANALYSIS: TOKENS PER ACCURACY POINT ===\n');
    recordCounts.forEach(recCount => {
        console.log(`**${recCount}-Record Dataset:**\n| Format | Mandatory (Tokens/%) | Optional (Tokens/%) | Difference | % Change |`);
        console.log('|--------|---------------------|---------------------|-----------|----------|');
        uniqueFormats.forEach(fmt => {
            const mand = aggregated.find(a => a.format === fmt && a.variant === 'mandatory' && a.recordCount === recCount);
            const opt = aggregated.find(a => a.format === fmt && a.variant === 'optional' && a.recordCount === recCount);
            if (mand && opt) {
                const mandCost = (mand.totalTokensUsed / mand.avgWeightedAccuracyPercent).toFixed(1);
                const optCost = (opt.totalTokensUsed / opt.avgWeightedAccuracyPercent).toFixed(1);
                const diff = (parseFloat(optCost) - parseFloat(mandCost)).toFixed(1);
                const pctChange = ((parseFloat(optCost) / parseFloat(mandCost) - 1) * 100).toFixed(1);
                const diffSign = parseFloat(diff) > 0 ? '+' : '';
                const pctSign = parseFloat(pctChange) > 0 ? '+' : '';
                console.log(`| ${fmt.toUpperCase()} | ${mandCost} | ${optCost} | ${diffSign}${diff} | ${pctSign}${pctChange}% |`);
            }
        });
        console.log();
    });
}
exports.generateCostAnalysisTable = generateCostAnalysisTable;
function generateRawVsWeightedDeltaTable(aggregated, recordCounts, uniqueFormats) {
    console.log('\n\n=== RAW VS WEIGHTED ACCURACY DELTA ===\n');
    recordCounts.forEach(recCount => {
        console.log(`**${recCount}-Record Dataset:**\n| Format | Raw Mand | Weighted Mand | Delta Mand | Raw Opt | Weighted Opt | Delta Opt | Avg Delta |`);
        console.log('|--------|----------|--------------|-----------|---------|-------------|-----------|-----------|');
        uniqueFormats.forEach(fmt => {
            const mand = aggregated.find(a => a.format === fmt && a.variant === 'mandatory' && a.recordCount === recCount);
            const opt = aggregated.find(a => a.format === fmt && a.variant === 'optional' && a.recordCount === recCount);
            if (mand && opt) {
                const deltaMand = (mand.avgWeightedAccuracyPercent - mand.avgAccuracyPercent).toFixed(1);
                const deltaOpt = (opt.avgWeightedAccuracyPercent - opt.avgAccuracyPercent).toFixed(1);
                const avgDelta = ((parseFloat(deltaMand) + parseFloat(deltaOpt)) / 2).toFixed(1);
                console.log(`| ${fmt.toUpperCase()} | ${mand.avgAccuracyPercent.toFixed(1)}% | ${mand.avgWeightedAccuracyPercent.toFixed(1)}% | +${deltaMand} | ${opt.avgAccuracyPercent.toFixed(1)}% | ${opt.avgWeightedAccuracyPercent.toFixed(1)}% | +${deltaOpt} | +${avgDelta} |`);
            }
        });
        console.log();
    });
}
exports.generateRawVsWeightedDeltaTable = generateRawVsWeightedDeltaTable;
function generateInfoValueTable(aggregated, recordCounts, uniqueFormats) {
    console.log('\n\n=== INFORMATION VALUE & VARIANT IMPACT ===\n');
    recordCounts.forEach(recCount => {
        console.log(`**${recCount}-Record Dataset:**\n| Format | Info/Token Mand | Info/Token Opt | Absolute Change | % Change (Variant Impact) |`);
        console.log('|--------|-----------------|----------------|-----------------|-----------------------|');
        uniqueFormats.forEach(fmt => {
            const mand = aggregated.find(a => a.format === fmt && a.variant === 'mandatory' && a.recordCount === recCount);
            const opt = aggregated.find(a => a.format === fmt && a.variant === 'optional' && a.recordCount === recCount);
            if (mand && opt) {
                const absDiff = (opt.informationValuePerToken - mand.informationValuePerToken).toFixed(3);
                const pctChange = ((opt.informationValuePerToken / mand.informationValuePerToken - 1) * 100).toFixed(1);
                const status = parseFloat(pctChange) > 0 ? '✓' : '✗';
                const diffSign = parseFloat(absDiff) > 0 ? '+' : '';
                const pctSign = parseFloat(pctChange) > 0 ? '+' : '';
                console.log(`| ${fmt.toUpperCase()} | ${mand.informationValuePerToken.toFixed(3)} | ${opt.informationValuePerToken.toFixed(3)} | ${diffSign}${absDiff} | ${status} ${pctSign}${pctChange}% |`);
            }
        });
        console.log();
    });
}
exports.generateInfoValueTable = generateInfoValueTable;
function generateSummaryStatisticsTable(aggregated, recordCounts) {
    console.log('\n\n=== SUMMARY STATISTICS ===\n');
    recordCounts.forEach(recCount => {
        console.log(`**${recCount}-Record Dataset (Mandatory Data):**\n`);
        const mandTests = aggregated.filter(a => a.variant === 'mandatory' && a.recordCount === recCount);
        const avgTokens = (mandTests.reduce((sum, a) => sum + a.totalTokensUsed, 0) / mandTests.length).toFixed(0);
        const avgAccuracy = (mandTests.reduce((sum, a) => sum + a.avgWeightedAccuracyPercent, 0) / mandTests.length).toFixed(1);
        const minTokens = Math.min(...mandTests.map(a => a.totalTokensUsed));
        const maxTokens = Math.max(...mandTests.map(a => a.totalTokensUsed));
        const minAccuracy = Math.min(...mandTests.map(a => a.avgWeightedAccuracyPercent));
        const maxAccuracy = Math.max(...mandTests.map(a => a.avgWeightedAccuracyPercent));
        const minTokensItem = mandTests.find(a => a.totalTokensUsed === minTokens);
        const maxTokensItem = mandTests.find(a => a.totalTokensUsed === maxTokens);
        const minAccItem = mandTests.find(a => a.avgWeightedAccuracyPercent === minAccuracy);
        const maxAccItem = mandTests.find(a => a.avgWeightedAccuracyPercent === maxAccuracy);
        console.log(`| Metric | Value |`);
        console.log(`|--------|-------|`);
        console.log(`| Average Total Tokens | ${avgTokens} |`);
        console.log(`| Min Tokens | ${Math.round(minTokens)} (${minTokensItem?.format.toUpperCase()}) |`);
        console.log(`| Max Tokens | ${Math.round(maxTokens)} (${maxTokensItem?.format.toUpperCase()}) |`);
        console.log(`| Average Weighted Accuracy | ${avgAccuracy}% |`);
        console.log(`| Lowest Accuracy | ${minAccuracy.toFixed(1)}% (${minAccItem?.format.toUpperCase()}) |`);
        console.log(`| Highest Accuracy | ${maxAccuracy.toFixed(1)}% (${maxAccItem?.format.toUpperCase()}) |`);
        console.log();
    });
}
exports.generateSummaryStatisticsTable = generateSummaryStatisticsTable;
// ============================================================================
// NEW PER-TOPIC TABLES
// ============================================================================
function generateCategoryAccuracyByFormatTable(validations, recordCounts, uniqueFormats) {
    console.log('\n\n=== PER-CATEGORY ACCURACY BY FORMAT ===\n');
    // Get all unique categories
    const allCategories = new Set();
    validations.forEach(v => {
        v.accuracy.forEach(cat => allCategories.add(cat.category));
    });
    const categories = Array.from(allCategories).sort();
    recordCounts.forEach(recCount => {
        console.log(`**${recCount}-Record Dataset:**\n`);
        uniqueFormats.forEach(fmt => {
            const mandatory = validations.find(v => v.format === fmt && v.variant === 'mandatory' && v.recordCount === recCount);
            const optional = validations.find(v => v.format === fmt && v.variant === 'optional' && v.recordCount === recCount);
            if (mandatory || optional) {
                console.log(`**${fmt.toUpperCase()}:**\n| Category | Mandatory (%) | Optional (%) |`);
                console.log('|----------|--------------|--------------|');
                categories.forEach(catName => {
                    const mandCat = mandatory?.accuracy.find(c => c.category === catName);
                    const optCat = optional?.accuracy.find(c => c.category === catName);
                    const mandAcc = mandCat ? mandCat.weightedAccuracyPercent.toFixed(1) : 'N/A';
                    const optAcc = optCat ? optCat.weightedAccuracyPercent.toFixed(1) : 'N/A';
                    console.log(`| ${catName} | ${mandAcc} | ${optAcc} |`);
                });
                console.log();
            }
        });
    });
}
exports.generateCategoryAccuracyByFormatTable = generateCategoryAccuracyByFormatTable;
function generateCategoryMandatoryOptionalDeltaTable(validations, recordCounts, uniqueFormats) {
    console.log('\n\n=== CATEGORY DELTA: MANDATORY VS OPTIONAL ===\n');
    // Get all unique categories
    const allCategories = new Set();
    validations.forEach(v => {
        v.accuracy.forEach(cat => allCategories.add(cat.category));
    });
    const categories = Array.from(allCategories).sort();
    recordCounts.forEach(recCount => {
        console.log(`**${recCount}-Record Dataset:**\n`);
        const headers = '| Category |' + uniqueFormats.map(fmt => ` ${fmt.toUpperCase()} |`).join('');
        console.log(headers);
        const separator = '|' + Array(uniqueFormats.length + 1).fill('---|').join('');
        console.log(separator);
        categories.forEach(catName => {
            let row = `| ${catName} |`;
            uniqueFormats.forEach(fmt => {
                const mandatory = validations.find(v => v.format === fmt && v.variant === 'mandatory' && v.recordCount === recCount);
                const optional = validations.find(v => v.format === fmt && v.variant === 'optional' && v.recordCount === recCount);
                const mandCat = mandatory?.accuracy.find(c => c.category === catName);
                const optCat = optional?.accuracy.find(c => c.category === catName);
                if (mandCat && optCat) {
                    const delta = (optCat.weightedAccuracyPercent - mandCat.weightedAccuracyPercent).toFixed(1);
                    const sign = parseFloat(delta) > 0 ? '+' : '';
                    row += ` ${sign}${delta}% |`;
                }
                else {
                    row += ' N/A |';
                }
            });
            console.log(row);
        });
        console.log();
    });
}
exports.generateCategoryMandatoryOptionalDeltaTable = generateCategoryMandatoryOptionalDeltaTable;
function generateCategoryDifficultyRankingTable(validations, recordCounts) {
    console.log('\n\n=== CATEGORY DIFFICULTY RANKING ===\n');
    // Get all unique categories
    const allCategories = new Set();
    validations.forEach(v => {
        v.accuracy.forEach(cat => allCategories.add(cat.category));
    });
    const categories = Array.from(allCategories).sort();
    recordCounts.forEach(recCount => {
        console.log(`**${recCount}-Record Dataset:**\n`);
        console.log('| Rank | Category | Avg Accuracy | Easiest Format | Hardest Format |');
        console.log('|------|----------|--------------|----------------|----------------|');
        // Calculate average accuracy per category across all formats
        const categoryAvgs = categories.map(catName => {
            const accuracies = validations
                .filter(v => v.recordCount === recCount && v.variant === 'mandatory')
                .map(v => {
                const cat = v.accuracy.find(c => c.category === catName);
                return cat ? cat.weightedAccuracyPercent : 0;
            })
                .filter(a => a > 0);
            const avgAccuracy = accuracies.length > 0 ? accuracies.reduce((a, b) => a + b, 0) / accuracies.length : 0;
            // Find easiest and hardest format for this category
            let easiestFormat = '';
            let hardestFormat = '';
            let maxAcc = -1;
            let minAcc = 101;
            validations
                .filter(v => v.recordCount === recCount && v.variant === 'mandatory')
                .forEach(v => {
                const cat = v.accuracy.find(c => c.category === catName);
                if (cat) {
                    if (cat.weightedAccuracyPercent > maxAcc) {
                        maxAcc = cat.weightedAccuracyPercent;
                        easiestFormat = v.format;
                    }
                    if (cat.weightedAccuracyPercent < minAcc) {
                        minAcc = cat.weightedAccuracyPercent;
                        hardestFormat = v.format;
                    }
                }
            });
            return {
                category: catName,
                avgAccuracy,
                easiestFormat,
                hardestFormat,
            };
        });
        // Sort by accuracy descending (easiest first)
        categoryAvgs.sort((a, b) => b.avgAccuracy - a.avgAccuracy);
        categoryAvgs.forEach((item, idx) => {
            console.log(`| ${idx + 1} | ${item.category} | ${item.avgAccuracy.toFixed(1)}% | ${item.easiestFormat.toUpperCase()} | ${item.hardestFormat.toUpperCase()} |`);
        });
        console.log();
    });
}
exports.generateCategoryDifficultyRankingTable = generateCategoryDifficultyRankingTable;
