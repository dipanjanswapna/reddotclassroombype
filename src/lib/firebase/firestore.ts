

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
import { Course, Instructor, Organization, User, HomepageConfig, PromoCode, SupportTicket, BlogPost, Notification, PlatformSettings, Enrollment, Announcement, Prebooking } from '../types';

// Generic function to fetch a collection
async function getCollection<T>(collectionName: string): Promise<T[]> {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
}

// Generic function to fetch a document by ID
async function getDocument<T>(collectionName: string, id: string): Promise<T | null> {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
}

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
    const q = query(collection(db, "instructors"), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Instructor;
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
export const getUserByUid = async (uid: string): Promise<User | null> => {
    const q = query(collection(db, 'users'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
}
export const getUserByClassRoll = async (classRoll: string): Promise<User | null> => {
    const q = query(collection(db, 'users'), where('classRoll', '==', classRoll));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
}
export const getUserByEmailAndRole = async (email: string, role: User['role']): Promise<User | null> => {
    const q = query(collection(db, 'users'), where('email', '==', email), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
}
export const addUser = (user: Partial<User>) => addDoc(collection(db, 'users'), user);
export const updateUser = (id: string, user: Partial<User>) => updateDoc(doc(db, 'users', id), user);
export const deleteUser = (id: string) => deleteDoc(doc(db, 'users', id));


// Organizations
export const getOrganizations = () => getCollection<Organization>('organizations');
export const getOrganization = (id: string) => getDocument<Organization>('organizations', id);
export const addOrganization = (org: Partial<Organization>) => addDoc(collection(db, 'organizations'), org);
export const getPartnerBySubdomain = async (subdomain: string): Promise<Organization | null> => {
    const q = query(collection(db, "organizations"), where("subdomain", "==", subdomain));
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
  heroBanners: [
    { id: 1, href: "/courses/1", imageUrl: "https://placehold.co/800x450.png", alt: "HSC 25 Batch", dataAiHint: "students classroom" },
    { id: 2, href: "/courses/2", imageUrl: "https://placehold.co/800x450.png", alt: "Medical Admission", dataAiHint: "doctor medical" },
    { id: 3, href: "/courses/3", imageUrl: "https://placehold.co/800x450.png", alt: "IELTS Course", dataAiHint: "travel language" },
  ],
  heroCarousel: {
    autoplay: true,
    autoplayDelay: 5000,
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
    features: [
      { icon: "Trophy", title: { bn: "সেরা প্রশিক্ষক", en: "Best Instructors" }, description: { bn: "আমাদের সকল শিক্ষক স্ব স্ব ক্ষেত্রে অভিজ্ঞ এবং সেরা শিক্ষা প্রদানে প্রতিজ্ঞাবদ্ধ।", en: "All our instructors are experienced in their respective fields and committed to providing the best education." } },
      { icon: "BookOpen", title: { bn: "ইন্টারেক্টিভ লার্নিং", en: "Interactive Learning" }, description: { bn: "লাইভ ক্লাস, কুইজ এবং অ্যাসাইনমেন্টের মাধ্যমে আপনার শেখাকে আরও আনন্দদায়ক করে তুলুন।", en: "Make your learning more enjoyable through live classes, quizzes, and assignments." } },
      { icon: "Users", title: { bn: "সাপোর্ট সিস্টেম", en: "Support System" }, description: { bn: "যেকোনো সমস্যায় আমাদের সাপোর্ট টিম সর্বদা আপনার পাশে আছে।", en: "Our support team is always by your side for any problem." } },
    ],
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
   offlineHubSection: {
    display: true,
    title: { bn: "RDC অফলাইন হাব", en: "RDC Offline Hub" },
    subtitle: { bn: "অনলাইনে গত ৯ বছর ধরে লক্ষ লক্ষ শিক্ষার্থীকে পড়ানোর অভিজ্ঞতা নিয়ে এবার আমরা সামনাসামনি পড়াবো। এখন, আপনি অত্যাধুনিক মাল্টিমিডিয়া ক্লাসরুমে বসে, দেশের সেরা শিক্ষকদের কাছ থেকে সরাসরি শিখতে পারবেন।", en: "With 9 years of experience teaching millions of students online, we are now teaching face-to-face. Now, you can learn directly from the country's best teachers in a state-of-the-art multimedia classroom." },
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "classroom teacher",
    button1Text: { bn: "ফ্রি ক্লাস বুক করুন", en: "Book Free Class" },
    button1Url: "#",
    button2Text: { bn: "লিফলেট ডাউনলোড করুন", en: "Download Leaflet" },
    button2Url: "#",
    centersTitle: { bn: "আমাদের সেন্টারসমূহ", en: "Our Centers" },
    centers: [
      { id: "center1", name: "উত্তরা, ঢাকা", address: "লিফট: ৮, হাউজ: ২, রোড: ৭, সেক্টর: ৩, উত্তরা, ঢাকা (রাজলক্ষী কমপ্লেক্সের পেছনে)" },
      { id: "center2", name: "পান্থপথ, ঢাকা", address: "লিফট: ২, হাউজ: ১৪৭/ এ/২, গ্রীন রোড, পান্থপথ, ঢাকা (পান্থপথ সিগন্যালের উত্তরে)" },
      { id: "center3", name: "মিরপুর, ঢাকা", address: "লিফট: ৭, প্লট: ১১৪, রোড: ১০, ঢাকা (মেট্রোরেল)" },
    ],
    programsTitle: { bn: "আমাদের প্রোগ্রামসমূহ", en: "Our Programs" },
    programs: [
      {
        id: "program1",
        title: "Spoken English (Junior)",
        imageUrl: "https://i.imgur.com/rCne6ZJ.png",
        dataAiHint: "students learning english",
        features: [
          "Game ও অ্যাক্টিভিটির মাধ্যমে সহজে ইংরেজি শেখা",
          "Poster Presentation, Grammar ও Writing ওয়ার্কশপ",
          "পার্সোনাল Consultation ও Speaking সাপোর্ট",
          "Parents মিটিং ও Progress রিপোর্ট",
        ],
        button1Text: "ফ্রি ক্লাস বুক করুন",
        button1Url: "#",
        button2Text: "আরো বিস্তারিত জানুন",
        button2Url: "#",
      }
    ],
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
    items: [
      { id: 1, name: "MediShark", organizationId: "org_medishark", type: "organization", logoUrl: "https://i.imgur.com/v1sB0L7.png", dataAiHint: "shark logo", description: { bn: "মেডিকেল ভর্তি প্রস্তুতির সেরা ঠিকানা।", en: "The best place for medical admission preparation." }, cta: { text: { bn: "ওয়েবসাইট দেখুন", en: "View Website" }, href: "#" }, socials: { facebook: "#", youtube: "#" } }
    ],
  },
  partnersSection: {
    display: true,
    title: { bn: "আমাদের পার্টনার", en: "Our Partners" },
    scrollSpeed: 25,
    partners: [
      { id: 1, name: "Myalice", href: "#", logoUrl: "https://placehold.co/140x60.png?text=Myalice", dataAiHint: "Myalice logo" },
      { id: 2, name: "Pathao", href: "#", logoUrl: "https://placehold.co/140x60.png?text=Pathao", dataAiHint: "Pathao logo" },
      { id: 3, name: "Chaldal", href: "#", logoUrl: "https://placehold.co/140x60.png?text=Chaldal", dataAiHint: "Chaldal logo" },
      { id: 4, name: "Klikit", href: "#", logoUrl: "https://placehold.co/140x60.png?text=Klikit", dataAiHint: "Klikit logo" },
      { id: 5, name: "Misfit Tech", href: "#", logoUrl: "https://placehold.co/140x60.png?text=Misfit+Tech", dataAiHint: "Misfit Tech logo" },
    ],
  },
  socialMediaSection: {
    display: true,
    title: { bn: "আমাদের সাথে কানেক্টেড থাকুন", en: "Stay Connected With Us" },
    description: { bn: "আমাদের সোশ্যাল মিডিয়া প্ল্যাটফর্মগুলোতে যোগ দিয়ে প্রতিদিন নতুন কিছু শিখুন এবং আপডেটেড থাকুন।", en: "Join our social media platforms to learn something new every day and stay updated." },
    channels: [
      { id: 1, platform: "Facebook Page", name: "RDC Facebook Page", handle: "@reddotclassroom", stat1_value: "1.2M", stat1_label: "Likes", stat2_value: "1.3M", stat2_label: "Followers", description: "Join our main Facebook page for daily updates.", ctaText: "Follow Page", ctaUrl: "#" },
      { id: 2, platform: "Facebook Group", name: "RDC Student Community", handle: "RDC Students", stat1_value: "500k", stat1_label: "Members", stat2_value: "1k+", stat2_label: "Posts Today", description: "A community for all our students to interact.", ctaText: "Join Group", ctaUrl: "#" },
      { id: 3, platform: "YouTube", name: "RDC YouTube Channel", handle: "@rdc-edu", stat1_value: "800k", stat1_label: "Subscribers", stat2_value: "1.2k", stat2_label: "Videos", description: "Subscribe for high-quality video lectures.", ctaText: "Subscribe", ctaUrl: "#" },
    ],
  },
  notesBanner: {
    display: true,
    title: { bn: "ফ্রি নোটস এবং লেকচার শিট", en: "Free Notes & Lecture Sheets" },
    description: { bn: "আমাদের ওয়েবসাইটে থাকা ফ্রি রিসোর্সগুলো আপনার প্রস্তুতিকে আরও সহজ করে তুলবে।", en: "The free resources on our website will make your preparation easier." },
    buttonText: { bn: "নোটস দেখুন", en: "View Notes" },
  },
  statsSection: {
    display: true,
    title: { bn: "লক্ষাধিক শিক্ষার্থীর পথচলা", en: "Journey of Millions of Students" },
    stats: [
      { value: "10M+", label: { bn: "শিক্ষার্থী", en: "Students" } },
      { value: "5k+", label: { bn: "ভিডিও লেকচার", en: "Video Lectures" } },
      { value: "2k+", label: { bn: "কুইজ ও মডেল টেস্ট", en: "Quizzes & Model Tests" } },
    ],
  },
  appPromo: {
    display: true,
    title: { bn: "ডাউনলোড করুন RDC অ্যাপ", en: "Download the RDC App" },
    description: { bn: "যেকোনো জায়গা থেকে, যেকোনো সময়ে পড়াশোনা করুন আমাদের অ্যাপের মাধ্যমে। সেরা সব ফিচার আপনার শেখার অভিজ্ঞতাকে করবে আরও সহজ ও আনন্দদায়ক।", en: "Study from anywhere, anytime with our app. The best features will make your learning experience easier and more enjoyable." },
    googlePlayUrl: "#",
    appStoreUrl: "#",
    imageUrl: "https://i.imgur.com/Ujein2v.png",
    dataAiHint: "mobile app screenshot",
  },
  floatingWhatsApp: {
    display: true,
    number: "8801700000000",
  },
  platformSettings: defaultPlatformSettings,
};

// Blog Posts
export const getBlogPosts = () => getCollection<BlogPost>('blog_posts');
export const getBlogPost = (id: string) => getDocument<BlogPost>('blog_posts', id);
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    const q = query(collection(db, "blog_posts"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as BlogPost;
};
export const addBlogPost = (post: Omit<BlogPost, 'id'>) => addDoc(collection(db, 'blog_posts'), post);
export const updateBlogPost = (id: string, post: Partial<BlogPost>) => updateDoc(doc(db, 'blog_posts', id), post);
export const deleteBlogPost = (id: string) => deleteDoc(doc(db, 'blog_posts', id));


// Homepage Config
export const getHomepageConfig = async (): Promise<HomepageConfig | null> => {
  const docRef = doc(db, 'config', 'homepage');
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Merge with default to ensure all keys exist
    const mergedConfig = {
        ...defaultHomepageConfig,
        ...data,
        heroCarousel: { ...defaultHomepageConfig.heroCarousel, ...data.heroCarousel },
        categoriesSection: { ...defaultHomepageConfig.categoriesSection, ...data.categoriesSection },
        journeySection: { ...defaultHomepageConfig.journeySection, ...data.journeySection },
        teachersSection: { ...defaultHomepageConfig.teachersSection, ...data.teachersSection },
        videoSection: { ...defaultHomepageConfig.videoSection, ...data.videoSection },
        sscHscSection: { ...defaultHomepageConfig.sscHscSection, ...data.sscHscSection },
        masterclassSection: { ...defaultHomepageConfig.masterclassSection, ...data.masterclassSection },
        admissionSection: { ...defaultHomepageConfig.admissionSection, ...data.admissionSection },
        jobPrepSection: { ...defaultHomepageConfig.jobPrepSection, ...data.jobPrepSection },
        whyChooseUs: { ...defaultHomepageConfig.whyChooseUs, ...data.whyChooseUs },
        freeClassesSection: { ...defaultHomepageConfig.freeClassesSection, ...data.freeClassesSection },
        offlineHubSection: { 
            ...defaultHomepageConfig.offlineHubSection, 
            ...data.offlineHubSection,
            contactSection: {
                ...defaultHomepageConfig.offlineHubSection.contactSection,
                ...(data.offlineHubSection?.contactSection || {}),
            }
        },
        collaborations: { ...defaultHomepageConfig.collaborations, ...data.collaborations },
        partnersSection: { ...defaultHomepageConfig.partnersSection, ...data.partnersSection },
        socialMediaSection: { ...defaultHomepageConfig.socialMediaSection, ...data.socialMediaSection },
        notesBanner: { ...defaultHomepageConfig.notesBanner, ...data.notesBanner },
        statsSection: { ...defaultHomepageConfig.statsSection, ...data.statsSection },
        appPromo: { ...defaultHomepageConfig.appPromo, ...data.appPromo },
        floatingWhatsApp: { ...defaultHomepageConfig.floatingWhatsApp, ...data.floatingWhatsApp },
        platformSettings: { ...defaultHomepageConfig.platformSettings, ...data.platformSettings },
    };
    return { id: docSnap.id, ...mergedConfig } as HomepageConfig;
  }
  
  // If document doesn't exist, create it with default values
  try {
    await setDoc(docRef, defaultHomepageConfig);
    const newDocSnap = await getDoc(docRef);
    if (newDocSnap.exists()) {
      return { id: newDocSnap.id, ...newDocSnap.data() } as HomepageConfig;
    }
  } catch (error) {
    console.error("Error creating default homepage config:", error);
    return null;
  }

  return null;
};
export const updateHomepageConfig = (config: any) => updateDoc(doc(db, 'config', 'homepage'), config);

// Promo Codes
export const getPromoCodes = () => getCollection<PromoCode>('promo_codes');
export const getPromoCodeByCode = async (code: string): Promise<PromoCode | null> => {
    const q = query(collection(db, "promo_codes"), where("code", "==", code));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        return { id: docData.id, ...docData.data() } as PromoCode;
    }
    return null;
}
export const getPromoCodeForUserAndCourse = async (userId: string, courseId: string): Promise<PromoCode | null> => {
    const q = query(
        collection(db, "promo_codes"), 
        where("restrictedToUserId", "==", userId),
        where("applicableCourseIds", "array-contains", courseId),
        where("isActive", "==", true)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    // Assuming one unique promo per user per course
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as PromoCode;
}
export const addPromoCode = (promoCode: Partial<PromoCode>) => addDoc(collection(db, 'promo_codes'), promoCode);
export const updatePromoCode = (id: string, promoCode: Partial<PromoCode>) => updateDoc(doc(db, 'promo_codes', id), promoCode);
export const deletePromoCode = (id: string) => deleteDoc(doc(db, 'promo_codes', id));

// Notifications
export const getNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
    const q = query(collection(db, "notifications"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
}
export const addNotification = (notification: Omit<Notification, 'id'>) => addDoc(collection(db, 'notifications'), notification);

export const markAllNotificationsAsRead = async (userId: string) => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where("userId", "==", userId), where("read", "==", false));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return;

    const batch = writeBatch(db);
    querySnapshot.forEach(docSnap => {
        batch.update(docSnap.ref, { read: true });
    });
    await batch.commit();
}
