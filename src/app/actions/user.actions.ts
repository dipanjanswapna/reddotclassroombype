
'use server';

import 'dotenv/config';

import { revalidatePath } from 'next/cache';
import {
  addUser,
  deleteUser,
  getUser,
  getUserByEmailAndRole,
  updateUser,
  getEnrollmentsByUserId,
  getPrebookingsByUserId,
  getSupportTicketsByUserId
} from '@/lib/firebase/firestore';
import { User } from '@/lib/types';
import { Timestamp, writeBatch, doc, query, collection, where, getDocs } from 'firebase/firestore';
import { db as getDbInstance } from '@/lib/firebase/config';
import { StudyPlanEvent } from '@/ai/schemas/study-plan-schemas';
import { removeUndefinedValues } from '@/lib/utils';
import { generateRegistrationNumber } from '@/lib/utils';

export async function saveUserAction(userData: Partial<User>) {
    try {
        if (userData.id) {
            // --- UPDATE LOGIC ---
            const { id, ...data } = userData;
            const currentUserState = await getUser(id);

            const regNo = String(currentUserState?.registrationNumber);
            const isInvalidRegNo = currentUserState && 
                                 currentUserState.role !== 'Guardian' &&
                                 (!currentUserState.registrationNumber || isNaN(parseInt(regNo)) || regNo.length !== 8);

            if (isInvalidRegNo) {
                data.registrationNumber = generateRegistrationNumber();
            }

            await updateUser(id, data);
            revalidatePath('/admin/users');
            revalidatePath('/admin/students');
            revalidatePath('/student/profile');
            revalidatePath(`/admin/manage-user/${id}`);
            revalidatePath('/admin/offline-hub');
            return { success: true, message: 'User updated successfully.' };
        } else {
            // --- CREATE LOGIC ---
            const newUser: Partial<User> = { ...userData, joined: Timestamp.now() };
            if (!newUser.registrationNumber && newUser.role !== 'Guardian') {
                newUser.registrationNumber = generateRegistrationNumber();
            }
            if (!newUser.status) {
                newUser.status = 'Active';
            }
            await addUser(newUser);
            revalidatePath('/admin/users');
            revalidatePath('/admin/students');
            return { success: true, message: 'User created successfully.' };
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteUserAction(id: string) {
    const db = getDbInstance();
    // Note: Deleting a user from Firebase Authentication requires the Admin SDK
    // and is best handled in a secure backend environment like Firebase Functions.
    // This action will delete the user's data from Firestore but not their auth entry.
    try {
        const user = await getUser(id);
        if (!user) {
            throw new Error("User not found.");
        }

        const batch = writeBatch(db);

        // 1. Delete user document itself
        const userRef = doc(db, 'users', id);
        batch.delete(userRef);

        // 2. Delete associated data (if student or guardian)
        if (user.role === 'Student') {
            const enrollments = await getEnrollmentsByUserId(user.uid);
            enrollments.forEach(e => batch.delete(doc(db, 'enrollments', e.id!)));
            
            const prebookings = await getPrebookingsByUserId(user.uid);
            prebookings.forEach(p => batch.delete(doc(db, 'prebookings', p.id!)));

            const tickets = await getSupportTicketsByUserId(user.uid);
            tickets.forEach(t => batch.delete(doc(db, 'support_tickets', t.id!)));
            
            // Unlink guardian if exists
            if (user.linkedGuardianId) {
                const guardianRef = doc(db, 'users', user.linkedGuardianId);
                batch.update(guardianRef, { linkedStudentId: '' });
            }
        }
        
        if (user.role === 'Guardian' && user.linkedStudentId) {
            const studentRef = doc(db, 'users', user.linkedStudentId);
            batch.update(studentRef, { linkedGuardianId: '' });
        }
        
        await batch.commit();

        revalidatePath('/admin/users');
        revalidatePath('/admin/students');
        return { success: true, message: 'User and all associated data deleted successfully.' };
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return { success: false, message: error.message };
    }
}


export async function linkGuardianAction(studentId: string, guardianEmail: string) {
    try {
        let guardian = await getUserByEmailAndRole(guardianEmail, 'Guardian');

        if (!guardian) {
            const newGuardianData: Partial<User> = {
                name: "Guardian",
                email: guardianEmail,
                role: 'Guardian',
                status: 'Active',
                joined: Timestamp.now(),
                linkedStudentId: studentId
            };
            const newGuardianRef = await addUser(newGuardianData);
            guardian = { id: newGuardianRef.id, ...newGuardianData } as User;
        } else {
            await updateUser(guardian.id!, { linkedStudentId: studentId });
        }

        await updateUser(studentId, { linkedGuardianId: guardian.id });

        revalidatePath('/student/guardian');
        return { success: true, message: `Successfully linked with guardian ${guardianEmail}.` };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function unlinkGuardianAction(studentId: string, guardianId: string) {
     try {
        await updateUser(studentId, { linkedGuardianId: '' });
        await updateUser(guardianId, { linkedStudentId: '' });
        
        revalidatePath('/student/guardian');
        return { success: true, message: 'Guardian has been unlinked.' };
     } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function toggleWishlistAction(userId: string, courseId: string) {
    try {
      const user = await getUser(userId);
      if (!user) throw new Error("User not found.");

      const currentWishlist = user.wishlist || [];
      const isInWishlist = currentWishlist.includes(courseId);
      
      const newWishlist = isInWishlist
        ? currentWishlist.filter(id => id !== courseId)
        : [...currentWishlist, courseId];

      await updateUser(userId, { wishlist: newWishlist });

      revalidatePath('/student/wishlist');
      revalidatePath('/student/my-courses');
      revalidatePath('/courses');
      // Revalidate other pages where CourseCard might be used if necessary
      return { success: true, isInWishlist: !isInWishlist };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
}


export async function saveStudyPlanAction(userId: string, events: StudyPlanEvent[]) {
    try {
        await updateUser(userId, { studyPlan: removeUndefinedValues(events) });
        revalidatePath('/student/planner');
        return { success: true, message: 'Study plan saved successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function findUserByRegistrationOrRoll(id: string): Promise<{ userId: string | null }> {
    const db = getDbInstance();
    try {
        // Search by registration number first (more unique)
        let q = query(collection(db, 'users'), where('registrationNumber', '==', id));
        let querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return { userId: querySnapshot.docs[0].id };
        }

        // If not found, search by offline roll number
        q = query(collection(db, 'users'), where('offlineRollNo', '==', id));
        querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            return { userId: querySnapshot.docs[0].id };
        }

        // If still not found, search by class roll
        q = query(collection(db, 'users'), where('classRoll', '==', id));
        querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            return { userId: querySnapshot.docs[0].id };
        }

        return { userId: null };
    } catch (error) {
        console.error("Error finding user:", error);
        return { userId: null };
    }
}

export async function markStudentAsCounseledAction(userId: string) {
    try {
        await updateUser(userId, { lastCounseledAt: Timestamp.now() });
        revalidatePath('/admin/absent-students');
        revalidatePath('/moderator/absent-students');
        revalidatePath('/affiliate/absent-students');
        revalidatePath('/seller/call-center');
        return { success: true, message: 'Student marked as counseled.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}
