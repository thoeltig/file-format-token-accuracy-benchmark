# Template Report Generator

## Overview

`generateReport.ts` generates a complete, publishable markdown report from benchmark analytics data. Unlike `generateTables.ts` which outputs individual tables, this script produces a structured narrative report with:

- ✓ Professional formatting ready for publication
- ✓ Auto-populated data from analytics_results.json
- ✓ Placeholder sections (`<ADD_CONTENT_HERE>`) for analysis
- ✓ Template format that works across all benchmarks
- ✓ Minimal manual work: only add analysis in placeholder sections

## Usage

### Compile TypeScript
```bash
cd scripts
npx tsc
```

### Generate Report
```bash
node dist/tables/generateReport.js \
  --json-path ./benchmark_haiku_4_5_flat_all_formats_and_variants_off/analytics_results.json \
  --results-path ./benchmark_haiku_4_5_flat_all_formats_and_variants_off/results \
  --output-path ./BENCHMARK_REPORT.md
```

### Parameters
- `--json-path`: Path to analytics_results.json (required)
- `--results-path`: Path to validation results directory (required)
- `--metadata-path`: Path to metadata.json (optional, auto-extracted from analytics)
- `--output-path`: Where to save the report (default: BENCHMARK_REPORT.md)

## Report Structure

### Auto-Populated Sections
These sections are automatically filled from analytics data:

1. **Title & Metadata** - Model, date, formats tested, record counts
2. **Methodology** - Test design, question distribution, metrics definitions
3. **Comprehensive Metrics Table** - All formats with token cost, accuracy, efficiency
4. **Token Cost Analysis** - Breakdown by format and variant
5. **Accuracy Comparison** - Raw vs weighted accuracy across all tests
6. **Format-Specific Summary** - Best configurations and token ranges per format
7. **Appendices** - Complete data tables for reference

### Manual Completion Sections
These sections have `<ADD_CONTENT_HERE>` placeholders:

**Executive Summary**
- Key findings (5-7 items)

**Results & Analysis**
- Token efficiency patterns
- Accuracy analysis and divergence explanation
- Category performance breakdown

**Format-Specific Analysis** (per format)
- Strengths (based on data but written as narrative)
- Weaknesses (based on data but written as narrative)
- Use case recommendations
- Trade-off analysis

**Conclusions**
- Format selection framework/decision matrix
- Trade-off analysis and recommendations
- Scaling characteristics
- Open research questions for next iteration

## How to Complete the Report

1. **Run the script** to generate initial report with placeholders
2. **Review each `<ADD_CONTENT_HERE>` section**
3. **Use data tables and category analysis** to inform your writing
4. **Replace placeholders** with narrative analysis
5. **Verify all sections** are filled in
6. **Publish the final report**

## Placeholder Categories

### Analysis Placeholders
```markdown
<ADD_CONTENT_HERE: Analyze token cost patterns across formats>
- Lowest token cost formats:
- Highest token efficiency (chars/token):
```

### Hypothesis Placeholders
```markdown
<ADD_CONTENT_HERE: Analyze accuracy patterns and divergence from previous tests>
- Best performing formats:
- Format weaknesses:
```

### Recommendation Placeholders
```markdown
<ADD_CONTENT_HERE: When and why to use this format>
- ✓ Use when:
- ❌ Avoid when:
```

### Scenario Placeholders (in decision matrix)
```markdown
| <ADD_SCENARIO_1> | <FORMAT> | <FORMAT> | <FORMAT> |
```

## Example: Filling a Section

**Before:**
```markdown
### 2.2 Token Efficiency Analysis

<ADD_CONTENT_HERE: Analyze token cost patterns across formats>
- Lowest token cost formats:
- Highest token efficiency (chars/token):
- Linear scaling observations:
```

**After (Example):**
```markdown
### 2.2 Token Efficiency Analysis

CSV and TOON formats demonstrate the lowest token costs, with CSV at 7,318 tokens for 31-record mandatory data. JSON formats show 2-3x higher token consumption but maintain better accuracy across variants. All formats exhibit linear scaling with record count (+1-7% deviation from perfect 50% halving), indicating predictable token budgeting.

- Lowest token cost formats: CSV (7,318), TOON (7,335), JSON_COMPACT (9,496)
- Highest token efficiency (chars/token): JSON_COMPACT (2.11-2.15)
- Linear scaling observations: All formats scale linearly except JSON_PRETTY (+6.3% deviation), validating predictable token budgeting for larger datasets
```

## Data Available for Analysis

The script automatically extracts and provides:

- **Per-format metrics**: accuracy, weighted accuracy, token costs, efficiency scores
- **Per-variant metrics**: mandatory vs optional data impact
- **Per-record-count metrics**: scaling characteristics
- **Category breakdown**: performance across question types (from validations)
- **Cost analysis**: tokens wasted on inaccuracy by format
- **Information value**: accuracy per token consumed

Use the auto-generated tables and category data to inform your narrative analysis.

## Integration with CI/CD

Can be added to pipeline:
```bash
# After analytics.js completes
node dist/tables/generateReport.js \
  --json-path $BENCHMARK_OUTPUT_DIR/analytics_results.json \
  --results-path $BENCHMARK_OUTPUT_DIR/results \
  --output-path $BENCHMARK_OUTPUT_DIR/BENCHMARK_REPORT.md

# Then: manual review and completion of placeholders
```

## Output Example

```
# File Format Token Efficiency Benchmark: Comprehensive Report

**Date**: 2026-03-07
**Model**: Claude Haiku 4.5
**Extended Thinking**: off
**Data Structure**: flat
**Formats Tested**: 8 (CSV, JSON_COMPACT, JSON_PRETTY, ...)
**Record Counts**: 31

---

## Executive Summary

This benchmark evaluates token efficiency and information accuracy across 8 file formats...

### Key Findings

<ADD_CONTENT_HERE: Insert 5-7 key findings from analysis>
1.
2.
...

---

[Full report structure with tables and placeholders]
```

## Next Steps

1. Compile the TypeScript: `npx tsc`
2. Run on current benchmark: `node dist/tables/generateReport.js --json-path ...`
3. Review generated BENCHMARK_REPORT.md
4. Fill in each `<ADD_CONTENT_HERE>` section
5. Publish the final report

## Debugging

If TypeScript compilation fails, check:
- `tableLoaders.ts` is available and exports correct types
- Node version is compatible (v14+)
- All import paths are correct

The script outputs progress: "Loading analytics results... ✓ Report generated: BENCHMARK_REPORT.md"
