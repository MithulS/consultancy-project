// Seed script to populate database with 30 local image products
// Copies images from consultancy photo folder to uploads/products and inserts products
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('./models/product');

// ─── Source & Destination Paths ───────────────────────────────────────────────
const SOURCE_FOLDER = path.join(__dirname, '../frontend/consultancy photo');
const DEST_FOLDER   = path.join(__dirname, 'uploads/products');
const BASE_URL      = process.env.BASE_URL || 'http://localhost:5000';

// ─── 30 Images selected (first 30 from the folder) ────────────────────────────
const selectedImages = [
  // --- Dec 06 batch (6 images) ---
  'IMG-20251206-WA0026.jpg',
  'IMG-20251206-WA0027.jpg',
  'IMG-20251206-WA0029.jpg',
  'IMG-20251206-WA0030.jpg',
  'IMG-20251206-WA0031.jpg',
  'IMG-20251206-WA0032.jpg',
  // --- Dec 10 batch (24 images) ---
  'IMG-20251210-WA0001.jpg',
  'IMG-20251210-WA0002.jpg',
  'IMG-20251210-WA0003.jpg',
  'IMG-20251210-WA0004.jpg',
  'IMG-20251210-WA0005.jpg',
  'IMG-20251210-WA0006.jpg',
  'IMG-20251210-WA0007.jpg',
  'IMG-20251210-WA0008.jpg',
  'IMG-20251210-WA0009.jpg',
  'IMG-20251210-WA0010.jpg',
  'IMG-20251210-WA0011.jpg',
  'IMG-20251210-WA0012.jpg',
  'IMG-20251210-WA0013.jpg',
  'IMG-20251210-WA0014.jpg',
  'IMG-20251210-WA0015.jpg',
  'IMG-20251210-WA0016.jpg',
  'IMG-20251210-WA0017.jpg',
  'IMG-20251210-WA0018.jpg',
  'IMG-20251210-WA0019.jpg',
  'IMG-20251210-WA0020.jpg',
  'IMG-20251210-WA0021.jpg',
  'IMG-20251210-WA0022.jpg',
  'IMG-20251210-WA0023.jpg',
  'IMG-20251210-WA0024.jpg',
];

