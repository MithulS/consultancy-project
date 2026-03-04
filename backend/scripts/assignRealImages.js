/**
 * Assign the real product photos (from "consultancy photo" folder)
 * to each product in MongoDB.
 *
 * Run:  node scripts/assignRealImages.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');

// Exact mapping: product name substring → image filename
// Filenames match the "consultancy photo" folder exactly.
const NAME_TO_IMAGE = [
  // ── Benchmark / Hammer ─────────────────────────────────────────────
  { match: 'Benchmark 3-Piece Hammer',          file: 'IMG-20251206-WA0026.jpg' },

  // ── Water Pump / Tanks ─────────────────────────────────────────────
  { match: 'Monoblock Centrifugal Water Pump',  file: 'IMG-20251210-WA0109.jpg' },
  { match: 'LLDPE Overhead Water Tank 1000',    file: 'IMG-20251210-WA0017.jpg' },
  { match: 'LLDPE Overhead Water Tank 500',     file: 'IMG-20251210-WA0016.jpg' },
  { match: 'Underground Sump Water Tank',       file: 'IMG-20251210-WA0018.jpg' },

  // ── Hardware ───────────────────────────────────────────────────────
  { match: 'Stainless Steel Anchor Bolt',       file: 'IMG-20251210-WA0001.jpg' },
  { match: 'SS Cabinet Door Handle',            file: 'IMG-20251210-WA0002.jpg' },
  { match: 'Heavy Duty Padlock',                file: 'IMG-20251210-WA0003.jpg' },

  // ── Wiring & Cables ────────────────────────────────────────────────
  { match: 'Multicore Flexible Cable',          file: 'IMG-20251210-WA0012.jpg' },
  { match: '1.5 sq mm House Wire',              file: 'IMG-20251210-WA0011.jpg' },
  { match: '2.5 sq mm FRLS Wire',               file: 'IMG-20251210-WA0010.jpg' },

  // ── Electrical ─────────────────────────────────────────────────────
  { match: 'MCB Circuit Breaker',               file: 'IMG-20251206-WA0027.jpg' },
  { match: 'Digital Energy Meter',              file: 'IMG-20251206-WA0029.jpg' },
  { match: 'LED Panel Light',                   file: 'IMG-20251206-WA0026.jpg' },

  // ── Switches & Sockets ─────────────────────────────────────────────
  { match: 'Modular Combo Plate',               file: 'IMG-20251210-WA0013.jpg' },
  { match: 'Universal 16A Power Socket',        file: 'IMG-20251210-WA0014.jpg' },
  { match: 'Smart Wi-Fi Touch Switch',          file: 'IMG-20251210-WA0015.jpg' },

  // ── Paints & Coatings ──────────────────────────────────────────────
  { match: 'Interior Emulsion Paint',           file: 'IMG-20251210-WA0004.jpg' },
  { match: 'Waterproofing Compound',            file: 'IMG-20251210-WA0005.jpg' },
  { match: 'Exterior Wall Primer',              file: 'IMG-20251210-WA0006.jpg' },

  // ── Pipes & Fittings ───────────────────────────────────────────────
  { match: 'CPVC Hot Water Pipe',               file: 'IMG-20251210-WA0007.jpg' },
  { match: 'GI Pipe',                           file: 'IMG-20251210-WA0008.jpg' },
  { match: 'PVC Conduit Pipe',                  file: 'IMG-20251210-WA0009.jpg' },

  // ── Plumbing ───────────────────────────────────────────────────────
  { match: 'Brass Ball Valve',                  file: 'IMG-20251206-WA0030.jpg' },
  { match: 'CP Single-Lever Basin Tap',         file: 'IMG-20251206-WA0031.jpg' },
  { match: 'PTFE Thread Seal Tape',             file: 'IMG-20251206-WA0032.jpg' },

  // ── Safety & Protection ────────────────────────────────────────────
  { match: 'Safety Helmet',                     file: 'IMG-20251210-WA0022.jpg' },
  { match: 'Cut-Resistant Safety Gloves',       file: 'IMG-20251210-WA0023.jpg' },
  { match: 'High-Visibility Reflective Safety', file: 'IMG-20251210-WA0024.jpg' },

  // ── Tools & Equipment ──────────────────────────────────────────────
  { match: 'SDS-Plus Rotary Hammer',            file: 'IMG-20251210-WA0020.jpg' },
  { match: 'Angle Grinder',                     file: 'IMG-20251210-WA0019.jpg' },
  { match: 'Spirit Level Set',                  file: 'IMG-20251210-WA0021.jpg' },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  const products = await Product.find({}).lean();
  console.log(`Total products: ${products.length}\n`);

  let updated = 0;
  let unmatched = [];

  for (const p of products) {
    const entry = NAME_TO_IMAGE.find(m =>
      p.name.toLowerCase().includes(m.match.toLowerCase())
    );

    if (entry) {
      const newUrl = `/uploads/products/${entry.file}`;
      await Product.updateOne({ _id: p._id }, { $set: { imageUrl: newUrl } });
      console.log(`✅  ${p.name.slice(0, 48).padEnd(48)} → ${entry.file}`);
      updated++;
    } else {
      unmatched.push(p.name);
    }
  }

  if (unmatched.length) {
    console.log('\n⚠️  No mapping found for:');
    unmatched.forEach(n => console.log(`   • ${n}`));
  }

  console.log(`\nUpdated: ${updated}  |  Unmatched: ${unmatched.length}`);
  await mongoose.connection.close();
  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
