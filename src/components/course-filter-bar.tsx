
"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function CourseFilterBar() {
    return (
        <div className="bg-gray-900">
            <div className="container mx-auto flex items-center gap-4 py-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-lg font-bold text-white p-0 h-auto hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                            এইচএসসি
                            <ChevronDown className="ml-1 h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem>এইচএসসি</DropdownMenuItem>
                        <DropdownMenuItem>এসএসসি</DropdownMenuItem>
                        <DropdownMenuItem>ভর্তি পরীক্ষা</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" className="rounded-full bg-gray-700/50 text-white hover:bg-gray-700">
                            বিজ্ঞান
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem>বিজ্ঞান</DropdownMenuItem>
                        <DropdownMenuItem>মানবিক</DropdownMenuItem>
                        <DropdownMenuItem>ব্যবসায় শিক্ষা</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
