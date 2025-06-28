
'use client';

import { useState } from 'react';
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
import { allInstructors as initialInstructors, Instructor } from '@/lib/mock-data';
import type { VariantProps } from 'class-variance-authority';
import { useToast } from '@/components/ui/use-toast';

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
  const [instructors, setInstructors] = useState(initialInstructors);
  const { toast } = useToast();

  const handleStatusChange = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setInstructors(instructors.map(inst => inst.id === id ? { ...inst, status: newStatus } : inst));
    toast({
      title: "Instructor Status Updated",
      description: `The instructor has been ${newStatus.toLowerCase()}.`,
    });
  };

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
                                                <Button variant="outline" size="sm" className="border-green-400 text-green-700 hover:bg-green-100" onClick={() => handleStatusChange(instructor.id, 'Approved')}>
                                                    <CheckCircle className="mr-2 h-4 w-4"/>
                                                    Approve
                                                </Button>
                                                <Button variant="outline" size="sm" className="border-red-400 text-red-700 hover:bg-red-100" onClick={() => handleStatusChange(instructor.id, 'Rejected')}>
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
