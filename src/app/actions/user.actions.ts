
'use server';

import { revalidatePath } from 'next/cache';
import { addUser, deleteUser, getUser, getUserByEmailAndRole, updateUser } from '@/lib/firebase/firestore';
import { User } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

export async function saveUserAction(userData: Partial<User>) {
    try {
        if (userData.id) {
            const { id, ...data } = userData;
            await updateUser(id, data);
            revalidatePath('/admin/users');
            return { success: true, message: 'User updated successfully.' };
        } else {
            await addUser(userData);
            revalidatePath('/admin/users');
            return { success: true, message: 'User created successfully.' };
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteUserAction(id: string) {
    try {
        await deleteUser(id);
        revalidatePath('/admin/users');
        return { success: true, message: 'User deleted successfully.' };
    } catch (error: any) {
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
