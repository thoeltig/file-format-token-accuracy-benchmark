import { AggregatedMetric, ValidationSummary } from './tableLoaders';

// ============================================================================
// EXISTING TABLES (1:1 port from JS)
// ============================================================================

export function generateComprehensiveTable(
  aggregated: AggregatedMetric[]
): void {
  console.log('\n=== COMPREHENSIVE BENCHMARK METRICS TABLE ===\n');

  console.log('| Format | Records | Variant | Read Tokens | Output Tokens | Total | Tokens/Char | Raw Acc | Wtd Acc | Info/Token | Cost Inaccuracy | Efficiency | Wtd Efficiency |');
  console.log('|--------|---------|---------|-------------|-----------|-------|-------------|---------|---------|------------|-----------------|------------|-----------------|');

  aggregated.forEach(item => {
    const fmt = item.format.toUpperCase();
    const rec = item.recordCount;
    const var_ = item.variant.substring(0, 3);
    console.log(
      `| ${fmt} | ${rec} | ${var_} | ${Math.round(item.readTokens)} | ${Math.round(item.avgOutputTokens)} | ${Math.round(item.totalTokensUsed)} | ${item.charsPerReadToken.toFixed(2)} | ${item.accuracyPercent.toFixed(1)}% | ${item.weightedAccuracyPercent.toFixed(1)}% | ${item.informationValuePerToken.toFixed(3)} | ${Math.round(item.costOfInaccuracy)} | ${item.efficiencyScore.toFixed(1)} | ${item.weightedEfficiencyScore.toFixed(1)} |`
    );
  });
}

