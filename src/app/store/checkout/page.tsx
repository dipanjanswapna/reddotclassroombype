
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, ShoppingBag, Info, AlertTriangle, Truck } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { createOrderAction } from '@/app/actions/order.actions';
import { applyStoreCouponAction } from '@/app/actions/promo.actions';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import { HomepageConfig } from '@/lib/types';

// Simplified list for demonstration. In a real app, this would come from a database or a comprehensive library.
const districts = ["Dhaka", "Chattogram", "Khulna", "Rajshahi", "Sylhet", "Barishal", "Rangpur", "Mymensingh"];
const thanas: { [key: string]: string[] } = {
  "Dhaka": ["Gulshan", "Dhanmondi", "Mirpur", "Uttara", "Motijheel", "Savar"],
  "Chattogram": ["Kotwali", "Pahartali", "Panchlaish", "Sitakunda"],
  "Khulna": ["Kotwali", "Sonadanga", "Daulatpur"],
  "Rajshahi": ["Boalia", "Motihar", "Paba"],
  "Sylhet": ["Kotwali", "Jalalabad", "Beanibazar"],
  "Barishal": ["Kotwali", "Bakerganj"],
  "Rangpur": ["Kotwali", "Badarganj"],
  "Mymensingh": ["Kotwali", "Trishal"],
};


export default function CheckoutPage() {
  const { items, clearCart, total } = useCart();
  const { userInfo } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    district: '',
    thana: '',
    address: '',
  });
  
  const [config, setConfig] = useState<HomepageConfig['storeSettings'] | null>(null);

  useEffect(() => {
    if (userInfo) {
      setShippingInfo(prev => ({
        ...prev,
        name: userInfo.name || '',
        phone: userInfo.mobileNumber || '',
        address: userInfo.address || '',
      }));
    }
    async function fetchConfig() {
      const fullConfig = await getHomepageConfig();
      setConfig(fullConfig.storeSettings || null);
    }
    fetchConfig();
  }, [userInfo]);

  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const deliveryCharge = useMemo(() => {
    if (!config) return 0;
    if (config.freeDeliveryThreshold && totalItems >= config.freeDeliveryThreshold) {
      return 0;
    }
    return config.deliveryCharge || 0;
  }, [totalItems, config]);

  const totalPayable = total + deliveryCharge - discount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (name: 'district' | 'thana', value: string) => {
    setShippingInfo(prev => ({ ...prev, [name]: value, ...(name === 'district' && { thana: '' }) }));
  };
  
  const handleApplyCoupon = async () => {
      setIsCouponLoading(true);
      const result = await applyStoreCouponAction(coupon, total);
      if(result.success) {
          setDiscount(result.discount!);
          toast({ title: 'Success', description: 'Coupon applied successfully!' });
      } else {
          setDiscount(0);
          toast({ title: 'Invalid Coupon', description: result.message, variant: 'destructive' });
      }
      setIsCouponLoading(false);
  };

  const handlePlaceOrder = async () => {
    if (!shippingInfo.name || !shippingInfo.address || !shippingInfo.phone || !shippingInfo.district || !shippingInfo.thana) {
        toast({ title: "Error", description: "Please fill in all shipping details.", variant: "destructive" });
        return;
    }
    if (!termsAccepted) {
        toast({ title: "Agreement Required", description: "You must agree to the terms and policies.", variant: "destructive" });
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
      totalAmount: totalPayable,
      shippingDetails: shippingInfo,
      status: 'Pending' as const
    };

    const result = await createOrderAction(orderDetails);
    if(result.success) {
      toast({
        title: "Order Placed!",
        description: result.message,
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
              <CardDescription>
                <Alert variant="default" className="mt-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                    <Truck className="h-4 w-4" />
                    <AlertDescription>
                        Inside Dhaka - 3 days & Outside Dhaka - 7 days
                    </AlertDescription>
                </Alert>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name*</Label>
                <Input id="name" placeholder="Full Name" value={shippingInfo.name} onChange={handleInputChange} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="phone">Phone*</Label>
                <Input id="phone" type="tel" placeholder="01XXXXXXXXX" value={shippingInfo.phone} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="district">District*</Label>
                    <Select value={shippingInfo.district} onValueChange={(v) => handleSelectChange('district', v)}>
                        <SelectTrigger><SelectValue placeholder="Select District"/></SelectTrigger>
                        <SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="thana">Thana*</Label>
                    <Select value={shippingInfo.thana} onValueChange={(v) => handleSelectChange('thana', v)} disabled={!shippingInfo.district}>
                        <SelectTrigger><SelectValue placeholder="Select Thana"/></SelectTrigger>
                        <SelectContent>{(thanas[shippingInfo.district] || []).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address*</Label>
                <Input id="address" placeholder="তোমার নিকটস্থ সুন্দরবন কুরিয়ার সার্ভিসের ঠিকানা দাও" value={shippingInfo.address} onChange={handleInputChange} />
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
                  <div key={item.id} className="flex items-center justify-between text-sm">
                     <div className="flex items-center gap-2">
                        <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-md object-cover"/>
                        <p>{item.name} x {item.quantity}</p>
                     </div>
                    <p>৳{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Total Amount:</span><span>৳{total.toFixed(2)}</span></div>
                    <div className="flex justify-between">
                        <span>Delivery Charge:</span>
                        <span>৳{deliveryCharge.toFixed(2)}</span>
                    </div>
                    {config?.freeDeliveryThreshold && (
                        <p className="text-xs text-muted-foreground">(Buy {config.freeDeliveryThreshold}+ items to get free delivery)</p>
                    )}
                    <div className="flex justify-between items-center text-green-600">
                        <span>Discount:</span>
                        <span>- ৳{discount.toFixed(2)}</span>
                    </div>
                     <div className="flex gap-2">
                        <Input placeholder="Enter Coupon Code" value={coupon} onChange={e => setCoupon(e.target.value)} disabled={isCouponLoading}/>
                        <Button variant="outline" size="sm" onClick={handleApplyCoupon} disabled={isCouponLoading || !coupon}>
                            {isCouponLoading && <Loader2 className="h-4 w-4 animate-spin"/>}
                            Apply
                        </Button>
                    </div>
                </div>
                <Separator/>
                <div className="flex justify-between font-bold text-lg">
                  <p>Total Payable Amount:</p>
                  <p>৳{totalPayable.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
            <div className='p-6 pt-2 space-y-4'>
                <div className="items-top flex space-x-2">
                    <Checkbox id="terms1" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(!!checked)} />
                    <div className="grid gap-1.5 leading-none">
                        <label
                        htmlFor="terms1"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                         Do you agree with all of these?
                        </label>
                        <p className="text-sm text-muted-foreground">
                        <Link href="/terms" className="underline hover:text-primary">Refund Policy</Link>,{' '}
                        <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and{' '}
                        <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                        </p>
                    </div>
                </div>
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
