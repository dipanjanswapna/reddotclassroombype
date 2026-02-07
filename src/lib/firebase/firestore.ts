import { getDbInstance } from './config';
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
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { Course, Instructor, Organization, User, HomepageConfig, PromoCode, SupportTicket, BlogPost, Notification, PlatformSettings, Enrollment, Prebooking, Branch, Batch, AttendanceRecord, Question, Payout, ReportedContent, Invoice, CallbackRequest, Notice, Product, Order, StoreCategory, Referral, Reward, RedemptionRequest, Doubt, DoubtAnswer, DoubtSession, Folder, List, PlannerTask, Goal } from '../types';
import { safeToDate } from '../utils';

// Generic function to fetch a collection
async function getCollection<T>(collectionName: string): Promise<T[]> {
  const db = getDbInstance();
  if (!db) return [];
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
}

// Generic function to add a document to a collection
export async function addDocument<T extends object>(collectionName: string, data: T) {
  const db = getDbInstance();
  if (!db) throw new Error("Firestore is not initialized.");
  return await addDoc(collection(db, collectionName), data);
}

// Generic function to update a document
export async function updateDocument<T extends object>(collectionName: string, id: string, data: Partial<T>) {
  const db = getDbInstance();
  if (!db) throw new Error("Firestore is not initialized.");
  const docRef = doc(db, collectionName, id);
  return await updateDoc(docRef, data);
}

// Generic function to delete a document
export async function deleteDocument(collectionName: string, id: string) {
  const db = getDbInstance();
  if (!db) throw new Error("Firestore is not initialized.");
  const docRef = doc(db, collectionName, id);
  return await deleteDoc(docRef);
}

// Generic function to fetch a document by ID
export async function getDocument<T>(collectionName: string, id: string): Promise<T | null> {
  if (!id) return null;
  const db = getDbInstance();
  if (!db) return null;
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
}

// Rewards
export const getRewards = () => getCollection<Reward>('rewards');
export const getReward = (id: string) => getDocument<Reward>('rewards', id);
export const addReward = (reward: Omit<Reward, 'id'>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return addDoc(collection(db, 'rewards'), reward);
}
export const updateReward = (id: string, reward: Partial<Reward>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'rewards', id), reward);
}
export const deleteReward = (id: string) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return deleteDoc(doc(db, 'rewards', id));
}

// Redeem Requests
export const getRedeemRequests = () => getCollection<RedemptionRequest>('redeem_requests');
export const getRedeemRequestsByUserId = async (userId: string): Promise<RedemptionRequest[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "redeem_requests"), where("userId", "==", userId), orderBy("requestedAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RedemptionRequest));
}
export const createRedeemRequest = (request: Omit<RedemptionRequest, 'id' | 'requestedAt'>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    const newRequest = { ...request, requestedAt: Timestamp.now() };
    return addDoc(collection(db, 'redeem_requests'), newRequest);
}
export const updateRedeemRequest = (id: string, data: Partial<RedemptionRequest>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'redeem_requests', id), data);
}

// Referrals
export const addReferral = (referral: Omit<Referral, 'id'>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return addDoc(collection(db, 'referrals'), referral);
}
export const getReferrals = () => getCollection<Referral>('referrals');
export const getReferralsByReferrerId = async (referrerId: string): Promise<Referral[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'referrals'), where("referrerId", "==", referrerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Referral);
}

// Store Categories
export const getStoreCategories = () => getCollection<StoreCategory>('store_categories');
export const addStoreCategory = (category: Omit<StoreCategory, 'id'>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return addDoc(collection(db, 'store_categories'), category);
}
export const updateStoreCategory = (id: string, category: Partial<StoreCategory>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'store_categories', id), category);
}
export const deleteStoreCategory = (id: string) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return deleteDoc(doc(db, 'store_categories', id));
}

// Products
export const getProducts = () => getCollection<Product>('products');
export const getProduct = (id: string) => getDocument<Product>('products', id);
export const addProduct = (product: Omit<Product, 'id'>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return addDoc(collection(db, 'products'), product);
}
export const updateProduct = (id: string, product: Partial<Product>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'products', id), product);
}
export const deleteProduct = (id: string) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return deleteDoc(doc(db, 'products', id));
}

// Orders
export const getOrders = () => getCollection<Order>('orders');
export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}
export const updateOrder = (id: string, data: Partial<Order>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'orders', id), data);
}

