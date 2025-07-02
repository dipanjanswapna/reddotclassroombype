
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { getCourses } from '@/lib/firebase/firestore';
import { Course } from '@/lib/types';
import { Copy, Check } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Referral Links',
    description: 'Generate unique affiliate referral links for any course.',
};

export default function AffiliateLinksPage() {
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const [copiedLink, setCopiedLink] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const affiliateId = userInfo?.id || 'default_affiliate_id';

  useEffect(() => {
    async function fetchCourses() {
      try {
        const fetchedCourses = await getCourses();
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        toast({
          title: "Error",
          description: "Could not fetch courses.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, [toast]);

  const handleGenerateAndCopy = (courseId: string) => {
    const link = `https://rdc.com/courses/${courseId}?ref=${affiliateId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    toast({
      title: "Link Copied!",
      description: "Your unique referral link has been copied to the clipboard.",
    });
    setTimeout(() => setCopiedLink(''), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Referral Links
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Generate unique referral links for any course to share with your audience.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Course List</CardTitle>
          <CardDescription>Click to generate and copy a referral link for a course.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Generate Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.filter(c => c.status === 'Published' && !c.isArchived).map((course) => {
                  const generatedLink = `https://rdc.com/courses/${course.id}?ref=${affiliateId}`;
                  const isCopied = copiedLink === generatedLink;

                  return (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>{course.category}</TableCell>
                      <TableCell className="text-right">
                        <Button onClick={() => handleGenerateAndCopy(course.id!)} size="sm" variant={isCopied ? "accent" : "outline"}>
                          {isCopied ? <Check className="mr-2" /> : <Copy className="mr-2" />}
                          {isCopied ? 'Copied' : 'Copy Link'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
