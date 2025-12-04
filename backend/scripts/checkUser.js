// Check user details in database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users with matching email or username
    const email = 'mithuld321@gmail.com';
    const username = 'Mithul';

    console.log('\n🔍 Searching for users with:');
    console.log('Email:', email);
    console.log('Username:', username);
    console.log('-------------------');

    const userByEmail = await User.findOne({ email: email.toLowerCase() });
    const userByUsername = await User.findOne({ username: username });
    const allUsers = await User.find({}, 'email username name isAdmin isVerified');

    console.log('\n📧 User with email:', email);
    if (userByEmail) {
      console.log({
        id: userByEmail._id,
        email: userByEmail.email,
        username: userByEmail.username,
        name: userByEmail.name,
        isAdmin: userByEmail.isAdmin,
        isVerified: userByEmail.isVerified
      });
    } else {
      console.log('❌ No user found with this email');
    }

    console.log('\n👤 User with username:', username);
    if (userByUsername) {
      console.log({
        id: userByUsername._id,
        email: userByUsername.email,
        username: userByUsername.username,
        name: userByUsername.name,
        isAdmin: userByUsername.isAdmin,
        isVerified: userByUsername.isVerified
      });
    } else {
      console.log('❌ No user found with this username');
    }

    console.log('\n📋 All users in database:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} | ${user.username} | ${user.name} | Admin: ${user.isAdmin} | Verified: ${user.isVerified}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUser();
