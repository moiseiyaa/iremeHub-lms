# API Test Plan: iremeHub LMS

This document outlines test cases for the iremeHub LMS backend API, primarily using Postman.

**Base URL (Production):** `https://iremehub-server.vercel.app/api/v1`

---

## 1. Authentication Endpoints

### 1.1. User Registration

*   **Objective:** Verify a new user can register.
*   **Method:** `POST`
*   **Endpoint:** `/auth/register`
*   **Full URL:** `https://iremehub-server.vercel.app/api/v1/auth/register`
*   **Headers:**
    *   `Content-Type`: `application/json`
*   **Request Body (JSON):**
    ```json
    {
      "name": "Test User Name",
      "email": "testuserXX@example.com", // Ensure email is unique for each test run
      "password": "password123"
    }
    ```
*   **Success Response (201 Created):
    *   **Status Code:** `201`
    *   **Body (JSON):**
        ```json
        {
          "success": true,
          "token": "<JWT_TOKEN>",
          "data": {
            "id": "<USER_ID>",
            "name": "Test User Name",
            "email": "testuserXX@example.com",
            "role": "student" // or default role
          }
        }
        ```
*   **Failure Responses:**
    *   **400 Bad Request** (e.g., missing fields, invalid email, user already exists)
        ```json
        {
          "success": false,
          "error": "User already exists" // or other specific error
        }
        ```
    *   **500 Internal Server Error** (if backend issues)

### 1.2. User Login

*   **Objective:** Verify a registered user can log in.
*   **Method:** `POST`
*   **Endpoint:** `/auth/login`
*   **Full URL:** `https://iremehub-server.vercel.app/api/v1/auth/login`
*   **Headers:**
    *   `Content-Type`: `application/json`
*   **Request Body (JSON):**
    ```json
    {
      "email": "testuserXX@example.com", // Use credentials from a successful registration
      "password": "password123"
    }
    ```
*   **Success Response (200 OK):
    *   **Status Code:** `200`
    *   **Body (JSON):**
        ```json
        {
          "success": true,
          "token": "<JWT_TOKEN>",
          "data": {
            "id": "<USER_ID>",
            "name": "Test User Name",
            "email": "testuserXX@example.com",
            "role": "student" // or user's role
          }
        }
        ```
*   **Failure Responses:**
    *   **400 Bad Request** (e.g., missing fields)
    *   **401 Unauthorized** (e.g., invalid credentials)
        ```json
        {
          "success": false,
          "error": "Invalid credentials"
        }
        ```
    *   **500 Internal Server Error**

### 1.3. Get Current User (Me)

*   **Objective:** Verify an authenticated user can retrieve their profile.
*   **Method:** `GET`
*   **Endpoint:** `/auth/me`
*   **Full URL:** `https://iremehub-server.vercel.app/api/v1/auth/me`
*   **Headers:**
    *   `Authorization`: `Bearer <JWT_TOKEN_FROM_LOGIN>`
    *   `Content-Type`: `application/json` (optional for GET, but good practice)
*   **Success Response (200 OK):
    *   **Status Code:** `200`
    *   **Body (JSON):**
        ```json
        {
          "success": true,
          "data": {
            "_id": "<USER_ID>",
            "name": "Test User Name",
            "email": "testuserXX@example.com",
            "role": "student",
            // ... other user fields like avatar, bio, createdAt
          }
        }
        ```
*   **Failure Responses:**
    *   **401 Unauthorized** (e.g., missing or invalid token)
    *   **500 Internal Server Error**

---

## 2. Course Endpoints

### 2.1. Get All Courses (Public)

*   **Objective:** Verify public users can retrieve a list of all courses.
*   **Method:** `GET`
*   **Endpoint:** `/courses`
*   **Full URL:** `https://iremehub-server.vercel.app/api/v1/courses`
*   **Headers:**
    *   `Content-Type`: `application/json` (optional, but good practice)
