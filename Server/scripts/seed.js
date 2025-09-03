require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../db/connect');

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Resource = require('../models/Resource');
const StudyGroup = require('../models/StudyGroup');
const ResourceRequest = require('../models/ResourceRequest');
const { Achievement } = require('../models/Achievement');

const seedDatabase = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Resource.deleteMany({});
    await StudyGroup.deleteMany({});
    await ResourceRequest.deleteMany({});
    await Achievement.deleteMany({});

    console.log('Cleared existing data...');

    // Create sample achievements
    const achievements = await Achievement.create([
      {
        name: 'First Upload',
        description: 'Upload your first resource',
        icon: '📚',
        type: 'upload',
        criteria: { count: 1 },
        points: 10,
        rarity: 'common',
      },
      {
        name: 'Helpful Contributor',
        description: 'Upload 10 resources',
        icon: '🌟',
        type: 'upload',
        criteria: { count: 10 },
        points: 50,
        rarity: 'uncommon',
      },
      {
        name: 'Study Group Leader',
        description: 'Create your first study group',
        icon: '👥',
        type: 'study_group',
        criteria: { count: 1 },
        points: 15,
        rarity: 'common',
      },
      {
        name: 'Popular Resource',
        description: 'Get 50 likes on a resource',
        icon: '❤️',
        type: 'like',
        criteria: { count: 50 },
        points: 30,
        rarity: 'rare',
      },
    ]);

    console.log('Created achievements...');

    // Create sample users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@campusconnect.com',
        password: 'password123',
        role: 'admin',
        university: 'BRAC University',
        major: 'Computer Science',
        year: 'Graduate',
        bio: 'System administrator for CampusConnect',
        interests: ['Technology', 'Education', 'Management'],
        isVerified: true,
        verified: new Date(),
      },
      {
        name: 'John Doe',
        email: 'john@student.bracu.ac.bd',
        password: 'password123',
        role: 'student',
        university: 'BRAC University',
        major: 'Computer Science',
        year: '3rd',
        bio: 'CS student passionate about web development and AI',
        interests: ['Programming', 'Machine Learning', 'Web Development'],
        isVerified: true,
        verified: new Date(),
      },
      {
        name: 'Jane Smith',
        email: 'jane@student.bracu.ac.bd',
        password: 'password123',
        role: 'student',
        university: 'BRAC University',
        major: 'Business Administration',
        year: '2nd',
        bio: 'Business student interested in entrepreneurship',
        interests: ['Business', 'Entrepreneurship', 'Marketing'],
        isVerified: true,
        verified: new Date(),
      },
      {
        name: 'Mike Johnson',
        email: 'mike@student.bracu.ac.bd',
        password: 'password123',
        role: 'student',
        university: 'BRAC University',
        major: 'Electrical Engineering',
        year: '4th',
        bio: 'EEE student working on IoT projects',
        interests: ['Electronics', 'IoT', 'Robotics'],
        isVerified: true,
        verified: new Date(),
      },
    ]);

    console.log('Created users...');

    // Create sample courses
    const courses = await Course.create([
      {
        name: 'Data Structures and Algorithms',
        code: 'CSE220',
        description: 'Fundamental data structures and algorithmic techniques',
        university: 'BRAC University',
        department: 'Computer Science',
        semester: 'Fall 2024',
        year: 2024,
        instructor: 'Dr. Smith',
        credits: 3,
        enrolledStudents: [users[1]._id, users[3]._id],
      },
      {
        name: 'Database Management Systems',
        code: 'CSE370',
        description: 'Design and implementation of database systems',
        university: 'BRAC University',
        department: 'Computer Science',
        semester: 'Fall 2024',
        year: 2024,
        instructor: 'Dr. Johnson',
        credits: 3,
        enrolledStudents: [users[1]._id],
      },
      {
        name: 'Principles of Marketing',
        code: 'BUS201',
        description: 'Introduction to marketing concepts and strategies',
        university: 'BRAC University',
        department: 'Business Administration',
        semester: 'Fall 2024',
        year: 2024,
        instructor: 'Prof. Williams',
        credits: 3,
        enrolledStudents: [users[2]._id],
      },
      {
        name: 'Circuit Analysis',
        code: 'EEE201',
        description: 'Analysis of electrical circuits and networks',
        university: 'BRAC University',
        department: 'Electrical Engineering',
        semester: 'Fall 2024',
        year: 2024,
        instructor: 'Dr. Brown',
        credits: 4,
        enrolledStudents: [users[3]._id],
      },
    ]);

    console.log('Created courses...');

    // Create sample resources
    const resources = await Resource.create([
      {
        title: 'CSE220 Lecture 1 - Introduction to Data Structures',
        description: 'Introduction to basic data structures including arrays, linked lists, and stacks',
        type: 'slides',
        course: courses[0]._id,
        uploadedBy: users[1]._id,
        fileUrl: 'https://example.com/cse220-lecture1.pdf',
        fileName: 'CSE220_Lecture1_Intro.pdf',
        fileSize: 2048000,
        fileType: 'application/pdf',
        isPinned: true,
        tags: ['introduction', 'arrays', 'linked-lists'],
        likes: [users[2]._id, users[3]._id],
      },
      {
        title: 'Database Design Notes - Chapter 1',
        description: 'Comprehensive notes on database design principles and ER modeling',
        type: 'notes',
        course: courses[1]._id,
        uploadedBy: users[1]._id,
        fileUrl: 'https://example.com/db-notes-ch1.pdf',
        fileName: 'Database_Design_Chapter1.pdf',
        fileSize: 1536000,
        fileType: 'application/pdf',
        tags: ['database', 'er-model', 'design'],
        likes: [users[0]._id],
      },
      {
        title: 'Marketing Mix Practice Quiz',
        description: 'Practice questions on the 4Ps of marketing',
        type: 'quiz',
        course: courses[2]._id,
        uploadedBy: users[2]._id,
        fileUrl: 'https://example.com/marketing-quiz.pdf',
        fileName: 'Marketing_Mix_Quiz.pdf',
        fileSize: 512000,
        fileType: 'application/pdf',
        tags: ['marketing-mix', '4ps', 'practice'],
      },
    ]);

    console.log('Created resources...');

    // Create sample study groups
    const studyGroups = await StudyGroup.create([
      {
        title: 'CSE220 Study Group - Algorithms',
        description: 'Weekly study sessions for algorithm practice and problem solving',
        course: courses[0]._id,
        createdBy: users[1]._id,
        maxMembers: 6,
        currentMembers: [
          { user: users[1]._id, joinedAt: new Date() },
          { user: users[3]._id, joinedAt: new Date() },
        ],
        meetingType: 'hybrid',
        location: 'Library Study Room 3',
        meetingTime: 'Saturdays 2:00 PM',
        tags: ['algorithms', 'problem-solving', 'weekly'],
        contactInfo: 'john@student.bracu.ac.bd',
      },
      {
        title: 'Database Project Team',
        description: 'Looking for team members for the final database project',
        course: courses[1]._id,
        createdBy: users[1]._id,
        maxMembers: 4,
        currentMembers: [
          { user: users[1]._id, joinedAt: new Date() },
        ],
        meetingType: 'online',
        meetingTime: 'Flexible',
        tags: ['project', 'database', 'team'],
        contactInfo: 'Discord: john#1234',
      },
    ]);

    console.log('Created study groups...');

    // Create sample resource requests
    const resourceRequests = await ResourceRequest.create([
      {
        title: 'Need CSE220 Past Year Questions',
        description: 'Looking for previous year exam questions for CSE220 to practice before finals',
        course: courses[0]._id,
        requestedBy: users[3]._id,
        resourceType: 'quiz',
        priority: 'high',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        tags: ['past-papers', 'exam', 'practice'],
        upvotes: [users[1]._id],
      },
      {
        title: 'Marketing Case Study Examples',
        description: 'Need examples of marketing case studies for assignment reference',
        course: courses[2]._id,
        requestedBy: users[2]._id,
        resourceType: 'notes',
        priority: 'medium',
        tags: ['case-study', 'examples', 'assignment'],
      },
    ]);

    console.log('Created resource requests...');

    console.log('✅ Database seeded successfully!');
    console.log(`
    Sample Login Credentials:
    
    Admin:
    Email: admin@campusconnect.com
    Password: password123
    
    Students:
    Email: john@student.bracu.ac.bd
    Email: jane@student.bracu.ac.bd  
    Email: mike@student.bracu.ac.bd
    Password: password123 (for all)
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;