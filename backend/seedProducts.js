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
  },
  {
    name: "Heavy Duty Extension Cord 15m",
    description: "15-meter heavy-duty extension cord. Provide reliable power at a distance. 15A rating, suitable for tools and appliances.",
    price: 899,
    imageUrl: "https://images.unsplash.com/photo-1558227092-be206ee29f3d?w=500",
    imageAltText: "Heavy Duty Extension Cord 15m by Havells, ₹899",
    category: "Electrical",
    brand: "Havells",
    stock: 60,
    featured: false,
    rating: 4.5,
    numReviews: 320
  },
  {
    name: "Professional Paint Roller Set",
    description: "Complete paint roller kit including 9-inch roller, tray, and 2 microfiber sleeves. Ideal for smooth and semi-smooth surfaces.",
    price: 399,
    imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500",
    imageAltText: "Professional Paint Roller Set by Berger, ₹399",
    category: "Paints",
    brand: "Berger",
    stock: 120,
    featured: false,
    rating: 4.3,
    numReviews: 154
  },
  {
    name: "Digital Multimeter",
    description: "High-precision digital multimeter for voltage, current, and resistance measurement. LCD display, auto-ranging.",
    price: 1450,
    imageUrl: "https://images.unsplash.com/photo-1580974582391-a6649c82a85f?w=500",
    imageAltText: "Digital Multimeter by Fluke, ₹1450",
    category: "Tools",
    brand: "Fluke",
    stock: 35,
    featured: true,
    rating: 4.8,
    numReviews: 890
  },
  {
    name: "Teflon Tape 10-Pack",
    description: "PTFE thread seal tape for plumbing. Prevents leaks on threaded pipe connections. 12mm x 10m rolls.",
    price: 150,
    imageUrl: "https://images.unsplash.com/photo-1621215160882-7fd8df311aa8?w=500",
    imageAltText: "Teflon Tape 10-Pack by Supreme, ₹150",
    category: "Plumbing",
    brand: "Supreme",
    stock: 300,
    featured: false,
    rating: 4.9,
    numReviews: 215
  },
  {
    name: "Industrial Exhaust Fan",
    description: "Heavy-duty metal exhaust fan for industrial and commercial kitchens. 12-inch blades, high-speed motor.",
    price: 2200,
    originalPrice: 2500,
    imageUrl: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=500",
    imageAltText: "Industrial Exhaust Fan by Crompton, ₹2200",
    category: "Electrical",
    brand: "Crompton",
    stock: 15,
    featured: true,
    rating: 4.6,
    numReviews: 312
  },
  {
    name: "Claw Hammer with Fiberglass Handle",
    description: "16 oz claw hammer. Shock-absorbing fiberglass handle with anti-slip grip. Drop forged steel head.",
    price: 450,
    imageUrl: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500",
    imageAltText: "Claw Hammer with Fiberglass Handle by Stanley, ₹450",
    category: "Tools",
    brand: "Stanley",
    stock: 85,
    featured: false,
    rating: 4.7,
    numReviews: 442
  },
  {
    name: "Waterproof Putty 5kg",
    description: "White cement based wall putty with extra waterproofing agents. Ensures a smooth base for painting walls.",
    price: 350,
    imageUrl: "https://images.unsplash.com/photo-1585501334814-1e712a321da2?w=500",
    imageAltText: "Waterproof Putty 5kg by JK White, ₹350",
    category: "Paints",
    brand: "JK White",
    stock: 140,
    featured: false,
    rating: 4.5,
    numReviews: 610
  },
  {
    name: "Submersible Water Pump 1HP",
    description: "1 HP stainless steel submersible pump for borewells. High efficiency, pure copper winding.",
    price: 8500,
    originalPrice: 9500,
    imageUrl: "https://images.unsplash.com/photo-1634546452292-62a29dcddc80?w=500",
    imageAltText: "Submersible Water Pump 1HP by Kirloskar, ₹8500",
    category: "Plumbing",
    brand: "Kirloskar",
    stock: 10,
    featured: true,
    rating: 4.8,
    numReviews: 120
  },
  {
    name: "Smart WiFi Wall Switch",
    description: "Touch-sensitive smart switch compatible with Alexa and Google Home. Control lights from anywhere.",
    price: 1100,
    imageUrl: "https://images.unsplash.com/photo-1558227092-be206ee29f3d?w=500",
    imageAltText: "Smart WiFi Wall Switch by Schneider, ₹1100",
    category: "Electrical",
    brand: "Schneider",
    stock: 50,
    featured: true,
    rating: 4.4,
    numReviews: 290
  },
  {
    name: "Leather Work Gloves",
    description: "Heavy-duty split cowhide leather gloves for construction and tough DIY jobs. Puncture resistant.",
    price: 320,
    imageUrl: "https://images.unsplash.com/photo-1581092527263-ce318fec0cd4?w=500",
    imageAltText: "Leather Work Gloves by 3M, ₹320",
    category: "Safety",
    brand: "3M",
    stock: 120,
    featured: false,
    rating: 4.6,
    numReviews: 410
  },
  {
    name: "Angle Grinder 4-inch",
    description: "High-performance angle grinder. 850W motor. Ideal for metal cutting, grinding, and rust removal.",
    price: 2199,
    originalPrice: 2499,
    imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500",
    imageAltText: "Angle Grinder 4-inch by Bosch, ₹2199",
    category: "Tools",
    brand: "Bosch",
    stock: 25,
    featured: true,
    rating: 4.8,
    numReviews: 875
  },
  {
    name: "Copper Wire 1.5 sq mm Box",
    description: "FR grade copper wire, 90m length. Fire retardant PVC insulation. Ideal for house wiring.",
    price: 1250,
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500",
    imageAltText: "Copper Wire 1.5 sq mm Box by Polycab, ₹1250",
    category: "Electrical",
    brand: "Polycab",
    stock: 75,
    featured: true,
    rating: 4.9,
    numReviews: 1120
  },
  {
    name: "Kitchen Sink Mixer Tap",
    description: "Premium chrome-plated brass kitchen sink mixer with 360-degree swivel spout.",
    price: 3450,
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500",
    imageAltText: "Kitchen Sink Mixer Tap by Jaquar, ₹3450",
    category: "Plumbing",
    brand: "Jaquar",
    stock: 20,
    featured: false,
    rating: 4.7,
    numReviews: 215
  },
  {
    name: "Wood Primer 4L",
    description: "High-quality solvent-based wood primer. Protects wood from termites and provides excellent adhesion for topcoats.",
    price: 850,
    imageUrl: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500",
    imageAltText: "Wood Primer 4L by Asian Paints, ₹850",
    category: "Paints",
    brand: "Asian Paints",
    stock: 45,
    featured: false,
    rating: 4.6,
    numReviews: 335
  },
  {
    name: "Steel Padlock Heavy Duty",
    description: "Solid hardened steel padlock with 3 keys. Weather-resistant and anti-drill protection.",
    price: 650,
    imageUrl: "https://images.unsplash.com/photo-1560378036-7cbdfa2559fd?w=500",
    imageAltText: "Steel Padlock Heavy Duty by Godrej, ₹650",
    category: "Hardware",
    brand: "Godrej",
    stock: 100,
    featured: false,
    rating: 4.5,
    numReviews: 820
  },
  {
    name: "Safety Helmet (Hard Hat)",
    description: "Industrial safety helmet built from HDPE material. 6-point suspension sizing with sweatband.",
    price: 250,
    imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500",
    imageAltText: "Safety Helmet (Hard Hat) by Karam, ₹250",
    category: "Safety",
    brand: "Karam",
    stock: 80,
    featured: false,
    rating: 4.4,
    numReviews: 180
  },
  {
    name: "Pliers Set 3-Piece",
    description: "Combination, long nose, and diagonal cutting pliers. Drop forged steel with insulated rubber handles.",
    price: 850,
    imageUrl: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500",
    imageAltText: "Pliers Set 3-Piece by Taparia, ₹850",
    category: "Tools",
    brand: "Taparia",
    stock: 65,
    featured: false,
    rating: 4.8,
    numReviews: 540
  },
  {
    name: "PVC Solvent Cement 100ml",
    description: "Heavy-duty PVC solvent cement for quick and leak-proof pipe jointing.",
    price: 80,
    imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500",
    imageAltText: "PVC Solvent Cement 100ml by Astral, ₹80",
    category: "Plumbing",
    brand: "Astral",
    stock: 400,
    featured: false,
    rating: 4.7,
    numReviews: 195
  },
  {
    name: "LED Panel Light 15W",
    description: "Square LED recessed ceiling panel light. Cool white 6500K. Aluminum frame for heat dissipation.",
    price: 490,
    imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500",
    imageAltText: "LED Panel Light 15W by Wipro, ₹490",
    category: "Lighting",
    brand: "Wipro",
    stock: 90,
    featured: false,
    rating: 4.3,
    numReviews: 430
  },
  {
    name: "Hex Key (Allen Wrench) Set",
    description: "9-piece metric long arm hex key set. Crafted from heat-treated alloy steel.",
    price: 280,
    imageUrl: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500",
    imageAltText: "Hex Key (Allen Wrench) Set by Taparia, ₹280",
    category: "Tools",
    brand: "Taparia",
    stock: 110,
    featured: false,
    rating: 4.6,
    numReviews: 290
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
