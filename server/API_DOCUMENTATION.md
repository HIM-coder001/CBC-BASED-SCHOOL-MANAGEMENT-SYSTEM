# CBC School Management System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except `/auth/login`) require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. AUTHENTICATION ENDPOINTS

### Login
**POST** `/auth/login`
- **Public endpoint (no auth required)**
- **Body:**
  ```json
  {
    "email": "teacher@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "jwt_token_here",
      "user": {
        "id": 1,
        "fullName": "John Doe",
        "email": "john@example.com",
        "role": "TEACHER"
      }
    }
  }
  ```

---

## 2. USER MANAGEMENT ENDPOINTS

### Create User
**POST** `/users`
- **Roles:** ADMIN
- **Body:**
  ```json
  {
    "fullName": "John Smith",
    "email": "john@example.com",
    "password": "password123",
    "role": "TEACHER"
  }
  ```

### Get All Users
**GET** `/users`
- **Roles:** ADMIN

### Get User by ID
**GET** `/users/:id`
- **Roles:** ADMIN

### Update User
**PUT** `/users/:id`
- **Roles:** ADMIN, User
- **Body:** (Optional fields)
  ```json
  {
    "fullName": "Updated Name",
    "email": "newemail@example.com"
  }
  ```

### Delete User
**DELETE** `/users/:id`
- **Roles:** ADMIN

---

## 3. STUDENT MANAGEMENT ENDPOINTS

### Create Student
**POST** `/students`
- **Roles:** ADMIN
- **Body:**
  ```json
  {
    "admissionNo": "STU001",
    "fullName": "Jane Doe",
    "gender": "FEMALE",
    "dob": "2015-05-20",
    "classId": 1,
    "parentId": 1
  }
  ```

### Get All Students
**GET** `/students`
- **Query Parameters:**
  - `classId`: Filter by class
- **Roles:** All authenticated users

### Update Student
**PUT** `/students/:id`
- **Roles:** ADMIN, TEACHER

### Delete Student
**DELETE** `/students/:id`
- **Roles:** ADMIN

---

## 4. TEACHER MANAGEMENT ENDPOINTS

### Create Teacher
**POST** `/teachers`
- **Roles:** ADMIN
- **Body:**
  ```json
  {
    "tscNo": "TSC123456",
    "fullName": "Mr. Kipchoge",
    "email": "kipchoge@school.com",
    "phone": "+254712345678",
    "subject": "Mathematics",
    "userId": 1
  }
  ```

### Get All Teachers
**GET** `/teachers`
- **Roles:** All authenticated users

### Update Teacher
**PUT** `/teachers/:id`
- **Roles:** ADMIN

### Delete Teacher
**DELETE** `/teachers/:id`
- **Roles:** ADMIN

---

## 5. CLASS MANAGEMENT ENDPOINTS

### Create Class
**POST** `/classes`
- **Roles:** ADMIN
- **Body:**
  ```json
  {
    "name": "Class 4A",
    "grade": "4",
    "stream": "A"
  }
  ```

### Get All Classes
**GET** `/classes`
- **Roles:** All authenticated users

### Update Class
**PUT** `/classes/:id`
- **Roles:** ADMIN

### Delete Class
**DELETE** `/classes/:id`
- **Roles:** ADMIN

---

## 6. ATTENDANCE ENDPOINTS

### Record Attendance
**POST** `/attendance`
- **Roles:** ADMIN, TEACHER
- **Body:**
  ```json
  {
    "studentId": 1,
    "date": "2026-05-13",
    "status": "PRESENT",
    "remarks": "On time",
    "term": "Term 1",
    "year": 2026
  }
  ```
- **Status values:** PRESENT, ABSENT, LATE, EXCUSED

### Get Student Attendance
**GET** `/attendance/student/:studentId`
- **Query Parameters:**
  - `term`: Filter by term
  - `year`: Filter by year
- **Roles:** All authenticated users