// Question Bank
export const getQuestionBank = () => getCollection<Question>('question_bank');
export const addQuestionToBank = (question: Omit<Question, 'id'>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return addDoc(collection(db, 'question_bank'), question);
}
export const updateQuestionInBank = (id: string, question: Partial<Question>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'question_bank', id), question);
}
export const deleteQuestionFromBank = (id: string) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return deleteDoc(doc(db, 'question_bank', id));
}

// Courses
export const getCourses = async (filters: {
  category?: string;
  subCategory?: string;
  provider?: string;
  instructorSlug?: string;
  status?: Course['status'];
  ids?: string[];
} = {}): Promise<Course[]> => {
  const { category, subCategory, provider, status, instructorSlug, ids } = filters;
  const db = getDbInstance();
  if (!db) return [];
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
  if (provider === 'rdc') {
      constraints.push(where("organizationId", "==", null));
  } else if (provider) {
    constraints.push(where("organizationId", "==", provider));
  }
  if (instructorSlug) {
      constraints.push(where("instructors", "array-contains", { slug: instructorSlug }))
  }
  if (ids && ids.length > 0) {
      constraints.push(where(documentId(), 'in', ids));
  }

  const q = constraints.length > 0 ? query(coursesRef, ...constraints) : query(coursesRef);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
};
export const getCourse = (id: string) => getDocument<Course>('courses', id);
export const getCoursesByIds = async (ids: string[]): Promise<Course[]> => {
  if (!ids || ids.length === 0) return [];
  const db = getDbInstance();
  if (!db) return [];
  const coursesRef = collection(db, 'courses');
  const q = query(coursesRef, where(documentId(), 'in', ids));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
}
export const addCourse = (course: Partial<Course>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return addDoc(collection(db, 'courses'), course);
}
export const updateCourse = (id: string, course: Partial<Course>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'courses', id), course);
}
export const deleteCourse = (id: string) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return deleteDoc(doc(db, 'courses', id));
}

// Instructors
export const getInstructors = () => getCollection<Instructor>('instructors');
export const getInstructor = (id: string) => getDocument<Instructor>('instructors', id);
export const getInstructorBySlug = async (slug: string): Promise<Instructor | null> => {
    const db = getDbInstance();
    if (!db) return null;
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
    const db = getDbInstance();
    if (!db) return null;
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
    const db = getDbInstance();
    if (!db) return [];
    const instructorsRef = collection(db, 'instructors');
    const q = query(instructorsRef, where(documentId(), 'in', ids));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Instructor));
}
export const addInstructor = (instructor: Partial<Instructor>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return addDoc(collection(db, 'instructors'), instructor);
}
export const updateInstructor = (id: string, instructor: Partial<Instructor>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'instructors', id), instructor);
}

// Users
export const getUsers = () => getCollection<User>('users');
export const getUser = (id: string) => getDocument<User>('users', id);
export const getUserByClassRoll = async (classRoll: string): Promise<User | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'users'), where('classRoll', '==', classRoll));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
}

export const findUserByRegistrationOrRoll = async (id: string): Promise<{userId: string | null}> => {
  const db = getDbInstance();
  if (!db) return { userId: null };

  let user: User | null = null;
  user = await getUserByRegistrationNumber(id);
  if (user) return { userId: user.id! };
  
  user = await getUserByClassRoll(id);
  if (user) return { userId: user.id! };
  
  user = await getUserByOfflineRoll(id);
  if (user) return { userId: user.id! };
  
  return { userId: null };
};

export const getUserByRegistrationNumber = async (regNo: string): Promise<User | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'users'), where('registrationNumber', '==', regNo));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
}

export const getUserByOfflineRoll = async (rollNo: string): Promise<User | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'users'), where('offlineRollNo', '==', rollNo));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
};
export const getUserByEmailAndRole = async (email: string, role: User['role']): Promise<User | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'users'), where('email', '==', email), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
}
export const getUsersByBatchId = async (batchId: string): Promise<User[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "users"), where("assignedBatchId", "==", batchId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}
export const addUser = (user: Partial<User>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    const { uid, ...userData } = user;
    if (!uid) throw new Error("User must have a UID to be added.");
    return setDoc(doc(db, 'users', uid), userData);
}
export const updateUser = (id: string, user: Partial<User>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'users', id), user);
}

