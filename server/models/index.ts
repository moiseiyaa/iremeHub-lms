// Export all models from a single file for easy imports elsewhere
console.log('Loading models...');

// Import all models
import User from './User';
import Course from './Course';
import Lesson from './Lesson';
import Section from './Section';
import Progress from './Progress';
import Payment from './Payment';
import Certificate from './Certificate';
import Announcement from './Announcement';
import { Blog } from './Blog';

console.log('All models loaded');

export {
  User,
  Course,
  Lesson,
  Section,
  Progress,
  Payment,
  Certificate,
  Announcement,
  Blog
};
