

'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Course } from '@/lib/types';
import { getCourse, getPromoCodeForUserAndCourse } from '@/lib/firebase/firestore';
import { applyPromoCodeAction } from '@/app/actions/promo.actions';
import { enrollInCourseAction } from '@/app/actions/enrollment.actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { safeToDate } from '@/lib/utils';

export default function PartnerCheckoutPage({ params }: { params: { site: string, courseId: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const { userInfo } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoLoading, setPromoLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');

  const numbersMissing = !!userInfo && (!userInfo.mobileNumber || !userInfo.guardianMobileNumber);

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
    if (userInfo && course) {
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
  }, [userInfo, course, handleApplyPromo, toast]);

  
  const handlePayment = async () => {
     if (!userInfo) {
        toast({
            title: 'Not logged in',
            description: 'You must be logged in to enroll in a course.',
            variant: 'destructive',
        });
        router.push('/login');
        return;
    }
    
    setIsProcessing(true);
    
    const result = await enrollInCourseAction({ courseId: course!.id!, userId: userInfo.uid });

    if (result.success) {
        toast({
            title: 'Enrollment Successful!',
            description: `You have successfully enrolled in "${course!.title}". Redirecting...`
        });
        setTimeout(() => router.push('/'), 2000);
    } else {
        toast({
            title: 'Enrollment Failed',
            description: result.message,
            variant: 'destructive'
        });
    }
    setIsProcessing(false);
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
  
  const originalPrice = parseFloat((isPrebooking ? course.prebookingPrice : (hasDiscount ? course.discountPrice : course.price))!.replace(/[^0-9.]/g, ''));
  const finalPrice = originalPrice - discount;

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="font-headline text-3xl font-bold mb-8">
        {isPrebooking ? 'Complete Your Pre-booking' : 'Complete Your Purchase'}
      </h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader className="flex flex-row gap-4 items-start">
              <Image src={course.imageUrl} alt={course.title} width={120} height={80} className="rounded-md object-cover aspect-video" />
              <div>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.instructors[0].name}</CardDescription>
                {isPrebooking && <Badge className="mt-2" variant="warning">Pre-booking Offer</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="font-semibold">Promo Code</h3>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter promo code" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoLoading}
                  />
                  <Button onClick={() => handleApplyPromo()} variant="outline" disabled={promoLoading || !promoCode}>
                    {promoLoading ? <Loader2 className="animate-spin" /> : 'Apply'}
                  </Button>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Original Price</span>
                <span>৳{originalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- ৳{discount.toFixed(2)}</span>
              </div>
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
                <Button onClick={handlePayment} className="w-full" size="lg" disabled={isProcessing || numbersMissing}>
                    {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : null}
                    {isPrebooking ? 'Pay Pre-booking Fee' : 'Proceed to Payment'}
                </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
