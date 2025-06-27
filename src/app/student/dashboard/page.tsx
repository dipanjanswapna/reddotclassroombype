import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Award,
  Bot,
  User,
  Settings,
  LogOut,
  BarChart3,
  CalendarClock,
  GraduationCap,
  Library,
  BookMarked,
  MessageSquare,
  History,
  Heart,
  Bell,
  Wallet,
  Users,
  Trophy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex h-full bg-background">
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
                <SidebarMenuButton href="/student/dashboard" isActive>
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
                  <Users />
                  Community Forum
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton href="/tutor">
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
                   <Users />
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
                <div className="mb-6">
                    <h1 className="font-headline text-3xl font-bold tracking-tight">স্বাগতম, Student Name!</h1>
                    <p className="text-muted-foreground">আপনার পরবর্তী ক্লাস আজ সন্ধ্যা ৭টায়।</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">চলমান কোর্স</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-muted-foreground">আপনার শেখা চালিয়ে যান!</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">সামগ্রিক অগ্রগতি</CardTitle>
                             <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">68%</div>
                            <Progress value={68} className="mt-2 h-2 [&>div]:bg-accent" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">অর্জিত সার্টিফিকেট</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">আপনি সম্প্রতি একটি কোর্স সম্পন্ন করেছেন।</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="mt-8">
                  <h2 className="font-headline text-2xl font-bold mb-4">আপনার শেখা চালিয়ে যান</h2>
                   <div className="grid gap-6 md:grid-cols-2">
                      <Card className="flex flex-col">
                          <CardHeader>
                              <CardTitle>HSC 2025 ক্র্যাশ কোর্স - বিজ্ঞান</CardTitle>
                              <p className="text-sm text-muted-foreground pt-1">পরবর্তী লেসন: ভৌত বিজ্ঞান প্রথম পত্র</p>
                          </CardHeader>
                          <CardContent className="flex-grow">
                              <Progress value={80} className="mb-2 h-2 [&>div]:bg-accent" />
                              <p className="text-sm font-medium">80% সম্পন্ন</p>
                          </CardContent>
                          <div className="p-6 pt-0">
                            <Button className="w-full">কোর্স চালিয়ে যান</Button>
                          </div>
                      </Card>
                      <Card className="flex flex-col">
                          <CardHeader>
                              <CardTitle>IELTS Preparation Course</CardTitle>
                              <p className="text-sm text-muted-foreground pt-1">পরবর্তী লেসন: Speaking Test Practice</p>
                          </CardHeader>
                          <CardContent className="flex-grow">
                              <Progress value={55} className="mb-2 h-2 [&>div]:bg-accent" />
                              <p className="text-sm font-medium">55% সম্পন্ন</p>
                          </CardContent>
                           <div className="p-6 pt-0">
                            <Button className="w-full">কোর্স চালিয়ে যান</Button>
                          </div>
                      </Card>
                   </div>
                </div>
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
