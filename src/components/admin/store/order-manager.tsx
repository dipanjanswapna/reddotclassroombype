'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Eye, Truck, CheckCircle, XCircle, ShoppingBag, Phone, MapPin, Hash, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Order, User as UserType } from '@/lib/types';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { updateOrderStatusAction } from '@/app/actions/order.actions';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

type OrderWithUser = Order & { userName?: string };

interface OrderManagerProps {
  initialOrders: Order[];
  users: UserType[];
}

const getStatusBadgeVariant = (status: Order['status']) => {
  switch (status) {
    case 'Delivered': return 'accent';
    case 'Shipped': return 'default';
    case 'Processing': return 'warning';
    case 'Cancelled': return 'destructive';
    case 'Pending':
    default: return 'secondary';
  }
};

const statusIcons: { [key in Order['status']]: React.ReactNode } = {
    'Pending': <MoreVertical className="h-4 w-4" />,
    'Processing': <Truck className="h-4 w-4" />,
    'Shipped': <Truck className="h-4 w-4" />,
    'Delivered': <CheckCircle className="h-4 w-4" />,
    'Cancelled': <XCircle className="h-4 w-4" />,
};

const orderStatuses: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export function OrderManager({ initialOrders, users }: OrderManagerProps) {
    const { toast } = useToast();
    const [orders, setOrders] = useState<OrderWithUser[]>(
        initialOrders.map(order => ({
            ...order,
            userName: users.find(u => u.uid === order.userId)?.name || 'Unknown User'
        })).sort((a,b) => safeToDate(b.createdAt).getTime() - safeToDate(a.createdAt).getTime())
    );
    const [selectedOrder, setSelectedOrder] = useState<OrderWithUser | null>(null);

    const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
        const result = await updateOrderStatusAction(orderId, status);
        if (result.success) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
            toast({ title: 'Success', description: `Order #${orderId.slice(0, 8)} status updated to ${status}.`});
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
    }

    return (
        <div className="space-y-8">
            <Card className="rounded-xl border-primary/10 shadow-xl overflow-hidden bg-card">
                <CardHeader className="p-8 border-b border-primary/5 bg-muted/30">
                    <div className="space-y-1">
                        <CardTitle className="font-black uppercase tracking-tight text-lg">Master Logistics Queue</CardTitle>
                        <CardDescription className="font-medium">Real-time status monitoring for all RDC Store transactions.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Order ID</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Customer</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Date</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-primary">Total</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                                <TableHead className="px-8 text-right font-black uppercase text-[10px] tracking-widest">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-primary/5">
                            {orders.map(order => (
                                <TableRow key={order.id} className="hover:bg-primary/5 transition-colors">
                                    <TableCell className="px-8 py-6 font-mono font-bold text-xs">#{order.id?.slice(0, 8)}</TableCell>
                                    <TableCell className="px-8 py-6 font-bold">{order.userName}</TableCell>
                                    <TableCell className="px-8 py-6 font-medium text-muted-foreground">{format(safeToDate(order.createdAt), 'PPP')}</TableCell>
                                    <TableCell className="px-8 py-6 font-black text-primary">৳{order.totalAmount.toFixed(2)}</TableCell>
                                    <TableCell className="px-8 py-6">
                                        <Badge variant={getStatusBadgeVariant(order.status)} className="font-black text-[9px] uppercase tracking-widest rounded-lg">
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 rounded-xl border-primary/20 shadow-2xl">
                                                <DropdownMenuItem onClick={() => setSelectedOrder(order)} className="font-bold text-xs uppercase tracking-tight"><Eye className="mr-2 h-4 w-4 text-primary"/> View Log</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger className="font-bold text-xs uppercase tracking-tight"><Truck className="mr-2 h-4 w-4"/> Change Status</DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent className="rounded-xl shadow-2xl border-primary/10">
                                                            {orderStatuses.map(status => (
                                                                <DropdownMenuItem key={status} onClick={() => handleStatusUpdate(order.id!, status)} className="font-bold text-[10px] uppercase tracking-wider">
                                                                    {statusIcons[status]} <span className="ml-2">{status}</span>
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

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
                    <DialogHeader className="p-8 pb-4 border-b">
                        <DialogTitle>Order Log: #{selectedOrder?.id?.slice(0, 8)}</DialogTitle>
                        <DialogDescription className="font-black uppercase text-[10px] tracking-widest mt-1">Authorized Synchronization Record</DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="flex-grow overflow-y-auto p-8 space-y-8 scrollbar-hide">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 flex items-center gap-2"><User className="h-3 w-3"/> Identity Details</Label>
                                    <div className="p-4 bg-muted/30 border-2 rounded-xl">
                                        <p className="font-black text-sm uppercase">{selectedOrder.userName}</p>
                                        <p className="text-xs font-bold text-muted-foreground mt-1 flex items-center gap-2"><Phone className="h-3 w-3"/> {selectedOrder.shippingDetails.phone}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 flex items-center gap-2"><MapPin className="h-3 w-3"/> Target Hub</Label>
                                    <div className="p-4 bg-muted/30 border-2 rounded-xl">
                                        <p className="font-black text-xs uppercase text-primary mb-1">{selectedOrder.shippingDetails.district} / {selectedOrder.shippingDetails.thana}</p>
                                        <p className="text-xs font-medium leading-relaxed">{selectedOrder.shippingDetails.address}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <Separator className="opacity-50" />
                            
                            <div className="space-y-4">
                                <Label className="font-black uppercase text-[10px] tracking-widest text-primary flex items-center gap-2"><ShoppingBag className="h-4 w-4"/> Physical Artifacts</Label>
                                <div className="space-y-3">
                                    {selectedOrder.items.map(item => (
                                        <div key={item.id} className="flex justify-between items-center p-4 bg-background border-2 rounded-xl group hover:border-primary/20 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-14 w-14 rounded-lg overflow-hidden border shadow-inner"><Image src={item.imageUrl} alt={item.name} fill className="object-cover"/></div>
                                                <div>
                                                    <p className="font-black text-sm uppercase leading-tight">{item.name}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Quantity: {item.quantity} Units</p>
                                                </div>
                                            </div>
                                            <p className="font-black text-primary text-base">৳{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="p-6 bg-primary/5 border-2 border-primary/10 rounded-2xl flex justify-between items-center">
                                <span className="font-black uppercase text-xs tracking-widest text-muted-foreground">Settlement Total</span>
                                <span className="text-3xl font-black text-primary tracking-tighter">৳{selectedOrder.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="p-8 border-t bg-muted/30">
                        <Button variant="outline" onClick={() => setSelectedOrder(null)} className="rounded-xl h-12 px-10 font-black uppercase text-[10px] tracking-widest border-2">Close Log</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
