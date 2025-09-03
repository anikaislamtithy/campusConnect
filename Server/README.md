# Campus Connect API Documentation

A comprehensive academic resource sharing platform API for university students. This RESTful API enables students to share study materials, form study groups, request resources, and collaborate effectively.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd campus-connect/Server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the server
npm run dev
```

### Environment Variables

Create a `.env` file in the Server directory:

```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_LIFETIME=1d

# Database
MONGO_URI=mongodb://localhost:27017/campus_connect

# Server Configuration
NODE_ENV=development
PORT=3000

# Email Configuration (Nodemailer)
SMTP_SERVER=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SENDER_EMAIL=your_email@gmail.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Origin
ORIGIN=http://localhost:5173
```

## 📊 Database Seeding

The API comes with comprehensive sample data for testing:

```bash
# Automatic seeding (runs when server starts if DB is empty)
npm start

# Manual seeding
npm run seed

# Clear database
npm run clear-db

# Reset database (clear + seed)
npm run reset-db

# View database summary
npm run db-summary
```

### Sample Login Credentials

**Students:**
- `alex.chen@bracu.ac.bd` / `password123`
- `sarah.rahman@bracu.ac.bd` / `password123`
- `mohammad.hassan@bracu.ac.bd` / `password123`
- `fatima.ahmed@bracu.ac.bd` / `password123`

**Admins:**
- `admin@bracu.ac.bd` / `admin123`
- `samina.khan@bracu.ac.bd` / `admin123`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication with both access and refresh token support.

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

# 📚 API Endpoints

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@university.edu",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john.doe@university.edu",
    "role": "student"
  },
  "message": "Registration successful"
}
```

### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john.doe@university.edu",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john.doe@university.edu",
    "role": "student"
  },
  "message": "Login successful"
}
```

### Login with Token (Alternative)
```http
POST /api/auth/login-token
```

Returns JWT token instead of setting cookies.

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

### Verify Token
```http
GET /api/auth/verify
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john.doe@university.edu",
    "role": "student",
    "profilePic": "",
    "themePreference": "light"
  },
  "message": "Token is valid"
}
```

### Logout User
```http
POST /api/auth/logout
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "message": "User logged out successfully"
}
```

---

## User Management Endpoints

### Get User Profile
```http
GET /api/users/:id
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john.doe@university.edu",
    "bio": "Computer Science student passionate about web development",
    "department": "Computer Science & Engineering",
    "interests": ["Web Development", "Machine Learning", "Algorithms"],
    "profilePic": "",
    "bookmarks": [...],
    "achievements": ["First Upload"],
    "role": "student",
    "notificationPreferences": {
      "newUploads": true,
      "requestFulfilled": true,
      "studyGroups": false
    },
    "themePreference": "light",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update User Profile
```http
PUT /api/users/:id
```
*Requires Authentication (Own Profile Only)*

**Request Body:**
```json
{
  "name": "John Smith",
  "bio": "Updated bio description",
  "department": "Computer Science & Engineering",
  "interests": ["Web Development", "AI", "Data Science"],
  "notificationPreferences": {
    "newUploads": true,
    "requestFulfilled": false,
    "studyGroups": true
  },
  "themePreference": "dark"
}
```

**With Profile Picture (multipart/form-data):**
```
Content-Type: multipart/form-data

name: John Smith
bio: Updated bio
profilePic: [file]
```

### Get Public Profile
```http
GET /api/users/:id/public
```
*Requires Authentication*

Returns limited public information about a user.

### Upload Profile Picture
```http
POST /api/users/:id/profile-picture
```
*Requires Authentication (Own Profile Only)*

**Request:** `multipart/form-data`
```
profilePic: [image file]
```

### Remove Profile Picture
```http
DELETE /api/users/:id/profile-picture
```
*Requires Authentication (Own Profile Only)*

### Add Bookmark
```http
POST /api/users/:id/bookmark
```
*Requires Authentication (Own Profile Only)*

