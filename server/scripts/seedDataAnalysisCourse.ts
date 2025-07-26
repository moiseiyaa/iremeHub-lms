import connectDB from '../db';
import User from '../models/User';
import Course from '../models/Course';
import Section from '../models/Section';
import Lesson, { ILesson } from '../models/Lesson';

async function seedCourse() {
  try {
    // 1. Connect to DB
    await connectDB();

    /*********************************************************************
     * 2. Ensure educator "Edu Sam" exists
     *********************************************************************/
    let educator = await User.findOne({ email: 'edu.sam@lms.com' });
    if (!educator) {
      educator = await User.create({
        name: 'Edu Sam',
        email: 'edu.sam@lms.com',
        password: 'password123',
        role: 'educator'
      });
      console.log('✅ Created educator Edu Sam (password: password123)');
    }

    /*********************************************************************
     * 3. Skip if course already seeded
     *********************************************************************/
    const existing = await Course.findOne({ title: 'Complete Data Analysis Bootcamp' });
    if (existing) {
      console.log('📚 Course already exists, skipping seed');
      return;
    }

    /*********************************************************************
     * 4. Create course
     *********************************************************************/
    // Create the course first
    const course = await Course.create({
      title: 'Complete Data Analysis Bootcamp',
      description: 'Hands-on pathway from raw data to insights: cleaning, EDA, statistics, visualisation & ML.',
      category: 'Data Science',
      level: 'Intermediate',
      price: 0,
      isPublished: true,
      thumbnail: {
        url: 'https://placehold.co/600x400/00b894/ffffff?text=Data+Analysis'
      },
      instructor: educator._id,
      enrolledStudents: []
    });

    // Create sections
    const sections = await Section.insertMany([
      { title: 'Introduction to Data Analysis', order: 1 },
      { title: 'Data Wrangling with Python', order: 2 },
      { title: 'Exploratory Data Analysis (EDA)', order: 3 },
      { title: 'Statistics for Data Analysis', order: 4 },
      { title: 'Data Visualisation', order: 5 },
      { title: 'Intro to Machine Learning', order: 6 }
    ].map(section => ({
      ...section,
      course: course._id
    })));

    // Create lessons helper
    let order = 1;
    const makeLesson = (data: Partial<ILesson> & { title: string; contentType: string }) => ({
      course: course._id,
      order: order++,
      completionTime: 12,
      isPreview: false,
      ...data
    });

    // Define and create lessons
    const lessons = [
      // INTRODUCTION
      makeLesson({
        title: 'Welcome & Syllabus Overview',
        section: sections[0]._id,
        description: 'Course goals, structure and required tools.',
        contentType: 'youtube',
        content: { youtubeVideoId: 'r-uOLxNrNk8' }
      }),
      makeLesson({
        title: 'Why Data Analysis Matters',
        section: sections[0]._id,
        description: 'Real-world impact case studies.',
        contentType: 'text',
        content: { textContent: '<p>Data drives decisions...</p>' }
      }),
      makeLesson({
        title: 'Introduction Quiz',
        section: sections[0]._id,
        description: 'Check basic understanding.',
        contentType: 'quiz',
        content: {
          quizQuestions: [
            {
              question: 'What is the first step in the data analysis pipeline?',
              options: ['Model building', 'Data collection', 'Deployment', 'Visualisation'],
              correctAnswer: 1,
              points: 5
            }
          ]
        }
      }),

      // DATA WRANGLING
      makeLesson({
        title: 'Loading CSV & Excel Files with Pandas',
        section: sections[1]._id,
        description: 'Hands-on demo with pandas.read_csv().',
        contentType: 'youtube',
        content: { youtubeVideoId: 'vmEHCJofslg' }
      }),
      makeLesson({
        title: 'Cleaning Missing Values – Assignment',
        section: sections[1]._id,
        description: 'Impute or drop? Practice dataset provided.',
        contentType: 'assignment',
        content: {
          assignmentInstructions: 'Clean the Titanic dataset: handle NaNs, encode categoricals, output clean CSV.',
          assignmentRubric: 'Completeness, Code quality, Reproducibility',
          assignmentDueDate: new Date(Date.now() + 7*24*60*60*1000)
        }
      }),

      // EDA
      makeLesson({
        title: 'Univariate Analysis',
        section: sections[2]._id,
        description: 'Distribution plots with Seaborn.',
        contentType: 'video',
        content: { videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4' }
      }),
      makeLesson({
        title: 'EDA Knowledge Check',
        section: sections[2]._id,
        description: '5-question quiz.',
        contentType: 'quiz',
        content: {
          quizQuestions: [
            {
              question: 'Which plot best shows correlation between two numerical variables?',
              options: ['Histogram', 'Box plot', 'Scatter plot', 'Pie chart'],
              correctAnswer: 2,
              points: 5
            }
          ]
        }
      }),

      // STATISTICS
      makeLesson({
        title: 'Descriptive Statistics',
        section: sections[3]._id,
        description: 'Mean, median, mode – demo in Python.',
        contentType: 'youtube',
        content: { youtubeVideoId: 'Vfo5le26IhY' }
      }),
      makeLesson({
        title: 'Hypothesis Testing – Assignment',
        section: sections[3]._id,
        description: 'A/B testing case study.',
        contentType: 'assignment',
        content: {
          assignmentInstructions: 'Perform t-test on provided marketing dataset and interpret results.',
          assignmentRubric: 'Correct test, Interpretation, Code style',
          assignmentDueDate: new Date(Date.now() + 14*24*60*60*1000)
        }
      }),

      // VISUALISATION
      makeLesson({
        title: 'Creating Dashboards with Plotly',
        section: sections[4]._id,
        description: 'Interactive visuals for executives.',
        contentType: 'youtube',
        content: { youtubeVideoId: 'Xc4xYacTu-E' }
      }),

      // MACHINE LEARNING
      makeLesson({
        title: 'Intro to Regression Models',
        section: sections[5]._id,
        description: 'Building first ML model in scikit-learn.',
        contentType: 'youtube',
        content: { youtubeVideoId: 'HcA0bUE9H8Q' }
      }),
      makeLesson({
        title: 'Capstone Project',
        section: sections[5]._id,
        description: 'End-to-end analysis and model on custom dataset.',
        contentType: 'exam',
        content: {
          examQuestions: [
            {
              question: 'Upload your notebook & link to dashboard (peer-graded).',
              options: ['Submitted', 'Not submitted'],
              correctAnswer: 0,
              points: 100
            }
          ],
          examDuration: 0,
          passingScore: 60
        }
      })
    ];

    // Create all lessons in the database
    const createdLessons = await Lesson.insertMany(lessons);
    
    // Update course with lessons
    await Course.findByIdAndUpdate(course._id, {
      lessons: createdLessons.map(l => l._id)
    });

    // Refresh course with populated data
    await course.populate('lessons');
    console.log('✅ Course and lessons created:', course.title);
    console.log('📚 Created Data Analysis course');

  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

// Execute the seeding function
seedCourse();
