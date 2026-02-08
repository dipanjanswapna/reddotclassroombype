'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { notFound, useRouter, useSearchParams, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Course, CourseCycle } from '@/lib/types';
import { getCourse, getPromoCodeForUserAndCourse } from '@/lib/firebase/firestore';
import { applyPromoCodeAction } from '@/app/actions/promo.actions';
import { prebookCourseAction, enrollInCourseAction } from '@/app/actions/enrollment.actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle2, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { safeToDate } from '@/lib/utils';
import { trackPurchase } from '@/lib/fpixel';
import Confetti from 'react-confetti';

function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

export default function CheckoutPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userInfo, loading: authLoading } = useAuth();
  const { width, height } = useWindowSize();
  
  const cycleId = searchParams.get('cycleId');

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoLoading, setPromoLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [promoCode, setPromoCode] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  
  const numbersMissing = !!userInfo && (!userInfo.mobileNumber || !userInfo.guardianMobileNumber);
  const isFirstEnrollment = userInfo?.enrolledCourses?.length === 0;

  const handleApplyPromo = useCallback(async (codeToApply?: string) => {
    const code = codeToApply || promoCode;
    if (!code) return;

    setError('');
    setPromoLoading(true);
    
    const result = await applyPromoCodeAction(courseId, code, userInfo?.uid);

    if (result.success) {
      setDiscount(result.discount!);
      if (!codeToApply) {
        toast({ title: 'Auth Success', description: result.message });
      }
    } else {
      setError(result.message);
      setDiscount(0);
    }
    setPromoLoading(false);
  }, [courseId, promoCode, toast, userInfo?.uid]);

  useEffect(() => {
    async function fetchCourse() {
        try {
            const courseData = await getCourse(courseId);
            if (courseData) {
                setCourse(courseData);
            } else {
                notFound();
            }
        } catch(e) {
            console.error(e);
            notFound();
        } finally {
            setLoading(false);
        }
    }
    fetchCourse();
  }, [courseId]);
  
  useEffect(() => {
    if (userInfo && course && !cycleId) {
      const checkForPrebookPromo = async () => {
        const promo = await getPromoCodeForUserAndCourse(userInfo.uid, course.id!);
        if (promo) {
          setPromoCode(promo.code);
          await handleApplyPromo(promo.code);
          toast({
              title: 'Pre-booking Artifact Active',
              description: `Verification successful. Discount code ${promo.code} applied.`,
          });
        }
      }
      checkForPrebookPromo();
    }
  }, [userInfo, course, cycleId, handleApplyPromo, toast]);


  const isPrebooking = course?.isPrebooking && course.prebookingEndDate && safeToDate(course.prebookingEndDate) > new Date();
  const selectedCycle = useMemo(() => cycleId ? course?.cycles?.find(c => c.id === cycleId) : null, [course, cycleId]);
  
  const priceString = selectedCycle 
    ? selectedCycle.price 
    : (isPrebooking ? course?.prebookingPrice : (course?.discountPrice || course?.price));
  
  const effectivePrice = useMemo(() => parseFloat(priceString?.replace(/[^0-9.]/g, '') || '0'), [priceString]);
  const finalPrice = useMemo(() => Math.max(0, effectivePrice - discount), [effectivePrice, discount]);

  const handlePayment = async () => {
    if (!userInfo || !course) {
        toast({ title: 'Sync Denied', description: 'Institutional login required.', variant: 'destructive' });
        router.push('/login');
        return;
    }
    
    setIsProcessing(true);
    
    const action = course.isPrebooking && !cycleId ? prebookCourseAction : enrollInCourseAction;
    const result = await action({ 
        courseId: course.id!, 
        userId: userInfo.uid, 
        cycleId: cycleId || undefined,
        referralCode: referralCode || undefined
    });
    
    if (result.success) {
        setShowConfetti(true);
        trackPurchase(finalPrice, 'BDT', [{id: course.id!, quantity: 1}]);
        toast({ title: "Authorization Successful", description: result.message });
        setTimeout(() => router.push('/student/my-courses'), 4000);
    } else {
        toast({ title: 'Sync Protocol Failed', description: result.message, variant: 'destructive' });
        setIsProcessing(false);
    }
  };

  if (loading || authLoading) return <div className="flex items-center justify-center h-screen"><LoadingSpinner className="w-12 h-12"/></div>;
  if (!course) return notFound();

  return (
    <div className="container mx-auto max-w-6xl py-10 md:py-20 px-4 overflow-hidden">
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={300} recycle={false} gravity={0.15} />}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="text-left space-y-2">
              <h1 className="font-headline text-3xl md:text-5xl font-black uppercase tracking-tight text-primary">Secure Authorization</h1>
              <p className="text-lg text-muted-foreground font-medium">Finalizing knowledge synchronization for {course.title}.</p>
              <div className="h-1.5 w-24 bg-primary rounded-full shadow-md" />
          </div>
          <div className="flex items-center gap-3 bg-muted/50 p-4 rounded-2xl border-2 border-primary/10 shadow-sm">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <div className="text-left"><p className="font-black uppercase text-[10px] tracking-widest text-primary/60">Node Integrity</p><p className="text-xs font-bold">100% Encrypted Sync</p></div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-8">
          <Card className="rounded-[2.5rem] border-2 border-primary/10 shadow-2xl bg-card overflow-hidden transition-all hover:border-primary/30">
            <CardHeader className="p-8 md:p-10 border-b-2 border-primary/5 bg-primary/5 flex flex-row gap-6 items-center">
              <div className="relative h-20 w-32 md:h-24 md:w-40 shrink-0 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl">
                <Image src={course.imageUrl} alt={course.title} fill className="object-cover" />
              </div>
              <div className="text-left overflow-hidden">
                <CardTitle className="text-lg md:text-2xl font-black uppercase tracking-tight truncate">{selectedCycle ? `${course.title}: ${selectedCycle.title}` : course.title}</CardTitle>
                <CardDescription className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60 mt-1">Lead: {course.instructors?.[0]?.name}</CardDescription>
                <div className="flex flex-wrap gap-2 mt-3">
                    {isPrebooking && !selectedCycle && <Badge variant="warning" className="rounded-lg px-3 py-1 font-black uppercase text-[9px] tracking-widest shadow-sm">Early Bird Active</Badge>}
                    {selectedCycle && <Badge variant="secondary" className="rounded-lg px-3 py-1 font-black uppercase text-[9px] tracking-widest shadow-sm">Modular Authorization</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 md:p-10 space-y-10">
              <div className="space-y-4">
                <Label className="font-black uppercase text-[10px] tracking-[0.25em] text-primary/60 ml-1">Incentive Payload Code</Label>
                <div className="flex gap-3">
                  <Input 
                    placeholder="ENTER AUTH CODE..." 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    disabled={promoLoading || !!selectedCycle || isPrebooking || showConfetti}
                    className="h-14 rounded-xl border-2 font-black tracking-widest bg-muted/10 focus-visible:ring-primary"
                  />
                  <Button onClick={() => handleApplyPromo()} variant="outline" disabled={promoLoading || !promoCode || !!selectedCycle || isPrebooking || showConfetti} className="h-14 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest border-2 hover:bg-primary hover:text-white transition-all shadow-xl">
                    {promoLoading ? <Loader2 className="animate-spin" /> : 'Validate'}
                  </Button>
                </div>
                 {(!!selectedCycle || isPrebooking) && <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic pl-1">Knowledge cycles and pre-bookings operate on fixed institutional rates.</p>}
                {error && <Alert variant="destructive" className="rounded-xl border-2"><AlertTriangle className="h-4 w-4"/><AlertDescription className="font-bold">{error}</AlertDescription></Alert>}
              </div>

               {isFirstEnrollment && (
                <div className="space-y-4 pt-6 border-t-2 border-primary/5">
                    <Label className="font-black uppercase text-[10px] tracking-[0.25em] text-primary/60 ml-1">Affiliate Reference Roll</Label>
                    <Input 
                        placeholder="ENTER FRIEND'S CLASS ROLL..." 
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        disabled={showConfetti}
                        className="h-14 rounded-xl border-2 font-black tracking-widest bg-muted/10 focus-visible:ring-primary"
                    />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic pl-1">New node discount applied upon successful validation.</p>
                </div>
               )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="rounded-[2.5rem] border-2 border-primary/20 shadow-2xl overflow-hidden bg-card sticky top-24">
            <CardHeader className="bg-muted/30 p-8 md:p-10 border-b-2 border-primary/5">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Synchronization Invoice</CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-10 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wider">
                    <span className="text-muted-foreground">Listing Value</span>
                    <span>৳{effectivePrice.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between items-center text-sm font-black uppercase tracking-wider text-green-600">
                        <span>Code Calibration</span>
                        <span>- ৳{discount.toFixed(2)}</span>
                    </div>
                )}
                <Separator className="bg-primary/10 h-0.5" />
                <div className="flex justify-between items-baseline pt-2">
                    <span className="text-base font-black uppercase tracking-widest text-foreground">Total Payable</span>
                    <span className="text-4xl font-black text-primary tracking-tighter">৳{finalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="pt-6">
                {numbersMissing && (
                    <Alert variant="destructive" className="mb-6 rounded-2xl border-2 shadow-xl shadow-destructive/10 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="h-5 w-5" />
                        <AlertTitle className="font-black uppercase text-xs">Profile Incomplete</AlertTitle>
                        <AlertDescription className="text-sm font-medium mt-2">
                            Institutional protocols require a complete profile (Mobile + Guardian Contact) for node sync.
                            <Button asChild variant="link" className="p-0 h-auto ml-1 font-black text-xs text-destructive hover:text-destructive/80">Update Identity Archive &rarr;</Button>
                        </AlertDescription>
                    </Alert>
                )}
                <Button onClick={handlePayment} className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.25em] text-[10px] shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white active:scale-95 transition-all border-none" disabled={isProcessing || numbersMissing || showConfetti}>
                    {isProcessing ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Zap className="mr-3 h-6 w-6 fill-current" />}
                    {showConfetti ? 'AUTHORIZATION COMPLETE' : (isPrebooking && !cycleId ? 'EXECUTE PRE-BOOKING' : 'INITIATE FINAL SYNC')}
                </Button>
              </div>
            </CardContent>
            <div className="p-10 pt-0">
                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 justify-center">
                    <ArrowRight className="h-3 w-3" /> 
                    Instant Authorization Mode Active
                </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