// ─── Product Data (30 products, 3 per category) ───────────────────────────────
const productData = [
  // ── Electrical (1-3) ──────────────────────────────────────────────────────
  {
    index: 0,
    name: 'LED Panel Light 18W Round',
    description: 'Energy-efficient 18W LED round panel light. 6500K cool white. 1800 lumens output. Ultra-slim design (25mm depth). Suitable for false ceiling. 50,000-hour lifespan. Comes with driver included. Easy snap-in installation.',
    price: 449,
    originalPrice: 599,
    category: 'Electrical',
    brand: 'Philips',
    stock: 120,
    featured: true,
    rating: 4.7,
    numReviews: 980,
  },
  {
    index: 1,
    name: 'MCB Circuit Breaker 32A Single Pole',
    description: 'ISI marked miniature circuit breaker. 32A single-pole, 240V AC. Provides overload and short-circuit protection. DIN rail mountable. Trip curve C. Breaking capacity 10kA. Fire-retardant enclosure.',
    price: 299,
    originalPrice: 349,
    category: 'Electrical',
    brand: 'Havells',
    stock: 200,
    featured: true,
    rating: 4.8,
    numReviews: 1450,
  },
  {
    index: 2,
    name: 'Digital Energy Meter Single Phase',
    description: 'Bi-directional LCD digital energy meter. 5-60A range. tamper-proof design. 0.5% accuracy class. RS-485 communication port. Din rail mounting. Measures kWh, voltage, current, power factor.',
    price: 1199,
    originalPrice: 1499,
    category: 'Electrical',
    brand: 'Secure',
    stock: 60,
    featured: false,
    rating: 4.6,
    numReviews: 430,
  },

  // ── Plumbing (4-6) ────────────────────────────────────────────────────────
  {
    index: 3,
    name: 'Brass Ball Valve 1 Inch Full Bore',
    description: 'Heavy-duty full bore brass ball valve. 1" BSP thread. 600 WOG pressure rating. Chrome-plated finish. PTFE seats. Lever handle included. Suitable for water, oil, and gas lines.',
    price: 349,
    originalPrice: 449,
    category: 'Plumbing',
    brand: 'Zoloto',
    stock: 150,
    featured: true,
    rating: 4.8,
    numReviews: 870,
  },
  {
    index: 4,
    name: 'CP Single-Lever Basin Tap',
    description: 'Chrome-plated single-lever mixer tap for washbasin. Ceramic disc cartridge. 35mm handle. Water-saving aerator. Compatible with 15mm inlet pipes. Easy hot & cold mixing. Anti-rust body.',
    price: 899,
    originalPrice: 1199,
    category: 'Plumbing',
    brand: 'Jaquar',
    stock: 85,
    featured: true,
    rating: 4.7,
    numReviews: 1230,
  },
  {
    index: 5,
    name: 'PTFE Thread Seal Tape 12mm 10m',
    description: 'Professional-grade PTFE thread seal tape. 12mm width, 10m length per roll, 0.075mm thick. Temperature range -200°C to +260°C. Suitable for water, gas, and oil-based plumbing connections. Pack of 5 rolls.',
    price: 99,
    originalPrice: 149,
    category: 'Plumbing',
    brand: 'Finolex',
    stock: 500,
    featured: false,
    rating: 4.9,
    numReviews: 2200,
  },

  // ── Hardware (7-9) ────────────────────────────────────────────────────────
  {
    index: 6,
    name: 'Stainless Steel Anchor Bolt Set 50-Pack',
    description: 'Grade 304 stainless steel expansion anchor bolts. Sizes M6×50mm. Hex head with nut and washer. Corrosion-resistant. Suitable for concrete, brick, and masonry. Pre-assembled for quick installation.',
    price: 499,
    originalPrice: 649,
    category: 'Hardware',
    brand: 'Hilti',
    stock: 180,
    featured: false,
    rating: 4.8,
    numReviews: 760,
  },
  {
    index: 7,
    name: 'SS Cabinet Door Handle Set of 10',
    description: 'Modern stainless steel cylindrical bar handles. 160mm center-to-center. Brushed satin finish. Includes mounting screws. Suitable for kitchen cabinets, wardrobes, and bathroom furniture. Durable & easy to clean.',
    price: 799,
    originalPrice: 999,
    category: 'Hardware',
    brand: 'Godrej',
    stock: 220,
    featured: true,
    rating: 4.6,
    numReviews: 545,
  },
  {
    index: 8,
    name: 'Heavy Duty Padlock 70mm Hardened Steel',
    description: 'High-security 70mm padlock with hardened boron steel shackle. Double-locking mechanism. 4-pin tumbler cylinder. Anti-pick, anti-drill. Weatherproof zinc alloy body. Includes 3 keys.',
    price: 649,
    originalPrice: 849,
    category: 'Hardware',
    brand: 'Yale',
    stock: 95,
    featured: true,
    rating: 4.9,
    numReviews: 1120,
  },

  // ── Paints & Coatings (10-12) ─────────────────────────────────────────────
  {
    index: 9,
    name: 'Interior Emulsion Paint 10L White',
    description: 'Premium washable interior wall emulsion. Smooth matte finish. Covers up to 140 sq.ft/litre. Low VOC, odour-free formula. Anti-bacterial, moisture-resistant. Suitable for new and repainted surfaces. 10-litre bucket.',
    price: 2199,
    originalPrice: 2799,
    category: 'Paints & Coatings',
    brand: 'Asian Paints',
    stock: 80,
    featured: true,
    rating: 4.8,
    numReviews: 2450,
  },
  {
    index: 10,
    name: 'Waterproofing Compound 5kg',
    description: 'Polymer-modified cementitious waterproofing slurry. Flexible two-component system. Suitable for roofs, basement, bathrooms, and swimming pools. Coverage: 1.0 kg/m² per coat. Non-toxic after curing. 5kg kit.',
    price: 1499,
    originalPrice: 1899,
    category: 'Paints & Coatings',
    brand: 'Dr. Fixit',
    stock: 110,
    featured: true,
    rating: 4.7,
    numReviews: 1890,
  },
  {
    index: 11,
    name: 'Exterior Wall Primer 4 Litre',
    description: 'Acrylic-based exterior wall primer. Seals pores and improves paint adhesion. Alkali-resistant formula. Covers 120-140 sq.ft/litre. Excellent binding strength. Suitable for cement, brick, and masonry surfaces. 4L tin.',
    price: 699,
    originalPrice: 899,
    category: 'Paints & Coatings',
    brand: 'Berger',
    stock: 140,
    featured: false,
    rating: 4.6,
    numReviews: 870,
  },

  // ── Pipes & Fittings (13-15) ──────────────────────────────────────────────
  {
    index: 12,
    name: 'CPVC Hot Water Pipe 25mm 3m',
    description: 'ChloroPolyVinyl chloride hot water pipe. 25mm OD, SDR 11 pressure rating. Working temperature up to 93°C. Corrosion and scale-resistant. Smooth bore reduces friction loss. 3-metre stick. ISI marked.',
    price: 299,
    originalPrice: 389,
    category: 'Pipes & Fittings',
    brand: 'Astral',
    stock: 200,
    featured: false,
    rating: 4.7,
    numReviews: 1120,
  },
  {
    index: 13,
    name: 'GI Pipe 90° Elbow 1 Inch - 5 Pack',
    description: 'Galvanised iron 90-degree elbows. 1" BSP female thread both ends. Hot-dip galvanised finish for corrosion resistance. Hydraulic pressure tested. Suitable for water supply and compressed air lines. Pack of 5.',
    price: 449,
    originalPrice: 579,
    category: 'Pipes & Fittings',
    brand: 'Tata Steel',
    stock: 160,
    featured: false,
    rating: 4.8,
    numReviews: 640,
  },
  {
    index: 14,
    name: 'PVC Conduit Pipe 20mm 3m with Couplers',
    description: 'Rigid PVC electrical conduit pipe. 20mm diameter, 3m length. Flame-retardant ISI marked. UV-stabilised for outdoor use. Includes 2 couplers and 1 junction box per stick. Heat-resistant up to 90°C.',
    price: 149,
    originalPrice: 199,
    category: 'Pipes & Fittings',
    brand: 'Precision',
    stock: 300,
    featured: false,
    rating: 4.6,
    numReviews: 920,
  },

  // ── Wiring & Cables (16-18) ───────────────────────────────────────────────
  {
    index: 15,
    name: '2.5 sq mm FRLS Wire 90m Coil Red',
    description: 'Flame-retardant low-smoke (FRLS) single-core copper wire. 2.5 sq mm. PVC insulated. ISI marked IS:694. For power wiring and sub-circuit connections. 90-metre coil. Operating temperature up to 70°C. Red colour.',
    price: 1899,
    originalPrice: 2199,
    category: 'Wiring & Cables',
    brand: 'Polycab',
    stock: 70,
    featured: true,
    rating: 4.9,
    numReviews: 1870,
  },
  {
    index: 16,
    name: '1.5 sq mm House Wire 90m Yellow-Green',
    description: 'ISI marked PVC insulated 1.5 sq mm copper conductor wire. Suitable for light, fan, and small appliance wiring. Excellent flexibility. 90-metre coil. Yellow-green earth wire. Voltage grade: 1100V.',
    price: 1299,
    originalPrice: 1499,
    category: 'Wiring & Cables',
    brand: 'Finolex',
    stock: 90,
    featured: false,
    rating: 4.8,
    numReviews: 2100,
  },
  {
    index: 17,
    name: 'Multicore Flexible Cable 4-Core 1.5mm 10m',
    description: 'Flexible 4-core 1.5 sq mm copper conductor cable. PVC sheathed. Ideal for portable tools and machines. 10-metre coil. 240/415V grade. Heat- and oil-resistant outer jacket. Colour-coded cores (R/Y/B/G-Y).',
    price: 849,
    originalPrice: 1099,
    category: 'Wiring & Cables',
    brand: 'Havells',
    stock: 55,
    featured: false,
    rating: 4.7,
    numReviews: 450,
  },

  // ── Switches & Sockets (19-21) ────────────────────────────────────────────
  {
    index: 18,
    name: 'Modular Combo Plate - 1M Switch + 5A Socket',
    description: 'Modular plate with 1 modular switch (6A) and one 5-pin 5A socket with shutter. Flush-mounting. Flame-retardant polycarbonate body. ISI marked. Compatible with standard 1-gang back box. Available in ivory white.',
    price: 249,
    originalPrice: 329,
    category: 'Switches & Sockets',
    brand: 'Legrand',
    stock: 250,
    featured: true,
    rating: 4.7,
    numReviews: 1560,
  },
  {
    index: 19,
    name: 'Universal 16A Power Socket with Switch',
    description: '16A universal socket with integral rocker switch and safety shutters. Suitable for AC, room heater, washing machine, and other high-current appliances. IP20 indoor use. Flush-mount with back box included.',
    price: 199,
    originalPrice: 279,
    category: 'Switches & Sockets',
    brand: 'Anchor',
    stock: 320,
    featured: false,
    rating: 4.6,
    numReviews: 1820,
  },
  {
    index: 20,
    name: 'Smart Wi-Fi Touch Switch 2-Gang',
    description: 'Smart 2-gang touch panel switch. Wi-Fi enabled, compatible with Alexa and Google Home. 7-touch glass panel. Neutral wire required. Works with 5A loads (fan/light). Remote control via smartphone app. 2-year warranty.',
    price: 1299,
    originalPrice: 1799,
    category: 'Switches & Sockets',
    brand: 'Wipro',
    stock: 45,
    featured: true,
    rating: 4.5,
    numReviews: 620,
  },

  // ── Water Tanks (22-24) ───────────────────────────────────────────────────
  {
    index: 21,
    name: 'LLDPE Overhead Water Tank 500 Litre',
    description: 'Linear low-density polyethylene overhead storage tank. 500L capacity. 4-layer insulated wall — UV-stabilised, food-grade. ISI marked IS:12701. Anti-algae blue colour. Comes with lockable lid, inlet, outlet & overflow fittings.',
    price: 3999,
    originalPrice: 4899,
    category: 'Water Tanks',
    brand: 'Sintex',
    stock: 30,
    featured: true,
    rating: 4.8,
    numReviews: 1240,
  },
  {
    index: 22,
    name: 'LLDPE Overhead Water Tank 1000 Litre',
    description: '1000-litre LLDPE overhead water storage tank. Triple-layer construction with inner Black PE layer. food grade & UV-resistant. Comes with pre-installed inlet, outlet, overflow fittings and lockable lid. ISI & WRAS certified.',
    price: 6499,
    originalPrice: 7999,
    category: 'Water Tanks',
    brand: 'Sintex',
    stock: 20,
    featured: true,
    rating: 4.9,
    numReviews: 890,
  },
  {
    index: 23,
    name: 'Underground Sump Water Tank 2000 Litre',
    description: 'Heavy-duty underground sump tank. 2000L capacity. Blow-moulded HDPE structure, corrosion and chemical resistant. Seamless one-piece construction. Suitable for potable water storage, rainwater harvesting, septic use. Load-bearing lid included.',
    price: 12999,
    originalPrice: 15999,
    category: 'Water Tanks',
    brand: 'Sintex',
    stock: 10,
    featured: false,
    rating: 4.7,
    numReviews: 340,
  },

  // ── Tools & Equipment (25-27) ─────────────────────────────────────────────
  {
    index: 24,
    name: 'Angle Grinder 4.5 Inch 750W',
    description: 'Powerful 750W electric angle grinder. 4.5" (115mm) disc size. No-load speed 11,000 rpm. Spindle lock for quick disc change. Safety switch. Includes cutting disc, grinding disc, and side handle. ISI marked.',
    price: 1799,
    originalPrice: 2299,
    category: 'Tools & Equipment',
    brand: 'Bosch',
    stock: 40,
    featured: true,
    rating: 4.8,
    numReviews: 1340,
  },
  {
    index: 25,
    name: 'SDS-Plus Rotary Hammer 800W 26mm',
    description: '800W SDS-Plus rotary hammer drill. 26mm max drilling diameter in concrete. 3-function mode: drill, hammer drill, chiselling. 4J impact energy. Variable speed dial. Anti-vibration handle. Includes 3 SDS-Plus bits and chisel.',
    price: 4999,
    originalPrice: 6499,
    category: 'Tools & Equipment',
    brand: 'DeWalt',
    stock: 25,
    featured: true,
    rating: 4.9,
    numReviews: 780,
  },
  {
    index: 26,
    name: 'Spirit Level Set 3-Piece (30/60/120cm)',
    description: 'Professional aluminium alloy spirit level set. Three sizes: 30cm, 60cm & 120cm. Shock-resistant acrylic vials. ±0.5mm/m accuracy. Milled working edges. Magnetic base on 30cm level. Hanging hole and rubber end-caps.',
    price: 899,
    originalPrice: 1199,
    category: 'Tools & Equipment',
    brand: 'Stanley',
    stock: 65,
    featured: false,
    rating: 4.7,
    numReviews: 640,
  },

  // ── Safety & Protection (28-30) ───────────────────────────────────────────
  {
    index: 27,
    name: 'Safety Helmet ISI Marked ABS Yellow',
    description: 'High-density ABS construction safety helmet. ISI (IS:2925) marked. HDPE ratchet suspension system. 6-point harness. Ventilated design. Impact absorption 50G max. Suitable for construction, engineering, and industrial sites.',
    price: 449,
    originalPrice: 599,
    category: 'Safety & Protection',
    brand: '3M',
    stock: 200,
    featured: false,
    rating: 4.7,
    numReviews: 1650,
  },
  {
    index: 28,
    name: 'Cut-Resistant Safety Gloves Level 5',
    description: 'UHMWPE fibre cut-resistant gloves. EN 388 Level 5 (A4) protection. Polyurethane palm coating for grip. Touchscreen-compatible fingertips. Ambidextrous. Sizes: S/M/L/XL. Suitable for metalwork, glass handling, and industrial assembly.',
    price: 349,
    originalPrice: 499,
    category: 'Safety & Protection',
    brand: '3M',
    stock: 280,
    featured: true,
    rating: 4.8,
    numReviews: 1120,
  },
  {
    index: 29,
    name: 'High-Visibility Reflective Safety Vest',
    description: 'Class 2 high-visibility vest. Fluorescent yellow-green fabric with 2 silver reflective bands (front & back). Zip closure. Breathable mesh back panel. ANSI/ISEA 107 compliant. Sizes: M to 3XL. Machine washable.',
    price: 299,
    originalPrice: 399,
    category: 'Safety & Protection',
    brand: 'Karam',
    stock: 350,
    featured: false,
    rating: 4.9,
    numReviews: 980,
  },
];

