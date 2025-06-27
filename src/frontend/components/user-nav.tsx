
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, LogOut, Settings, User, BookOpen, HelpCircle } from "lucide-react";

type UserRole = 'student' | 'teacher' | 'guardian' | 'admin' | 'unknown';

const getUserDetails = (pathname: string) => {
  if (pathname.startsWith('/student')) {
    return {
      role: 'student' as UserRole,
      name: "Student Name",
      email: "student@rdc.com",
      avatar: "https://placehold.co/100x100.png",
      initials: "SN",
      dashboardLink: "/student/dashboard",
      aiHint: "male student"
    };
  }
  if (pathname.startsWith('/teacher')) {
    return {
      role: 'teacher' as UserRole,
      name: "Teacher Name",
      email: "teacher@rdc.com",
      avatar: "https://placehold.co/100x100.png",
      initials: "TN",
      dashboardLink: "/teacher/dashboard",
      aiHint: "male teacher"
    };
  }
   if (pathname.startsWith('/guardian')) {
    return {
      role: 'guardian' as UserRole,
      name: "Guardian Name",
      email: "guardian@rdc.com",
      avatar: "https://placehold.co/100x100.png",
      initials: "GN",
      dashboardLink: "/guardian/dashboard",
      aiHint: "parent"
    };
  }
   if (pathname.startsWith('/admin')) {
    return {
      role: 'admin' as UserRole,
      name: "Admin Name",
      email: "admin@rdc.com",
      avatar: "https://placehold.co/100x100.png",
      initials: "AN",
      dashboardLink: "/admin/dashboard",
      aiHint: "administrator"
    };
  }
  // Default fallback
  return {
      role: 'unknown' as UserRole,
      name: "User",
      email: "user@rdc.com",
      avatar: "https://placehold.co/100x100.png",
      initials: "U",
      dashboardLink: "/",
      aiHint: "person"
  };
};

export function UserNav() {
  const pathname = usePathname();
  const user = getUserDetails(pathname);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint={user.aiHint} />
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={user.dashboardLink}><LayoutDashboard className="mr-2" />My Dashboard</Link>
          </DropdownMenuItem>
          {user.role === 'student' && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/student/courses"><BookOpen className="mr-2" />My Courses</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                 <Link href="/student/profile"><User className="mr-2" />Profile & Settings</Link>
              </DropdownMenuItem>
            </>
          )}
           <DropdownMenuItem asChild>
             <Link href="/faq"><HelpCircle className="mr-2" />Help & Support</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/"><LogOut className="mr-2" />Log out</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
