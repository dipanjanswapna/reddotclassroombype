
'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, CheckCircle, XCircle } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast';
import { Organization } from '@/lib/types';
import { getOrganizations } from '@/lib/firebase/firestore';
import { updateOrganizationStatusAction } from '@/app/actions';
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

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedOrgs = await getOrganizations();
        setOrganizations(fetchedOrgs);
      } catch(e) {
        toast({ title: 'Error', description: 'Could not fetch organizations', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
    const result = await updateOrganizationStatusAction(id, newStatus);
    if (result.success) {
      setOrganizations(organizations.map(org =>
        org.id === id ? { ...org, status: newStatus } : org
      ));
      toast({
        title: "Partner Status Updated",
        description: `The organization has been ${newStatus}.`,
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Partner Management
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">
            Approve, manage, and view all EdTech partners on the platform.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2" />
          Invite Partner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Partner Organizations</CardTitle>
          <CardDescription>A list of all partner organizations in the system, including pending applications.</CardDescription>
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
                    <div className="flex gap-2 justify-end">
                      {org.status === 'pending' && (
                        <>
                          <Button variant="outline" size="sm" className="border-green-400 text-green-700 hover:bg-green-100" onClick={() => handleStatusChange(org.id!, 'approved')}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button variant="outline" size="sm" className="border-red-400 text-red-700 hover:bg-red-100" onClick={() => handleStatusChange(org.id!, 'rejected')}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                       {org.status !== 'pending' && (
                        <Button variant="outline" size="sm">
                           Manage
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
