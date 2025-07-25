

import { Timestamp } from "firebase/firestore";

export type ProductReview = {
    id: string;
    userId: string;
    userName: string;
    avatarUrl: string;
    rating: number;
    comment: string;
    createdAt: Timestamp;
};

export type Product = {
    id: string;
    name: string;
    category: string;
    subCategory?: string;
    price: number;
    oldPrice?: number;
    imageUrl: string;
    gallery?: string[];
    videoUrl?: string;
    dataAiHint?: string;
    description?: string;
    sellerId?: string; // Admin or Seller Organization ID
    stock?: number;
    isPublished?: boolean;
    ratings?: number; // Average rating
    reviewsCount?: number;
    reviews?: ProductReview[];
};

export type Reward = {
  id?: string;
  title: string;
  description: string;
  pointsRequired: number;
  imageUrl: string;
  stock?: number;
  type: 'physical_gift' | 'promo_code';
  promoCodeDetails?: {
    type: 'percentage' | 'fixed';
    value: number;
    applicableCourseIds?: string[];
  }
}

export type RedemptionRequest = {
  id?: string;
  userId: string;
  rewardId: string;
  rewardTitle: string;
  pointsSpent: number;
  requestedAt: Timestamp;
  status: 'Pending' | 'Approved' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress?: {
      fullName: string;
      addressLine1: string;
      city: string;
      postalCode: string;
      phoneNumber: string;
  };
  trackingNumber?: string;
  processedBy?: string; // Admin UID
  processedAt?: Timestamp;
  generatedPromoCode?: string;
};

export type OrderItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
};