**Request Body:**
```json
{
  "resourceId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

### Remove Bookmark
```http
DELETE /api/users/:id/bookmark/:resourceId
```
*Requires Authentication (Own Profile Only)*

### Get User Bookmarks
```http
GET /api/users/:id/bookmarks
```
*Requires Authentication (Own Profile Only)*

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "Data Structures Notes",
      "course": "CSE110",
      "type": "Notes",
      "fileUrl": "https://cloudinary.com/...",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## Resource Management Endpoints

### Get All Resources
```http
GET /api/resources
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `course` (string): Filter by course name(s) (comma-separated)
- `type` (string): Filter by resource type(s) (comma-separated)
- `uploader` (string): Filter by uploader ID
- `search` (string): Search in title, description, course, tags
- `tags` (string): Filter by tags (comma-separated)
- `sortBy` (string): Sort field (createdAt, title, downloadCount, fileSize)
- `sortOrder` (string): Sort order (asc, desc)
- `dateFrom` (ISO date): Filter from date
- `dateTo` (ISO date): Filter to date
- `fileType` (string): Filter by file type

**Example:**
```http
GET /api/resources?course=CSE110,CSE111&type=Notes&sortBy=downloadCount&sortOrder=desc&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "Data Structures and Algorithms - Complete Notes",
      "course": "CSE110",
      "type": "Notes",
      "description": "Comprehensive notes covering arrays, linked lists...",
      "fileUrl": "https://cloudinary.com/...",
      "fileName": "cse110-complete-notes.pdf",
      "fileSize": 2048000,
      "fileType": "application/pdf",
      "uploaderId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Alex Chen",
        "email": "alex.chen@bracu.ac.bd",
        "profilePic": ""
      },
      "isPinned": true,
      "downloadCount": 45,
      "tags": ["data structures", "algorithms", "arrays"],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Resource by ID
```http
GET /api/resources/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "Data Structures Notes",
    "course": "CSE110",
    "type": "Notes",
    "description": "Comprehensive notes...",
    "fileUrl": "https://cloudinary.com/...",
    "fileName": "notes.pdf",
    "fileSize": 2048000,
    "fileType": "application/pdf",
    "uploaderId": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Alex Chen",
      "email": "alex.chen@bracu.ac.bd"
    },
    "isPinned": false,
    "downloadCount": 45,
    "tags": ["data structures", "algorithms"],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Upload Resource
```http
POST /api/resources/upload
```
*Requires Authentication*

**Request:** `multipart/form-data`
```
title: Data Structures Notes
course: CSE110
type: Notes
description: Comprehensive notes covering basic concepts
tags: ["data structures", "algorithms", "notes"]
file: [uploaded file]
```

**Supported File Types:**
- PDF: `application/pdf`
- Word: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- PowerPoint: `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- Images: `image/jpeg`, `image/png`, `image/gif`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "Data Structures Notes",
    "course": "CSE110",
    "type": "Notes",
    "fileUrl": "https://cloudinary.com/...",
    "uploaderId": "64f8a1b2c3d4e5f6a7b8c9d0"
  },
  "message": "Resource uploaded successfully"
}
```

### Delete Resource
```http
DELETE /api/resources/:id
```
*Requires Authentication (Owner or Admin)*

**Response:**
```json
{
  "success": true,
  "message": "Resource deleted successfully"
}
```

### Get Recent Resources
```http
GET /api/resources/recent
```

