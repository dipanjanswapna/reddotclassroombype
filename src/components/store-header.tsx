
'use client';

import * as React from "react";
import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X, ChevronDown, ShoppingCart, Receipt, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserNav } from "./user-nav";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { Badge } from "./ui/badge";
import { StoreCategory, Order } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";
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
  const [isMenuOpen, setMenuOpen] = useState(false);
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
            <div className="hidden sm:flex">
                 <Input className="h-9 w-64" placeholder="Search for products..." />
            </div>
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
       <nav className="hidden lg:flex container h-12 items-center justify-between border-t bg-gray-800 text-white">
          <div className="flex items-center gap-1">
            {categories.sort((a,b) => (a.order || 99) - (b.order || 99)).map(category => (
                <DropdownMenu key={category.id}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="hover:bg-gray-700">
                           {category.name} <ChevronDown className="ml-2 h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => router.push(`/store?category=${category.slug}`)}>
                            All {category.name}
                        </DropdownMenuItem>
                        {(category.subCategories || []).map(sc => (
                             <DropdownMenuItem key={sc.name} onSelect={() => router.push(`/store?category=${category.slug}&subCategory=${sc.name.toLowerCase().replace(/\s+/g, '-')}`)}>
                                {sc.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            ))}
          </div>
          <Button variant="success" onClick={() => router.push('/student/payments')}>My Orders</Button>
      </nav>
    </header>
  );
}
