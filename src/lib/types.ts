
import { Timestamp } from "firebase/firestore";
import type { StudyPlanEvent } from '@/ai/schemas/study-plan-schemas';

export type LiveClass = {
  id: string;
  topic: string;
  date: string;
  time: string;
  platform: 'Zoom' | 'Google Meet' | 'Facebook Live' | 'YouTube Live';
  joinUrl: string;
};

export type Lesson = {
  id: string;
  title: string;
  type: 'video' | 'quiz' | 'document';
  duration: string;
  videoId?: string;
  lectureSheetUrl?: string;
  quizId?: string;
  reactions?: {
    likes?: number;
    loves?: number;
    helpfuls?: number;
  };
};

export type SyllabusModule = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Review = {
  id: string;
  user: {
    name: string;
    avatarUrl: string;
    dataAiHint: string;
  };
  rating: number;
  comment: string;
  date: string;
};

export type Organization = {
  id?: string;
  name: string;
  logoUrl: string;
  status: 'approved' | 'pending' | 'rejected';
  subdomain: string;
  primaryColor: string;
  secondaryColor: string;
  hero?: {
    title: string;
    subtitle: string;
    imageUrl: string;
    dataAiHint?: string;
  };
  contactEmail?: string;
  description?: string;
  contactUserId?: string;
};

export type CourseInstructor = {
  name: string;
  title: string;
  avatarUrl: string;
  dataAiHint: string;
  slug: string;
}

export type Instructor = {
  id?: string;
  name: string;
  title: string;
  avatarUrl: string;
  dataAiHint: string;
  slug: string;
  status: 'Approved' | 'Pending Approval' | 'Rejected';
  bio: string;
  socials?: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
  }
  organizationId?: string;
  userId?: string;
  youtubeClasses?: {
    id: string;
    title: string;
    youtubeUrl: string;
  }[];
}

export type QuizQuestion = {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctAnswerId: string;
};

export type Quiz = {
  id: string;
  title: string;
  topic: string;
  questions: QuizQuestion[];
  // These were from mock-data, but are not set in the builder.
  // The consuming components should handle their absence.
  totalQuestions?: number;
  duration?: number; // in minutes
  status?: 'Completed' | 'Not Started' | 'In Progress';
  score?: number;
};

export type Assignment = {
  id: string;
  title: string;
  topic: string;
  deadline: string | Timestamp;
  status: 'Submitted' | 'Pending' | 'Graded' | 'Late';
  grade?: string;
  feedback?: string;
  submissionDate?: string | Timestamp;
  studentId: string;
  studentName: string;
  submissionText?: string;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: 'Medal' | 'Trophy' | 'Zap' | 'BrainCircuit' | 'BookOpenCheck';
  date: string;
};

export type LeaderboardEntry = {
  id: string;
  rank: number;
  name: string;
  email: string;
  avatar: string;
  points: number;
};

export type Notification = {
  id?: string;
  userId: string;
  icon: 'Award' | 'Video' | 'Megaphone' | 'FileCheck2';
  title: string;
  description: string;
  date: Timestamp;
  read: boolean;
  link?: string;
};

export type AssignmentTemplate = {
  id: string;
  title: string;
  topic: string;
  deadline?: string | Timestamp | Date;
};

export type Course = {
  id?: string;
  title: string;
  description: string;
  instructors: CourseInstructor[]; 
  imageUrl: string;
  dataAiHint: string;
  category: string;
  subCategory?: string;
  price: string;
  discountPrice?: string;
  status: 'Published' | 'Pending Approval' | 'Draft' | 'Rejected';
  rating?: number;
  reviews?: number;
  whatYouWillLearn?: string[];
  syllabus?: SyllabusModule[];
  features?: string[];
  features_detailed?: { title: string; description: string }[];
  imageTitle?: string;
  classRoutine?: { day: string; subject: string; time: string; id?: string; instructorName?: string; }[];
  faqs?: { question: string; answer: string; id?: string; }[];
  reviewsData?: Review[];
  liveClasses?: LiveClass[];
  isArchived?: boolean;
  includedArchivedCourseIds?: string[];
  isPrebooking?: boolean;
  prebookingPrice?: string;
  prebookingEndDate?: string;
  prebookingCount?: number;
  prebookingTarget?: number;
  organizationId?: string;
  organizationName?: string;
  quizzes?: Quiz[];
  assignments?: Assignment[];
  assignmentTemplates?: AssignmentTemplate[];
  announcements?: Announcement[];
  isWishlisted?: boolean;
  communityUrl?: string;
  videoUrl?: string;
  whatsappNumber?: string;
  showStudentCount?: boolean;
};


export type BlogPost = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  dataAiHint: string;
  content: string;
};

export type PromoCode = {
  id?: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  usageCount: number;
  usageLimit: number;
  expiresAt: string;
  isActive: boolean;
  applicableCourseIds: string[]; // 'all' for all courses
  createdBy: 'admin' | string; // admin or teacherId
  restrictedToUserId?: string;
}

export type Prebooking = {
  id?: string;
  userId: string;
  courseId: string;
  prebookingDate: Timestamp;
};

