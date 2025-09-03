import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { courseAPI } from '../../lib/api';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  X,
  Eye,
  Edit,
  Trash2,
  Users,
  Calendar,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    university: '',
    department: '',
    search: '',
  });
  const [createForm, setCreateForm] = useState({
    name: '',
    code: '',
    description: '',
    university: '',
    department: '',
    semester: '',
    year: new Date().getFullYear(),
    instructor: '',
    credits: 3,
  });

  useEffect(() => {
    fetchCourses();
  }, [filters, searchQuery]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search: searchQuery || undefined,
        page: 1,
        limit: 50,
      };
      const response = await courseAPI.getAllCourses(params);
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await courseAPI.createCourse(createForm);
      toast.success('Course created successfully!');
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        code: '',
        description: '',
        university: '',
        department: '',
        semester: '',
        year: new Date().getFullYear(),
        instructor: '',
        credits: 3,
      });
      fetchCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await courseAPI.deleteCourse(courseId);
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const CourseCard = ({ course }) => (
    <div className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden'>
      <div className='p-6'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex-1'>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              {course.name}
            </h3>
            <p className='text-sm text-gray-600 mb-2'>
              {course.code} • {course.department}
            </p>
            {course.description && (
              <p className='text-sm text-gray-500 line-clamp-2'>
                {course.description}
              </p>
            )}
          </div>
          <div className='flex items-center space-x-2'>
            <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
              <Eye className='h-4 w-4' />
            </button>
            <button className='p-2 text-gray-400 hover:text-green-500 transition-colors'>
              <Edit className='h-4 w-4' />
            </button>
            <button 
              onClick={() => handleDeleteCourse(course._id)}
              className='p-2 text-gray-400 hover:text-red-500 transition-colors'
            >
              <Trash2 className='h-4 w-4' />
            </button>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600'>
          <div className='flex items-center'>
            <User className='h-4 w-4 mr-2' />
            <span>{course.instructor || 'TBA'}</span>
          </div>
          <div className='flex items-center'>
            <Users className='h-4 w-4 mr-2' />
            <span>{course.enrolledStudents?.length || 0} enrolled</span>
          </div>
          <div className='flex items-center'>
            <Calendar className='h-4 w-4 mr-2' />
            <span>{course.semester} {course.year}</span>
          </div>
          <div className='flex items-center'>
            <BookOpen className='h-4 w-4 mr-2' />
            <span>{course.credits} credits</span>
          </div>
        </div>

        <div className='flex items-center justify-between'>
          <div className='text-sm text-gray-500'>
            {course.university}
          </div>
          <div className='flex items-center space-x-2'>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              course.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {course.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Course Management</h1>
          <p className='mt-2 text-gray-600'>
            Create and manage courses for the platform
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
        >
          <Plus className='h-5 w-5 mr-2' />
          Create Course
        </button>
      </div>

      {/* Search and Filters */}
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0'>
          <div className='flex-1 max-w-lg'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <input
                type='text'
                placeholder='Search courses...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors'
          >
            <Filter className='h-5 w-5 mr-2' />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                University
              </label>
              <input
                type='text'
                value={filters.university}
                onChange={(e) => setFilters({ ...filters, university: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Filter by university'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Department
              </label>
              <input
                type='text'
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Filter by department'
              />
            </div>
          </div>
        )}
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}

      {!loading && courses.length === 0 && (
        <div className='text-center py-12'>
          <BookOpen className='h-16 w-16 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>No courses found</h3>
          <p className='text-gray-500 mb-4'>
            {searchQuery || Object.values(filters).some(f => f) 
              ? 'Try adjusting your search or filters'
              : 'No courses available at the moment'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            <Plus className='h-5 w-5 mr-2' />
            Create First Course
          </button>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>Create New Course</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <X className='h-6 w-6' />
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Course Name *
                    </label>
                    <input
                      type='text'
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='e.g., Data Structures and Algorithms'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Course Code *
                    </label>
                    <input
                      type='text'
                      value={createForm.code}
                      onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='e.g., CSE220'
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={3}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Course description'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      University *
                    </label>
                    <input
                      type='text'
                      value={createForm.university}
                      onChange={(e) => setCreateForm({ ...createForm, university: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='University name'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Department *
                    </label>
                    <input
                      type='text'
                      value={createForm.department}
                      onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Department name'
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Semester
                    </label>
                    <input
                      type='text'
                      value={createForm.semester}
                      onChange={(e) => setCreateForm({ ...createForm, semester: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='e.g., Fall 2024'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Year
                    </label>
                    <input
                      type='number'
                      value={createForm.year}
                      onChange={(e) => setCreateForm({ ...createForm, year: parseInt(e.target.value) })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      min='2020'
                      max='2030'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Credits
                    </label>
                    <input
                      type='number'
                      value={createForm.credits}
                      onChange={(e) => setCreateForm({ ...createForm, credits: parseInt(e.target.value) })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      min='1'
                      max='6'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Instructor
                  </label>
                  <input
                    type='text'
                    value={createForm.instructor}
                    onChange={(e) => setCreateForm({ ...createForm, instructor: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Instructor name'
                  />
                </div>

                <div className='flex justify-end space-x-4'>
                  <button
                    type='button'
                    onClick={() => setShowCreateModal(false)}
                    className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                  >
                    Create Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