**Query Parameters:**
- `limit` (number): Number of resources (default: 20)
- `courses` (string): Filter by courses (comma-separated)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "Recent Upload",
      "course": "CSE110",
      "type": "Notes",
      "uploaderId": {
        "name": "Alex Chen",
        "email": "alex.chen@bracu.ac.bd"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Pinned Resources
```http
GET /api/resources/pinned
```

Returns resources pinned by administrators.

### Download Resource
```http
GET /api/resources/:id/download
```

Increments download count and returns file URL.

### Get Resources by User
```http
GET /api/resources/user/:userId
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "User's Resource",
      "course": "CSE110",
      "downloadCount": 25,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Resource Statistics
```http
GET /api/resources/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalResources": 150,
    "totalDownloads": 2500,
    "resourcesByType": {
      "Notes": 60,
      "Slides": 45,
      "Practice": 30,
      "Quiz": 15
    },
    "topCourses": [
      { "course": "CSE110", "count": 25 },
      { "course": "MAT110", "count": 20 }
    ]
  }
}
```

### Pin Resource (Admin Only)
```http
POST /api/resources/:id/pin
```
*Requires Admin Authentication*

### Unpin Resource (Admin Only)
```http
DELETE /api/resources/:id/unpin
```
*Requires Admin Authentication*

---

## Study Group Endpoints

### Get Active Study Groups
```http
GET /api/groups/active
```

**Query Parameters:**
- `courses` (string): Filter by courses (comma-separated)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "creatorId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Alex Chen",
        "email": "alex.chen@bracu.ac.bd"
      },
      "course": "CSE110",
      "title": "Data Structures Study Circle",
      "message": "Looking for motivated students to join our weekly study sessions...",
      "contactInfo": "alex.chen@bracu.ac.bd",
      "maxMembers": 8,
      "isActive": true,
      "expiresAt": "2024-02-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Study Groups by Course
```http
GET /api/groups/course/:course
```

### Create Study Group
```http
POST /api/groups
```
*Requires Authentication*

**Request Body:**
```json
{
  "course": "CSE110",
  "title": "Algorithm Study Group",
  "message": "Looking for students to form a study group for algorithms exam...",
  "contactInfo": "john.doe@university.edu",
  "maxMembers": 6
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "creatorId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "course": "CSE110",
    "title": "Algorithm Study Group",
    "message": "Looking for students...",
    "contactInfo": "john.doe@university.edu",
    "maxMembers": 6,
    "isActive": true,
    "expiresAt": "2024-02-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Study group created successfully"
}
```

### Update Study Group
```http
PUT /api/groups/:id
```
*Requires Authentication (Creator Only)*

### Delete Study Group
```http
DELETE /api/groups/:id
```
*Requires Authentication (Creator Only)*

### Get User's Study Groups
```http
GET /api/groups/my-groups
```
*Requires Authentication*

### Cleanup Expired Groups (Admin Only)
```http
POST /api/groups/cleanup-expired
```
*Requires Admin Authentication*

---

## Resource Request Endpoints

### Get Active Requests
```http
GET /api/requests/active
```

**Query Parameters:**
- `courses` (string): Filter by courses (comma-separated)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "creatorId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Alex Chen",
        "email": "alex.chen@bracu.ac.bd"
      },
      "course": "CSE370",
      "title": "Need SQL Query Practice Problems",
      "description": "Looking for advanced SQL query practice problems...",
      "urgency": "high",
      "comments": [
        {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "userId": {
            "name": "Sarah Rahman",
            "email": "sarah.rahman@bracu.ac.bd"
          },
          "text": "I have some great SQL practice sets from last semester.",
          "createdAt": "2024-01-13T10:30:00.000Z"
        }
      ],
      "fulfilled": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Fulfilled Requests
```http
GET /api/requests/fulfilled
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "creatorId": {
        "name": "Fatima Ahmed",
        "email": "fatima.ahmed@bracu.ac.bd"
      },
      "course": "BUS201",
      "title": "Financial Statement Analysis Examples",
      "description": "Looking for real company financial statements...",
      "urgency": "medium",
      "fulfilled": true,
      "fulfilledBy": {
        "name": "Dr. Ahmed Rahman",
        "email": "admin@bracu.ac.bd"
      },
      "fulfilledAt": "2024-01-14T10:30:00.000Z",
      "resourceId": {
        "title": "Financial Analysis Examples",
        "fileUrl": "https://cloudinary.com/..."
      },
      "createdAt": "2024-01-10T10:30:00.000Z"
    }
  ]
}
```

### Get Requests by Course
```http
GET /api/requests/course/:course
```

### Create Resource Request
```http
POST /api/requests
```
*Requires Authentication*

**Request Body:**
```json
{
  "course": "CSE370",
  "title": "Need Database Design Examples",
  "description": "Looking for real-world database design examples with ER diagrams...",
  "urgency": "medium"
}
```

**Urgency Levels:** `low`, `medium`, `high`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "creatorId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "course": "CSE370",
    "title": "Need Database Design Examples",
    "description": "Looking for real-world database design examples...",
    "urgency": "medium",
    "comments": [],
    "fulfilled": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Resource request created successfully"
}
```

