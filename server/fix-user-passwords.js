/**
 * Password Reset Utility
 * 
 * This script updates passwords for existing users in the database.
 * This is useful when there's a password mismatch between what you expect
 * and what's stored in the database.
 * 
 * Run with: node fix-user-passwords.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const colors = require('colors');

// Connect to MongoDB
async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${mongoose.connection.host}`.cyan.underline);
    return true;
  } catch (error) {
    console.error(`Database connection error: ${error.message}`.red);
    return false;
  }
}

// Reset passwords for specific users
async function resetPasswords() {
  // Get User model after connection
  const User = require('./models/User');
  
  try {
    console.log('Fetching users...'.yellow);
    
    // Target emails to update
    const targetEmails = [
      'admin@example.com',
      'educator@example.com',
      'student@example.com'
    ];
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash('password123', salt);
    
    // Update passwords directly in the database (bypassing Mongoose hooks)
    const result = await User.updateMany(
      { email: { $in: targetEmails } },
      { $set: { password: newHashedPassword } }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Successfully reset passwords for ${result.modifiedCount} users`.green.bold);
    } else if (result.matchedCount > 0) {
      console.log(`ℹ️ Found ${result.matchedCount} users but no passwords needed updates`.yellow);
    } else {
      console.log(`⚠️ No users found with the specified email addresses`.yellow);
      
      // Create users if they don't exist
      console.log('\nCreating missing users...'.cyan);
      let createdCount = 0;
      
      for (const email of targetEmails) {
        const exists = await User.findOne({ email });
        
        if (!exists) {
          const [role, name] = email.includes('admin') 
            ? ['admin', 'Admin User'] 
            : email.includes('educator') 
              ? ['educator', 'Educator User'] 
              : ['student', 'Student User'];
          
          await User.create({
            name,
            email,
            password: newHashedPassword, // Use already hashed password
            role,
            avatar: {
              url: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`
            },
            bio: `Default ${role} account`
          });
          
          console.log(`  Created ${role} user: ${email}`.green);
          createdCount++;
        }
      }
      
      if (createdCount > 0) {
        console.log(`\n✅ Created ${createdCount} new users`.green.bold);
      } else {
        console.log(`\n⚠️ No new users created`.yellow);
      }
    }
    
    // List all users
    console.log('\nCurrent users in database:'.cyan);
    const users = await User.find().select('name email role');
    
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) [${user.role}]`.gray);
    });
    
    return true;
  } catch (error) {
    console.error(`Error resetting passwords: ${error.message}`.red);
    return false;
  }
}

// Main function
async function main() {
  console.log('\n=== Password Reset Utility ===\n'.blue.bold);
  
  // Connect to the database
  const connected = await connectToDB();
  if (!connected) {
    console.error('Failed to connect to the database. Exiting...'.red.bold);
    process.exit(1);
  }
  
  // Reset passwords
  await resetPasswords();
  
  // Disconnect from the database
  await mongoose.disconnect();
  console.log('\nDatabase connection closed'.gray);
  
  console.log('\n🔐 Password reset complete! Users can now log in with password: password123'.green.bold);
}

// Run the script
main().catch(error => {
  console.error(`Unhandled error: ${error.message}`.red.bold);
  process.exit(1);
}); 