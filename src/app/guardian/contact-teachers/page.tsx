

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/auth-context';
import { getCourses, getEnrollmentsByUserId, getInstructors } from '@/lib/firebase/firestore';
import type { Course, Instructor } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { createSupportTicketAction } from '@/app/actions/support.actions';

type TeacherOption = {
    name: string;
    course: string;
};

export default function GuardianContactPage() {
    const { toast } = useToast();
    const { userInfo: guardian, loading: authLoading } = useAuth();
    const [instructors, setInstructors] = useState<TeacherOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (authLoading || !guardian?.linkedStudentId) {
            if (!authLoading) setLoading(false);
            return;
        }

        const fetchTeachers = async () => {
            try {
                const [allCourses, allInstructors, enrollments] = await Promise.all([
                    getCourses(),
                    getInstructors(),
                    getEnrollmentsByUserId(guardian.linkedStudentId!)
                ]);

                const enrolledCourseIds = enrollments.map(e => e.courseId);
                const enrolledCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id!));
                
                const teacherOptions: TeacherOption[] = [];
                const addedTeachers = new Set<string>();

                enrolledCourses.forEach(course => {
                    course.instructors.forEach(instructor => {
                        const uniqueKey = `${instructor.name}-${course.title}`;
                        if (!addedTeachers.has(uniqueKey)) {
                            teacherOptions.push({ name: instructor.name, course: course.title });
                            addedTeachers.add(uniqueKey);
                        }
                    });
                });
                setInstructors(teacherOptions);
            } catch (error) {
                console.error("Failed to fetch teachers:", error);
                toast({ title: "Error", description: "Could not load teacher list." });
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
    }, [authLoading, guardian, toast]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeacher || !subject || !message || !guardian) {
            toast({ title: 'Error', description: 'Please fill out all fields.', variant: 'destructive' });
            return;
        }
        setIsSending(true);
        
        const result = await createSupportTicketAction({
            subject: `Message for Teacher: ${subject}`,
            description: message,
            userId: guardian.uid,
            userName: guardian.name,
            category: 'Guardian Inquiry',
            recipient: selectedTeacher,
        });

        if (result.success) {
            toast({
                title: "Message Sent!",
                description: `Your message regarding ${selectedTeacher} has been sent. Our support team will coordinate.`
            });
            setSelectedTeacher('');
            setSubject('');
            setMessage('');
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
        setIsSending(false);
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Contact Teachers</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Send a message directly to your child's course instructors.
                </p>
            </div>
            
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageSquare /> New Message</CardTitle>
                    <CardDescription>Select an instructor and compose your message below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={handleSendMessage}>
                        <div className="space-y-2">
                            <Label htmlFor="instructor">To</Label>
                            <Select value={selectedTeacher} onValueChange={setSelectedTeacher} required>
                                <SelectTrigger id="instructor">
                                    <SelectValue placeholder="Select an instructor..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {instructors.map((teacher, index) => (
                                        <SelectItem key={index} value={`${teacher.name} (${teacher.course})`}>
                                            {teacher.name} <span className="text-muted-foreground ml-2">({teacher.course})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Question about Physics homework" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message here..." rows={6} required/>
                        </div>
                        <Button type="submit" disabled={isSending}>
                            {isSending ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Send Message
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
