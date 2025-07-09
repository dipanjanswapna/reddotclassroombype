

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
import { Course, Instructor, Organization, User, HomepageConfig, PromoCode, SupportTicket, BlogPost, Notification, PlatformSettings, Enrollment, Announcement, Prebooking, Branch, Batch, AttendanceRecord, Question, Payout } from '../types';

// Generic function to fetch a collection
async function getCollection<T>(collectionName: string): Promise<T[]> {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
}

// Generic function to fetch a document by ID
async function getDocument<T>(collectionName: string, id: string): Promise<T | null> {
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

// Enrollments
export const getEnrollments = () => getCollection<Enrollment>('enrollments');
export const getEnrollmentsByUserId = async (userId: string): Promise<Enrollment[]> => {
    const q = query(collection(db, "enrollments"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
}

export const getEnrollmentsByCourseId = async (courseId: string): Promise<Enrollment[]> => {
    const q = query(collection(db, "enrollments"), where("courseId", "==", courseId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
}

export const addEnrollment = (enrollment: Omit<Enrollment, 'id'>) => addDoc(collection(db, 'enrollments'), enrollment);

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
      bn: "রেড ডট ক্লাসরুম (RDC শপ) ঢাকা, বাংলাদেশ ভিত্তিক একটি অনলাইন শিক্ষা কেন্দ্র, যা সারা দেশের শিক্ষার্থীদের উচ্চ-মানের শিক্ষামূলক সম্পদ প্রদানে বিশেষজ্ঞ। ২০১৮ সালে প্রতিষ্ঠিত, প্ল্যাটফর্মটি তার বিভিন্ন কোর্সের মাধ্যমে ৯০০,০০০ এরও বেশি শিক্ষার্থীর সক্রিয়ভাবে শেখার এবং তাদের দক্ষতা বিকাশের মাধ্যমে বাংলাদেশী শিক্ষার্থীদের মধ্যে দ্রুত জনপ্রিয়তা অর্জন করেছে।",
      en: "Red Dot Classroom (RDC Shop) is an online education center based in Dhaka, Bangladesh, specializing in providing high-quality educational resources to students across the country. Established in 2018, the platform has quickly gained popularity among Bangladeshi students, with over 900,000 students actively learning and developing their skills through its diverse range of courses." 
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
    imageUrl: "https://i.imgur.com/2A0F1gE.png",
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
      { id: 'feat1', iconUrl: "https://placehold.co/48x48.png", dataAiHint: 'icon book', title: { bn: "সেরা প্রশিক্ষক", en: "Best Instructors" } },
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
        imageUrl: "https://placehold.co/400x500.png",
        dataAiHint: "founder person",
        socialLinks: [
          { platform: 'facebook', url: '#' },
          { platform: 'external', url: '#' }
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
    partners: [],
  },
  socialMediaSection: {
    display: true,
    title: { bn: "আমাদের সাথে কানেক্টেড থাকুন", en: "Stay Connected With Us" },
    description: { bn: "সর্বশেষ আপডেট, কোর্স অফার এবং শিক্ষামূলক কন্টেন্টের জন্য আমাদের সোশ্যাল মিডিয়া চ্যানেলগুলোতে যোগ দিন।", en: "Join our social media channels for the latest updates, course offers, and educational content." },
    channels: [],
  },
  notesBanner: {
    display: true,
    title: { bn: "ফ্রি নোটস এবং লেকচার শিট", en: "Free Notes and Lecture Sheets" },
    description: { bn: "আপনার পরীক্ষার প্রস্তুতিকে আরও শক্তিশালী করতে ডাউনলোড করুন আমাদের精心ভাবে তৈরি করা নোটস ও লেকচার শিট।", en: "Download our meticulously prepared notes and lecture sheets to strengthen your exam preparation." },
    buttonText: { bn: "ডাউনলোড করুন", en: "Download Now" },
  },
  statsSection: {
    display: true,
    title: { bn: "লক্ষাধিক শিক্ষার্থীর পথচলা", en: "Journey of Millions of Students" },
    stats: [
      { value: "9+", label: { bn: "বছর", en: "Years" } },
      { value: "5M+", label: { bn: "শিক্ষার্থী", en: "Students" } },
      { value: "50+", label: { bn: "কোর্স", en: "Courses" } },
    ],
  },
  appPromo: {
    display: true,
    title: { bn: "ডাউনলোড করুন RDC অ্যাপ", en: "Download the RDC App" },
    description: { bn: "যেকোনো জায়গা থেকে যেকোনো সময় আপনার পড়াশোনা চালিয়ে যান আমাদের মোবাইল অ্যাপের মাধ্যমে। লাইভ ক্লাস, কুইজ এবং আরও অনেক কিছু এখন আপনার হাতের মুঠোয়।", en: "Continue your studies anytime, anywhere with our mobile app. Live classes, quizzes, and much more are now at your fingertips." },
    googlePlayUrl: "#",
    appStoreUrl: "#",
  },
  floatingWhatsApp: {
      display: true,
      number: '8801641035736'
  },
  rdcShopBanner: {
    display: true,
    imageUrl: "https://placehold.co/1600x400.png",
    dataAiHint: "shop banner sale",
  },
  platformSettings: defaultPlatformSettings,
  topperPageSection: {
    display: true,
    title: 'যেভাবে আমরা তোমাকে সাহায্য করি একজন টপার হতে',
    mainImageUrl: 'https://i.imgur.com/rCne6ZJ.png',
    mainImageDataAiHint: 'happy student celebrating',
    cards: [
      { id: 'card1', iconUrl: 'https://placehold.co/48x48.png', dataAiHint: 'icon book', title: 'লাইভ ক্লাস', description: 'প্রতিটি ক্লাস সরাসরি টিচারের সাথে করার সুযোগ।' },
      { id: 'card2', iconUrl: 'https://placehold.co/48x48.png', dataAiHint: 'icon exam', title: 'পরীক্ষা', description: 'নিয়মিত পরীক্ষা দিয়ে নিজের প্রস্তুতি যাচাই।' },
      { id: 'card3', iconUrl: 'https://placehold.co/48x48.png', dataAiHint: 'icon notes', title: 'লেকচার শিট', description: 'প্রতিটি ক্লাসের পর গুছানো লেকচার শিট।' },
      { id: 'card4', iconUrl: 'https://placehold.co/48x48.png', dataAiHint: 'icon support', title: 'সাপোর্ট', description: 'যেকোনো সমস্যায় ২৪/৭ টিচার সাপোর্ট।' },
    ],
  },
  offlineHubHeroCarousel: {
    display: true,
    slides: [
      {
        id: 1,
        imageUrl: "https://placehold.co/1200x343.png",
        dataAiHint: "students course banner",
        title: "CLASS 11th",
        subtitle: "प्रारंभ 2.0 COMMERCE",
        price: "₹3000/-",
        originalPrice: "₹3500/-",
        enrollHref: "/courses"
      }
    ]
  },
};


export const getHomepageConfig = async (): Promise<HomepageConfig> => {
    try {
        const configDoc = await getDoc(doc(db, 'singletons', 'homepage'));
        if (configDoc.exists()) {
            return { id: configDoc.id, ...configDoc.data() } as HomepageConfig;
        } else {
            console.log("No homepage config found, creating one with default values.");
            await setDoc(doc(db, 'singletons', 'homepage'), defaultHomepageConfig);
            return { id: 'homepage', ...defaultHomepageConfig };
        }
    } catch (error) {
        console.error("Error getting homepage config, returning default:", error);
        return { id: 'homepage', ...defaultHomepageConfig }; // Return default on error
    }
}

export const updateHomepageConfig = (config: Partial<HomepageConfig>) => {
    const configRef = doc(db, 'singletons', 'homepage');
    return updateDoc(configRef, config);
};


// Promo Codes
export const getPromoCodes = () => getCollection<PromoCode>('promo_codes');
export const getPromoCode = (id: string) => getDocument<PromoCode>('promo_codes', id);
export const getPromoCodeByCode = async (code: string): Promise<PromoCode | null> => {
    const q = query(collection(db, 'promo_codes'), where('code', '==', code));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as PromoCode;
}
export const getPromoCodeForUserAndCourse = async (userId: string, courseId: string): Promise<PromoCode | null> => {
    const q = query(collection(db, 'promo_codes'), 
        where('restrictedToUserId', '==', userId), 
        where('applicableCourseIds', 'array-contains', courseId),
        where('usageCount', '==', 0),
        where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as PromoCode;
}
export const addPromoCode = (promo: Partial<PromoCode>) => addDoc(collection(db, 'promo_codes'), promo);
export const updatePromoCode = (id: string, promo: Partial<PromoCode>) => updateDoc(doc(db, 'promo_codes', id), promo);
export const deletePromoCode = (id: string) => deleteDoc(doc(db, 'promo_codes', id));

// Blog Posts
export const getBlogPosts = () => getCollection<BlogPost>('blog_posts');
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    const q = query(collection(db, 'blog_posts'), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as BlogPost;
}
export const addBlogPost = (post: Omit<BlogPost, 'id'>) => addDoc(collection(db, 'blog_posts'), post);
export const updateBlogPost = (id: string, post: Partial<BlogPost>) => updateDoc(doc(db, 'blog_posts', id), post);
export const deleteBlogPost = (id: string) => deleteDoc(doc(db, 'blog_posts', id));

// Notifications
export const addNotification = (notification: Omit<Notification, 'id'>) => addDoc(collection(db, 'notifications'), notification);

export const getNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
    const q = query(collection(db, "notifications"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
};

export const markAllNotificationsAsRead = async (userId: string) => {
    const q = query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false));
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    querySnapshot.forEach(doc => {
        batch.update(doc.ref, { read: true });
    });
    
    await batch.commit();
}
