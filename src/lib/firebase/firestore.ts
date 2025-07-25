


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
import { Course, Instructor, Organization, User, HomepageConfig, PromoCode, SupportTicket, BlogPost, Notification, PlatformSettings, Enrollment, Announcement, Prebooking, Branch, Batch, AttendanceRecord, Question, Payout, ReportedContent, Invoice, CallbackRequest, Notice, Product, Order, StoreCategory, StoreHomepageSection, Referral, Reward, RedemptionRequest, Doubt, DoubtAnswer, DoubtSession, Folder, List, PlannerTask, Goal } from '../types';
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

  // Fetch all notices first
  const q = query(collection(db, 'notices'), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  let allNotices = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice));

  // Filter on the client-side
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
  appPromo: {
    display: true,
    title: { bn: "RDC অ্যাপ ডাউনলোড করুন", en: "Download the RDC App" },
    description: { bn: "যেকোনো সময়, যেকোনো স্থানে আপনার পড়াশোনা চালিয়ে যান। লাইভ ক্লাস, কুইজ এবং আরও অনেক কিছু এখন আপনার হাতের মুঠোয়।", en: "Continue your studies anytime, anywhere. Live classes, quizzes, and much more are now at your fingertips." },
    googlePlayUrl: "#",
    appStoreUrl: "#",
    googlePlayImageUrl: "https://placehold.co/180x60.png",
    appStoreImageUrl: "https://placehold.co/180x60.png",
    promoImageUrl: "https://i.imgur.com/uR1Y6o6.png",
    promoImageDataAiHint: "mobile app screenshot",
  },
  floatingWhatsApp: {
      display: true,
      number: "8801700000000"
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
        { id: 1, imageUrl: 'https://placehold.co/1200x343.png', dataAiHint: 'students course banner', title: 'IELTS MASTER', subtitle: 'IELTS MASTERCLASS & MOCK TEST', price: '৳1,200', originalPrice: '৳3,000', enrollHref: '#' }
    ]
  },
};

// Planner Specific Firestore Functions
export const getFoldersForUser = async (userId: string): Promise<Folder[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "folders"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const folders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Folder));
    // Sort client-side if needed, Firestore requires composite index for this query + orderBy
    return folders.sort((a, b) => safeToDate(a.createdAt).getTime() - safeToDate(b.createdAt).getTime());
}
export const getListsForUser = async (userId: string): Promise<List[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "lists"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const lists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as List));
    // Sort client-side
    return lists.sort((a,b) => safeToDate(a.createdAt).getTime() - safeToDate(b.createdAt).getTime());
}
export const getTasksForUser = async (userId: string): Promise<PlannerTask[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "tasks"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlannerTask));
    // Sort client-side to avoid needing a composite index
    return tasks.sort((a, b) => {
        const dateA = a.lastUpdatedAt ? safeToDate(a.lastUpdatedAt).getTime() : 0;
        const dateB = b.lastUpdatedAt ? safeToDate(b.lastUpdatedAt).getTime() : 0;
        return dateB - dateA;
    });
}
export const getGoalsForUser = async (userId: string): Promise<Goal[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "goals"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
}
export const getListsInFolder = async (folderId: string): Promise<List[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "lists"), where("folderId", "==", folderId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as List));
}
export const getTasksInList = async (listId: string): Promise<PlannerTask[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "tasks"), where("listId", "==", listId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlannerTask));
}


// Doubt Solve System
export const createDoubtSession = async (courseId: string, courseName: string, doubtSolverIds: string[]): Promise<string> => {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not initialized.");
    
    const q = query(collection(db, "doubt_sessions"), where("courseId", "==", courseId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
    } else {
        const newSession: Omit<DoubtSession, 'id'> = {
            courseId,
            sessionName: `${courseName} Doubt Solve`,
            assignedDoubtSolverIds: doubtSolverIds,
            createdAt: Timestamp.now(),
        };
        const docRef = await addDoc(collection(db, 'doubt_sessions'), newSession);
        return docRef.id;
    }
}
export const getDoubtsByCourseAndStudent = async (courseId: string, studentId: string): Promise<Doubt[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "doubts"), where("courseId", "==", courseId), where("studentId", "==", studentId), orderBy("lastUpdatedAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doubt));
}
export const getDoubt = (id: string) => getDocument<Doubt>('doubts', id);
export const getDoubts = () => getCollection<Doubt>('doubts');
export const getDoubtAnswers = async (doubtId: string): Promise<DoubtAnswer[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "doubt_answers"), where("doubtId", "==", doubtId), orderBy("answeredAt", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DoubtAnswer));
}
export const getDoubtsByCourse = async (courseId: string): Promise<Doubt[]> => {
    const db = getDbInstance();
    if (!db) return [];
    const q = query(collection(db, "doubts"), where("courseId", "==", courseId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doubt));
}
export const getStudentForDoubt = async (studentId: string): Promise<User | null> => {
    return getUser(studentId);
}


// Function to get the homepage configuration
export const getHomepageConfig = async (): Promise<HomepageConfig> => {
    const db = getDbInstance();
    if (!db) {
      console.warn("Firestore not available on server-side during build, returning default config.");
      return { id: 'default', ...defaultHomepageConfig };
    }
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
    // Assuming one unique promo per user-course pair
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
