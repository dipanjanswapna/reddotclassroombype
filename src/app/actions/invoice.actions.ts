

'use server';
import 'dotenv/config';

import { collection, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';
import type { Invoice, Enrollment, User, Course } from '@/lib/types';
import { removeUndefinedValues } from '@/lib/utils';
import { getCourse } from '@/lib/firebase/firestore';

function generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `RDC-INV-${year}${month}-${randomSuffix}`;
}

export async function createInvoiceAction(enrollment: Enrollment, user: User, course: Course): Promise<{ success: boolean; invoiceId?: string; message?: string }> {
    const db = getDbInstance();
    if (!db) {
        throw new Error('Database service is currently unavailable.');
    }
    
    if (!enrollment.id) {
         return { success: false, message: 'Cannot create invoice for an enrollment without an ID.' };
    }

    try {
        const netPayable = (enrollment.totalFee || 0) - (enrollment.discount || 0);
        const isCycleEnrollment = !!enrollment.cycleId;
        
        // Ensure we have the latest course data to find cycle info
        const freshCourseData = await getCourse(course.id!);
        const cycle = isCycleEnrollment ? freshCourseData?.cycles?.find(c => c.id === enrollment.cycleId) : null;
        
        // Determine the correct community URL
        const communityUrl = isCycleEnrollment ? cycle?.communityUrl : freshCourseData?.communityUrl;

        const newInvoiceData: Omit<Invoice, 'id'> = {
            enrollmentId: enrollment.id!,
            userId: user.uid,
            courseId: course.id!,
            invoiceNumber: generateInvoiceNumber(),
            status: 'VALID',
            coupon: enrollment.discount ? 'DISCOUNT' : undefined,
            invoiceDate: enrollment.enrollmentDate, // Use enrollment date for consistency
            studentDetails: {
                name: user.name,
                rdcId: user.registrationNumber || 'N/A',
                phone: user.mobileNumber || 'N/A',
                email: user.email,
                guardianName: user.fathersName || undefined,
                className: user.className || undefined,
                nai: user.nidNumber || undefined,
            },
            courseDetails: {
                name: course.title,
                type: course.type || 'Online',
                cycleName: isCycleEnrollment ? cycle?.title : undefined,
                communityUrl: communityUrl,
            },
            paymentDetails: {
                method: enrollment.paymentMethod || 'Online',
                date: Timestamp.now(), // Use current time for payment date
                transactionId: `TRX-${enrollment.id!.slice(0,8).toUpperCase()}`, // Example transaction ID
            },
            financialSummary: {
                totalFee: enrollment.totalFee || 0,
                discount: enrollment.discount || 0,
                netPayable: netPayable,
                amountPaid: enrollment.paidAmount || 0,
                dueAmount: (enrollment.dueAmount !== undefined) ? enrollment.dueAmount : (netPayable - (enrollment.paidAmount || 0)),
            },
            generatedBy: enrollment.enrolledBy || 'system',
            createdAt: Timestamp.now(),
        };

        const cleanInvoiceData = removeUndefinedValues(newInvoiceData);
        
        const invoiceRef = await addDoc(collection(db, 'invoices'), cleanInvoiceData);
        
        // Also update the enrollment with the invoice ID for future reference
        await updateDoc(doc(db, 'enrollments', enrollment.id!), { invoiceId: invoiceRef.id });

        return { success: true, invoiceId: invoiceRef.id };
    } catch (error: any) {
        console.error("Error creating invoice:", error);
        return { success: false, message: error.message };
    }
}

export async function updateInvoiceAction(invoiceId: string, data: Partial<Invoice>): Promise<{ success: boolean; message?: string }> {
    const db = getDbInstance();
    if (!db) throw new Error('Database service is currently unavailable.');
    
    try {
        const invoiceRef = doc(db, 'invoices', invoiceId);
        await updateDoc(invoiceRef, data);
        return { success: true, message: 'Invoice updated successfully.' };
    } catch(error: any) {
        console.error("Error updating invoice:", error);
        return { success: false, message: error.message };
    }
}
