'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MagnifyingGlassIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  UserIcon,
  TagIcon,
  ChevronLeftIcon, 
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// Blog post data (mock)
const blogPosts = [
  {
    id: 1,
    title: "Getting Started with Online Learning: Tips for Success",
    excerpt: "Discover effective strategies to maximize your online learning experience and achieve your educational goals.",
    image: "https://placehold.co/600x400/gray/white?text=Online+Learning",
    date: "May 15, 2023",
    author: "Emily Johnson",
    category: "Study Tips",
    tags: ["online learning", "productivity", "student success"]
  },
  {
    id: 2,
    title: "The Future of Education: AI and Personalized Learning",
    excerpt: "Explore how artificial intelligence is transforming education by providing tailored learning experiences for every student.",
    image: "https://placehold.co/600x400/gray/white?text=AI+Learning",
    date: "April 28, 2023",
    author: "Michael Chen",
    category: "EdTech",
    tags: ["artificial intelligence", "personalized learning", "education technology"]
  },
  {
    id: 3,
    title: "Career Transitions: How to Break Into Tech with Online Courses",
    excerpt: "Learn how to leverage online education to successfully pivot into a tech career, even without a traditional background.",
    image: "https://placehold.co/600x400/gray/white?text=Tech+Careers",
    date: "April 10, 2023",
    author: "Sarah Williams",
    category: "Career Development",
    tags: ["career change", "tech industry", "online courses"]
  },
  {
    id: 4,
    title: "Building a Learning Habit: The Science of Effective Study",
    excerpt: "Understand the psychological principles behind successful study habits and how to apply them to your own learning journey.",
    image: "https://placehold.co/600x400/gray/white?text=Study+Habits",
    date: "March 22, 2023",
    author: "David Rodriguez",
    category: "Study Tips",
    tags: ["habits", "learning science", "productivity"]
  },
  {
    id: 5,
    title: "Top Programming Languages to Learn in 2023",
    excerpt: "A comprehensive guide to the most in-demand programming languages and why they should be on your learning roadmap.",
    image: "https://placehold.co/600x400/gray/white?text=Programming",
    date: "March 8, 2023",
    author: "Michael Chen",
    category: "Programming",
    tags: ["coding", "programming languages", "tech skills"]
  },
  {
    id: 6,
    title: "From Student to Mentor: Giving Back to the Learning Community",
    excerpt: "Discover the rewards and impact of mentoring others in your field after completing your own educational journey.",
    image: "https://placehold.co/600x400/gray/white?text=Mentorship",
    date: "February 17, 2023",
    author: "Emily Johnson",
    category: "Community",
    tags: ["mentorship", "giving back", "education community"]
  }
];

// Categories data
const categories = [
  { name: "Study Tips", count: 12 },
  { name: "EdTech", count: 8 },
  { name: "Career Development", count: 15 },
  { name: "Programming", count: 10 },
  { name: "Data Science", count: 7 },
  { name: "Community", count: 5 }
];

