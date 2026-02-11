
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
import { Course, Instructor, Organization, User, HomepageConfig, PromoCode, SupportTicket, BlogPost, Notification, PlatformSettings, Enrollment, Announcement, Prebooking, Branch, Batch, AttendanceRecord, Question, Payout, ReportedContent, Invoice, CallbackRequest, Notice, Product, Order, StoreCategory, StoreHomepageSection, Referral, Reward, RedemptionRequest, Doubt, DoubtAnswer, DoubtSession, Folder, List, PlannerTask, Goal, CategoryItem, OfflineHubSection } from '../types';
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
export const deleteInstructorAction = async (id: string) => {
    const db = getDbInstance();
    if (!db) {
        throw new Error('Database service is currently unavailable.');
    }
    try {
        const instructor = await getInstructor(id);
        if (!instructor) {
            throw new Error("Instructor not found.");
        }

        const batch = writeBatch(db);
        const instructorRef = doc(db, 'instructors', id);
        batch.delete(instructorRef);

        if (instructor.userId) {
            const user = await getUser(instructor.userId);
            if (user?.id) {
                const userRef = doc(db, 'users', user.id);
                batch.delete(userRef);
            }
        }
        await batch.commit();
        return { success: true, message: 'Instructor and associated user data deleted successfully.' };
    } catch (error: any) {
        console.error("Error deleting instructor:", error);
        return { success: false, message: error.message };
    }
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
  
  // Try searching by registration number first
  user = await getUserByRegistrationNumber(id);
  if (user) {
    return { userId: user.id! };
  }
  
  // If not found, try searching by class roll
  user = await getUserByClassRoll(id);
  if (user) {
    return { userId: user.id! };
  }
  
  // If not found, try searching by offline roll
  user = await getUserByOfflineRoll(id);
  if (user) {
      return { userId: user.id! };
  }
  
  return { userId: null };
};

export const getUserByRegistrationNumber = async (regNo: string): Promise<User | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'users'), where('registrationNumber', '==', regNo));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
}

export const getUserByOfflineRoll = async (rollNo: string): Promise<User | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'users'), where('offlineRollNo', '==', rollNo));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
};
export const getUserByEmailAndRole = async (email: string, role: User['role']): Promise<User | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'users'), where('email', '==', email), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
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
export const deleteUserAction = async (id: string) => {
    const db = getDbInstance();
    if (!db) {
        throw new Error('Database service is currently unavailable.');
    }
    try {
        await deleteDoc(doc(db, 'users', id));
        return { success: true, message: 'User deleted successfully.' };
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return { success: false, message: error.message };
    }
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
export const getOrganizationsByIds = async (ids: string[]): Promise<Organization[]> => {
  if (!ids || ids.length === 0) return [];
  const db = getDbInstance();
  if (!db) return [];
  const orgsRef = collection(db, 'organizations');
  const q = query(orgsRef, where(documentId(), 'in', ids));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organization));
}
export const updateOrganization = (id: string, organization: Partial<Organization>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'organizations', id), organization);
}
export const deleteOrganization = (id: string) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return deleteDoc(doc(db, 'organizations', id));
}
export const getOrganizationByUserId = async (userId: string): Promise<Organization | null> => {
    const db = getDbInstance();
    if (!db) return null;
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
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "support_tickets"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket));
};
export const getSupportTicket = (id: string) => getDocument<SupportTicket>('support_tickets', id);
export const addSupportTicket = (ticket: Partial<SupportTicket>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return addDoc(collection(db, 'support_tickets'), ticket);
}
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

export const getEnrollmentByInvoiceId = async (invoiceId: string): Promise<Enrollment | null> => {
    if (!invoiceId) return null;
    const db = getDbInstance();
    if (!db) return null;
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
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "enrollments"), where("courseId", "==", courseId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
}

export const addEnrollment = (enrollment: Omit<Enrollment, 'id'>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return addDoc(collection(db, 'enrollments'), enrollment);
}
export const updateEnrollment = (id: string, data: Partial<Enrollment>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'enrollments', id), data);
}


