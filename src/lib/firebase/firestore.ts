

import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  documentId,
  deleteDoc,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { Course, Instructor, Organization, User, HomepageConfig, PromoCode, SupportTicket, BlogPost, Notification, PlatformSettings, Enrollment, Announcement, Prebooking, Branch, Batch, AttendanceRecord, Question, Payout, ReportedContent, Invoice, CallbackRequest } from '../types';

// Generic function to fetch a collection
async function getCollection<T>(collectionName: string): Promise<T[]> {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
}

// Generic function to fetch a document by ID
export async function getDocument<T>(collectionName: string, id: string): Promise<T | null> {
  if (!id) return null;
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
}

// Question Bank
export const getQuestionBank = () => getCollection<Question>('question_bank');
export const addQuestionToBank = (question: Omit<Question, 'id'>) => addDoc(collection(db, 'question_bank'), question);
export const updateQuestionInBank = (id: string, question: Partial<Question>) => updateDoc(doc(db, 'question_bank', id), question);
export const deleteQuestionFromBank = (id: string) => deleteDoc(doc(db, 'question_bank', id));

// Courses
export const getCourses = async (filters: {
  category?: string;
  subCategory?: string;
  provider?: string;
  status?: Course['status'];
} = {}): Promise<Course[]> => {
  const { category, subCategory, provider, status } = filters;
  const coursesRef = collection(db, 'courses');
  const constraints = [];

  if (status) {
    constraints.push(where("status", "==", status));
  }
  if (category) {
    constraints.push(where("category", "==", category));
  }
  if (subCategory) {
    constraints.push(where("subCategory", "==", subCategory));
  }
  if (provider) {
    constraints.push(where("organizationId", "==", provider));
  }

  const q = constraints.length > 0 ? query(coursesRef, ...constraints) : query(coursesRef);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
};
export const getCourse = (id: string) => getDocument<Course>('courses', id);
export const getCoursesByIds = async (ids: string[]): Promise<Course[]> => {
  if (!ids || ids.length === 0) return [];
  const coursesRef = collection(db, 'courses');
  const q = query(coursesRef, where(documentId(), 'in', ids));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
}
export const addCourse = (course: Partial<Course>) => addDoc(collection(db, 'courses'), course);
export const updateCourse = (id: string, course: Partial<Course>) => updateDoc(doc(db, 'courses', id), course);
export const deleteCourse = (id: string) => deleteDoc(doc(db, 'courses', id));

