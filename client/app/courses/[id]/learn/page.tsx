'use client';

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiGet, apiPost } from '../../../api/apiClient';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon, CheckIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface Lesson {
  _id: string;
  title: string;
  description: string;
  contentType: string;
  content: {
    videoUrl?: string;
    textContent?: string;
    youtubeVideoId?: string;
    quizQuestions?: {
      question: string;
      options: string[];
      correctAnswer: number;
      points: number;
    }[];
    assignmentInstructions?: string;
    assignmentRubric?: string;
    assignmentDueDate?: string;
    examQuestions?: {
      question: string;
      options: string[];
      correctAnswer: number;
      points: number;
    }[];
    examDuration?: number;
    passingScore?: number;
  };
  isPreview: boolean;
  order: number;
  completionTime: number;
  section?: {
    _id: string;
    title: string;
  };
}

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnail: {
    url: string;
  };
  price: number;
  instructor: {
    _id: string;
    name: string;
    email: string;
    avatar: {
      url: string;
    };
  };
}

interface Progress {
  completedLessons: string[];
  lastAccessed: string;
  progressPercentage: number;
  totalLessons: number;
  completed: boolean;
  nextLesson: Lesson | null;
  quizResults?: {
    lesson: string;
    score: number;
    totalQuestions: number;
    answers: {
      questionIndex: number;
      selectedOption: number;
      isCorrect: boolean;
      points: number;
    }[];
    attempts: number;
    completedAt: string;
  }[];
  assignmentSubmissions?: {
    lesson: string;
    submissionText: string;
    submittedAt: string;
    grade?: number;
    feedback?: string;
    graded: boolean;
  }[];
  examResults?: {
    lesson: string;
    score: number;
    totalPoints: number;
    percentageScore: number;
    passed: boolean;
    answers: {
      questionIndex: number;
      selectedOption: number;
      isCorrect: boolean;
      points: number;
    }[];
    startedAt: string;
    completedAt: string;
    timeSpent: number;
  }[];
}

interface CoursePageProps {
  params: {
    id: string;
  };
}