export type Order = {
    id?: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    shippingDetails: {
        name: string;
        phone: string;
        district: string;
        thana: string;
        address: string;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type QuestionOption = {
  id: string;
  text: string;
  isCorrect?: boolean;
};

export type MatchingPair = {
  id: string;
  prompt: string;
  match: string;
};

export type Question = {
  id?: string;
  type: 'MCQ' | 'True/False' | 'Fill in the Blanks' | 'Short Answer' | 'Essay' | 'Matching';
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  points: number;
  explanation?: string;
  subject?: string;
  chapter?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
  hint?: string;

  // Type-specific fields
  options?: QuestionOption[]; // For MCQ.
  correctAnswer?: 'True' | 'False'; // For True/False
  blanks?: string[]; // For Fill in the Blanks
  matchingPairs?: MatchingPair[]; // For Matching
};

export type NoticeAttachment = {
  fileName: string;
  fileURL: string;
  fileType: string;
};

export type Notice = {
  id?: string;
  title: string;
  content: string;
  publishedAt: Timestamp;
  authorId: string;
  authorRole: string;
  attachments?: NoticeAttachment[];
  isPublished: boolean;
  targetAudience?: ('student' | 'teacher' | 'all')[];
  expiresAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

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
  instructorSlug?: string;
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
    userId: string;
    name: string;
    avatarUrl: string;
    dataAiHint: string;
  };
  rating: number;
  comment: string;
  date: string;
  isReported?: boolean;
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
  assignedCourses?: string[];
}

export type QuizQuestion = {
    id: string;
    text: string;
    options: { id: string; text: string; }[];
    correctAnswerId: string;
};

export type QuizTemplate = {
  id: string;
  title: string;
  topic: string;
  questions: QuizQuestion[];
};

export type QuizResult = {
  id: string; // quizTemplateId-studentId
  quizTemplateId: string;
  studentId: string;
  studentName: string;
  score: number; // as percentage
  status: 'Completed';
  answers: Record<string, string>; // { questionId: optionId }
  submissionDate: Timestamp;
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
  courseId?: string; // Added for convenience in some components
};

export type Exam = {
  id: string; // examTemplateId-studentId
  studentId: string;
  studentName: string;
  title: string;
  topic: string;
  examType: 'MCQ' | 'Written' | 'Oral' | 'Practical' | 'Essay' | 'Short Answer';
  totalMarks: number;
  examDate?: string | Timestamp | Date;
  status: 'Pending' | 'Submitted' | 'Graded';
  marksObtained?: number;
  grade?: string;
  feedback?: string;
  submissionText?: string;
  submissionDate?: string | Timestamp | Date;
  answers?: Record<string, any>; // { [questionId]: answerValue } - Flexible for different answer types
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
  icon: 'Medal' | 'Trophy' | 'Zap' | 'BrainCircuit' | 'BookOpenCheck' | 'Star';
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
  icon: 'Award' | 'Video' | 'Megaphone' | 'FileCheck2' | 'ThumbsUp' | 'Users' | 'HelpCircle' | 'MessageSquare' | 'Star';
  title: string;
  description: string;
  date: Timestamp;
  read: boolean;
  link?: string;
  relatedId?: string;
};

export type AssignmentTemplate = {
  id: string;
  title: string;
  topic: string;
  deadline?: string | Timestamp | Date;
};

export type ExamTemplate = {
  id: string;
  title: string;
  topic: string;
  examType: 'MCQ' | 'Written' | 'Oral' | 'Practical' | 'Essay' | 'Short Answer';
  totalMarks: number;
  examDate?: string | Timestamp | Date;
  questions?: Question[];
  duration?: number; // Duration in minutes
  passMarks?: number;
  maxAttempts?: number; // How many times a student can retake the exam
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean; // For MCQs
  allowBackNavigation?: boolean;
  webcamProctoring?: boolean;
};

export type Classroom = {
  id: string;
  name: string;
  capacity: number;
  equipment: string;
};

export type Branch = {
    id?: string;
    name: string;
    address: string;
    contactPhone: string;
    contactEmail: string;
    managerId?: string; // User ID of the branch manager
    branchCode?: string;
    officeHours?: string;
    holidays?: string;
    classrooms?: Classroom[];
};

export type Batch = {
    id?: string;
    name: string;
    courseId: string;
    branchId: string;
    instructorSlugs: string[];
    schedule: { day: string; time: string }[];
    startDate: string;
    endDate: string;
    capacity: number;
    studentCount: number;
};

export type AttendanceRecord = {
  id?: string;
  studentId: string;
  batchId: string;
  courseId: string;
  branchId: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late';
  recordedBy: string; // teacher's user id
  callStatus?: 'Called';
};

export type CourseCycle = {
  id: string;
  title: string;
  price: string;
  description: string;
  order: number;
  moduleIds: string[]; // List of syllabus module IDs included in this cycle
  communityUrl?: string;
};

export type Course = {
  id?: string;
  title: string;
  description: string;
  type?: 'Online' | 'Offline' | 'Hybrid' | 'Exam';
  instructors: CourseInstructor[]; 
  imageUrl: string;
  dataAiHint: string;
  category: string;
  subCategory?: string;
  price: string;
  discountPrice?: string;
  whatsappNumber?: string;
  isPrebooking?: boolean;
  prebookingPrice?: string;
  prebookingEndDate?: string;
  prebookingCount?: number;
  prebookingTarget?: number;
  cycles?: CourseCycle[];
  status: 'Published' | 'Pending Approval' | 'Draft' | 'Rejected';
  rating?: number;
  reviews?: number;
  whatYouWillLearn?: string[];
  syllabus?: SyllabusModule[];
  features?: string[];
  imageTitle?: string;
  classRoutine?: { day: string; subject: string; time: string; id?: string; instructorName?: string; }[];
  faqs?: { question: string; answer: string; id?: string; }[];
  reviewsData?: Review[];
  liveClasses?: LiveClass[];
  isArchived?: boolean;
  includedCourseIds?: string[];
  organizationId?: string;
  organizationName?: string;
  quizTemplates?: QuizTemplate[];
  quizResults?: QuizResult[];
  assignments?: Assignment[];
  assignmentTemplates?: AssignmentTemplate[];
  exams?: Exam[];
  examTemplates?: ExamTemplate[];
  announcements?: Announcement[];
  isWishlisted?: boolean;
  communityUrl?: string;
  videoUrl?: string;
  showStudentCount?: boolean;
  doubtSolverIds?: string[]; // Array of user IDs for doubt solvers
};

// ===================================
// Study Planner Specific Types
// ===================================

export type CheckItem = {
    id: string;
    text: string;
    isCompleted: boolean;
};

export type PlannerTask = {
    id?: string;
    userId: string;
    listId?: string;
    title: string;
    description?: string;
    date: string | Date; // Allow both for component state and DB
    time?: string; // HH:mm
    endTime?: string;
    status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    estimatedPomo?: number;
    actualPomo?: number;
    timeSpentSeconds?: number;
    googleCalendarEventId?: string | null;
    createdAt?: Timestamp;
    lastUpdatedAt?: Timestamp;
    completedAt?: Timestamp;
    type: 'study-session' | 'assignment-deadline' | 'quiz-reminder' | 'exam-prep' | 'habit';
    courseTitle?: string;
    checkItems?: CheckItem[];
};

export type List = {
    id?: string;
    folderId?: string;
    userId: string;
    name: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type Folder = {
    id?: string;
    userId: string;
    name: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type Goal = {
    id?: string;
    userId: string;
    title: string;
    description?: string;
    type: 'long_term' | 'short_term';
    targetDate?: Timestamp | Date;
    progress: number; // 0-100
    status: 'active' | 'achieved' | 'abandoned';
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

// ===================================

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
};

export type Prebooking = {
  id?: string;
  userId: string;
  courseId: string;
  prebookingDate: Timestamp;
};

export type Payout = {
  id?: string;
  userId: string; // The user receiving the payout (Affiliate, Teacher, Seller)
  amount: number;
  payoutDate: Timestamp;
  status: 'Completed' | 'Pending' | 'Failed';
  transactionId?: string;
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
  role: 'Student' | 'Teacher' | 'Guardian' | 'Admin' | 'Affiliate' | 'Moderator' | 'Seller' | 'Doubt Solver';
  status: 'Active' | 'Suspended' | 'Pending Approval';
  joined: Timestamp | Date | string;
  className?: string;
  classRoll?: string;
  registrationNumber?: string;
  linkedStudentId?: string; // For guardians
  linkedGuardianId?: string; // For students
  wishlist?: string[];
  enrolledCourses?: string[];
  ratedCourses?: string[];
  reactedLessons?: string[];
  fathersName?: string;
  mothersName?: string;
  nidNumber?: string;
  mobileNumber?: string;
  guardianMobileNumber?: string;
  address?: string; // New field for shipping
  referredBy?: string; // UID of the referrer
  hasUsedReferral?: boolean; // To check if they have used a referral code before
  referralPoints?: number;
  studyPoints?: number;
  achievements?: string[]; // Array of achievement IDs
  studyPlan?: PlannerTask[];
  pomodoroSettings?: { work: number; shortBreak: number; longBreak: number; };
  // Offline fields
  offlineRollNo?: string;
  assignedBranchId?: string;
  assignedBatchId?: string;
  lastCounseledAt?: Timestamp;
  // Doubt Solver fields
  assignedCourses?: string[]; // Array of courseIds
  currentSessionId?: string;
  lastLoginAt?: Timestamp;
  // Google Calendar Sync
  googleCalendarTokens?: {
    accessToken: string;
    refreshToken: string;
    expiryDate: number;
  };
  plannerSettings?: {
    theme: string;
    whiteNoise: string;
  }
};

export type Referral = {
  id?: string;
  referrerId: string; // UID of the user who referred
  referredUserId: string; // UID of the new user who was referred
  referredUserName: string;
  courseId: string;
  courseName: string;
  status: 'Pending' | 'Awarded' | 'Cancelled';
  discountGiven: number;
  rewardedPoints: number;
  date: Timestamp;
  awardedAt?: Timestamp;
};

export type Enrollment = {
  id?: string;
  invoiceId?: string;
  userId: string;
  courseId: string;
  enrollmentDate: any;
  progress: number;
  status: 'in-progress' | 'completed';
  completedLessons?: string[];
  totalFee?: number;
  paidAmount?: number;
  dueAmount?: number;
  paymentMethod?: string;
  discount?: number;
  enrolledBy?: string; // UID of admin/staff who enrolled
  paymentStatus?: 'paid' | 'due' | 'partial';
  enrollmentType?: 'full_course' | 'cycle';
  cycleId?: string;
  accessGranted?: {
      moduleIds?: string[];
  };
  isGroupAccessed?: boolean;
  groupAccessedAt?: Timestamp;
  groupAccessedBy?: string;
  usedReferralCode?: string;
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
  DoubtSolver: PlatformRoleSettings;
};

export type FreeClass = {
  id: string;
  title: string;
  youtubeUrl: string;
  subject: string;
  instructor: string;
  grade: string;
};

export type OfflineHubContactSection = {
  display: boolean;
  title: { [key: string]: string };
  subtitle: { [key: string]: string };
  callButtonText: { [key: string]: string };
  callButtonNumber: string;
  whatsappButtonText: { [key: string]: string };
  whatsappNumber: string;
};

export type TeamMember = {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  dataAiHint: string;
  socialLinks: {
    platform: 'facebook' | 'linkedin' | 'twitter' | 'external';
    url: string;
  }[];
};

export type TopperPageCard = {
  id: string;
  iconUrl: string;
  dataAiHint: string;
  title: string;
  description: string;
};

export type TopperPageSection = {
  display: boolean;
  title: string;
  mainImageUrl: string;
  mainImageDataAiHint: string;
  cards: TopperPageCard[];
};

export type WhyChooseUsFeature = {
    id: string;
    iconUrl: string;
    dataAiHint: string;
    title: { [key: string]: string };
};

export type Testimonial = {
    id: string;
    quote: { [key: string]: string };
    studentName: string;
    college: string;
    imageUrl: string;
    dataAiHint: string;
};

export type OfflineHubHeroSlide = {
  id: number;
  imageUrl: string;
  dataAiHint: string;
  title: string;
  subtitle: string;
  price: string;
  originalPrice: string;
  enrollHref: string;
};

export type ReportedContent = {
  id?: string;
  contentType: 'review';
  contentId: string; // The ID of the review
  courseId: string;
  courseTitle: string;
  reporterId: string; // UID of the user who reported it
  reportedUserId: string; // User ID from the review
  contentSnapshot: string; // The text of the review
  status: 'pending' | 'resolved';
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
  resolverId?: string; // Moderator's UID
  actionTaken?: 'dismissed' | 'content_deleted';
};

export type Invoice = {
  id?: string;
  enrollmentId: string;
  userId: string;
  courseId: string;
  invoiceNumber: string;
  status: 'VALID' | 'CANCELLED';
  coupon?: string;
  invoiceDate: any; // Using any to accommodate serverTimestamp and Timestamp
  studentDetails: {
    name: string;
    rdcId: string;
    phone: string;
    email: string;
    guardianName?: string;
    className?: string;
    nai?: string; // Not Applicable Information / Other
  };
  courseDetails: {
    name: string;
    type: string;
    cycleName?: string;
    communityUrl?: string;
  };
  paymentDetails: {
    method: string;
    date: Timestamp;
    transactionId: string;
  };
  financialSummary: {
    totalFee: number;
    discount: number;
    netPayable: number;
    amountPaid: number;
    dueAmount: number;
  };
  generatedBy: string; // 'system' or UID of admin
  pdfUrl?: string;
  createdAt: any; // Using any to accommodate serverTimestamp and Timestamp
};

export type CallbackRequest = {
  id?: string;
  fullName: string;
  mobileNumber: string;
  class: string;
  goals: string;
  preferredCourses: string;
  state: string;
  requestedAt: Timestamp;
  status: 'Pending' | 'Contacted' | 'Completed';
  contactedAt?: Timestamp;
  contactedBy?: string; // Admin UID
  notes?: string;
};

export type SubCategory = {
    name: string;
};

export type SubCategoryGroup = {
    title: string;
    subCategories: SubCategory[];
};

export type StoreCategory = {
    id?: string;
    name: string;
    slug: string;
    order?: number;
    menuImageUrl?: string;
    menuImageAiHint?: string;
    subCategories?: SubCategory[];
    subCategoryGroups?: SubCategoryGroup[];
};

export type StoreHomepageBanner = {
    id: string;
    imageUrl: string;
    linkUrl?: string;
};

export type StoreHomepageProductSection = {
    title: string;
    category: string;
}

export type StoreHomepageHero = {
    title: string;
    subtitle: string;
    imageUrl: string;
}

export type StoreHomepageSection = {
    hero?: StoreHomepageHero;
    bannerCarousel?: StoreHomepageBanner[];
    productSections?: StoreHomepageProductSection[];
    featuredProductIds?: string[];
};

export type ReferralSettings = {
    pointsPerReferral: number;
    referredDiscountPercentage: number;
};
export type DoubtAttachment = {
  type: 'image' | 'file';
  url: string;
  fileName: string;
};

export type Doubt = {
  id?: string;
  sessionId: string;
  courseId: string;
  studentId: string;
  questionText?: string;
  attachments?: DoubtAttachment[];
  status: 'Open' | 'Answered' | 'Reopened' | 'Satisfied' | 'Closed';
  askedAt: Timestamp;
  lastUpdatedAt: Timestamp;
  assignedDoubtSolverId?: string;
  rating?: number; // 1-5
};

export type DoubtAnswer = {
  id?: string;
  doubtId: string;
  doubtSolverId: string; // This could be a solver OR the student for follow-ups
  answerText: string;
  attachments?: DoubtAttachment[];
  answeredAt: Timestamp;
};

export type DoubtSession = {
    id?: string;
    courseId: string;
    sessionName: string;
    assignedDoubtSolverIds: string[];
    createdAt: Timestamp;
};

    

    