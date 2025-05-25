/**
 * Password Reset Utility
 * 
 * This script updates passwords for existing users in the database.
 * This is useful when there's a password mismatch between what you expect
 * and what's stored in the database.
 * 
 * Run with: npx ts-node scripts/reset-passwords.ts
 */

import connectDB from '../db';
import { resetPasswords, createUser } from './utils';
import { User } from '../models';

// Main function
async function main() {
  console.log('\n=== Password Reset Utility ===\n');
  
  // Connect to the database
  const connected = await connectDB();
  if (!connected) {
    console.error('Failed to connect to the database. Exiting...');
    process.exit(1);
  }
  
  // Target emails to update
  const targetEmails = [
    'admin@example.com',
    'educator@example.com',
    'student@example.com'
  ];
  
  try {
    // Reset passwords
    const updatedCount = await resetPasswords(targetEmails);
    
    if (updatedCount > 0) {
      console.log(`✅ Successfully reset passwords for ${updatedCount} users`);
    } else {
      console.log(`⚠️ No users found with the specified email addresses`);
      
      // Create users if they don't exist
      console.log('\nCreating missing users...');
      let createdCount = 0;
      
      const newPassword = 'password123';
      
      for (const email of targetEmails) {
        const exists = await User.findOne({ email });
        
        if (!exists) {
          const [role, name] = email.includes('admin') 
            ? ['admin', 'Admin User'] as ['admin', string] 
            : email.includes('educator') 
              ? ['educator', 'Educator User'] as ['educator', string]
              : ['student', 'Student User'] as ['student', string];
          
          await createUser({
            name,
            email,
            password: newPassword,
            role
          });
          
          createdCount++;
        }
      }
      
      if (createdCount > 0) {
        console.log(`\n✅ Created ${createdCount} new users`);
      } else {
        console.log(`\n⚠️ No new users created`);
      }
    }
    
    // List all users
    console.log('\nCurrent users in database:');
    const users = await User.find().select('name email role');
    
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) [${user.role}]`);
    });
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }

  console.log('\n🔐 Password reset complete! Users can now log in with password: password123');
  process.exit(0);
}

// Run the script
main().catch(error => {
  console.error(`Unhandled error: ${error}`);
  process.exit(1);
}); 