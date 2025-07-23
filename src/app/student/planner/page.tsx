
'use client';

import { StudyPlannerClient } from '@/components/student/planner/study-planner-client';
import { useAuth } from '@/context/auth-context';
import { getEnrollmentsByUserId, getCoursesByIds } from '@/lib/firebase/firestore';
import { Course } from '@/lib/types';
import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { StudyPlanEvent } from '@/lib/types';
import { safeToDate } from '@/lib/utils';
import { format } from 'date-fns';

export default function StudentPlannerPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<StudyPlanEvent[]>([]);

    useEffect(() => {
        if (authLoading) return;
        if (!userInfo) {
            setLoading(false);
            return;
        }

        const fetchCourseData = async () => {
            setLoading(true);
            try {
                const enrollments = await getEnrollmentsByUserId(userInfo.uid);
                const courseIds = enrollments.map(e => e.courseId);
                const courses = await getCoursesByIds(courseIds);
                
                // Events from course data
                const assignmentEvents: StudyPlanEvent[] = courses.flatMap(course => 
                    (course.assignments || [])
                    .filter(a => a.studentId === userInfo.uid && a.deadline)
                    .map(a => ({
                        id: `as_${a.id}`,
                        date: format(safeToDate(a.deadline), 'yyyy-MM-dd'),
                        title: `Deadline: ${a.title}`,
                        type: 'assignment-deadline' as const,
                        courseTitle: course.title,
                        priority: 'High'
                    }))
                );

                const examEvents: StudyPlanEvent[] = courses.flatMap(course => 
                    (course.exams || [])
                    .filter(e => e.studentId === userInfo.uid && e.examDate)
                    .map(e => ({
                        id: `ex_${e.id}`,
                        date: format(safeToDate(e.examDate), 'yyyy-MM-dd'),
                        title: `Exam: ${e.title}`,
                        type: 'exam-prep' as const,
                        courseTitle: course.title,
                        priority: 'High'
                    }))
                );

                const liveClassEvents: StudyPlanEvent[] = courses.flatMap(course => 
                    (course.liveClasses || [])
                    .filter(lc => lc.date)
                    .map(lc => ({
                        id: `lc_${lc.id}`,
                        date: lc.date,
                        time: lc.time,
                        title: `Live Class: ${lc.topic}`,
                        type: 'live-class' as const,
                        courseTitle: course.title,
                        priority: 'Medium'
                    }))
                );
                
                // User's manually created events (study sessions)
                const manualEvents = (userInfo.studyPlan || []);
                
                // Combine and remove duplicates, giving preference to manual events
                const allEvents = [...manualEvents, ...assignmentEvents, ...examEvents, ...liveClassEvents];
                const uniqueEvents = Array.from(new Map(allEvents.map(event => [event.id, event])).values());
                
                setEvents(uniqueEvents);

            } catch (error) {
                console.error("Failed to fetch data for planner:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [userInfo, authLoading]);

    if (loading) {
        return <div className="flex h-[calc(100vh-8rem)] items-center justify-center"><LoadingSpinner /></div>;
    }

    if (!userInfo) {
        return <div>Please log in to use the planner.</div>;
    }
    
    return <StudyPlannerClient initialEvents={events} plannerInput={null} />;
}
