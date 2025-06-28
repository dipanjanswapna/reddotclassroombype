
'use client';

import { useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { courses, allPromoCodes, Course, PromoCode } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tag } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { Badge } from '@/components/ui/badge';

export default function CheckoutPage({ params }: { params: { site: string, courseId: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const { language } = useLanguage();

  const course = courses.find(c => c.id === params.courseId);

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');

  if (!course) {
    notFound();
  }

  const isPrebooking = course.isPrebooking && course.prebookingEndDate && new Date(course.prebookingEndDate) > new Date();
  const originalPrice = parseFloat((isPrebooking ? course.prebookingPrice! : course.price).replace(/[^0-9.]/g, ''));
  const finalPrice = originalPrice - discount;

  const handleApplyPromo = () => {
    setError('');
    const matchedCode = allPromoCodes.find(p => p.code.toLowerCase() === promoCode.toLowerCase());
    
    if (!matchedCode) {
      setError('Invalid promo code.');
      return;
    }
    if (!matchedCode.isActive || new Date(matchedCode.expiresAt) < new Date()) {
      setError('This promo code has expired.');
      return;
    }
    if (matchedCode.usageCount >= matchedCode.usageLimit) {
      setError('This promo code has reached its usage limit.');
      return;
    }
    if (!matchedCode.applicableCourseIds.includes('all') && !matchedCode.applicableCourseIds.includes(course.id)) {
        setError('This code is not valid for this course.');
        return;
    }

    let calculatedDiscount = 0;
    if (matchedCode.type === 'fixed') {
        calculatedDiscount = matchedCode.value;
    } else { // percentage
        calculatedDiscount = (originalPrice * matchedCode.value) / 100;
    }
    
    setDiscount(calculatedDiscount);
    toast({ title: 'Success!', description: 'Promo code applied successfully.' });
  };
  
  const handlePayment = () => {
      // In a real app, this would trigger the payment gateway integration
      toast({
          title: isPrebooking ? 'Pre-booking Successful!' : 'Enrollment Successful!',
          description: `You have successfully enrolled in "${course.title}".`
      });
      router.push('/student/courses');
  };

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
                  />
                  <Button onClick={handleApplyPromo} variant="outline">Apply</Button>
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
                <Button onClick={handlePayment} className="w-full" size="lg">
                    {isPrebooking ? 'Pay Pre-booking Fee' : 'Proceed to Payment'}
                </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
