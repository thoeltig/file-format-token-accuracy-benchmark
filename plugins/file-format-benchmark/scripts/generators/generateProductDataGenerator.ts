/**
 * Base data model generator
 * Generates product catalog dataset
 * Can be converted to all target formats
 */

import { MetadataFlatArray, FlatArrayDataSet, ProductRecord, NestedProductRecord, NestedDataSet, MetadataNetsedObject } from "../types";
import { ProductRecordRandomizer } from "./productRecordRandomizer";

export class ProductDataGenerator {  
  private readonly data:ProductRecordRandomizer;

  constructor(seed: number = 12345) {
    this.data = new ProductRecordRandomizer(seed);
  }

  public generate(recordCount: number, allFieldsManadatory: boolean): FlatArrayDataSet {
    const records: ProductRecord[] = [];
    let recordIndex = 0;
    let totalValues = 0;

    while (recordIndex < recordCount) {
      const product = this.data.getRandomProduct(recordIndex, allFieldsManadatory);
      totalValues+=19;

      if (product.avgRating) {
        totalValues+=1;
      }

      if (product.shelfLife) {
        totalValues+=1;
      }
      
      if (product.discontinuedDate) {
        totalValues+=1;
      }

      records.push(product);
      recordIndex++;
    }

    const metadata:MetadataFlatArray = {
      fieldCount: Object.keys(records[0] || {}).length,
      recordCount: records.length,
      totalValues: totalValues,
      generatedAt: new Date().toISOString(),
      description: `Product catalog with ${records.length} items`,
    };

    return { metadata, records };
  }
  

  public convert(arrayDataSet: FlatArrayDataSet): NestedDataSet {
    const metadata: MetadataNetsedObject = {
      ...arrayDataSet.metadata,
      nestingLevels: 3
    };

    const records: NestedProductRecord[] = [];
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

export function generateProductDataGenerator(recordCount: number, allFieldsManadatory: boolean): FlatArrayDataSet {
  const generator = new ProductDataGenerator();
  return generator.generate(recordCount, allFieldsManadatory);
}

export function convertToNestedObject(arrayDataSet: FlatArrayDataSet): NestedDataSet {
  const generator = new ProductDataGenerator();
  return generator.convert(arrayDataSet);
}