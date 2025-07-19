
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import { useCart } from '@/context/cart-context';
import Image from 'next/image';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export function CartSheet() {
  const { isCartOpen, setIsCartOpen, items, removeFromCart, clearCart, total } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({items.length})</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
            {items.length > 0 ? (
                <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-start gap-4">
                        <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="rounded-md object-cover"
                        />
                        <div className="flex-1">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                            {item.quantity} x ৳{item.price.toFixed(2)}
                            </p>
                        </div>
                        <div className="text-right">
                           <p className="font-semibold">৳{(item.price * item.quantity).toFixed(2)}</p>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 mt-1 text-muted-foreground hover:text-destructive"
                                onClick={() => removeFromCart(item.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        </div>
                    ))}
                    </div>
                </ScrollArea>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <ShoppingBag className="w-16 h-16 mb-4" />
                    <p>Your cart is empty.</p>
                </div>
            )}
        </div>
        {items.length > 0 && (
           <SheetFooter className="mt-auto border-t pt-4">
                <div className="w-full space-y-4">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>৳{total.toFixed(2)}</span>
                    </div>
                    <Button asChild size="lg" className="w-full" onClick={() => setIsCartOpen(false)}>
                        <Link href="/store/checkout">Proceed to Checkout</Link>
                    </Button>
                     <Button variant="outline" className="w-full" onClick={clearCart}>
                        Clear Cart
                    </Button>
                </div>
           </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
