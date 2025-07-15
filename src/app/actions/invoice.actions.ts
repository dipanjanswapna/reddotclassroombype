

'use server';
import 'dotenv/config';

import { collection, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';
import type { Invoice, Enrollment, User, Course } from '@/lib/types';
import { removeUndefinedValues } from '@/lib/utils';

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
    try {
        const netPayable = (enrollment.totalFee || 0) - (enrollment.discount || 0);
        const isCycleEnrollment = !!enrollment.cycleId;
        const cycle = isCycleEnrollment ? course.cycles?.find(c => c.id === enrollment.cycleId) : null;
        
        // Determine the correct community URL
        // 1. Check for a cycle-specific URL first.
        // 2. If not found or not a cycle enrollment, use the main course community URL.
        const communityUrl = isCycleEnrollment ? cycle?.communityUrl : course.communityUrl;


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
                date: enrollment.enrollmentDate, // Use enrollment date as payment date
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
