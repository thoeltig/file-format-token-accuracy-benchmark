/**
 * Core type definitions for benchmarking framework
 * Strong types, no `any` usage
 */

// ============================================================================
// DATA TYPES
// ============================================================================

export type Format = "csv" | "json_pretty" | "json_compact" | "toon_safe" | "toon_unsafe" | "xml_pretty" | "xml_compact" | "yaml";
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
  category: string;
  sku: string;
  manufacturerCode: string;
  avgRating?: number;
}

export interface ProductIdentity extends NestedSecondLevelDataRecord {
  productName: string;
  description: string;
  searchMetadata: SearchMetadata;
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
  [key: string]: ProductIdentity | Pricing | Inventory | Supplier | PhysicalCharacteristics | string | null | undefined;
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
}

export interface PerTestRunAnswerAccuracy extends AnswerAccuracy {
  run: number;
  accuracyPerCategory: CategoryAnswerAccuracy[];
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
  readDurationInMilliseconds: number;
  readTokens: number;
  reasoningDurationInMilliseconds: number;
  reasoningDurationDriftPercMin: number;
  reasoningDurationDriftPercMax: number;
  outputTokens: number;
  outputTokensDriftPercMin: number;
  outputTokensDriftPercMax: number;
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
    timestamp: string;
  };
  readOnlyTests: ReadOnlyAgentIdEntry[];
  fullTests: FullTestAgentIdEntry[];
}