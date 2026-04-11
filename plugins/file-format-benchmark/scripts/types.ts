/**
 * Core type definitions for benchmarking framework
 * Strong types, no `any` usage
 */

// ============================================================================
// DATA TYPES
// ============================================================================

export type Format = "csv" | "json_pretty" | "json_compact" | "toon_default" | "toon_keyfold" | "xml_pretty" | "xml_compact" | "yaml";
export type Directory = "data" | "answers_validation" | "questions" | "answers_template" | "subagent_outputs" | "results";
export type QuestionCategory = "field_retrieval" | "aggregation" | "filtering" | "structure_awareness";

export interface MetadataFlatArray {
  generatedAt: string,
  description: string,
  fieldCount: number,
  recordCount: number,
  totalValues: number,
}

export interface MetadataNetsedObject extends MetadataFlatArray {
  nestingLevels: number,
}

export interface ValuesMetadata {
  fieldCount: number,
  recordCount: number,
  totalValues: number,
}

export interface CharacterMetadata {
  characterCount: number,
  avgCharacterCountPerValue: number,
  avgCharacterCountPerRecord: number,
}

export interface ProductRecord extends DataRecord {
  productId: string;
  productName: string;
  category: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  reorderPoint: number;
  lastRestocked: string;
  supplierName: string;
  supplierLocation: string;
  description: string;
  sku: string;
  manufacturerCode: string;
  warehouseLocation: string;
  weight: number;
  dimensions: string;
  hazardous: boolean;
  fragile: boolean;
  unitsShipped: number;
  avgRating?:number;
  shelfLife?:number;
  discontinuedDate?:string;
}

export interface SearchMetadata extends DataRecord{
  sku: string;
  manufacturerCode: string;
}

export interface UserRanking extends DataRecord{
  // This object with two fields (one optional) exists only to comare TOON default and kefolding
  category: string;
  avgRating?: number;
}

export interface ProductIdentity extends NestedSecondLevelDataRecord {
  productName: string;
  searchMetadata: SearchMetadata;
}

export interface ProductAdditionalInfo extends DataRecord {
  // This object with two fields (one optional) exists only to comare TOON default and kefolding
  description: string;
}

export interface Pricing extends DataRecord {
  price: number;
  costPrice: number;
}

export interface InventoryStats extends DataRecord {
  reorderPoint: number;
  lastRestocked: string;
  unitsShipped: number;
}

export interface Inventory extends NestedSecondLevelDataRecord {
  stockQuantity: number;
  warehouseLocation: string;
  stats: InventoryStats;
}

export interface Supplier extends DataRecord {
  supplierName: string;
  supplierLocation: string;
}

export interface PhysicalCharacteristics extends DataRecord {
  weight: number;
  dimensions: string;
  hazardous: boolean;
  fragile: boolean;
  shelfLife?: number;
}

export interface NestedProductRecord extends NestedFirstLevelDataRecord {
  productId: string;
  discontinuedDate?: string;
  identity: ProductIdentity;
  additionalInfo: ProductAdditionalInfo;
  userRanking: UserRanking;
  pricing: Pricing;
  inventory: Inventory;
  supplier: Supplier;
  physical: PhysicalCharacteristics;
}

export interface DataRecord {
  [key: string]: string | number | boolean | null | undefined;
}

export interface NestedSecondLevelDataRecord {
  [key: string]: InventoryStats | SearchMetadata | number | string | null | undefined;
}

export interface NestedFirstLevelDataRecord {
  [key: string]: ProductIdentity | Pricing | Inventory | Supplier | PhysicalCharacteristics | UserRanking | ProductAdditionalInfo | string | null | undefined;
}

export interface FlatArrayDataSet {
  metadata: MetadataFlatArray;
  records: ProductRecord[];
}

export interface NestedDataSet {
  metadata: MetadataNetsedObject;
  records: NestedProductRecord[];
}

// ============================================================================
// QUESTION & ANSWER TYPES
// ============================================================================

export type AnswerValidationMethod = "exact" | "numeric" | "array_set";

export interface QuestionExpectedAnswer {
  value: string | number | string[] | boolean;
  validationMethod: AnswerValidationMethod;
  tolerance?: number; // For numeric answers
  keywords?: string[]; // For fuzzy deduction
}

export interface Question {
  id: number;
  question: string;
}

