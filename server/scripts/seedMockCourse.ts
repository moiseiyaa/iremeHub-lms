import mongoose from 'mongoose';
import connectDB from '../db';
import User from '../models/User';
import Course from '../models/Course';
import Section from '../models/Section';
import Lesson from '../models/Lesson';

(async () => {
  try {
    // Connect to database
    await connectDB();

    // ------------------------------------------------------------------
    // 1. Ensure we have an educator account to assign as course instructor
    // ------------------------------------------------------------------
    let educator = await User.findOne({ email: 'demo.educator@lms.com' });

    if (!educator) {
      educator = await User.create({
        name: 'Demo Educator',
        email: 'demo.educator@lms.com',
        password: 'password123',
        role: 'educator'
      });
      console.log('✅ Created demo educator user (email: demo.educator@lms.com, password: password123)');
    } else {
      console.log('ℹ️  Using existing demo educator user');
    }

    // ------------------------------------------------------------------
    // 2. Create course (skip if it already exists)
    // ------------------------------------------------------------------
    const existingCourse = await Course.findOne({ title: 'Free Web Development Bootcamp' });
    if (existingCourse) {
      console.log('🚫 Mock course already exists – nothing to seed.');
      process.exit(0);
    }

    const course = await Course.create({
      title: 'Free Web Development Bootcamp',
      description:
        'A hands-on, beginner-friendly crash course that walks you through HTML, CSS, JavaScript and React. Includes quizzes, an assignment and a final exam. 💯% free.',
      category: 'Web Development',
      level: 'Beginner',
      price: 0,
      isPublished: true,
      thumbnail: {
        url: 'https://placehold.co/600x400/0091ff/ffffff?text=Web+Dev+Bootcamp'
      },
      instructor: educator._id
    });
    console.log('📚 Created course');

    // ------------------------------------------------------------------
    // 3. Create sections
    // ------------------------------------------------------------------
    const sections = await Section.insertMany([
      { title: 'Getting Started', course: course._id, order: 1 },
      { title: 'JavaScript Essentials', course: course._id, order: 2 },
      { title: 'React Basics', course: course._id, order: 3 }
    ]);
    console.log('📂 Created sections');

    // ------------------------------------------------------------------
    // 4. Helper to build lesson docs with incremental order
    // ------------------------------------------------------------------
    let orderCounter = 1;
    const createLesson = (data: Partial<InstanceType<typeof Lesson>> & { contentType: any; title: string; description: string }) => ({
      course: course._id,
      order: orderCounter++,
      completionTime: 10,
      isPreview: false,
      ...data
    });

    // ------------------------------------------------------------------
    // 5. Build lessons array
    // ------------------------------------------------------------------
    const lessonsData = [
      // Section 1
      createLesson({
        title: 'Welcome & Course Overview',
        description: 'What we will build and how the course works.',
        section: sections[0]._id,
        contentType: 'youtube',
        content: {
          youtubeVideoId: 'dpw9EHDh2bM' // Example YouTube ID
        }
      }),
      createLesson({
        title: 'HTML Fundamentals',
        description: 'Learn about tags, elements and semantic HTML.',
        section: sections[0]._id,
        contentType: 'text',
        content: {
          textContent: '<h2>HTML Basics</h2><p>HTML is the skeleton of every webpage...</p>'
        }
      }),
      createLesson({
        title: 'Building Your First Page',
        description: 'Hands-on walkthrough building a personal profile page.',
        section: sections[0]._id,
        contentType: 'video',
        content: {
          videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
        }
      }),
      createLesson({
        title: 'Section 1 Quiz',
        description: 'Test your knowledge of HTML & CSS.',
        section: sections[0]._id,
        contentType: 'quiz',
        content: {
          quizQuestions: [
            {
              question: 'What does HTML stand for?',
              options: [
                'Hyper Trainer Marking Language',
                'HyperText Markup Language',
                'HighText Machine Language',
                'None of the above'
              ],
              correctAnswer: 1,
              points: 5
            },
            {
              question: 'Which tag is used for the largest heading?',
              options: ['<h6>', '<head>', '<h1>', '<heading>'],
              correctAnswer: 2,
              points: 5
            }
          ]
        }
      }),

      // Section 2
      createLesson({
        title: 'Intro to JavaScript',
        description: 'Why JS matters and how browsers run it.',
        section: sections[1]._id,
        contentType: 'youtube',
        content: {
          youtubeVideoId: 'W6NZfCO5SIk'
        }
      }),
      createLesson({
        title: 'Variables & Data Types',
        description: 'Let, const, var — and when to use each.',
        section: sections[1]._id,
        contentType: 'text',
        content: {
          textContent: '<p>JavaScript has 7 primitive data types: string, number, boolean, null, undefined, symbol, bigint.</p>'
        }
      }),
      createLesson({
        title: 'Coding Challenge: Build a Tip Calculator',
        description: 'Apply what you have learned so far.',
        section: sections[1]._id,
        contentType: 'assignment',
        content: {
          assignmentInstructions: 'Create an interactive tip calculator that supports variable tip percentages.',
          assignmentRubric: '25% Correctness, 25% Code Quality, 25% UX, 25% Responsiveness',
          assignmentDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // One week from now
        }
      }),

      // Section 3
      createLesson({
        title: 'Getting Started with React',
        description: 'Component-based thinking and JSX basics.',
        section: sections[2]._id,
        contentType: 'youtube',
        content: {
          youtubeVideoId: 'w7ejDZ8SWv8'
        }
      }),
      createLesson({
        title: 'State & Props',
        description: 'Data flow and interactivity in React applications.',
        section: sections[2]._id,
        contentType: 'text',
        content: {
          textContent: '<p>Props are read-only, state is mutable...</p>'
        }
      }),
      createLesson({
        title: 'Final Exam',
        description: 'Comprehensive exam covering the entire course content.',
        section: sections[2]._id,
        contentType: 'exam',
        content: {
          examQuestions: [
            {
              question: 'Which company created React?',
              options: ['Google', 'Facebook', 'Microsoft', 'Amazon'],
              correctAnswer: 1,
              points: 10
            },
            {
              question: 'Inside which HTML element do we put the JavaScript?',
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

    // ------------------------------------------------------------------
    // 6. Insert lessons
    // ------------------------------------------------------------------
    await Lesson.insertMany(lessonsData);
    console.log('▶️  Created lessons');

    console.log('🎉 Mock course seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
})(); 