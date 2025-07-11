
'use server';

import { collection, addDoc, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Invoice, Enrollment, User, Course } from '@/lib/types';
import { removeUndefinedValues } from '@/lib/utils';
import { getOrganization } from '@/lib/firebase/firestore';

function generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `RDC-INV-${year}${month}-${randomSuffix}`;
}

export async function createInvoiceAction(enrollment: Enrollment, user: User, course: Course): Promise<{ success: boolean; invoiceId?: string; message?: string }> {
    try {
        const netPayable = (enrollment.totalFee || 0) - (enrollment.discount || 0);

        const newInvoiceData: Omit<Invoice, 'id'> = {
            enrollmentId: enrollment.id!,
            userId: user.uid,
            courseId: course.id!,
            invoiceNumber: generateInvoiceNumber(),
            invoiceDate: enrollment.enrollmentDate, // Use enrollment date for consistency
            status: 'VALID',
            coupon: enrollment.discount ? 'DISCOUNT' : undefined,
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
                cycleName: enrollment.cycleId ? course.cycles?.find(c => c.id === enrollment.cycleId)?.title : undefined,
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
