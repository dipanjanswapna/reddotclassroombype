'use server';

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Invoice, Enrollment, User, Course } from '@/lib/types';

function generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `RDC-INV-${year}${month}-${randomSuffix}`;
}

export async function createInvoiceAction(enrollment: Enrollment, user: User, course: Course): Promise<{ success: boolean; invoiceId?: string; message?: string }> {
    try {
        const newInvoice: Omit<Invoice, 'id'> = {
            enrollmentId: enrollment.id!,
            userId: user.uid,
            courseId: course.id!,
            invoiceNumber: generateInvoiceNumber(),
            invoiceDate: Timestamp.now(),
            studentDetails: {
                name: user.name,
                rdcId: user.registrationNumber || 'N/A',
                phone: user.mobileNumber || 'N/A',
                email: user.email,
                guardianName: user.fathersName || 'N/A',
            },
            courseDetails: {
                name: course.title,
                type: course.type || 'Online',
                cycleName: enrollment.cycleId ? course.cycles?.find(c => c.id === enrollment.cycleId)?.title : undefined,
            },
            paymentDetails: {
                method: enrollment.paymentMethod || 'Online',
                date: enrollment.enrollmentDate,
                transactionId: `TRX-${enrollment.id!.slice(0,8).toUpperCase()}`, // Example transaction ID
            },
            financialSummary: {
                totalFee: enrollment.totalFee || parseFloat(course.price.replace(/[^0-9.]/g, '')),
                discount: enrollment.discount || 0,
                netPayable: (enrollment.totalFee || parseFloat(course.price.replace(/[^0-9.]/g, ''))) - (enrollment.discount || 0),
                amountPaid: enrollment.paidAmount || 0,
                dueAmount: enrollment.dueAmount || 0,
            },
            generatedBy: enrollment.enrolledBy || 'system',
            createdAt: Timestamp.now(),
        };

        const invoiceRef = await addDoc(collection(db, 'invoices'), newInvoice);
        return { success: true, invoiceId: invoiceRef.id };
    } catch (error: any) {
        console.error("Error creating invoice:", error);
        return { success: false, message: error.message };
    }
}