// Pre-bookings
export const addPrebooking = (prebooking: Omit<Prebooking, 'id'>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return addDoc(collection(db, 'prebookings'), prebooking);
}

export const getPrebookingForUser = async (courseId: string, userId: string): Promise<Prebooking | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'prebookings'), where('courseId', '==', courseId), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Prebooking;
};

export const getPrebookingsByCourseId = async (courseId: string): Promise<Prebooking[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "prebookings"), where("courseId", "==", courseId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prebooking));
}

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

// Branches (for Offline Hub)
export const getBranches = () => getCollection<Branch>('branches');
export const getBranch = (id: string) => getDocument<Branch>('branches', id);
export const addBranch = (branch: Branch) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return addDoc(collection(db, 'branches'), branch);
}
export const updateBranch = (id: string, branch: Partial<Branch>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'branches', id), branch);
}
export const deleteBranch = (id: string) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return deleteDoc(doc(db, 'branches', id));
}

// Batches (for Offline Hub)
export const getBatches = () => getCollection<Batch>('batches');
export const getBatch = (id: string) => getDocument<Batch>('batches', id);
export const addBatch = (batch: Partial<Batch>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return addDoc(collection(db, 'batches'), batch);
}
export const updateBatch = (id: string, batch: Partial<Batch>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'batches', id), batch);
}
export const deleteBatch = (id: string) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return deleteDoc(doc(db, 'batches', id));
}

// Attendance
export const getAttendanceRecords = () => getCollection<AttendanceRecord>('attendance');
export const updateAttendanceRecord = (id: string, data: Partial<AttendanceRecord>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'attendance', id), data);
}

export const getAttendanceRecordForStudentByDate = async (studentId: string, date: string): Promise<AttendanceRecord | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'attendance'), where('studentId', '==', studentId), where('date', '==', date));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as AttendanceRecord;
};

export const saveAttendanceRecords = async (records: ({ create: Omit<AttendanceRecord, 'id'> } | { id: string, update: Partial<AttendanceRecord> })[]) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
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
export const addReportedContent = (report: Omit<ReportedContent, 'id'>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return addDoc(collection(db, 'reported_content'), report);
}
export const getPendingReports = async (): Promise<ReportedContent[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'reported_content'), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReportedContent));
};
export const updateReportedContent = (id: string, data: Partial<ReportedContent>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'reported_content', id), data);
}

// Callback Requests
export const getCallbackRequests = () => getCollection<CallbackRequest>('callbacks');

// Notices
export const getNotices = async (options?: { limit?: number; includeDrafts?: boolean }): Promise<Notice[]> => {
  const { limit: queryLimit, includeDrafts } = options || {};
  const db = getDbInstance();
  if (!db) return [];

  const q = query(collection(db, 'notices'), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  let allNotices = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice));

  if (!includeDrafts) {
    allNotices = allNotices.filter(notice => notice.isPublished === true);
  }
  
  if (queryLimit) {
    allNotices = allNotices.slice(0, queryLimit);
  }

  return allNotices;
};


