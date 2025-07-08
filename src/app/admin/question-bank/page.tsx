
import { QuestionBankClient } from '@/components/admin/question-bank-client';
import { getQuestionBank } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Question Bank Management',
    description: 'Create, edit, and manage all exam questions for the platform.',
};

export default async function AdminQuestionBankPage() {
    const questions = await getQuestionBank();
    const subjects = [...new Set(questions.map(q => q.subject).filter(Boolean))] as string[];
    const chapters = [...new Set(questions.map(q => q.chapter).filter(Boolean))] as string[];
    
    return <QuestionBankClient 
        initialQuestions={questions}
        subjects={subjects}
        chapters={chapters}
    />;
}
