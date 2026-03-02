"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Randomizer = void 0;
class Randomizer {
    rand;
    constructor(seed = 12345) {
        this.rand = this.seededRandom(seed);
    }
    getRandomNumber() {
        return this.rand();
    }
    seededRandom(seed) {
        let current = seed;
        return () => {
            current = (current * 9301 + 49297) % 233280;
            return current / 233280;
        };
    }
    getUniqueFieldsAndValues(values, count, fieldToSkip) {
        const map = new Map();
        let randomValues = this.getRandomItems(values, count);
        for (let i = 0; i < randomValues.length; i++) {
            const value = randomValues[i];
            let addValueToMap = false;
            for (let retryCount = 0; retryCount < 3; retryCount++) {
                const field = this.getRandomField(value, fieldToSkip);
                addValueToMap = map.get(field) ? false : true;
                if (addValueToMap) {
                    map.set(field, value);
                    break;
                }
            }
            if (!addValueToMap) {
                i--;
            }
        }
        return map;
    }
    getUniqueNumericFieldsAndValues(values, count, fieldToSkip) {
        const map = new Map();
        let randomValues = this.getRandomItems(values, count);
        for (let i = 0; i < randomValues.length; i++) {
            const value = randomValues[i];
            let addValueToMap = false;
            for (let retryCount = 0; retryCount < 3; retryCount++) {
                const field = this.getRandomNumbericField(value, fieldToSkip);
                addValueToMap = map.get(field) ? false : true;
                if (addValueToMap) {
                    map.set(field, value);
                    break;
                }
            }
            if (!addValueToMap) {
                i--;
            }
        }
        return map;
    }
    getRandomItem(arr) {
        return arr[Math.floor(this.rand() * arr.length)];
    }
    getRandomItems(arr, count) {
        if (count >= arr.length) {
            return arr;
        }
        const max = Math.min(arr.length, count);
        const result = new Set();
        for (let i = 0; result.size < max; i++) {
            result.add(this.getRandomItem(arr));
        }
        return [...result];
    }
    getRandomFields(obj, fieldToSkip, maxCount = 7) {
        const fields = this.getFieldsAndSkip(obj, fieldToSkip);
        const fieldCountToUse = this.randomInt(2, maxCount);
        return this.getRandomItems(fields, fieldCountToUse);
    }
    getRandomField(obj, fieldToSkip) {
        const fields = this.getFieldsAndSkip(obj, fieldToSkip);
        return this.getRandomItem(fields);
    }
    getRandomNumbericField(obj, fieldToSkip) {
        const fields = this.getFieldsAndSkip(obj, fieldToSkip).filter(field => typeof obj[field] === 'number');
        return this.getRandomItem(fields);
    }
    getFieldsAndSkip(obj, fieldToSkip) {
        const fields = this.getFields(obj);
        return fieldToSkip ? fields.filter((field) => field !== fieldToSkip) : fields;
    }
    getFields(obj) {
        return Object.keys(obj).filter((field) => obj[field] !== null && obj[field] !== undefined);
    }
    randomInt(min, max) {
        return Math.floor(this.rand() * (max - min + 1)) + min;
    }
    randomFloat(min, max, decimals = 2) {
        return Math.round((this.rand() * (max - min) + min) * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
    generateDate(daysAgo = 365) {
        const date = new Date();
        date.setDate(date.getDate() - this.randomInt(0, daysAgo));
        return date.toISOString().split("T")[0];
    }
}
exports.Randomizer = Randomizer;
