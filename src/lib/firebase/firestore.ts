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
  arrayUnion,
} from 'firebase/firestore';
import { Course, Instructor, Organization, User, HomepageConfig, PromoCode, SupportTicket, BlogPost, Notification, Enrollment, Announcement, Prebooking, Branch, Batch, AttendanceRecord, Question, Payout, ReportedContent, Invoice, CallbackRequest, Notice, Product, Order, StoreCategory, Referral, Reward, RedemptionRequest, Doubt, DoubtAnswer, DoubtSession, Folder, List, PlannerTask, Goal } from '../types';
import { safeToDate } from '../utils';

// Generic function to fetch a collection
async function getCollection<T>(collectionName: string): Promise<T[]> {
  const db = getDbInstance();
  if (!db) return [];
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
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

// Generic add
export async function addDocument<T extends object>(collectionName: string, data: T) {
  const db = getDbInstance();
  if (!db) throw new Error("Firestore is not initialized.");
  return await addDoc(collection(db, collectionName), data);
}

// Generic update
export async function updateDocument<T extends object>(collectionName: string, id: string, data: Partial<T>) {
  const db = getDbInstance();
  if (!db) throw new Error("Firestore is not initialized.");
  const docRef = doc(db, collectionName, id);
  return await updateDoc(docRef, data);
}

// Generic delete
export async function deleteDocument(collectionName: string, id: string) {
  const db = getDbInstance();
  if (!db) throw new Error("Firestore is not initialized.");
  const docRef = doc(db, collectionName, id);
  return await deleteDoc(docRef);
}

// Rewards & Redemptions
export const getRewards = () => getCollection<Reward>('rewards');
export const getReward = (id: string) => getDocument<Reward>('rewards', id);
export const addReward = (reward: Omit<Reward, 'id'>) => addDocument('rewards', reward);
export const updateReward = (id: string, reward: Partial<Reward>) => updateDocument('rewards', id, reward);
export const deleteReward = (id: string) => deleteDocument('rewards', id);

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

// Referrals
export const getReferrals = () => getCollection<Referral>('referrals');
export const getReferralsByReferrerId = async (referrerId: string): Promise<Referral[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'referrals'), where("referrerId", "==", referrerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Referral);
}

// Store
export const getStoreCategories = () => getCollection<StoreCategory>('store_categories');
export const addStoreCategory = (category: Omit<StoreCategory, 'id'>) => addDocument('store_categories', category);
export const updateStoreCategory = (id: string, category: Partial<StoreCategory>) => updateDocument('store_categories', id, category);
export const deleteStoreCategory = (id: string) => deleteDocument('store_categories', id);

export const getProducts = () => getCollection<Product>('products');
export const getProduct = (id: string) => getDocument<Product>('products', id);
export const addProduct = (product: Omit<Product, 'id'>) => addDocument('products', product);
export const updateProduct = (id: string, product: Partial<Product>) => updateDocument('products', id, product);
export const deleteProduct = (id: string) => deleteDocument('products', id);

export const getOrders = () => getCollection<Order>('orders');
export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

// Question Bank
export const getQuestionBank = () => getCollection<Question>('question_bank');
export const addQuestionToBank = (question: Omit<Question, 'id'>) => addDocument('question_bank', question);
export const updateQuestionInBank = (id: string, question: Partial<Question>) => updateDocument('question_bank', id, question);
export const deleteQuestionFromBank = (id: string) => deleteDocument('question_bank', id);

