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
    sellerId?: string;
    stock?: number;
    isPublished?: boolean;
    ratings?: number;
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
  processedBy?: string;
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
  options?: { id: string; text: string; isCorrect?: boolean; }[];
  correctAnswer?: string;
  blanks?: string[];
  matchingPairs?: { id: string; prompt: string; match: string; }[];
};

export type Notice = {
  id?: string;
  title: string;
  content: string;
  publishedAt: any;
  authorId: string;
  authorRole: string;
  isPublished: boolean;
  createdAt: any;
  updatedAt: any;
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
  reactions?: { likes?: number; loves?: number; helpfuls?: number; };
};

export type SyllabusModule = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Review = {
  id: string;
  user: { userId: string; name: string; avatarUrl: string; dataAiHint: string; };
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
  hero?: { title: string; subtitle: string; imageUrl: string; dataAiHint?: string; };
  contactEmail?: string;
  description?: string;
  contactUserId?: string;
};

export type Instructor = {
  id?: string;
  name: string;
  title: string;
  avatarUrl: string;
  dataAiHint: string;
  slug: string;
  status: 'Approved' | 'Pending Approval' | 'Rejected';
  bio: string;
  socials?: { linkedin?: string; facebook?: string; twitter?: string; }
  organizationId?: string;
  userId?: string;
  youtubeClasses?: { id: string; title: string; youtubeUrl: string; }[];
}

export type QuizTemplate = {
  id: string;
  title: string;
  topic: string;
  questions: { id: string; text: string; options: { id: string; text: string; }[]; correctAnswerId: string; }[];
};

export type QuizResult = {
  id: string;
  quizTemplateId: string;
  studentId: string;
  studentName: string;
  score: number;
  status: 'Completed';
  answers: Record<string, string>;
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
};

export type Exam = {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  topic: string;
  examType: string;
  totalMarks: number;
  examDate?: any;
  status: 'Pending' | 'Submitted' | 'Graded';
  marksObtained?: number;
  grade?: string;
  feedback?: string;
  answers?: Record<string, any>;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string;
};

export type Notification = {
  id?: string;
  userId: string;
  icon: 'Award' | 'Video' | 'Megaphone' | 'FileCheck2' | 'ThumbsUp' | 'Users' | 'HelpCircle' | 'MessageSquare' | 'Star';
  title: string;
  description: string;
  date: any;
  read: boolean;
  link?: string;
};

export type CourseInstructor = {
  name: string;
  title: string;
  avatarUrl: string;
  dataAiHint: string;
  slug: string;
}

export type CourseCycle = {
  id: string;
  title: string;
  price: string;
  description: string;
  order: number;
  moduleIds: string[];
  communityUrl?: string;
};

export type Course = {
  id?: string;
  title: string;
  description: string;
  type: 'Online' | 'Offline' | 'Hybrid' | 'Exam';
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
  prebookingTarget?: number;
  cycles?: CourseCycle[];
  status: 'Published' | 'Pending Approval' | 'Draft' | 'Rejected';
  rating?: number;
  reviews?: number;
  whatYouWillLearn?: string[];
  syllabus?: SyllabusModule[];
  features?: string[];
  classRoutine?: { day: string; subject: string; time: string; }[];
  faqs?: { question: string; answer: string; }[];
  reviewsData?: Review[];
  liveClasses?: LiveClass[];
  isArchived?: boolean;
  includedCourseIds?: string[];
  organizationId?: string;
  quizTemplates?: QuizTemplate[];
  quizResults?: QuizResult[];
  assignments?: Assignment[];
  assignmentTemplates?: { id: string; title: string; topic: string; deadline?: any; }[];
  exams?: Exam[];
  examTemplates?: { id: string; title: string; topic: string; examType: string; totalMarks: number; examDate?: any; questions?: Question[]; duration?: number; webcamProctoring?: boolean; allowBackNavigation?: boolean; }[];
  announcements?: Announcement[];
  communityUrl?: string;
  videoUrl?: string;
  showStudentCount?: boolean;
  doubtSolverIds?: string[];
  prebookingCount?: number;
};

