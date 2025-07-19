
'use client';

import * as React from "react";
import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X, ChevronDown, ShoppingCart, Receipt, Truck, BookUser } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserNav } from "./user-nav";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { Badge } from "./ui/badge";
import { StoreCategory, Order, SubCategoryGroup } from "@/lib/types";
import { useRouter } from "next/navigation";
import { RhombusLogo } from "./rhombus-logo";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { safeToDate } from "@/lib/utils";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


const OrderTrackingModal = () => {
    const [orderId, setOrderId] = useState('');
    const [orderData, setOrderData] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleTrackOrder = async () => {
        if (!orderId) {
            setError("Please enter your Order ID.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setOrderData(null);

        try {
            const response = await fetch(`/api/track-order?orderId=${orderId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Order not found.");
            }
            
            setOrderData(data);
            toast({
                title: "Order Found!",
                description: `Status for order #${orderId.slice(0, 8)} loaded.`,
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Track Your Order</DialogTitle>
                <DialogDescription>
                    Enter your order ID to see its current status.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="orderId">Order ID</Label>
                    <div className="flex gap-2">
                        <Input
                            id="orderId"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="e.g., RDC-ORD-..."
                        />
                         <Button onClick={handleTrackOrder} disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            <span className="sr-only">Track</span>
                        </Button>
                    </div>
                </div>
                
                {error && <p className="text-destructive text-sm text-center">{error}</p>}
                
                {orderData && (
                    <div className="mt-4 p-4 border rounded-md bg-muted space-y-2">
                         <h4 className="font-semibold text-lg">Order Status: <span className="text-primary">{orderData.status}</span></h4>
                        <p className="text-sm"><strong>Order ID:</strong> #{orderData.id?.slice(0,8)}</p>
                        <p className="text-sm"><strong>Order Date:</strong> {format(safeToDate(orderData.createdAt), 'PPP')}</p>
                        <p className="text-sm"><strong>Total Amount:</strong> ৳{orderData.totalAmount}</p>
                    </div>
                )}
            </div>
        </DialogContent>
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
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"


export function StoreHeader({ categories }: { categories: StoreCategory[] }) {
  const { user } = useAuth();
  const { items, setIsCartOpen } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/store">
            <RhombusLogo />
          </Link>
        </div>
        
        <div className="flex items-center justify-end space-x-2">
            <div className="hidden sm:flex items-center">
                 <Input className="h-9 w-64" placeholder="Search for products..." />
            </div>
            <Button variant="ghost" size="icon" aria-label="My Orders" onClick={() => router.push('/student/payments')}>
                <BookUser className="h-6 w-6" />
            </Button>
             <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Track Order">
                        <Truck className="h-6 w-6" />
                    </Button>
                </DialogTrigger>
                <OrderTrackingModal />
             </Dialog>
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
        </div>
      </div>
       <div className="container h-12 items-center justify-start border-t bg-gray-800 text-white overflow-x-auto">
          <nav className="flex items-center h-full">
          <NavigationMenu>
            <NavigationMenuList>
              {categories.sort((a,b) => (a.order || 99) - (b.order || 99)).map(category => (
                <NavigationMenuItem key={category.id}>
                  <NavigationMenuTrigger>{category.name}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 md:w-[600px] lg:w-[700px] lg:grid-cols-3">
                      <div className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href={`/store?category=${category.slug}`}
                          >
                            <RhombusLogo/>
                            <div className="mb-2 mt-4 text-lg font-medium">
                              {category.name}
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              View all products in the {category.name} category.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </div>
                      {(category.subCategoryGroups || []).map(group => (
                          <div key={group.title} className="flex flex-col">
                               <p className="font-semibold text-primary px-3">{group.title} &rarr;</p>
                               <ul className="flex flex-col">
                                   {group.subCategories.map(sub => (
                                       <ListItem key={sub.name} href={`/store?category=${category.slug}&subCategory=${sub.name.toLowerCase().replace(/\s+/g, '-')}`} title={sub.name} />
                                   ))}
                               </ul>
                          </div>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
      </div>
    </header>
  );
}
