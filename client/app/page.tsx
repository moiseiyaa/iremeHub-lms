'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { 
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import TechIconsMarquee from '../components/TechIconsMarquee';
import LiveCourseCard from '../components/LiveCourseCard';
import { apiGet } from './api/apiClient';

// Course images for fallback
const COURSE_IMAGES = [
  "https://placehold.co/600x400/gray/white?text=Web+Development",
  "https://placehold.co/600x400/gray/white?text=Data+Science",
  "https://placehold.co/600x400/gray/white?text=Mobile+Development",
  "https://placehold.co/600x400/gray/white?text=UI/UX+Design",
  "https://placehold.co/600x400/gray/white?text=Cloud+Computing",
  "https://placehold.co/600x400/gray/white?text=Cybersecurity"
];

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: {
    url: string;
  };
  price: number;
  level: string;
  category: string;
  ratings?: {
    average: number;
    count: number;
  };
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiGet<{data: Course[]}>('/courses');
        if (response.success && Array.isArray(response.data)) {
          setCourses(response.data.slice(0, 6)); // Get first 6 courses
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  // Default placeholder courses in case the API doesn't return any
  const placeholderCourses: Course[] = [
    {
      _id: 'web-dev',
      title: 'Web Development',
      description: 'Learn to build modern, responsive websites with HTML, CSS, JavaScript and more.',
      thumbnail: { url: COURSE_IMAGES[0] },
      price: 299,
      level: 'Intermediate',
      category: 'Development',
      ratings: { average: 4.9, count: 245 }
    },
    {
      _id: 'data-science',
      title: 'Data Science',
      description: 'Master data analysis, machine learning and statistics',
      thumbnail: { url: COURSE_IMAGES[1] },
      price: 249,
      level: 'Advanced',
      category: 'Data',
      ratings: { average: 4.7, count: 182 }
    },
    {
      _id: 'mobile-dev',
      title: 'Mobile Development',
      description: 'Build iOS and Android apps with React Native',
      thumbnail: { url: COURSE_IMAGES[2] },
      price: 249,
      level: 'Intermediate',
      category: 'Development',
      ratings: { average: 4.8, count: 156 }
    },
    {
      _id: 'ui-ux',
      title: 'UI/UX Design',
      description: 'Create beautiful, user-friendly digital experiences',
      thumbnail: { url: COURSE_IMAGES[3] },
      price: 199,
      level: 'Beginner',
      category: 'Design',
      ratings: { average: 4.6, count: 120 }
    },
    {
      _id: 'cloud',
      title: 'Cloud Computing',
      description: 'Deploy and manage applications in the cloud',
      thumbnail: { url: COURSE_IMAGES[4] },
      price: 249,
      level: 'Advanced',
      category: 'IT & Software',
      ratings: { average: 4.5, count: 95 }
    },
    {
      _id: 'cybersecurity',
      title: 'Cybersecurity',
      description: 'Protect systems from digital threats and vulnerabilities',
      thumbnail: { url: COURSE_IMAGES[5] },
      price: 299,
      level: 'Intermediate',
      category: 'IT & Software',
      ratings: { average: 4.7, count: 136 }
    }
  ];
  
  // Use actual courses if available, otherwise fall back to placeholders
  const displayCourses = courses.length > 0 ? courses : placeholderCourses;
  
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative min-h-[90vh] xs:min-h-[80vh] pt-16 pb-12 md:pt-20 md:pb-16 flex items-center">
        {/* Background Wave Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-full w-full">
            <svg className="absolute top-0 left-0 w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800" preserveAspectRatio="none">
              <path fill="#ffffff" fillOpacity="0.5" d="M0,0 C400,150 800,30 1440,160 L1440,0 L0,0 Z" />
            </svg>
            <svg className="absolute bottom-0 right-0 w-full rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800" preserveAspectRatio="none">
              <path fill="#ffffff" fillOpacity="0.3" d="M0,160 C300,30 800,300 1440,0 L1440,160 L0,160 Z" />
            </svg>
          </div>
        </div>
        
        <div className="container-custom relative z-10 w-full">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-left">
              <h5 className="text-gray-500 text-sm md:text-base mb-2">
                Anywhere Access Easy Learning
              </h5>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 tracking-tight leading-tight">
                Empower Your Future with <span className="text-primary font-bold">In-Demand</span> Skills
            </h1>
              
              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-700">
                Certified Online Courses for Career-Ready Learning
              </h2>
            
              <p className="text-base md:text-lg text-gray-600 mb-6 max-w-xl">
                Gain the skills employers value most—anytime, anywhere. Learn at your pace through expert-led, flexible courses that prepare you for real-world success. Start Learning Today.
            </p>
            
              <div className="flex flex-wrap gap-3 md:gap-4 mt-8">
                <div className="hover:scale-105 active:scale-95 transition-transform">
                  <Link href="/register" className="bg-primary text-white text-sm md:text-base font-medium px-6 py-2 md:px-8 md:py-3 rounded-full hover:bg-primary/90 transition-all duration-300">
                Get Started
              </Link>
                </div>
                <div className="hover:scale-105 active:scale-95 transition-transform">
                  <Link href="/courses" className="border border-gray-300 text-gray-700 text-sm md:text-base font-medium px-6 py-2 md:px-8 md:py-3 rounded-full hover:border-primary hover:text-primary transition-all duration-300">
                    Explore Courses
              </Link>
                </div>
              </div>
              
              {/* Social Media Icons */}
              <div className="flex items-center space-x-4 mt-8">
                <a href="#" 
                  className="text-gray-500 hover:text-primary transition-colors duration-300 hover:scale-110 hover:rotate-3 transform" 
                  title="Follow us on Twitter" 
                  aria-label="Follow us on Twitter"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                {/* Other social icons... */}
              </div>
            </div>

            <div className="relative hover:scale-105 transition-all duration-500">
              {/* Blue icon as shown in second picture */}
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full transform scale-95 animate-pulse"></div>
                <div className="relative z-10 flex items-center justify-center">
                  <svg 
                    viewBox="0 0 600 600" 
                    className="w-[600px] h-[600px] animate-slowSpin" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fill="currentColor" className="text-primary" d="M300 120c-99.4 0-180 80.6-180 180 0 68.3 38 127.6 94.1 158.5C137.7 475.3 75 471.1 75 471.1c152.5 88.2 255.6 8.9 329.7-105.2 6.3-11.2 9.4-24.1 9.4-37.5-.1-99.8-80.7-180.4-180.1-180.4z" />
                    <circle fill="currentColor" className="text-primary" cx="390" cy="180" r="75" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Icons Section */}
      <div className="py-6 md:py-10 lg:py-12 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            <div className="flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary flex items-center justify-center rounded-xl mb-3 hover:scale-110 transition-transform">
                <AcademicCapIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold">Certified Courses</h3>
            </div>
            
            <div className="flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary flex items-center justify-center rounded-xl mb-3 hover:scale-110 transition-transform">
                <UserGroupIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold">Lifetime Access</h3>
              </div>
                
            <div className="flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary flex items-center justify-center rounded-xl mb-3 hover:scale-110 transition-transform">
                <ClockIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold">24/7 Support</h3>
            </div>
            
            <div className="flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary flex items-center justify-center rounded-xl mb-3 hover:scale-110 transition-transform">
                <ShieldCheckIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold">Hands-On Projects</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Icons Section */}
      <div className="py-6 md:py-10 lg:py-12 bg-white">
        <div className="container-custom">
          <TechIconsMarquee />
        </div>
      </div>

      {/* Our Courses Section */}
      <div className="py-8 md:py-12 lg:py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
              Our Courses
            </h2>
            <p className="text-gray-600 mt-3 md:mt-4 max-w-3xl mx-auto text-sm md:text-base">
              Explore our wide range of courses designed to help you master in-demand skills and advance your career
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCourses.map((course, index) => (
                <LiveCourseCard 
                  key={course._id} 
                  course={course} 
                  featured={index === 0} 
                />
              ))}
            </div>
          )}
          
          <div className="mt-10 text-center">
            <Link 
              href="/courses" 
              className="inline-flex items-center bg-white border-2 border-primary text-primary px-8 py-3 rounded-full font-medium hover:bg-primary hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 transform hover:-translate-y-1"
            >
              Browse All Courses
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}