export type UserSession = {
    id: string;
    deviceName: string;
    ipAddress: string;
    lastLoginAt: any;
    userAgent: string;
};

export type User = {
  id?: string;
  uid: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Student' | 'Teacher' | 'Guardian' | 'Admin' | 'Affiliate' | 'Moderator' | 'Seller' | 'Doubt Solver';
  status: 'Active' | 'Suspended' | 'Pending Approval';
  joined: any;
  className?: string;
  classRoll?: string;
  registrationNumber?: string;
  linkedStudentId?: string;
  linkedGuardianId?: string;
  wishlist?: string[];
  enrolledCourses?: string[];
  ratedCourses?: string[];
  reactedLessons?: string[];
  fathersName?: string;
  mothersName?: string;
  nidNumber?: string;
  mobileNumber?: string;
  guardianMobileNumber?: string;
  address?: string;
  referralPoints?: number;
  activeSessions?: UserSession[];
  lastLoginAt?: any;
  lastCounseledAt?: any;
  pomodoroSettings?: { work: number; shortBreak: number; longBreak: number; };
  plannerSettings?: { theme: string; whiteNoise: string; };
  assignedBranchId?: string;
  assignedBatchId?: string;
  offlineRollNo?: string;
  hasUsedReferral?: boolean;
  referredBy?: string;
  studyPlan?: any[];
};

export type CategoryItem = {
    id: number;
    title: { bn: string; en: string };
    imageUrl: string;
    linkUrl: string;
    dataAiHint: string;
};

