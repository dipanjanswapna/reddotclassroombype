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
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
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
                <SidebarMenuButton href="#" isActive>
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
                  <HelpCircle />
                  Interactive Quizzes
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#">
                  <Award />
                  Certificates
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton href="/tutor">
                  <Bot />
                  Virtual Tutor
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="#">
                  <User />
                  Profile
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#">
                  <Settings />
                  Settings
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#">
                  <LogOut />
                  Logout
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <div className="p-4 sm:p-6 lg:p-8">
                <h1 className="font-headline text-3xl font-bold tracking-tight mb-6">Student Dashboard</h1>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Courses in Progress</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-muted-foreground">Keep up the great work!</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                             <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">68%</div>
                            <Progress value={68} className="mt-2 h-2" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Certificates Earned</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">You completed a course recently.</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="mt-8">
                  <h2 className="font-headline text-2xl font-bold mb-4">Continue Learning</h2>
                   <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                          <CardHeader>
                              <CardTitle>Advanced Web Development</CardTitle>
                          </CardHeader>
                          <CardContent>
                              <p className="text-sm text-muted-foreground mb-2">Next lesson: Backend with Node.js & Express</p>
                              <Progress value={80} className="mb-2 h-2" />
                              <p className="text-sm font-medium">80% Complete</p>
                          </CardContent>
                      </Card>
                      <Card>
                          <CardHeader>
                              <CardTitle>IELTS Preparation Course</CardTitle>
                          </CardHeader>
                          <CardContent>
                              <p className="text-sm text-muted-foreground mb-2">Next lesson: Speaking Test Practice</p>
                              <Progress value={55} className="mb-2 h-2" />
                              <p className="text-sm font-medium">55% Complete</p>
                          </CardContent>
                      </Card>
                   </div>
                </div>
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