// Courses
export const getCourses = async (filters: { status?: string; category?: string; subCategory?: string; provider?: string; instructorSlug?: string; ids?: string[]; } = {}): Promise<Course[]> => {
  const db = getDbInstance();
  if (!db) return [];
  const coursesRef = collection(db, 'courses');
  const constraints = [];

  if (filters.status) constraints.push(where("status", "==", filters.status));
  if (filters.category) constraints.push(where("category", "==", filters.category));
  if (filters.subCategory) constraints.push(where("subCategory", "==", filters.subCategory));
  if (filters.provider === 'rdc') constraints.push(where("organizationId", "==", null));
  else if (filters.provider) constraints.push(where("organizationId", "==", filters.provider));
  if (filters.instructorSlug) constraints.push(where("instructors", "array-contains", { slug: filters.instructorSlug }));
  if (filters.ids && filters.ids.length > 0) constraints.push(where(documentId(), 'in', filters.ids));

  const q = constraints.length > 0 ? query(coursesRef, ...constraints) : query(coursesRef);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
};
export const getCourse = (id: string) => getDocument<Course>('courses', id);
export const getCoursesByIds = (ids: string[]) => getCourses({ ids });
export const updateCourse = (id: string, course: Partial<Course>) => updateDocument('courses', id, course);
export const deleteCourse = (id: string) => deleteDocument('courses', id);

// Instructors
export const getInstructors = () => getCollection<Instructor>('instructors');
export const getInstructor = (id: string) => getDocument<Instructor>('instructors', id);
export const getInstructorBySlug = async (slug: string): Promise<Instructor | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, "instructors"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Instructor;
}
export const getInstructorByUid = async (uid: string): Promise<Instructor | null> => {
    const db = getDbInstance();
    if (!db || !uid) return null;
    const q = query(collection(db, "instructors"), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Instructor;
}
export const updateInstructor = (id: string, instructor: Partial<Instructor>) => updateDocument('instructors', id, instructor);
export const addInstructor = (instructor: Partial<Instructor>) => addDocument('instructors', instructor);

// Users
export const getUsers = () => getCollection<User>('users');
export const getUser = (id: string) => getDocument<User>('users', id);
export const getUserByClassRoll = async (roll: string): Promise<User | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'users'), where('classRoll', '==', roll));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as User;
}
export const getUserByRegistrationNumber = async (reg: string): Promise<User | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'users'), where('registrationNumber', '==', reg));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as User;
}
export const getUserByEmailAndRole = async (email: string, role: string): Promise<User | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'users'), where('email', '==', email), where('role', '==', role));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as User;
}
export const updateUser = (id: string, user: Partial<User>) => updateDocument('users', id, user);

// Organizations
export const getOrganizations = () => getCollection<Organization>('organizations');
export const getOrganization = (id: string) => getDocument<Organization>('organizations', id);
export const getPartnerBySubdomain = async (sub: string): Promise<Organization | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, "organizations"), where("subdomain", "==", sub), where("status", "==", "approved"));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as Organization;
}
export const getOrganizationByUserId = async (uid: string): Promise<Organization | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'organizations'), where('contactUserId', '==', uid));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as Organization;
}

// Notifications
export const getNotificationsByUserId = async (uid: string): Promise<Notification[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "notifications"), where("userId", "==", uid), orderBy("date", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
}
export const markAllNotificationsAsRead = async (uid: string) => {
    const db = getDbInstance();
    if (!db) return;
    const q = query(collection(db, "notifications"), where("userId", "==", uid), where("read", "==", false));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.update(d.ref, { read: true }));
    await batch.commit();
}

// Announcements & Notices
export const markAllAnnouncementsAsRead = async (uid: string, courseId: string) => Promise.resolve();
export const getNotices = async (options?: { limit?: number; includeDrafts?: boolean }): Promise<Notice[]> => {
  const db = getDbInstance();
  if (!db) return [];
  const q = query(collection(db, 'notices'), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  let list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice));
  if (!options?.includeDrafts) list = list.filter(n => n.isPublished);
  if (options?.limit) list = list.slice(0, options.limit);
  return list;
};

