

'use server';
import 'dotenv/config';

import { revalidatePath } from 'next/cache';
import { addReportedContent, getCourse, updateCourse, updateReportedContent } from '@/lib/firebase/firestore';
import { ReportedContent, Review, Course } from '@/lib/types';
import { Timestamp, doc, writeBatch } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';

export async function reportReviewAction(
    courseId: string,
    review: Review,
    reporterId: string
) {
    try {
        if (!review.user.userId) {
            throw new Error("Cannot report a review without a user ID.");
        }

        const course = await getCourse(courseId);
        if (!course) throw new Error("Course not found");

        const reportData: Omit<ReportedContent, 'id'> = {
            contentType: 'review',
            contentId: review.id,
            courseId: courseId,
            courseTitle: course.title,
            reporterId: reporterId,
            reportedUserId: review.user.userId,
            contentSnapshot: review.comment,
            status: 'pending',
            createdAt: Timestamp.now(),
        };

        await addReportedContent(reportData);

        // Also mark the review as reported on the course itself for quick UI feedback
        const updatedReviews = course.reviewsData?.map(r => 
            r.id === review.id ? { ...r, isReported: true } : r
        );

        if(updatedReviews) {
            await updateCourse(courseId, { reviewsData: updatedReviews });
        }
        
        revalidatePath(`/courses/${courseId}`);

        return { success: true, message: 'Review reported successfully. Our moderators will review it shortly.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function dismissReportAction(reportId: string, moderatorId: string) {
    try {
        await updateReportedContent(reportId, {
            status: 'resolved',
            actionTaken: 'dismissed',
            resolverId: moderatorId,
            resolvedAt: Timestamp.now(),
        });
        revalidatePath('/moderator/content-review');
        return { success: true, message: 'Report dismissed.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteReportedReviewAction(reportId: string, courseId: string, reviewId: string, moderatorId: string) {
    const db = getDbInstance();
    if (!db) {
        throw new Error('Database service is currently unavailable.');
    }
     try {
        const course = await getCourse(courseId);
        if (!course) throw new Error("Course not found.");

        const reviewToDelete = course.reviewsData?.find(r => r.id === reviewId);
        if (!reviewToDelete) {
            // Review already deleted, just resolve the report
            await updateReportedContent(reportId, {
                status: 'resolved',
                actionTaken: 'content_deleted',
                resolverId: moderatorId,
                resolvedAt: Timestamp.now(),
            });
             revalidatePath('/moderator/content-review');
            return { success: true, message: 'Review was already deleted. Report resolved.' };
        }
        
        const updatedReviews = course.reviewsData?.filter(r => r.id !== reviewId);
        
        const currentRating = course.rating || 0;
        const reviewCount = course.reviews || 0;
        const newReviewCount = Math.max(0, reviewCount - 1);
        
        let newRating = 0;
        if (newReviewCount > 0) {
            newRating = ((currentRating * reviewCount) - reviewToDelete.rating) / newReviewCount;
        }

        const courseRef = doc(db, 'courses', courseId);
        const reportRef = doc(db, 'reported_content', reportId);

        const batch = writeBatch(db);

        batch.update(courseRef, {
            reviewsData: updatedReviews,
            reviews: newReviewCount,
            rating: parseFloat(newRating.toFixed(2)),
        });
        batch.update(reportRef, {
            status: 'resolved',
            actionTaken: 'content_deleted',
            resolverId: moderatorId,
            resolvedAt: Timestamp.now(),
        });
        
        await batch.commit();

        revalidatePath('/moderator/content-review');
        revalidatePath(`/courses/${courseId}`);

        return { success: true, message: 'Review deleted and report resolved.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