*   **Success Response (200 OK):
    *   **Status Code:** `200`
    *   **Body (JSON):**
        ```json
        {
          "success": true,
          "count": 2, // Example count of courses
          "data": [
            {
              "_id": "courseId1",
              "title": "Introduction to Programming",
              "description": "Learn the basics of programming.",
              "category": "Programming",
              "level": "Beginner",
              "price": 0,
              "instructor": {
                  "_id": "instructorId1",
                  "name": "Jane Doe"
              }
              // ... other course fields
            },
            {
              "_id": "courseId2",
              "title": "Advanced Web Development",
              "description": "Deep dive into web technologies.",
              "category": "Web Development",
              "level": "Advanced",
              "price": 49.99,
              "instructor": {
                  "_id": "instructorId2",
                  "name": "John Smith"
              }
              // ... other course fields
            }
          ]
        }
        ```
    *   If no courses, `count` would be 0 and `data` would be an empty array `[]`.
*   **Failure Responses:**
    *   **404 Not Found** (if the `/api/v1/courses` path itself is wrong - unlikely if auth works)
    *   **500 Internal Server Error** (if backend issues fetching courses)

### 2.2. Get Single Course (Public)

*   **Objective:** Verify public users can retrieve details for a specific course.
*   **Method:** `GET`
*   **Endpoint:** `/courses/{courseId}`
*   **Full URL:** `https://iremehub-server.vercel.app/api/v1/courses/<VALID_COURSE_ID>`
*   **Headers:**
    *   `Content-Type`: `application/json` (optional)
*   **Success Response (200 OK):
    *   **Status Code:** `200`
    *   **Body (JSON):**
        ```json
        {
          "success": true,
          "data": {
            "_id": "<VALID_COURSE_ID>",
            "title": "Introduction to Programming",
            // ... all other course fields including sections, lessons if populated
          }
        }
        ```
*   **Failure Responses:**
    *   **404 Not Found** (if course with `{courseId}` does not exist)
        ```json
        {
          "success": false,
          "error": "Course not found"
        }
        ```
    *   **500 Internal Server Error**

### 2.3. Create Course (Admin/Educator Only)

*   **Objective:** Verify authorized users (Admin/Educator) can create a new course.
*   **Method:** `POST`
*   **Endpoint:** `/courses`
*   **Full URL:** `https://iremehub-server.vercel.app/api/v1/courses`
*   **Headers:**
    *   `Authorization`: `Bearer <ADMIN_OR_EDUCATOR_JWT_TOKEN>`
    *   `Content-Type`: `application/json`
*   **Request Body (JSON):** (Example - adjust based on your actual Course model)
    ```json
    {
      "title": "My New Test Course",
      "description": "A fantastic course created via API test.",
      "category": "Testing",
      "level": "Intermediate",
      "price": 19.99,
      "instructor": "<INSTRUCTOR_USER_ID>" // Or handled automatically by backend based on token
      // ... other necessary fields like thumbnail info, etc.
    }
    ```
*   **Success Response (201 Created):
    *   **Status Code:** `201`
    *   **Body (JSON):**
        ```json
        {
          "success": true,
          "data": {
            "_id": "<NEW_COURSE_ID>",
            "title": "My New Test Course",
            // ... other created course fields
          }
        }
        ```
