
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Gift, CheckCircle, Clock, Truck, Loader2, XCircle } from 'lucide-react';
import { Reward, RedemptionRequest } from '@/lib/types';
import { getRewards, getRedeemRequestsByUserId, createRedeemRequest } from '@/lib/firebase/firestore';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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


export default function StudentRewardsPage() {
    const { userInfo, loading: authLoading, refreshUserInfo } = useAuth();
    const { toast } = useToast();
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [requests, setRequests] = useState<RedemptionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [shippingAddress, setShippingAddress] = useState({ fullName: '', addressLine1: '', city: '', postalCode: '', phoneNumber: '' });
    const [isRedeeming, setIsRedeeming] = useState(false);

    const fetchRewardsData = async () => {
        if (!userInfo) {
            if (!authLoading) setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [rewardsData, requestsData] = await Promise.all([
                getRewards(),
                getRedeemRequestsByUserId(userInfo.uid)
            ]);
            setRewards(rewardsData.filter(r => (r.stock ?? 1) > 0));
            setRequests(requestsData);
        } catch (err) {
            console.error("Failed to fetch rewards data:", err);
            toast({ title: "Error", description: "Could not fetch rewards.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewardsData();
    }, [userInfo, authLoading]);

    const handleRedeemClick = (reward: Reward) => {
        if ((userInfo?.referralPoints || 0) < reward.pointsRequired) {
            toast({ title: "Not enough points!", variant: "destructive" });
            return;
        }
        setSelectedReward(reward);
        setIsDialogOpen(true);
    };

    const handleRedeemRequest = async () => {
        if (!userInfo || !selectedReward) return;
        
        setIsRedeeming(true);
        const result = await createRedeemRequest({
            userId: userInfo.uid,
            rewardId: selectedReward.id!,
            rewardTitle: selectedReward.title,
            pointsSpent: selectedReward.pointsRequired,
            status: 'Pending',
            shippingAddress
        });
        
        if (result.success) {
            toast({ title: "Request Submitted!", description: "Your redeem request has been sent for approval." });
            await fetchRewardsData(); // Refresh data
            await refreshUserInfo(); // Refresh points in context
            setIsDialogOpen(false);
        } else {
             toast({ title: "Error", description: result.message, variant: "destructive" });
        }
        setIsRedeeming(false);
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    return (
        <div className="px-1 py-4 md:py-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Redeem Rewards</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Use your earned points to claim exciting rewards!
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Your Points</span>
                        <span className="text-primary">{userInfo?.referralPoints || 0}</span>
                    </CardTitle>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Rewards Catalog</CardTitle>
                    <CardDescription>Browse available rewards you can claim with your points.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {rewards.map(reward => (
                        <Card key={reward.id} className="flex flex-col">
                            <div className="relative aspect-video bg-muted">
                                <Image src={reward.imageUrl} alt={reward.title} fill className="object-cover rounded-t-lg"/>
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="font-semibold">{reward.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1 flex-grow">{reward.description}</p>
                                <div className="mt-4 flex justify-between items-center">
                                    <Badge variant="warning">{reward.pointsRequired} Points</Badge>
                                    <Button size="sm" onClick={() => handleRedeemClick(reward)} disabled={(userInfo?.referralPoints || 0) < reward.pointsRequired}>Redeem</Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle>Redemption History</CardTitle>
                    <CardDescription>Track the status of your redeemed rewards.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reward</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Points Spent</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>{req.rewardTitle}</TableCell>
                                    <TableCell>{format(safeToDate(req.requestedAt), 'PPP')}</TableCell>
                                    <TableCell><Badge variant="outline">-{req.pointsSpent}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={getStatusBadgeVariant(req.status)} className="gap-1">
                                            {statusIcons[req.status]} {req.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Redemption</DialogTitle>
                        <DialogDescription>
                            You are redeeming "{selectedReward?.title}" for {selectedReward?.pointsRequired} points.
                        </DialogDescription>
                    </DialogHeader>
                     <div className="py-4 space-y-4">
                        <h4 className="font-semibold">Shipping Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2 col-span-2"><Label htmlFor="fullName">Full Name</Label><Input id="fullName" name="fullName" value={shippingAddress.fullName} onChange={handleInputChange}/></div>
                             <div className="space-y-2 col-span-2"><Label htmlFor="addressLine1">Address</Label><Input id="addressLine1" name="addressLine1" value={shippingAddress.addressLine1} onChange={handleInputChange}/></div>
                             <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" name="city" value={shippingAddress.city} onChange={handleInputChange}/></div>
                             <div className="space-y-2"><Label htmlFor="postalCode">Postal Code</Label><Input id="postalCode" name="postalCode" value={shippingAddress.postalCode} onChange={handleInputChange}/></div>
                             <div className="space-y-2 col-span-2"><Label htmlFor="phoneNumber">Phone Number</Label><Input id="phoneNumber" name="phoneNumber" type="tel" value={shippingAddress.phoneNumber} onChange={handleInputChange}/></div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleRedeemRequest} disabled={isRedeeming}>
                            {isRedeeming && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
