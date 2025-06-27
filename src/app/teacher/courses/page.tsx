
import Link from 'next/link';
import {
  BookCopy,
  Users,
  MessageSquare,
  LayoutDashboard,
  Video,
  DollarSign,
  User,
  Settings,
  LogOut,
  PlusCircle,
  Pencil,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { courses } from '@/lib/mock-data';

// For demo, we'll just show courses by 'Jubayer Ahmed'
const teacherCourses = courses.filter(course => course.instructor.name === 'Jubayer Ahmed');

export default function TeacherCoursesPage() {
  return (
    <SidebarProvider>
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage
                  src="https://placehold.co/100x100.png"
                  alt="Teacher Avatar"
                  data-ai-hint="male teacher"
                />
                <AvatarFallback>TA</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Teacher Name</span>
                <span className="text-xs text-muted-foreground">
                  teacher@rdc.com
                </span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/teacher/dashboard">
                  <LayoutDashboard />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/teacher/courses" isActive>
                  <BookCopy />
                  My Courses
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#">
                  <Users />
                  Students
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#">
                  <MessageSquare />
                  Grading
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#">
                  <Video />
                  Live Classes
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#">
                  <DollarSign />
                  Earnings
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">
                        My Courses
                    </h1>
                    <p className="mt-1 text-lg text-muted-foreground">
                        Manage your created and co-authored courses.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/teacher/courses/builder">
                        <PlusCircle className="mr-2" />
                        Create New Course
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Your Courses</CardTitle>
                    <CardDescription>A list of courses you are managing.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Students</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teacherCourses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell className="font-medium">{course.title}</TableCell>
                                    <TableCell>{course.price}</TableCell>
                                    <TableCell>{(course.reviews || 0) * 10 + 5}</TableCell>
                                    <TableCell>
                                        <Badge className={course.id === '1' ? 'bg-yellow-500 text-black hover:bg-yellow-600' : 'bg-green-500 text-white hover:bg-green-600'}>
                                            {course.id === '1' ? 'Pending Approval' : 'Published'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/teacher/courses/builder">
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
