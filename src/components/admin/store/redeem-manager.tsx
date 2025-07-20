
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, CheckCircle, Truck, XCircle, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { RedemptionRequest, User } from '@/lib/types';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { updateRedeemRequestStatusAction } from '@/app/actions/reward.actions';
import { useToast } from '@/components/ui/use-toast';

interface RedeemManagerProps {
  initialRequests: RedemptionRequest[];
  users: User[];
}

const getStatusBadgeVariant = (status: RedemptionRequest['status']) => {
  switch (status) {
    case 'Delivered': return 'accent';
    case 'Shipped': return 'default';
    case 'Processing':
    case 'Approved': return 'warning';
    case 'Cancelled': return 'destructive';
    case 'Pending':
    default: return 'secondary';
  }
};

const statusIcons: { [key in RedemptionRequest['status']]: React.ReactNode } = {
    'Pending': <Clock className="h-4 w-4" />,
    'Approved': <CheckCircle className="h-4 w-4" />,
    'Processing': <Truck className="h-4 w-4" />,
    'Shipped': <Truck className="h-4 w-4" />,
    'Delivered': <CheckCircle className="h-4 w-4" />,
    'Cancelled': <XCircle className="h-4 w-4" />,
};

const requestStatuses: RedemptionRequest['status'][] = ['Pending', 'Approved', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export function RedeemManager({ initialRequests, users }: RedeemManagerProps) {
    const { toast } = useToast();
    const [requests, setRequests] = useState<RedemptionRequest[]>(
        initialRequests.map(req => ({
            ...req,
            userName: users.find(u => u.uid === req.userId)?.name || 'Unknown User'
        })).sort((a,b) => safeToDate(b.requestedAt).getTime() - safeToDate(a.requestedAt).getTime())
    );

    const handleStatusUpdate = async (requestId: string, status: RedemptionRequest['status']) => {
        const result = await updateRedeemRequestStatusAction(requestId, status);
        if (result.success) {
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
            toast({ title: 'Success', description: `Request status updated to ${status}.`});
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Redeem Requests</h1>
                    <p className="mt-1 text-lg text-muted-foreground">Manage student reward redemptions.</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Requests</CardTitle>
                    <CardDescription>A list of all reward redemption requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Request ID</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Reward</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-mono">#{req.id?.slice(0, 8)}</TableCell>
                                    <TableCell>{(req as any).userName}</TableCell>
                                    <TableCell>{req.rewardTitle}</TableCell>
                                    <TableCell>{format(safeToDate(req.requestedAt), 'PPP')}</TableCell>
                                    <TableCell><Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            {requestStatuses.map(status => (
                                                                <DropdownMenuItem key={status} onClick={() => handleStatusUpdate(req.id!, status)}>
                                                                    {statusIcons[status]} {status}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
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
    );
}
