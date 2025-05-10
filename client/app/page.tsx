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
        <div className="absolute inset-0 overflow-hidden z-[-1]">
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
                {/* X (formerly Twitter) Icon */}
                <a href="#" // Replace with your X profile URL
                  className="text-gray-500 hover:text-primary transition-colors duration-300 hover:scale-110 hover:rotate-3 transform" 
                  title="Follow us on X"
                  aria-label="Follow us on X"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* Instagram Icon */}
                <a href="#" // Replace with your Instagram profile URL
                  className="text-gray-500 hover:text-primary transition-colors duration-300 hover:scale-110 hover:rotate-3 transform" 
                  title="Follow us on Instagram"
                  aria-label="Follow us on Instagram"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.172.053 1.905.25 2.49.456.638.224.9.518 1.265.882.368.366.66.63.882 1.265.205.585.403 1.318.456 2.49.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.053 1.172-.25 1.905-.456 2.49-.224.638-.518.9-.882 1.265-.366.368-.63.66-1.265.882-.585.205-1.318.403-2.49.456-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.172-.053-1.905-.25-2.49-.456-.638-.224-.9-.518-1.265-.882-.368-.366-.66-.63-.882-1.265-.205-.585-.403-1.318-.456-2.49-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.053-1.172.25-1.905.456-2.49.224.638.518.9.882 1.265.366.368.63.66 1.265.882.585.205 1.318.403 2.49.456C8.416 2.175 8.796 2.163 12 2.163m0-2.163C8.74 0 8.333.014 7.053.072 5.775.132 4.905.333 4.14.63c-.784.297-1.467.705-2.122 1.36S.927 3.355.63 4.14C.333 4.905.131 5.775.072 7.053.014 8.333 0 8.74 0 12s.014 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.297.784.705 1.467 1.36 2.122s1.338.927 2.122 1.36c.765.297 1.636.499 2.913.558C8.333 23.986 8.74 24 12 24s3.667-.014 4.947-.072c1.277-.06 2.148-.261 2.913-.558.784-.297 1.467-.705 2.122-1.36s.927-1.338 1.36-2.122c.297-.765.499-1.636.558-2.913.06-1.277.072-1.67.072-4.947s-.014-3.667-.072-4.947c-.06-1.277-.261-2.148-.558-2.913-.297-.784-.705-1.467-1.36-2.122S21.073.927 20.37.63c-.765-.297-1.636-.499-2.913-.558C15.667.014 15.26 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100-2.88 1.44 1.44 0 000 2.88z"/>
                  </svg>
                </a>

                {/* YouTube Icon */}
                <a href="#" // Replace with your YouTube channel URL
                  className="text-gray-500 hover:text-primary transition-colors duration-300 hover:scale-110 hover:rotate-3 transform" 
                  title="Subscribe on YouTube"
                  aria-label="Subscribe on YouTube"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                {/* Other social icons... */}
              </div>
            </div>

            <div className="relative hover:scale-105 transition-all duration-500 flex items-center justify-center">
              {/* Blue icon/image container */}
              <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[450px] lg:h-[450px]">
                {/* Pulsing background */}
                <div className="absolute inset-0 bg-primary rounded-full transform scale-90 animate-pulse"></div>
                
                {/* Image container - also circular and ensures image is on top */}
                <div className="relative z-10 w-full h-full rounded-full overflow-hidden shadow-lg">
                  <Image 
                    src="/images/ireme.png" 
                    alt="Ireme Hub Learners" 
                    layout="fill" 
                    objectFit="contain"
                    className="rounded-full"
                  />
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