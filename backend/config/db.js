const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      bufferCommands: false, // Disable buffering to fail fast
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.error('\n⚠️  WARNING: Server running without database connection!');
    console.error('   The API will return errors for database operations.');
    console.error('   Please check your MongoDB Atlas IP whitelist or connection string.\n');
    // Don't exit - let the server run without DB for development
  }
};

module.exports = connectDB;
