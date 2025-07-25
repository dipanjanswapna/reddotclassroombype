# Blueprint: Red Dot Classroom (RDC) Web Application

This document outlines the complete architecture, features, and user roles for the Red Dot Classroom (RDC) platform.

## 1. Core Technology Stack

- **Framework**: Next.js (with App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **AI Integration**: Google Genkit

## 2. User Roles & Dashboards

The platform supports multiple user roles, each with a dedicated dashboard and specific permissions.

### 2.1. Admin (`/admin`)
The Admin has full control over the platform.

- **Dashboard**: Central overview of platform-wide analytics (revenue, users, enrollments).
- **Homepage Management**: A full CMS to control all sections of the main landing page and static pages like "About Us" and "Strugglers to Toppers".
- **Offline Hub**: Manage physical branches, batches, offline courses, and student assignments.
- **Scan Attendance**: QR code/barcode scanner for taking attendance.
- **Group Access Verification**: Verify enrollment IDs to grant students access to secret groups.
- **Call Center**: View lists of absent students for follow-up and manage monthly student counseling calls.
- **User Management**:
    - **Staff Users**: Manage Admins, Teachers, Sellers, Moderators, Affiliates, and Doubt Solvers.
    - **Student Users**: Manage Students and Guardians.
    - **Manage User (Search)**: A dedicated page to search for any user by ID/roll number and view/edit their complete profile, including courses, attendance, and detailed payment history (paid, due, status).
- **Sellers**: Approve, manage, and view third-party seller organizations.
- **Courses**: Create, edit, publish, approve, and delete all courses. Manage **Course Cycles** to sell parts of a course separately.
- **Question Bank**: A centralized repository to create, edit, and manage all exam questions.
- **Blog**: A complete Content Management System (CMS) for creating, editing, and deleting blog posts.
- **Notices**: Manage and publish platform-wide announcements.
- **Teachers**: Approve applications and manage teacher profiles.
- **Promo Codes**: Create and manage all promotional codes.
- **Referrals**: Monitor the referral program's performance.
- **Pre-bookings**: Monitor course pre-booking campaigns and launch them.
- **Doubt Solvers**: Manage the team of dedicated doubt solvers.
- **Financials**: View detailed transaction history and revenue reports.
- **Analytics**: A real-time dashboard for web analytics and performance insights.
- **Reports**: In-depth reports on user growth, course enrollments, and top performers.
- **RDC Store Management**:
    - **Products**: Add, edit, and manage all physical products (books, stationery).
    - **Categories**: Create and organize product categories and sub-categories.
    - **Orders**: View and manage all customer orders.
    - **Rewards**: Manage the catalog of redeemable rewards for the point system.
    - **Redeem Requests**: Approve and process student reward redemption requests.
- **Settings**: Manage personal admin profile and platform-wide settings (e.g., enable/disable logins for different roles, manage API keys, referral settings).
- **ID Card**: View and download a personal Admin ID card.

### 2.2. Student (`/student`)
The primary consumer of educational content.

- **Dashboard**: Personalized overview of ongoing courses, progress, and upcoming deadlines.
- **My Courses**: A central hub to view enrolled, completed, wishlisted, and pre-booked courses.
- **Course-Specific Pages**: For each course, dedicated pages for:
    - Lessons (Video, Document, Quiz) with reaction and discussion capabilities.
    - Assignments (Submission & Feedback)
    - Exams (Schedule & Results)
    - Live Classes
    - Doubt Solve (Dedicated Q&A forum for the course)
    - Attendance Records
    - Announcements
    - Community (Course-specific group)
    - Reviews
    - Archived/Bonus Content
- **Study Planner**: A comprehensive tool for personal organization.
    - **Views**: Kanban Board (To Do, In Progress, Completed), Calendar (Month, Week, Day, Agenda), and List views.
    - **Organization**: Create Folders and Lists to categorize tasks.
    - **Task Management**: Create detailed tasks with status, priority, due dates, Pomodoro estimates, and checklists.
    - **Drag-and-Drop**: Easily move tasks between status columns.
    - **Google Calendar Sync**: Two-way synchronization of tasks and events.
    - **Analytics**: Track productivity with historical statistics and charts.
    - **Pomodoro Timer**: Integrated focus timer linked to tasks.
    - **Goals**: Set and track long-term and short-term academic goals.
- **Referrals & Rewards**:
    - **Referrals**: Track referred friends and earned points.
    - **Rewards**: Browse a catalog of rewards and redeem points.
- **Engagement & Profile**:
    - **Leaderboard & Achievements**: Gamified progress tracking.
    - **Profile & ID Card**: Manage personal info and view/download an ID card.
    - **Guardian Management**: Link and manage a guardian's account.
    - **Support**: Create and track support tickets.
- **AI-Powered Tools**:
    - **AI Tutor**: Chatbot for course-specific questions.
    - **AI Calculator**: Solve math problems described in natural language.
    - **Text-to-Speech (TTS)**: Convert text content into listenable audio.

### 2.3. Teacher (`/teacher`)
Content creators and student mentors.

- **Dashboard**: Overview of their courses, total students, pending grading tasks, and assigned offline batches.
- **Course Management**: Edit and manage content for assigned courses via a comprehensive Course Builder.
- **Student Management**: View lists of students enrolled in their courses.
- **Grading**: A dedicated interface to review and grade student assignments and exams.
- **Offline Management**:
    - **Attendance**: Take attendance for their assigned offline batches.
    - **Scan Attendance**: Use a QR code scanner for quick attendance.
- **Live Classes & Promotions**:
    - **Live Classes**: Manage and view scheduled live classes.
    - **Promo Codes**: Create promotional codes for their specific courses.
- **Profile & Earnings**:
    - **Profile**: Manage their public-facing teacher profile, including bio and social links.
    - **Earnings**: Track revenue generated from their courses.
    - **ID Card**: View and download a personal Teacher ID card.

### 2.4. Guardian (`/guardian`)
Monitors a student's progress.

- **Dashboard**: A snapshot of their linked child's academic progress.
- **Progress Reports**: View detailed reports on assignment grades and exam scores.
- **Activity Monitoring**: Access to the child's enrolled courses and attendance history.
- **Communication**: A dedicated page to contact the child's teachers.
- **Profile & Settings**: Manage personal account information and ID card.

### 2.5. Seller (`/seller`)
Third-party organizations that publish courses.

- **Dashboard**: Overview of the organization's sales and student enrollment performance.
- **Storefront & Branding**: Customize a dedicated public-facing storefront page (`/sites/[site]`), including custom colors and hero section.
- **Course Management**: Create and manage all courses published by their organization.
- **Instructor Management**: Invite and manage teachers associated with their organization.
- **Student Management**: View a list of all students enrolled in their courses.
- **Call Center & Attendance**: Tools to manage student engagement and attendance for their offline courses.
- **Analytics & Payouts**: View sales analytics and payout history.
- **Profile & ID Card**: Manage the organization's profile and view its ID card.

### 2.6. Affiliate (`/affiliate`)
Promotes courses and earns commissions.

- **Dashboard**: Overview of referral performance (clicks, sign-ups, earnings).
- **Link Generation**: Create unique referral links for any course.
- **Analytics & Payouts**: Track link performance and view payout history.
- **Call Center**: A dedicated interface to contact absent students.
- **Profile & ID Card**: Manage personal information and view an affiliate ID card.

### 2.7. Moderator (`/moderator`)
Maintains community standards and provides support.

- **Dashboard**: Overview of community health and pending tasks.
- **Content Review**: A queue for reviewing user-reported content (comments, reviews).
- **Support Tickets**: A dedicated interface to manage and respond to user support requests.
- **Call Center & Attendance**: Tools to manage student engagement and attendance.
- **Scan Attendance**: Use a QR scanner to mark student attendance.
- **Profile & ID Card**: Manage personal information and view a moderator ID card.

### 2.8. Doubt Solver (`/doubt-solver`)
Dedicated experts for resolving student queries.

- **Dashboard**: View a queue of open and re-opened doubts assigned to them or available in their assigned courses.
- **Doubt Answering Interface**: A dedicated page to view the full context of a doubt, see previous answers, and provide new responses.
- **My Doubts**: A history of all doubts they have answered.
- **Profile & ID Card**: Manage personal information and view a Doubt Solver ID card.

## 3. Public-Facing Pages

- **Home (`/`)**: Dynamic landing page controlled via the Admin CMS.
- **RDC Store (`/store`)**: A filterable catalog of all published products (books, stationery, etc.).
- **Product Details (`/store/product/[id]`)**: Detailed page for each product with description, reviews, and add-to-cart functionality.
- **Courses (`/courses`)**: A filterable catalog of all published courses.
- **Course Details (`/courses/[id]`)**: Detailed page for each course, including syllabus, instructor info, reviews, and course cycles.
- **Blog (`/blog`)**: A list of all published blog posts.
- **Blog Post (`/blog/[slug]`)**: SEO-friendly page for individual articles.
- **Teachers (`/teachers`)**: A browsable directory of all approved instructors.
- **Teacher Profile (`/teachers/[slug]`)**: A public profile page for each instructor.
- **Partner Storefront (`/sites/[site]`)**: A dedicated, brandable storefront for each seller.
- **Offline Hub (`/offline-hub`)**: A public page showcasing offline centers and programs.
- **Authentication Pages**: Custom pages for login, signup, password reset, and role-specific applications.
- **Static Pages**: About Us, Contact Us, FAQ, Privacy Policy, Terms of Service.
- **Strugglers to Topper (`/strugglers-studies`)**: A page explaining how RDC helps students succeed.

## 4. AI-Powered Features (Genkit)

- **AI Tutor**: An interactive chatbot for answering student questions based on course material.
- **AI Course Creator**: An admin tool to generate a full course structure (title, description, syllabus, FAQs) from a single topic.
- **AI Quiz Generator**: A tool to automatically create quizzes for any lesson.
- **AI Study Planner**: A feature for students to generate a personalized study schedule.
- **AI Calculator**: A tool that solves math problems described in natural language.
- **Text-to-Speech (TTS)**: Converts text content into listenable audio.
