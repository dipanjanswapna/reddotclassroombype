
'use server';

import { revalidatePath } from 'next/cache';
import { saveAttendanceRecords } from '@/lib/firebase/firestore';
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