export interface AnswerAndQuestion extends Question {
  category: QuestionCategory;
  difficulty: "easy" | "medium" | "hard";
  expectedAnswer: QuestionExpectedAnswer;
  dataReferences?: string[]; // Which data fields this question uses
  requiresManualReview?: boolean; // True for deduction questions
}

export interface BaseQuestionnaire {
  metadata: {
    recordCount: number,
    fieldCount: number,
    totalValues: number,
    totalQuestions: number;
    generatedAt: string;
    questionFilePath: string;
    answerTemplateFilePath: string;
  };
}

export interface QuestionnaireWithAnswers extends BaseQuestionnaire {
  answersAndQuestions: AnswerAndQuestion[];
}

export interface Questionnaire extends BaseQuestionnaire {
  questions: Question[];
}

export interface ProvidedAnswer {
  questionId: number;
  answer: string | number | string[] | boolean;
}

export interface AnswerTemplate {
  metadata: {
    format: string,
    questionsFilePath: string;
    dataFilePath: string;
  };
  answers: ProvidedAnswer[];
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  questionId: number;
  question: string;
  givenAnswer: string | number | string[] | boolean;
  expectedAnswer: string | number | string[] | boolean;
  correct: boolean;
  category: QuestionCategory;
  method: AnswerValidationMethod;
}

export interface ValidationReport {
  format: Format;
  totalQuestions: number;
  results: ValidationResult[];
  accuracy: {
    correct: number;
    incorrect: number;
    accuracyPercent: number;
    weightedAccuracyPercent: number;  
  };
  charactersOfAnswers: CharactersOfAnswers;
  accuracyPerCategory: CategoryAnswerAccuracy[];
}

export interface MergedValidationReport {
  format: Format;
  structure: string;
  variant: string;
  recordCount: number;
  testRuns: number;
  totalQuestions: number;
  accuracy: AvgAnswerAccuracy;
  perRunAccuracy: PerTestRunAnswerAccuracy[];
  questionsAndProvidedAnswers: QuestionsAndProvidedAnswers[];
}

export interface AvgAnswerAccuracy extends AnswerAccuracy{
  accuracyDriftPercMin: number;
  accuracyDriftPercMax: number;
  weightedAccuracyDriftPercMin: number;
  weightedAccuracyDriftPercMax: number;
  charactersOfAnswers: ExtendedCharactersOfAnswers;
}

export interface AnswerAccuracy {
  correct: number;
  incorrect: number;
  accuracyPercent: number;  
  weightedAccuracyPercent: number;  
}

export interface CategoryAnswerAccuracy extends AnswerAccuracy {
  category: QuestionCategory;
  unanswered: number;  
  charactersOfAnswers: CharactersOfAnswers;
}

export interface PerTestRunAnswerAccuracy extends AnswerAccuracy {
  run: number;
  accuracyPerCategory: CategoryAnswerAccuracy[];    
  charactersOfAnswers: CharactersOfAnswers;
}

export interface ExtendedCharactersOfAnswers extends CharactersOfAnswers{
    accuracyByCharDriftPercMin: number;
    accuracyByCharDriftPercMax: number;
}

export interface CharactersOfAnswers {
  // The count of characters in the original answers
  expected: number;
  // The count of correct characters in the given answers
  correct: number;
  // The count of incorrect and missing characters in the given answers
  incorrect: number;
  // The sum of correct, incorrect and missing characters in the given answers
  total: number;  
  // The by char accuracy is calculated 'correct / total' because
  accuracyByCharPerc: number;
}

export interface QuestionsAndProvidedAnswers {
  questionId: number;
  category: QuestionCategory;
  question: string;
  expectedAnswer: string | number | string[] | boolean;
  answers:ModelAnswer[];
}

export interface ModelAnswer {
  givenAnswer: string | number | string[] | boolean;
  correct: boolean;
}

// ============================================================================
// TEST EXECUTION TYPES
// ============================================================================

export interface TokenCount {
  beforeReading: number;
  afterReading: number;
  afterAnswering: number;
  tokensUsedForReading: number;
  tokensUsedForAnswering: number;
  totalTokensUsed: number;
}

export interface TestScenario {
  scenario: "original" | "minified" | "minified_json";
  description: string;
  filePath: string;
  questionnaireFile: string;
  answerTemplateFile: string;
}

export interface TestExecution {
  format: Format;
  scenario: TestScenario;
  timestamp: string;
  tokens: TokenCount;
  validation: ValidationReport;
}

