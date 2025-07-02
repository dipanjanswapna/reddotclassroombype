
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
import { getInstructors, getOrganizationByUserId } from '@/lib/firebase/firestore';
import { inviteInstructorAction, removeInstructorFromOrgAction } from '@/app/actions/instructor.actions';
import type { Instructor, Organization } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PlusCircle, MoreVertical, Trash2, Edit, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Instructor Management',
    description: 'Manage all instructors for your organization.',
};


export default function SellerTeacherManagementPage() {
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTitle, setInviteTitle] = useState('');
  
  const fetchInstructors = async (orgId: string) => {
      try {
          const allInstructors = await getInstructors();
          setInstructors(allInstructors.filter(inst => inst.organizationId === orgId));
      } catch (error) {
          console.error("Failed to fetch instructors:", error);
          toast({ title: 'Error', description: 'Could not fetch instructors.', variant: 'destructive'});
      }
  };

  useEffect(() => {
    if (!userInfo) return;
    
    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const org = await getOrganizationByUserId(userInfo.uid);
            if (org) {
                setOrganization(org);
                await fetchInstructors(org.id!);
            } else {
                 toast({ title: 'Error', description: 'Could not find your organization details.', variant: 'destructive'});
            }
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
            toast({ title: 'Error', description: 'An error occurred while loading your data.', variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    };

    fetchInitialData();
  }, [userInfo, toast]);

  const handleRemoveTeacher = async (id: string) => {
    const result = await removeInstructorFromOrgAction(id);
    if (result.success && organization) {
      fetchInstructors(organization.id!);
      toast({ title: "Instructor Removed", description: "The instructor has been removed from your organization.", variant: 'destructive'});
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const handleInviteTeacher = async () => {
    if (!inviteName || !inviteEmail || !inviteTitle || !organization) {
      toast({ title: "Missing Information", description: "Please fill out all fields.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const result = await inviteInstructorAction({
        name: inviteName,
        title: inviteTitle,
        avatarUrl: 'https://placehold.co/100x100.png',
        dataAiHint: 'person teacher',
        slug: inviteName.toLowerCase().replace(/\s+/g, '-'),
        organizationId: organization.id,
    });

    if (result.success) {
      await fetchInstructors(organization.id!);
      toast({ title: 'Invitation Sent!', description: `${inviteName} has been invited to join your organization.` });
      setIsInviteOpen(false);
      setInviteName('');
      setInviteEmail('');
      setInviteTitle('');
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setIsSaving(false);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Instructor Management
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">
            Manage all instructors for your organization.
          </p>
        </div>
         <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Invite New Instructor
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite New Instructor</DialogTitle>
                    <DialogDescription>Enter the details of the instructor you want to invite to your organization.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="invite-name" className="text-right">Name</Label>
                        <Input id="invite-name" value={inviteName} onChange={e => setInviteName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="invite-email" className="text-right">Email</Label>
                        <Input id="invite-email" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="invite-title" className="text-right">Title</Label>
                        <Input id="invite-title" value={inviteTitle} onChange={e => setInviteTitle(e.target.value)} placeholder="e.g., Biology Instructor" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleInviteTeacher} disabled={isSaving}>
                        {isSaving && <Loader2 className="animate-spin mr-2"/>}
                        Send Invitation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Instructors</CardTitle>
          <CardDescription>A list of all instructors in your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instructor</TableHead>
                <TableHead>Title/Expertise</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructors.length > 0 ? instructors.map((inst) => (
                <TableRow key={inst.id}>
                  <TableCell className="flex items-center gap-3">
                     <Avatar className="h-9 w-9">
                        <AvatarImage src={inst.avatarUrl} alt={inst.name} />
                        <AvatarFallback>{inst.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{inst.name}</span>
                  </TableCell>
                  <TableCell>
                    {inst.title}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem><Edit className="mr-2 h-4 w-4"/> Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleRemoveTeacher(inst.id!)}>
                                <Trash2 className="mr-2 h-4 w-4"/> Remove
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No instructors found for your organization.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
