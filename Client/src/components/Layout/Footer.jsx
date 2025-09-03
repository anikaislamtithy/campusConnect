import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className='bg-white border-t border-gray-200'>
      <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Brand */}
          <div className='col-span-1 md:col-span-2'>
            <div className='flex items-center mb-4'>
              <div className='h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                <BookOpen className='h-5 w-5 text-white' />
              </div>
              <span className='ml-2 text-xl font-bold text-gray-900'>CampusConnect</span>
            </div>
            <p className='text-gray-600 text-sm max-w-md'>
              A comprehensive academic resource sharing platform for university students. 
              Connect, collaborate, and excel in your academic journey.
            </p>
            <div className='flex space-x-4 mt-4'>
              <a href='#' className='text-gray-400 hover:text-gray-500'>
                <Github className='h-5 w-5' />
              </a>
              <a href='#' className='text-gray-400 hover:text-gray-500'>
                <Twitter className='h-5 w-5' />
              </a>
              <a href='#' className='text-gray-400 hover:text-gray-500'>
                <Mail className='h-5 w-5' />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4'>
              Quick Links
            </h3>
            <ul className='space-y-2'>
              <li>
                <Link to='/resources' className='text-gray-600 hover:text-gray-900 text-sm'>
                  Resources
                </Link>
              </li>
              <li>
                <Link to='/courses' className='text-gray-600 hover:text-gray-900 text-sm'>
                  Courses
                </Link>
              </li>
              <li>
                <Link to='/study-groups' className='text-gray-600 hover:text-gray-900 text-sm'>
                  Study Groups
                </Link>
              </li>
              <li>
                <Link to='/requests' className='text-gray-600 hover:text-gray-900 text-sm'>
                  Resource Requests
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className='text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4'>
              Support
            </h3>
            <ul className='space-y-2'>
              <li>
                <a href='#' className='text-gray-600 hover:text-gray-900 text-sm'>
                  Help Center
                </a>
              </li>
              <li>
                <a href='#' className='text-gray-600 hover:text-gray-900 text-sm'>
                  Contact Us
                </a>
              </li>
              <li>
                <a href='#' className='text-gray-600 hover:text-gray-900 text-sm'>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href='#' className='text-gray-600 hover:text-gray-900 text-sm'>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className='mt-8 pt-8 border-t border-gray-200'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-gray-500 text-sm'>
              © 2025 CampusConnect. All rights reserved.
            </p>
            <p className='text-gray-500 text-sm mt-2 md:mt-0'>
              Built with ❤️ for students, by students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;