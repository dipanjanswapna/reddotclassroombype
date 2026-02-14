'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, ShoppingBag, Truck, CheckCircle2, PackageCheck } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { createOrderAction } from '@/app/actions/order.actions';
import { applyStoreCouponAction } from '@/app/actions/promo.actions';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import { HomepageConfig } from '@/lib/types';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { addDays, format } from 'date-fns';
import { cn } from '@/lib/utils';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

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
  const [orderSuccess, setOrderSuccess] = useState(false);

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
    if (config.freeDeliveryThreshold && totalItems >= config.freeDeliveryThreshold) return 0;
    return config.deliveryCharge || 0;
  }, [totalItems, config]);

  const totalPayable = total + deliveryCharge - discount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        toast({ title: "Agreement Required", description: "You must agree to the platform policies.", variant: "destructive" });
        return;
    }
    setIsProcessing(true);
    
    const result = await createOrderAction({
      userId: userInfo!.uid,
      items: items,
      totalAmount: totalPayable,
      shippingDetails: shippingInfo,
      status: 'Pending'
    });

    if(result.success) {
      setOrderSuccess(true);
      clearCart();
    } else {
      toast({ title: "Order Failed", description: result.message, variant: "destructive" });
      setIsProcessing(false);
    }
  };
  
  if (orderSuccess) {
      return (
          <div className="container mx-auto max-w-2xl py-24 text-center px-4">
              <ReactConfetti width={typeof window !== 'undefined' ? window.innerWidth : 1200} height={typeof window !== 'undefined' ? window.innerHeight : 800} recycle={false} />
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-8">
                  <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-600/10 border-4 border-white">
                      <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black uppercase font-headline text-foreground tracking-tight">Order <span className="text-primary">Confirmed!</span></h1>
                  <p className="text-muted-foreground font-medium text-lg">Your order has been placed successfully. You will receive a confirmation call shortly.</p>
                  <Button asChild size="lg" className="rounded-xl font-black px-10 shadow-xl shadow-primary/20 h-14">
                      <Link href="/student/dashboard">Go to Dashboard</Link>
                  </Button>
              </motion.div>
          </div>
      )
  }

  return (
    <div className="container mx-auto max-w-5xl py-12 px-1">
      <div className="flex flex-col gap-2 border-l-4 border-primary pl-4 mb-8">
        <h1 className="text-3xl font-black uppercase font-headline">Secure <span className="text-primary">Checkout</span></h1>
        <p className="text-muted-foreground font-medium">Review your order and shipping information.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-7 space-y-8">
          <Card className="rounded-[20px] border-primary/10 shadow-xl bg-card overflow-hidden">
            <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
              <CardTitle className="text-xl font-black uppercase tracking-tight">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 text-left">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Recipient Name*</Label>
                <Input id="name" placeholder="Full Name" value={shippingInfo.name} onChange={handleInputChange} className="rounded-xl h-12 border-primary/10 bg-white" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number*</Label>
                <Input id="phone" type="tel" placeholder="01XXXXXXXXX" value={shippingInfo.phone} onChange={handleInputChange} className="rounded-xl h-12 border-primary/10 bg-white" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">District*</Label>
                    <Select value={shippingInfo.district} onValueChange={(v) => handleSelectChange('district', v)}>
                        <SelectTrigger className="rounded-xl h-12 border-primary/10 bg-white"><SelectValue placeholder="Select District"/></SelectTrigger>
                        <SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                   <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Thana*</Label>
                    <Select value={shippingInfo.thana} onValueChange={(v) => handleSelectChange('thana', v)} disabled={!shippingInfo.district}>
                        <SelectTrigger className="rounded-xl h-12 border-primary/10 bg-white"><SelectValue placeholder="Select Thana"/></SelectTrigger>
                        <SelectContent>{(thanas[shippingInfo.district] || []).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Detailed Address*</Label>
                <Input id="address" placeholder="House #, Road #, Area" value={shippingInfo.address} onChange={handleInputChange} className="rounded-xl h-12 border-primary/10 bg-white" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="rounded-[20px] border-primary/10 shadow-xl bg-card overflow-hidden sticky top-24">
            <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
              <CardTitle className="text-xl font-black uppercase tracking-tight">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm py-2">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 relative rounded-lg overflow-hidden border bg-white">
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover"/>
                        </div>
                        <div className="text-left">
                            <p className="font-bold line-clamp-1">{item.name}</p>
                            <p className="text-[10px] font-black uppercase text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                    </div>
                    <p className="font-black">৳{(item.price * item.quantity).toFixed(0)}</p>
                  </div>
                ))}
                
                <Separator className="bg-primary/5" />
                
                <div className="space-y-2.5 text-[10px] font-bold text-muted-foreground">
                    <div className="flex justify-between items-center">
                        <span className="uppercase tracking-widest">Subtotal</span>
                        <span className="text-foreground font-black">৳{total.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="uppercase tracking-widest">Delivery Charge</span>
                        <span className={cn("font-black", deliveryCharge === 0 ? "text-green-600" : "text-foreground")}>
                            {deliveryCharge === 0 ? 'FREE' : `৳${deliveryCharge.toFixed(0)}`}
                        </span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between items-center text-green-600">
                            <span className="uppercase tracking-widest">Discount</span>
                            <span className="font-black">- ৳{discount.toFixed(0)}</span>
                        </div>
                    )}
                </div>
                
                <Separator className="bg-primary/10 h-0.5" />
                
                <div className="flex justify-between items-end py-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Payable</p>
                  <p className="text-3xl font-black text-primary tracking-tighter">৳{totalPayable.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex flex-col gap-6">
                <div className="flex items-start space-x-3 text-left">
                    <Checkbox id="terms1" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(!!checked)} className="mt-1 rounded-md" />
                    <div className="grid gap-1">
                        <Label htmlFor="terms1" className="text-xs font-black uppercase tracking-tight text-foreground cursor-pointer">Agree to platform policies</Label>
                        <p className="text-[9px] text-muted-foreground leading-relaxed">
                            I accept the <Link href="/terms" className="text-primary hover:underline">Refund Policy</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                        </p>
                    </div>
                </div>
               <Button size="lg" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20" onClick={handlePlaceOrder} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackageCheck className="mr-2 h-5 w-5" />}
                Confirm Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
