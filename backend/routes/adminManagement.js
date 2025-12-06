// Admin Management Routes - Update admin credentials securely
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { verifyAdmin } = require('../middleware/auth');

/**
 * @route   PUT /api/admin/update-credentials
 * @desc    Update admin user credentials (email, password, username)
 * @access  Admin only - requires admin token
 */
router.put('/update-credentials', verifyAdmin, async (req, res) => {
  try {
    let { currentPassword, newEmail, newPassword, newUsername, confirmPassword, newPhoneNumber } = req.body;
    const adminId = req.userId; // From verifyAdmin middleware

    console.log('🔐 Update credentials request:', {
      adminId,
      hasCurrentPassword: !!currentPassword,
      newEmail: newEmail || '(empty)',
      newUsername: newUsername || '(empty)',
      newPhoneNumber: newPhoneNumber || '(empty)',
      hasNewPassword: !!newPassword
    });

    // ============================================================
    // 1. VALIDATION - Ensure all required fields are provided
    // ============================================================
    
    if (!currentPassword || !currentPassword.trim()) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Current password is required for security verification' 
      });
    }

    // Trim and normalize all input fields
    currentPassword = currentPassword.trim();
    newEmail = newEmail ? newEmail.trim() : '';
    newUsername = newUsername ? newUsername.trim() : '';
    newPassword = newPassword ? newPassword.trim() : '';
    confirmPassword = confirmPassword ? confirmPassword.trim() : '';
    newPhoneNumber = newPhoneNumber ? newPhoneNumber.trim() : '';

    // At least one field must be provided to update
    if (!newEmail && !newPassword && !newUsername && !newPhoneNumber) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Please provide at least one field to update (email, username, password, or phone number)' 
      });
    }

    // ============================================================
    // 2. FETCH CURRENT ADMIN USER
    // ============================================================
    
    const admin = await User.findById(adminId);
    
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Admin user not found' 
      });
    }

    // ============================================================
    // 3. VERIFY CURRENT PASSWORD - Security check
    // ============================================================
    
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        msg: 'Current password is incorrect. Please try again.' 
      });
    }

    // ============================================================
    // 4. VALIDATE NEW EMAIL FORMAT (if provided)
    // ============================================================
    
    if (newEmail) {
      // Skip validation if email hasn't changed
      if (newEmail.toLowerCase() === admin.email.toLowerCase()) {
        console.log('⏭️ Email unchanged, skipping validation');
        newEmail = ''; // Clear it so it won't be updated
      } else {
        // Email regex pattern for validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(newEmail)) {
          return res.status(400).json({ 
            success: false, 
            msg: 'Invalid email format. Please provide a valid email address.' 
          });
        }

        // Check if email is already taken by another user
        const emailExists = await User.findOne({ 
          email: newEmail.toLowerCase(), 
          _id: { $ne: adminId } // Exclude current admin
        });

        if (emailExists) {
          return res.status(409).json({ 
            success: false, 
            msg: 'This email is already registered. Please use a different email.' 
          });
        }
      }
    }

    // ============================================================
    // 5. VALIDATE NEW USERNAME (if provided)
    // ============================================================
    
    if (newUsername) {
      // Skip validation if username hasn't changed
      if (newUsername === admin.username) {
        console.log('⏭️ Username unchanged, skipping validation');
        newUsername = ''; // Clear it so it won't be updated
      } else {
        // Username must be at least 3 characters
        if (newUsername.length < 3) {
          return res.status(400).json({ 
            success: false, 
            msg: 'Username must be at least 3 characters long' 
          });
        }

        // Username can only contain alphanumeric and underscores
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        
        if (!usernameRegex.test(newUsername)) {
          return res.status(400).json({ 
            success: false, 
            msg: 'Username can only contain letters, numbers, and underscores' 
          });
        }

        // Check if username is already taken by another user
        const usernameExists = await User.findOne({ 
          username: newUsername, 
          _id: { $ne: adminId } 
        });

        if (usernameExists) {
          return res.status(409).json({ 
            success: false, 
            msg: 'This username is already taken. Please choose a different username.' 
          });
        }
      }
    }

    // ============================================================
    // 6. VALIDATE NEW PASSWORD STRENGTH (if provided)
    // ============================================================
    
    if (newPassword) {
      // Confirm password must match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ 
          success: false, 
          msg: 'New password and confirm password do not match' 
        });
      }

      // Password must be at least 6 characters
      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false, 
          msg: 'Password must be at least 6 characters long' 
        });
      }

      // Password strength validation
      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasLowerCase = /[a-z]/.test(newPassword);
      const hasNumber = /[0-9]/.test(newPassword);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        return res.status(400).json({ 
          success: false, 
          msg: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
        });
      }

      // Recommended: special character (optional but recommended)
      if (!hasSpecialChar) {
        console.warn('⚠️ Password without special character - less secure');
      }
    }

    // ============================================================
    // 6.5. VALIDATE PHONE NUMBER (if provided)
    // ============================================================
    
    if (newPhoneNumber) {
      // Skip validation if phone number hasn't changed
      if (newPhoneNumber === admin.phoneNumber) {
        console.log('⏭️ Phone number unchanged, skipping validation');
        newPhoneNumber = ''; // Clear it so it won't be updated
      } else {
        // Basic phone number validation (flexible format)
        // Allows: +1-234-567-8900, (123) 456-7890, 1234567890, +911234567890, etc.
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        
        if (!phoneRegex.test(newPhoneNumber)) {
          return res.status(400).json({ 
            success: false, 
            msg: 'Invalid phone number format. Use only numbers, spaces, dashes, parentheses, and plus sign.' 
          });
        }

        // Check minimum length (at least 10 digits)
        const digitsOnly = newPhoneNumber.replace(/\D/g, '');
        if (digitsOnly.length < 10) {
          return res.status(400).json({ 
            success: false, 
            msg: 'Phone number must contain at least 10 digits' 
          });
        }
      }
    }

    // Re-check if at least one field has a value after validation
    if (!newEmail && !newPassword && !newUsername && !newPhoneNumber) {
      return res.status(400).json({ 
        success: false, 
        msg: 'No changes detected. Please modify at least one field.' 
      });
    }

    // ============================================================
    // 7. UPDATE ADMIN CREDENTIALS
    // ============================================================
    
    let updateFields = {};
    
    // Update email if provided
    if (newEmail) {
      updateFields.email = newEmail.toLowerCase();
    }

    // Update username if provided
    if (newUsername) {
      updateFields.username = newUsername;
    }

    // Update phone number if provided
    if (newPhoneNumber) {
      updateFields.phoneNumber = newPhoneNumber;
    }

    // Hash and update password if provided
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(newPassword, salt);
    }

    // Apply updates to admin user
    Object.assign(admin, updateFields);
    await admin.save();

    // ============================================================
    // 8. PREPARE SUCCESS RESPONSE
    // ============================================================
    
    const updatedFields = [];
    if (newEmail) updatedFields.push('email');
    if (newUsername) updatedFields.push('username');
    if (newPhoneNumber) updatedFields.push('phone number');
    if (newPassword) updatedFields.push('password');

    res.json({ 
      success: true, 
      msg: `Admin credentials updated successfully! Updated: ${updatedFields.join(', ')}`,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber
      }
    });

  } catch (err) {
    console.error('❌ Update admin credentials error:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Server error while updating credentials. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   GET /api/admin/profile
 * @desc    Get current admin profile details
 * @access  Admin only
 */
router.get('/profile', verifyAdmin, async (req, res) => {
  try {
    const admin = await User.findById(req.userId).select('-password -otp -otpExpiresAt -resetPasswordToken');
    
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Admin profile not found' 
      });
    }

    res.json({ 
      success: true, 
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        isVerified: admin.isVerified,
        createdAt: admin.createdAt
      }
    });

  } catch (err) {
    console.error('❌ Get admin profile error:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Server error while fetching profile' 
    });
  }
});

module.exports = router;
