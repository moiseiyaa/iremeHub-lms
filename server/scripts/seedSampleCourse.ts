import mongoose from 'mongoose';
import connectDB from '../db';
import User from '../models/User';
import Course from '../models/Course';
import Section from '../models/Section';
import Lesson from '../models/Lesson';

(async () => {
  try {
    // Connect to MongoDB (uses MONGO_URI from .env)
    await connectDB();

    /*********************************************************************
     * 1. Ensure instructor & student accounts exist
     *********************************************************************/
    let educator = await User.findOne({ email: 'demo.educator@lms.com' });
    if (!educator) {
      educator = await User.create({
        name: 'Demo Educator',
        email: 'demo.educator@lms.com',
        password: 'password123',
        role: 'educator'
      });
      console.log('✅ Created demo educator (password: password123)');
    }

    let student = await User.findOne({ email: 'demo.student@lms.com' });
    if (!student) {
      student = await User.create({
        name: 'Demo Student',
        email: 'demo.student@lms.com',
        password: 'password123',
        role: 'student'
      });
      console.log('✅ Created demo student (password: password123)');
    }

    /*********************************************************************
     * 2. Create course (skip if present)
     *********************************************************************/
    const existing = await Course.findOne({ title: 'Modern Web Dev Bootcamp' });
    if (existing) {
      console.log('🚫 Sample course already exists, aborting.');
      process.exit(0);
    }

    const course = await Course.create({
      title: 'Modern Web Dev Bootcamp',
      description:
        'Beginner-friendly crash-course covering HTML, CSS, JavaScript & React with quizzes, assignment and final exam.',
      category: 'Web Development',
      level: 'Beginner',
      price: 0,
      isPublished: true,
      thumbnail: {
        url: 'https://placehold.co/600x400/0066ff/ffffff?text=Web+Dev+Bootcamp'
      },
      instructor: educator._id,
      enrolledStudents: [student._id]
    });
    console.log('📚 Created course');

    /*********************************************************************
     * 3. Sections
     *********************************************************************/
    const sections = await Section.insertMany([
      { title: 'Getting Started', course: course._id, order: 1 },
      { title: 'JavaScript Essentials', course: course._id, order: 2 },
      { title: 'React Basics', course: course._id, order: 3 }
    ]);
    console.log('📂 Created sections');

    /*********************************************************************
     * 4. Lessons helper
     *********************************************************************/
    let order = 1;
    const makeLesson = (data: Partial<InstanceType<typeof Lesson>> & { title: string; contentType: string }) => ({
      course: course._id,
      order: order++,
      completionTime: 10,
      isPreview: false,
      ...data
    });

    /*********************************************************************
     * 5. Lessons array (video, text, quiz, assignment, exam)
     *********************************************************************/
    const lessons = [
      // Getting Started
      makeLesson({
        title: 'Welcome & Overview',
        section: sections[0]._id,
        description: 'Course orientation and goals.',
        contentType: 'youtube',
        content: { youtubeVideoId: 'dpw9EHDh2bM' }
      }),
      makeLesson({
        title: 'HTML Fundamentals',
        section: sections[0]._id,
        description: 'Understanding tags & semantic HTML.',
        contentType: 'text',
        content: { textContent: '<h2>HTML Basics</h2><p>HTML is the skeleton...</p>' }
      }),
      makeLesson({
        title: 'CSS Crash-course',
        section: sections[0]._id,
        description: 'Selectors, box-model & flexbox.',
        contentType: 'video',
        content: { videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4' }
      }),
      makeLesson({
        title: 'Section 1 Quiz',
        section: sections[0]._id,
        description: 'Check your HTML & CSS knowledge.',
        contentType: 'quiz',
        content: {
          quizQuestions: [
            {
              question: 'What does CSS stand for?',
              options: [
                'Cascading Style Sheets',
                'Creative Style System',
                'Colorful Style Sheets',
                'Computer Style Syntax'
              ],
              correctAnswer: 0,
              points: 5
            }
          ]
        }
      }),

      // JS Essentials
      makeLesson({
        title: 'Intro to JavaScript',
        section: sections[1]._id,
        description: 'Why JS powers the web.',
        contentType: 'youtube',
        content: { youtubeVideoId: 'W6NZfCO5SIk' }
      }),
      makeLesson({
        title: 'Tip Calculator Assignment',
        section: sections[1]._id,
        description: 'Build a tip calculator app.',
        contentType: 'assignment',
        content: {
          assignmentInstructions: 'Create an interactive tip calculator supporting custom percentages.',
          assignmentRubric: 'Correctness, Code Quality, UX, Responsiveness',
          assignmentDueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        }
      }),

      // React Basics
      makeLesson({
        title: 'React Components & JSX',
        section: sections[2]._id,
        description: 'Component-based architecture.',
        contentType: 'youtube',
        content: { youtubeVideoId: 'w7ejDZ8SWv8' }
      }),
      makeLesson({
        title: 'State vs Props',
        section: sections[2]._id,
        description: 'Data flow in React.',
        contentType: 'text',
        content: { textContent: '<p>Props are read-only; state is mutable...</p>' }
      }),
      makeLesson({
        title: 'Final Exam',
        section: sections[2]._id,
        description: 'Comprehensive exam.',
        contentType: 'exam',
        content: {
          examQuestions: [
            {
              question: 'Which company maintains React?',
              options: ['Google', 'Facebook', 'Microsoft', 'Netflix'],
              correctAnswer: 1,
              points: 10
            },
            {
              question: 'Which HTML element contains JS code?',
              options: ['<js>', '<scripting>', '<script>', '<javascript>'],
              correctAnswer: 2,
              points: 10
            }
          ],
          examDuration: 30,
          passingScore: 70
        }
      })
    ];

    await Lesson.insertMany(lessons);
    console.log('▶️  Lessons inserted');

    /*********************************************************************
     * 6. Done
     *********************************************************************/
    console.log('🎉 Sample course seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
})();
