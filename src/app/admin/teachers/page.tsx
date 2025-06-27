
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { allInstructors as initialInstructors } from '@/lib/mock-data';

export default function TeacherManagementPage() {
  const [instructors, setInstructors] = useState(initialInstructors);

  const handleStatusChange = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setInstructors(instructors.map(inst => inst.id === id ? { ...inst, status: newStatus } : inst));
  };
  
  const getStatusBadge = (status: 'Approved' | 'Pending Approval' | 'Rejected') => {
    switch(status) {
        case 'Approved': return <Badge className="bg-green-500 text-white hover:bg-green-600">Approved</Badge>;
        case 'Pending Approval': return <Badge className="bg-yellow-500 text-black hover:bg-yellow-600">Pending Approval</Badge>;
        case 'Rejected': return <Badge className="bg-red-500 text-white hover:bg-red-600">Rejected</Badge>;
        default: return <Badge>{status}</Badge>;
    }
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
                                    {getStatusBadge(instructor.status)}
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
