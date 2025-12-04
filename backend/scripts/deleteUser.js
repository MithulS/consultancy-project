// Delete duplicate user account
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

async function deleteUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const emailToDelete = 'mithuld321@gmail.com';
    const usernameToDelete = 'mmm';

    console.log(`\n⚠️  WARNING: About to delete user:`);
    console.log(`Email: ${emailToDelete}`);
    console.log(`Username: ${usernameToDelete}`);
    console.log(`\nThis will permanently delete this user account!`);
    
    const user = await User.findOne({ email: emailToDelete });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(0);
    }

    console.log('\n📋 User details:');
    console.log({
      id: user._id,
      email: user.email,
      username: user.username,
      name: user.name,
      isAdmin: user.isAdmin || false,
      isVerified: user.isVerified
    });

    // Delete the user
    await User.deleteOne({ _id: user._id });
    console.log('\n✅ User deleted successfully!');
    console.log('   You can now use this email for your admin account.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteUser();
