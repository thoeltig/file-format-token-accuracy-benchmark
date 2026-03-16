"use strict";
/**
 * Base data model generator
 * Generates product catalog dataset
 * Can be converted to all target formats
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToNestedObject = exports.generateProductDataGenerator = exports.ProductDataGenerator = void 0;
const productRecordRandomizer_1 = require("./productRecordRandomizer");
class ProductDataGenerator {
    data;
    constructor(seed = 12345) {
        this.data = new productRecordRandomizer_1.ProductRecordRandomizer(seed);
    }
    generate(recordCount, allFieldsManadatory) {
        const records = [];
        let recordIndex = 0;
        let totalValues = 0;
        while (recordIndex < recordCount) {
            const product = this.data.getRandomProduct(recordIndex, allFieldsManadatory);
            totalValues += 19;
            if (product.avgRating) {
                totalValues += 1;
            }
            if (product.shelfLife) {
                totalValues += 1;
            }
            if (product.discontinuedDate) {
                totalValues += 1;
            }
            records.push(product);
            recordIndex++;
        }
        const metadata = {
            fieldCount: Object.keys(records[0] || {}).length,
            recordCount: records.length,
            totalValues: totalValues,
            generatedAt: new Date().toISOString(),
            description: `Product catalog with ${records.length} items`,
        };
        return { metadata, records };
    }
    convert(arrayDataSet) {
        const metadata = {
            ...arrayDataSet.metadata,
            nestingLevels: 3
        };
        const records = [];
        arrayDataSet.records.forEach(r => {
            records.push({
                productId: r.productId,
                discontinuedDate: r.discontinuedDate,
                identity: {
                    productName: r.productName,
                    additionalInfo: {
                        description: r.description,
                    },
                    searchMetadata: {
                        sku: r.sku,
                        manufacturerCode: r.manufacturerCode
                    },
                    userRanking: {
                        category: r.category,
                        avgRating: r.avgRating
                    }
                },
                pricing: {
                    price: r.price,
                    costPrice: r.costPrice
                },
                inventory: {
                    stockQuantity: r.stockQuantity,
                    warehouseLocation: r.warehouseLocation,
                    stats: {
                        reorderPoint: r.reorderPoint,
                        lastRestocked: r.lastRestocked,
                        unitsShipped: r.unitsShipped
                    }
                },
                supplier: {
                    supplierName: r.supplierName,
                    supplierLocation: r.supplierLocation
                },
                physical: {
                    weight: r.weight,
                    dimensions: r.dimensions,
                    hazardous: r.hazardous,
                    fragile: r.fragile,
                    shelfLife: r.shelfLife
                },
            });
        });
        return { metadata, records };
    }
}
exports.ProductDataGenerator = ProductDataGenerator;
function generateProductDataGenerator(recordCount, allFieldsManadatory) {
    const generator = new ProductDataGenerator();
    return generator.generate(recordCount, allFieldsManadatory);
}
exports.generateProductDataGenerator = generateProductDataGenerator;
function convertToNestedObject(arrayDataSet) {
    const generator = new ProductDataGenerator();
    return generator.convert(arrayDataSet);
}
exports.convertToNestedObject = convertToNestedObject;