// Doubts
export const getDoubts = () => getCollection<Doubt>('doubts');
export const getDoubt = (id: string) => getDocument<Doubt>('doubts', id);
export const getDoubtsByCourseAndStudent = async (cid: string, sid: string) => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'doubts'), where("courseId", "==", cid), where("studentId", "==", sid));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doubt));
}
export const getDoubtAnswers = async (did: string) => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'doubt_answers'), where("doubtId", "==", did));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DoubtAnswer));
}

// Planner
export const getFoldersForUser = async (uid: string) => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'folders'), where('userId', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Folder));
};
export const getListsForUser = async (uid: string) => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'lists'), where('userId', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as List));
};
export const getTasksForUser = async (uid: string) => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'tasks'), where('userId', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlannerTask));
};
export const getGoalsForUser = async (uid: string) => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'goals'), where('userId', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
};

// Config
const defaultPlatformSettings = {
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
  welcomeSection: { display: true, title: { bn: "RED DOT CLASSROOM (RDC)", en: "RED DOT CLASSROOM (RDC)" }, description: { bn: "আমাদের প্ল্যাটফর্মে পড়াশোনাকে আধুনিক এবং সহজ করার জন্য আমরা সচেষ্ট।", en: "Empowering students across Bangladesh with high-quality educational resources." } },
  heroBanners: [{ id: 1, href: "/courses/", imageUrl: "https://picsum.photos/seed/1/1200/675", alt: "Latest Offer", dataAiHint: "students classroom" }],
  heroCarousel: { autoplay: true, autoplayDelay: 5000 },
  strugglingStudentSection: { display: true, title: { bn: "পড়াশোনায় পিছিয়ে পড়ছো?", en: "Struggling in Studies?" }, subtitle: { bn: "এসো তোমার সমস্যার সমাধান করি ✨", en: "Let's solve your problems together ✨" }, imageUrl: "https://cdni.iconscout.com/illustration/premium/thumb/man-confused-about-mobile-happenings-illustration-download-in-svg-png-gif-file-formats--error-warning-alert-exclamation-state-pack-people-illustrations-1784671.png?f=webp", buttonText: { bn: "আমরা কীভাবে সাহায্য করি", en: "See How We Help" } },
  categoriesSection: { display: true, title: { bn: "ক্যাটাগরি", en: "Categories" }, categories: [{ id: 1, title: { bn: 'এইচএসসি', en: 'HSC' }, imageUrl: 'https://picsum.photos/seed/cat1/400/500', linkUrl: '/courses?category=HSC', dataAiHint: 'student book' }] },
  journeySection: { display: true, title: { bn: "আপনার যাত্রা শুরু করুন", en: "Start Your Journey" }, subtitle: { bn: "লাইভ কোর্সগুলোতে জয়েন করুন।", en: "Join our live courses." }, courseTitle: { bn: "লাইভ কোর্সসমূহ", en: "Live Courses" } },
  liveCoursesIds: [],
  teachersSection: { display: true, title: { bn: "আমাদের অভিজ্ঞ শিক্ষকগণ", en: "Our Mentors" }, subtitle: { bn: "সেরা শিক্ষকদের সাথে প্রস্তুতি নিন।", en: "Prepare with the best educators." }, buttonText: { bn: "সকল শিক্ষক", en: "All Teachers" }, instructorIds: [], scrollSpeed: 25 },
  videoSection: { display: true, title: { bn: "সফলতার গল্প", en: "Success Stories" }, description: { bn: "জানুন কীভাবে RDC সহায়তা করেছে।", en: "Learn how RDC has helped students." }, buttonText: { bn: "সব কোর্স দেখুন", en: "All Courses" }, videos: [] },
  sscHscSection: { display: true, badge: { bn: "প্রস্তুতি", en: "Prep" }, title: { bn: "SSC ও HSC", en: "SSC & HSC" } },
  sscHscCourseIds: [],
  masterclassSection: { display: true, title: { bn: "ফ্রি মাস্টারক্লাস", en: "Free Masterclasses" }, buttonText: { bn: "সব মাস্টারক্লাস", en: "All Masterclasses" } },
  masterClassesIds: [],
  admissionSection: { display: true, badge: { bn: "ভর্তি", en: "Admission" }, title: { bn: "অ্যাডমিশন প্রস্তুতি", en: "Admission Prep" }, buttonText: { bn: "সব অ্যাডমিশন কোর্স", en: "All Admission" } },
  admissionCoursesIds: [],
  jobPrepSection: { display: true, badge: { bn: "ক্যারিয়ার", en: "Career" }, title: { bn: "চাকরির প্রস্তুতি", en: "Job Prep" }, buttonText: { bn: "সব জব কোর্স", en: "All Job Courses" } },
  jobCoursesIds: [],
  whyChooseUs: { display: true, title: { bn: "কেন আমরাই সেরা?", en: "Why Choose Us?" }, description: { bn: "সেরা শিক্ষা প্রদানে আমরা প্রতিজ্ঞাবদ্ধ।", en: "Committed to quality education." }, features: [], testimonials: [] },
  freeClassesSection: { display: true, title: { bn: "ফ্রি ক্লাস", en: "Free Classes" }, subtitle: { bn: "ফ্রিতে দেখে নিন", en: "Watch for free" }, classes: [] },
  aboutUsSection: { display: true, title: { bn: "আমাদের সম্পর্কে", en: "About Us" }, subtitle: { bn: "কারিগরি টিম", en: "The Team" }, teamMembers: [] },
  offlineHubSection: { display: true, heroTitle: { bn: 'অফলাইন হাব', en: 'Offline Hub' }, heroSubtitle: { bn: 'সরাসরি শিখুন।', en: 'Learn directly.' }, exploreProgramsText: { bn: 'প্রোগ্রাম দেখুন', en: 'Programs' }, findCenterText: { bn: 'সেন্টার খুঁজুন', en: 'Find Center' }, programsTitle: { bn: 'প্রোগ্রাম', en: 'Programs' }, centersTitle: { bn: 'অফলাইন সেন্টার', en: 'Centers' }, centersSubtitle: { bn: 'ভিজিট করুন।', en: 'Visit us.' }, contactSection: { display: true, title: { bn: "প্রশ্ন আছে?", en: "Questions?" }, subtitle: { bn: "কথা বলুন।", en: "Talk to us." }, callButtonText: { bn: "কল করুন", en: "Call" }, callButtonNumber: "01641035736", whatsappButtonText: { bn: "WhatsApp", en: "WhatsApp" }, whatsappNumber: "8801641035736" } },
  collaborations: { display: true, title: { bn: "সহযোগিতায়", en: "Collaborations" }, organizationIds: [] },
  partnersSection: { display: true, title: { bn: "পার্টনার", en: "Partners" }, scrollSpeed: 25, partners: [] },
  socialMediaSection: { display: true, title: { bn: "সোশ্যাল মিডিয়া", en: "Connect" }, description: { bn: "যুক্ত থাকুন।", en: "Stay connected." }, channels: [] },
  notesBanner: { display: true, title: { bn: "ফ্রি নোটস", en: "Free Notes" }, description: { bn: "ডাউনলোড করুন।", en: "Download." }, buttonText: { bn: "ডাউনলোড", en: "Download" } },
  appPromo: { display: true, title: { bn: "RDC অ্যাপ", en: "RDC App" }, description: { bn: "ফোনে পড়াশোনা।", en: "Learn on mobile." }, googlePlayUrl: "#", appStoreUrl: "#", googlePlayImageUrl: "https://placehold.co/180x60.png", appStoreImageUrl: "https://placehold.co/180x60.png", promoImageUrl: "https://picsum.photos/seed/app/400/800", promoImageDataAiHint: "mobile app" },
  floatingWhatsApp: { display: true, number: "8801641035736" },
  platformSettings: defaultPlatformSettings,
};

