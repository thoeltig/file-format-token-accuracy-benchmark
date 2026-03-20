/**
 * Benchmarking orchestrator
 * Main entry point for generating test data, questionnaires, and coordinating test execution
 */

import * as fs from "fs";
import * as path from "path";
import { convertToNestedObject, generateProductDataGenerator } from "./generators/generateProductDataGenerator";
import { convertToFormat } from "./converters/index";
import { generateQuestionnaire } from "./generators/questions";
import { validateAnswers } from "./validators/answerValidator";
import {
  Format,
  AnswerTemplate,
  ValidationReport,
  Question,
  QuestionnaireWithAnswers,
  ProvidedAnswer,
  GeneratedFiles,
  GeneratorResult
} from "./types";
import { 
  DIRECTORIES,
  DIRECTORY_DATA,
  DIRECTORY_SUBAGENT_OUTPUT,
  DIRECTORY_ANSWERS_VALIDATION,
  DIRECTORY_QUESTIONS,
  DIRECTORY_ANSWERS_TEMPLATE,
  DIRECTORY_RESULTS,
  FORMATS,
  FILE_METADATA,
  RECORD_COUNT,
  VARIANTS
 } from "./consts";

export class BenchmarkingOrchestrator {
  private outputDir: string;

  constructor(outputDir: string = "benchmarking") {
    this.outputDir = outputDir;
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    let fullPath:string;
    for (const dir of DIRECTORIES) {
      fullPath = path.join(this.outputDir, dir);
      this.createDirectory(fullPath);
    }
    
    for (const format of FORMATS) {
      fullPath = path.join(this.outputDir, DIRECTORY_DATA, format);
      this.createDirectory(fullPath);
      
      fullPath = path.join(this.outputDir, DIRECTORY_SUBAGENT_OUTPUT, format);
      this.createDirectory(fullPath);
    }
  }

  private createDirectory(fullPath: string){
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }

