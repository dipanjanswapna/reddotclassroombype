
'use server';

import { revalidatePath } from 'next/cache';
import { saveAttendanceRecords, getUserByOfflineRoll, getBatch, getAttendanceRecordForStudentByDate, updateAttendanceRecord } from '@/lib/firebase/firestore';
import { AttendanceRecord } from '@/lib/types';

export async function saveAttendanceAction(
  batchId: string,
  courseId: string,
  branchId: string,
  attendanceData: { studentId: string; status: 'Present' | 'Absent' | 'Late' }[],
  teacherId: string,
) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // This action now performs an "upsert". It checks for existing records
    // for each student on the given day and updates it, or creates a new one.
    const recordsToUpsert = await Promise.all(attendanceData.map(async (data) => {
        const existingRecord = await getAttendanceRecordForStudentByDate(data.studentId, today);
        if (existingRecord) {
            return { id: existingRecord.id, update: { status: data.status, recordedBy: teacherId } };
        } else {
            return {
                create: {
                    ...data,
                    batchId,
                    courseId,
                    branchId,
                    date: today,
                    recordedBy: teacherId,
                    callStatus: 'Called',
                }
            };
        }
    }));
    
    await saveAttendanceRecords(recordsToUpsert);

    revalidatePath('/teacher/attendance');
    revalidatePath('/admin/offline-hub');
    revalidatePath('/guardian/attendance');
    revalidatePath('/student/my-courses/*');
    
    return { success: true, message: 'Attendance saved successfully.' };
  } catch (error: any) {
    console.error("Error in saveAttendanceAction: ", error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}

export async function markAttendanceByRollAction(rollNo: string, teacherId: string) {
    try {
        const student = await getUserByOfflineRoll(rollNo);

        if (!student) {
            return { success: false, message: `No student found with Roll No: ${rollNo}` };
        }

        if (!student.assignedBatchId) {
            return { success: false, message: `${student.name} is not assigned to any batch.` };
        }
        
        const batch = await getBatch(student.assignedBatchId);
        if (!batch) {
             return { success: false, message: `Could not find the batch for ${student.name}.` };
        }

        const today = new Date().toISOString().split('T')[0];
        
        const record: Omit<AttendanceRecord, 'id'> = {
            studentId: student.id!,
            batchId: batch.id!,
            courseId: batch.courseId,
            branchId: batch.branchId,
            date: today,
            status: 'Present',
            recordedBy: teacherId,
        };

        const existingRecord = await getAttendanceRecordForStudentByDate(student.id!, today);

        if (existingRecord) {
            await updateAttendanceRecord(existingRecord.id!, { status: 'Present', recordedBy: teacherId });
        } else {
            await saveAttendanceRecords([{ create: record }]);
        }

        revalidatePath('/admin/offline-hub');
        revalidatePath('/teacher/scan-attendance');

        return { success: true, message: `${student.name} (Roll: ${rollNo}) has been marked as present.` };

    } catch (error: any) {
        console.error("Error marking attendance by roll:", error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}

export async function updateAttendanceStatusAction(recordId: string, newStatus: AttendanceRecord['status'], adminId: string) {
    try {
        await updateAttendanceRecord(recordId, { status: newStatus, recordedBy: adminId });
        revalidatePath('/admin/offline-hub');
        return { success: true, message: 'Attendance status updated successfully.' };
    } catch(error: any) {
        console.error("Error updating attendance status:", error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}

export async function markCallAsCompletedAction(recordId: string) {
    try {
        await updateAttendanceRecord(recordId, { callStatus: 'Called' });
        revalidatePath('/admin/offline-hub');
        revalidatePath('/moderator/absent-students');
        revalidatePath('/affiliate/absent-students');
        revalidatePath('/seller/call-center');
        return { success: true, message: 'Call status updated successfully.' };
    } catch(error: any) {
        console.error("Error updating call status:", error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}
