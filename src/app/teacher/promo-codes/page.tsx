
'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
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
import { getCourses, getInstructorByUid, getPromoCodes } from '@/lib/firebase/firestore';
import { savePromoCodeAction, deletePromoCodeAction } from '@/app/actions/promo.actions';
import { PromoCode, Course, Instructor } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TeacherPromoCodePage() {
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const [allPromoCodes, setAllPromoCodes] = useState<PromoCode[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [promoToDelete, setPromoToDelete] = useState<PromoCode | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(new Date());
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [applicableCourseIds, setApplicableCourseIds] = useState<string[]>(['all']);

  useEffect(() => {
    if (!userInfo) return;

    async function fetchData() {
      try {
        const fetchedInstructor = await getInstructorByUid(userInfo!.uid);
        if (!fetchedInstructor?.id) {
          toast({ title: 'Error', description: 'Could not find your instructor profile.', variant: 'destructive' });
          setLoading(false);
          return;
        }
        setInstructor(fetchedInstructor);

        const [fetchedCodes, allCourses] = await Promise.all([
          getPromoCodes(),
          getCourses()
        ]);
        
        const filteredCourses = allCourses.filter(c => c.instructors.some(i => i.slug === fetchedInstructor.slug));
        const filteredCodes = fetchedCodes.filter(p => p.createdBy === fetchedInstructor.id);

        setTeacherCourses(filteredCourses);
        setAllPromoCodes(filteredCodes);
      } catch (error) {
        console.error(error);
        toast({ title: 'Error', description: 'Could not fetch data.', variant: 'destructive'});
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userInfo, toast]);


  const handleOpenDialog = (promo: PromoCode | null) => {
    setEditingPromo(promo);
    if (promo) {
      setCode(promo.code);
      setType(promo.type);
      setValue(promo.value);
      setExpiresAt(promo.expiresAt ? new Date(promo.expiresAt) : undefined);
      setUsageLimit(promo.usageLimit);
      setApplicableCourseIds(promo.applicableCourseIds);
    } else {
      setCode('');
      setType('percentage');
      setValue(0);
      setExpiresAt(new Date());
      setUsageLimit(100);
      setApplicableCourseIds(['all']);
    }
    setIsDialogOpen(true);
  };


  const handleSaveCode = async () => {
    if (!instructor?.id) return;
    setIsSaving(true);
    const result = await savePromoCodeAction({
      id: editingPromo?.id,
      code,
      type,
      value,
      expiresAt: expiresAt ? format(expiresAt, 'yyyy-MM-dd') : '',
      usageLimit,
      applicableCourseIds,
      usageCount: editingPromo?.usageCount || 0,
      isActive: editingPromo?.isActive ?? true,
      createdBy: instructor.id,
    });

    if (result.success) {
      const updatedCodes = await getPromoCodes();
      setAllPromoCodes(updatedCodes.filter(p => p.createdBy === instructor.id));
      toast({ title: editingPromo ? 'Promo Code Updated' : 'Promo Code Created' });
      setIsDialogOpen(false);
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setIsSaving(false);
  };

  const handleDeleteConfirm = async () => {
    if (!promoToDelete) return;
    const result = await deletePromoCodeAction(promoToDelete.id!);
    if (result.success) {
      setAllPromoCodes(prev => prev.filter(p => p.id !== promoToDelete.id));
      toast({ title: 'Promo Code Deleted', description: 'The promo code has been permanently deleted.', variant: 'destructive' });
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setPromoToDelete(null);
  }

  const getCourseTitles = (ids: string[]) => {
    if (ids.includes('all')) return 'All My Courses';
    if (ids.length === 0) return 'No Courses';
    if (ids.length > 2) return `${ids.length} courses`;
    return ids.map(id => teacherCourses.find(c => c.id === id)?.title || 'Unknown').join(', ');
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[calc(100vh-8rem)]"><LoadingSpinner /></div>;
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">My Promo Codes</h1>
            <p className="mt-1 text-lg text-muted-foreground">Create and manage codes for your courses.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog(null)}><PlusCircle className="mr-2" /> Create New Code</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}</DialogTitle>
                <DialogDescription>Fill in the details for the promotional code.</DialogDescription>
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
                              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setApplicableCourseIds(['all']); }}>
                                  <Checkbox checked={applicableCourseIds.includes('all')} readOnly className="mr-2"/>
                                  All My Courses
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {teacherCourses.map(course => (
                                  <DropdownMenuItem key={course.id} onSelect={(e) => {
                                      e.preventDefault();
                                      setApplicableCourseIds(prev => {
                                          const isAll = prev.includes('all');
                                          const newSet = isAll ? new Set<string>() : new Set(prev);
                                          if (newSet.has(course.id!)) newSet.delete(course.id!);
                                          else newSet.add(course.id!);
                                          const newArr = Array.from(newSet);
                                          return newArr.length > 0 ? newArr : ['all'];
                                      });
                                  }}>
                                      <Checkbox checked={applicableCourseIds.includes(course.id!)} readOnly className="mr-2"/>
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
                <Button onClick={handleSaveCode} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 animate-spin"/>}
                  Save Code
                </Button>
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
                {allPromoCodes.map((promo) => (
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
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(promo)}><Edit className="mr-2 h-4 w-4"/> Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => setPromoToDelete(promo)}><Trash2 className="mr-2 h-4 w-4"/> Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

       <AlertDialog open={!!promoToDelete} onOpenChange={(open) => !open && setPromoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the promo code <strong>{promoToDelete?.code}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
