"use strict";
/**
 * Questionnaire generator
 * Generates paired questions from dataset with deterministic answers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuestionnaire = exports.QuestionnaireGenerator = void 0;
const consts_1 = require("../consts");
const randomizer_1 = require("./randomizer");
class QuestionnaireGenerator {
    rand;
    constructor(seed = 12345) {
        this.rand = new randomizer_1.Randomizer(seed);
    }
    generate(data) {
        const productIdField = "productId";
        const ctx = {
            data,
            records: data.records
        };
        const answersAndQuestions = [];
        let id = 1;
        // Generate questions per category
        let entries = this.generateFieldRetrievalQuestions(ctx, consts_1.QUESTIONS_DISTRIBUTION.field_retrieval, id, productIdField);
        answersAndQuestions.push(...entries);
        id += entries.length;
        console.log("Retrival questions: " + entries.length);
        entries = this.generateFilteringQuestions(ctx, consts_1.QUESTIONS_DISTRIBUTION.filtering, id, productIdField);
        answersAndQuestions.push(...entries);
        id += entries.length;
        console.log("Filtering questions: " + entries.length);
        entries = this.generateAggregationQuestions(ctx, consts_1.QUESTIONS_DISTRIBUTION.aggregation, id, productIdField);
        answersAndQuestions.push(...entries);
        id += entries.length;
        console.log("Aggregation questions: " + entries.length);
        entries = this.generateStructureAwarenessQuestions(ctx, consts_1.QUESTIONS_DISTRIBUTION.structure_awareness, id);
        answersAndQuestions.push(...entries);
        id += entries.length;
        console.log("Structure questions: " + entries.length);
        console.log("Total questions: " + answersAndQuestions.length);
        return answersAndQuestions;
    }
    generateFieldRetrievalQuestions(ctx, count, startId, idField) {
        const questions = [];
        if (count < 0) {
            return questions;
        }
        const splitCount = Math.ceil(count / 3);
        const remainingCount = count - splitCount * 2;
        const map = this.rand.getUniqueFieldsAndValues(ctx.records, splitCount, idField);
        map.forEach((record, field) => {
            const value = record[field];
            startId++;
            questions.push({
                id: startId,
                category: "field_retrieval",
                difficulty: "easy",
                question: `What is the ${this.splitCamelCase(field)} of product ${record[idField]}?`,
                expectedAnswer: {
                    value: String(value),
                    validationMethod: "exact",
                },
                dataReferences: [field, idField],
            });
        });
        let records = this.rand.getRandomItems(ctx.records, splitCount);
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const radomFields = this.rand.getRandomFields(record, idField);
            const values = this.getValues(record, radomFields);
            startId++;
            questions.push({
                id: startId,
                category: "field_retrieval",
                difficulty: "medium",
                question: `What are the ${this.splitMultipleCamelCases(radomFields)} of product ${record[idField]}?`,
                expectedAnswer: {
                    value: values,
                    validationMethod: "array_set",
                },
                dataReferences: [...radomFields, idField],
            });
        }
        let doubleAmount = remainingCount * 2;
        if (doubleAmount > ctx.records.length) {
            doubleAmount = ctx.records.length;
        }
        if (doubleAmount % 2 !== 0) {
            doubleAmount--;
        }
        records = this.rand.getRandomItems(ctx.records, doubleAmount);
        for (let i = 0; i < records.length; i += 2) {
            const record = records[i];
            const radomFields = this.rand.getRandomFields(record, idField);
            const values = this.getValues(record, radomFields);
            const record2 = records[(i + 1)];
            const radomFields2 = this.rand.getRandomFields(record2, idField);
            const values2 = this.getValues(record2, radomFields2);
            startId++;
            questions.push({
                id: startId,
                category: "field_retrieval",
                difficulty: "hard",
                question: `What are the ${this.splitMultipleCamelCases(radomFields)} of product ${record[idField]} and the ${this.splitMultipleCamelCases(radomFields2)} of product ${record2[idField]}?`,
                expectedAnswer: {
                    value: [...values, ...values2],
                    validationMethod: "array_set",
                },
                dataReferences: [...new Set([...radomFields, ...radomFields2]), idField],
            });
        }
        return questions;
    }
    generateAggregationQuestions(ctx, count, startId, idField) {
        const questions = [];
        if (count < 0) {
            return questions;
        }
        const splitCount = Math.ceil(count / 3); // sum, min/max, avg
        const remainingCount = count - splitCount * 2;
        let map = this.rand.getUniqueNumericFieldsAndValues(ctx.records, splitCount, idField);
        map.forEach((_, numericField) => {
            const expectedSum = ctx.records.reduce((sum, r) => sum + Number(r[numericField] || 0), 0);
            startId++;
            questions.push({
                id: startId,
                category: "aggregation",
                difficulty: "easy",
                question: `How much is the sum of all values in ${this.splitCamelCase(numericField)} across all products?`,
                expectedAnswer: {
                    value: expectedSum,
                    validationMethod: "numeric",
                    tolerance: 0.1,
                },
                dataReferences: [numericField],
            });
        });
        let i = 0;
        map = this.rand.getUniqueNumericFieldsAndValues(ctx.records, splitCount, idField);
        map.forEach((_, numericField) => {
            const isMin = (i++) % 2;
            var numbers = ctx.records.map((r) => Number(r[numericField] || 0));
            const expected = isMin ? Math.min(...numbers) : Math.max(...numbers);
            startId++;
            questions.push({
                id: startId,
                category: "aggregation",
                difficulty: "medium",
                question: `What is the ${isMin ? 'lowest' : 'highest'} value in ${this.splitCamelCase(numericField)} across all products?`,
                expectedAnswer: {
                    value: expected,
                    validationMethod: "numeric",
                    tolerance: 0,
                },
                dataReferences: [numericField],
            });
        });
        map = this.rand.getUniqueNumericFieldsAndValues(ctx.records, remainingCount, idField);
        map.forEach((_, numericField) => {
            const expectedAvg = ctx.records.reduce((sum, r) => sum + Number(r[numericField] || 0), 0) / ctx.records.length;
            startId++;
            questions.push({
                id: startId,
                category: "aggregation",
                difficulty: "hard",
                question: `What is the average value in ${this.splitCamelCase(numericField)} across all products?`,
                expectedAnswer: {
                    value: Math.round(expectedAvg * 100) / 100,
                    validationMethod: "numeric",
                    tolerance: 0.1,
                },
                dataReferences: [numericField],
            });
        });
        return questions;
    }
    generateFilteringQuestions(ctx, count, startId, idField) {
        const questions = [];
        if (count < 0) {
            return questions;
        }
        const splitCount = Math.ceil(count / 3); // equal, above/belowe avg, equal + above/belowe avg
        const remainingCount = count - splitCount * 2;
        let map = this.rand.getUniqueFieldsAndValues(ctx.records, splitCount);
        map.forEach((record, field) => {
            const value = record[field];
            const expectedCount = ctx.records.filter(x => x[field] === value).length;
            startId++;
            questions.push({
                id: startId,
                category: "filtering",
                difficulty: "easy",
                question: `How many products have '${value}' in ${this.splitCamelCase(field)}?`,
                expectedAnswer: {
                    value: expectedCount,
                    validationMethod: "numeric",
                    tolerance: 0,
                },
                dataReferences: [field],
            });
        });
        let i = 0;
        map = this.rand.getUniqueNumericFieldsAndValues(ctx.records, splitCount, idField);
        map.forEach((_, numericField) => {
            const filterForAbove = (i++) % 2 === 0;
            const avg = Math.round((ctx.records.reduce((sum, r) => sum + Number(r[numericField] || 0), 0) / ctx.records.length) * 100) / 100;
            const expectedCount = ctx.records.filter((r) => {
                const num = Number(r[numericField] || 0);
                return filterForAbove ? num > avg : num < avg;
            }).length;
            startId++;
            questions.push({
                id: startId,
                category: "filtering",
                difficulty: "medium",
                question: `How many products have a value ${filterForAbove ? 'above' : 'belowe'} the average of ${avg} in ${this.splitCamelCase(numericField)}?`,
                expectedAnswer: {
                    value: expectedCount,
                    validationMethod: "numeric",
                    tolerance: 0,
                },
                dataReferences: [numericField],
            });
        });
        map = this.rand.getUniqueNumericFieldsAndValues(ctx.records, remainingCount, idField);
        map.forEach((record, numericField) => {
            const filterForAbove = (i++) % 2 === 0;
            const field = this.rand.getRandomField(record, idField);
            const value = record[field];
            const filtered = ctx.records.filter(x => x[field] === value);
            const avg = Math.round((ctx.records.reduce((sum, r) => sum + Number(r[numericField] || 0), 0) / filtered.length) * 100) / 100;
            const expectedCount = filtered.filter((r) => {
                const num = Number(r[numericField] || 0);
                return filterForAbove ? num > avg : num < avg;
            }).length;
            startId++;
            questions.push({
                id: startId,
                category: "filtering",
                difficulty: "hard",
                question: `How many products have '${value}' in ${this.splitCamelCase(field)} and a value ${filterForAbove ? 'above' : 'belowe'} the average of ${avg} in ${this.splitCamelCase(numericField)}?`,
                expectedAnswer: {
                    value: expectedCount,
                    validationMethod: "numeric",
                    tolerance: 0,
                },
                dataReferences: [field, numericField],
            });
        });
        return questions;
    }
    generateStructureAwarenessQuestions(ctx, count, startId) {
        const questions = [];
        if (count < 0) {
            return questions;
        }
        let remainingCount = count;
        const totalRows = ctx.records.length;
        let countOfSetValues = 0;
        const fieldHistogram = new Map();
        ctx.records.forEach(r => {
            this.rand.getFields(r).forEach(f => {
                fieldHistogram.set(f, (fieldHistogram.get(f) || 0) + 1);
                countOfSetValues++;
            });
        });
        let mandatoryFieldCount = 0;
        const fieldsPerOccurence = new Map();
        fieldHistogram.forEach((value, key) => {
            var arr = (fieldsPerOccurence.get(value) || []);
            arr.push(key);
            fieldsPerOccurence.set(value, arr);
            if (value > mandatoryFieldCount) {
                mandatoryFieldCount = value;
            }
        });
        let totalUniqueFieldCount = fieldHistogram.size;
        const optionalFields = new Set();
        const mandatoryFields = new Set();
        fieldsPerOccurence.forEach((value, key) => {
            if (key < mandatoryFieldCount) {
                value.forEach(v => optionalFields.add(v));
            }
            else {
                value.forEach(v => mandatoryFields.add(v));
            }
        });
        if (remainingCount > 0) {
            startId++;
            remainingCount--;
            questions.push({
                id: startId,
                category: "structure_awareness",
                difficulty: "medium",
                question: `How many entries are in the data in total?`,
                expectedAnswer: {
                    value: totalRows,
                    validationMethod: "numeric",
                }
            });
        }
        if (remainingCount > 0) {
            startId++;
            remainingCount--;
            questions.push({
                id: startId,
                category: "structure_awareness",
                difficulty: "medium",
                question: `How many values are in the data in total?`,
                expectedAnswer: {
                    value: totalRows * totalUniqueFieldCount,
                    validationMethod: "numeric",
                }
            });
        }
        if (remainingCount > 0) {
            startId++;
            remainingCount--;
            questions.push({
                id: startId,
                category: "structure_awareness",
                difficulty: "medium",
                question: `How many values are set in the data in total?`,
                expectedAnswer: {
                    value: countOfSetValues,
                    validationMethod: "numeric",
                }
            });
        }
        if (remainingCount > 0) {
            startId++;
            remainingCount--;
            questions.push({
                id: startId,
                category: "structure_awareness",
                difficulty: "medium",
                question: `How many values are not set in the data in total?`,
                expectedAnswer: {
                    value: (totalRows * totalUniqueFieldCount) - countOfSetValues,
                    validationMethod: "numeric",
                }
            });
        }
        if (remainingCount > 0) {
            startId++;
            remainingCount--;
            questions.push({
                id: startId,
                category: "structure_awareness",
                difficulty: "medium",
                question: `How many unique fields names are in the data in total?`,
                expectedAnswer: {
                    value: totalUniqueFieldCount,
                    validationMethod: "numeric",
                }
            });
        }
        if (remainingCount > 0) {
            startId++;
            remainingCount--;
            questions.push({
                id: startId,
                category: "structure_awareness",
                difficulty: "medium",
                question: `What are all the unique field names across all products?`,
                expectedAnswer: {
                    value: [...fieldHistogram.keys()],
                    validationMethod: "array_set",
                }
            });
        }
        if (remainingCount > 0) {
            startId++;
            remainingCount--;
            questions.push({
                id: startId,
                category: "structure_awareness",
                difficulty: "medium",
                question: `What are all the optional field names across all products?`,
                expectedAnswer: {
                    value: [...optionalFields],
                    validationMethod: "array_set",
                }
            });
        }
        if (remainingCount > 0) {
            startId++;
            remainingCount--;
            questions.push({
                id: startId,
                category: "structure_awareness",
                difficulty: "medium",
                question: `What are all the mandatory field names across all products?`,
                expectedAnswer: {
                    value: [...mandatoryFields],
                    validationMethod: "array_set",
                }
            });
        }
        const map = this.rand.getUniqueFieldsAndValues(ctx.records, remainingCount);
        map.forEach((_, field) => {
            const expectedArray = Array.from(new Set(ctx.records.map((r) => String(r[field] || "")).filter(f => f !== "")));
            startId++;
            questions.push({
                id: startId,
                category: "structure_awareness",
                difficulty: "hard",
                question: `What are all the unique values in ${this.splitCamelCase(field)} across all products?`,
                expectedAnswer: {
                    value: expectedArray,
                    validationMethod: "array_set",
                },
                dataReferences: [field]
            });
        });
        return questions;
    }
    getValues(record, fields) {
        const values = [];
        fields.forEach(field => {
            const value = record[field];
            return values.push(value ? value.toString() : '');
        });
        return values;
    }
    splitMultipleCamelCases(fields) {
        return fields.map(x => this.splitCamelCase(x)).join(", ");
    }
    splitCamelCase(field) {
        return field
            .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
            .replace(/([a-z\d])([A-Z])/g, "$1 $2")
            .toLowerCase();
    }
}
exports.QuestionnaireGenerator = QuestionnaireGenerator;
function generateQuestionnaire(data) {
    const generator = new QuestionnaireGenerator();
    return generator.generate(data);
}
exports.generateQuestionnaire = generateQuestionnaire;