### Get Class Attendance
**GET** `/attendance/class/:classId`
- **Query Parameters:**
  - `date`: Specific date (YYYY-MM-DD)
  - `term`: Filter by term
- **Roles:** ADMIN, TEACHER

### Get Attendance Report
**GET** `/attendance/report`
- **Query Parameters:**
  - `term`: Filter by term
  - `year`: Filter by year
  - `classId`: Filter by class
- **Roles:** ADMIN, TEACHER

### Update Attendance
**PUT** `/attendance/:id`
- **Roles:** ADMIN, TEACHER
- **Body:**
  ```json
  {
    "status": "LATE",
    "remarks": "Traffic delay"
  }
  ```

### Delete Attendance
**DELETE** `/attendance/:id`
- **Roles:** ADMIN, TEACHER

---

## 7. ASSIGNMENT ENDPOINTS

### Create Assignment
**POST** `/assignments`
- **Roles:** ADMIN, TEACHER
- **Body:**
  ```json
  {
    "title": "Chapter 5 Homework",
    "description": "Complete questions 1-10 on page 45",
    "dueDate": "2026-05-20",
    "term": "Term 1",
    "teacherId": 1,
    "classId": 1
  }
  ```

### Get All Assignments
**GET** `/assignments`
- **Query Parameters:**
  - `classId`: Filter by class
  - `teacherId`: Filter by teacher
  - `term`: Filter by term
- **Roles:** All authenticated users

### Get Student Assignments
**GET** `/assignments/student/:studentId`
- **Roles:** STUDENT, PARENT, ADMIN, TEACHER

### Submit Assignment
**PUT** `/assignments/:assignmentId/submit/:studentId`
- **Roles:** STUDENT, PARENT
- **Note:** Automatically sets submitted=true and submittedAt timestamp

### Grade Assignment
**PUT** `/assignments/:assignmentId/grade/:studentId`
- **Roles:** ADMIN, TEACHER
- **Body:**
  ```json
  {
    "grade": "A",
    "feedback": "Excellent work!"
  }
  ```

### Get Assignment Statistics
**GET** `/assignments/:assignmentId/stats`
- **Roles:** ADMIN, TEACHER
- **Returns:** Total, submitted, not submitted, graded, not graded counts

### Update Assignment
**PUT** `/assignments/:id`
- **Roles:** ADMIN, TEACHER

### Delete Assignment
**DELETE** `/assignments/:id`
- **Roles:** ADMIN, TEACHER

---

## 8. ASSESSMENT ENDPOINTS

### Create Assessment
**POST** `/assessments`
- **Roles:** ADMIN, TEACHER
- **Body:**
  ```json
  {
    "studentId": 1,
    "subStrandId": 1,
    "score": "EE",
    "term": "Term 1"
  }
  ```
- **Score values:** EE (Exceeding Expectations), ME (Meeting Expectations), AE (Approaching Expectations), BE (Below Expectations)

### Get All Assessments
**GET** `/assessments`
- **Roles:** All authenticated users

### Update Assessment
**PUT** `/assessments/:id`
- **Roles:** ADMIN, TEACHER

### Delete Assessment
**DELETE** `/assessments/:id`
- **Roles:** ADMIN, TEACHER

---

## 9. COMPETENCY TRACKING ENDPOINTS

### Create Competency
**POST** `/competencies`
- **Roles:** ADMIN, TEACHER
- **Body:**
  ```json
  {
    "code": "COMP001",
    "name": "Communication Skills",
    "description": "Ability to communicate effectively",
    "grade": "4",
    "learningAreaId": 1,
    "studentId": 1,
    "level": "PROFICIENT",
    "evidence": "Student can write clear paragraphs"
  }
  ```
- **Level values:** DEVELOPING, PROFICIENT, ADVANCED, MASTERED

### Get Student Competencies
**GET** `/competencies/student/:studentId`
- **Query Parameters:**
  - `grade`: Filter by grade
  - `learningAreaId`: Filter by learning area