### Update Resource Request
```http
PUT /api/requests/:id
```
*Requires Authentication (Creator Only)*

### Delete Resource Request
```http
DELETE /api/requests/:id
```
*Requires Authentication (Creator Only)*

### Add Comment to Request
```http
POST /api/requests/:id/comment
```
*Requires Authentication*

**Request Body:**
```json
{
  "text": "I have some examples that might help you. Will share them soon!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "comments": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
        "text": "I have some examples that might help you...",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  },
  "message": "Comment added successfully"
}
```

### Fulfill Request
```http
PUT /api/requests/:id/fulfill
```
*Requires Authentication*

**Request Body:**
```json
{
  "resourceId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "fulfilled": true,
    "fulfilledBy": "64f8a1b2c3d4e5f6a7b8c9d0",
    "fulfilledAt": "2024-01-15T10:30:00.000Z",
    "resourceId": "64f8a1b2c3d4e5f6a7b8c9d0"
  },
  "message": "Request fulfilled successfully"
}
```

### Get User's Requests
```http
GET /api/requests/my-requests
```
*Requires Authentication*

---

## Notification Endpoints

### Send Email (Admin Only)
```http
POST /api/notifications/send
```
*Requires Admin Authentication*

**Request Body:**
```json
{
  "to": "user@university.edu",
  "subject": "New Resource Available",
  "html": "<h1>New Resource</h1><p>A new resource has been uploaded...</p>",
  "type": "resource_upload"
}
```

### Send Bulk Emails (Admin Only)
```http
POST /api/notifications/send-bulk
```
*Requires Admin Authentication*

**Request Body:**
```json
{
  "emails": [
    {
      "to": "user1@university.edu",
      "subject": "Notification",
      "html": "<p>Message content</p>"
    },
    {
      "to": "user2@university.edu",
      "subject": "Notification",
      "html": "<p>Message content</p>"
    }
  ]
}
```

### Notify Resource Upload
```http
POST /api/notifications/resource-upload
```
*Requires Authentication*

**Request Body:**
```json
{
  "resourceId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "course": "CSE110"
}
```

### Notify Request Fulfilled
```http
POST /api/notifications/request-fulfilled
```
*Requires Authentication*

**Request Body:**
```json
{
  "requestId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "resourceId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

### Get Notification Preferences
```http
GET /api/notifications/preferences/:userId
```
*Requires Authentication*

### Update Notification Preferences
```http
PUT /api/notifications/preferences/:userId
```
*Requires Authentication*

**Request Body:**
```json
{
  "newUploads": true,
  "requestFulfilled": false,
  "studyGroups": true
}
```

### Test Email Configuration (Admin Only)
```http
GET /api/notifications/test-config
```
*Requires Admin Authentication*

---

## 📋 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "pagination": { ... } // Only for paginated endpoints
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"], // For validation errors
  "statusCode": 400
}
```

## 🚨 Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

## 🔒 Authentication & Authorization

### Authentication Methods
1. **Cookie-based:** Automatic with `httpOnly` cookies
2. **Bearer Token:** `Authorization: Bearer <token>`

### User Roles
- **Student:** Can upload resources, create study groups, make requests
- **Admin:** All student permissions + pin resources, send notifications, manage system

### Protected Routes
Most endpoints require authentication. Public endpoints:
- `GET /api/resources` (browse resources)
- `GET /api/resources/:id` (view resource details)
- `GET /api/resources/recent`
- `GET /api/resources/pinned`
- `GET /api/groups/active` (view study groups)
- `GET /api/requests/active` (view requests)

## 📝 Validation Rules

