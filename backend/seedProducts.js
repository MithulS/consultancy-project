// Seed script to populate database with sample hardware products
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product');

const sampleProducts = [
  {
    name: "LED Light Bulbs 12-Pack",
    description: "Energy-efficient LED bulbs. 60W equivalent, 800 lumens. Warm white 2700K. Dimmable. 25,000 hour lifespan.",
    price: 299,
    originalPrice: 399,
    imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500",
    imageAltText: "LED Light Bulbs 12-Pack by Philips, ₹299 was ₹399, 150 in stock",
    category: "Lighting",
    brand: "Philips",
    stock: 150,
    featured: true,
    rating: 4.8,
    numReviews: 1250
  },
  {
    name: "DeWalt Cordless Drill Kit",
    description: "20V MAX brushless drill/driver. 2-speed transmission. LED work light. Includes 2 batteries and charger.",
    price: 2499,
    originalPrice: 2799,
    imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500",
    imageAltText: "DeWalt Cordless Drill Kit, ₹2499 was ₹2799, 45 in stock",
    category: "Tools",
    brand: "DeWalt",
    stock: 45,
    featured: true,
    rating: 4.9,
    numReviews: 890
  },
  {
    name: "Steel Screwdriver Set 15-Piece",
    description: "Professional screwdriver set. Chrome vanadium steel. Magnetic tips. Ergonomic handles. Includes case.",
    price: 599,
    imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500",
    imageAltText: "Steel Screwdriver Set 15-Piece by Stanley, ₹599, 80 in stock",
    category: "Tools",
    brand: "Stanley",
    stock: 80,
    featured: true,
    rating: 4.7,
    numReviews: 654
  },
  {
    name: "Exterior Wall Paint 5L",
    description: "Weather-resistant exterior paint. Matte finish. Excellent coverage. UV protection. Low VOC formula.",
    price: 899,
    originalPrice: 1099,
    imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500",
    imageAltText: "Exterior Wall Paint 5L by Asian Paints, ₹899 was ₹1099, In stock",
    category: "Paints",
    brand: "Asian Paints",
    stock: 120,
    featured: true,
    rating: 4.6,
    numReviews: 2100
  },
  {
    name: "PVC Pipe Fittings Kit",
    description: "Complete plumbing kit. Includes elbows, tees, couplings, and adapters. Corrosion resistant. Easy installation.",
    price: 449,
    originalPrice: 549,
    imageUrl: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=500",
    imageAltText: "PVC Pipe Fittings Kit by Supreme, ₹449 was ₹549, 200 in stock",
    category: "Plumbing",
    brand: "Supreme",
    stock: 200,
    featured: true,
    rating: 4.8,
    numReviews: 1450
  },
  {
    name: "Circuit Breaker Panel 12-Way",
    description: "MCB distribution board. 12-way with 240V capacity. Surge protection. Fire-resistant ABS material.",
    price: 1599,
    imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500",
    imageAltText: "Circuit Breaker Panel 12-Way by Siemens, ₹1599, 35 left",
    category: "Electrical",
    brand: "Siemens",
    stock: 35,
    featured: false,
    rating: 4.7,
    numReviews: 980
  },
  {
    name: "Adjustable Wrench Set 3-Piece",
    description: "Chrome-plated steel wrenches. 6\", 8\", and 10\" sizes. Comfort grip handles. Wide jaw capacity.",
    price: 699,
    imageUrl: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500",
    imageAltText: "Adjustable Wrench Set 3-Piece by Bahco, ₹699, 95 in stock",
    category: "Tools",
    brand: "Bahco",
    stock: 95,
    featured: false,
    rating: 4.6,
    numReviews: 542
  },
  {
    name: "Safety Goggles with Anti-Fog",
    description: "Protective eyewear. Impact-resistant polycarbonate lens. Anti-fog coating. Adjustable strap. UV protection.",
    price: 199,
    imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=500",
    imageAltText: "Safety Goggles with Anti-Fog by 3M, ₹199, 250 in stock",
    category: "Safety",
    brand: "3M",
    stock: 250,
    featured: true,
    rating: 4.7,
    numReviews: 1820
  },
  {
    name: "Electric Water Heater 25L",
    description: "Instant heating geyser. Energy efficient. Temperature control. Auto shut-off. 5-year warranty.",
    price: 4998,
    imageUrl: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500",
    imageAltText: "Electric Water Heater 25L by Bajaj, ₹4998, 28 left",
    category: "Heating",
    brand: "Bajaj",
    stock: 28,
    featured: true,
    rating: 4.9,
    numReviews: 445
  },
  {
    name: "Brass Door Hinges 4-Pack",
    description: "Heavy-duty solid brass hinges. 4\" x 3\" size. Ball bearing. Rust-resistant finish. Includes screws.",
    price: 399,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
    imageAltText: "Brass Door Hinges 4-Pack by Yale, ₹399, 180 in stock",
    category: "Hardware",
    brand: "Yale",
    stock: 180,
    featured: false,
    rating: 4.8,
    numReviews: 720
  },
  {
    name: "Measuring Tape 8m Professional",
    description: "Durable steel tape measure. Auto-lock mechanism. Magnetic hook. Impact-resistant case. Large numbers.",
    price: 349,
    imageUrl: "https://images.unsplash.com/photo-1581093458791-9d42e1059b9e?w=500",
    imageAltText: "Measuring Tape 8m Professional by Stanley, ₹349, In stock",
    category: "Accessories",
    brand: "Stanley",
    stock: 200,
    featured: false,
    rating: 4.7,
    numReviews: 1650
  },
  {
    name: "Solar Motion Sensor Light",
    description: "Outdoor security light. 1200 lumens. Wide detection angle. Waterproof IP65. Energy-saving solar panel.",
    price: 1299,
    originalPrice: 1599,
    imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=500",
    imageAltText: "Solar Motion Sensor Light by Philips, ₹1299 was ₹1599, 8 left",
    category: "Lighting",
    brand: "Philips",
    stock: 8,
    featured: false,
    rating: 4.6,
    numReviews: 287
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/consultancy_db');
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert sample products
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${inserted.length} sample products`);

    console.log('\n📦 Sample Products:');
    inserted.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} - $${p.price} (${p.category}) - Stock: ${p.stock}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