export function generateReadTokensTable(
  aggregated: AggregatedMetric[],
  recordCounts: number[],
  uniqueFormats: string[]
): void {
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

export function generateTotalTokensTable(
  aggregated: AggregatedMetric[],
  recordCounts: number[],
  uniqueFormats: string[]
): void {
  console.log('\n\n=== TOTAL TOKENS (Read + Output) ===\n');

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

export function generateAccuracyTable(
  aggregated: AggregatedMetric[],
  recordCounts: number[],
  uniqueFormats: string[]
): void {
  console.log('\n\n=== ACCURACY (Raw vs Weighted) ===\n');

  recordCounts.forEach(recCount => {
    console.log(`**${recCount}-Record Variants:**\n| Format | Raw Mand | Raw Opt | Wtd Mand | Wtd Opt | Delta (Raw) | Delta (Wtd) |`);
    console.log('|--------|----------|--------|----------|--------|-------------|-------------|');
    uniqueFormats.forEach(fmt => {
      const mand = aggregated.find(a => a.format === fmt && a.variant === 'mandatory' && a.recordCount === recCount);
      const opt = aggregated.find(a => a.format === fmt && a.variant === 'optional' && a.recordCount === recCount);
      if (mand && opt) {
        const rawDelta = (opt.accuracyPercent - mand.accuracyPercent).toFixed(1);
        const wtdDelta = (opt.weightedAccuracyPercent - mand.weightedAccuracyPercent).toFixed(1);
        console.log(`| ${fmt.toUpperCase()} | ${mand.accuracyPercent.toFixed(1)}% | ${opt.accuracyPercent.toFixed(1)}% | ${mand.weightedAccuracyPercent.toFixed(1)}% | ${opt.weightedAccuracyPercent.toFixed(1)}% | ${rawDelta} | ${wtdDelta} |`);
      }
    });
    console.log();
  });
}

export function generateEfficiencyTable(
  aggregated: AggregatedMetric[],
  recordCounts: number[],
  uniqueFormats: string[]
): void {
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

export function generateCostOfInaccuracyTable(
  aggregated: AggregatedMetric[],
  recordCounts: number[],
  uniqueFormats: string[]
): void {
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

export function generateTokensPerCharTable(
  aggregated: AggregatedMetric[],
  recordCounts: number[],
  uniqueFormats: string[]
): void {
  console.log('\n\n=== TOKENS PER CHARACTER ===\n');

  recordCounts.forEach(recCount => {
    console.log(`**${recCount}-Record Variants:**\n| Format | Mandatory | Optional |`);
    console.log('|--------|-----------|----------|');
    uniqueFormats.forEach(fmt => {
      const mand = aggregated.find(a => a.format === fmt && a.variant === 'mandatory' && a.recordCount === recCount);
      const opt = aggregated.find(a => a.format === fmt && a.variant === 'optional' && a.recordCount === recCount);
      if (mand && opt) {
        console.log(`| ${fmt.toUpperCase()} | ${mand.charsPerReadToken.toFixed(3)} | ${opt.charsPerReadToken.toFixed(3)} |`);
      }
    });
    console.log();
  });
}

export function generateRankingsTable(
  aggregated: AggregatedMetric[],
  recordCounts: number[]
): void {
  console.log('\n\n=== RANKINGS BY METRIC ===\n');

  recordCounts.forEach(recCount => {
    console.log(`**${recCount}-Record Dataset:**\n`);

    // Most token efficient
    const mandatoryTests = aggregated.filter(a => a.variant === 'mandatory' && a.recordCount === recCount).sort((a, b) => a.totalTokensUsed - b.totalTokensUsed);
    console.log('Most Token Efficient (lowest total tokens):\n| Rank | Format | Tokens | Weighted Accuracy | Tokens/Accuracy |');
    console.log('|------|--------|--------|-------------------|-----------------|');
    mandatoryTests.slice(0, 7).forEach((item, idx) => {
      const tokensPerAcc = (item.totalTokensUsed / item.weightedAccuracyPercent).toFixed(1);
      console.log(`| ${idx + 1} | ${item.format.toUpperCase()} | ${Math.round(item.totalTokensUsed)} | ${item.weightedAccuracyPercent.toFixed(1)}% | ${tokensPerAcc} |`);
    });

    // Most accurate
    const byAccuracy = aggregated.filter(a => a.variant === 'mandatory' && a.recordCount === recCount).sort((a, b) => b.weightedAccuracyPercent - a.weightedAccuracyPercent);
    console.log('\nHighest Weighted Accuracy:\n| Rank | Format | Weighted Accuracy | Total Tokens | Tokens/Accuracy |');
    console.log('|------|--------|-------------------|--------------|-----------------|');
    byAccuracy.slice(0, 7).forEach((item, idx) => {
      const tokensPerAcc = (item.totalTokensUsed / item.weightedAccuracyPercent).toFixed(1);
      console.log(`| ${idx + 1} | ${item.format.toUpperCase()} | ${item.weightedAccuracyPercent.toFixed(1)}% | ${Math.round(item.totalTokensUsed)} | ${tokensPerAcc} |`);
    });

    // Best efficiency score
    const byWtdEff = aggregated.filter(a => a.variant === 'mandatory' && a.recordCount === recCount).sort((a, b) => b.weightedEfficiencyScore - a.weightedEfficiencyScore);
    console.log('\nBest Weighted Efficiency Score:\n| Rank | Format | Efficiency Score | Weighted Accuracy | Total Tokens |');
    console.log('|------|--------|------------------|-------------------|--------------|');
    byWtdEff.slice(0, 7).forEach((item, idx) => {
      console.log(`| ${idx + 1} | ${item.format.toUpperCase()} | ${item.weightedEfficiencyScore.toFixed(1)} | ${item.weightedAccuracyPercent.toFixed(1)}% | ${Math.round(item.totalTokensUsed)} |`);
    });
    console.log();
  });
}

export function generateMandatoryOptionalComparisonTable(
  aggregated: AggregatedMetric[],
  recordCounts: number[],
  uniqueFormats: string[]
): void {
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
        const accDiff = (opt.weightedAccuracyPercent - mand.weightedAccuracyPercent).toFixed(1);
        const effDiff = (opt.weightedEfficiencyScore - mand.weightedEfficiencyScore).toFixed(1);
        const effPctChange = ((opt.weightedEfficiencyScore / mand.weightedEfficiencyScore - 1) * 100).toFixed(1);
        const tokenSign = parseFloat(tokenPctChange) > 0 ? '+' : '';
        const effSign = parseFloat(effPctChange) > 0 ? '+' : '';
        console.log(`| ${fmt.toUpperCase()} | ${Math.round(mand.totalTokensUsed)} | ${Math.round(opt.totalTokensUsed)} | ${Math.round(tokenDiff)} | ${tokenSign}${tokenPctChange}% | ${mand.weightedAccuracyPercent.toFixed(1)}% | ${opt.weightedAccuracyPercent.toFixed(1)}% | ${accDiff} | ${mand.weightedEfficiencyScore.toFixed(1)} | ${opt.weightedEfficiencyScore.toFixed(1)} | ${effDiff} | ${effSign}${effPctChange}% |`);
      }
    });
    console.log();
  });
}