export type TeamMember = {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  dataAiHint: string;
  socialLinks: { platform: 'facebook' | 'linkedin' | 'twitter' | 'external'; url: string; }[];
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

export type SocialChannel = {
  id: number;
  platform: 'YouTube' | 'Facebook Page' | 'Facebook Group';
  name: { bn: string; en: string };
  handle: string;
  stat1_value: string;
  stat1_label: { bn: string; en: string };
  stat2_value: string;
  stat2_label: { bn: string; en: string };
  description: { bn: string; en: string };
  ctaText: { bn: string; en: string };
  ctaUrl: string;
};

export type StoreHomepageHero = {
    title: string;
    subtitle: string;
    imageUrl: string;
}

export type StoreHomepageBanner = {
    id: string;
    imageUrl: string;
    linkUrl?: string;
};

export type StoreHomepageProductSection = {
    title: string;
    category: string;
}

export type StoreHomepageSection = {
    hero?: StoreHomepageHero;
    bannerCarousel?: StoreHomepageBanner[];
    productSections?: StoreHomepageProductSection[];
    featuredProductIds?: string[];
    bestsellerProductId?: string;
};

export type HomepageConfig = {
  id?: string;
  logoUrl: string;
  welcomeSection: {
    display: boolean;
    title: { bn: string; en: string };
    description: { bn: string; en: string };
  };
  heroBanners: { id: number; href: string; imageUrl: string; alt: string; dataAiHint: string; }[];
  heroCarousel: { autoplay: boolean; autoplayDelay: number; };
  strugglingStudentSection: {
    display: boolean;
    title: { bn: string; en: string };
    subtitle: { bn: string; en: string };
    imageUrl: string;
    buttonText: { bn: string; en: string };
  };
  categoriesSection: {
    display: boolean;
    title: { bn: string; en: string };
    categories: CategoryItem[];
  };
  journeySection: {
    display: boolean;
    title: { bn: string; en: string };
    subtitle: { bn: string; en: string };
    courseTitle: { bn: string; en: string };
  };
  liveCoursesIds: string[];
  teachersSection: {
    display: boolean;
    title: { bn: string; en: string };
    subtitle: { bn: string; en: string };
    buttonText: { bn: string; en: string };
    instructorIds: string[];
    scrollSpeed?: number;
  };
  videoSection: {
    display: boolean;
    title: { bn: string; en: string };
    description: { bn: string; en: string };
    buttonText: { bn: string; en: string };
    videos: { title: string; videoUrl: string; }[];
  };
  sscHscSection: {
    display: boolean;
    badge: { bn: string; en: string };
    title: { bn: string; en: string };
  };
  sscHscCourseIds: string[];
  masterclassSection: {
    display: boolean;
    title: { bn: string; en: string };
    buttonText: { bn: string; en: string };
  };
  masterClassesIds: string[];
  admissionSection: {
    display: boolean;
    badge: { bn: string; en: string };
    title: { bn: string; en: string };
    buttonText: { bn: string; en: string };
  };
  admissionCoursesIds: string[];
  jobPrepSection: {
    display: boolean;
    badge: { bn: string; en: string };
    title: { bn: string; en: string };
    buttonText: { bn: string; en: string };
  };
  jobCoursesIds: string[];
  whyChooseUs: {
    display: boolean;
    title: { bn: string; en: string };
    description: { bn: string; en: string };
    features: { id: string; iconUrl: string; dataAiHint: string; title: { bn: string; en: string }; }[];
    testimonials: { id: string; quote: { bn: string; en: string }; studentName: string; college: string; imageUrl: string; dataAiHint: string; }[];
  };
  freeClassesSection: {
    display: boolean;
    title: { bn: string; en: string };
    subtitle: { bn: string; en: string };
    classes: { id: string; title: string; youtubeUrl: string; subject: string; instructor: string; grade: string; }[];
  };
  aboutUsSection: {
    display: boolean;
    title: { bn: string; en: string };
    subtitle: { bn: string; en: string };
    teamMembers: TeamMember[];
  };
  offlineHubHeroCarousel?: {
    display: boolean;
    slides: OfflineHubHeroSlide[];
  };
  offlineHubSection: {
    display: boolean;
    heroTitle: { bn: string; en: string };
    heroSubtitle: { bn: string; en: string };
    exploreProgramsText: { bn: string; en: string };
    findCenterText: { bn: string; en: string };
    programsTitle: { bn: string; en: string };
    centersTitle: { bn: string; en: string };
    centersSubtitle: { bn: string; en: string };
    contactSection: { display: boolean; title: { bn: string; en: string }; subtitle: { bn: string; en: string }; callButtonText: { bn: string; en: string }; callButtonNumber: string; whatsappButtonText: { bn: string; en: string }; whatsappNumber: string; };
    heroImageUrl?: string;
    heroImageDataAiHint?: string;
  };
  collaborations: {
    display: boolean;
    title: { bn: string; en: string };
    organizationIds: string[];
  };
  partnersSection: {
    display: boolean;
    title: { bn: string; en: string };
    scrollSpeed?: number;
    partners: { id: number; name: string; logoUrl: string; href: string; dataAiHint: string; }[];
  };
  socialMediaSection: {
    display: boolean;
    title: { bn: string; en: string };
    description: { bn: string; en: string };
    channels: SocialChannel[];
  };
  notesBanner: {
    display: boolean;
    title: { bn: string; en: string };
    description: { bn: string; en: string };
    buttonText: { bn: string; en: string };
  };
  statsSection?: {
    display: boolean;
    title: { bn: string; en: string };
    stats: { label: { bn: string; en: string }; value: number; }[];
  };
  appPromo: {
    display: boolean;
    title: { bn: string; en: string };
    description: { bn: string; en: string };
    googlePlayUrl: string;
    appStoreUrl: string;
    googlePlayImageUrl: string;
    appStoreImageUrl: string;
    promoImageUrl: string;
    promoImageDataAiHint: string;
  };
  requestCallbackSection?: {
    display: boolean;
    imageUrl: string;
    dataAiHint: string;
  };
  floatingWhatsApp: {
      display: boolean;
      number: string;
  };
  rdcShopBanner?: {
    display: boolean;
    imageUrl: string;
    dataAiHint: string;
  };
  storeSettings?: {
    deliveryCharge: number;
    freeDeliveryThreshold: number;
  };
  storeHomepageSection?: StoreHomepageSection;
  platformSettings: { [key in User['role'] | 'DoubtSolver']: { signupEnabled: boolean; loginEnabled: boolean; } };
  referralSettings?: { pointsPerReferral: number; referredDiscountPercentage: number; };
  topperPageSection?: { display: boolean; title: string; mainImageUrl: string; mainImageDataAiHint: string; cards: { id: string; iconUrl: string; dataAiHint: string; title: string; description: string; }[]; };
};

export type Branch = {
    id?: string;
    name: string;
    address: string;
    contactPhone: string;
    contactEmail: string;
    branchCode?: string;
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
  date: string;
  status: 'Present' | 'Absent' | 'Late';
  recordedBy: string;
  callStatus?: 'Called';
};

export type ReportedContent = {
  id?: string;
  contentType: 'review';
  contentId: string;
  courseId: string;
  courseTitle: string;
  reporterId: string;
  reportedUserId: string;
  contentSnapshot: string;
  status: 'pending' | 'resolved';
  createdAt: Timestamp;
};

export type Invoice = {
  id?: string;
  enrollmentId: string;
  userId: string;
  courseId: string;
  invoiceNumber: string;
  status: 'VALID' | 'CANCELLED';
  invoiceDate: any;
  studentDetails: { name: string; rdcId: string; phone: string; email: string; className?: string; nai?: string; };
  courseDetails: { name: string; type: string; cycleName?: string; communityUrl?: string; };
  paymentDetails: { method: string; date: Timestamp; transactionId: string; };
  financialSummary: { totalFee: number; discount: number; netPayable: number; amountPaid: number; dueAmount: number; };
  generatedBy: string;
  createdAt: any;
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
  notes?: string;
};

export type StoreCategory = {
    id?: string;
    name: string;
    slug: string;
    order?: number;
    menuImageUrl?: string;
    menuImageAiHint?: string;
    subCategoryGroups?: { title: string; subCategories: { name: string; }[]; }[];
};

export type Referral = {
  id?: string;
  referrerId: string;
  referredUserId: string;
  referredUserName: string;
  courseId: string;
  courseName: string;
  rewardedPoints: number;
  discountGiven: number;
  date: Timestamp;
  status: 'Awarded' | 'Pending' | 'Cancelled';
};

export type Doubt = {
  id?: string;
  courseId: string;
  studentId: string;
  questionText?: string;
  attachments?: { type: string; url: string; fileName: string; }[];
  status: string;
  askedAt: any;
  lastUpdatedAt: any;
  assignedDoubtSolverId?: string;
  rating?: number;
};

export type DoubtAnswer = {
  id?: string;
  doubtId: string;
  doubtSolverId: string;
  answerText: string;
  answeredAt: any;
};

export type DoubtSession = {
    id?: string;
    courseId: string;
    sessionName: string;
    assignedDoubtSolverIds: string[];
    createdAt: any;
};

export type Folder = { id?: string; userId: string; name: string; };
export type List = { id?: string; folderId?: string; userId: string; name: string; };
export type PlannerTask = { id?: string; userId: string; listId?: string; title: string; description?: string; date: string; time?: string; status: 'todo' | 'in_progress' | 'completed' | 'cancelled'; type: string; estimatedPomo?: number; actualPomo?: number; timeSpentSeconds?: number; completedAt?: any; googleCalendarEventId?: string | null; };
export type Goal = { id?: string; userId: string; title: string; description?: string; type: string; progress: number; status: string; targetDate?: any; };
