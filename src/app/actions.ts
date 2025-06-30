

'use server';

import { revalidatePath } from 'next/cache';
import { 
    addCourse, 
    updateCourse, 
    deleteCourse,
    updateHomepageConfig,
    addUser,
    updateUser,
    deleteUser,
    addInstructor,
    updateInstructor,
    addOrganization,
    updateOrganization,
    getCourse,
    getPromoCodeByCode,
    addSupportTicket,
    getSupportTicket,
    updateSupportTicket,
    addPromoCode,
    updatePromoCode,
    deletePromoCode,
    getUser,
    getUsers,
    deleteOrganization,
    deleteInstructor,
} from '@/lib/firebase/firestore';
import { Course, User, Instructor, Organization, SupportTicket, PromoCode } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

export async function saveCourseAction(courseData: Partial<Course>) {
  try {
    if (courseData.id) {
      await updateCourse(courseData.id, courseData);
      revalidatePath('/admin/courses');
      revalidatePath(`/admin/courses/builder/${courseData.id}`);
      revalidatePath('/teacher/courses');
      revalidatePath(`/teacher/courses/builder/${courseData.id}`);
      revalidatePath('/partner/courses');
      revalidatePath(`/partner/courses/builder/${courseData.id}`);
      revalidatePath(`/courses/${courseData.id}`);
      return { success: true, message: 'Course updated successfully.' };
    } else {
      const newCourseRef = await addCourse(courseData);
      revalidatePath('/admin/courses');
      revalidatePath('/teacher/courses');
      revalidatePath('/partner/courses');
      return { success: true, message: 'Course created successfully.', courseId: newCourseRef.id };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteCourseAction(id: string) {
    try {
        await deleteCourse(id);
        revalidatePath('/admin/courses');
        revalidatePath('/teacher/courses');
        revalidatePath('/partner/courses');
        return { success: true, message: 'Course deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function saveHomepageConfigAction(config: any) {
    try {
        await updateHomepageConfig(config);
        revalidatePath('/admin/homepage');
        revalidatePath('/');
        return { success: true, message: 'Homepage configuration updated successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

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

export async function createInstructorAction(data: Partial<Instructor>) {
    try {
        const newInstructor = {
            ...data,
            status: 'Pending Approval',
        };
        await addInstructor(newInstructor);
        revalidatePath('/auth/teacher-signup');
        revalidatePath('/admin/teachers');
        return { success: true, message: 'Application submitted successfully! Our team will review it and get back to you shortly.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updateInstructorStatusAction(id: string, status: Instructor['status']) {
    try {
        await updateInstructor(id, { status });
        revalidatePath('/admin/teachers');
        return { success: true, message: 'Instructor status updated.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function saveInstructorProfileAction(id: string, data: Partial<Instructor>) {
    try {
        await updateInstructor(id, data);
        revalidatePath(`/teacher/profile`);
        if (data.slug) {
            revalidatePath(`/teachers/${data.slug}`);
        }
        return { success: true, message: 'Profile updated successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updateOrganizationStatusAction(id: string, status: Organization['status']) {
    try {
        await updateOrganization(id, { status });
        revalidatePath('/admin/partners');
        return { success: true, message: 'Organization status updated.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function savePartnerBrandingAction(id: string, data: Partial<Organization>) {
    try {
        await updateOrganization(id, data);
        revalidatePath(`/partner/branding`);
        if (data.subdomain) {
            revalidatePath(`/sites/${data.subdomain}`);
        }
        return { success: true, message: 'Branding updated successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function inviteInstructorAction(data: Partial<Instructor>) {
    try {
        const newInstructor = {
            ...data,
            status: 'Pending Approval',
        };
        await addInstructor(newInstructor);
        revalidatePath('/partner/teachers');
        return { success: true, message: 'Invitation sent successfully!' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function removeInstructorFromOrgAction(id: string) {
    try {
        await updateInstructor(id, { organizationId: '' });
        revalidatePath('/partner/teachers');
        return { success: true, message: 'Instructor removed from organization.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function linkGuardianAction(studentId: string, guardianEmail: string) {
    try {
        const allUsers = await getUsers();
        let guardian = allUsers.find(u => u.email === guardianEmail && u.role === 'Guardian');

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


export async function gradeAssignmentAction(
    courseId: string, 
    studentId: string,
    assignmentId: string, 
    grade: string,
    feedback: string
) {
    try {
        const course = await getCourse(courseId);
        if (!course || !course.assignments) {
            throw new Error("Course or assignments not found.");
        }

        const updatedAssignments = course.assignments.map(assignment => {
            if (assignment.id === assignmentId && assignment.studentId === studentId) {
                return {
                    ...assignment,
                    status: 'Graded' as const,
                    grade,
                    feedback
                };
            }
            return assignment;
        });

        await updateCourse(courseId, { assignments: updatedAssignments });
        revalidatePath(`/teacher/grading`);
        revalidatePath(`/student/my-courses/${courseId}/assignments`);
        return { success: true, message: 'Assignment graded successfully.' };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function applyPromoCodeAction(courseId: string, promoCode: string) {
    try {
        const course = await getCourse(courseId);
        if (!course) {
            return { success: false, message: 'Course not found.' };
        }

        const matchedCode = await getPromoCodeByCode(promoCode);
        if (!matchedCode) {
            return { success: false, message: 'Invalid promo code.' };
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
        const originalPrice = parseFloat((isPrebooking && course.prebookingPrice ? course.prebookingPrice : course.price).replace(/[^0-9.]/g, ''));

        let calculatedDiscount = 0;
        if (matchedCode.type === 'fixed') {
            calculatedDiscount = matchedCode.value;
        } else { // percentage
            calculatedDiscount = (originalPrice * matchedCode.value) / 100;
        }

        return { success: true, discount: calculatedDiscount, message: 'Promo code applied successfully.' };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}


export async function createSupportTicketAction(data: { subject: string, description: string, userId: string, userName: string }) {
    try {
        const newTicket: Omit<SupportTicket, 'id'> = {
            ...data,
            status: 'Open',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            replies: []
        };
        await addSupportTicket(newTicket);
        revalidatePath('/student/tickets');
        revalidatePath('/moderator/support-tickets');
        return { success: true, message: 'Support ticket created successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function replyToSupportTicketAction(ticketId: string, replyMessage: string) {
    try {
        const ticket = await getSupportTicket(ticketId);
        if (!ticket) {
            throw new Error("Ticket not found.");
        }
        
        const newReply = {
            author: 'Support' as const,
            message: replyMessage,
            date: Timestamp.now()
        };

        const updatedReplies = [...ticket.replies, newReply];

        await updateSupportTicket(ticketId, { 
            replies: updatedReplies,
            status: 'In Progress',
            updatedAt: Timestamp.now()
        });

        revalidatePath('/moderator/support-tickets');
        return { success: true, message: 'Reply sent successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function closeSupportTicketAction(ticketId: string) {
    try {
        await updateSupportTicket(ticketId, { 
            status: 'Closed',
            updatedAt: Timestamp.now()
        });
        revalidatePath('/moderator/support-tickets');
        return { success: true, message: 'Ticket closed.' };
    } catch(error: any) {
        return { success: false, message: error.message };
    }
}

export async function savePromoCodeAction(promoData: Partial<PromoCode>) {
    try {
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

export async function applyForPartnershipAction(data: Omit<Organization, 'id' | 'status'>) {
    try {
        const newPartnerData: Partial<Organization> = {
            ...data,
            status: 'pending'
        };
        await addOrganization(newPartnerData);
        return { success: true, message: 'Application submitted successfully! Our team will review it and get back to you shortly.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}


export async function invitePartnerAction(data: Omit<Organization, 'id' | 'status'>) {
    try {
        const newPartnerData: Partial<Organization> = {
            ...data,
            status: 'approved'
        };
        await addOrganization(newPartnerData);
        revalidatePath('/admin/partners');
        return { success: true, message: 'Partner invited and approved successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteOrganizationAction(id: string) {
    try {
        await deleteOrganization(id);
        revalidatePath('/admin/partners');
        return { success: true, message: 'Partner organization deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function adminInviteInstructorAction(data: Partial<Instructor>) {
    try {
        const newInstructor = {
            ...data,
            status: 'Approved',
            slug: (data.name || '').toLowerCase().replace(/\s+/g, '-'),
            avatarUrl: `https://placehold.co/100x100.png?text=${(data.name || '').split(' ').map(n=>n[0]).join('')}`,
            dataAiHint: 'person teacher'
        };
        await addInstructor(newInstructor);
        revalidatePath('/admin/teachers');
        return { success: true, message: 'Teacher invited and approved successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteInstructorAction(id: string) {
    try {
        await deleteInstructor(id);
        revalidatePath('/admin/teachers');
        return { success: true, message: 'Instructor deleted successfully.' };
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
      revalidatePath('/courses');
      // Revalidate other pages where CourseCard might be used if necessary
      return { success: true, isInWishlist: !isInWishlist };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
}