  /**
   * Generate all test data and questionnaires
   */
  public generateAllTestData(): GeneratorResult {
    const filesCreated: GeneratedFiles[] = [];

    for(const allFieldsManadatory of VARIANTS) {
      const fieldsMandatoryText = allFieldsManadatory ? 'mandatory' : 'optional';
      console.log(`Generating test data with ${RECORD_COUNT} records per file and all data ${fieldsMandatoryText}...\n`);

      // Generate data
      const dataToUse = generateProductDataGenerator(RECORD_COUNT, allFieldsManadatory);
      const recordCount = dataToUse.records.length;
      
      // Generate questionnaire
      const answersAndQuestions = generateQuestionnaire(dataToUse);
      
      const answersAndQuestionsFileName = `questions_and_answers_with_${fieldsMandatoryText}_${recordCount}_records.json`;
      const answersAndQuestionsFilePath = path.join(this.outputDir, DIRECTORY_ANSWERS_VALIDATION, answersAndQuestionsFileName);
      const questionnaireFileName = `questions_with_${fieldsMandatoryText}_${recordCount}_records.json`;
      const questionnaireFilePath = path.join(this.outputDir, DIRECTORY_QUESTIONS, questionnaireFileName);
      const answerTemplateFileName = `answers_with_${fieldsMandatoryText}_${recordCount}_records_template.json`;
      const answerTemplateFilePath = path.join(this.outputDir, DIRECTORY_ANSWERS_TEMPLATE, answerTemplateFileName);

      const questionaireWithAnswers: QuestionnaireWithAnswers = {
        metadata: {
          recordCount: dataToUse.metadata.recordCount,
          fieldCount: dataToUse.metadata.fieldCount,
          totalValues: dataToUse.metadata.totalValues,
          totalQuestions: answersAndQuestions.length,
          generatedAt: new Date().toISOString(),
          questionFilePath: questionnaireFilePath, 
          answerTemplateFilePath: answerTemplateFilePath        
        },
        answersAndQuestions: answersAndQuestions,
      }

      // Write answer and questions for validation
      fs.writeFileSync(answersAndQuestionsFilePath, JSON.stringify(questionaireWithAnswers));
      console.log(`✓ Questions and answers: ${answersAndQuestionsFilePath} (${answersAndQuestions.length} questions)`);

      // Write questions
      const questionsForTest = {
        instructions: `If you are asked for a single value like a text, number or count then set it as a string to the answer field like this: {"questionId":200,"answer":"value1"}. If you are asked for multiple values at the same time then set them as comma separated string to the answer field like this: {"questionId":201,"answer":"value1,value2,value3"}. IMPORTANT: When extracting dates, return them exactly as they appear in the data as plain text strings in YYYY-MM-DD format. Never convert to Date objects or perform any timezone operations.`,
        questions: answersAndQuestions.map<Question>(x => ({id: x.id, question: x.question}))
      }
      fs.writeFileSync(questionnaireFilePath, JSON.stringify(questionsForTest));
      console.log(`✓ Questions: ${questionnaireFileName} (${questionsForTest.questions.length} questions)`);
    
      // Generate empty answer template
      const answerTemplate: AnswerTemplate = {
        metadata: {
          format: "",
          questionsFilePath: questionnaireFilePath,
          dataFilePath: "",
        },
        answers: answersAndQuestions.map<ProvidedAnswer>((q) => ({questionId: q.id, answer: ""}))
      };
      fs.writeFileSync(answerTemplateFilePath, JSON.stringify(answerTemplate));
      console.log(`✓ Answer template: ${answerTemplateFileName}`);
      
      // Prepare result
      const generatedFiles: GeneratedFiles = {
        recordCount: RECORD_COUNT,
        fieldCount: dataToUse.metadata.fieldCount,
        totalValues: dataToUse.metadata.totalValues,
        questionCount: questionsForTest.questions.length,
        answersAndQuestionsForValidationFilePath: answersAndQuestionsFilePath,
        questionnaireFilePath: questionnaireFilePath, 
        answerTemplateFilePath: answerTemplateFilePath,
        dataAndOutput: []
      };

      // Generate array formats (without TOON_KEYFOLD because it has the same output as TOON_DEFAULT in flat structure)
      for (const format of FORMATS.filter(x => x !== 'toon_keyfold')) {
        console.log(`Generating ${format.toUpperCase()} file with ${fieldsMandatoryText} ${RECORD_COUNT} flat records`);

        // Convert to format
        const fileContent = convertToFormat(dataToUse, format);
        const fileExt = this.getFileExtension(format);
        const dataFileName = `${format}_with_${fieldsMandatoryText}_${recordCount}_flat_records.${fileExt}`;
        const dataFilePath = path.join(this.outputDir, DIRECTORY_DATA, format, dataFileName);
        const expectedOutputFilePath = path.join(this.outputDir, DIRECTORY_SUBAGENT_OUTPUT, format,`answers_with_${fieldsMandatoryText}_${recordCount}_flat_records.json`);
        fs.writeFileSync(dataFilePath, fileContent);
        const content = fs.readFileSync(dataFilePath, "utf-8"); // Read file again to get actual content size     
        const characterCount= content.length;

        console.log(`✓ Data: ${dataFileName} (${characterCount} chars, ${recordCount} flat data set rows and ${fieldsMandatoryText} data)`);

        // Track result
        generatedFiles.dataAndOutput.push({
          structure: "flat",
          format: format,
          allFieldsManadatory: allFieldsManadatory,
          dataFilePath: dataFilePath,
          expectedOutputFilePath: expectedOutputFilePath,
          metadata: {
            characterCount: characterCount,
            avgCharacterCountPerRecord: characterCount / generatedFiles.recordCount,
            avgCharacterCountPerValue: characterCount / generatedFiles.totalValues
          }
        });
      }
      
      // Generate nested formats (without CSV because it can not display nested structure)
      for (const format of FORMATS.filter(x => x !== "csv")) {
        console.log(`Generating ${format.toUpperCase()} file with ${fieldsMandatoryText} ${RECORD_COUNT} nested records`);

        // Convert to format
        const nestedObjects = convertToNestedObject(dataToUse);
        const fileContent = convertToFormat(nestedObjects, format);
        const characterCount = fileContent.length;
        const fileExt = this.getFileExtension(format);
        const dataFileName = `${format}_with_${fieldsMandatoryText}_${recordCount}_nested_records.${fileExt}`;
        const dataFilePath = path.join(this.outputDir, DIRECTORY_DATA, format, dataFileName);
        const expectedOutputFilePath = path.join(this.outputDir, DIRECTORY_SUBAGENT_OUTPUT, format,`answers_with_${fieldsMandatoryText}_${recordCount}_nested_records.json`);
        fs.writeFileSync(dataFilePath, fileContent);
        console.log(`✓ Data: ${dataFileName} (${characterCount} chars, ${recordCount} nested data set rows and ${fieldsMandatoryText} data)`);

        // Track result
        generatedFiles.dataAndOutput.push({
          structure: "nested",
          format: format,
          allFieldsManadatory: allFieldsManadatory,
          dataFilePath: dataFilePath,
          expectedOutputFilePath: expectedOutputFilePath,
          metadata: {
            characterCount: characterCount,
            avgCharacterCountPerRecord: characterCount / generatedFiles.recordCount,
            avgCharacterCountPerValue: characterCount / generatedFiles.totalValues
          }
        });
      }

      filesCreated.push(generatedFiles);
    }
    
    // Write metadata
    const results: GeneratorResult = {
      generatedAt: new Date().toISOString(),
      filesPerRecordCount: filesCreated
    };    
    const metadataPath = path.join(this.outputDir, FILE_METADATA);
    fs.writeFileSync(metadataPath, JSON.stringify(results));
    console.log(`Metadata written to ${metadataPath}`);

    return results;
  }

  
  /**
   * Validate answers from a test execution
   */
  public validateTestResults(
    subagentAnswerFilePath: string,
    metaDataFilePath: string
  ): ValidationReport {
    if (!fs.existsSync(subagentAnswerFilePath)) {
      throw new Error(`Answers file not found: ${subagentAnswerFilePath}`);
    }
    
    if (!fs.existsSync(metaDataFilePath)) {
      throw new Error(`Meta data file not found: ${metaDataFilePath}`);
    }

    const generatorResult = JSON.parse(fs.readFileSync(metaDataFilePath, "utf-8")) as GeneratorResult;
    
    let format: Format | undefined;
    let generatedFiles: GeneratedFiles | undefined;
    let questionaireWithAnswers: QuestionnaireWithAnswers | undefined;
    generatorResult.filesPerRecordCount.forEach((files) => {
        files.dataAndOutput.forEach((dataAndOutput) => {
          if(dataAndOutput.expectedOutputFilePath === subagentAnswerFilePath){
            generatedFiles = files;          
            format = dataAndOutput.format;
            questionaireWithAnswers = JSON.parse(fs.readFileSync(files.answersAndQuestionsForValidationFilePath, "utf-8")) as QuestionnaireWithAnswers;
          }
        });
    });

    if (!questionaireWithAnswers || !format || !generatedFiles) {
      throw new Error('Answers and questions for validation file not found. Provided subagent output filepath does not match expected output filepath in meta data file.');
    }

    const answerData = JSON.parse(fs.readFileSync(subagentAnswerFilePath, "utf-8")) as AnswerTemplate;

    const report = validateAnswers(format, answerData, questionaireWithAnswers.answersAndQuestions);

    // Write validation report
    const reportFileName = `${format}_${generatedFiles.recordCount}_validation.json`;
    const reportPath = path.join(this.outputDir, DIRECTORY_RESULTS, reportFileName);

    fs.writeFileSync(reportPath, JSON.stringify(report));

    return report;
  }

