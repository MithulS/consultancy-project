// Script to update user name from email (remove numbers, keep only letters)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

// Helper function to extract clean name from email
const extractNameFromEmail = (email) => {
  // Get the part before @
  const emailPrefix = email.split('@')[0];
  // Remove all numbers and special characters, keep only letters
  const cleanName = emailPrefix.replace(/[^a-zA-Z]/g, '');
  // Capitalize first letter
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
};

async function updateUserName() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the email from command line argument or use default
    const email = process.argv[2] || 'mithuld321@gmail.com';
    
    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`\n📋 Current user data:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    
    // Extract clean name from email
    const newName = extractNameFromEmail(user.email);
    
    console.log(`\n🔄 Updating name to: ${newName}`);
    
    // Update the user
    user.name = newName;
    await user.save();
    
    console.log(`✅ Successfully updated user name!`);
    console.log(`\n📋 Updated user data:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
}

updateUserName();
