"use client";

import Link from "next/link";
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
import { LayoutDashboard, LogOut, BookOpen, HelpCircle, User, Settings, Badge } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "./ui/skeleton";

export function UserNav() {
  const { user, userInfo, loading, logout } = useAuth();

  if (loading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }
  
  if (!user || !userInfo) {
    return null;
  }

  const getDashboardLink = () => {
    switch (userInfo.role) {
      case 'Student': return '/student/dashboard';
      case 'Teacher': return '/teacher/dashboard';
      case 'Guardian': return '/guardian/dashboard';
      case 'Admin': return '/admin/dashboard';
      case 'Seller': return '/seller/dashboard';
      case 'Affiliate': return '/affiliate/dashboard';
      case 'Moderator': return '/moderator/dashboard';
      case 'Doubt Solver': return '/doubt-solver/dashboard';
      default: return '/';
    }
  };

  const getProfileLink = () => {
    switch (userInfo.role) {
      case 'Student': return '/student/profile';
      case 'Teacher': return '/teacher/profile';
      case 'Guardian': return '/guardian/profile';
      case 'Admin': return '/admin/settings';
      case 'Seller': return '/seller/profile';
      case 'Affiliate': return '/affiliate/profile';
      case 'Moderator': return '/moderator/profile';
      case 'Doubt Solver': return '/doubt-solver/profile';
      default: return '/';
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all" aria-label="Open user menu">
          <Avatar className="h-9 w-9 border-2 border-white/50 dark:border-white/10 shadow-sm">
            <AvatarImage src={userInfo.avatarUrl} alt={userInfo.name} />
            <AvatarFallback className="bg-primary/5 text-primary font-bold">
              {userInfo.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 rounded-xl shadow-2xl border-white/10" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none">{userInfo.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userInfo.email}
            </p>
            <div className="pt-2">
              <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {userInfo.role}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="opacity-50" />
        <DropdownMenuGroup className="space-y-1 mt-1">
          <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
            <Link href={getDashboardLink()} className="flex items-center py-2 px-3">
              <LayoutDashboard className="mr-3 h-4 w-4 opacity-70" />
              <span className="font-semibold">My Dashboard</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
              <Link href={getProfileLink()} className="flex items-center py-2 px-3">
                <User className="mr-3 h-4 w-4 opacity-70" />
                <span className="font-semibold">Profile & Settings</span>
              </Link>
          </DropdownMenuItem>
          
          {userInfo.role === 'Student' && (
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link href="/student/my-courses" className="flex items-center py-2 px-3">
                  <BookOpen className="mr-3 h-4 w-4 opacity-70" />
                  <span className="font-semibold">My Courses</span>
                </Link>
            </DropdownMenuItem>
          )}

           <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
             <Link href="/faq" className="flex items-center py-2 px-3">
                <HelpCircle className="mr-3 h-4 w-4 opacity-70" />
                <span className="font-semibold">Help & Support</span>
             </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="opacity-50 mt-1" />
        <DropdownMenuItem onClick={logout} className="rounded-lg mt-1 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
          <div className="flex items-center py-2 px-3 w-full">
            <LogOut className="mr-3 h-4 w-4" />
            <span className="font-bold">Log out</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}