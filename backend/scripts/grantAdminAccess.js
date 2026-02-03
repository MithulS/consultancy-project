// Grant admin access to a user account
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

const email = 'mithuld321@gmail.com';

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce')
  .then(async () => {
    console.log('📦 Connected to MongoDB');
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found:', email);
      process.exit(1);
    }
    
    console.log('\n👤 Current User Details:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   isAdmin:', user.isAdmin);
    
    // Grant admin access
    user.role = 'admin';
    user.isAdmin = true;
    await user.save();
    
    console.log('\n✅ Admin access granted successfully!');
    console.log('   New Role:', user.role);
    console.log('   New isAdmin:', user.isAdmin);
    console.log('\n🔐 You can now log in with admin privileges');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
