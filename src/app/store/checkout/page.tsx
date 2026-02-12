
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
import { Loader2, ShoppingBag, Info, AlertTriangle, Truck, CheckCircle2, PartyPopper } from 'lucide-react';
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
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

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

/**
 * @fileOverview Refined Store Checkout Page.
 * Optimized for high-density wall-to-wall UI.
 * Implements react-confetti for a premium success state.
 */
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
  const [showConfetti, setShowConfetti] = useState(false);
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
      setShowConfetti(true);
      setOrderSuccess(true);
      clearCart();
      setTimeout(() => setShowConfetti(false), 8000);
    } else {
      toast({ title: "Order Failed", description: result.message, variant: "destructive" });
      setIsProcessing(false);
    }
  };
  
  if (orderSuccess) {
      return (
          <div className="container mx-auto max-w-2xl py-24 text-center px-4">
              {showConfetti && <ReactConfetti width={typeof window !== 'undefined' ? window.innerWidth : 1200} height={typeof window !== 'undefined' ? window.innerHeight : 800} recycle={false} />}
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-8">
                  <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-600/10">
                      <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <div className="space-y-3">
                      <h1 className="text-3xl md:text-4xl font-black uppercase font-headline text-foreground">Order <span className="text-primary">Confirmed!</span></h1>
                      <p className="text-muted-foreground font-medium text-lg">Your order has been placed successfully. You will receive a confirmation call shortly.</p>
                  </div>
                  <Card className="max-w-md mx-auto p-6 bg-muted/30 border-dashed border-2 border-primary/10 rounded-[20px]">
                      <div className="flex items-center justify-center gap-3">
                          <PartyPopper className="h-6 w-6 text-primary" />
                          <p className="font-black text-sm uppercase tracking-widest">Digital Invoice Sent to Email</p>
                      </div>
                  </Card>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button asChild size="lg" className="w-full sm:w-auto rounded-xl font-black px-10 shadow-xl shadow-primary/20 h-14">
                          <Link href="/student/dashboard">Go to Dashboard</Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-xl font-black px-10 h-14 border-primary/10">
                          <Link href="/store">Continue Shopping</Link>
                      </Button>
                  </div>
              </motion.div>
          </div>
      )
  }

  if (items.length === 0 && !isProcessing) {
      return (
        <div className="container mx-auto max-w-2xl py-24 text-center px-4">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground opacity-20" />
            <h1 className="mt-6 text-2xl font-black uppercase font-headline">Your Cart is Empty</h1>
            <p className="mt-2 text-muted-foreground font-medium">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild size="lg" className="mt-8 rounded-xl font-black uppercase tracking-widest px-10 shadow-xl shadow-primary/20 h-14">
                <Link href="/store">Browse Products</Link>
            </Button>
        </div>
      )
  }

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4">
      <div className="flex flex-col gap-2 border-l-4 border-primary pl-4 mb-8">
        <h1 className="text-3xl font-black uppercase font-headline">Secure <span className="text-primary">Checkout</span></h1>
        <p className="text-muted-foreground font-medium">Review your order and shipping information.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-7 space-y-8">
          <Card className="rounded-[20px] border-primary/10 shadow-xl bg-card overflow-hidden">
            <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
              <CardTitle className="text-xl font-black uppercase tracking-tight">Shipping Information</CardTitle>
              <CardDescription className="font-medium text-xs mt-1">
                <div className="flex items-center gap-2 text-primary">
                    <Truck className="h-4 w-4" />
                    <span>Estimated Delivery: Dhaka (3 Days), Outside (7 Days)</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6 text-left">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Recipient Name*</Label>
                <Input id="name" placeholder="Full Name" value={shippingInfo.name} onChange={handleInputChange} className="rounded-xl h-12 border-primary/10 bg-white focus:border-primary/50" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Contact Phone Number*</Label>
                <Input id="phone" type="tel" placeholder="01XXXXXXXXX" value={shippingInfo.phone} onChange={handleInputChange} className="rounded-xl h-12 border-primary/10 bg-white focus:border-primary/50" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="district" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">District*</Label>
                    <Select value={shippingInfo.district} onValueChange={(v) => handleSelectChange('district', v)}>
                        <SelectTrigger className="rounded-xl h-12 border-primary/10 bg-white"><SelectValue placeholder="Select District"/></SelectTrigger>
                        <SelectContent className="rounded-xl border-white/10">{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="thana" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Thana / Area*</Label>
                    <Select value={shippingInfo.thana} onValueChange={(v) => handleSelectChange('thana', v)} disabled={!shippingInfo.district}>
                        <SelectTrigger className="rounded-xl h-12 border-primary/10 bg-white disabled:opacity-50"><SelectValue placeholder="Select Thana"/></SelectTrigger>
                        <SelectContent className="rounded-xl border-white/10">{(thanas[shippingInfo.district] || []).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Detailed Address (Nearest Landmark)*</Label>
                <Input id="address" placeholder="তোমার নিকটস্থ সুন্দরবন কুরিয়ার সার্ভিসের ঠিকানা দাও" value={shippingInfo.address} onChange={handleInputChange} className="rounded-xl h-12 border-primary/10 bg-white focus:border-primary/50" />
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
                <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm py-2 group">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 relative rounded-lg overflow-hidden border border-primary/10 bg-white">
                                <Image src={item.imageUrl} alt={item.name} fill className="object-cover"/>
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Qty: {item.quantity}</p>
                            </div>
                        </div>
                        <p className="font-black text-foreground">৳{(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                    ))}
                </div>
                
                <Separator className="bg-primary/5" />
                
                <div className="space-y-2.5 text-xs font-bold text-muted-foreground">
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
                    {config?.freeDeliveryThreshold && (
                        <p className="text-[9px] font-black uppercase text-primary/60 tracking-tighter">
                            *(Buy {config.freeDeliveryThreshold}+ items for Free Delivery)
                        </p>
                    )}
                    {discount > 0 && (
                        <div className="flex justify-between items-center text-green-600">
                            <span className="uppercase tracking-widest">Discount</span>
                            <span className="font-black">- ৳{discount.toFixed(0)}</span>
                        </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                        <Input placeholder="Coupon" value={coupon} onChange={e => setCoupon(e.target.value)} disabled={isCouponLoading} className="rounded-lg h-9 bg-muted/50 border-primary/5 text-xs" />
                        <Button variant="outline" size="sm" onClick={handleApplyCoupon} disabled={isCouponLoading || !coupon} className="rounded-lg h-9 px-4 font-black uppercase text-[9px] tracking-widest">
                            {isCouponLoading ? <Loader2 className="h-3 w-3 animate-spin"/> : 'Apply'}
                        </Button>
                    </div>
                </div>
                
                <Separator className="bg-primary/10 h-0.5" />
                
                <div className="flex justify-between items-end py-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">Total Payable</p>
                  <p className="text-3xl font-black text-primary tracking-tighter leading-none">৳{totalPayable.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex flex-col gap-6">
                <div className="flex items-start space-x-3 text-left">
                    <Checkbox id="terms1" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(!!checked)} className="mt-1 rounded-md" />
                    <div className="grid gap-1">
                        <Label htmlFor="terms1" className="text-xs font-black uppercase tracking-tight text-foreground cursor-pointer">Agree to Platform Policies</Label>
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                            I accept the <Link href="/terms" className="text-primary hover:underline">Refund Policy</Link>, <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                        </p>
                    </div>
                </div>
               <Button size="lg" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 text-sm" onClick={handlePlaceOrder} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PackageCheck className="mr-2 h-5 w-5" />}
                Confirm Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
