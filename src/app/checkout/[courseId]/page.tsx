
'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Course } from '@/lib/types';
import { getCourse, getPromoCodeForUserAndCourse, getUserByClassRoll } from '@/lib/firebase/firestore';
import { applyPromoCodeAction } from '@/app/actions/promo.actions';
import { prebookCourseAction, enrollInCourseAction } from '@/app/actions/enrollment.actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, User, Bookmark, TicketPercent } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { safeToDate } from '@/lib/utils';
import { trackPurchase } from '@/lib/fpixel';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import Confetti from 'react-confetti';

// Local hook to avoid react-use optimization issues
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

export default function CheckoutPage({ params }: { params: { courseId: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userInfo } = useAuth();
  const { width, height } = useWindowSize();
  
  const cycleId = searchParams.get('cycleId');

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoLoading, setPromoLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [referralDiscount, setReferralDiscount] = useState(0);
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
    
    const result = await applyPromoCodeAction(params.courseId, code, userInfo?.uid);

    if (result.success) {
      setDiscount(result.discount!);
      if (!codeToApply) {
        toast({ title: 'Success!', description: result.message });
      }
    } else {
      setError(result.message);
      setDiscount(0);
    }
    setPromoLoading(false);
  }, [params.courseId, promoCode, toast, userInfo?.uid]);

  useEffect(() => {
    async function fetchCourse() {
        try {
            const courseData = await getCourse(params.courseId);
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
  }, [params.courseId]);
  
  useEffect(() => {
    if (userInfo && course && !cycleId) {
      const checkForPrebookPromo = async () => {
        const promo = await getPromoCodeForUserAndCourse(userInfo.uid, course.id!);
        if (promo) {
          setPromoCode(promo.code);
          await handleApplyPromo(promo.code);
          toast({
              title: 'Pre-booking Discount Applied!',
              description: `Your special code ${promo.code} has been automatically applied.`,
          });
        }
      }
      checkForPrebookPromo();
    }
  }, [userInfo, course, cycleId, handleApplyPromo, toast]);


  const handlePayment = async () => {
    if (!userInfo || !course) {
        toast({
            title: 'Not logged in',
            description: 'You must be logged in to enroll in a course.',
            variant: 'destructive',
        });
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
        const finalPrice = parseFloat(price.replace(/[^0-9.]/g, '')) - discount - referralDiscount;
        trackPurchase(finalPrice, 'BDT', [{id: course.id!, quantity: 1}]);
        toast({
            title: "Success!",
            description: result.message
        });
        setTimeout(() => router.push('/student/my-courses'), 4000);
    } else {
        toast({
            title: 'Action Failed',
            description: result.message,
            variant: 'destructive'
        });
        setIsProcessing(false);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <LoadingSpinner className="w-12 h-12"/>
        </div>
    );
  }

  if (!course) {
    return notFound();
  }

  const isPrebooking = course.isPrebooking && course.prebookingEndDate && safeToDate(course.prebookingEndDate) > new Date();
  const hasDiscount = course.discountPrice && parseFloat(course.discountPrice.replace(/[^0-9.]/g, '')) > 0;
  
  const selectedCycle = cycleId ? course.cycles?.find(c => c.id === cycleId) : null;
  const itemTitle = selectedCycle ? `${course.title} - ${selectedCycle.title}` : course.title;
  
  const price = selectedCycle 
    ? selectedCycle.price 
    : (isPrebooking ? course.prebookingPrice : (hasDiscount ? course.discountPrice : course.price));
  
  const listPrice = parseFloat((selectedCycle ? selectedCycle.price : course.price)?.replace(/[^0-9.]/g, '') || '0');
  
  const effectivePrice = parseFloat(price?.replace(/[^0-9.]/g, '') || '0');

  const courseDiscount = listPrice - effectivePrice;
  const finalPrice = effectivePrice - discount - referralDiscount;

  return (
    <div className="container mx-auto max-w-4xl py-12">
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={200} recycle={false} gravity={0.2} />}
      <h1 className="font-headline text-3xl font-bold mb-8 text-center sm:text-left">
        Complete Your Purchase
      </h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card className="glassmorphism-card">
            <CardHeader className="flex flex-row gap-4 items-start">
              <Image src={course.imageUrl} alt={course.title} width={120} height={80} className="rounded-md object-cover aspect-video" />
              <div>
                <CardTitle>{itemTitle}</CardTitle>
                <CardDescription>{course.instructors?.[0]?.name}</CardDescription>
                {isPrebooking && !selectedCycle && <Badge className="mt-2" variant="warning">Pre-booking Offer</Badge>}
                {selectedCycle && <Badge className="mt-2" variant="secondary">Cycle Enrollment</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Promo Code</h3>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter promo code" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoLoading || !!selectedCycle || isPrebooking || showConfetti}
                  />
                  <Button onClick={() => handleApplyPromo()} variant="outline" disabled={promoLoading || !promoCode || !!selectedCycle || isPrebooking || showConfetti}>
                    {promoLoading ? <Loader2 className="animate-spin" /> : 'Apply'}
                  </Button>
                </div>
                 {(!!selectedCycle || isPrebooking) && <p className="text-xs text-muted-foreground">Promo codes cannot be applied to cycle purchases or pre-bookings.</p>}
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
               {isFirstEnrollment && (
                <div>
                    <h3 className="font-semibold">Referral Code</h3>
                    <p className="text-xs text-muted-foreground mb-2">Know a friend on RDC? Use their Class Roll as a referral code for a discount!</p>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Enter friend's Class Roll" 
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value)}
                            disabled={showConfetti}
                        />
                    </div>
                </div>
               )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="glassmorphism-card">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Original Price</span>
                <span>৳{listPrice.toFixed(2)}</span>
              </div>
              {courseDiscount > 0 && !selectedCycle && (
                <div className="flex justify-between text-green-600">
                  <span>Course Discount</span>
                  <span>- ৳{courseDiscount.toFixed(2)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                    <span>Promo Code Discount</span>
                    <span>- ৳{discount.toFixed(2)}</span>
                </div>
              )}
              <hr className="my-2"/>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>৳{finalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
            <div className='p-6 pt-0'>
                {numbersMissing && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Profile Incomplete</AlertTitle>
                        <AlertDescription>
                            You must add your and your guardian's mobile number to your profile before you can enroll.
                            <Button asChild variant="link" className="p-0 h-auto ml-1">
                                <Link href="/student/profile">Update Profile</Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
                <Button onClick={handlePayment} className="w-full" size="lg" disabled={isProcessing || numbersMissing || showConfetti}>
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {showConfetti ? 'Successful!' : (isPrebooking && !cycleId ? 'Pre-book Now' : 'Proceed to Payment')}
                </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