// Organizations
export const getOrganizations = () => getCollection<Organization>('organizations');
export const getOrganization = (id: string) => getDocument<Organization>('organizations', id);
export const addOrganization = (org: Partial<Organization>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return addDoc(collection(db, 'organizations'), org);
}
export const getPartnerBySubdomain = async (subdomain: string): Promise<Organization | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, "organizations"), where("subdomain", "==", subdomain), where("status", "==", "approved"));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        return { id: docData.id, ...docData.data() } as Organization;
    }
    return null;
}
export const getOrganizationByUserId = async (userId: string): Promise<Organization | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'organizations'), where('contactUserId', '==', userId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Organization;
}

// Support Tickets
export const getSupportTickets = () => getCollection<SupportTicket>('support_tickets');
export const getSupportTicketsByUserId = async (userId: string): Promise<SupportTicket[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "support_tickets"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket));
};
export const getSupportTicket = (id: string) => getDocument<SupportTicket>('support_tickets', id);
export const updateSupportTicket = (id: string, ticket: Partial<SupportTicket>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'support_tickets', id), ticket);
}

// Categories
export const getCategories = async (): Promise<string[]> => {
    const courses = await getCollection<Course>('courses');
    const categories = new Set(courses.map(c => c.category).filter(Boolean));
    return Array.from(categories);
}

// Invoices
export const getInvoiceByEnrollmentId = async (enrollmentId: string): Promise<Invoice | null> => {
  if (!enrollmentId) return null;
  const db = getDbInstance();
  if (!db) return null;
  const q = query(collection(db, 'invoices'), where('enrollmentId', '==', enrollmentId));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Invoice;
  }
  return null;
};

// Enrollments
export const getEnrollments = () => getCollection<Enrollment>('enrollments');
export const getEnrollmentsByUserId = async (userId: string): Promise<Enrollment[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "enrollments"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
}
export const getEnrollmentsByCourseId = async (courseId: string): Promise<Enrollment[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "enrollments"), where("courseId", "==", courseId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
}
export const updateEnrollment = (id: string, data: Partial<Enrollment>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'enrollments', id), data);
}

// Pre-bookings
export const getPrebookingForUser = async (courseId: string, userId: string): Promise<Prebooking | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'prebookings'), where('courseId', '==', courseId), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return { id: doc.id, ...querySnapshot.docs[0].data() } as Prebooking;
};
export const getPrebookingsByUserId = async (userId: string): Promise<Prebooking[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "prebookings"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prebooking));
}

// Payouts
export const getPayoutsByUserId = async (userId: string): Promise<Payout[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "payouts"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payout));
}

// Branches & Batches
export const getBranches = () => getCollection<Branch>('branches');
export const getBranch = (id: string) => getDocument<Branch>('branches', id);
export const getBatches = () => getCollection<Batch>('batches');
export const getBatch = (id: string) => getDocument<Batch>('batches', id);

// Attendance
export const getAttendanceRecords = () => getCollection<AttendanceRecord>('attendance');
export const getAttendanceForStudentInCourse = async (studentId: string, courseId: string): Promise<AttendanceRecord[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'attendance'), where("studentId", "==", studentId), where("courseId", "==", courseId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
}
export const getAttendanceForStudent = async (studentId: string): Promise<AttendanceRecord[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'attendance'), where("studentId", "==", studentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
}

// Reported Content
export const getPendingReports = async (): Promise<ReportedContent[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'reported_content'), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReportedContent));
};

// Notices
export const getNotices = async (options?: { limit?: number; includeDrafts?: boolean }): Promise<Notice[]> => {
  const { limit: queryLimit, includeDrafts } = options || {};
  const db = getDbInstance();
  if (!db) return [];
  const q = query(collection(db, 'notices'), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  let allNotices = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice));
  if (!includeDrafts) allNotices = allNotices.filter(notice => notice.isPublished === true);
  if (queryLimit) allNotices = allNotices.slice(0, queryLimit);
  return allNotices;
};

const defaultPlatformSettings: PlatformSettings = {
    Student: { signupEnabled: true, loginEnabled: true },
    Teacher: { signupEnabled: true, loginEnabled: true },
    Guardian: { signupEnabled: true, loginEnabled: true },
    Admin: { signupEnabled: true, loginEnabled: true },
    Seller: { signupEnabled: true, loginEnabled: true },
    Affiliate: { signupEnabled: true, loginEnabled: true },
    Moderator: { signupEnabled: true, loginEnabled: true },
    DoubtSolver: { signupEnabled: true, loginEnabled: true },
};