export interface TestRun {
  metadata: {
    generatedAt: string;
    formats: Format[];
    totalTests: number;
  };
  executions: TestExecution[];
  summary: TestSummary;
}

// ============================================================================
// SUMMARY & RESULTS TYPES
// ============================================================================

export interface FormatSummary {
  format: Format;
  densities: {
    [key in string]: ScenarioSummary;
  };
}

export interface ScenarioSummary {
  scenario: "original" | "minified" | "minified_json";
  accuracy: number; // 0-100
  tokenUsed: number;
  charCount: number;
  tokensPerChar: number;
  avgResponseTimeMs?: number;
}

export interface TestSummary {
  totalTests: number;
  completedTests: number;
  manualReviewsNeeded: number;
  formatPerformance: FormatSummary[];
  recommendations: string[];
}

// ============================================================================
// GENERATOR CONFIGURATION
// ============================================================================

export interface GeneratorResult {
  generatedAt: string;
  filesPerRecordCount: GeneratedFiles[];
}

export interface GeneratedFiles{
  recordCount: number;
  fieldCount: number,
  totalValues: number,
  questionCount: number;
  answersAndQuestionsForValidationFilePath: string;
  questionnaireFilePath: string;
  answerTemplateFilePath: string;
  dataAndOutput: DataAndOutput[];
}

export interface DataAndOutput{
  structure: string,
  format: Format;
  allFieldsManadatory: boolean;
  dataFilePath: string;
  metadata: CharacterMetadata;
  expectedOutputFilePath: string;
}

// ============================================================================
// Token usage extraction
// ============================================================================

export interface UserMetrics {
  testCase: string;
  format: string;
  structure: string;
  variant: string;
  recordCount: number;
  hasOptionalData: boolean;
  readDurationInMs: number;
  readTokens: number;
  outputDurationBeforeWriteInMs: number;
  outputDurationBeforeWriteDriftPercMin: number;
  outputDurationBeforeWriteDriftPercMax: number;
  outputDurationWriteInMs: number;
  outputDurationWriteDriftPercMin: number;
  outputDurationWriteDriftPercMax: number;
  outputDurationTotalInMs: number;
  outputDurationTotalDriftPercMin: number;
  outputDurationTotalDriftPercMax: number;
  outputTokensBeforeWrite: number;
  outputTokensBeforeWriteDriftPercMin: number;
  outputTokensBeforeWriteDriftPercMax: number;
  outputTokensWrite: number;
  outputTokensWriteDriftPercMin: number;
  outputTokensWriteDriftPercMax: number;
  outputTokensTotal: number;
  outputTokensTotalDriftPercMin: number;
  outputTokensTotalDriftPercMax: number;  
  // The total sum of read and output tokens
  totalTokens: number;
  totalTokensDriftPercMin: number;
  totalTokensDriftPercMax: number;
}

// ============================================================================
// Agent id extraction
// ============================================================================

export interface AgentIdEntry {
  format: string;
  structure: string;
  variant: string;
  recordCount: number;
  agentId: string;
  timestamp: string;
}

export interface ReadOnlyAgentIdEntry extends AgentIdEntry {
}

export interface FullTestAgentIdEntry extends AgentIdEntry {
  testRun: number;
}

export interface AgentIdsFile {
  testConfiguration: {
    formats: string[];
    variants: string[];
    model: string;
    thinking: string;
    structure: string;
    timestamp: string;
  };
  readOnlyTests: ReadOnlyAgentIdEntry[];
  fullTests: FullTestAgentIdEntry[];
}

// ============================================================================
// Analytics
// ============================================================================

export interface Metrics {
  format: string;
  variant: string;
  recordCount: number;

  // Read-Only extraction script result
  readTokens: number;
  readDurationInMs: number;
  readTokensPerMs: number;
  
  // Full test extraction script result
  outputTokensBeforeWrite: number;
  outputTokensBeforeWriteDriftPercMin: number;
  outputTokensBeforeWriteDriftPercMax: number;
  outputTokensWrite: number;
  outputTokensWriteDriftPercMin: number;
  outputTokensWriteDriftPercMax: number;
  outputTokensTotal: number;
  outputTokensTotalDriftPercMin: number;
  outputTokensTotalDriftPercMax: number;

