
'use server';

import { revalidatePath } from 'next/cache';
import { addPromoCode, deletePromoCode, getCourse, getPromoCodeByCode, updatePromoCode, getInstructor, getCourses } from '@/lib/firebase/firestore';
import { PromoCode } from '@/lib/types';

export async function applyPromoCodeAction(courseId: string, promoCode: string, userId?: string) {
    try {
        const course = await getCourse(courseId);
        if (!course) {
            return { success: false, message: 'Course not found.' };
        }

        const matchedCode = await getPromoCodeByCode(promoCode);
        if (!matchedCode) {
            return { success: false, message: 'Invalid promo code.' };
        }

        if (matchedCode.restrictedToUserId && matchedCode.restrictedToUserId !== userId) {
            return { success: false, message: 'This promo code is not valid for your account.' };
        }

        if (!matchedCode.isActive || (matchedCode.expiresAt && new Date(matchedCode.expiresAt) < new Date())) {
            return { success: false, message: 'This promo code has expired.' };
        }

        if (matchedCode.usageCount >= matchedCode.usageLimit) {
            return { success: false, message: 'This promo code has reached its usage limit.' };
        }

        if (!matchedCode.applicableCourseIds.includes('all') && !matchedCode.applicableCourseIds.includes(courseId)) {
            return { success: false, message: 'This code is not valid for this course.' };
        }
        
        const isPrebooking = course.isPrebooking && course.prebookingEndDate && new Date(course.prebookingEndDate as string) > new Date();
        const hasDiscount = course.discountPrice && parseFloat(course.discountPrice.replace(/[^0-9.]/g, '')) > 0;
        
        const basePriceString = isPrebooking 
            ? course.prebookingPrice 
            : (hasDiscount ? course.discountPrice : course.price);

        const basePrice = parseFloat((basePriceString || '0').replace(/[^0-9.]/g, ''));

        let calculatedDiscount = 0;
        if (matchedCode.type === 'fixed') {
            calculatedDiscount = matchedCode.value;
        } else { // percentage
            calculatedDiscount = (basePrice * matchedCode.value) / 100;
        }

        return { success: true, discount: calculatedDiscount, message: 'Promo code applied successfully.' };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function savePromoCodeAction(promoData: Partial<PromoCode>) {
    try {
      // If the creator is not 'admin', it must be a teacher ID.
      // We need to verify the teacher's permissions.
      if (promoData.createdBy && promoData.createdBy !== 'admin') {
          const teacherId = promoData.createdBy;
          const instructor = await getInstructor(teacherId);
          if (!instructor) {
              throw new Error("Instructor profile not found.");
          }
          
          // Fetch the courses the teacher is actually assigned to
          const allCourses = await getCourses();
          const teacherCourses = allCourses.filter(course => 
              course.instructors?.some(i => i.slug === instructor.slug)
          );
          const teacherCourseIds = new Set(teacherCourses.map(c => c.id!));
  
          // When a teacher creates a code for "All My Courses", the FE sends ['all'].
          // We convert it to the actual list of course IDs here.
          if (promoData.applicableCourseIds?.includes('all')) {
              promoData.applicableCourseIds = Array.from(teacherCourseIds);
          } else {
              // If specific courses are selected, verify them.
              const unauthorizedCourses = promoData.applicableCourseIds?.filter(id => !teacherCourseIds.has(id));
              if (unauthorizedCourses && unauthorizedCourses.length > 0) {
                  throw new Error("You do not have permission to create promo codes for one or more selected courses.");
              }
          }
      }

      if (promoData.id) {
        await updatePromoCode(promoData.id, promoData);
      } else {
        await addPromoCode(promoData);
      }
      revalidatePath('/admin/promo-codes');
      revalidatePath('/teacher/promo-codes');
      return { success: true, message: 'Promo code saved successfully.' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
}

export async function deletePromoCodeAction(id: string) {
    try {
        await deletePromoCode(id);
        revalidatePath('/admin/promo-codes');
        revalidatePath('/teacher/promo-codes');
        return { success: true, message: 'Promo code deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