const defaultHomepageConfig: Omit<HomepageConfig, 'id'> = {
  logoUrl: "",
  welcomeSection: {
    display: false,
    title: { bn: "", en: "" },
    description: { bn: "", en: "" }
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
    title: { bn: "Struggling in Studies?", en: "Struggling in Studies?" },
    subtitle: { bn: "Come, let us solve your problems. ✨", en: "Come, let us solve your problems. ✨" },
    imageUrl: "https://cdni.iconscout.com/illustration/premium/thumb/man-confused-about-mobile-happenings-illustration-download-in-svg-png-gif-file-formats--error-warning-alert-exclamation-state-pack-people-illustrations-1784671.png?f=webp",
    buttonText: { bn: "See How We Help", en: "See How We Help" },
  },
  categoriesSection: {
    display: true,
    title: { bn: "Categories", en: "Categories" },
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
    title: { bn: "Start Your Learning Journey", en: "Start Your Learning Journey" },
    subtitle: { bn: "Join our live courses to advance your academic and skill development path.", en: "Join our live courses to advance your academic and skill development path." },
    courseTitle: { bn: "Live Courses", en: "Live Courses" },
  },
  liveCoursesIds: ["1", "3", "4"],
  teachersSection: {
    display: true,
    title: { bn: "Our Experienced Teachers", en: "Our Experienced Teachers" },
    subtitle: { bn: "অভিজ্ঞ শিক্ষক দ্বারা আপনার প্রস্তুতিকে নিয়ে যান এক নতুন উচ্চতায়।", en: "Take your preparation to a new level with the best teachers in the country." },
    buttonText: { bn: "All Teachers", en: "All Teachers" },
    instructorIds: [],
    scrollSpeed: 25,
  },
  videoSection: {
    display: true,
    title: { bn: "Why have thousands of students chosen RDC?", en: "Why have thousands of students chosen RDC?" },
    description: { bn: "Watch the success stories of our students and learn how RDC has helped them achieve their dreams.", en: "Watch the success stories of our students and learn how RDC has helped them achieve their dreams." },
    buttonText: { bn: "View All Courses", en: "View All Courses" },
    videos: [
      { title: "Student Testimonial", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      { title: "Platform Feature", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    ],
  },
  sscHscSection: {
    display: true,
    badge: { bn: "SSC & HSC", en: "SSC & HSC" },
    title: { bn: "SSC & HSC Preparation", en: "SSC & HSC Preparation" },
  },
  sscHscCourseIds: ["1", "4"],
  masterclassSection: {
    display: true,
    title: { bn: "Free Masterclasses", en: "Free Masterclasses" },
    buttonText: { bn: "View All Masterclasses", en: "View All Masterclasses" },
  },
  masterClassesIds: [],
  admissionSection: {
    display: true,
    badge: { bn: "Admission Test", en: "Admission Test" },
    title: { bn: "Admission Test Preparation", en: "Admission Test Preparation" },
    buttonText: { bn: "All Admission Courses", en: "All Admission Courses" },
  },
  admissionCoursesIds: ["2"],
  jobPrepSection: {
    display: true,
    badge: { bn: "Job Prep", en: "Job Prep" },
    title: { bn: "Job Preparation", en: "Job Preparation" },
    buttonText: { bn: "All Job Courses", en: "All Job Courses" },
  },
  jobCoursesIds: [],
  whyChooseUs: {
    display: true,
    title: { bn: "Why Choose RED DOT CLASSROOM?", en: "Why Choose RED DOT CLASSROOM?" },
    description: {bn: "Our instructors are experienced in their respective fields and committed to providing the best education.", en: "Our instructors are experienced in their respective fields and committed to providing the best education."},
    features: [],
    testimonials: []
  },
  freeClassesSection: {
    display: true,
    title: { bn: "All Our Free Classes", en: "All Our Free Classes" },
    subtitle: { bn: "Watch some classes completely free to get an idea about our teaching quality.", en: "Watch some classes completely free to get an idea about our teaching quality." },
    classes: []
  },
  aboutUsSection: {
    display: true,
    title: { bn: "About Us", en: "About Us" },
    subtitle: { bn: "Meet the team behind our platform.", en: "Meet the team behind our platform." },
    teamMembers: []
  },
  offlineHubSection: {
    display: true,
    programsTitle: { bn: 'Our Programs', en: 'Our Programs' },
    centersTitle: { bn: 'Our Offline Hubs', en: 'Our Offline Hubs' },
    contactSection: {
      display: true,
      title: { bn: "Have a Question?", en: "Have a Question?" },
      subtitle: { bn: "Talk to our student advisors anytime.", en: "Talk to our student advisors anytime." },
      callButtonText: { bn: "Call 01641035736", en: "Call 01641035736" },
      callButtonNumber: "01641035736",
      whatsappButtonText: { bn: "Message on WhatsApp", en: "Message on WhatsApp" },
      whatsappNumber: "8801641035736",
    },
  },
  collaborations: {
    display: true,
    title: { bn: "In Collaboration With", en: "In Collaboration With" },
    organizationIds: [],
  },
  partnersSection: {
    display: true,
    title: { bn: "Our Partners", en: "Our Partners" },
    scrollSpeed: 25,
    partners: [],
  },
  socialMediaSection: {
    display: true,
    title: { bn: "Stay Connected With Us", en: "Stay Connected With Us" },
    description: { bn: "Join our social media channels to get the latest updates and resources.", en: "Join our social media channels to get the latest updates and resources." },
    channels: [],
  },
  notesBanner: {
    display: true,
    title: { bn: "Free Notes & Lecture Sheets", en: "Free Notes & Lecture Sheets" },
    description: { bn: "Strengthen your preparation by downloading thousands of free notes from our website.", en: "Strengthen your preparation by downloading thousands of free notes from our website." },
    buttonText: { bn: "Download Now", en: "Download Now" },
  },
  appPromo: {
    display: true,
    title: { bn: "Download RDC App", en: "Download the RDC App" },
    description: { bn: "Continue your studies anytime, anywhere. Live classes and quizzes now at your fingertips.", en: "Continue your studies anytime, anywhere. Live classes and quizzes now at your fingertips." },
    googlePlayUrl: "#",
    appStoreUrl: "#",
    googlePlayImageUrl: "https://placehold.co/180x60.png",
    appStoreImageUrl: "https://placehold.co/180x60.png",
    promoImageUrl: "https://i.imgur.com/uR1Y6o6.png",
    promoImageDataAiHint: "mobile app screenshot",
  },
  floatingWhatsApp: {
      display: true,
      number: "8801641035736"
  },
  rdcShopBanner: {
    display: true,
    imageUrl: "https://placehold.co/1200x250.png",
    dataAiHint: "store banner sale"
  },
  storeSettings: {
    deliveryCharge: 60,
    freeDeliveryThreshold: 2
  },
  storeHomepageSection: {
    bannerCarousel: []
  },
  requestCallbackSection: {
    display: true,
    imageUrl: "https://i.imgur.com/GZ0gQfN.png",
    dataAiHint: "student illustration",
  },
  platformSettings: defaultPlatformSettings,
  referralSettings: {
      pointsPerReferral: 10,
      referredDiscountPercentage: 10
  },
  topperPageSection: {
      display: true,
      title: "How we help you become a Topper from a Struggler?",
      mainImageUrl: "https://placehold.co/600x600.png",
      mainImageDataAiHint: "student success graph",
      cards: []
  },
  offlineHubHeroCarousel: {
    display: true,
    slides: []
  },
};

export const getHomepageConfig = async (): Promise<HomepageConfig> => {
    const db = getDbInstance();
    if (!db) return { id: 'default', ...defaultHomepageConfig };
    const docRef = doc(db, 'single_documents', 'homepage_config');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        const mergedSettings = { ...defaultPlatformSettings, ...(data.platformSettings || {}) };
        return { id: docSnap.id, ...defaultHomepageConfig, ...data, platformSettings: mergedSettings } as HomepageConfig;
    } else {
        await setDoc(docRef, defaultHomepageConfig);
        return { id: docRef.id, ...defaultHomepageConfig } as HomepageConfig;
    }
}

export const updateHomepageConfig = async (config: Partial<HomepageConfig>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    const docRef = doc(db, 'single_documents', 'homepage_config');
    return updateDoc(docRef, config);
}

export const markStudentAsCounseled = async (studentId: string) => {
    const db = getDbInstance();
    if (!db) return;
    const userRef = doc(db, 'users', studentId);
    return updateDoc(userRef, { lastCounseledAt: serverTimestamp() });
}

export const markAllNotificationsAsRead = async (userId: string) => {
    const db = getDbInstance();
    if (!db) return;
    const q = query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true });
    });
    return batch.commit();
}