// ─── Copy images and build product documents ──────────────────────────────────
function copyImages() {
  if (!fs.existsSync(DEST_FOLDER)) {
    fs.mkdirSync(DEST_FOLDER, { recursive: true });
  }

  const copied = [];
  for (let i = 0; i < selectedImages.length; i++) {
    const src  = path.join(SOURCE_FOLDER, selectedImages[i]);
    // Normalise filename: replace spaces with underscores, keep extension
    const destName = selectedImages[i].replace(/ /g, '_');
    const dest = path.join(DEST_FOLDER, destName);

    if (!fs.existsSync(src)) {
      console.warn(`⚠️  Source image not found, skipping: ${selectedImages[i]}`);
      copied.push(null);
      continue;
    }

    fs.copyFileSync(src, dest);
    copied.push(destName);
    console.log(`📷  Copied [${i + 1}/30] ${destName}`);
  }
  return copied;
}

// ─── Build Mongoose documents ─────────────────────────────────────────────────
function buildProducts(copiedFileNames) {
  return productData.map((p) => {
    const fileName = copiedFileNames[p.index];
    const imageUrl = fileName
      ? `${BASE_URL}/uploads/products/${fileName}`
      : `${BASE_URL}/uploads/products/placeholder.jpg`;

    return {
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice || null,
      imageUrl,
      imageAltText: `${p.name} by ${p.brand}, ₹${p.price}`,
      category: p.category,
      brand: p.brand,
      stock: p.stock,
      inStock: p.stock > 0,
      featured: p.featured,
      rating: p.rating,
      numReviews: p.numReviews,
    };
  });
}

