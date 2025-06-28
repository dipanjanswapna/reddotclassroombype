
'use client';

import { useState } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { allPromoCodes as initialPromoCodes, PromoCode, courses } from '@/lib/mock-data';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

export default function AdminPromoCodePage() {
  const { toast } = useToast();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(initialPromoCodes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(0);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(new Date());
  const [usageLimit, setUsageLimit] = useState(100);

  const handleCreateCode = () => {
    // In a real app, this would be a server action.
    const newCode: PromoCode = {
      id: `promo_${Date.now()}`,
      code: code || `RDC${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      type,
      value,
      usageCount: 0,
      usageLimit,
      expiresAt: expiresAt ? format(expiresAt, 'yyyy-MM-dd') : '',
      isActive: true,
      applicableCourseIds: ['all'],
      createdBy: 'admin'
    };

    setPromoCodes(prev => [...prev, newCode]);
    toast({ title: 'Promo Code Created', description: `Code "${newCode.code}" has been successfully created.` });
    setIsDialogOpen(false);
    // Reset form
    setCode('');
    setType('percentage');
    setValue(0);
    setExpiresAt(new Date());
    setUsageLimit(100);
  };

  const handleDelete = (id: string) => {
    setPromoCodes(prev => prev.filter(p => p.id !== id));
    toast({ title: 'Promo Code Deleted', variant: 'destructive' });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Promo Code Management</h1>
          <p className="mt-1 text-lg text-muted-foreground">Create and manage all promotional codes for the platform.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2" /> Create New Code</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Promo Code</DialogTitle>
              <DialogDescription>Fill in the details for the new promotional code.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">Code</Label>
                <Input id="code" value={code} onChange={e => setCode(e.target.value)} placeholder="Leave blank to auto-generate" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Type</Label>
                <Select value={type} onValueChange={(v: 'percentage' | 'fixed') => setType(v)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Discount</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (BDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">Value</Label>
                <Input id="value" type="number" value={value} onChange={e => setValue(Number(e.target.value))} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="usageLimit" className="text-right">Usage Limit</Label>
                <Input id="usageLimit" type="number" value={usageLimit} onChange={e => setUsageLimit(Number(e.target.value))} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Expires At</Label>
                <DatePicker date={expiresAt} setDate={setExpiresAt} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleCreateCode}>Create Code</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Promo Codes</CardTitle>
          <CardDescription>A list of all promotional codes currently in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-mono">{promo.code}</TableCell>
                  <TableCell className="capitalize">{promo.type}</TableCell>
                  <TableCell>{promo.type === 'percentage' ? `${promo.value}%` : `৳${promo.value}`}</TableCell>
                  <TableCell>{promo.usageCount} / {promo.usageLimit}</TableCell>
                  <TableCell>{promo.expiresAt}</TableCell>
                  <TableCell>
                    <Badge variant={promo.isActive ? 'accent' : 'secondary'}>
                      {promo.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4"/> Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(promo.id)}><Trash2 className="mr-2 h-4 w-4"/> Delete</Button>
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
