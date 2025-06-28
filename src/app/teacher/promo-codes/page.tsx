
'use client';

// NOTE: This is a simplified version for teachers. 
// In a real application, the logic for creating/viewing codes
// would be strictly scoped to the courses owned by the logged-in teacher.

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
import { useToast } from '@/components/ui/use-toast';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

const teacherId = 'ins-ja'; // Mock teacher ID
const teacherCourses = courses.filter(c => c.instructors.some(i => i.id === teacherId));

export default function TeacherPromoCodePage() {
  const { toast } = useToast();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => initialPromoCodes.filter(p => p.createdBy === teacherId));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(0);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(new Date());
  const [usageLimit, setUsageLimit] = useState(100);
  const [applicableCourseIds, setApplicableCourseIds] = useState<string[]>(['all']);

  const handleCourseSelection = (courseId: string) => {
    setApplicableCourseIds(prev => {
        const isAllSelected = prev.includes('all');
        if (isAllSelected) {
            return [courseId];
        }

        const newSelection = new Set(prev);
        if (newSelection.has(courseId)) {
            newSelection.delete(courseId);
        } else {
            newSelection.add(courseId);
        }

        const newIds = Array.from(newSelection);
        return newIds.length > 0 ? newIds : ['all'];
    });
  };

  const handleCreateCode = () => {
    const newCode: PromoCode = {
      id: `promo_${Date.now()}`,
      code: code || `RDC${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      type,
      value,
      usageCount: 0,
      usageLimit,
      expiresAt: expiresAt ? format(expiresAt, 'yyyy-MM-dd') : '',
      isActive: true,
      applicableCourseIds: applicableCourseIds,
      createdBy: teacherId,
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
    setApplicableCourseIds(['all']);
  };

  const handleDelete = (id: string) => {
    setPromoCodes(prev => prev.filter(p => p.id !== id));
    toast({ title: 'Promo Code Deleted', variant: 'destructive' });
  }

  const getCourseTitles = (ids: string[]) => {
    if (ids.includes('all')) return 'All My Courses';
    if (ids.length === 0) return 'No Courses';
    if (ids.length > 2) return `${ids.length} courses`;
    return ids.map(id => teacherCourses.find(c => c.id === id)?.title || 'Unknown').join(', ');
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">My Promo Codes</h1>
          <p className="mt-1 text-lg text-muted-foreground">Create and manage codes for your courses.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2" /> Create New Code</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Promo Code</DialogTitle>
              <DialogDescription>Fill in the details for the new promotional code for your course.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Course</Label>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="col-span-3 justify-start truncate">
                            {getCourseTitles(applicableCourseIds)}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64" align="start">
                        <ScrollArea className="h-48">
                            <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                onClick={() => setApplicableCourseIds(['all'])}
                            >
                                <Checkbox checked={applicableCourseIds.includes('all')} readOnly className="mr-2"/>
                                All My Courses
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {teacherCourses.map(course => (
                                <DropdownMenuItem 
                                    key={course.id} 
                                    onSelect={(e) => e.preventDefault()}
                                    onClick={() => handleCourseSelection(course.id)}
                                >
                                    <Checkbox checked={applicableCourseIds.includes(course.id)} readOnly className="mr-2"/>
                                    <span className="truncate">{course.title}</span>
                                </DropdownMenuItem>
                            ))}
                        </ScrollArea>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
          <CardTitle>Your Promo Codes</CardTitle>
          <CardDescription>A list of promotional codes you have created.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-mono">{promo.code}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={getCourseTitles(promo.applicableCourseIds)}>
                    {getCourseTitles(promo.applicableCourseIds)}
                  </TableCell>
                  <TableCell>{promo.type === 'percentage' ? `${promo.value}%` : `৳${promo.value}`}</TableCell>
                  <TableCell>{promo.usageCount} / {promo.usageLimit}</TableCell>
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