  private getFileExtension(format: Format): string {
    const extensions: Record<Format, string> = {
      csv: "csv",
      json_pretty: "json",
      json_compact: "json",
      toon_default: "toon",
      toon_keyfold: "toon",
      xml_pretty: "xml",
      xml_compact: "xml",
      yaml: "yaml",
    };
    return extensions[format];
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  let outputDir: string | undefined = "benchmarking";

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--output":
        outputDir = args[++i];
        break;
    }
  }

  if (!outputDir) {
    console.error("Usage: node dist/orchestrator.js --output <dir>");
    process.exit(1);
  }

  const orchestrator = new BenchmarkingOrchestrator(outputDir);

  const logSeparator = "=".repeat(60);
  console.log(`\n${logSeparator}`);
  console.log("BENCHMARKING FRAMEWORK - TEST DATA GENERATION");
  console.log(`${logSeparator}\n`);

  const results = orchestrator.generateAllTestData();

  if(!results || results.filesPerRecordCount.length === 0){
    console.log(`File generation failed..`);
  }else{
    console.log(`${logSeparator}`);
    const fileCount = FORMATS.length * VARIANTS.length;
    console.log(`Generated ${fileCount} dataset(s) with questionnaires`);
    console.log(`Output directory: ${outputDir}`);
    console.log(`${logSeparator}\n`);
  }
}

export default BenchmarkingOrchestrator;
