
import { AbsentStudentCallCenter } from '@/components/absent-student-call-center';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Absent Student Call Center',
    description: 'Contact students who were absent from class today.',
};

export default function AdminAbsentStudentsPage() {
    return <AbsentStudentCallCenter />;
}
