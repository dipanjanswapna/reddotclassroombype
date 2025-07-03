
"use client";

import { useState, useEffect } from "react";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { virtualTutorChatbot, VirtualTutorChatbotInput } from "@/ai/flows/virtual-tutor-chatbot";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { getEnrollmentsByUserId, getCoursesByIds } from "@/lib/firebase/firestore";
import { Course } from "@/lib/types";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function VirtualTutorPage() {
  const { userInfo, loading: authLoading } = useAuth();
  
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isFetchingCourses, setIsFetchingCourses] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userInfo) return;

    const fetchCourses = async () => {
      setIsFetchingCourses(true);
      try {
        const enrollments = await getEnrollmentsByUserId(userInfo.uid);
        if (enrollments.length > 0) {
          const courseIds = enrollments.map(e => e.courseId);
          const courses = await getCoursesByIds(courseIds);
          setEnrolledCourses(courses);
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
        setError("Could not load your enrolled courses.");
      } finally {
        setIsFetchingCourses(false);
      }
    };
    fetchCourses();
  }, [userInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setError("Please select a course first.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnswer("");

    try {
      const input: VirtualTutorChatbotInput = {
        courseId: selectedCourseId,
        question,
      };
      const result = await virtualTutorChatbot(input);
      setAnswer(result.answer);
    } catch (err) {
      setError("An error occurred while getting the answer. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const pageLoading = authLoading || isFetchingCourses;

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Bot className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="font-headline text-4xl font-bold tracking-tight">Virtual Tutor</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Get instant help with your course material.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ask a Question</CardTitle>
            <CardDescription>
              Select a course and ask a question. The AI will provide an answer based on the course content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="course">Select a Course</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Choose a course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {enrolledCourses.length > 0 ? (
                      enrolledCourses.map(course => (
                        <SelectItem key={course.id} value={course.id!}>{course.title}</SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-sm text-muted-foreground">You are not enrolled in any courses.</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="question">Your Question</Label>
                <Textarea
                  id="question"
                  placeholder="What is the difference between server-side rendering and static site generation?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={3}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading || !selectedCourseId || !question}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Answer...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Ask Tutor
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {(isLoading || answer || error) && (
          <div className="mt-8">
            <h2 className="font-headline text-2xl font-bold mb-4">Tutor's Response</h2>
            <Card className="min-h-[10rem]">
              <CardContent className="p-6">
                {isLoading && (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                  </div>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {answer && <p className="whitespace-pre-wrap">{answer}</p>}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
