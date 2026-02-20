const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const connectDB = async (retryCount = 0) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // 30s to find a server
      socketTimeoutMS: 45000,          // 45s socket hang timeout
      connectTimeoutMS: 30000,         // 30s initial connection timeout
      bufferTimeoutMS: 60000,          // 60s buffer timeout (must exceed serverSelectionTimeoutMS)
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host} / ${conn.connection.name}`);

    // Handle disconnect events and auto-reconnect
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
      setTimeout(() => connectDB(), RETRY_DELAY_MS);
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

  } catch (err) {
    console.error(`❌ MongoDB connection failed (attempt ${retryCount + 1}/${MAX_RETRIES}):`, err.message);

    if (err.message && err.message.includes('IP')) {
      console.error('   → Check your MongoDB Atlas IP whitelist (Network Access).');
    }
    if (err.message && err.message.includes('Authentication')) {
      console.error('   → Check your MONGO_URI username/password in .env');
    }

    if (retryCount < MAX_RETRIES - 1) {
      console.log(`   Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retryCount + 1);
    }

    console.error('\n🚨 FATAL: Could not connect to MongoDB after', MAX_RETRIES, 'attempts.');
    console.error('   Server will run BUT all database operations will fail.\n');
    // Don't exit process — let the server respond with 503 instead of crashing
  }
};

module.exports = connectDB;
