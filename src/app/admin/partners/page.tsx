
'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, CheckCircle, XCircle, MoreVertical, Trash2, Loader2 } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast';
import { Organization } from '@/lib/types';
import { getOrganizations } from '@/lib/firebase/firestore';
import { updateOrganizationStatusAction, inviteSellerAction, deleteOrganizationAction } from '@/app/actions/organization.actions';
import { LoadingSpinner } from '@/components/loading-spinner';

const getStatusBadgeVariant = (status: Organization['status']) => {
  switch (status) {
    case 'approved':
      return 'accent';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export default function AdminPartnerManagementPage() {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);

  // Invite form state
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const fetchData = async () => {
    try {
      const fetchedOrgs = await getOrganizations();
      setOrganizations(fetchedOrgs);
    } catch (e) {
      toast({ title: 'Error', description: 'Could not fetch organizations', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [toast]);

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
    const result = await updateOrganizationStatusAction(id, newStatus);
    if (result.success) {
      fetchData(); // Re-fetch to get updated list
      toast({
        title: "Seller Status Updated",
        description: `The organization has been ${newStatus}.`,
      });
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };
  
  const handleInviteSubmit = async () => {
    if (!name || !contactEmail || !subdomain) {
        toast({ title: 'Error', description: 'Please fill all required fields.', variant: 'destructive' });
        return;
    }
    setIsSaving(true);
    const result = await inviteSellerAction({
        name,
        contactEmail,
        subdomain,
        logoUrl: logoUrl || `https://placehold.co/100x100.png?text=${name.substring(0,2)}`,
        primaryColor: '346.8 77.2% 49.8%', 
        secondaryColor: '210 40% 96.1%',
    });
    if (result.success) {
        fetchData();
        toast({ title: "Seller Invited", description: result.message });
        setIsInviteOpen(false);
        setName('');
        setContactEmail('');
        setSubdomain('');
        setLogoUrl('');
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setIsSaving(false);
  };
  
  const handleDelete = async () => {
      if (!orgToDelete || !orgToDelete.id) return;
      const result = await deleteOrganizationAction(orgToDelete.id);
      if (result.success) {
          fetchData();
          toast({ title: 'Seller Deleted', description: result.message, variant: 'destructive' });
      } else {
          toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
      setOrgToDelete(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">
              Seller Management
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
              Approve, manage, and view all 3rd-party sellers on the platform.
            </p>
          </div>
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Invite Seller
                </Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Invite New Seller</DialogTitle>
                      <DialogDescription>Fill out the details to invite a new organization to the platform. They will be approved automatically.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Name</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3"/></div>
                      <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="email" className="text-right">Email</Label><Input id="email" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="col-span-3"/></div>
                      <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="subdomain" className="text-right">Subdomain</Label><Input id="subdomain" value={subdomain} onChange={e => setSubdomain(e.target.value)} className="col-span-3"/></div>
                      <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="logo" className="text-right">Logo URL</Label><Input id="logo" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="col-span-3"/></div>
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
            <CardTitle>All Seller Organizations</CardTitle>
            <CardDescription>A list of all seller organizations in the system, including pending applications.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Subdomain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="flex items-center gap-3">
                      <img src={org.logoUrl} alt={org.name} width={40} height={40} className="rounded-full bg-muted object-cover" />
                      <span className="font-medium">{org.name}</span>
                    </TableCell>
                    <TableCell>{org.contactEmail || 'N/A'}</TableCell>
                    <TableCell>{org.subdomain || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(org.status)} className="capitalize">
                        {org.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {org.status === 'pending' && (
                                    <>
                                        <DropdownMenuItem onClick={() => handleStatusChange(org.id!, 'approved')}><CheckCircle className="mr-2"/>Approve</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(org.id!, 'rejected')}><XCircle className="mr-2"/>Reject</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                <DropdownMenuItem className="text-destructive" onClick={() => setOrgToDelete(org)}><Trash2 className="mr-2"/>Delete</DropdownMenuItem>
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

      <AlertDialog open={!!orgToDelete} onOpenChange={(open) => !open && setOrgToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the seller organization <strong>{orgToDelete?.name}</strong>. This action cannot be undone.</AlertDialogDescription>
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
