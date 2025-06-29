
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Instructor } from '@/lib/types';
import { getInstructors } from '@/lib/firebase/firestore';
import { updateInstructorStatusAction } from '@/app/actions';
import type { VariantProps } from 'class-variance-authority';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';

const getStatusBadgeVariant = (status: Instructor['status']): VariantProps<typeof badgeVariants>['variant'] => {
  switch (status) {
    case 'Approved':
      return 'accent';
    case 'Pending Approval':
      return 'warning';
    case 'Rejected':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export default function TeacherManagementPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
        try {
            const fetchedInstructors = await getInstructors();
            setInstructors(fetchedInstructors);
        } catch(e) {
            toast({ title: 'Error', description: 'Could not fetch instructors', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [toast]);

  const handleStatusChange = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    const result = await updateInstructorStatusAction(id, newStatus);
    if(result.success) {
      setInstructors(instructors.map(inst => inst.id === id ? { ...inst, status: newStatus } : inst));
      toast({
        title: "Instructor Status Updated",
        description: `The instructor has been ${newStatus.toLowerCase()}.`,
      });
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight">
                Teacher Management
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
                Approve, manage, and view all teacher profiles on the platform.
            </p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>All Teachers</CardTitle>
                <CardDescription>A list of all teacher accounts in the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Expertise</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {instructors.map((instructor) => (
                            <TableRow key={instructor.id}>
                                <TableCell className="font-medium">{instructor.name}</TableCell>
                                <TableCell>{instructor.title}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(instructor.status)}>{instructor.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex gap-2 justify-end">
                                        {instructor.status === 'Pending Approval' && (
                                            <>
                                                <Button variant="outline" size="sm" className="border-green-400 text-green-700 hover:bg-green-100" onClick={() => handleStatusChange(instructor.id!, 'Approved')}>
                                                    <CheckCircle className="mr-2 h-4 w-4"/>
                                                    Approve
                                                </Button>
                                                <Button variant="outline" size="sm" className="border-red-400 text-red-700 hover:bg-red-100" onClick={() => handleStatusChange(instructor.id!, 'Rejected')}>
                                                    <XCircle className="mr-2 h-4 w-4"/>
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        {instructor.status === 'Approved' && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/teachers/${instructor.slug}`} target="_blank">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Profile
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
