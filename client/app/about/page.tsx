'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  LightBulbIcon,
  GlobeAltIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function About() {
  // Team members data
  const teamMembers = [
    {
      name: "Moise Iyakaremye",
      role: "Founder & Chief executif officer",
      image: "/images/ceo.jpg",
      bio: "Intreprenuer and creative Software engineer with 2+ years of experience in educational technology and curriculum development."
    },
    {
      name: "Michael Chen",
      role: "Chief Technology Officer",
      image: "https://placehold.co/400x400/gray/white?text=MC",
      bio: "Tech industry veteran who has led engineering teams at major tech companies, focused on creating accessible learning platforms."
    },
    {
      name: "Sarah Williams",
      role: "Head of Curriculum",
      image: "https://placehold.co/400x400/gray/white?text=SW",
      bio: "Educational content specialist with experience designing programs for both academic institutions and corporate training."
    },
    {
      name: "David Rodriguez",
      role: "Student Success Lead",
      image: "https://placehold.co/400x400/gray/white?text=DR",
      bio: "Passionate about helping students achieve their goals through personalized learning paths and ongoing support."
    }
  ];

  // Stats data
  const stats = [
    { value: "25K+", label: "Students Worldwide" },
    { value: "180+", label: "Courses Offered" },
    { value: "96%", label: "Completion Rate" },
    { value: "92%", label: "Employment Success" }
  ];

  // Values data
  const values = [
    {
      icon: <AcademicCapIcon className="h-8 w-8 text-gray-800" />,
      title: "Academic Excellence",
      description: "We maintain high educational standards across all our courses and programs."
    },
    {
      icon: <UserGroupIcon className="h-8 w-8 text-gray-800" />,
      title: "Inclusive Learning",
      description: "We create an environment where everyone has equal access to quality education."
    },
    {
      icon: <LightBulbIcon className="h-8 w-8 text-gray-800" />,
      title: "Innovation",
      description: "We constantly evolve our teaching methods and embrace new technologies."
    },
    {
      icon: <HandRaisedIcon className="h-8 w-8 text-gray-800" />,
      title: "Supportive Community",
      description: "We foster a collaborative environment where students help each other succeed."
    },
    {
      icon: <GlobeAltIcon className="h-8 w-8 text-gray-800" />,
      title: "Global Perspective",
      description: "We prepare students for success in an interconnected global workplace."
    },
    {
      icon: <BookOpenIcon className="h-8 w-8 text-gray-800" />,
      title: "Lifelong Learning",
      description: "We inspire curiosity and a commitment to continual personal development."
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative min-h-[50vh] pt-16 pb-12 flex items-center bg-gray-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-full w-full">
            <svg className="absolute top-0 left-0 w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="#ffffff" fillOpacity="0.5" d="M0,96L48,112C96,128,192,160,288,170.7C384,181,480,171,576,144C672,117,768,75,864,80C960,85,1056,139,1152,149.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        </div>
        
        <div className="container-custom relative z-10 w-full">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">About iremeHub LMS</h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Transforming education through technology and innovation to empower learners worldwide.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-16 md:py-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <div className="relative h-80 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image 
                  src="/images/about.png"
                  alt="Our Story at iremeHub LMS"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Journey</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2018, iremeHub LMS began with a simple mission: to make quality education accessible to everyone. What started as a small team of passionate educators and technologists has grown into a global learning platform serving thousands of students across the world.
                </p>
                <p>
                  Our journey has been driven by the belief that education is the most powerful tool for personal and professional growth. Through technological innovation and pedagogical excellence, we&apos;ve created a learning environment that adapts to each student&apos;s needs and aspirations.
                </p>
                <p>
                  Today, we offer over 180 courses in various disciplines, from programming and data science to digital marketing and design. Our curriculum is developed in collaboration with industry experts and updated regularly to reflect the latest trends and demands of the job market.
                </p>
                <p>
                  As we continue to grow, our focus remains on providing an exceptional learning experience that combines theoretical knowledge with practical skills, preparing our students for success in their chosen fields.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="container-custom">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center p-6 bg-white rounded-xl shadow-lg card-hover"
                variants={cardVariant}
              >
                <p className="text-3xl md:text-4xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-gray-600 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Our Values Section */}
      <div className="py-16 md:py-24">
        <div className="container-custom">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do, from curriculum development to student support.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {values.map((value, index) => (
              <motion.div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-md card-hover"
                variants={cardVariant}
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 mx-auto">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">{value.title}</h3>
                <p className="text-gray-600 text-center">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Passionate educators and innovators dedicated to transforming the learning experience.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index} 
                className="bg-white rounded-xl overflow-hidden shadow-lg card-hover"
                variants={cardVariant}
              >
                <div className="relative h-64">
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-[#0091ff] font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                  <div className="mt-4 flex space-x-3">
                    <a href="#" className="text-gray-500 hover:text-gray-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z" />
                      </svg>
                    </a>
                    <a href="#" className="text-gray-500 hover:text-gray-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Join Us Section */}
      <div className="py-16 md:py-24 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <div className="container-custom">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Join Our Learning Community</h2>
            <p className="text-lg mb-8">
              Embark on your learning journey with us and unlock your full potential. Gain the skills you need to succeed in today's rapidly evolving world.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/courses" 
                className="bg-white text-gray-800 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-all"
              >
                Explore Courses
              </Link>
              <Link 
                href="/register" 
                className="bg-[#0091ff] text-white px-6 py-3 rounded-full font-medium hover:bg-[#0080e0] transition-all"
              >
                Sign Up Now
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 