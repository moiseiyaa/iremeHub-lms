import mongoose from 'mongoose';
import dotenv from 'dotenv';
import yargs from 'yargs';
import path from 'path';
import { hideBin } from 'yargs/helpers';

// Models
import User from '../models/User';
import Course from '../models/Course';

// Load environment variables from root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const argv = yargs(hideBin(process.argv))
  .option('email', {
    alias: 'e',
    type: 'string',
    description: 'Educator email address',
    demandOption: true
  })
  .help()
  .alias('help', 'h').argv as { email: string };

(async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/iremehub';
  await mongoose.connect(mongoURI);
  console.log(`Connected to Mongo at ${mongoURI}`);

  const educator = await User.findOne({ email: argv.email });
  if (!educator) {
    console.error(`❌ No user found with email ${argv.email}`);
    process.exit(1);
  }

  // Update all courses to have this instructor
  const { modifiedCount } = await Course.updateMany({}, { instructor: educator._id });
  console.log(`✅ Updated instructor field on ${modifiedCount} courses to ${educator._id}`);

  // Optional: ensure createdCourses contains all course ids
  const courseIds = await Course.find().distinct('_id');
  const updatedCreatedCourses = Array.from(new Set([...(educator.createdCourses || []), ...courseIds]));
  educator.createdCourses = updatedCreatedCourses;
  await educator.save();
  console.log(`✅ Ensured educator.createdCourses has ${updatedCreatedCourses.length} course ids.`);

  await mongoose.disconnect();
  console.log('Done.');
})();
