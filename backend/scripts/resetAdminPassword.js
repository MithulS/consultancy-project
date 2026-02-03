// Reset admin password
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const email = 'mithuld321@gmail.com';
const newPassword = 'Admin@123';

mongoose.connect(process.env.MONGO_URI)
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
    console.log('   isVerified:', user.isVerified);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password directly (bypass pre-save hook)
    await User.updateOne(
      { email },
      { 
        $set: { 
          password: hashedPassword,
          role: 'admin',
          isAdmin: true,
          isVerified: true
        }
      }
    );
    
    console.log('\n✅ Admin account updated successfully!');
    console.log('   Email:', email);
    console.log('   Password:', newPassword);
    console.log('   Role: admin');
    console.log('   isAdmin: true');
    console.log('   isVerified: true');
    console.log('\n🔐 You can now log in with these credentials');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