export default function CourseLearnPage({ params }: CoursePageProps) {
  // Unwrap the params promise properly
  const unwrappedParams = React.use(params);
  const courseId = unwrappedParams.id;
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('lesson');
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [error, setError] = useState('');
  const [completingLesson, setCompletingLesson] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<{ correct: boolean; score: number; total: number } | null>(null);
  
  // Assignment state
  const [assignmentText, setAssignmentText] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);
  
  // Exam state
  const [examAnswers, setExamAnswers] = useState<number[]>([]);
  const [examMode, setExamMode] = useState(false);
  const [examStartTime, setExamStartTime] = useState<Date | null>(null);
  const [examTimeRemaining, setExamTimeRemaining] = useState<number>(0);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examResults, setExamResults] = useState<{
    passed: boolean;
    score: number;
    total: number;
    percentageScore: number;
    requiredPassingScore: number;
  } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Group lessons by section
  const lessonsBySection = lessons.reduce((acc: Record<string, Lesson[]>, lesson) => {
    const sectionId = lesson.section?._id || 'uncategorized';
    if (!acc[sectionId]) {
      acc[sectionId] = [];
    }
    acc[sectionId].push(lesson);
    return acc;
  }, {});

  // Check if a lesson is completed
  const isLessonCompleted = (lessonId: string) => {
    return progress?.completedLessons.includes(lessonId) || false;
  };

  // Get previous submission for assignment
  const getAssignmentSubmission = (lessonId: string) => {
    if (!progress?.assignmentSubmissions) return null;
    return progress.assignmentSubmissions.find(sub => sub.lesson === lessonId);
  };
  
  // Get previous exam result
  const getExamResult = (lessonId: string) => {
    if (!progress?.examResults) return null;
    return progress.examResults.find(exam => exam.lesson === lessonId);
  };

  // Determine if the current lesson should be a quiz based on the sequence
  const shouldBeQuiz = (lesson: Lesson) => {
    // Every 3rd lesson is a quiz
    return lesson.order % 3 === 0;
  };

  // Determine if the current lesson should be an assignment based on the sequence
  const shouldBeAssignment = (lesson: Lesson) => {
    // After 2 more lessons (5th lesson, 8th lesson, etc.) following a quiz
    return (lesson.order - 2) % 3 === 0;
  };

  // Determine if the lesson is the final lesson (for the exam)
  const isFinalLesson = (lesson: Lesson) => {
    if (!lessons.length) return false;
    const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
    return lesson.order === sortedLessons[sortedLessons.length - 1].order;
  };

  // Get the next lesson
  const getNextLesson = () => {
    if (!currentLesson || !lessons.length) return null;
    
    const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
    const currentIndex = sortedLessons.findIndex(l => l._id === currentLesson._id);
    
    if (currentIndex < sortedLessons.length - 1) {
      return sortedLessons[currentIndex + 1];
    }
    
    return null;
  };

  // Get the previous lesson
  const getPreviousLesson = () => {
    if (!currentLesson || !lessons.length) return null;
    
    const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
    const currentIndex = sortedLessons.findIndex(l => l._id === currentLesson._id);
    
    if (currentIndex > 0) {
      return sortedLessons[currentIndex - 1];
    }
    
    return null;
  };

  // Load course and lessons
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // ALWAYS load public data first to ensure the page works without auth
        console.log('Loading public course data first');
        const publicCourseData = await apiGet(`/courses/${courseId}`, false);
        
        if (typeof publicCourseData === 'object') {
          // Set course data from public endpoint
          if (publicCourseData.success !== undefined) {
            if (publicCourseData.success && publicCourseData.data) {
              setCourse(publicCourseData.data);
            }
          } else {
            setCourse(publicCourseData);
          }
          
          // Also get public lessons (preview only)
          const publicLessonsData = await apiGet(`/courses/${courseId}/lessons`, false);
          if (typeof publicLessonsData === 'object') {
            if (publicLessonsData.success !== undefined) {
              if (publicLessonsData.success && publicLessonsData.data) {
                setLessons(publicLessonsData.data);
              }
            } else if (Array.isArray(publicLessonsData)) {
              setLessons(publicLessonsData);
            }
          }
          
          // Now that we have public data, try to get authenticated data
          const token = localStorage.getItem('token');
          if (token) {
            console.log('Attempting to load authenticated data');
            try {
              // Try to get enrollment and progress data
              const authCourseData = await apiGet(`/courses/${courseId}/with-progress`, true);
              if (typeof authCourseData === 'object') {
                if (authCourseData.success !== undefined) {
                  if (authCourseData.success && authCourseData.data) {
                    if (authCourseData.data.course) setCourse(authCourseData.data.course);
                    if (authCourseData.data.progress) setProgress(authCourseData.data.progress);
                  }
                } else {
                  if (authCourseData.course) setCourse(authCourseData.course);
                  if (authCourseData.progress) setProgress(authCourseData.progress);
                }
              }
              
              // Try to get authenticated lessons
              const authLessonsData = await apiGet(`/courses/${courseId}/lessons`, true);
              if (typeof authLessonsData === 'object') {
                if (authLessonsData.success !== undefined) {
                  if (authLessonsData.success && authLessonsData.data) {
                    setLessons(authLessonsData.data);
                  }
                } else if (Array.isArray(authLessonsData)) {
                  setLessons(authLessonsData);
                }
              }
            } catch (authError) {
              // Authentication errors should not prevent viewing the course
              console.error('Authentication failed but course can still be viewed:', authError);
            }
          }
        } else {
          throw new Error('Failed to load course data');
        }
      } catch (err) {
        console.error('Course fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId]);

  // Load specific lesson when lessonId changes
  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId) {
        // If no lesson ID is provided, show the first lesson or next incomplete lesson
        if (lessons.length > 0) {
          const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
          
          // Find the first incomplete lesson
          if (progress?.completedLessons) {
            const nextLesson = sortedLessons.find(l => !progress.completedLessons.includes(l._id));
            if (nextLesson) {
              router.replace(`/courses/${courseId}/learn?lesson=${nextLesson._id}`);
              return;
            }
          }
          
          // If all lessons are complete or no progress, show the first lesson
          router.replace(`/courses/${courseId}/learn?lesson=${sortedLessons[0]._id}`);
        }
        return;
      }
      
      // If the lesson ID is already in the loaded lessons, use that
      const lessonFromList = lessons.find(l => l._id === lessonId);
      if (lessonFromList) {
        setCurrentLesson(lessonFromList);
        // Reset quiz state
        setQuizAnswers([]);
        setQuizSubmitted(false);
        setQuizResults(null);
        return;
      }
      
      // Otherwise, fetch the lesson data
      try {
        setLessonLoading(true);
        const lessonData = await apiGet(`/lessons/${lessonId}`, true);
        setCurrentLesson(lessonData.data);
        
        // Reset quiz state
        setQuizAnswers([]);
        setQuizSubmitted(false);
        setQuizResults(null);
      } catch (err) {
        console.error('Lesson fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load lesson');
      } finally {
        setLessonLoading(false);
      }
    };
    
    if (!loading) {
      fetchLessonData();
    }
  }, [lessonId, lessons, loading, courseId, progress?.completedLessons, router]);

  // Handle marking lesson as complete
  const markLessonComplete = async () => {
    if (!currentLesson) return;
    
    try {
      setCompletingLesson(true);
      await apiPost(`/courses/${courseId}/lessons/${currentLesson._id}/complete`, {}, true);
      
      // Update local progress state
      if (progress) {
        const updatedCompletedLessons = [...progress.completedLessons];
        if (!updatedCompletedLessons.includes(currentLesson._id)) {
          updatedCompletedLessons.push(currentLesson._id);
        }
        
        setProgress({
          ...progress,
          completedLessons: updatedCompletedLessons,
          progressPercentage: (updatedCompletedLessons.length / progress.totalLessons) * 100
        });
      }
      
      // If there's a next lesson, navigate to it
      const nextLesson = getNextLesson();
      if (nextLesson) {
        router.push(`/courses/${courseId}/learn?lesson=${nextLesson._id}`);
      }
    } catch (err) {
      console.error('Error marking lesson as complete:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark lesson as complete');
    } finally {
      setCompletingLesson(false);
    }
  };

  // Handle quiz submission
  const handleQuizSubmit = async () => {
    if (!currentLesson || !currentLesson.content.quizQuestions) return;
    
    // Calculate score
    let score = 0;
    let total = 0;
    
    currentLesson.content.quizQuestions.forEach((question, index) => {
      total += question.points;
      if (quizAnswers[index] === question.correctAnswer) {
        score += question.points;
      }
    });
    
    // Set quiz results
    setQuizResults({
      correct: score === total,
      score,
      total
    });
    
    setQuizSubmitted(true);
    
    // Mark as complete if score is acceptable (e.g., > 70%)
    if (score / total >= 0.7) {
      await markLessonComplete();
    }
  };

  // Format time remaining for exam
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Handle assignment submission
  const handleAssignmentSubmit = async () => {
    if (!currentLesson || submittingAssignment || !assignmentText.trim()) return;
    
    try {
      setSubmittingAssignment(true);
      
      const response = await apiPost(`/lessons/${currentLesson._id}/assignment`, {
        submissionText: assignmentText
      }, true);
      
      if (response.success) {
        setAssignmentSubmitted(true);
        await markLessonComplete();
      }
    } catch (err) {
      console.error('Error submitting assignment:', err);
    } finally {
      setSubmittingAssignment(false);
    }
  };

  // Start exam
  const handleStartExam = async () => {
    if (!currentLesson) return;
    
    try {
      const response = await apiPost(`/lessons/${currentLesson._id}/exam/start`, {}, true);
      
      if (response.success) {
        const examData = response.data;
        
        // If exam already completed and passed, just mark as complete
        if (examData.message === 'Exam already completed and passed') {
          setExamResults({
            passed: true,
            score: examData.data.score,
            total: examData.data.totalPoints,
            percentageScore: examData.data.percentageScore,
            requiredPassingScore: examData.data.passingScore || 85
          });
          setExamSubmitted(true);
          return;
        }
        
        // Set exam mode
        setExamMode(true);
        setExamStartTime(new Date(examData.startedAt || new Date()));
        setExamTimeRemaining(examData.timeLimit * 60);
        
        // Initialize empty answers array
        if (currentLesson.content.examQuestions) {
          setExamAnswers(new Array(currentLesson.content.examQuestions.length).fill(undefined));
        }
      }
    } catch (err) {
      console.error('Error starting exam:', err);
    }
  };

  // Submit exam
  const handleExamSubmit = async () => {
    if (!currentLesson || !examStartTime) return;
    
    try {
      const response = await apiPost(`/lessons/${currentLesson._id}/exam/submit`, {
        answers: examAnswers,
        startedAt: examStartTime
      }, true);
      
      if (response.success) {
        const result = response.data;
        
        // Update exam results state
        setExamResults({
          passed: result.passed,
          score: result.examResult.score,
          total: result.examResult.totalPoints,
          percentageScore: result.percentageScore,
          requiredPassingScore: result.requiredPassingScore
        });
        
        setExamSubmitted(true);
        setExamMode(false);
        
        // If passed, mark lesson as complete
        if (result.passed) {
          await markLessonComplete();
        }
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-2xl">😕</div>
          <h2 className="mt-2 text-xl font-semibold text-gray-900">Error</h2>
          <p className="mt-1 text-gray-500">{error}</p>
          <Link href={`/courses/${courseId}`} className="btn-primary mt-4 inline-block">
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="text-gray-500 text-2xl">🔍</div>
          <h2 className="mt-2 text-xl font-semibold text-gray-900">Course Not Found</h2>
          <p className="mt-1 text-gray-500">The course you&apos;re looking for does not exist.</p>
          <Link href="/courses" className="btn-primary mt-4 inline-block">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  // Generate width class based on progress percentage
  const getProgressWidthClass = (percentage: number) => {
    // Round to nearest 5%
    const roundedPercentage = Math.round(percentage / 5) * 5;
    return `w-[${roundedPercentage}%]`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href={`/courses/${courseId}`} className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Back to Course
          </Link>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-4 hidden sm:inline-block">
              {progress ? `${progress.completedLessons.length} of ${progress.totalLessons} lessons completed` : ''}
            </span>
            
            <div className="relative h-2 bg-gray-200 rounded-full w-32 sm:w-48">
              <div 
                className={`absolute h-2 bg-indigo-500 rounded-full ${getProgressWidthClass(progress?.progressPercentage || 0)}`}
                style={{ width: `${progress?.progressPercentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex min-h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <div className={`bg-white border-r w-full max-w-sm flex-shrink-0 overflow-y-auto transition-all duration-300 ease-in-out fixed inset-y-0 mt-[65px] z-10 ${showSidebar ? 'left-0' : '-left-full sm:left-0'} sm:static`}>
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-bold text-gray-900">{course.title}</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1 rounded-full hover:bg-gray-100 sm:hidden"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-4">
            {/* Sections and lessons */}
            {Object.entries(lessonsBySection).map(([sectionId, sectionLessons]) => {
              const section = sectionLessons[0]?.section;
              
              return (
                <div key={sectionId} className="mb-4">
                  {section && (
                    <h3 className="font-medium text-gray-900 mb-2">
                      {section.title}
                    </h3>
                  )}
                  
                  <div className="space-y-1">
                    {sectionLessons.map((lesson) => {
                      // Determine content type label
                      let contentTypeLabel = 'Lesson';
                      let typeClass = 'bg-blue-100 text-blue-800';
                      
                      if (lesson.contentType === 'quiz' || shouldBeQuiz(lesson)) {
                        contentTypeLabel = 'Quiz';
                        typeClass = 'bg-purple-100 text-purple-800';
                      } else if (lesson.contentType === 'assignment' || shouldBeAssignment(lesson)) {
                        contentTypeLabel = 'Assignment';
                        typeClass = 'bg-yellow-100 text-yellow-800';
                      } else if (lesson.contentType === 'exam' || isFinalLesson(lesson)) {
                        contentTypeLabel = 'Exam';
                        typeClass = 'bg-red-100 text-red-800';
                      }
                      
                      return (
                        <Link
                          key={lesson._id}
                          href={`/courses/${courseId}/learn?lesson=${lesson._id}`}
                          className={`flex items-start p-2 rounded-md hover:bg-gray-50 ${
                            currentLesson?._id === lesson._id ? 'bg-indigo-50' : ''
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {isLessonCompleted(lesson._id) ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                            <div className="flex items-center mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${typeClass}`}>
                                {contentTypeLabel}
                              </span>
                              {lesson.completionTime && (
                                <span className="text-xs text-gray-500 ml-2">
                                  {lesson.completionTime} min
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Mobile menu button */}
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed bottom-4 left-4 z-20 p-3 bg-indigo-600 text-white rounded-full shadow-lg sm:hidden"
          aria-label="Open sidebar menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        
        {/* Main lesson content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {lessonLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : currentLesson ? (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Lesson content */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentLesson.title}</h2>
                  
                  {/* Video content */}
                  {currentLesson.contentType === 'video' && currentLesson.content?.videoUrl && (
                    <div className="aspect-w-16 aspect-h-9 mb-6">
                      <video
                        ref={videoRef}
                        src={currentLesson.content.videoUrl}
                        controls
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}
                  
                  {/* YouTube content */}
                  {currentLesson.contentType === 'youtube' && currentLesson.content?.youtubeVideoId && (
                    <div className="aspect-w-16 aspect-h-9 mb-6">
                      <iframe
                        src={`https://www.youtube.com/embed/${currentLesson.content.youtubeVideoId}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full rounded-lg"
                        title={`${currentLesson.title} - Video`}
                      />
                    </div>
                  )}
                  
                  {/* Text content */}
                  {currentLesson.contentType === 'text' && currentLesson.content?.textContent && (
                    <div className="prose prose-indigo max-w-none mb-6">
                      <div dangerouslySetInnerHTML={{ __html: currentLesson.content.textContent }} />
                    </div>
                  )}
                  
                  {/* Quiz content */}
                  {currentLesson.contentType === 'quiz' && currentLesson.content?.quizQuestions && (
                    <div className="mb-6">
                      <div className="mb-4 text-lg font-medium text-gray-900">Quiz</div>
                      
                      {quizSubmitted && quizResults ? (
                        <div className={`p-4 rounded-md mb-4 ${
                          quizResults.correct ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
                        }`}>
                          <div className="font-medium">
                            {quizResults.correct 
                              ? 'Congratulations! You passed the quiz.' 
                              : 'You scored below the passing threshold.'}
                          </div>
                          <div className="mt-1">
                            Score: {quizResults.score} out of {quizResults.total} points
                            ({Math.round((quizResults.score / quizResults.total) * 100)}%)
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {currentLesson.content.quizQuestions.map((question, qIndex) => (
                            <div key={qIndex} className="border border-gray-200 rounded-md p-4">
                              <div className="font-medium mb-3">{question.question}</div>
                              <div className="space-y-2">
                                {question.options.map((option, oIndex) => (
                                  <div key={oIndex} className="flex items-center">
                                    <input
                                      type="radio"
                                      id={`q${qIndex}-o${oIndex}`}
                                      name={`question-${qIndex}`}
                                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                      checked={quizAnswers[qIndex] === oIndex}
                                      onChange={() => {
                                        const newAnswers = [...quizAnswers];
                                        newAnswers[qIndex] = oIndex;
                                        setQuizAnswers(newAnswers);
                                      }}
                                    />
                                    <label htmlFor={`q${qIndex}-o${oIndex}`} className="ml-2 block text-sm text-gray-700">
                                      {option}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          
                          <div className="flex justify-end">
                            <button
                              onClick={handleQuizSubmit}
                              disabled={quizAnswers.length !== currentLesson.content.quizQuestions.length || 
                                quizAnswers.some(a => a === undefined)}
                              className={`btn-primary ${
                                quizAnswers.length !== currentLesson.content.quizQuestions.length || 
                                quizAnswers.some(a => a === undefined)
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                            >
                              Submit Quiz
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Assignment content */}
                  {currentLesson.contentType === 'assignment' && (
                    <div className="mb-6">
                      <div className="mb-4 text-lg font-medium text-gray-900">Assignment</div>
                      
                      <div className="prose prose-indigo max-w-none mb-6">
                        {currentLesson.content?.assignmentInstructions && (
                          <div dangerouslySetInnerHTML={{ __html: currentLesson.content.assignmentInstructions }} />
                        )}
                      </div>
                      
                      {/* Check if assignment already submitted */}
                      {getAssignmentSubmission(currentLesson._id) ? (
                        <div className="p-4 rounded-md mb-4 bg-green-50 text-green-800">
                          <div className="font-medium">Assignment Submitted</div>
                          <div className="mt-1">
                            {getAssignmentSubmission(currentLesson._id)?.graded 
                              ? `Grade: ${getAssignmentSubmission(currentLesson._id)?.grade}`
                              : 'Your submission is pending review.'}
                          </div>
                        </div>
                      ) : (
                        <>
                          {assignmentSubmitted ? (
                            <div className="p-4 rounded-md mb-4 bg-green-50 text-green-800">
                              <div className="font-medium">Assignment Submitted Successfully</div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="border border-gray-200 rounded-md p-4">
                                <label htmlFor="assignment-submission" className="block font-medium text-gray-700 mb-2">
                                  Your Solution
                                </label>
                                <textarea
                                  id="assignment-submission"
                                  rows={6}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="Enter your assignment solution here..."
                                  value={assignmentText}
                                  onChange={(e) => setAssignmentText(e.target.value)}
                                ></textarea>
                              </div>
                              
                              <div className="flex justify-end">
                                <button
                                  onClick={handleAssignmentSubmit}
                                  disabled={!assignmentText.trim() || submittingAssignment}
                                  className={`btn-primary ${
                                    !assignmentText.trim() || submittingAssignment
                                      ? 'opacity-50 cursor-not-allowed'
                                      : ''
                                  }`}
                                >
                                  {submittingAssignment ? (
                                    <>
                                      <span className="inline-block animate-spin mr-2">⟳</span>
                                      Submitting...
                                    </>
                                  ) : (
                                    'Submit Assignment'
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Exam content */}
                  {currentLesson.contentType === 'exam' && (
                    <div className="mb-6">
                      <div className="mb-4 flex justify-between items-center">
                        <div className="text-lg font-medium text-gray-900">Final Exam</div>
                        {examMode && !examSubmitted && (
                          <div className="text-sm font-medium text-red-600">
                            Time Remaining: {formatTimeRemaining(examTimeRemaining)}
                          </div>
                        )}
                      </div>
                      
                      {/* Check if exam already taken and passed */}
                      {getExamResult(currentLesson._id) && getExamResult(currentLesson._id)?.passed ? (
                        <div className="p-4 rounded-md mb-4 bg-green-50 text-green-800">
                          <div className="font-medium">Exam Passed</div>
                          <div className="mt-1">
                            Score: {getExamResult(currentLesson._id)?.percentageScore.toFixed(2)}%
                          </div>
                        </div>
                      ) : examSubmitted && examResults ? (
                        <div className={`p-4 rounded-md mb-4 ${
                          examResults.passed ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}>
                          <div className="font-medium">
                            {examResults.passed 
                              ? 'Congratulations! You passed the exam.' 
                              : 'You did not meet the passing threshold.'}
                          </div>
                          <div className="mt-1">
                            Score: {examResults.score} out of {examResults.total} points
                            ({examResults.percentageScore.toFixed(2)}%)
                          </div>
                          <div className="mt-1">
                            Passing Score: {examResults.requiredPassingScore}%
                          </div>
                          {!examResults.passed && (
                            <div className="mt-3">
                              <button
                                onClick={() => {
                                  setExamMode(false);
                                  setExamSubmitted(false);
                                  setExamResults(null);
                                  setExamAnswers([]);
                                }}
                                className="btn-primary"
                              >
                                Retry Exam
                              </button>
                            </div>
                          )}
                        </div>
                      ) : examMode && currentLesson.content?.examQuestions ? (
                        <div className="space-y-6">
                          {currentLesson.content.examQuestions.map((question, qIndex) => (
                            <div key={qIndex} className="border border-gray-200 rounded-md p-4">
                              <div className="font-medium mb-3">{question.question}</div>
                              <div className="space-y-2">
                                {question.options.map((option, oIndex) => (
                                  <div key={oIndex} className="flex items-center">
                                    <input
                                      type="radio"
                                      id={`exam-q${qIndex}-o${oIndex}`}
                                      name={`exam-question-${qIndex}`}
                                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                      checked={examAnswers[qIndex] === oIndex}
                                      onChange={() => {
                                        const newAnswers = [...examAnswers];
                                        newAnswers[qIndex] = oIndex;
                                        setExamAnswers(newAnswers);
                                      }}
                                    />
                                    <label htmlFor={`exam-q${qIndex}-o${oIndex}`} className="ml-2 block text-sm text-gray-700">
                                      {option}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          
                          <div className="flex justify-end">
                            <button
                              onClick={handleExamSubmit}
                              disabled={examAnswers.length !== currentLesson.content.examQuestions.length || 
                                examAnswers.some(a => a === undefined)}
                              className={`btn-primary ${
                                examAnswers.length !== currentLesson.content.examQuestions.length || 
                                examAnswers.some(a => a === undefined)
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                            >
                              Submit Exam
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-8 border border-gray-200 rounded-md">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Take the Final Exam?</h3>
                          <p className="text-gray-500 mb-6">
                            This is a timed exam with a duration of {currentLesson.content?.examDuration || 60} minutes.
                            You need to score at least {currentLesson.content?.passingScore || 85}% to pass and receive your certificate.
                          </p>
                          <button 
                            onClick={handleStartExam}
                            className="btn-primary"
                          >
                            Start Exam
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{currentLesson.description}</p>
                  </div>
                </div>
                
                {/* Lesson navigation */}
                <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                  {getPreviousLesson() && (
                    <Link
                      href={`/courses/${courseId}/learn?lesson=${getPreviousLesson()?._id}`}
                      className="btn-outline flex items-center"
                    >
                      <ChevronLeftIcon className="h-4 w-4 mr-1" />
                      Previous
                    </Link>
                  )}
                  
                  {!isLessonCompleted(currentLesson._id) && !examMode && (
                    <button
                      onClick={markLessonComplete}
                      disabled={completingLesson || 
                        (currentLesson.contentType === 'quiz' && !quizSubmitted) ||
                        (currentLesson.contentType === 'assignment' && !assignmentSubmitted && !getAssignmentSubmission(currentLesson._id)) ||
                        (currentLesson.contentType === 'exam' && (!examSubmitted || (examResults && !examResults.passed)))}
                      className={`btn-primary flex items-center ${
                        completingLesson || 
                        (currentLesson.contentType === 'quiz' && !quizSubmitted) ||
                        (currentLesson.contentType === 'assignment' && !assignmentSubmitted && !getAssignmentSubmission(currentLesson._id)) ||
                        (currentLesson.contentType === 'exam' && (!examSubmitted || (examResults && !examResults.passed)))
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      {completingLesson ? (
                        <>
                          <span className="inline-block animate-spin mr-2">⟳</span>
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-4 w-4 mr-1" />
                          Mark as Complete
                        </>
                      )}
                    </button>
                  )}
                  
                  {getNextLesson() && (
                    <Link
                      href={`/courses/${courseId}/learn?lesson=${getNextLesson()?._id}`}
                      className={`btn-primary flex items-center ${
                        !isLessonCompleted(currentLesson._id) ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      Next
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
              <div className="text-gray-500 text-2xl">🎓</div>
              <h2 className="mt-2 text-xl font-semibold text-gray-900">Select a Lesson</h2>
              <p className="mt-1 text-gray-500">Choose a lesson from the menu to start learning.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 