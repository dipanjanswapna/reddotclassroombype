
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Phone, CheckCircle, Info, Loader2, Edit } from 'lucide-react';
import { updateCallbackRequestAction } from '@/app/actions/callback.actions';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/auth-context';
import { safeToDate } from '@/lib/utils';
import { CallbackRequest } from '@/lib/types';

type Status = 'Pending' | 'Contacted' | 'Completed';

const getStatusBadgeVariant = (status: Status) => {
    switch (status) {
        case 'Pending': return 'warning';
        case 'Contacted': return 'default';
        case 'Completed': return 'accent';
        default: return 'secondary';
    }
};

export function CallbackClient({ initialRequests }: { initialRequests: CallbackRequest[] }) {
    const { toast } = useToast();
    const { userInfo } = useAuth();
    const [requests, setRequests] = useState(initialRequests);
    const [filter, setFilter] = useState<Status | 'all'>('all');
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<CallbackRequest | null>(null);
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<Status>('Pending');
    const [isSaving, setIsSaving] = useState(false);

    const filteredRequests = useMemo(() => {
        if (filter === 'all') return requests;
        return requests.filter(r => r.status === filter);
    }, [requests, filter]);

    const handleOpenDialog = (request: CallbackRequest) => {
        setSelectedRequest(request);
        setNotes(request.notes || '');
        setStatus(request.status);
        setIsDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedRequest?.id || !userInfo) return;
        setIsSaving(true);
        const result = await updateCallbackRequestAction(selectedRequest.id, { status, notes }, userInfo.uid);
        if (result.success) {
            toast({ title: "Success", description: "Request updated." });
            setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status, notes } : r));
            setIsDialogOpen(false);
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
        setIsSaving(false);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>All Requests</CardTitle>
                            <CardDescription>A log of all submitted callback requests.</CardDescription>
                        </div>
                        <div className="w-48">
                            <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Contacted">Contacted</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Interest</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRequests.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        <div>{req.fullName}</div>
                                        <div className="text-xs text-muted-foreground">{req.state}</div>
                                    </TableCell>
                                    <TableCell>
                                        <a href={`tel:${req.mobileNumber}`} className="flex items-center gap-1 hover:underline">
                                            <Phone className="h-3 w-3" />
                                            {req.mobileNumber}
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        <div>{req.goals} / {req.class}</div>
                                        <div className="text-xs text-muted-foreground">{req.preferredCourses}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(req)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Manage
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredRequests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No requests match the current filter.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Callback: {selectedRequest?.fullName}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Contacted">Contacted</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add call notes here..." rows={4} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
