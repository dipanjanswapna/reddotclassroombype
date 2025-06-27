
"use client";

import { useState } from "react";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { virtualTutorChatbot, VirtualTutorChatbotInput } from "@/ai/flows/virtual-tutor-chatbot";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from '@/components/ui/sidebar';
import { LayoutDashboard, BookOpen, HelpCircle, Award, User, Settings, LogOut, BarChart3, CalendarClock, GraduationCap, Library, BookMarked, MessageSquare, History, Heart, Bell, Wallet, Users as UsersIcon, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function TutorPage() {
  const [courseMaterial, setCourseMaterial] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAnswer("");

    try {
      const input: VirtualTutorChatbotInput = {
        courseMaterial,
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

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src="https://placehold.co/100x100" alt="Student Avatar" data-ai-hint="male student"/>
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Student Name</span>
              <span className="text-xs text-muted-foreground">student@rdc.com</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/student/dashboard">
                <LayoutDashboard />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <BookOpen />
                My Courses
              </SidebarMenuButton>
            </SidebarMenuItem>
              <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <CalendarClock />
                Upcoming Deadlines
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <GraduationCap />
                Grades & Feedback
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Library />
                Resources Library
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <HelpCircle />
                Interactive Quizzes
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <BookMarked />
                Study Planner
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <UsersIcon />
                Community Forum
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton href="/tutor" isActive>
                <Bot />
                Virtual Tutor
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Heart />
                Wishlist
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Wallet />
                Payment History
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Award />
                Certificates
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Trophy />
                Achievements
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Bell />
                Notifications
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <User />
                Profile & Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                 <UsersIcon />
                Guardian Management
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <MessageSquare />
                Help & Support
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/">
                <LogOut />
                Logout
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
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
                  Provide the relevant course material and your question below. The AI tutor will provide an answer based on the context.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="courseMaterial">Course Material</Label>
                    <Textarea
                      id="courseMaterial"
                      placeholder="Paste relevant paragraphs, lecture notes, or concepts here..."
                      value={courseMaterial}
                      onChange={(e) => setCourseMaterial(e.target.value)}
                      rows={8}
                      required
                    />
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
                  <Button type="submit" disabled={isLoading}>
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
      </SidebarInset>
    </SidebarProvider>
  );
}
