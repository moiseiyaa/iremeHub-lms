import connectDB from '../db';
import User from '../models/User';
import Course from '../models/Course';
import Section from '../models/Section';
import Lesson from '../models/Lesson';

(async () => {
  try {
    await connectDB();

    let educator = await User.findOne({ email: 'edu.sam@lms.com' });
    if (!educator) {
      console.error('Edu Sam not found; run previous seeder first');
      process.exit(1);
    }

    const exists = await Course.findOne({ title: 'Data Analysis Bootcamp (Self-Paced)' });
    if (exists) {
      console.log('Self-paced course already exists');
      process.exit(0);
    }

    // duplicate existing course structure if present
    const template = await Course.findOne({ title: 'Complete Data Analysis Bootcamp' });

    const course = await Course.create({
      title: 'Data Analysis Bootcamp (Self-Paced)',
      description: template ? template.description : 'Self-paced version – enroll instantly and start learning.',
      category: 'Data Science',
      level: 'Intermediate',
      price: 0,
      isPublished: true,
      thumbnail: {
        url: 'https://placehold.co/600x400/0984e3/ffffff?text=Data+Analysis+Self-Paced'
      },
      instructor: educator._id,
      enrolledStudents: []
    });

    // copy sections & lessons if template exists
    if (template) {
      const sections = await Section.find({ course: template._id });
      const sectionIdMap: Record<string, any> = {};
      for (const oldSec of sections) {
        const newSec = await Section.create({
          title: oldSec.title,
          description: oldSec.description,
          course: course._id,
          order: oldSec.order
        });
        sectionIdMap[oldSec._id.toString()] = newSec._id;
      }

      const lessons = await Lesson.find({ course: template._id });
      const bulk = lessons.map((l) => ({
        ...l.toObject(),
        _id: undefined,
        course: course._id,
        section: l.section ? sectionIdMap[l.section.toString()] : undefined,
        createdAt: new Date()
      }));
      await Lesson.insertMany(bulk);
    }

    console.log('🎉 Self-paced Data Analysis course created');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