export function generateCostAnalysisTable(
  aggregated: AggregatedMetric[],
  recordCounts: number[],
  uniqueFormats: string[]
): void {
  console.log('\n\n=== COST ANALYSIS: TOKENS PER ACCURACY POINT ===\n');

  recordCounts.forEach(recCount => {
    console.log(`**${recCount}-Record Dataset:**\n| Format | Mandatory (Tokens/%) | Optional (Tokens/%) | Difference | % Change |`);
    console.log('|--------|---------------------|---------------------|-----------|----------|');
    uniqueFormats.forEach(fmt => {
      const mand = aggregated.find(a => a.format === fmt && a.variant === 'mandatory' && a.recordCount === recCount);
      const opt = aggregated.find(a => a.format === fmt && a.variant === 'optional' && a.recordCount === recCount);
      if (mand && opt) {
        const mandCost = (mand.totalTokensUsed / mand.weightedAccuracyPercent).toFixed(1);
        const optCost = (opt.totalTokensUsed / opt.weightedAccuracyPercent).toFixed(1);
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

export function generateRawVsWeightedDeltaTable(
  aggregated: AggregatedMetric[],
  recordCounts: number[],
  uniqueFormats: string[]
): void {
  console.log('\n\n=== RAW VS WEIGHTED ACCURACY DELTA ===\n');

  recordCounts.forEach(recCount => {
    console.log(`**${recCount}-Record Dataset:**\n| Format | Raw Mand | Weighted Mand | Delta Mand | Raw Opt | Weighted Opt | Delta Opt | Avg Delta |`);
    console.log('|--------|----------|--------------|-----------|---------|-------------|-----------|-----------|');
    uniqueFormats.forEach(fmt => {
      const mand = aggregated.find(a => a.format === fmt && a.variant === 'mandatory' && a.recordCount === recCount);
      const opt = aggregated.find(a => a.format === fmt && a.variant === 'optional' && a.recordCount === recCount);
      if (mand && opt) {
        const deltaMand = (mand.weightedAccuracyPercent - mand.accuracyPercent).toFixed(1);
        const deltaOpt = (opt.weightedAccuracyPercent - opt.accuracyPercent).toFixed(1);
        const avgDelta = ((parseFloat(deltaMand) + parseFloat(deltaOpt)) / 2).toFixed(1);
        console.log(`| ${fmt.toUpperCase()} | ${mand.accuracyPercent.toFixed(1)}% | ${mand.weightedAccuracyPercent.toFixed(1)}% | +${deltaMand} | ${opt.accuracyPercent.toFixed(1)}% | ${opt.weightedAccuracyPercent.toFixed(1)}% | +${deltaOpt} | +${avgDelta} |`);
      }
    });
    console.log();
  });
}

export function generateInfoValueTable(
  aggregated: AggregatedMetric[],
  recordCounts: number[],
  uniqueFormats: string[]
): void {
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

export function generateSummaryStatisticsTable(
  aggregated: AggregatedMetric[],
  recordCounts: number[]
): void {
  console.log('\n\n=== SUMMARY STATISTICS ===\n');

  recordCounts.forEach(recCount => {
    console.log(`**${recCount}-Record Dataset (Mandatory Data):**\n`);
    const mandTests = aggregated.filter(a => a.variant === 'mandatory' && a.recordCount === recCount);
    const avgTokens = (mandTests.reduce((sum, a) => sum + a.totalTokensUsed, 0) / mandTests.length).toFixed(0);
    const avgAccuracy = (mandTests.reduce((sum, a) => sum + a.weightedAccuracyPercent, 0) / mandTests.length).toFixed(1);
    const minTokens = Math.min(...mandTests.map(a => a.totalTokensUsed));
    const maxTokens = Math.max(...mandTests.map(a => a.totalTokensUsed));
    const minAccuracy = Math.min(...mandTests.map(a => a.weightedAccuracyPercent));
    const maxAccuracy = Math.max(...mandTests.map(a => a.weightedAccuracyPercent));

    const minTokensItem = mandTests.find(a => a.totalTokensUsed === minTokens);
    const maxTokensItem = mandTests.find(a => a.totalTokensUsed === maxTokens);
    const minAccItem = mandTests.find(a => a.weightedAccuracyPercent === minAccuracy);
    const maxAccItem = mandTests.find(a => a.weightedAccuracyPercent === maxAccuracy);

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

// ============================================================================
// NEW PER-TOPIC TABLES
// ============================================================================

export function generateCategoryAccuracyByFormatTable(
  validations: ValidationSummary[],
  recordCounts: number[],
  uniqueFormats: string[]
): void {
  console.log('\n\n=== PER-CATEGORY ACCURACY BY FORMAT ===\n');

  // Get all unique categories
  const allCategories = new Set<string>();
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

export function generateCategoryMandatoryOptionalDeltaTable(
  validations: ValidationSummary[],
  recordCounts: number[],
  uniqueFormats: string[]
): void {
  console.log('\n\n=== CATEGORY DELTA: MANDATORY VS OPTIONAL ===\n');

  // Get all unique categories
  const allCategories = new Set<string>();
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
        } else {
          row += ' N/A |';
        }
      });

      console.log(row);
    });
    console.log();
  });
}

export function generateCategoryDifficultyRankingTable(
  validations: ValidationSummary[],
  recordCounts: number[]
): void {
  console.log('\n\n=== CATEGORY DIFFICULTY RANKING ===\n');

  // Get all unique categories
  const allCategories = new Set<string>();
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