export const getHomepageConfig = async (): Promise<HomepageConfig> => {
    const db = getDbInstance();
    if (!db) return { id: 'default', ...defaultHomepageConfig } as HomepageConfig;
    const docRef = doc(db, 'single_documents', 'homepage_config');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return { id: docSnap.id, ...defaultHomepageConfig, ...data } as HomepageConfig;
    } else {
        await setDoc(docRef, defaultHomepageConfig);
        return { id: 'homepage_config', ...defaultHomepageConfig } as HomepageConfig;
    }
}

export const updateHomepageConfig = async (config: Partial<HomepageConfig>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    const docRef = doc(db, 'single_documents', 'homepage_config');
    return updateDoc(docRef, config);
}

// Extra helpers
export const getPromoCodes = () => getCollection<PromoCode>('promo_codes');
export const getEnrollmentsByUserId = async (uid: string) => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "enrollments"), where("userId", "==", uid));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
}
export const addNotification = (notif: Omit<Notification, 'id'>) => addDocument('notifications', notif);
export const getAttendanceRecords = () => getCollection<AttendanceRecord>('attendance');
export const getBatches = () => getCollection<Batch>('batches');
export const getBranch = (id: string) => getDocument<Branch>('branches', id);
export const getBatch = (id: string) => getDocument<Batch>('batches', id);
export const getBranches = () => getCollection<Branch>('branches');
export const getPendingReports = async () => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'reported_content'), where("status", "==", "pending"));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReportedContent));
}
export const getPayoutsByUserId = async (uid: string) => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'payouts'), where("userId", "==", uid));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payout));
}
export const getCallbackRequests = () => getCollection<CallbackRequest>('callbacks');
export const markStudentAsCounseled = async (id: string) => updateDocument('users', id, { lastCounseledAt: Timestamp.now() });
export const getPrebookingsByUserId = async (uid: string) => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'prebookings'), where("userId", "==", uid));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prebooking));
}
export const getPrebookingsByCourseId = async (cid: string) => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'prebookings'), where("courseId", "==", cid));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prebooking));
}
export const addPrebooking = (data: Omit<Prebooking, 'id'>) => addDocument('prebookings', data);
export const getPrebookingForUser = async (cid: string, uid: string) => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'prebookings'), where("courseId", "==", cid), where("userId", "==", uid));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as Prebooking;
}
export const getPromoCodeForUserAndCourse = async (uid: string, cid: string) => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'promo_codes'), where("restrictedToUserId", "==", uid), where("applicableCourseIds", "array-contains", cid), where("isActive", "==", true));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as PromoCode;
}
export const getPromoCodeByCode = async (code: string) => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'promo_codes'), where("code", "==", code));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as PromoCode;
}
export const getEnrollments = () => getCollection<Enrollment>('enrollments');
export const getEnrollmentsByCourseId = async (cid: string) => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'enrollments'), where("courseId", "==", cid));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
}
export const updateEnrollment = (id: string, data: Partial<Enrollment>) => updateDocument('enrollments', id, data);
export const getInvoiceByEnrollmentId = async (eid: string) => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'invoices'), where("enrollmentId", "==", eid));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as Invoice;
}
export const addSupportTicket = (data: Omit<SupportTicket, 'id'>) => addDocument('support_tickets', data);
export const updateSupportTicket = (id: string, data: Partial<SupportTicket>) => updateDocument('support_tickets', id, data);
export const getSupportTicket = (id: string) => getDocument<SupportTicket>('support_tickets', id);
export const getSupportTickets = () => getCollection<SupportTicket>('support_tickets');
export const getSupportTicketsByUserId = async (uid: string) => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'support_tickets'), where("userId", "==", uid));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket));
}
export const addBlogPost = (data: Omit<BlogPost, 'id'>) => addDocument('blog_posts', data);
export const updateBlogPost = (id: string, data: Partial<BlogPost>) => updateDocument('blog_posts', id, data);
export const deleteBlogPost = (id: string) => deleteDocument('blog_posts', id);
export const getBlogPosts = () => getCollection<BlogPost>('blog_posts');
export const getBlogPostBySlug = async (slug: string) => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'blog_posts'), where("slug", "==", slug));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as BlogPost;
}
export const addPromoCode = (data: Omit<PromoCode, 'id'>) => addDocument('promo_codes', data);
export const updatePromoCode = (id: string, data: Partial<PromoCode>) => updateDocument('promo_codes', id, data);
export const deletePromoCode = (id: string) => deleteDocument('promo_codes', id);
export const addOrganization = (data: Partial<Organization>) => addDocument('organizations', data);
export const updateOrganization = (id: string, data: Partial<Organization>) => updateDocument('organizations', id, data);
export const deleteOrganization = (id: string) => deleteDocument('organizations', id);
export const getReportedContent = () => getCollection<ReportedContent>('reported_content');
export const addReportedContent = (data: Omit<ReportedContent, 'id'>) => addDocument('reported_content', data);
export const updateReportedContent = (id: string, data: Partial<ReportedContent>) => updateDocument('reported_content', id, data);
export const addUser = (data: Partial<User>) => addDocument('users', data);
export const deleteUser = (id: string) => deleteDocument('users', id);
export const addBranch = (data: Branch) => addDocument('branches', data);
export const updateBranch = (id: string, data: Partial<Branch>) => updateDocument('branches', id, data);
export const deleteBranch = (id: string) => deleteDocument('branches', id);
export const addBatch = (data: Omit<Batch, 'id'>) => addDocument('batches', data);
export const updateBatch = (id: string, data: Partial<Batch>) => updateDocument('batches', id, data);
export const deleteBatch = (id: string) => deleteDocument('batches', id);
export const saveAttendanceRecords = async (records: ({ id: string, update: Partial<AttendanceRecord> } | { create: Omit<AttendanceRecord, 'id'> })[]) => {
    const db = getDbInstance();
    if (!db) return;
    const batch = writeBatch(db);
    records.forEach(r => {
        if ('create' in r) batch.set(doc(collection(db, 'attendance')), r.create);
        else batch.update(doc(db, 'attendance', r.id), r.update);
    });
    await batch.commit();
}
export const getAttendanceRecordForStudentByDate = async (sid: string, date: string) => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'attendance'), where("studentId", "==", sid), where("date", "==", date));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as AttendanceRecord;
}
export const getAttendanceForStudent = async (sid: string) => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'attendance'), where("studentId", "==", sid));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
}
export const getAttendanceForStudentInCourse = async (sid: string, cid: string) => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'attendance'), where("studentId", "==", sid), where("courseId", "==", cid));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
}
export const updateAttendanceRecord = (id: string, data: Partial<AttendanceRecord>) => updateDocument('attendance', id, data);
export const getUserByOfflineRoll = async (roll: string) => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'users'), where("offlineRollNo", "==", roll));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as User;
}
export const getUsersByBatchId = async (bid: string) => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'users'), where("assignedBatchId", "==", bid));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}
export const getCategories = async () => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'courses'));
    const snap = await getDocs(q);
    const cats = new Set(snap.docs.map(d => d.data().category).filter(Boolean));
    return Array.from(cats) as string[];
}
export const findUserByRegistrationOrRoll = async (val: string) => {
    const db = getDbInstance();
    if (!db) return { userId: null };
    let q = query(collection(db, 'users'), where("registrationNumber", "==", val));
    let snap = await getDocs(q);
    if (snap.empty) {
        q = query(collection(db, 'users'), where("classRoll", "==", val));
        snap = await getDocs(q);
    }
    if (snap.empty) {
        q = query(collection(db, 'users'), where("offlineRollNo", "==", val));
        snap = await getDocs(q);
    }
    return { userId: snap.empty ? null : snap.docs[0].id };
}
