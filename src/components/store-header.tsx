
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
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserNav } from "./user-nav";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { Badge } from "./ui/badge";
import { StoreCategory, Order } from "@/lib/types";
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

export function StoreHeader({ categories }: { categories: StoreCategory[] }) {
  const { user } = useAuth();
  const { items, setIsCartOpen } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full flex justify-center bg-transparent pt-3 pointer-events-none">
      <div className="container max-w-7xl pointer-events-auto px-4">
        <div className="flex h-16 items-center justify-between rounded-full bg-background/80 dark:bg-card/80 backdrop-blur-xl border border-primary/40 px-4 sm:px-8 shadow-xl">
            <div className="flex-1 flex justify-start items-center gap-4">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Toggle Menu" className="h-10 w-10 rounded-full lg:hidden">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-full max-w-xs flex flex-col bg-background/95 backdrop-blur-2xl border-r-primary/20">
                        <SheetHeader className="p-6 border-b border-primary/10">
                            <Link href="/store" onClick={() => setIsMobileMenuOpen(false)} className="transition-transform hover:scale-105">
                                <RhombusLogo />
                            </Link>
                        </SheetHeader>
                        <div className="flex-grow overflow-y-auto px-2 py-4">
                            <Accordion type="multiple" className="w-full">
                                {categories.sort((a,b) => (a.order || 99) - (b.order || 99)).map(category => (
                                    <AccordionItem value={category.id || category.slug} key={category.id} className="border-none px-2">
                                        <AccordionTrigger className="font-bold text-lg hover:no-underline px-4 hover:bg-primary/5 rounded-xl">{category.name}</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="flex flex-col space-y-1 pl-4 border-l-2 border-primary/10 ml-4 mt-1">
                                                <Link href={`/store?category=${category.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 px-4 text-base font-medium hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">View All {category.name}</Link>
                                                {(category.subCategoryGroups || []).map(group => (
                                                    <div key={group.title} className="mt-2">
                                                        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-widest px-4 py-2">{group.title}</h4>
                                                        {group.subCategories.map(sub => (
                                                            <Link
                                                                key={sub.name}
                                                                href={`/store?category=${category.slug}&subCategory=${sub.name.toLowerCase().replace(/\s+/g, '-')}`}
                                                                onClick={() => setIsMobileMenuOpen(false)}
                                                                className="block px-4 py-2 text-sm font-medium transition-colors hover:text-primary hover:bg-primary/5 rounded-lg"
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
                <Link href="/store" className="transition-transform hover:scale-105 active:scale-95">
                    <RhombusLogo />
                </Link>
            </div>
            
            <div className="flex items-center justify-end space-x-1 flex-1">
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex h-10 px-4 text-xs font-bold uppercase tracking-tight">
                    <Link href="/student/payments">My Orders</Link>
                </Button>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Track Order" className="h-10 w-10 rounded-full">
                            <Truck className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <OrderTrackingModal />
                </Dialog>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-[10px] border-2 border-background">{itemCount}</Badge>
                )}
                </Button>
                <div className="border-l border-primary/20 pl-2 ml-1 h-8 flex items-center">
                    {user ? (
                        <UserNav />
                    ) : (
                        <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex h-10 text-xs font-bold rounded-full"><Link href="/login">Login</Link></Button>
                    )}
                </div>
            </div>
        </div>
      </div>
    </header>
  );
}
