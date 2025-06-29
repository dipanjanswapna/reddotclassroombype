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
} from 'firebase/firestore';
import { Course, Instructor, Organization, User, HomepageConfig, PromoCode, SupportTicket } from '../types';

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
export const getCourses = () => getCollection<Course>('courses');
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
export const getInstructorsByIds = async (ids: string[]): Promise<Instructor[]> => {
    if (!ids || ids.length === 0) return [];
    const instructorsRef = collection(db, 'instructors');
    const q = query(instructorsRef, where(documentId(), 'in', ids));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Instructor));
}
export const updateInstructor = (id: string, instructor: Partial<Instructor>) => updateDoc(doc(db, 'instructors', id), instructor);


// Users
export const getUsers = () => getCollection<User>('users');
export const getUser = (id: string) => getDocument<User>('users', id);
export const addUser = (user: Partial<User>) => addDoc(collection(db, 'users'), user);
export const updateUser = (id: string, user: Partial<User>) => updateDoc(doc(db, 'users', id), user);
export const deleteUser = (id: string) => deleteDoc(doc(db, 'users', id));


// Organizations
export const getOrganizations = () => getCollection<Organization>('organizations');
export const getOrganization = (id: string) => getDocument<Organization>('organizations', id);
export const getPartnerBySubdomain = async (subdomain: string): Promise<Organization | null> => {
    const q = query(collection(db, "organizations"), where("subdomain", "==", subdomain));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        return { id: docData.id, ...docData.data() } as Organization;
    }
    return null;
}
export const updateOrganization = (id: string, organization: Partial<Organization>) => updateDoc(doc(db, 'organizations', id), organization);

// Support Tickets
export const getSupportTickets = () => getCollection<SupportTicket>('support_tickets');
export const getSupportTicket = (id: string) => getDocument<SupportTicket>('support_tickets', id);
export const addSupportTicket = (ticket: Partial<SupportTicket>) => addDoc(collection(db, 'support_tickets'), ticket);
export const updateSupportTicket = (id: string, ticket: Partial<SupportTicket>) => updateDoc(doc(db, 'support_tickets', id), ticket);

// Categories
export const getCategories = async (): Promise<string[]> => {
    const courses = await getCourses();
    const categories = new Set(courses.map(c => c.category));
    return Array.from(categories);
}

// Homepage Config
export const getHomepageConfig = async (): Promise<HomepageConfig | null> => {
  return getDocument<HomepageConfig>('config', 'homepage');
}
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