// Homepage Configuration
export const getBlogPosts = () => getCollection<BlogPost>('blog_posts');
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, "blog_posts"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        return { id: docData.id, ...docData.data() } as BlogPost;
    }
    return null;
}
export const addBlogPost = (post: Partial<BlogPost>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return addDoc(collection(db, 'blog_posts'), post);
}
export const updateBlogPost = (id: string, post: Partial<BlogPost>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'blog_posts', id), post);
}
export const deleteBlogPost = (id: string) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return deleteDoc(doc(db, 'blog_posts', id));
}

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
    display: true,
    title: { bn: "RDC শপ", en: "RDC SHOP" },
    description: { 
      bn: "আমাদের প্ল্যাটফর্মে তোমাদের পড়াশোনাকে আরও আধুনিক এবং সহজ করার জন্য আমরা সর্বদা সচেষ্ট।",
      en: "We are always striving to make your studies more modern and easier on our platform."
    }
  },
  heroBanners: [
    { id: 1, href: "/courses/", imageUrl: "https://picsum.photos/seed/1/1200/675", alt: "Special Offer", dataAiHint: "students classroom" },
  ],
  heroCarousel: {
    autoplay: true,
    autoplayDelay: 5000,
  },
  strugglingStudentSection: {
    display: true,
    title: { bn: "পড়াশোনায় পিছিয়ে পড়ছো?", en: "Struggling in Studies?" },
    subtitle: { bn: "এসো তোমার সমস্যার সমাধান করি ✨", en: "Let's solve your problems together ✨" },
    imageUrl: "https://cdni.iconscout.com/illustration/premium/thumb/man-confused-about-mobile-happenings-illustration-download-in-svg-png-gif-file-formats--error-warning-alert-exclamation-state-pack-people-illustrations-1784671.png?f=webp",
    buttonText: { bn: "আমরা কীভাবে সাহায্য করি", en: "See How We Help" },
  },
  categoriesSection: {
    display: true,
    title: { bn: "ক্যাটাগরি", en: "Categories" },
    categories: [
      { id: 1, title: { bn: 'এইচএসসি', en: 'HSC' }, imageUrl: 'https://picsum.photos/seed/cat1/400/500', linkUrl: '/courses?category=HSC', dataAiHint: 'student book' },
      { id: 2, title: { bn: 'এসএসসি', en: 'SSC' }, imageUrl: 'https://picsum.photos/seed/cat2/400/500', linkUrl: '/courses?category=SSC', dataAiHint: 'student desk' },
    ]
  },
  journeySection: {
    display: true,
    title: { bn: "আপনার শেখার যাত্রা শুরু করুন", en: "Start Your Learning Journey" },
    subtitle: { bn: "আমাদের লাইভ কোর্সগুলোতে জয়েন করুন।", en: "Join our live courses." },
    courseTitle: { bn: "লাইভ কোর্সসমূহ", en: "Live Courses" },
  },
  liveCoursesIds: [],
  teachersSection: {
    display: true,
    title: { bn: "আমাদের অভিজ্ঞ শিক্ষকগণ", en: "Our Experienced Teachers" },
    subtitle: { bn: "দেশের সেরা শিক্ষকদের সাথে আপনার প্রস্তুতি নিন।", en: "Prepare with the best teachers in the country." },
    buttonText: { bn: "সকল শিক্ষক", en: "All Teachers" },
    instructorIds: [],
    scrollSpeed: 25,
  },
  videoSection: {
    display: true,
    title: { bn: "সফলতার গল্প", en: "Success Stories" },
    description: { bn: "জানুন কীভাবে RDC শিক্ষার্থীদের স্বপ্ন পূরণে সহায়তা করেছে।", en: "Learn how RDC has helped students achieve their dreams." },
    buttonText: { bn: "সকল কোর্স দেখুন", en: "View All Courses" },
    videos: [],
  },
  sscHscSection: {
    display: true,
    badge: { bn: "প্রস্তুতি", en: "Preparation" },
    title: { bn: "SSC ও HSC প্রস্তুতি", en: "SSC & HSC Preparation" },
  },
  sscHscCourseIds: [],
  masterclassSection: {
    display: true,
    title: { bn: "ফ্রি মাস্টারক্লাস", en: "Free Masterclasses" },
    buttonText: { bn: "সকল মাস্টারক্লাস দেখুন", en: "View All Masterclasses" },
  },
  masterClassesIds: [],
  admissionSection: {
    display: true,
    badge: { bn: "ভর্তি", en: "Admission" },
    title: { bn: "অ্যাডমিশন টেস্ট প্রস্তুতি", en: "Admission Test Preparation" },
    buttonText: { bn: "সকল অ্যাডমিশন কোর্স", en: "All Admission Courses" },
  },
  admissionCoursesIds: [],
  jobPrepSection: {
    display: true,
    badge: { bn: "ক্যারিয়ার", en: "Career" },
    title: { bn: "চাকরির প্রস্তুতি", en: "Job Preparation" },
    buttonText: { bn: "সকল জব কোর্স", en: "All Job Courses" },
  },
  jobCoursesIds: [],
  whyChooseUs: {
    display: true,
    title: { bn: "কেন আমরাই সেরা?", en: "Why We Are The Best?" },
    description: {bn: "সেরা শিক্ষা প্রদানে আমরা প্রতিজ্ঞাবদ্ধ।", en: "We are committed to providing the best education."},
    features: [],
    testimonials: []
  },
  freeClassesSection: {
    display: true,
    title: { bn: "ফ্রি ক্লাসসমূহ", en: "All Our Free Classes" },
    subtitle: { bn: "আমাদের ক্লাসগুলো ফ্রিতে দেখে নিন", en: "Watch our classes for free" },
    classes: []
  },
  aboutUsSection: {
    display: true,
    title: { bn: "আমাদের সম্পর্কে", en: "About Us" },
    subtitle: { bn: "আমাদের পেছনের কারিগরদের সাথে পরিচিত হন।", en: "Meet the team behind our platform." },
    teamMembers: []
  },
  offlineHubSection: {
    display: true,
    heroTitle: { bn: 'রেড ডট অফলাইন হাব', en: 'Red Dot Offline Hub' },
    heroSubtitle: { bn: 'সরাসরি বিশেষজ্ঞদের কাছ থেকে শিখুন।', en: 'Learn directly from the experts.' },
    exploreProgramsText: { bn: 'প্রোগ্রামগুলো দেখুন', en: 'Explore Programs' },
    findCenterText: { bn: 'সেন্টার খুঁজুন', en: 'Find a Center' },
    programsTitle: { bn: 'আমাদের প্রোগ্রামসমূহ', en: 'Available Programs' },
    centersTitle: { bn: 'আমাদের অফলাইন হাবসমূহ', en: 'Our Offline Hubs' },
    centersSubtitle: { bn: 'সেন্টারগুলো ভিজিট করুন।', en: 'Visit our centers.' },
    contactSection: {
      display: true,
      title: { bn: "কোনো প্রশ্ন আছে?", en: "Ready to Join RDC Offline?" },
      subtitle: { bn: "আমাদের সাথে কথা বলুন।", en: "Talk to our student advisors." },
      callButtonText: { bn: "কল করুন", en: "Call Support" },
      callButtonNumber: "01641035736",
      whatsappButtonText: { bn: "WhatsApp-এ মেসেজ দিন", en: "WhatsApp Us" },
      whatsappNumber: "8801641035736",
    },
    heroImageUrl: "https://picsum.photos/seed/offline/800/800",
    heroImageDataAiHint: "modern classroom",
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
    title: { bn: "সোশ্যাল মিডিয়া", en: "Stay Connected With Us" },
    description: { bn: "আমাদের সোশ্যাল মিডিয়ায় যোগ দিন।", en: "Join our social media channels." },
    channels: [],
  },
  notesBanner: {
    display: true,
    title: { bn: "ফ্রি নোটস", en: "Free Notes" },
    description: { bn: "ফ্রি নোটস ডাউনলোড করুন।", en: "Download free notes." },
    buttonText: { bn: "ডাউনলোড করুন", en: "Download Now" },
  },
  appPromo: {
    display: true,
    title: { bn: "RDC অ্যাপ", en: "Download the RDC App" },
    description: { bn: "আপনার ফোনে পড়াশোনা শুরু করুন।", en: "Start studying on your phone." },
    googlePlayUrl: "#",
    appStoreUrl: "#",
    googlePlayImageUrl: "https://placehold.co/180x60.png",
    appStoreImageUrl: "https://placehold.co/180x60.png",
    promoImageUrl: "https://picsum.photos/seed/app/400/800",
    promoImageDataAiHint: "mobile app screenshot",
  },
  floatingWhatsApp: {
      display: true,
      number: "8801641035736"
  },
  platformSettings: defaultPlatformSettings,
};

