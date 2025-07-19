
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
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import useEmblaCarousel from "embla-carousel-react";

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
  const { user } = useAuth();
  const { items, setIsCartOpen } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="lg:hidden flex-1 flex justify-start">
             <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Toggle Menu">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-full max-w-sm flex flex-col bg-background/80 backdrop-blur-xl">
                    <SheetHeader className="p-4 border-b">
                         <Link href="/store" onClick={() => setIsMobileMenuOpen(false)}>
                            <RhombusLogo />
                         </Link>
                    </SheetHeader>
                    <div className="flex-grow overflow-y-auto px-2 py-4">
                         <Accordion type="multiple" className="w-full">
                            {categories.sort((a,b) => (a.order || 99) - (b.order || 99)).map(category => (
                                <AccordionItem value={category.id || category.slug} key={category.id}>
                                    <AccordionTrigger className="font-semibold">{category.name}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-col space-y-1 pl-4">
                                            <Link href={`/store?category=${category.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-medium hover:text-primary rounded-md">View All {category.name}</Link>
                                            {(category.subCategoryGroups || []).map(group => (
                                                <div key={group.title}>
                                                    <h4 className="font-semibold text-muted-foreground px-2 py-2">{group.title}</h4>
                                                    {group.subCategories.map(sub => (
                                                         <Link
                                                            key={sub.name}
                                                            href={`/store?category=${category.slug}&subCategory=${sub.name.toLowerCase().replace(/\s+/g, '-')}`}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className="block px-2 py-2 text-sm transition-colors hover:text-primary rounded-md"
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </SheetContent>
            </Sheet>
        </div>

        <div className="flex-1 flex justify-center lg:justify-start">
            <Link href="/store">
                <RhombusLogo />
            </Link>
        </div>
        
        <div className="flex items-center justify-end space-x-2 flex-1">
             <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/student/payments">My Orders</Link>
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
                <Button asChild variant="outline" className="hidden sm:inline-flex"><Link href="/login">Login</Link></Button>
            )}
        </div>
      </div>
      <div className="container h-12 hidden lg:flex items-center justify-start border-t bg-gray-800 text-white relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollPrev}
          className="absolute left-0 z-20 bg-gray-800/80 hover:bg-gray-700/80 h-full rounded-none"
        >
          <ChevronDown className="h-4 w-4 -rotate-90" />
        </Button>
        <div className="w-full" ref={emblaRef}>
          <nav className="flex items-center h-full">
            <NavigationMenu>
              <NavigationMenuList>
                {categories
                  .sort((a, b) => (a.order || 99) - (b.order || 99))
                  .map((category) => (
                    <NavigationMenuItem key={category.id}>
                      <NavigationMenuTrigger>{category.name}</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid gap-3 p-4 md:w-[600px] lg:w-[700px] lg:grid-cols-[1fr_2fr]">
                          <div className="row-span-3">
                            <NavigationMenuLink asChild>
                              <Link
                                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                href={`/store?category=${category.slug}`}
                              >
                                {category.menuImageUrl ? (
                                    <Image src={category.menuImageUrl} alt={category.name} width={200} height={150} className="object-contain" data-ai-hint={category.menuImageAiHint}/>
                                ) : (
                                    <RhombusLogo/>
                                )}
                                <div className="mb-2 mt-4 text-lg font-medium">
                                  {category.name}
                                </div>
                                <p className="text-sm leading-tight text-muted-foreground">
                                  View all products in the {category.name} category.
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {(category.subCategoryGroups || []).map(group => (
                                <div key={group.title} className="flex flex-col">
                                     <Link href={`/store?category=${category.slug}`} className="font-semibold text-primary px-3 mb-1 hover:underline">{group.title} &rarr;</Link>
                                     <ul className="flex flex-col">
                                         {group.subCategories.map(sub => (
                                             <ListItem key={sub.name} href={`/store?category=${category.slug}&subCategory=${sub.name.toLowerCase().replace(/\s+/g, '-')}`} title={sub.name} />
                                         ))}
                                     </ul>
                                </div>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollNext}
          className="absolute right-0 z-20 bg-gray-800/80 hover:bg-gray-700/80 h-full rounded-none"
        >
          <ChevronDown className="h-4 w-4 rotate-90" />
        </Button>
      </div>
    </header>
  );
}
