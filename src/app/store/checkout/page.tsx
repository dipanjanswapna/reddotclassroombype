
'use client';

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { createOrderAction } from '@/app/actions/order.actions';
import Image from 'next/image';

export default function CheckoutPage() {
  const { items, clearCart, total } = useCart();
  const { userInfo } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [shippingInfo, setShippingInfo] = useState({
    name: userInfo?.name || '',
    address: userInfo?.address || '',
    phone: userInfo?.mobileNumber || '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [id]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!shippingInfo.name || !shippingInfo.address || !shippingInfo.phone) {
        toast({ title: "Error", description: "Please fill in all shipping details.", variant: "destructive" });
        return;
    }
    if (!userInfo) {
        toast({ title: "Please log in", description: "You need to be logged in to place an order.", variant: "destructive" });
        router.push('/login');
        return;
    }
    setIsProcessing(true);
    
    const orderDetails = {
      userId: userInfo.uid,
      items: items,
      totalAmount: total,
      shippingDetails: shippingInfo,
      status: 'Pending' as const
    };

    const result = await createOrderAction(orderDetails);
    if(result.success) {
      toast({
        title: "Order Placed!",
        description: `Your order #${result.orderId?.slice(0, 8)} has been placed successfully.`,
      });
      clearCart();
      router.push('/student/dashboard'); // Or an order confirmation page
    } else {
      toast({ title: "Order Failed", description: result.message, variant: "destructive" });
    }
    
    setIsProcessing(false);
  };
  
  if (items.length === 0 && !isProcessing) {
      return (
        <div className="container mx-auto max-w-2xl py-12 text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
            <h1 className="mt-4 text-2xl font-bold">Your Cart is Empty</h1>
            <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
            <Button onClick={() => router.push('/store')} className="mt-6">Continue Shopping</Button>
        </div>
      )
  }

  return (
    <div className="container mx-auto max-w-5xl py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={shippingInfo.name} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input id="address" value={shippingInfo.address} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={shippingInfo.phone} onChange={handleInputChange} />
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="rounded-md object-cover"/>
                        <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                     </div>
                    <p>৳{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <p>Total</p>
                  <p>৳{total.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
            <div className="p-6 pt-0">
               <Button size="lg" className="w-full" onClick={handlePlaceOrder} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Place Order
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