// Function to get the homepage configuration
export const getHomepageConfig = async (): Promise<HomepageConfig> => {
    const db = getDbInstance();
    if (!db) {
      return { id: 'default', ...defaultHomepageConfig } as HomepageConfig;
    }
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


// Promo Codes
export const getPromoCodes = () => getCollection<PromoCode>('promo_codes');
export const getPromoCodeByCode = async (code: string): Promise<PromoCode | null> => {
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'promo_codes'), where('code', '==', code));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as PromoCode;
};
export const getPromoCodeForUserAndCourse = async (userId: string, courseId: string): Promise<PromoCode | null> => {
    if (!userId) return null;
    const db = getDbInstance();
    if (!db) return null;
    const q = query(collection(db, 'promo_codes'), 
        where('restrictedToUserId', '==', userId), 
        where('applicableCourseIds', 'array-contains', courseId),
        where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as PromoCode;
}
export const addPromoCode = (code: Partial<PromoCode>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return addDoc(collection(db, 'promo_codes'), code);
}
export const updatePromoCode = (id: string, code: Partial<PromoCode>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return updateDoc(doc(db, 'promo_codes', id), code);
}
export const deletePromoCode = (id: string) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return deleteDoc(doc(db, 'promo_codes', id));
}

// Notifications
export const addNotification = (notification: Omit<Notification, 'id'>) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    return addDoc(collection(db, 'notifications'), notification);
}
export const getNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "notifications"), where("userId", "==", userId), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
}
export const markAllNotificationsAsRead = async (userId: string) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    const q = query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
    });
    await batch.commit();
}

