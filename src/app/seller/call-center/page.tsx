
import { AbsentStudentCallCenter } from '@/components/absent-student-call-center';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Student Call Center',
    description: 'Contact absent students or perform monthly counseling.',
};

export default function SellerCallCenterPage() {
    return <AbsentStudentCallCenter />;
}
