'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BuildingOffice2Icon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

// Contact form data type
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  // Form state
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  // Form status state
  const [status, setStatus] = useState<{
    submitted: boolean;
    submitting: boolean;
    success: boolean;
    error: string | null;
  }>({
    submitted: false,
    submitting: false,
    success: false,
    error: null
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Set submitting state
    setStatus({
      ...status,
      submitting: true,
      error: null
    });
    
    try {
      // API call to send email
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      // Check if request was successful
      if (!response.ok) {
        throw new Error('Failed to send message. Please try again later.');
      }
      
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Set success state
      setStatus({
        submitted: true,
        submitting: false,
        success: true,
        error: null
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus(prev => ({
          ...prev,
          submitted: false,
          success: false
        }));
      }, 5000);
      
    } catch (error) {
      // Handle error
      setStatus({
        ...status,
        submitting: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

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
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Have questions or feedback? We&apos;d love to hear from you. Get in touch with our team and we&apos;ll respond as soon as we can.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info Section */}
      <div className="py-12 md:py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BuildingOffice2Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Main Office</h3>
              <p className="text-gray-600 mb-2">Kicukiro</p>
              <p className="text-gray-600">Kigali, Rwanda</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <EnvelopeIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600 mb-2">info@iremehub.com</p>
              <p className="text-gray-600">support@iremehub.com</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <PhoneIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600 mb-2">+250788689346</p>
              <p className="text-gray-600">Mon-Fri: 9am to 5pm CAT</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Map and Contact Form Section */}
      <div className="py-12 md:py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Map */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Location</h2>
              <div className="bg-white rounded-xl shadow-md overflow-hidden h-80 md:h-[500px]">
                <div className="relative h-full w-full">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63799.44215042493!2d30.023693079101556!3d-1.9483617999999954!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca5dfb2c48695%3A0x5f90a601c558564c!2sKicukiro%2C%20Kigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1652369851272!5m2!1sen!2sus" 
                    width="100%" 
                    height="100%" 
                    className="absolute inset-0 border-0"
                    allowFullScreen={true}
                    referrerPolicy="no-referrer-when-downgrade"
                    title="iremeHub Office Location"
                  ></iframe>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Send Us a Message</h2>
              <div className="bg-white rounded-xl shadow-md p-8">
                {/* Success message */}
                {status.success && (
                  <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-md flex items-start">
                    <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>Thank you for your message! We&apos;ll get back to you as soon as possible.</p>
                  </div>
                )}
                
                {/* Error message */}
                {status.error && (
                  <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-md flex items-start">
                    <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{status.error}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0091ff] focus:border-[#0091ff] focus:outline-none transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0091ff] focus:border-[#0091ff] focus:outline-none transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0091ff] focus:border-[#0091ff] focus:outline-none transition-all duration-300"
                    >
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing Question">Billing Question</option>
                      <option value="Partnership Opportunity">Partnership Opportunity</option>
                      <option value="Course Feedback">Course Feedback</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0091ff] focus:border-[#0091ff] focus:outline-none transition-all duration-300"
                    ></textarea>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={status.submitting}
                      className={`w-full bg-gray-800 text-white py-3 px-6 rounded-md font-medium hover:bg-gray-700 transition-all duration-300 ${
                        status.submitting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {status.submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="py-12 md:py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Find quick answers to common questions about our platform and services.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-semibold mb-2">How do I reset my password?</h3>
              <p className="text-gray-600">
                You can reset your password by clicking the &quot;Forgot Password&quot; link on the login page. Follow the instructions sent to your email to create a new password.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-semibold mb-2">How long do I have access to courses?</h3>
              <p className="text-gray-600">
                Once you enroll in a course, you have lifetime access to all course materials, including future updates and additional resources.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Do you offer any scholarships?</h3>
              <p className="text-gray-600">
                Yes, we offer scholarships for eligible students. Please visit our Scholarships page or contact our support team for more information about eligibility and application process.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Can I download course materials for offline use?</h3>
              <p className="text-gray-600">
                Yes, most course materials can be downloaded for offline use. Look for the download icon next to lectures, PDFs, and other resources within each course.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link 
              href="/faq" 
              className="inline-flex items-center text-[#0091ff] font-medium hover:text-[#0080e0] transition-colors duration-300"
            >
              View all FAQs
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* API Route for Contact Form - This will create the handler */}
      {/* Create api/contact/route.ts file */}
    </div>
  );
} 