export const markStudentAsCounseled = async (studentId: string) => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    const userRef = doc(db, 'users', studentId);
    return updateDoc(userRef, { lastCounseledAt: Timestamp.now() });
};

// Doubt Solving
export const getDoubts = () => getCollection<Doubt>('doubts');
export const getDoubt = (id: string) => getDocument<Doubt>('doubts', id);
export const getDoubtsByCourseAndStudent = async (courseId: string, studentId: string): Promise<Doubt[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'doubts'), where("courseId", "==", courseId), where("studentId", "==", studentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doubt));
}
export const getDoubtAnswers = async (doubtId: string): Promise<DoubtAnswer[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'doubt_answers'), where("doubtId", "==", doubtId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DoubtAnswer));
}
export const getStudentForDoubt = (studentId: string) => getDocument<User>('users', studentId);

export const createDoubtSession = async (courseId: string, courseTitle: string, solverIds: string[]): Promise<string> => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore not initialized.");
    const q = query(collection(db, 'doubt_sessions'), where('courseId', '==', courseId));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].id;

    const newSession: Omit<DoubtSession, 'id'> = {
        courseId,
        sessionName: `Support: ${courseTitle}`,
        assignedDoubtSolverIds: solverIds,
        createdAt: Timestamp.now()
    };
    const ref = await addDoc(collection(db, 'doubt_sessions'), newSession);
    return ref.id;
};

// Planner API (Legacy compatibility)
export const getFoldersForUser = async (userId: string): Promise<Folder[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'folders'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Folder));
};
export const getListsForUser = async (userId: string): Promise<List[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'lists'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as List));
};
export const getTasksForUser = async (userId: string): Promise<PlannerTask[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'tasks'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlannerTask));
};
export const getGoalsForUser = async (userId: string): Promise<Goal[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'goals'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
};
export const getListsInFolder = async (folderId: string): Promise<List[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'lists'), where('folderId', '==', folderId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as List));
};
export const getTasksInList = async (listId: string): Promise<PlannerTask[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, 'tasks'), where('listId', '==', listId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlannerTask));
};