// ─── Main seed function ───────────────────────────────────────────────────────
async function seedDatabase() {
  try {
    const MONGO_URI =
      process.env.MONGO_URI || 'mongodb://localhost:27017/consultancy_db';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Copy images
    console.log('\n📂 Copying images to uploads/products...');
    const copiedFileNames = copyImages();
    console.log(`✅ Image copy complete: ${copiedFileNames.filter(Boolean).length}/30 copied\n`);

    // 2. Build product documents
    const products = buildProducts(copiedFileNames);

    // 3. Remove previously seeded local products (by checking imageUrl pattern)
    const deleteResult = await Product.deleteMany({
      imageUrl: { $regex: '/uploads/products/IMG-' },
    });
    if (deleteResult.deletedCount > 0) {
      console.log(`🗑️  Removed ${deleteResult.deletedCount} previously seeded local products`);
    }

    // 4. Insert new products
    const inserted = await Product.insertMany(products);
    console.log(`\n✅ Inserted ${inserted.length} products into the database\n`);

    // 5. Print summary table
    console.log('─'.repeat(90));
    console.log(
      `${'#'.padEnd(3)} ${'Product Name'.padEnd(42)} ${'Category'.padEnd(22)} ${'Brand'.padEnd(14)} Price`
    );
    console.log('─'.repeat(90));
    inserted.forEach((p, i) => {
      console.log(
        `${String(i + 1).padEnd(3)} ${p.name.substring(0, 40).padEnd(42)} ${p.category.padEnd(22)} ${(p.brand || '').padEnd(14)} ₹${p.price}`
      );
    });
    console.log('─'.repeat(90));
    console.log(`\n🎉 Done! ${inserted.length} products seeded successfully.\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
