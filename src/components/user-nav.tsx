

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
import { getOrganizations, getInstructors, getUsers } from "@/lib/firebase/firestore";
import { useState, useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

type UserRole = 'student' | 'teacher' | 'guardian' | 'admin' | 'partner' | 'affiliate' | 'moderator' | 'unknown';

type UserDetails = {
    role: UserRole;
    name: string;
    email: string;
    avatar: string;
    initials: string;
    dashboardLink: string;
    profileLink: string;
    aiHint: string;
};

export function UserNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserDetails | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
        let userDetails: UserDetails | null = null;
        
        try {
            if (pathname.startsWith('/student')) {
                const users = await getUsers();
                const studentUser = users.find(u => u.role === 'Student');
                userDetails = {
                    role: 'student',
                    name: studentUser?.name || "Student Name",
                    email: studentUser?.email || "student@rdc.com",
                    avatar: "https://placehold.co/100x100.png",
                    initials: studentUser?.name.split(' ').map(n => n[0]).join('') || "SN",
                    dashboardLink: "/student/dashboard",
                    profileLink: "/student/profile",
                    aiHint: "male student"
                };
            } else if (pathname.startsWith('/teacher')) {
                const instructors = await getInstructors();
                const user = instructors.find(i => i.id === 'ins-ja'); // mock logic
                userDetails = {
                    role: 'teacher',
                    name: user?.name || "Teacher Name",
                    email: "teacher@rdc.com",
                    avatar: user?.avatarUrl || "https://placehold.co/100x100.png",
                    initials: user?.name.split(' ').map(n => n[0]).join('') || "TN",
                    dashboardLink: "/teacher/dashboard",
                    profileLink: "/teacher/settings",
                    aiHint: "male teacher"
                };
            } else if (pathname.startsWith('/guardian')) {
                const users = await getUsers();
                const user = users.find(u => u.role === 'Guardian');
                userDetails = {
                    role: 'guardian',
                    name: user?.name || "Guardian Name",
                    email: user?.email || "guardian@rdc.com",
                    avatar: "https://placehold.co/100x100.png",
                    initials: user?.name.split(' ').map(n => n[0]).join('') || "GN",
                    dashboardLink: "/guardian/dashboard",
                    profileLink: "/guardian/profile",
                    aiHint: "parent"
                };
            } else if (pathname.startsWith('/admin')) {
                const users = await getUsers();
                const user = users.find(u => u.role === 'Admin');
                userDetails = {
                    role: 'admin',
                    name: user?.name || "Admin Name",
                    email: user?.email || "admin@rdc.com",
                    avatar: "https://placehold.co/100x100.png",
                    initials: user?.name.split(' ').map(n => n[0]).join('') || "AN",
                    dashboardLink: "/admin/dashboard",
                    profileLink: "/admin/settings",
                    aiHint: "administrator"
                };
            } else if (pathname.startsWith('/partner')) {
                const organizations = await getOrganizations();
                const partner = organizations.length > 0 ? organizations[0] : null;
                userDetails = {
                    role: 'partner',
                    name: partner?.name || "Partner",
                    email: "partner@rdc.com",
                    avatar: partner?.logoUrl || "https://placehold.co/100x100.png",
                    initials: partner?.name.substring(0,2) || 'P',
                    dashboardLink: "/partner/dashboard",
                    profileLink: "/partner/settings",
                    aiHint: "company logo"
                };
            } else if (pathname.startsWith('/affiliate')) {
                 const users = await getUsers();
                const user = users.find(u => u.role === 'Affiliate');
                userDetails = {
                    role: 'affiliate',
                    name: user?.name || "Affiliate User",
                    email: user?.email || "affiliate@rdc.com",
                    avatar: "https://placehold.co/100x100.png",
                    initials: user?.name.split(' ').map(n => n[0]).join('') || "AU",
                    dashboardLink: "/affiliate/dashboard",
                    profileLink: "/affiliate/profile",
                    aiHint: "marketing person"
                };
            } else if (pathname.startsWith('/moderator')) {
                const users = await getUsers();
                const user = users.find(u => u.role === 'Moderator');
                userDetails = {
                    role: 'moderator',
                    name: user?.name || "Moderator User",
                    email: user?.email || "moderator@rdc.com",
                    avatar: "https://placehold.co/100x100.png",
                    initials: user?.name.split(' ').map(n => n[0]).join('') || "MU",
                    dashboardLink: "/moderator/dashboard",
                    profileLink: "/moderator/profile",
                    aiHint: "support person"
                };
            } else {
                 userDetails = {
                    role: 'unknown',
                    name: "User",
                    email: "user@rdc.com",
                    avatar: "https://placehold.co/100x100.png",
                    initials: "U",
                    dashboardLink: "/",
                    profileLink: "/",
                    aiHint: "person"
                };
            }
        } catch (error) {
            console.error("Failed to fetch user details for nav:", error);
            // Set a default user so the UI doesn't break
             userDetails = {
                role: 'unknown',
                name: "User",
                email: "user@rdc.com",
                avatar: "https://placehold.co/100x100.png",
                initials: "U",
                dashboardLink: "/",
                profileLink: "/",
                aiHint: "person"
            };
        }
        setUser(userDetails);
    };

    fetchUserDetails();
  }, [pathname]);

  if (!user) {
    return (
        <Skeleton className="h-9 w-9 rounded-full" />
    );
  }

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
          
          <DropdownMenuItem asChild>
              <Link href={user.profileLink}><User className="mr-2" />Profile & Settings</Link>
          </DropdownMenuItem>
          
          {user.role === 'student' && (
            <DropdownMenuItem asChild>
                <Link href="/student/my-courses"><BookOpen className="mr-2" />My Courses</Link>
            </DropdownMenuItem>
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
