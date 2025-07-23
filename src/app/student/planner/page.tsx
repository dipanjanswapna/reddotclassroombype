
'use client';

import { StudyPlannerClient } from '@/components/student/planner/study-planner-client';
import { useAuth } from '@/context/auth-context';
import { getEnrollmentsByUserId, getCoursesByIds } from '@/lib/firebase/firestore';
import { Course } from '@/lib/types';
import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { StudyPlanInput } from '@/ai/schemas/study-plan-schemas';

export default function StudentPlannerPage() {
    const { userInfo } = useAuth();
    const [loading, setLoading] = useState(true);
    const [plannerInput, setPlannerInput] = useState<StudyPlanInput | null>(null);

    useEffect(() => {
        if (userInfo) {
            const fetchCourseData = async () => {
                setLoading(true);
                try {
                    const enrollments = await getEnrollmentsByUserId(userInfo.uid);
                    const courseIds = enrollments.map(e => e.courseId);
                    const courses = await getCoursesByIds(courseIds);
                    
                    const deadlines = courses.flatMap(course => [
                        ...(course.assignments || []).filter(a => a.studentId === userInfo.uid).map(a => ({
                            courseTitle: course.title,
                            assignmentTitle: a.title,
                            deadline: a.deadline as string,
                        })),
                        ...(course.exams || []).filter(e => e.studentId === userInfo.uid).map(e => ({
                            courseTitle: course.title,
                            assignmentTitle: `Exam: ${e.title}`,
                            deadline: e.examDate as string,
                        }))
                    ]).filter(d => d.deadline);

                    const coursesInfo = courses.map(c => ({
                        id: c.id!,
                        title: c.title,
                        topics: c.syllabus?.map(s => s.title) || [],
                    }));
                    
                    const today = new Date();
                    const endDate = new Date();
                    endDate.setDate(today.getDate() + 30);
                    
                    setPlannerInput({
                        courses: coursesInfo,
                        deadlines: deadlines,
                        startDate: today.toISOString().split('T')[0],
                        endDate: endDate.toISOString().split('T')[0]
                    });

                } catch (error) {
                    console.error("Failed to fetch data for planner:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchCourseData();
        } else {
            setLoading(false);
        }
    }, [userInfo]);

    if (loading) {
        return <div className="flex h-[calc(100vh-8rem)] items-center justify-center"><LoadingSpinner /></div>;
    }

    if (!userInfo) {
        return <div>Please log in to use the planner.</div>;
    }
    
    return <StudyPlannerClient initialEvents={userInfo.studyPlan || []} plannerInput={plannerInput} />;
}
