// Usage: node server/scripts/setEducatorAsInstructor.js edusam@example.com

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models (compiled JS versions in dist or via ts-node register). We can require TS files directly since they transpile to JS under ts-node during runtime, but here Node runs plain JS. The compiled JS is located in dist if built. To keep simple, require compiled JS if exists; otherwise fall back to TypeScript via ts-node/register.
try {
  require('ts-node/register');
} catch (err) {
  // ignore if ts-node not installed
}

const User = require('../models/User').default || require('../models/User');
const Course = require('../models/Course').default || require('../models/Course');

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('❌  Provide educator email: node setEducatorAsInstructor.js <email>');
    process.exit(1);
  }

  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/iremehub';
  await mongoose.connect(mongoURI);
  console.log(`Connected to Mongo at ${mongoURI}`);

  const educator = await User.findOne({ email });
  if (!educator) {
    console.error(`❌ No user found with email ${email}`);
    process.exit(1);
  }

  // Update all courses' instructor field
  const res = await Course.updateMany({}, { instructor: educator._id });
  console.log(`✅ Updated ${res.modifiedCount || res.nModified || 0} courses.`);

  // Ensure createdCourses list
  const courseIds = await Course.find().distinct('_id');
  educator.createdCourses = Array.from(new Set([...(educator.createdCourses || []), ...courseIds]));
  await educator.save();
  console.log(`✅ educator.createdCourses now has ${educator.createdCourses.length} courses.`);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