- **Roles:** All authenticated users
- **Returns:** Summary with counts by level + detailed competencies

### Get Competency Report
**GET** `/competencies/report`
- **Query Parameters:**
  - `studentId`: Filter by student
  - `grade`: Filter by grade
- **Roles:** ADMIN, TEACHER

### Update Competency
**PUT** `/competencies/:id`
- **Roles:** ADMIN, TEACHER
- **Body:**
  ```json
  {
    "level": "ADVANCED",
    "evidence": "Updated evidence"
  }
  ```

### Delete Competency
**DELETE** `/competencies/:id`
- **Roles:** ADMIN, TEACHER

---

## 10. PARENT PORTAL ENDPOINTS

### Create Parent
**POST** `/parents`
- **Roles:** ADMIN
- **Body:**
  ```json
  {
    "fullName": "Mrs. Jane Doe",
    "email": "jane@example.com",
    "phone": "+254712345678",
    "occupation": "Doctor",
    "userId": 1
  }
  ```

### Get Parent Details
**GET** `/parents/:id`
- **Roles:** All authenticated users

### Get Children Grades
**GET** `/parents/:parentId/grades`
- **Roles:** PARENT, ADMIN
- **Returns:** Students with their report cards and recent assessments

### Get Children Attendance
**GET** `/parents/:parentId/attendance`
- **Query Parameters:**
  - `term`: Filter by term
  - `year`: Filter by year
- **Roles:** PARENT, ADMIN
- **Returns:** Attendance summary per child with percentages

### Get Children Assignments
**GET** `/parents/:parentId/assignments`
- **Query Parameters:**
  - `status`: Filter by "submitted" or "pending"
- **Roles:** PARENT, ADMIN

### Send Message to Teacher
**POST** `/parents/:parentId/messages`
- **Roles:** PARENT
- **Body:**
  ```json
  {
    "teacherId": 1,
    "subject": "Concern about homework",
    "content": "My child is struggling with mathematics assignments"
  }
  ```

### Get Messages
**GET** `/parents/:parentId/messages`
- **Roles:** PARENT, ADMIN, TEACHER

### Mark Message as Read
**PUT** `/parents/messages/:id/read`
- **Roles:** All authenticated users

### Update Parent
**PUT** `/parents/:id`
- **Roles:** ADMIN

### Delete Parent
**DELETE** `/parents/:id`
- **Roles:** ADMIN

---

## 11. REPORT CARD ENDPOINTS

### Generate Report Card
**POST** `/report-cards/generate`
- **Roles:** ADMIN, TEACHER
- **Body:**
  ```json
  {
    "studentId": 1,
    "term": "Term 1",
    "year": "2026"
  }
  ```

### Get Report Cards
**GET** `/report-cards`
- **Roles:** All authenticated users
- **Behavior:**
  - If user role is STUDENT: Returns only their report cards
  - If user role is ADMIN/TEACHER: Returns all report cards

---

## 12. EXPORT ENDPOINTS

### Export Grades to JSON
**GET** `/export/grades/json`
- **Query Parameters:**
  - `studentId`: Optional, filter by student
  - `term`: Optional, filter by term
- **Roles:** ADMIN, TEACHER, PARENT
- **Response:** JSON file download

### Export Grades to CSV
**GET** `/export/grades/csv`
- **Query Parameters:**
  - `studentId`: Optional
  - `term`: Optional
- **Roles:** ADMIN, TEACHER, PARENT
- **Response:** CSV file download

### Export Grades to Excel
**GET** `/export/grades/excel`
- **Query Parameters:**
  - `studentId`: Optional
  - `term`: Optional
- **Roles:** ADMIN, TEACHER, PARENT
- **Response:** XLSX file download

### Export Report Card to PDF
**GET** `/export/report-card/:reportCardId/pdf`
- **Roles:** All authenticated users
- **Response:** PDF file download

### Export Competency Report to Excel
**GET** `/export/competency-report/excel`
- **Query Parameters:**
  - `studentId`: Optional
  - `grade`: Optional