// Instructors
export const getInstructors = () => getCollection<Instructor>('instructors');
export const getInstructor = (id: string) => getDocument<Instructor>('instructors', id);
export const getInstructorBySlug = async (slug: string): Promise<Instructor | null> => {
    const q = query(collection(db, "instructors"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Instructor;
}
export const getInstructorByUid = async (uid: string): Promise<Instructor | null> => {
    if (!uid) return null;
    const q = query(collection(db, "instructors"), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Instructor;
}
export const getInstructorsByIds = async (ids: string[]): Promise<Instructor[]> => {
    if (!ids || ids.length === 0) return [];
    const instructorsRef = collection(db, 'instructors');
    const q = query(instructorsRef, where(documentId(), 'in', ids));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Instructor));
}
export const addInstructor = (instructor: Partial<Instructor>) => addDoc(collection(db, 'instructors'), instructor);
export const updateInstructor = (id: string, instructor: Partial<Instructor>) => updateDoc(doc(db, 'instructors', id), instructor);
export const deleteInstructor = (id: string) => deleteDoc(doc(db, 'instructors', id));


// Users
export const getUsers = () => getCollection<User>('users');
export const getUser = (id: string) => getDocument<User>('users', id);
export const getUserByClassRoll = async (classRoll: string): Promise<User | null> => {
    const q = query(collection(db, 'users'), where('classRoll', '==', classRoll));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
}
export const getUserByRegistrationNumber = async (registrationNumber: string): Promise<User | null> => {
    const q = query(collection(db, 'users'), where('registrationNumber', '==', registrationNumber));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
}
export const getUserByOfflineRoll = async (rollNo: string): Promise<User | null> => {
    const q = query(collection(db, 'users'), where('offlineRollNo', '==', rollNo));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
};
export const getUserByEmailAndRole = async (email: string, role: User['role']): Promise<User | null> => {
    const q = query(collection(db, 'users'), where('email', '==', email), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
}
export const getUsersByBatchId = async (batchId: string): Promise<User[]> => {
    const q = query(collection(db, "users"), where("assignedBatchId", "==", batchId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}
export const addUser = (user: Partial<User>) => addDoc(collection(db, 'users'), user);
export const updateUser = (id: string, user: Partial<User>) => updateDoc(doc(db, 'users', id), user);
export const deleteUser = (id: string) => deleteDoc(doc(db, 'users', id));


// Organizations
export const getOrganizations = () => getCollection<Organization>('organizations');
export const getOrganization = (id: string) => getDocument<Organization>('organizations', id);
export const addOrganization = (org: Partial<Organization>) => addDoc(collection(db, 'organizations'), org);
export const getPartnerBySubdomain = async (subdomain: string): Promise<Organization | null> => {
    const q = query(collection(db, "organizations"), where("subdomain", "==", subdomain), where("status", "==", "approved"));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        return { id: docData.id, ...docData.data() } as Organization;
    }
    return null;
}
export const getOrganizationsByIds = async (ids: string[]): Promise<Organization[]> => {
  if (!ids || ids.length === 0) return [];
  const orgsRef = collection(db, 'organizations');
  const q = query(orgsRef, where(documentId(), 'in', ids));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organization));
}
export const updateOrganization = (id: string, organization: Partial<Organization>) => updateDoc(doc(db, 'organizations', id), organization);
export const deleteOrganization = (id: string) => deleteDoc(doc(db, 'organizations', id));
export const getOrganizationByUserId = async (userId: string): Promise<Organization | null> => {
    const q = query(collection(db, 'organizations'), where('contactUserId', '==', userId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Organization;
}


// Support Tickets
export const getSupportTickets = () => getCollection<SupportTicket>('support_tickets');
export const getSupportTicketsByUserId = async (userId: string): Promise<SupportTicket[]> => {
    const q = query(collection(db, "support_tickets"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket));
};
export const getSupportTicket = (id: string) => getDocument<SupportTicket>('support_tickets', id);
export const addSupportTicket = (ticket: Partial<SupportTicket>) => addDoc(collection(db, 'support_tickets'), ticket);
export const updateSupportTicket = (id: string, ticket: Partial<SupportTicket>) => updateDoc(doc(db, 'support_tickets', id), ticket);

// Categories
export const getCategories = async (): Promise<string[]> => {
    const courses = await getCollection<Course>('courses');
    const categories = new Set(courses.map(c => c.category));
    return Array.from(categories);
}

// Invoices
export const getInvoiceByEnrollmentId = async (enrollmentId: string): Promise<Invoice | null> => {
    if (!enrollmentId) return null;
    const q = query(collection(db, "invoices"), where("enrollmentId", "==", enrollmentId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Invoice;
};

// Enrollments
export const getEnrollments = () => getCollection<Enrollment>('enrollments');
export const getEnrollmentsByUserId = async (userId: string): Promise<Enrollment[]> => {
    const q = query(collection(db, "enrollments"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
}

export const getEnrollmentByInvoiceId = async (invoiceId: string): Promise<Enrollment | null> => {
    if (!invoiceId) return null;
    const q = query(collection(db, "enrollments"), where("invoiceId", "==", invoiceId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        // Fallback for older data structure where enrollmentId is the access code
        return getDocument<Enrollment>('enrollments', invoiceId);
    }
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Enrollment;
};

export const getEnrollmentsByCourseId = async (courseId: string): Promise<Enrollment[]> => {
    const q = query(collection(db, "enrollments"), where("courseId", "==", courseId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
}

export const addEnrollment = (enrollment: Omit<Enrollment, 'id'>) => addDoc(collection(db, 'enrollments'), enrollment);
export const updateEnrollment = (id: string, data: Partial<Enrollment>) => updateDoc(doc(db, 'enrollments', id), data);


// Pre-bookings
export const addPrebooking = (prebooking: Omit<Prebooking, 'id'>) => addDoc(collection(db, 'prebookings'), prebooking);

export const getPrebookingForUser = async (courseId: string, userId: string): Promise<Prebooking | null> => {
    const q = query(collection(db, 'prebookings'), where('courseId', '==', courseId), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Prebooking;
};

export const getPrebookingsByCourseId = async (courseId: string): Promise<Prebooking[]> => {
    const q = query(collection(db, "prebookings"), where("courseId", "==", courseId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prebooking));
}

export const getPrebookingsByUserId = async (userId: string): Promise<Prebooking[]> => {
    const q = query(collection(db, "prebookings"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prebooking));
}

// Payouts
export const getPayoutsByUserId = async (userId: string): Promise<Payout[]> => {
    const q = query(collection(db, "payouts"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payout));
}

// Branches (for Offline Hub)
export const getBranches = () => getCollection<Branch>('branches');
export const getBranch = (id: string) => getDocument<Branch>('branches', id);
export const addBranch = (branch: Branch) => addDoc(collection(db, 'branches'), branch);
export const updateBranch = (id: string, branch: Partial<Branch>) => updateDoc(doc(db, 'branches', id), branch);
export const deleteBranch = (id: string) => deleteDoc(doc(db, 'branches', id));

// Batches (for Offline Hub)
export const getBatches = () => getCollection<Batch>('batches');
export const getBatch = (id: string) => getDocument<Batch>('batches', id);
export const addBatch = (batch: Partial<Batch>) => addDoc(collection(db, 'batches'), batch);
export const updateBatch = (id: string, batch: Partial<Batch>) => updateDoc(doc(db, 'batches', id), batch);
export const deleteBatch = (id: string) => deleteDoc(doc(db, 'batches', id));

// Attendance
export const getAttendanceRecords = () => getCollection<AttendanceRecord>('attendance');
export const updateAttendanceRecord = (id: string, data: Partial<AttendanceRecord>) => updateDoc(doc(db, 'attendance', id), data);

export const getAttendanceRecordForStudentByDate = async (studentId: string, date: string): Promise<AttendanceRecord | null> => {
    const q = query(collection(db, 'attendance'), where('studentId', '==', studentId), where('date', '==', date));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as AttendanceRecord;
};

export const saveAttendanceRecords = async (records: ({ create: Omit<AttendanceRecord, 'id'> } | { id: string, update: Partial<AttendanceRecord> })[]) => {
    const batch = writeBatch(db);
    const attendanceCol = collection(db, 'attendance');
    
    records.forEach(record => {
        if ('create' in record) {
            const docRef = doc(attendanceCol);
            batch.set(docRef, record.create);
        } else {
            const docRef = doc(attendanceCol, record.id);
            batch.update(docRef, record.update);
        }
    });

    await batch.commit();
};
export const getAttendanceForStudentInCourse = async (studentId: string, courseId: string): Promise<AttendanceRecord[]> => {
    const q = query(collection(db, 'attendance'), where("studentId", "==", studentId), where("courseId", "==", courseId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
}
export const getAttendanceForStudent = async (studentId: string): Promise<AttendanceRecord[]> => {
    const q = query(collection(db, 'attendance'), where("studentId", "==", studentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
}

// Reported Content
export const addReportedContent = (report: Omit<ReportedContent, 'id'>) => addDoc(collection(db, 'reported_content'), report);
export const getPendingReports = async (): Promise<ReportedContent[]> => {
    const q = query(collection(db, 'reported_content'), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReportedContent));
};
export const updateReportedContent = (id: string, data: Partial<ReportedContent>) => updateDoc(doc(db, 'reported_content', id), data);

// Callback Requests
export const getCallbackRequests = () => getCollection<CallbackRequest>('callbacks');
export const updateCallbackRequest = (id: string, data: Partial<CallbackRequest>) => updateDoc(doc(db, 'callbacks', id), data);


// Homepage Configuration
export const getBlogPosts = () => getCollection<BlogPost>('blog_posts');
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    const q = query(collection(db, "blog_posts"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        return { id: docData.id, ...docData.data() } as BlogPost;
    }
    return null;
}
export const addBlogPost = (post: Partial<BlogPost>) => addDoc(collection(db, 'blog_posts'), post);
export const updateBlogPost = (id: string, post: Partial<BlogPost>) => updateDoc(doc(db, 'blog_posts', id), post);
export const deleteBlogPost = (id: string) => deleteDoc(doc(db, 'blog_posts', id));

const defaultPlatformSettings: PlatformSettings = {
    Student: { signupEnabled: true, loginEnabled: true },
    Teacher: { signupEnabled: true, loginEnabled: true },
    Guardian: { signupEnabled: true, loginEnabled: true },
    Admin: { signupEnabled: true, loginEnabled: true },
    Seller: { signupEnabled: true, loginEnabled: true },
    Affiliate: { signupEnabled: true, loginEnabled: true },
    Moderator: { signupEnabled: true, loginEnabled: true },
};

const defaultHomepageConfig: Omit<HomepageConfig, 'id'> = {
  logoUrl: "",
  welcomeSection: {
    display: true,
    title: { bn: "RDC শপ", en: "RDC SHOP" },
    description: { 
      bn: "আপনার RDC ওয়েব অ্যাপে 'Request a callback' ফিচারটি যুক্ত করা হবে, যা সম্ভাব্য শিক্ষার্থীদের কাছ থেকে যোগাযোগের তথ্য এবং তাদের আগ্রহের বিষয় সংগ্রহ করবে, যাতে আপনার টিম তাদের সাথে যোগাযোগ করতে পারে।",
      en: "The 'Request a callback' feature will be added to your RDC web app, which will collect contact information and topics of interest from potential students, so that your team can communicate with them."
    }
  },
  heroBanners: [
    { id: 1, href: "/courses/1", imageUrl: "https://placehold.co/800x450.png", alt: "HSC 25 Batch", dataAiHint: "students classroom" },
    { id: 2, href: "/courses/2", imageUrl: "https://placehold.co/800x450.png", alt: "Medical Admission", dataAiHint: "doctor medical" },
    { id: 3, href: "/courses/3", imageUrl: "https://placehold.co/800x450.png", alt: "IELTS Course", dataAiHint: "travel language" },
  ],
  heroCarousel: {
    autoplay: true,
    autoplayDelay: 5000,
  },
  strugglingStudentSection: {
    display: true,
    title: { bn: "পড়াশোনায় পিছিয়ে পড়ছো?", en: "Struggling in Studies?" },
    subtitle: { bn: "এসো, তোমার সমস্যার সমাধান করি। ✨", en: "Aaiye apki Samasya ka, Samadan krte hai ✨" },
    imageUrl: "https://cdni.iconscout.com/illustration/premium/thumb/man-confused-about-mobile-happenings-illustration-download-in-svg-png-gif-file-formats--error-warning-alert-exclamation-state-pack-people-illustrations-1784671.png?f=webp",
    buttonText: { bn: "আমরা কিভাবে সাহায্য করি দেখুন", en: "See How We Help" },
  },
  categoriesSection: {
    display: true,
    title: { bn: "ক্যাটাগরি", en: "Categories" },
    categories: [
      { id: 1, title: 'MOTION GRAPHIC', imageUrl: 'https://placehold.co/400x500.png', linkUrl: '/courses?category=Motion+Graphic', dataAiHint: 'motion graphic' },
      { id: 2, title: 'ADVERTISEMENT', imageUrl: 'https://placehold.co/400x500.png', linkUrl: '/courses?category=Advertisement', dataAiHint: 'advertisement can' },
      { id: 3, title: 'UI DESIGN', imageUrl: 'https://placehold.co/400x500.png', linkUrl: '/courses?category=UI+Design', dataAiHint: 'ui design' },
      { id: 4, title: 'LOGO DESIGN', imageUrl: 'https://placehold.co/400x500.png', linkUrl: '/courses?category=Logo+Design', dataAiHint: 'logo design' },
      { id: 5, title: 'DIGITAL ART', imageUrl: 'https://placehold.co/400x500.png', linkUrl: '/courses?category=Digital+Art', dataAiHint: 'digital art' },
      { id: 6, title: 'WEB DESIGN', imageUrl: 'https://placehold.co/400x500.png', linkUrl: '/courses?category=Web+Design', dataAiHint: 'web design' },
    ]
  },
  journeySection: {
    display: true,
    title: { bn: "আপনার শেখার যাত্রা শুরু করুন", en: "Start Your Learning Journey" },
    subtitle: { bn: "আমাদের লাইভ কোর্সগুলোতে জয়েন করে আপনার একাডেমিক ও স্কিল ডেভেলপমেন্টের পথে এগিয়ে যান।", en: "Join our live courses to advance your academic and skill development path." },
    courseTitle: { bn: "লাইভ কোর্সসমূহ", en: "Live Courses" },
  },
  liveCoursesIds: ["1", "3", "4"],
  teachersSection: {
    display: true,
    title: { bn: "আমাদের অভিজ্ঞ শিক্ষকগণ", en: "Our Experienced Teachers" },
    subtitle: { bn: "দেশের সেরা শিক্ষকদের সাথে আপনার প্রস্তুতিকে নিয়ে যান এক নতুন মাত্রায়।", en: "Take your preparation to a new level with the best teachers in the country." },
    buttonText: { bn: "সকল শিক্ষক", en: "All Teachers" },
    instructorIds: ["ins-ja", "ins-fa", "ins-ms", "ins-nh", "ins-si"],
    scrollSpeed: 25,
  },
  videoSection: {
    display: true,
    title: { bn: "কেন হাজারো শিক্ষার্থী RDC-কে বেছে নিয়েছে?", en: "Why have thousands of students chosen RDC?" },
    description: { bn: "আমাদের শিক্ষার্থীদের সফলতার গল্পগুলো দেখুন এবং জানুন কীভাবে RDC তাদের স্বপ্ন পূরণে সহায়তা করেছে।", en: "Watch the success stories of our students and learn how RDC has helped them achieve their dreams." },
    buttonText: { bn: "সকল কোর্স দেখুন", en: "View All Courses" },
    videos: [
      { title: "Student Testimonial", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      { title: "Platform Feature", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    ],
  },
  sscHscSection: {
    display: true,
    badge: { bn: "SSC ও HSC", en: "SSC & HSC" },
    title: { bn: "SSC ও HSC প্রস্তুতি", en: "SSC & HSC Preparation" },
  },
  sscHscCourseIds: ["1", "4"],
  masterclassSection: {
    display: true,
    title: { bn: "ফ্রি মাস্টারক্লাস", en: "Free Masterclasses" },
    buttonText: { bn: "সকল মাস্টারক্লাস দেখুন", en: "View All Masterclasses" },
  },
  masterClassesIds: [],
  admissionSection: {
    display: true,
    badge: { bn: "ভর্তি পরীক্ষা", en: "Admission Test" },
    title: { bn: "অ্যাডমিশন টেস্ট প্রস্তুতি", en: "Admission Test Preparation" },
    buttonText: { bn: "সকল অ্যাডমিশন কোর্স", en: "All Admission Courses" },
  },
  admissionCoursesIds: ["2"],
  jobPrepSection: {
    display: true,
    badge: { bn: "জব প্রস্তুতি", en: "Job Prep" },
    title: { bn: "চাকরির প্রস্তুতি", en: "Job Preparation" },
    buttonText: { bn: "সকল জব কোর্স", en: "All Job Courses" },
  },
  jobCoursesIds: [],
  whyChooseUs: {
    display: true,
    title: { bn: "কেন আমরাই সেরা?", en: "Why We Are The Best?" },
    description: {bn: "আমাদের সকল শিক্ষক স্ব স্ব ক্ষেত্রে অভিজ্ঞ এবং সেরা শিক্ষা প্রদানে প্রতিজ্ঞাবদ্ধ।", en: "All our instructors are experienced in their respective fields and committed to providing the best education."},
    features: [
      { id: 'feat1', iconUrl: "https://placehold.co/48x48.png", dataAiHint: 'book icon', title: { bn: "সেরা প্রশিক্ষক", en: "Best Instructors" } },
      { id: 'feat2', iconUrl: "https://placehold.co/48x48.png", dataAiHint: 'video icon', title: { bn: "ইন্টারেক্টিভ লার্নিং", en: "Interactive Learning" } },
      { id: 'feat3', iconUrl: "https://placehold.co/48x48.png", dataAiHint: 'wallet icon', title: { bn: "স্বল্প খরচে অনেক কিছু", en: "Lots for a Low Cost" } },
      { id: 'feat4', iconUrl: "https://placehold.co/48x48.png", dataAiHint: 'book icon', title: { bn: "সাপোর্ট সিস্টেম", en: "Support System" } },
    ],
    testimonials: [
        {id: 'test1', quote: {bn: "অনলাইনে RDC'র লেসনগুলো পড়েই আমি গোল্ডেন A+ আর স্কলারশিপ পেয়েছি", en: "I got Golden A+ and a scholarship just by studying RDC's lessons online"}, studentName: "মেহজাবিন রহমান", college: "বি.এ.এফ. শাহীন কলেজ", imageUrl: "https://placehold.co/120x120.png", dataAiHint: "student happy"}
    ]
  },
  freeClassesSection: {
    display: true,
    title: { bn: "আমাদের সকল ফ্রি ক্লাসসমূহ", en: "All Our Free Classes" },
    subtitle: { bn: "আমাদের ক্লাসের কোয়ালিটি সম্পর্কে ধারণা পেতে সম্পূর্ণ ফ্রিতে দেখে নিতে পারো কিছু ক্লাস", en: "Watch some classes completely free to get an idea about the quality of our classes" },
    classes: [
      { id: "fc1", title: "অধ্যায় ১: বিজ্ঞান ও প্রযুক্তি। সম্পূর্ণ অধ্যায়", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", subject: "Science", instructor: "Hridita Chakraborty", grade: "ক্লাস ৯" },
      { id: "fc2", title: "তথ্যঝুঁকি মোকাবেলায় মানববন্ধন | সম্পূর্ণ অধ্যায়", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", subject: "ICT", instructor: "Samin Zahan Sieyam", grade: "ক্লাস ১০" },
      { id: "fc3", title: "অধ্যায় ৩: গতি। সম্পূর্ণ অধ্যায়", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", subject: "Science", instructor: "Hridita Chakraborty", grade: "ক্লাস ৯" },
      { id: "fc4", title: "৩য় অধ্যায়: অর্থ বুঝি বাক্য লিখি। সম্পূর্ণ অধ্যায়", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", subject: "Bangla", instructor: "Tashmiya Hasan", grade: "ক্লাস ৬" },
      { id: "fc5", title: "Meeting an Overseas Friend, My Books, Arshi's letter", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", subject: "English", instructor: "MD Omor Faruk", grade: "ক্লাস ৯" },
      { id: "fc6", title: "দৈর্ঘ্য মাপি। সম্পূর্ণ অধ্যায়", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", subject: "Math", instructor: "Shahreen Tabassum Nova", grade: "ক্লাস ৬" },
    ]
  },
  aboutUsSection: {
    display: true,
    title: { bn: "আমাদের সম্পর্কে", en: "About Us" },
    subtitle: { bn: "আমাদের পেছনের কারিগরদের সাথে পরিচিত হন।", en: "Meet the team behind our platform." },
    teamMembers: [
      {
        id: "member1",
        name: "Md. Mufassal E khuda",
        title: "Co-Founder & CCO",
        imageUrl: "https://placehold.co/400x500.png",
        dataAiHint: "founder person",
        socialLinks: [
          { platform: 'facebook', url: '#' },
          { platform: 'external', url: '#' }
        ]
      },
      {
        id: "member2",
        name: "Fairoz Khaled Ohi",
        title: "Founder & CEO",
        imageUrl: "https://scontent.fdac138-1.fna.fbcdn.net/v/t39.30808-6/487076226_1889375535134421_6130098570179736415_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=thUcU8J7ROoQ7kNvwHydEuI&_nc_oc=AdkINDyf5C7UuRWfgDQyNEz_HhUDKaJST56WCdAl3zayEO_cE2al7Ql8zuHafoE7Ffo&_nc_zt=23&_nc_ht=scontent.fdac138-1.fna&_nc_gid=sqmiXKg937KPft7-jqGDjw&oh=00_AfS2Es-aZsQKwAQAGcDuKtslTnT_8yswe3d9swIMUJkyUw&oe=6872D6A4",
        dataAiHint: "founder person",
        socialLinks: [
          { platform: 'facebook', url: 'https://www.facebook.com/dipanjanswapna2' }
        ]
      }
    ]
  },
  offlineHubSection: {
    display: true,
    programsTitle: { bn: 'আমাদের প্রোগ্রামসমূহ', en: 'Our Programs' },
    centersTitle: { bn: 'আমাদের অফলাইন হাবসমূহ', en: 'Our Offline Hubs' },
    contactSection: {
      display: true,
      title: { bn: "কোনো প্রশ্ন আছে?", en: "Have a Question?" },
      subtitle: { bn: "যেকোনো সময় আমাদের স্টুডেন্ট অ্যাডভাইজরের সাথে কথা বলুন।", en: "Talk to our student advisors anytime." },
      callButtonText: { bn: "কল করুন 01641035736", en: "Call 01641035736" },
      callButtonNumber: "01641035736",
      whatsappButtonText: { bn: "WhatsApp-এ মেসেজ দিন", en: "Message on WhatsApp" },
      whatsappNumber: "8801641035736",
    },
  },
  collaborations: {
    display: true,
    title: { bn: "আমাদের সহযোগিতায়", en: "In Collaboration With" },
    organizationIds: [],
  },
  partnersSection: {
    display: true,
    title: { bn: "আমাদের পার্টনার", en: "Our Partners" },
    scrollSpeed: 25,
    partners: [
      { id: 1, name: "Prangon", logoUrl: "https://placehold.co/140x60.png", href: "#", dataAiHint: "company logo" },
      { id: 2, name: "BD IT", logoUrl: "https://placehold.co/140x60.png", href: "#", dataAiHint: "company logo" },
      { id: 3, name: "MediShark", logoUrl: "https://placehold.co/140x60.png", href: "#", dataAiHint: "company logo" },
      { id: 4, name: "Skill Shark", logoUrl: "https://placehold.co/140x60.png", href: "#", dataAiHint: "company logo" },
      { id: 5, name: "Spark", logoUrl: "https://placehold.co/140x60.png", href: "#", dataAiHint: "company logo" },
    ],
  },
  socialMediaSection: {
    display: true,
    title: { bn: "আমাদের সাথে কানেক্টেড থাকুন", en: "Stay Connected With Us" },
    description: { bn: "আমাদের সোশ্যাল মিডিয়া চ্যানেলগুলোতে যোগ দিন এবং লেটেস্ট আপডেট ও রিসোর্স পান।", en: "Join our social media channels to get the latest updates and resources." },
    channels: [
      {
        id: 1,
        platform: 'YouTube',
        name: { bn: "RDC ইউটিউব চ্যানেল", en: "RDC YouTube Channel" },
        handle: "@reddotclassroom",
        stat1_value: "1.5M",
        stat1_label: { bn: "সাবস্ক্রাইবার", en: "Subscribers" },
        stat2_value: "500+",
        stat2_label: { bn: "ভিডিও", en: "Videos" },
        description: { bn: "শিক্ষামূলক ভিডিও, টিউটোরিয়াল এবং লাইভ ক্লাসের জন্য আমাদের ইউটিউব চ্যানেল সাবস্ক্রাইব করুন।", en: "Subscribe to our YouTube channel for educational videos, tutorials, and live classes." },
        ctaText: { bn: "সাবস্ক্রাইব করুন", en: "Subscribe" },
        ctaUrl: "#",
      },
      {
        id: 2,
        platform: 'Facebook Page',
        name: { bn: "RDC ফেসবুক পেজ", en: "RDC Facebook Page" },
        handle: "@rdc.bd",
        stat1_value: "2M",
        stat1_label: { bn: "ফলোয়ার", en: "Followers" },
        stat2_value: "1.8M",
        stat2_label: { bn: "লাইক", en: "Likes" },
        description: { bn: "কোর্স আপডেট, ঘোষণা এবং কমিউনিটি ইভেন্টের জন্য আমাদের ফেসবুক পেজে লাইক দিন।", en: "Like our Facebook page for course updates, announcements, and community events." },
        ctaText: { bn: "পেজ ভিজিট করুন", en: "Visit Page" },
        ctaUrl: "#",
      },
    ],
  },
  notesBanner: {
    display: true,
    title: { bn: "ফ্রি নোটস এবং লেকচার শিট", en: "Free Notes and Lecture Sheets" },
    description: { bn: "আমাদের ওয়েবসাইটে হাজারো ফ্রি নোটস এবং লেকচার শিট ডাউনলোড করে আপনার প্রস্তুতিকে আরও শক্তিশালী করুন।", en: "Strengthen your preparation by downloading thousands of free notes and lecture sheets from our website." },
    buttonText: { bn: "ডাউনলোড করুন", en: "Download Now" },
  },
  statsSection: {
    display: true,
    title: { bn: "লক্ষাধিক শিক্ষার্থীর পথচলা", en: "Journey of Millions of Students" },
    stats: [
      { value: "900K+", label: { bn: "নিবন্ধিত শিক্ষার্থী", en: "Registered Students" } },
      { value: "120+", label: { bn: "কোর্স সংখ্যা", en: "Number of Courses" } },
      { value: "50+", label: { bn: "দক্ষ প্রশিক্ষক", en: "Expert Instructors" } },
    ],
  },
  appPromo: {
    display: true,
    title: { bn: "RDC অ্যাপ ডাউনলোড করুন", en: "Download the RDC App" },
    description: { bn: "যেকোনো সময়, যেকোনো স্থানে আপনার পড়াশোনা চালিয়ে যান। লাইভ ক্লাস, কুইজ এবং আরও অনেক কিছু এখন আপনার হাতের মুঠোয়।", en: "Continue your studies anytime, anywhere. Live classes, quizzes, and much more are now at your fingertips." },
    googlePlayUrl: "#",
    appStoreUrl: "#",
  },
  floatingWhatsApp: {
      display: true,
      number: "8801700000000"
  },
  rdcShopBanner: {
    display: true,
    imageUrl: "https://placehold.co/1200x200.png",
    dataAiHint: "students sale offer"
  },
  requestCallbackSection: {
    display: true,
    imageUrl: "https://i.imgur.com/GZ0gQfN.png",
    dataAiHint: "student illustration"
  },
  platformSettings: defaultPlatformSettings,
  topperPageSection: {
      display: true,
      title: "How we help you become a Topper from a Struggler?",
      mainImageUrl: "https://placehold.co/600x600.png",
      mainImageDataAiHint: "student success graph",
      cards: [
          {id: "card1", iconUrl: "https://placehold.co/48x48.png", dataAiHint: "teacher student", title: "Personalized Mentorship", description: "Our expert mentors provide one-on-one guidance to address your specific needs and challenges."},
          {id: "card2", iconUrl: "https://placehold.co/48x48.png", dataAiHint: "book test", title: "Targeted Study Materials", description: "We offer curated notes and practice tests designed to strengthen your weak areas."},
          {id: "card3", iconUrl: "https://placehold.co/48x48.png", dataAiHint: "community support", title: "24/7 Doubt Clearing", description: "Get your doubts resolved instantly anytime with our dedicated support team and AI."},
          {id: "card4", iconUrl: "https://placehold.co/48x48.png", dataAiHint: "progress chart", title: "Performance Tracking", description: "Monitor your progress with detailed analytics and customized feedback to stay on track."}
      ]
  },
  offlineHubHeroCarousel: {
      display: true,
      slides: [
          { id: 1, imageUrl: 'https://placehold.co/1200x343.png', dataAiHint: 'students classroom', title: 'IELTS MASTER', subtitle: 'IELTS MASTERCLASS & MOCK TEST', price: '৳1500', originalPrice: '৳3000', enrollHref: '#' },
          { id: 2, imageUrl: 'https://placehold.co/1200x343.png', dataAiHint: 'presentation screen', title: 'ADMISSION', subtitle: 'NURSING & MEDICAL ADMISSION', price: '৳2500', originalPrice: '৳4000', enrollHref: '#' },
      ]
  }
};


// Function to get the homepage configuration
export const getHomepageConfig = async (): Promise<HomepageConfig> => {
    const docRef = doc(db, 'single_documents', 'homepage_config');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        // Merge with defaults to ensure all fields are present
        const mergedSettings = { ...defaultPlatformSettings, ...(data.platformSettings || {}) };
        return { id: docSnap.id, ...defaultHomepageConfig, ...data, platformSettings: mergedSettings } as HomepageConfig;
    } else {
        // If the document doesn't exist, create it with default values
        await setDoc(docRef, defaultHomepageConfig);
        return { id: docRef.id, ...defaultHomepageConfig } as HomepageConfig;
    }
}

export const updateHomepageConfig = async (config: Partial<HomepageConfig>) => {
    const docRef = doc(db, 'single_documents', 'homepage_config');
    return updateDoc(docRef, config);
}


// Promo Codes
export const getPromoCodes = () => getCollection<PromoCode>('promo_codes');
export const getPromoCodeByCode = async (code: string): Promise<PromoCode | null> => {
    const q = query(collection(db, 'promo_codes'), where('code', '==', code));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as PromoCode;
};
export const getPromoCodeForUserAndCourse = async (userId: string, courseId: string): Promise<PromoCode | null> => {
    if (!userId) return null;
    const q = query(collection(db, 'promo_codes'), 
        where('restrictedToUserId', '==', userId), 
        where('applicableCourseIds', 'array-contains', courseId),
        where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    // Assuming one unique promo per user-course pair
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as PromoCode;
}
export const addPromoCode = (code: Partial<PromoCode>) => addDoc(collection(db, 'promo_codes'), code);
export const updatePromoCode = (id: string, code: Partial<PromoCode>) => updateDoc(doc(db, 'promo_codes', id), code);
export const deletePromoCode = (id: string) => deleteDoc(doc(db, 'promo_codes', id));

// Notifications
export const addNotification = (notification: Omit<Notification, 'id'>) => addDoc(collection(db, 'notifications'), notification);
export const getNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
    const q = query(collection(db, "notifications"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
}
export const markAllNotificationsAsRead = async (userId: string) => {
    const q = query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
    });
    await batch.commit();
}
