
'use server';

import { revalidatePath } from 'next/cache';
import { saveAttendanceRecords, getUserByOfflineRoll, getBatch } from '@/lib/firebase/firestore';
import { AttendanceRecord } from '@/lib/types';
import { auth } from '@/lib/firebase/config';
import { getAuth } from "firebase-admin/auth";
import { adminApp } from '@/lib/firebase/admin-config';

export async function saveAttendanceAction(
  batchId: string,
  courseId: string,
  branchId: string,
  attendanceData: { studentId: string; status: 'Present' | 'Absent' | 'Late' }[],
  teacherId: string,
) {
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const recordsToSave: Omit<AttendanceRecord, 'id'>[] = attendanceData.map(data => ({
      ...data,
      batchId,
      courseId,
      branchId,
      date: today,
      recordedBy: teacherId,
    }));

    await saveAttendanceRecords(recordsToSave);

    revalidatePath('/teacher/attendance');
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

        await saveAttendanceRecords([record]);

        return { success: true, message: `${student.name} (Roll: ${rollNo}) has been marked as present.` };

    } catch (error: any) {
        console.error("Error marking attendance by roll:", error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}
