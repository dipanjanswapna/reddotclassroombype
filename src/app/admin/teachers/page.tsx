

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, CheckCircle, XCircle, MoreVertical, Trash2, Loader2, PlusCircle } from 'lucide-react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Instructor } from '@/lib/types';
import { getInstructors } from '@/lib/firebase/firestore';
import { updateInstructorStatusAction, adminInviteInstructorAction, deleteInstructorAction } from '@/app/actions/instructor.actions';
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
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [instructorToDelete, setInstructorToDelete] = useState<Instructor | null>(null);

  // Invite form state
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');

  const fetchData = async () => {
    try {
        const fetchedInstructors = await getInstructors();
        setInstructors(fetchedInstructors);
    } catch(e) {
        toast({ title: 'Error', description: 'Could not fetch instructors', variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [toast]);

  const handleStatusChange = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    const result = await updateInstructorStatusAction(id, newStatus);
    if(result.success) {
      fetchData();
      toast({
        title: "Instructor Status Updated",
        description: `The instructor has been ${newStatus.toLowerCase()}.`,
      });
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };

  const handleInviteSubmit = async () => {
      if (!name || !title) {
          toast({ title: 'Error', description: 'Please fill all fields.', variant: 'destructive'});
          return;
      }
      setIsSaving(true);
      const result = await adminInviteInstructorAction({ name, title });
      if(result.success) {
          fetchData();
          toast({ title: 'Teacher Invited', description: result.message });
          setIsInviteOpen(false);
          setName('');
          setTitle('');
      } else {
          toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
      setIsSaving(false);
  };

  const handleDelete = async () => {
      if (!instructorToDelete?.id) return;
      const result = await deleteInstructorAction(instructorToDelete.id);
      if (result.success) {
          fetchData();
          toast({ title: 'Instructor Deleted', description: result.message, variant: 'destructive' });
      } else {
          toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
      setInstructorToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <>
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">
                        Teacher Management
                    </h1>
                    <p className="mt-1 text-lg text-muted-foreground">
                        Approve, manage, and view all teacher profiles on the platform.
                    </p>
                </div>
                 <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2" />
                            Invite Teacher
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite New Teacher</DialogTitle>
                            <DialogDescription>They will be automatically approved and added to the platform.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Name</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3"/></div>
                            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="title" className="text-right">Title</Label><Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Physics Expert" className="col-span-3"/></div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button onClick={handleInviteSubmit} disabled={isSaving}>
                                {isSaving && <Loader2 className="animate-spin mr-2"/>} Invite & Approve
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                 {instructor.status === 'Pending Approval' && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(instructor.id!, 'Approved')}><CheckCircle className="mr-2"/>Approve</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(instructor.id!, 'Rejected')}><XCircle className="mr-2"/>Reject</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                    </>
                                                )}
                                                {instructor.status === 'Approved' && (
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/teachers/${instructor.slug}`} target="_blank"><Eye className="mr-2 h-4 w-4" />View Profile</Link>
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem className="text-destructive" onClick={() => setInstructorToDelete(instructor)}><Trash2 className="mr-2"/>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
         <AlertDialog open={!!instructorToDelete} onOpenChange={(open) => !open && setInstructorToDelete(null)}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete the instructor <strong>{instructorToDelete?.name}</strong>. This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
