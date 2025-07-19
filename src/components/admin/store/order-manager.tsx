
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Eye, Truck, CheckCircle, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { Order, User } from '@/lib/types';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { updateOrderStatusAction } from '@/app/actions/order.actions';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

type OrderWithUser = Order & { userName?: string };

interface OrderManagerProps {
  initialOrders: Order[];
  users: User[];
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
        <>
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-headline text-3xl font-bold tracking-tight">Store Orders</h1>
                        <p className="mt-1 text-lg text-muted-foreground">Manage all product orders.</p>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>All Orders</CardTitle>
                        <CardDescription>A list of all orders placed in the RDC Store.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono">#{order.id?.slice(0, 8)}...</TableCell>
                                        <TableCell>{order.userName}</TableCell>
                                        <TableCell>{format(safeToDate(order.createdAt), 'PPP')}</TableCell>
                                        <TableCell>৳{order.totalAmount.toFixed(2)}</TableCell>
                                        <TableCell><Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => setSelectedOrder(order)}><Eye className="mr-2 h-4 w-4"/>View Details</DropdownMenuItem>
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                                                        <DropdownMenuPortal>
                                                            <DropdownMenuSubContent>
                                                                {orderStatuses.map(status => (
                                                                    <DropdownMenuItem key={status} onClick={() => handleStatusUpdate(order.id!, status)}>
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

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Order Details #{selectedOrder?.id?.slice(0, 8)}</DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><p className="font-semibold">Customer:</p><p>{selectedOrder.userName}</p></div>
                                <div><p className="font-semibold">Phone:</p><p>{selectedOrder.shippingDetails.phone}</p></div>
                                <div className="col-span-2"><p className="font-semibold">Address:</p><p>{selectedOrder.shippingDetails.address}</p></div>
                            </div>
                            <Separator />
                            <h4 className="font-semibold">Items</h4>
                            {selectedOrder.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-md object-cover"/>
                                        <span>{item.name} x {item.quantity}</span>
                                    </div>
                                    <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <Separator />
                            <div className="flex justify-end font-bold">Total: ৳{selectedOrder.totalAmount.toFixed(2)}</div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