- **Roles:** ADMIN, TEACHER, PARENT
- **Response:** XLSX file download

### Export All Report Cards to Excel
**GET** `/export/report-cards/excel`
- **Query Parameters:**
  - `term`: Optional
  - `year`: Optional
- **Roles:** ADMIN, TEACHER
- **Response:** XLSX file download

---

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad request (validation error)
- `401`: Unauthorized (no token or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `500`: Server error

---

## Role-Based Access Control

| Role    | Permissions |
|---------|------------|
| ADMIN   | Full access to all endpoints |
| TEACHER | Can manage students, assessments, assignments, competencies, attendance for their classes; view grades and report cards |
| STUDENT | Can view own grades, report cards, assignments; submit assignments; view own attendance |
| PARENT  | Can view children's grades, attendance, assignments; send messages to teachers; access parent portal |

---

## Validation Rules

### Email Format
- Must contain @ and a domain (e.g., user@example.com)

### Password
- Minimum 6 characters

### Phone Number
- Standard international format

### Student Age
- Must be between 3 and 25 years old

### Gender
- Valid values: MALE, FEMALE, OTHER

### Attendance Status
- Valid values: PRESENT, ABSENT, LATE, EXCUSED

### Assessment Score
- Valid values: EE, ME, AE, BE

### Competency Level
- Valid values: DEVELOPING, PROFICIENT, ADVANCED, MASTERED

### Skill Level
- Valid values: BEGINNING, DEVELOPING, PROFICIENT, ADVANCED

---

## Example Workflows

### Workflow 1: Adding a Student Grade
1. **POST** `/assessments` - Create assessment for student
2. **POST** `/competencies` - Track competency level
3. **POST** `/report-cards/generate` - Generate report card
4. **GET** `/export/report-card/:reportCardId/pdf` - Export as PDF

### Workflow 2: Parent Checking Child's Performance
1. **GET** `/parents/:parentId/grades` - View grades
2. **GET** `/parents/:parentId/attendance` - Check attendance
3. **GET** `/parents/:parentId/assignments` - View assignments
4. **POST** `/parents/:parentId/messages` - Send query to teacher

### Workflow 3: Recording Class Attendance
1. **POST** `/attendance` - Record attendance for each student
2. **GET** `/attendance/report` - Generate attendance report
3. **GET** `/export/grades/excel` - Export for analysis

---

## Data Relationships

```
User (1) ──┬──> Student (many)
           ├──> Teacher (1)
           └──> Parent (many)

Student ──────> Class (1)
        ├────> Attendance (many)
        ├────> Assessment (many)
        ├────> ReportCard (many)
        ├────> Competency (many)
        ├────> Assignment (many)
        └────> Parent (many)

Teacher ──────> Class (1)
       └────> Assignment (many)

Assignment ──┬──> Class (1)
            ├──> Teacher (1)
            └──> StudentAssignment (many)

Competency ──┬──> LearningArea (1)
            ├──> Student (1)
            └──> SkillAssessment (many)
```

---

## Testing the API

### Using cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"password123"}'

# Get students
curl -X GET http://localhost:5000/api/students \
  -H "Authorization: Bearer <token>"
```

### Using Postman
1. Set Authorization type to Bearer Token
2. Paste the JWT token from login response
3. Send requests to the endpoints above

---

## Rate Limiting & Performance

- No rate limiting currently implemented
- Consider adding for production
- Database indexes are recommended on frequently queried fields:
  - User.email
  - Student.classId
  - Assessment.studentId
  - Assignment.dueDate

---

## Future Enhancements

- [ ] WebSocket for real-time notifications
- [ ] Bulk import/export operations
- [ ] SMS/Email notifications
- [ ] Parent-teacher chat system
- [ ] Advanced analytics and reporting
- [ ] Student progress tracking over time
- [ ] Skill-based learning pathways
- [ ] API rate limiting
- [ ] Caching layer (Redis)
- [ ] Full-text search capability