export type SupportTicket = {
  id?: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Closed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
  userName: string;
  category?: 'General' | 'Guardian Inquiry';
  recipient?: string;
  replies: {
    author: 'Student' | 'Support' | 'Guardian';
    message: string;
    date: Timestamp;
  }[];
};

export type User = {
  id?: string;
  uid: string; // Firebase Auth UID
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Student' | 'Teacher' | 'Guardian' | 'Admin' | 'Affiliate' | 'Moderator' | 'Seller';
  status: 'Active' | 'Suspended' | 'Pending Approval';
  joined: Timestamp;
  className?: string;
  classRoll?: string;
  registrationNumber?: string;
  linkedStudentId?: string; // For guardians
  linkedGuardianId?: string; // For students
  wishlist?: string[];
  ratedCourses?: string[];
  reactedLessons?: string[];
  fathersName?: string;
  mothersName?: string;
  nidNumber?: string;
  mobileNumber?: string;
  address?: string;
  referredBy?: string;
  socials?: {
    facebook?: string;
  };
  studyPlan?: StudyPlanEvent[];
};

export type Enrollment = {
  id?: string;
  userId: string;
  courseId: string;
  enrollmentDate: Timestamp;
  progress: number;
  status: 'in-progress' | 'completed';
};

export type CollaborationItem = {
    id: number;
    name: string;
    organizationId: string;
    type: string;
    logoUrl: string;
    dataAiHint: string;
    description: { [key: string]: string };
    cta: {
        text: { [key: string]: string };
        href: string;
    };
    socials: {
        facebook: string;
        youtube: string;
    };
};

export type PlatformRoleSettings = {
  signupEnabled: boolean;
  loginEnabled: boolean;
};

export type PlatformSettings = {
  Student: PlatformRoleSettings;
  Teacher: PlatformRoleSettings;
  Guardian: PlatformRoleSettings;
  Admin: PlatformRoleSettings;
  Seller: PlatformRoleSettings;
  Affiliate: PlatformRoleSettings;
  Moderator: PlatformRoleSettings;
};

export type HomepageConfig = {
  id?: string;
  logoUrl?: string;
  heroBanners: {
    id: number;
    href: string;
    imageUrl: string;
    alt: string;
    dataAiHint: string;
  }[];
  heroCarousel?: {
    autoplay: boolean;
    autoplayDelay: number;
  };
  journeySection: {
    display: boolean;
    title: { [key: string]: string };
    subtitle: { [key: string]: string };
    courseTitle: { [key: string]: string };
  };
  liveCoursesIds: string[];
  teachersSection: {
    display: boolean;
    title: { [key: string]: string };
    subtitle: { [key: string]: string };
    buttonText: { [key: string]: string };
    instructorIds: string[];
  };
  videoSection: {
    display: boolean;
    title: { [key: string]: string };
    description: { [key: string]: string };
    buttonText: { [key: string]: string };
    videos: {
      imageUrl: string;
      videoUrl: string;
      alt: string;
      dataAiHint: string;
    }[];
  };
  sscHscSection: {
    display: boolean;
    badge: { [key: string]: string };
    title: { [key: string]: string };
  };
  sscHscCourseIds: string[];
  masterclassSection: {
    display: boolean;
    title: { [key: string]: string };
    buttonText: { [key: string]: string };
  };
  masterClassesIds: string[];
  admissionSection: {
    display: boolean;
    badge: { [key: string]: string };
    title: { [key: string]: string };
    buttonText: { [key: string]: string };
  };
  admissionCoursesIds: string[];
  jobPrepSection: {
    display: boolean;
    badge: { [key: string]: string };
    title: { [key: string]: string };
    buttonText: { [key: string]: string };
  };
  jobCoursesIds: string[];
  whyChooseUs: {
    display: boolean;
    title: { [key: string]: string };
    features: {
      icon: string;
      title: { [key: string]: string };
      description: { [key: string]: string };
    }[];
  };
  collaborations: {
    display: boolean;
    title: { [key: string]: string };
    items: CollaborationItem[];
  };
  socialMediaSection: {
    display: boolean;
    title: { [key: string]: string };
    description: { [key: string]: string };
    channels: {
      id: number;
      platform: string;
      name: { [key: string]: string } | string;
      handle: string;
      stat1_value: string;
      stat1_label: { [key: string]: string } | string;
      stat2_value: string;
      stat2_label: { [key: string]: string } | string;
      description: { [key: string]: string } | string;
      ctaText: { [key: string]: string } | string;
      ctaUrl: string;
    }[];
  };
  notesBanner: {
    display: boolean;
    title: { [key: string]: string };
    description: { [key: string]: string };
    buttonText: { [key: string]: string };
  };
  statsSection: {
    display: boolean;
    title: { [key: string]: string };
    stats: {
      value: string;
      label: { [key: string]: string };
    }[];
  };
  appPromo: {
    display: boolean;
    title: { [key: string]: string };
    description: { [key: string]: string };
    googlePlayUrl: string;
    appStoreUrl: string;
    imageUrl: string;
    dataAiHint: string;
  };
  floatingWhatsApp: {
    display: boolean;
    number: string;
  };
  platformSettings: PlatformSettings;
};
