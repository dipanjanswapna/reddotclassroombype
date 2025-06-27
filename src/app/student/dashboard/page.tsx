
import {
  BookOpen,
  Award,
  BarChart3,
  CalendarCheck,
  Clock,
  Trophy,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const recentAchievements = [
    { title: "Course Complete: HSC Physics", icon: Award },
    { title: "Perfect Score: Math Quiz", icon: Trophy },
    { title: "5 Day Streak", icon: CalendarCheck },
  ];

  const upcomingDeadlines = [
    { title: "Chemistry Assignment 2", course: "HSC 2025 Crash Course", due: "3 days" },
    { title: "Physics Model Test 1", course: "HSC 2025 Crash Course", due: "5 days" },
    { title: "Speaking Practice Task", course: "IELTS Preparation", due: "1 week" },
  ];

  return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          <div className="mb-6">
              <h1 className="font-headline text-3xl font-bold tracking-tight">স্বাগতম, Student Name!</h1>
              <p className="text-muted-foreground">আপনার পরবর্তী ক্লাস আজ সন্ধ্যা ৭টায়। শুরু করার জন্য প্রস্তুত হন!</p>
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
          
          <div>
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

          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>আসন্ন ডেডলাইন</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/student/deadlines">
                    সব দেখুন <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {upcomingDeadlines.map((deadline, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <CalendarCheck className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">{deadline.title}</p>
                        <p className="text-sm text-muted-foreground">{deadline.course}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock className="h-3 w-3"/>
                        {deadline.due}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>সাম্প্রতিক অর্জন</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/student/achievements">
                    সব দেখুন <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {recentAchievements.map((achievement, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-2 p-2 text-sm border-dashed">
                      <achievement.icon className="h-4 w-4 text-yellow-500" />
                      <span>{achievement.title}</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

      </div>
  );
}
