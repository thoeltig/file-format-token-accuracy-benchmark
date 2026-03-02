"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRecordRandomizer = void 0;
const randomizer_1 = require("./randomizer");
/** Data for a flat array of random products with 19 mandatory fields + 3 optional fields. */
class ProductRecordRandomizer {
    static categories = [
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
    static suppliers = [
        "Global Supply Co",
        "Premier Parts Ltd",
        "Industrial Solutions Inc",
        "Tech Components Group",
        "Material Distributors AB",
        "Factory Direct Inc",
        "Reliable Vendors LLC",
        "Trade Partners Ltd",
    ];
    static locations = [
        "New York (USA)",
        "Shanghai (China)",
        "Singapore",
        "Rotterdam (Netherlands)",
        "Hamburg (Germany)",
        "Hong Kong",
        "Los Angeles (USA)",
        "Dubai (UAE)",
    ];
    static descriptions = [
        "High-quality product with excellent durability and performance characteristics. Suitable for professional and industrial applications.",
        "Engineered for reliability with precision manufacturing. Features advanced design for optimal functionality.",
        "Designed for efficiency and long-term reliability. Built with premium materials and strict quality control.",
        "Professional-grade equipment meeting international standards. Extensively tested for performance and safety.",
        "Robust and versatile solution for demanding applications. Features enhanced capabilities and extended lifespan.",
    ];
    static productNamePrefixes = [
        "Premium",
        "Professional",
        "Industrial",
        "Basic",
        "Heavy-Duty",
        "Compact",
        "Deluxe",
        "Standard"
    ];
    static productNameTypes = [
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
    rand;
    constructor(seed = 12345) {
        this.rand = new randomizer_1.Randomizer(seed);
    }
    getRandomProduct(index, allFieldsManadatory) {
        const product = {
            productId: `PROD-${String(index + 1).padStart(6, "0")}`,
            productName: this.generateProductName(),
            category: this.rand.getRandomItem(ProductRecordRandomizer.categories),
            price: this.rand.randomFloat(10, 5000, 2),
            costPrice: this.rand.randomFloat(5, 2500, 2),
            stockQuantity: this.rand.randomInt(0, 10000),
            reorderPoint: this.rand.randomInt(10, 500),
            lastRestocked: this.rand.generateDate(90),
            supplierName: this.rand.getRandomItem(ProductRecordRandomizer.suppliers),
            supplierLocation: this.rand.getRandomItem(ProductRecordRandomizer.locations),
            description: this.rand.getRandomItem(ProductRecordRandomizer.descriptions),
            sku: this.generateSKU(index),
            manufacturerCode: `MFR-${this.rand.randomInt(100000, 999999)}`,
            warehouseLocation: `${String.fromCharCode(65 + this.rand.randomInt(0, 9))}-${this.rand.randomInt(1, 99)}-${this.rand.randomInt(1, 50)}`,
            weight: this.rand.randomFloat(0.1, 500, 2),
            dimensions: this.generateDimensions(),
            hazardous: this.rand.getRandomNumber() > 0.8,
            fragile: this.rand.getRandomNumber() > 0.7,
            unitsShipped: this.rand.randomInt(0, 100000),
        };
        // Add optional fields based on probability
        if (allFieldsManadatory || this.rand.getRandomNumber() > 0.3) {
            product.avgRating = this.rand.randomFloat(1, 5, 1);
        }
        if (allFieldsManadatory || this.rand.getRandomNumber() > 0.6) {
            product.shelfLife = this.rand.randomInt(30, 3650);
        }
        if (allFieldsManadatory || this.rand.getRandomNumber() > 0.9) {
            product.discontinuedDate = this.rand.generateDate(180);
        }
        return product;
    }
    generateSKU(index) {
        const category = this.rand.getRandomItem(ProductRecordRandomizer.categories).substring(0, 3).toUpperCase();
        return `${category}-${String(index).padStart(6, "0")}`;
    }
    generateDimensions() {
        const w = this.rand.randomInt(5, 200);
        const h = this.rand.randomInt(5, 200);
        const d = this.rand.randomInt(5, 200);
        return `${w}x${h}x${d}cm`;
    }
    generateProductName() {
        return `${this.rand.getRandomItem(ProductRecordRandomizer.productNamePrefixes)} ${this.rand.getRandomItem(ProductRecordRandomizer.productNameTypes)} ${this.rand.randomInt(100, 9999)}`;
    }
}
exports.ProductRecordRandomizer = ProductRecordRandomizer;