*   **Failure Responses:**
    *   **400 Bad Request** (e.g., missing required fields)
    *   **401 Unauthorized** (if token is missing, invalid, or user doesn't have permission)
    *   **403 Forbidden** (if user role is not authorized to create courses)
    *   **500 Internal Server Error**

### 2.4. Update Course (Admin/Educator Only)

*   **Objective:** Verify authorized users can update an existing course.
*   **Method:** `PUT`
*   **Endpoint:** `/courses/{courseId}`
*   **Full URL:** `https://iremehub-server.vercel.app/api/v1/courses/<EXISTING_COURSE_ID>`
*   **Headers:**
    *   `Authorization`: `Bearer <ADMIN_OR_EDUCATOR_JWT_TOKEN>`
    *   `Content-Type`: `application/json`
*   **Request Body (JSON):** (Fields to update)
    ```json
    {
      "title": "My Updated Test Course Title",
      "price": 29.99
      // ... any other fields to update
    }
    ```
*   **Success Response (200 OK):
    *   **Status Code:** `200`
    *   **Body (JSON):**
        ```json
        {
          "success": true,
          "data": {
            "_id": "<EXISTING_COURSE_ID>",
            "title": "My Updated Test Course Title",
            "price": 29.99,
            // ... other updated course fields
          }
        }
        ```
*   **Failure Responses:**
    *   **400 Bad Request**
    *   **401 Unauthorized**
    *   **403 Forbidden**
    *   **404 Not Found** (if course with `{courseId}` doesn't exist)
    *   **500 Internal Server Error**

### 2.5. Delete Course (Admin/Educator Only)

*   **Objective:** Verify authorized users can delete a course.
*   **Method:** `DELETE`
*   **Endpoint:** `/courses/{courseId}`
*   **Full URL:** `https://iremehub-server.vercel.app/api/v1/courses/<EXISTING_COURSE_ID>`
*   **Headers:**
    *   `Authorization`: `Bearer <ADMIN_OR_EDUCATOR_JWT_TOKEN>`
*   **Success Response (200 OK or 204 No Content):
    *   **Status Code:** `200` (if returning data) or `204` (if returning no data)
    *   **Body (JSON, if 200):**
        ```json
        {
          "success": true,
          "data": {} // Or a confirmation message
        }
        ```
*   **Failure Responses:**
    *   **401 Unauthorized**
    *   **403 Forbidden**
    *   **404 Not Found**
    *   **500 Internal Server Error**

---

## 3. Lesson Endpoints (Example - assuming nested under courses)

*(These are examples and depend heavily on your API design for lessons, e.g., if they are standalone or always tied to courses/sections)*

### 3.1. Get Lessons for a Course

*   **Objective:** Retrieve all lessons for a specific course.
*   **Method:** `GET`
*   **Endpoint:** `/courses/{courseId}/lessons`
*   **Full URL:** `https://iremehub-server.vercel.app/api/v1/courses/<VALID_COURSE_ID>/lessons`
*   **Success Response (200 OK):
    *   **Body (JSON):** Array of lesson objects.
*   **Failure Responses:** 404 (course not found), 500.

### 3.2. Create a Lesson in a Course/Section (Educator/Admin)

*   **Objective:** Add a new lesson.
*   **Method:** `POST`
*   **Endpoint:** `/courses/{courseId}/lessons` (or `/sections/{sectionId}/lessons`)
*   **Full URL:** `https://iremehub-server.vercel.app/api/v1/courses/<VALID_COURSE_ID>/lessons`
*   **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
*   **Request Body (JSON):** Lesson details (title, description, contentType, content, order, etc.)
*   **Success Response (201 Created):
    *   **Body (JSON):** Created lesson object.
*   **Failure Responses:** 400, 401, 403, 404, 500.

---

## Notes:

*   Replace `<JWT_TOKEN>`, `<USER_ID>`, `<COURSE_ID>`, `<VALID_COURSE_ID>`, `<NEW_COURSE_ID>`, `<EXISTING_COURSE_ID>`, `<ADMIN_OR_EDUCATOR_JWT_TOKEN>`, `<INSTRUCTOR_USER_ID>` with actual values obtained during testing.
*   Error response bodies are examples; your API might return different error structures. Standardize them if possible.
*   This is not an exhaustive list. Add more endpoints as your API grows (e.g., sections, user progress, enrollments, payments, admin-specific user management, etc.).
*   Consider using Postman Environment Variables to manage `baseUrl`, `jwtToken`, `userId`, `courseId` etc., for easier test execution and switching between environments (local, staging, production).
*   For endpoints requiring specific roles (Admin/Educator), ensure you test with tokens from users who have those roles and also with tokens from users who don't (to verify authorization logic). 