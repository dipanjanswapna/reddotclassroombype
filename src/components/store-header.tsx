

'use client';

import * as React from "react";
import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X, ChevronDown, ShoppingCart, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { UserNav } from "./user-nav";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { useCart } from "@/context/cart-context";
import { Badge } from "./ui/badge";
import { StoreCategory } from "@/lib/types";
import { usePathname } from "next/navigation";
import { RhombusLogo } from "./rhombus-logo";
import { useLanguage } from "@/context/language-context";
import { t } from "@/lib/i18n";
import { Input } from "./ui/input";

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


export function StoreHeader({ categories }: { categories: StoreCategory[] }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { items, setIsCartOpen } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const pathname = usePathname();
  const { language } = useLanguage();
  
  const getDashboardLink = () => {
    if (!user) return '/login';
    // Simplified, ideally this comes from userInfo
    return '/student/dashboard'; 
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/store">
            <RhombusLogo />
          </Link>
        </div>
        
        <div className="flex items-center justify-end space-x-2">
            <div className="hidden sm:flex">
                 <Input className="h-9 w-64" placeholder="Search for products..."/>
            </div>
             <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/student/payments">
                    <Receipt className="h-6 w-6" />
                </Link>
             </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
             <ShoppingCart className="h-6 w-6" />
             {itemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs">{itemCount}</Badge>
             )}
            </Button>
            {user ? (
                <UserNav />
            ) : (
                <Button asChild variant="outline"><Link href="/login">Login</Link></Button>
            )}
            <div className="lg:hidden">
                <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon"><Menu/></Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                        </SheetHeader>
                        <nav className="flex flex-col gap-4 mt-8">
                             <Link href="/store" className="font-medium hover:text-primary" onClick={() => setMenuOpen(false)}>Home</Link>
                            <h3 className="font-semibold pt-4 border-t">All Categories</h3>
                            {categories.map(category => (
                                <Link
                                    key={category.id}
                                    href={`/store?category=${category.slug}`}
                                    className="text-muted-foreground hover:text-primary"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
      </div>
       <nav className="hidden lg:flex container h-12 items-center justify-center border-t bg-background">
          <NavigationMenu>
            <NavigationMenuList>
                {categories.sort((a,b) => (a.order || 99) - (b.order || 99)).map(category => (
                     <NavigationMenuItem key={category.id}>
                        <NavigationMenuTrigger>{category.name}</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                            <ListItem href={`/store?category=${category.slug}`} title={category.name}>
                                View all products in {category.name}.
                            </ListItem>
                            {(category.subCategories || []).map(sc => (
                                <ListItem key={sc.name} href={`/store?category=${category.slug}&subCategory=${sc.name.toLowerCase().replace(/\s+/g, '-')}`} title={sc.name}>
                                </ListItem>
                            ))}
                            </ul>
                        </NavigationMenuContent>
                     </NavigationMenuItem>
                ))}
            </NavigationMenuList>
          </NavigationMenu>
      </nav>
    </header>
  );
}
