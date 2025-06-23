# GPS Attendance System - API Documentation

This document provides comprehensive documentation for the GPS-Based Class Attendance and Student Feedback Review System API.

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Authentication Endpoints](#authentication-endpoints)
- [User Management](#user-management)
- [Course Management](#course-management)
- [Session Management](#session-management)
- [Attendance Tracking](#attendance-tracking)
- [Feedback System](#feedback-system)
- [Data Models](#data-models)
- [Examples](#examples)

## 🌐 Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Expiration
- Default expiration: 24 hours
- Refresh tokens are supported
- Automatic logout on token expiration

## ❌ Error Handling

All API endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error information (in development mode)"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## 🚦 Rate Limiting

- Default: 100 requests per minute per IP
- Authentication endpoints: 10 requests per minute
- Exceeded limits return HTTP 429

## 🔑 Authentication Endpoints

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "username": "student1",
  "password": "password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "student1",
    "email": "john.doe@university.edu",
    "role": "student",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00",
    "last_login": "2024-06-18T04:37:00"
  }
}
```

### Logout
```http
POST /auth/logout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

### Get Profile
```http
GET /auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "username": "student1",
  "email": "john.doe@university.edu",
  "role": "student",
  "first_name": "John",
  "last_name": "Doe",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00",
  "last_login": "2024-06-18T04:37:00"
}
```

### Update Profile
```http
PUT /auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john.smith@university.edu"
}
```

### Change Password
```http
POST /auth/change-password
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword"
}
```

### Refresh Token
```http
POST /auth/refresh
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

## 👥 User Management

### Get Users (Admin Only)
```http
GET /users
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
[
  {
    "id": 1,
    "username": "student1",
    "email": "john.doe@university.edu",
    "role": "student",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

### Create User (Admin Only)
```http
POST /users
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@university.edu",
  "password": "password123",
  "role": "student",
  "first_name": "New",
  "last_name": "User"
}
```

### Update User (Admin Only)
```http
PUT /users/{user_id}
```

### Delete User (Admin Only)
```http
DELETE /users/{user_id}
```

## 📚 Course Management

### Get Courses
```http
GET /courses
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- None for students (returns enrolled courses)
- None for instructors (returns taught courses)
- None for admins (returns all courses)

**Response:**
```json
[
  {
    "id": 1,
    "course_name": "Database Systems",
    "course_code": "CS301",
    "instructor_id": 2,
    "instructor_name": "Dr. Sarah Smith",
    "created_at": "2024-01-01T00:00:00",
    "is_active": true,
    "student_count": 45
  }
]
```

### Create Course (Admin Only)
```http
POST /courses
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "course_name": "Web Development",
  "course_code": "CS401",
  "instructor_id": 2
}
```

### Get Course Details
```http
GET /courses/{course_id}
```

### Update Course (Admin Only)
```http
PUT /courses/{course_id}
```

### Delete Course (Admin Only)
```http
DELETE /courses/{course_id}
```

### Enroll Student (Admin Only)
```http
POST /courses/{course_id}/enroll
```

**Request Body:**
```json
{
  "student_id": 1
}
```

## 📅 Session Management

### Get Course Sessions
```http
GET /courses/{course_id}/sessions
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "course_id": 1,
    "instructor_id": 2,
    "session_date": "2024-06-18",
    "start_time": "10:00:00",
    "end_time": "11:30:00",
    "location_name": "Computer Science Building - Room 101",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "attendance_radius": 50,
    "created_at": "2024-06-17T00:00:00",
    "is_active": true
  }
]
```

### Create Session (Instructor/Admin)
```http
POST /courses/{course_id}/sessions
```

**Headers:**
```
Authorization: Bearer <instructor-token>
```

**Request Body:**
```json
{
  "session_date": "2024-06-20",
  "start_time": "14:00",
  "end_time": "15:30",
  "location_name": "Engineering Building - Room 205",
  "latitude": 40.7580,
  "longitude": -73.9855,
  "attendance_radius": 75
}
```

### Update Session (Instructor/Admin)
```http
PUT /sessions/{session_id}
```

### Delete Session (Instructor/Admin)
```http
DELETE /sessions/{session_id}
```

## 📍 Attendance Tracking

### GPS Check-in (Students Only)
```http
POST /checkin
```

**Headers:**
```
Authorization: Bearer <student-token>
```

**Request Body:**
```json
{
  "session_id": 1,
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:**
```json
{
  "message": "Check-in successful",
  "status": "present",
  "distance": 25,
  "check_in_time": "2024-06-18T10:05:00",
  "attendance_record": {
    "id": 1,
    "session_id": 1,
    "student_id": 1,
    "check_in_time": "2024-06-18T10:05:00",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "status": "present",
    "created_at": "2024-06-18T10:05:00"
  }
}
```

**Error Response (Too Far):**
```json
{
  "message": "You are 150m away from the class location. You need to be within 50m to check in.",
  "distance": 150,
  "required_radius": 50
}
```

### Get Attendance History (Students)
```http
GET /history
```

**Headers:**
```
Authorization: Bearer <student-token>
```

**Query Parameters:**
- `course_id` (optional): Filter by course
- `limit` (optional, default: 50): Number of records
- `offset` (optional, default: 0): Pagination offset

**Response:**
```json
{
  "attendance_records": [
    {
      "id": 1,
      "session_id": 1,
      "student_id": 1,
      "check_in_time": "2024-06-18T10:05:00",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "status": "present",
      "created_at": "2024-06-18T10:05:00",
      "course_name": "Database Systems",
      "course_code": "CS301",
      "session_date": "2024-06-18",
      "session_time": "10:00:00 - 11:30:00"
    }
  ],
  "total_count": 25,
  "limit": 50,
  "offset": 0
}
```

### Get Attendance Statistics (Students)
```http
GET /statistics
```

**Headers:**
```
Authorization: Bearer <student-token>
```

**Query Parameters:**
- `course_id` (optional): Filter by course

**Response:**
```json
{
  "total_sessions": 45,
  "present_count": 41,
  "late_count": 2,
  "absent_count": 2,
  "attendance_percentage": 95.56
}
```

### Get Session Attendance (Instructor/Admin)
```http
GET /session/{session_id}/attendance
```

**Headers:**
```
Authorization: Bearer <instructor-token>
```

**Response:**
```json
{
  "session": {
    "id": 1,
    "course_id": 1,
    "session_date": "2024-06-18",
    "start_time": "10:00:00",
    "end_time": "11:30:00",
    "location_name": "Computer Science Building - Room 101"
  },
  "student_attendance": [
    {
      "student_id": 1,
      "student_name": "John Doe",
      "student_email": "john.doe@university.edu",
      "status": "present",
      "check_in_time": "2024-06-18T10:05:00",
      "distance": 25
    }
  ],
  "summary": {
    "total_students": 45,
    "present_count": 40,
    "late_count": 3,
    "absent_count": 2,
    "attendance_percentage": 95.56
  }
}
```

### Get Course Attendance Summary (Instructor/Admin)
```http
GET /course/{course_id}/attendance-summary
```

**Response:**
```json
{
  "course": {
    "id": 1,
    "course_name": "Database Systems",
    "course_code": "CS301"
  },
  "total_sessions": 20,
  "enrolled_students": 45,
  "total_attendance_records": 850,
  "present_count": 800,
  "late_count": 30,
  "absent_count": 20,
  "overall_attendance_percentage": 92.22
}
```

## 💬 Feedback System

### Submit Feedback (Students)
```http
POST /courses/{course_id}/feedback
```

**Headers:**
```
Authorization: Bearer <student-token>
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excellent course! Very informative and well-structured.",
  "is_anonymous": false
}
```

**Response:**
```json
{
  "message": "Feedback submitted successfully",
  "feedback": {
    "id": 1,
    "course_id": 1,
    "student_id": 1,
    "rating": 5,
    "comment": "Excellent course! Very informative and well-structured.",
    "is_anonymous": false,
    "created_at": "2024-06-18T10:30:00"
  }
}
```

### Get Course Feedback (Instructor/Admin)
```http
GET /courses/{course_id}/feedback
```

**Headers:**
```
Authorization: Bearer <instructor-token>
```

**Query Parameters:**
- `limit` (optional, default: 50): Number of records
- `offset` (optional, default: 0): Pagination offset

**Response:**
```json
{
  "feedback": [
    {
      "id": 1,
      "course_id": 1,
      "student_id": 1,
      "rating": 5,
      "comment": "Excellent course!",
      "is_anonymous": false,
      "created_at": "2024-06-18T10:30:00",
      "student_name": "John Doe"
    }
  ],
  "total_count": 25,
  "limit": 50,
  "offset": 0,
  "summary": {
    "total_feedback": 25,
    "average_rating": 4.32,
    "rating_distribution": {
      "1": 1,
      "2": 2,
      "3": 5,
      "4": 8,
      "5": 9
    }
  }
}
```

### Get My Feedback (Students)
```http
GET /my-feedback
```

**Headers:**
```
Authorization: Bearer <student-token>
```

**Query Parameters:**
- `course_id` (optional): Filter by course
- `limit` (optional, default: 50): Number of records
- `offset` (optional, default: 0): Pagination offset

### Delete Feedback (Admin Only)
```http
DELETE /feedback/{feedback_id}
```

## 📊 Data Models

### User Model
```json
{
  "id": "integer",
  "username": "string (unique)",
  "email": "string (unique)",
  "password_hash": "string (hashed)",
  "role": "string (student|instructor|admin)",
  "first_name": "string",
  "last_name": "string",
  "created_at": "datetime",
  "is_active": "boolean",
  "last_login": "datetime"
}
```

### Course Model
```json
{
  "id": "integer",
  "course_name": "string",
  "course_code": "string (unique)",
  "instructor_id": "integer (foreign key)",
  "created_at": "datetime",
  "is_active": "boolean"
}
```

### Class Session Model
```json
{
  "id": "integer",
  "course_id": "integer (foreign key)",
  "instructor_id": "integer (foreign key)",
  "session_date": "date",
  "start_time": "time",
  "end_time": "time",
  "location_name": "string",
  "latitude": "float",
  "longitude": "float",
  "attendance_radius": "integer (meters)",
  "created_at": "datetime",
  "is_active": "boolean"
}
```

### Attendance Record Model
```json
{
  "id": "integer",
  "session_id": "integer (foreign key)",
  "student_id": "integer (foreign key)",
  "check_in_time": "datetime",
  "latitude": "float",
  "longitude": "float",
  "status": "string (present|late|absent)",
  "created_at": "datetime"
}
```

### Feedback Model
```json
{
  "id": "integer",
  "course_id": "integer (foreign key)",
  "student_id": "integer (foreign key, nullable for anonymous)",
  "rating": "integer (1-5)",
  "comment": "text",
  "is_anonymous": "boolean",
  "created_at": "datetime"
}
```

## 📝 Examples

### Complete Authentication Flow

```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'student1',
    password: 'password'
  })
});

const { token, user } = await loginResponse.json();

// Store token
localStorage.setItem('auth_token', token);

// Use token for subsequent requests
const profileResponse = await fetch('/api/auth/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### GPS Check-in Flow

```javascript
// Get user's current location
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;
  
  // Attempt check-in
  const response = await fetch('/api/checkin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      session_id: 1,
      latitude,
      longitude
    })
  });
  
  const result = await response.json();
  
  if (response.ok) {
    console.log('Check-in successful:', result.status);
  } else {
    console.error('Check-in failed:', result.message);
  }
});
```

### Pagination Example

```javascript
// Get attendance history with pagination
const getAttendanceHistory = async (page = 0, limit = 20) => {
  const offset = page * limit;
  
  const response = await fetch(`/api/history?limit=${limit}&offset=${offset}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return await response.json();
};

// Usage
const firstPage = await getAttendanceHistory(0, 20);
const secondPage = await getAttendanceHistory(1, 20);
```

## 🔧 Testing

### Health Check
```bash
curl -X GET http://localhost:5000/api/health
```

### Authentication Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "student1", "password": "password"}'
```

### Protected Endpoint Test
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📞 Support

For API support:
- Check HTTP status codes and error messages
- Verify authentication tokens
- Ensure proper request formatting
- Review this documentation for endpoint details

---

**API Version: 1.0.0**  
**Last Updated: June 18, 2024**