  outputDurationBeforeWriteInMs: number;
  outputDurationBeforeWriteDriftPercMin: number;
  outputDurationBeforeWriteDriftPercMax: number;
  outputDurationWriteInMs: number;
  outputDurationWriteDriftPercMin: number;
  outputDurationWriteDriftPercMax: number;
  outputDurationTotalInMs: number;
  outputDurationTotalDriftPercMin: number;
  outputDurationTotalDriftPercMax: number;
  
  outputTokensBeforeWritePerMs: number;
  outputTokensWritePerMs: number;
  outputTokensTotalPerMs: number;

  // Validation script result
  totalQuestions: number;
  noAnswers: number;
  incorrectAnswers: number;
  correctAnswers: number;
  accuracyPercent: number;
  accuracyDriftPercentMin: number;
  accuracyDriftPercentMax: number;
  weightedAccuracyPercent: number;
  weightedAccuracyDriftPercentMin: number;
  weightedAccuracyDriftPercentMax: number;

  // Calculated metrics section

  // This is only interesting to see how the conversion rate from characters to tokens is.
  charsPerReadToken: number;
  // Information efficiency: tokens needed per data value. Lower is better - represents how densely packed the format is.
  readTokensPerValue: number;  
  // Information efficiency: tokens needed per object. Lower is better - accounts for structural overhead.
  readTokensPerObject: number; 
  // Reasoning cost per question answered. Indicates how complex the reasoning task is for this format
  outputTokensWritePerAnswer: number;
  // Represents information density: how much accuracy per token consumed. Higher values indicate more information delivered per token.
  informationValuePerReadTokens: number;
  informationValuePerOutputTokens: number;
  informationValuePerTotalTokens: number;

  // Reading + output tokens
  totalTokens: number;
  totalTokensDriftPercMin: number;
  totalTokensDriftPercMax: number;

  // Results

  // Tokens wasted on inaccurate output that increases context pollution. Higher values indicate format reliability risk.
  wastedReadTokens: number;
  wastedOutputTokens: number;
  wastedTotalTokens: number;
  // Effective tokens: assumes lower accuracy wastes tokens. Accounts for format quality via accuracy percentage.
  usefulReadTokens: number;
  usefulOutputTokens: number;
  usefulTotalTokens: number;
  
  // Same as above but weighted by question importance: field retrieval and structure awareness questions weighted higher than aggregation and filtering.
  weightedWastedReadTokens: number;
  weightedWastedOutputTokens: number;
  weightedWastedTotalTokens: number;
  weightedUsefulReadTokens: number;
  weightedUsefulOutputTokens: number;
  weightedUsefulTotalTokens: number;

  // Combined score (0-100): accuracy weighted 70% + token efficiency weighted 30%.
  // Prioritizes correctness over token usage - a format that is accurate is preferred because inaccuracy will lead to multiple reads and more reasoning.
  // normalizedAmountScore: lower token usage = higher score (max tokens used = 0, min tokens used = 100).
  efficiencyScoreRead: number;
  efficiencyScoreOutput: number;
  efficiencyScoreTotal: number;
  // Same scoring as efficiencyScore but uses weighted accuracy: field retrieval and structure awareness answers count more than aggregation and filtering
  weightedEfficiencyScoreRead: number;
  weightedEfficiencyScoreOutput: number;
  weightedEfficiencyScoreTotal: number;
  
  // Tokens wasted or effictively used but not by overall accuracy but by per character of output correctness. This can only be applied to the actual output write tokens.
  accuracyByCharPerc: number;
  accuracyByCharDriftPercMin: number;
  accuracyByCharDriftPercMax: number;
  wastedOutputWriteTokensByCharAccuracy: number;
  usefulOutputWriteTokensByCharAccuracy: number;
  efficiencyScoreOutputWriteTokensByCharAccuracy: number;
}

export interface TestMetrics extends Metrics {
  testCase: string;
  hasOptionalData: boolean;
  totalValues: number;
  characterCount: number;
}

export interface AnalyticsOutput {
  timestamp: string;
  testConfigurations: {
    metadataFile: string;
    agentIdsFile: string;
    metricsFile: string;
    model: string;
    thinking: string;
    structure: string;
    formats: string[];
    variants: string[];
    recordCounts: number[];
    questionDistribution: [QuestionCategory, number][];
    questionWeightDistribution: [QuestionCategory, number][];
  };
  metrics: TestMetrics[];
}