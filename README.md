# File Format Token Efficiency Benchmark

Comprehensive benchmarking suite for measuring token efficiency and accuracy across file formats for LLM consumption.

## Overview

This framework validates which file formats deliver the most reliable information to LLMs with optimal token efficiency. The benchmark focuses on **structural and retrieval accuracy**—understanding data organization and extracting specific values—which are fundamental to avoiding context confusion.

**Note on Question Categories**: Complex filtering and mathematical aggregation are interesting but test the model's intelligence rather than format effectiveness. Also the accuracy for filtering and aggregation would be irrelevant if the data is prefiltered or the data contains fields with the calculated values. Structural questions (understanding data shape/organization) and retrieval questions (extracting specific values) directly validate format clarity.

## Initial Test Run & Methodology

The initial benchmark run (Dec 19, 2025) with Claude 4.5 Haiku tested 8 formats across 120 questions with weighted accuracy prioritizing structural understanding and retrieval (60% combined weight vs filtering/aggregation at 40%). 4 flat array data sets of variants 40 and 80 records, random optional fields and all mandatory fields.

> [!NOTE]
> All benchmark results have been moved to a separate repository: [file-format-token-accuracy-benchmark-results](https://github.com/thoeltig/file-format-token-accuracy-benchmark-results)

**Key Findings** (see [Initial BenchmarkReport.md](https://github.com/thoeltig/file-format-token-accuracy-benchmark-results/blob/main/initital_benchmark_haiku_4_5_formats_all_variants_all_extended_thinking_off/BENCHMARK_REPORT.md)):
- **CSV**: Unbeatable for dense, mandatory data (70.98% weighted @ 9,008 tokens). Accuracy drops by ~15% with sparse data.
- **JSON Compact**: Recommended baseline. 1.46x tokens compared to CSV but 70.12% weighted accuracy with consistency across all variants.
- **JSON Pretty**: Not recommended. 1.88x tokens compared to JSON Compact with similiar accuracy. Formatting only adds tokens but does not increase accuracy.
- **YAML**: Highest accuracy (71.96% weighted) but 2.62x token compared to CSV.
- **TOON**: Close to CSV for dense, mandatory data. Accuracy stays consistent with sparse data but tokens increased by 2.17x.
- **Markdown**: Requires x0.5 of CSV tokens but has a catastrophic weighted accuracy of 24.67%. ~75% of tokens wasted on wrong answers.
- **Linear Scaling Validated**: All formats and variants scale linearly with data volume (48-52% reduction from 80 to 40 records).

## Next Test Setup (Current Configuration)

**Active Formats** (8 total):
- CSV (baseline efficiency)
- JSON Compact (recommended baseline)
- JSON Pretty (formatting overhead reference)
- TOON Safe (custom binary format)
- TOON Unsafe (custom binary format)
- XML Compact (minified, lowest XML token usage)
- XML Pretty (indented, readability reference)
- YAML (highest accuracy, premium cost)

**Removed after Initial Test**:
- ❌ JSONL (streaming variant—less relevant for benchmark)
- ❌ Markdown (24.67% accuracy—unreliable)
- ❌ Apache Logs (irrelevant for general data benchmarking)

**Record Count**: 60 records (single standardized count, replaces 40/80 records)

**Structures**: Flat and Nested per format (extends previous flat array structure)

**Field Variants**: Mandatory and Optional per format (same object but for optional random fields are set to null)

## Benchmark Workflow Overview

A complete benchmark run consists of 6 steps:

1. **Prepare Output Folder** - Create benchmark directory with specified parameters
2. **Generate Test Data** - Create data files, questions, and templates for all formats/variants
3. **Execute Tests** - Run format-sequential tests with format-specific subagents
4. **Collect Agent IDs** - Track all readonly and full test agent IDs
5. **Run Analytics** - Validate results and extract metrics from agent transcripts
6. **Display Results** - Show rankings and key insights

## Output Directory Structure

When you run a benchmark, it generates a folder like `benchmark_haiku_formats_all_variants_all_extended_thinking_off/` containing:

```
{BENCHMARK_OUTPUT_DIR}/
├── data/
│   └── {format}/
│       ├── {format}_with_optional_60_flat_records.{ext}
│       ├── {format}_with_optional_60_nested_records.{ext}    # (not for CSV)
│       ├── {format}_with_mandatory_60_flat_records.{ext}
│       └── {format}_with_mandatory_60_nested_records.{ext}   # (not for CSV)
├── questions/
│   ├── questions_with_optional_60_records.json
│   └── questions_with_mandatory_60_records.json
├── answers_template/
│   ├── answers_with_optional_60_records_template.json
│   └── answers_with_mandatory_60_records_template.json
├── answers_validation/
│   ├── questions_and_answers_with_optional_60_records.json
│   └── questions_and_answers_with_mandatory_60_records.json
├── subagent_outputs/
│   └── {format}/
│       ├── answers_for_flat_optional_60_records_1.json    # Test run 1
│       ├── answers_for_flat_optional_60_records_2.json    # Test run 2
│       ├── answers_for_flat_optional_60_records_3.json    # Test run 3
│       ├── answers_for_nested_optional_60_records_1.json
│       ├── answers_for_nested_optional_60_records_2.json
│       ├── answers_for_nested_optional_60_records_3.json
│       ├── answers_for_flat_mandatory_60_records_1.json
│       └── ... (more combinations)
├── results/
│   └── {format}_{structure}_{variant}_60_validation.json
├── metadata.json                 # Dataset characteristics and generation parameters
├── agent_ids.json               # All readonly and full test agent IDs (created during Step 4)
├── metrics.json                 # Combined metrics from agent transcripts (auto-generated by analytics)
└── analytics_results.json       # Final analysis with rankings and insights (Step 5 output)
```

**Key Files:**
- `agent_ids.json`: Created during test execution, contains all readonly and full test agent IDs for metrics extraction
- `metrics.json`: Auto-generated by analytics.js, combines input and output metrics extracted from agent transcripts
- `analytics_results.json`: Final analysis output with efficiency rankings and key insights

## Quick Start

Use the `/benchmark` slash command to orchestrate a complete benchmarking run:

```bash
/benchmark [--formats csv,json_compact,json_pretty,toon_safe,toon_unsafe,xml_pretty,xml_compact,yaml] [--variant optional,mandatory] [--structure flat,nested] [--model haiku|sonnet] [--thinking on|off] [--output PATH]
```

**Default behavior** (if no arguments provided):
- Tests all 8 formats (CSV, JSON Compact, JSON Pretty, TOON Safe, TOON Unsafe, XML Pretty, XML Compact, YAML)
- Tests both mandatory and optional variants
- Tests both flat and nested structures (flat only for CSV)
- Uses Haiku model
- Enables extended thinking
- Auto-generates folder name like `benchmark_format_all_structure_all_variant_all_haiku_on/`

**Important**: The analytics script groups results by format and variant only, not by structure. To get accurate per-structure comparisons, run separate benchmarks per structure:
```bash
/benchmark --structure flat --output ./benchmark_flat
/benchmark --structure nested --output ./benchmark_nested
```

This ensures analytics output reflects the specific structure being tested.

### Step 1: Prepare Output Folder

The benchmark command creates a working directory to store all generated data and test results. If `--output` is specified, that path is used; otherwise a folder is auto-generated based on parameters.

### Step 2: Generate Test Data

```bash
cd scripts && npm run build && node dist/orchestrator.js --output {OUTPUT_DIR}
```

This generates:
- 60-record data files in all formats (CSV, JSON Compact, JSON Pretty, TOON, XML, YAML)
- Flat and/or nested structure variants (flat only for CSV)
- Mandatory and optional field variants
- 125 test questions per variant
- Answer templates for each variant
- `metadata.json` with dataset characteristics

### Step 3: Load Test Configuration

Read `metadata.json` to determine all test cases. For each format/structure/variant combination:
- Execute 1 read-only test (to warm the cache)
- Execute 3 full tests in parallel (to measure accuracy and token usage)

### Step 4: Execute Format-Sequential Tests

Process formats one at a time to ensure cache locality and stability:
- **Per format**: Execute all variants and structures
- **Per combination**: Launch 1 read test → wait → launch 3 full tests in parallel
- **Track agent IDs** in `agent_ids.json` for later metrics extraction

The benchmark-full-test subagent:
- Reads data file, questionnaire, and answer template (once each)
- Answers all 125 questions based only on the data
- Writes results to `subagent_outputs/{format}/` directory
- System message includes input and output token metrics

### Step 5: Run Analytics

```bash
cd scripts && node dist/analytics.js --agent-ids {OUTPUT_DIR}/agent_ids.json --output {OUTPUT_DIR}
```

Analytics automatically:
1. Validates all test case outputs using metadata and answers
2. Reads `agent_ids.json` to get all agent IDs
3. Extracts read metrics from readonly test transcripts
4. Extracts used tokens and caluclate estimated reasoning tokens from full test transcripts
5. Combines metrics into `metrics.json`
6. Calculates efficiency rankings
7. Outputs `analytics_results.json` with insights

### Step 6: Review Results

Results are displayed and saved to `analytics_results.json`:
- Token efficiency rankings (chars/token, tokens/value, tokens/object)
- Accuracy rankings (standard and weighted)
- Efficiency score combining accuracy and token usage
- Format comparison insights

## Testing Workflow

The benchmark executes a format-sequential strategy to maintain cache locality and stability:

### For Each Format (one at a time)

**Read-Only Test (once per structure/variant combination)**:
1. Launch `benchmark-read-only` subagent
2. Read data file completely (caches the data)
3. Collect returned agent ID
4. Wait for completion

**Full Tests (3 parallel tests after read completes)**:
1. Launch 3x `benchmark-full-test` subagents in parallel
2. Each reads:
   - Data file (benefits from warm cache)
   - Questionnaire with 120 questions
   - Answer template
3. Each writes results to `subagent_outputs/{format}/answers_for_{structure}_{variant}_60_records_{1,2,3}.json`
4. System message captures:
   - Input tokens (data + questions)
   - Output tokens
   - Estimated reasoning tokens
5. Wait for all 3 to complete

**Validation (automatic during analytics)**:
1. Compare answers against expected values using validator rules
2. Calculate accuracy per question category
3. Generate `results/{format}_{structure}_{variant}_60_validation.json`

### Agent ID Tracking

Each combination generates 4 agent IDs:
- 1 readonly agent ID (from read test)
- 3 full test agent IDs (from full tests 1, 2, 3)

All IDs are collected in `agent_ids.json` for metrics extraction in Step 5.

## Data Characteristics

All formats contain the same 60-record product dataset with 22 fields:

### Format Specifics
- **CSV**: A format for storing tabular data where each line is a record and columns are separated by commas.
- **JSON Pretty**: A format for storing structured data with key-value pairs and arrays. Indented for human readability.
- **JSON Compact**: Same as JSON Pretty but minified (no whitespace or new lines).
- **XML Pretty**: A format for storing structured data with hierarchical tags that separate information from its presentation. Indented for human readability.
- **XML Compact**: Same as XML Pretty but minified (no whitespace or indentation). Approximately 11-19% smaller than XML Pretty depending on structure and field variants.
- **TOON Safe**: A compact, human-readable encoding of the JSON data model for LLM prompts with safe key folding enabled. Collapses chains of single-key objects into dotted paths (e.g., `data.metadata.items`) when all segments are valid identifiers, guaranteeing lossless round-trip decoding (see [Token-Oriented Object Notation](https://toonformat.dev/)).
- **TOON Unsafe**: Same encoding but with key folding disabled. Nested structures remain fully expanded without dot-separated collapsing. Produces larger output but valid regardless of key naming conventions.
- **YAML**: A format for storing structured data with hierarchical indentation for human readability.

### Formatting Impact: Pretty vs Compact

To measure formatting overhead on token usage and accuracy, the benchmark tests both pretty (indented) and minified (compact) versions:

- **JSON Pretty vs Compact**: Compacting reduces tokens by ~17.6% with equivalent accuracy. Validates whether formatting is redundant for LLM understanding.
- **XML Pretty vs Compact**: Compacting reduces tokens by ~11-19% (varies by structure/variant). Tests if XML formatting follows similar patterns to JSON.

This comparison helps answer: **Do LLMs need human-readable formatting, or can compact versions deliver equivalent understanding with less token overhead?**

### Key Folding Impact: Safe vs Disabled

To measure compression efficiency of TOON's optional key folding feature, the benchmark tests both safe key folding enabled and disabled:

- **TOON Safe**: Enables safe key folding, which collapses chains of single-key objects into dotted paths (e.g., `data.metadata.items: value`). Segments must be valid identifiers (letters, digits, underscores only). Lossless—guarantees exact recovery of original structure via `expandPaths: 'safe'` during decoding.
- **TOON Unsafe**: Disables key folding. Nested structures remain fully expanded across multiple indentation levels. No compression of single-key chains, but output is always valid regardless of key naming conventions.

The efficiency gain of key folding depends on data structure:
- **Mandatory/Uniform Data**: Folding impact is minimal; nested structures are typically shallow. Efficiency gains modest.
- **Sparse/Deeply-Nested Data**: Safe folding provides significant token savings by replacing multiple levels of indentation with single dotted paths.

This comparison helps answer: **Does collapsing single-key object chains via safe key folding provide meaningful token efficiency gains compared to fully expanded nested structures?**

### Record Count
- **60 records**
- 19 mandatory + 3 potentially optional fields per record × 60 records = 1140 to 1320 data points

### Standard Fields (All Formats)
- Product ID, Name, Category, Price, Description
- Stock quantity, Min/Max thresholds
- Supplier information, Lead times
- Timestamps, Last update
- And 12 additional mandatory fields

## Questionnaire Structure

**125 questions per format**, weighted heavily toward structural and retrieval accuracy:

### Question Categories & Weights

1. **Field Retrieval (37.5% weight, 54 questions)** - Extract specific values
   - Example: "What is the price of product PROD-000001?"
   - Validates: Format clarity for direct lookups
   - Validation: Exact match

2. **Structure Awareness (29.2% weight, 28 questions)** - Understand data organization
   - Example: "List all unique product categories"
   - Validates: Format effectiveness at conveying data relationships
   - Validation: Array/set matching

3. **Filtering (20.8% weight, 22 questions)** - Count matching criteria
   - Example: "How many products are out of stock?"
   - Note: Tests model capability more than format clarity
   - Validation: Numeric count

4. **Aggregation (12.5% weight, 21 questions)** - Sum, average, count across records
   - Example: "What is the total stock quantity?"
   - Note: Tests model capability more than format clarity
   - Validation: Numeric with tolerance

### Weight Rationale (Revised from Initial Test)

- **66.7% for Field Retrieval + Structure** (increased from 60%) = Stronger emphasis on "what data exists and how it's organized"
- **33.3% for Filtering + Aggregation** (decreased from 40%) = Less weight on capabilities more dependent on model intelligence than format clarity
- **Focus shifted**: Prioritizes format effectiveness over testing model reasoning limits

### Answer Validation

Validation methods: `exact` (case-insensitive string), `numeric` (number with tolerance), `array_set` (set membership), `fuzzy` (keyword matching)

**Weighted Accuracy Formula**:
```
weightedAccuracy = (retrieval_correct / 54) × 0.375
                 + (structure_correct / 28) × 0.29167
                 + (filtering_correct / 22) × 0.20833
                 + (aggregation_correct / 21) × 0.125
```

## Framework Extensibility

To modify test parameters:

1. **New Record Count**: Update `scripts/consts.ts` `RECORDS` constant, then `npm run generate`
2. **New Questions**: Edit question generators in `scripts/generators/`
3. **New Validation Method**: Update `scripts/validators/` logic
4. **New Metric**: Extend `scripts/analytics.ts` aggregation

---

## License

See root [LICENSE](./LICENSE) for details.

## Support

- **Issues**: [Report bugs or request features](https://github.com/thoeltig/claude-code-toolkit/issues)
- **Repository**: [claude-code-toolkit](https://github.com/thoeltig/claude-code-toolkit)

---

**Author**: [Thore Höltig](https://github.com/thoeltig)