# Blueprint: Red Dot Classroom (RDC) Master Ecosystem

This document defines the complete architecture, feature set, and visual standards for the Red Dot Classroom platform—a high-density Learning Management System (LMS) and Store ecosystem tailored for the Bangladeshi academic landscape.

## 1. Core Technology Architecture

- **Framework**: Next.js 15 (App Router) with full Async API compliance.
- **Language**: TypeScript (Strict mode).
- **Styling**: Tailwind CSS with a standardized design token system.
- **UI Components**: ShadCN UI (Enhanced for high-density and responsiveness).
- **Database**: Firebase Firestore (Role-based access control).
- **Authentication**: Firebase Authentication (Multi-provider, single-device enforcement for students).
- **AI Integration**: Google Genkit (Gemini 2.0 Flash) for curriculum synthesis and tutoring.
- **Analytics**: Integrated Web Vitals and Facebook Pixel.

## 2. Global Visual & UX Standards

- **Color Palette**:
    - **Primary**: Deep Red/Maroon (#8B1538) - Conveys authority and academic excellence.
    - **Secondary**: Dark Navy/Black (#1a1a2e) - Establishes structural hierarchy.
    - **Accent**: Green (#28a745) - Directs user focus to growth-oriented CTAs.
- **Typography**:
    - **Headlines**: 'Poppins' (Sans-serif) - Bold, modern, and uppercase-ready.
    - **Body**: 'Inter' (Sans-serif) - Optimized for readability across dense datasets.
    - **Bengali**: 'Hind Siliguri' - Integrated for local context.
- **Design Tokens**:
    - **Corner Radius**: Standardized `rounded-xl` (12px) and `rounded-2xl` (16px) for a tight, professional edge.
    - **Vertical Rhythm**: `py-10 md:py-14` for public sections; `space-y-10 md:space-y-14` for dashboard arrivals.
    - **Glassmorphism**: High-blur backdrops (`backdrop-blur-xl`) for navigation and primary modals.
    - **Responsive Architecture**: "Smart Stacking" logic transforms wide data tables into accessible cards on mobile.

## 3. User Roles & Specialized Portals

### 3.1. Admin Portal (`/admin`)
- **System Command Center**: Total oversight of revenue, user growth, and active sessions.
- **Home CMS**: Fully dynamic control over site branding (Logo, WhatsApp), carousel speeds, and section visibility.
- **Offline Hub Management**: Branch control, batch assignments, and classroom logistics.
- **Master User Management**: Comprehensive search (by ID/Roll) and identity archiving for staff and students.
- **Global Course Logistics**: Full lifecycle control of all courses via Course Builder 2.0.
- **Store Logistics**: Inventory management, product categorization, and reward redemption processing.
- **Central Question Bank**: A repository for all strategic exam artifacts.

### 3.2. Student Portal (`/student`)
- **Academic Dashboard**: Visual progress tracking, upcoming deadlines, and resume-learning CTAs.
- **Learning Library**: Enrolled, wishlisted, and pre-booked curriculum vaults.
- **Course Interactive Zone**: 
    - Lessons (Video, Document, Quiz) with high-impact discussion hubs.
    - Automated & Written Exams with live leaderboards.
    - Doubt Solve Forum (Linked to expert team).
- **Study Planner Suite**: 
    - Kanban/Board, Calendar, and Analytics views.
    - 2-Way Google Calendar Synchronization.
    - Integrated Pomodoro Timer & Goal Tracker.
- **Rewards & Referrals**: Referral point system and gift redemption catalog.

### 3.3. Teacher Portal (`/teacher`)
- **Academic Panel**: Overview of assigned courses, total student reach, and grading tasks.
- **Course Builder**: Content creation and management for assigned modules.
- **Grading Suite**: Dedicated interface for reviewing written exams and assignment submissions.
- **Digital Attendance**: Mobile-friendly roll-call and QR scanning for offline hub batches.
- **Performance Analytics**: Track instructor ratings and course revenue.

### 3.4. Guardian Portal (`/guardian`)
- **Parental Dashboard**: Real-time snapshot of the linked child's progress and attendance.
- **Activity Monitoring**: Access to child's enrolled course list and exam performance logs.
- **Direct Communication**: Secure inquiry system to contact course instructors.

### 3.5. Partner/Seller Portal (`/seller`)
- **Organization Dashboard**: Sales performance and student enrollment analytics.
- **Storefront Branding**: Customize a dedicated storefront (`/sites/[slug]`) with HSL brand colors and hero media.
- **Faculty Management**: Invite and manage a team of instructors under the organization node.

### 3.6. Additional Portals
- **Moderator (`/moderator`)**: Community standards review, support ticket resolution, and absentee follow-ups.
- **Affiliate (`/affiliate`)**: Referral link generation, conversion tracking, and payout monitoring.
- **Doubt Solver (`/doubt-solver`)**: High-priority expert queue for resolving complex student academic queries.

## 4. Public-Facing Infrastructure

- **Dynamic Homepage**: Controllable via Admin CMS with live Notice Board integration.
- **RDC Shop (`/courses`)**: Filterable mega-catalog with high-density 4-column grids.
- **Course Details**: Purchase-first layout featuring modular **Course Cycles**, routines, and academic roadmaps.
- **RDC Store (`/store`)**: Filterable physical product catalog with cart and checkout integration.
- **Teacher Directory**: Professional 5-column grid showcasing the elite mentor team.
- **Blog Hub**: SEO-optimized insight repository with Markdown support.

## 5. AI Synergist Ecosystem (Genkit)

- **AI Tutor**: Course-context-aware chatbot for 24/7 academic support.
- **Curriculum Architect**: Admin tool to synthesize full course structures from a single topic.
- **Quiz Generator**: Automated creation of MCQs based on lesson content.
- **Calculator Synergist**: Solving math problems described in natural language.
- **TTS Engine**: Converting academic text into listenable WAV artifacts.

## 6. Security & Integrity

- **Single Device Logic**: Prevents student account sharing via session ID validation.
- **Secure Proctoring**: Webcam enforcement during high-stakes strategic assessments.
- **Data Protection**: Firestore security rules enforced by role and ownership.
- **Sync Integrity**: Universal usage of Server Actions for all "Soktishali" Save/Delete operations.
