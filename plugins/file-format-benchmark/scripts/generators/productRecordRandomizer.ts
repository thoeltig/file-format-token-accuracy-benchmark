import { ProductRecord } from "../types";
import { Randomizer } from "./randomizer";

/** Data for a flat array of random products with 19 mandatory fields + 3 optional fields. */
export class ProductRecordRandomizer{
  public static readonly categories: string[] = [
    "Electronics",
    "Office Supplies",
    "Industrial Equipment",
    "Tools",
    "Materials",
    "Chemicals",
    "Furniture",
    "Textiles",
    "Packaging",
    "Accessories",
  ];

  public static readonly suppliers: string[] = [
    "Global Supply Co",
    "Premier Parts Ltd",
    "Industrial Solutions Inc",
    "Tech Components Group",
    "Material Distributors AB",
    "Factory Direct Inc",
    "Reliable Vendors LLC",
    "Trade Partners Ltd",
  ];

  public static readonly locations: string[] = [
    "New York (USA)",
    "Shanghai (China)",
    "Singapore",
    "Rotterdam (Netherlands)",
    "Hamburg (Germany)",
    "Hong Kong",
    "Los Angeles (USA)",
    "Dubai (UAE)",
  ];
  
  public static readonly descriptions: string[] = [
    "High-quality product with excellent durability and performance characteristics. Suitable for professional and industrial applications.",
    "Engineered for reliability with precision manufacturing. Features advanced design for optimal functionality.",
    "Designed for efficiency and long-term reliability. Built with premium materials and strict quality control.",
    "Professional-grade equipment meeting international standards. Extensively tested for performance and safety.",
    "Robust and versatile solution for demanding applications. Features enhanced capabilities and extended lifespan.",
  ];
  
   public static readonly productNamePrefixes: string[] = [
    "Premium", 
    "Professional", 
    "Industrial", 
    "Basic", 
    "Heavy-Duty", 
    "Compact", 
    "Deluxe", 
    "Standard"
  ];
  
  public static readonly productNameTypes: string[] = [
    "Wrench",
    "Drill",
    "Pump",
    "Motor",
    "Compressor",
    "Generator",
    "Controller",
    "Sensor",
    "Valve",
    "Switch",
    "Connector",
    "Cable",
  ];

  private rand: Randomizer;

  constructor(seed: number = 12345) {
    this.rand = new Randomizer(seed);
  }
  
  public getRandomProduct(index:number, allFieldsManadatory: boolean){
    const product: ProductRecord = {
        productId: `PROD-${String(index + 1).padStart(6, "0")}`,
        productName: this.generateProductName(),
        description: this.rand.getRandomItem(ProductRecordRandomizer.descriptions),
        category: this.rand.getRandomItem(ProductRecordRandomizer.categories),
        avgRating: this.rand.randomFloat(1, 5, 1),
        price: this.rand.randomFloat(10, 5000, 2),
        costPrice: this.rand.randomFloat(5, 2500, 2),
        discontinuedDate: this.rand.generateDate(180),
        stockQuantity: this.rand.randomInt(0, 10000),
        reorderPoint: this.rand.randomInt(10, 500),
        lastRestocked: this.rand.generateDate(90),
        shelfLife: this.rand.randomInt(30, 3650),
        supplierName: this.rand.getRandomItem(ProductRecordRandomizer.suppliers),
        supplierLocation: this.rand.getRandomItem(ProductRecordRandomizer.locations),
        sku: this.generateSKU(index),
        manufacturerCode: `MFR-${this.rand.randomInt(100000, 999999)}`,
        warehouseLocation: `${String.fromCharCode(65 + this.rand.randomInt(0, 9))}-${this.rand.randomInt(1, 99)}-${this.rand.randomInt(1, 50)}`,
        weight: this.rand.randomFloat(0.1, 500, 2),
        dimensions: this.generateDimensions(),
        hazardous: this.rand.getRandomNumber() > 0.8,
        fragile: this.rand.getRandomNumber() > 0.7,
        unitsShipped: this.rand.randomInt(0, 100000),
        isDeleted: false
    };

    if(allFieldsManadatory === false){
      // Add optional fields based on probability
      product.description = this.getOptionalValue(product.description);
      product.avgRating = this.getOptionalValue(product.avgRating);
      product.shelfLife = this.getOptionalValue(product.shelfLife);
      product.discontinuedDate = this.getOptionalValue(product.discontinuedDate);
    }

    return product;
  }

  private getOptionalValue<T>(value: T): T | null | undefined {
    let randomNumber = this.rand.getRandomNumber();
    if (randomNumber > 0.3 && randomNumber < 0.6) {
        return this.rand.getRandomNumber() > 0.5 ? undefined : null;
    }
    return value;
  }

  private generateSKU(index: number): string {
    const category = this.rand.getRandomItem(ProductRecordRandomizer.categories).substring(0, 3).toUpperCase();
    return `${category}-${String(index).padStart(6, "0")}`;
  }

  private generateDimensions(): string {
    const w = this.rand.randomInt(5, 200);
    const h = this.rand.randomInt(5, 200);
    const d = this.rand.randomInt(5, 200);
    return `${w}x${h}x${d}cm`;
  }  

  private generateProductName(): string {
    return `${this.rand.getRandomItem(ProductRecordRandomizer.productNamePrefixes)} ${this.rand.getRandomItem(ProductRecordRandomizer.productNameTypes)} ${this.rand.randomInt(100, 9999)}`;
  }
}