// Seed script to populate database with sample products
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product');

const sampleProducts = [
  {
    name: "iPhone 15 Pro Max",
    description: "The ultimate iPhone with titanium design, A17 Pro chip, and pro camera system. Capture stunning photos with 5x optical zoom.",
    price: 1199,
    originalPrice: 1299,
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
    category: "Smartphones",
    brand: "Apple",
    stock: 45,
    featured: true,
    rating: 4.8,
    numReviews: 1250
  },
  {
    name: "MacBook Pro 16\"",
    description: "Supercharged by M3 Max chip. Up to 22 hours battery life. Liquid Retina XDR display. Perfect for professionals.",
    price: 2499,
    originalPrice: 2699,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
    category: "Laptops",
    brand: "Apple",
    stock: 20,
    featured: true,
    rating: 4.9,
    numReviews: 890
  },
  {
    name: "iPad Pro 12.9\"",
    description: "M2 chip delivers powerful performance. Stunning Liquid Retina XDR display. Works with Apple Pencil and Magic Keyboard.",
    price: 1099,
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
    category: "Tablets",
    brand: "Apple",
    stock: 30,
    featured: true,
    rating: 4.7,
    numReviews: 654
  },
  {
    name: "AirPods Pro 2nd Gen",
    description: "Active Noise Cancellation. Adaptive Audio. Personalized Spatial Audio. Up to 6 hours of listening time.",
    price: 249,
    originalPrice: 279,
    imageUrl: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500",
    category: "Audio",
    brand: "Apple",
    stock: 150,
    featured: true,
    rating: 4.6,
    numReviews: 2100
  },
  {
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise canceling headphones. 30-hour battery life. Premium sound quality with LDAC support.",
    price: 399,
    originalPrice: 449,
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500",
    category: "Audio",
    brand: "Sony",
    stock: 75,
    featured: true,
    rating: 4.8,
    numReviews: 1450
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "AI-powered smartphone with 200MP camera, S Pen included, and stunning 6.8\" AMOLED display.",
    price: 1199,
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500",
    category: "Smartphones",
    brand: "Samsung",
    stock: 60,
    featured: false,
    rating: 4.7,
    numReviews: 980
  },
  {
    name: "Dell XPS 15",
    description: "13th Gen Intel Core i9. NVIDIA GeForce RTX 4060. 32GB RAM. 15.6\" 4K OLED display. Premium laptop for creators.",
    price: 2299,
    imageUrl: "https://images.unsplash.com/photo-1593642532400-2682810df593?w=500",
    category: "Laptops",
    brand: "Dell",
    stock: 18,
    featured: false,
    rating: 4.6,
    numReviews: 542
  },
  {
    name: "Apple Watch Series 9",
    description: "Advanced health features. Bright always-on display. Up to 18 hours battery life. Carbon neutral options.",
    price: 429,
    imageUrl: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500",
    category: "Wearables",
    brand: "Apple",
    stock: 85,
    featured: true,
    rating: 4.7,
    numReviews: 1820
  },
  {
    name: "Sony Alpha A7 IV",
    description: "33MP full-frame mirrorless camera. 4K 60fps video. Advanced Real-time Eye AF. Professional imaging powerhouse.",
    price: 2498,
    imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500",
    category: "Cameras",
    brand: "Sony",
    stock: 12,
    featured: true,
    rating: 4.9,
    numReviews: 445
  },
  {
    name: "PlayStation 5",
    description: "Next-gen gaming console. 4K 120fps gaming. Ultra-fast SSD. DualSense wireless controller included.",
    price: 499,
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500",
    category: "Gaming",
    brand: "Sony",
    stock: 0,
    featured: true,
    rating: 4.8,
    numReviews: 3200
  },
  {
    name: "Logitech MX Master 3S",
    description: "Wireless performance mouse. Quiet clicks. 8000 DPI sensor. Works on glass. USB-C rechargeable.",
    price: 99,
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
    category: "Accessories",
    brand: "Logitech",
    stock: 200,
    featured: false,
    rating: 4.7,
    numReviews: 1650
  },
  {
    name: "Samsung 49\" Odyssey G9",
    description: "Dual QHD curved gaming monitor. 240Hz refresh rate. 1ms response time. QLED display. HDR1000.",
    price: 1399,
    originalPrice: 1599,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500",
    category: "Accessories",
    brand: "Samsung",
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