### User Registration
- **Name:** 1-100 characters
- **Email:** Valid email format, unique
- **Password:** Minimum 6 characters

### Resource Upload
- **Title:** 1-200 characters
- **Course:** 1-100 characters
- **Type:** Must be one of: Notes, Slides, Quiz, Practice
- **Description:** Maximum 500 characters (optional)
- **File:** PDF, DOC, DOCX, PPT, PPTX, or images
- **Tags:** Array of strings, max 30 characters each

### Study Groups
- **Course:** 1-100 characters
- **Title:** 1-150 characters
- **Message:** 1-500 characters
- **Contact Info:** Maximum 200 characters (optional)
- **Max Members:** 2-20 people

### Resource Requests
- **Course:** 1-100 characters
- **Title:** 1-150 characters
- **Description:** 1-500 characters
- **Urgency:** low, medium, or high

## 🔧 Development Tools

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with sample data
npm run clear-db   # Clear all database data
npm run reset-db   # Clear and re-seed database
npm run db-summary # Show database statistics
```

### Database Models
- **User:** User accounts and profiles
- **Resource:** Uploaded study materials
- **StudyGroup:** Study group posts
- **ResourceRequest:** Resource requests with comments
- **Token:** JWT refresh tokens

## 🌐 CORS Configuration

The API is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`
- `http://127.0.0.1:5173`

## 📁 File Upload

### Supported File Types
- **Documents:** PDF, DOC, DOCX
- **Presentations:** PPT, PPTX
- **Images:** JPEG, PNG, GIF

### File Size Limits
- **Profile Pictures:** 5MB
- **Resources:** 50MB

### Storage
Files are stored on Cloudinary with automatic optimization and CDN delivery.

## 🔍 Search & Filtering

### Resource Search
- **Text Search:** Searches in title, description, course, and tags
- **Course Filter:** Multiple courses (comma-separated)
- **Type Filter:** Multiple types (comma-separated)
- **Tag Filter:** Multiple tags (comma-separated)
- **Date Range:** Filter by upload date
- **Sorting:** By date, title, downloads, or file size

### Pagination
- **Default:** 20 items per page
- **Maximum:** 100 items per page
- **Response includes:** Total count, page info, navigation flags

## 🏆 Achievement System

### Available Achievements
- **First Upload:** Upload your first resource
- **Top Contributor:** Upload 10+ resources
- **Helper:** Fulfill resource requests

### Auto-Updates
Achievements are automatically updated when users:
- Upload resources
- Fulfill resource requests
- Reach contribution milestones

## 📧 Email Notifications

### Notification Types
- **New Uploads:** When resources are uploaded in followed courses
- **Request Fulfilled:** When your resource requests are fulfilled
- **Study Groups:** Study group related notifications

### Email Templates
- HTML email templates with university branding
- Responsive design for mobile devices
- Unsubscribe links included

## 🛡️ Security Features

### Password Security
- Bcrypt hashing with salt rounds
- Minimum password requirements
- Secure password comparison

### JWT Security
- Access and refresh token system
- Secure cookie configuration
- Token expiration handling

### File Upload Security
- File type validation
- File size limits
- Malicious file detection

### Input Validation
- Express-validator middleware
- SQL injection prevention
- XSS protection

## 📊 Monitoring & Logging

### Request Logging
- HTTP request/response logging
- Error tracking and reporting
- Performance monitoring

### Database Monitoring
- Connection status tracking
- Query performance monitoring
- Data integrity checks

## 🚀 Deployment

### Environment Setup
1. Set production environment variables
2. Configure MongoDB connection
3. Set up Cloudinary account
4. Configure email service
5. Set secure JWT secrets

### Production Considerations
- Enable HTTPS
- Set secure cookie flags
- Configure CORS for production domains
- Set up monitoring and logging
- Regular database backups

---

## 📞 Support

For API support and questions:
- Check the documentation above
- Review error messages and status codes
- Use the database summary tool: `npm run db-summary`
- Test with provided sample credentials

## 📄 License

This project is licensed under the ISC License.