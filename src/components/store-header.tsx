
'use client';

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X, ChevronDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserNav } from "./user-nav";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import logoSrc from '@/public/logo.png';
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { useCart } from "@/context/cart-context";
import { Badge } from "./ui/badge";
import { StoreCategory } from "@/lib/types";
import { Input } from "./ui/input";

export function StoreHeader({ categories }: { categories: StoreCategory[] }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { items, setIsCartOpen } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const getDashboardLink = () => {
    if (!user) return '/login';
    // Simplified, ideally this comes from userInfo
    return '/student/dashboard'; 
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/store" className="flex items-center space-x-2">
            <Image src={logoSrc} alt="RDC Store Logo" className="h-8 md:h-10 w-auto" priority />
            <span className="font-bold text-lg hidden sm:inline-block">RDC Store</span>
          </Link>
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/store" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    All Products
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {categories.map((category) => (
                      <ListItem
                        key={category.id}
                        title={category.name}
                        href={`/store?category=${category.slug}`}
                      >
                        Browse all {category.name.toLowerCase()} products.
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                 <Link href="/courses" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Courses
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        <div className="flex-1 mx-4 max-w-sm hidden md:block">
            <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input placeholder="Search products..." className="pl-9" />
            </div>
        </div>

        <div className="flex items-center justify-end space-x-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs">{itemCount}</Badge>
                )}
            </Button>
            {user ? (
                <>
                    <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                        <Link href={getDashboardLink()}>Go to Dashboard</Link>
                    </Button>
                    <UserNav />
                </>
            ) : (
                <Button asChild><Link href="/login">Login</Link></Button>
            )}
            <ThemeToggle />
            <div className="lg:hidden">
                <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon"><Menu/></Button>
                    </SheetTrigger>
                    <SheetContent>
                        <nav className="flex flex-col gap-4 mt-8">
                             {categories.map((category) => (
                                <Link key={category.id} href={`/store?category=${category.slug}`} className="font-medium hover:text-primary" onClick={() => setMenuOpen(false)}>
                                    {category.name}
                                </Link>
                             ))}
                             <Link href="/courses" className="font-medium hover:text-primary" onClick={() => setMenuOpen(false)}>
                                    Courses
                             </Link>
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}


const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

