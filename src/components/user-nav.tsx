

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
import { LayoutDashboard, LogOut, BookOpen, HelpCircle, User } from "lucide-react";
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
        <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="Open user menu">
          <Avatar className="h-9 w-9">
            <AvatarImage src={userInfo.avatarUrl} alt={userInfo.name} />
            <AvatarFallback>{userInfo.name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userInfo.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userInfo.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={getDashboardLink()}><LayoutDashboard className="mr-2 h-4 w-4" />My Dashboard</Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
              <Link href={getProfileLink()}><User className="mr-2 h-4 w-4" />Profile &amp; Settings</Link>
          </DropdownMenuItem>
          
          {userInfo.role === 'Student' && (
            <DropdownMenuItem asChild>
                <Link href="/student/my-courses"><BookOpen className="mr-2 h-4 w-4" />My Courses</Link>
            </DropdownMenuItem>
          )}

           <DropdownMenuItem asChild>
             <Link href="/faq"><HelpCircle className="mr-2 h-4 w-4" />Help &amp; Support</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