// Featured post data
const featuredPost = {
  id: 0,
  title: "The Evolution of Learning Management Systems: Past, Present, and Future",
  excerpt: "Take a deep dive into how LMS platforms have evolved over time and what innovations lie ahead for educational technology...",
  image: "https://placehold.co/1200x600/gray/white?text=Evolution+of+LMS",
  date: "June 5, 2023",
  author: "Prof. Alan Stevens",
  category: "EdTech",
  tags: ["lms", "educational technology", "future of learning"]
};

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // For pagination demo (not fully implemented)
  const currentPage = 1;
  const totalPages = 5;
  
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative pt-16 pb-24 bg-gray-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-full w-full">
            <svg className="absolute top-0 left-0 w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="#ffffff" fillOpacity="0.5" d="M0,96L48,112C96,128,192,160,288,170.7C384,181,480,171,576,144C672,117,768,75,864,80C960,85,1056,139,1152,149.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Blog & Resources
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Insights, strategies, and expert advice to enhance your learning journey and professional development.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full px-5 py-3 pl-12 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white py-1 px-4 rounded-full text-sm hover:bg-gray-700 transition-all duration-300">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Post */}
      <div className="py-12 md:py-16">
        <div className="container-custom">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Article</h2>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto">
                <Image 
                  src={featuredPost.image} 
                  alt={featuredPost.title} 
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 bg-gray-800 text-white text-xs py-1 px-3 rounded-full">
                  FEATURED
                </div>
              </div>
              <div className="p-6 md:p-8 lg:p-10">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-sm text-[#0091ff] font-medium">{featuredPost.category}</span>
                  <span className="text-sm text-gray-500 flex items-center">
                    <CalendarDaysIcon className="h-4 w-4 mr-1" />
                    {featuredPost.date}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-4">{featuredPost.title}</h3>
                <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center mr-2">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium">{featuredPost.author}</span>
                  </div>
                  <Link 
                    href={`/blog/${featuredPost.id}`} 
                    className="text-gray-800 font-medium flex items-center hover:text-[#0091ff] transition-colors"
                  >
                    Read More <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="py-12 md:py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Blog Posts */}
            <div className="md:col-span-2">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold">Latest Articles</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {blogPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative h-48">
                      <Image 
                        src={post.image} 
                        alt={post.title} 
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-gray-800 text-white text-xs py-1 px-2 rounded-full">
                        {post.category}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                        {post.date}
                        <span className="mx-2">•</span>
                        <UserIcon className="h-4 w-4 mr-1" />
                        {post.author}
                      </div>
                      <h3 className="text-lg font-bold mb-2 hover:text-[#0091ff] transition-colors">
                        <Link href={`/blog/${post.id}`}>{post.title}</Link>
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                      <Link 
                        href={`/blog/${post.id}`} 
                        className="text-gray-800 text-sm font-medium flex items-center hover:text-[#0091ff] transition-colors"
                      >
                        Read More <ArrowRightIcon className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              <div className="flex justify-center mt-12">
                <nav className="inline-flex rounded-md shadow">
                  <a
                    href="#"
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-300"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </a>
                  {[...Array(totalPages)].map((_, i) => (
                    <a
                      key={i}
                      href="#"
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium transition-colors duration-300 ${
                        currentPage === i + 1
                          ? 'text-[#0091ff] bg-[#0091ff]/10'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </a>
                  ))}
                  <a
                    href="#"
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-300"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </a>
                </nav>
              </div>
            </div>
            
            {/* Sidebar */}
            <div>
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Categories</h3>
                <ul className="space-y-3">
                  {categories.map((category, index) => (
                    <li key={index}>
                      <Link 
                        href={`/blog/category/${category.name.toLowerCase().replace(' ', '-')}`}
                        className="flex items-center justify-between text-gray-600 hover:text-gray-900 transition-colors duration-300"
                      >
                        <span>{category.name}</span>
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full transition-colors duration-300 hover:bg-gray-200">
                          {category.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(blogPosts.flatMap(post => post.tags))).map((tag, index) => (
                    <Link 
                      key={index}
                      href={`/blog/tag/${tag.replace(' ', '-')}`}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-all duration-300"
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Subscribe to Our Newsletter</h3>
                <p className="text-gray-300 mb-4">Get the latest articles and resources right in your inbox.</p>
                <form>
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full px-4 py-2 rounded-md mb-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0091ff] transition-all duration-300"
                  />
                  <button 
                    type="submit" 
                    className="w-full bg-[#0091ff] text-white py-2 rounded-md font-medium hover:bg-[#0080e0] transition-all duration-300"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your Learning Journey?</h2>
                <p className="text-lg text-gray-300 mb-6">
                  Join thousands of students expanding their knowledge and advancing their careers with our comprehensive courses.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link 
                    href="/courses" 
                    className="bg-white text-gray-800 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-all"
                  >
                    Browse Courses
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-[#0091ff] text-white px-6 py-3 rounded-full font-medium hover:bg-[#0080e0] transition-all"
                  >
                    Sign Up Today
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="relative h-64">
                  <Image 
                    src="https://placehold.co/600x400/gray/white?text=Learning+Journey" 
                    alt="Learning Journey" 
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 