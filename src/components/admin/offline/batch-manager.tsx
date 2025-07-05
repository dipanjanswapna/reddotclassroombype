
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Loader2, MoreVertical, X, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Batch, Course, Branch, Instructor } from '@/lib/types';
import { saveBatchAction, deleteBatchAction } from '@/app/actions/batch.actions';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type ScheduleItem = { day: string; time: string };

interface BatchManagerProps {
  initialBatches: Batch[];
  allCourses: Course[];
  allBranches: Branch[];
  allInstructors: Instructor[];
}

export function BatchManager({ initialBatches, allCourses, allBranches, allInstructors }: BatchManagerProps) {
    const { toast } = useToast();
    const [batches, setBatches] = useState<Batch[]>(initialBatches);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
    const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [courseId, setCourseId] = useState('');
    const [branchId, setBranchId] = useState('');
    const [selectedInstructors, setSelectedInstructors] = useState<Instructor[]>([]);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([{ day: '', time: '' }]);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [capacity, setCapacity] = useState<number>(0);

    const handleOpenDialog = (batch: Batch | null) => {
        setEditingBatch(batch);
        if (batch) {
            setName(batch.name);
            setCourseId(batch.courseId);
            setBranchId(batch.branchId);
            setSelectedInstructors(allInstructors.filter(inst => batch.instructorSlugs.includes(inst.slug)));
            setSchedule(batch.schedule);
            setStartDate(new Date(batch.startDate));
            setEndDate(new Date(batch.endDate));
            setCapacity(batch.capacity);
        } else {
            // Reset form
            setName('');
            setCourseId('');
            setBranchId('');
            setSelectedInstructors([]);
            setSchedule([{ day: '', time: '' }]);
            setStartDate(undefined);
            setEndDate(undefined);
            setCapacity(0);
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!name || !courseId || !branchId || !startDate || !endDate) {
            toast({ title: 'Error', description: 'Please fill all required fields.', variant: 'destructive'});
            return;
        }
        setIsSaving(true);
        const batchData = {
            id: editingBatch?.id,
            name,
            courseId,
            branchId,
            instructorSlugs: selectedInstructors.map(i => i.slug),
            schedule: schedule.filter(s => s.day && s.time),
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
            capacity: Number(capacity),
            studentCount: editingBatch?.studentCount || 0,
        };

        const result = await saveBatchAction(batchData);

        if (result.success) {
            toast({ title: 'Success', description: result.message });
            window.location.reload(); // Simplest way to refresh data
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setIsSaving(false);
    };

    const handleDelete = async () => {
        if (!batchToDelete?.id) return;
        const result = await deleteBatchAction(batchToDelete.id);
        if (result.success) {
            setBatches(batches.filter(b => b.id !== batchToDelete.id));
            toast({ title: 'Batch Deleted', description: result.message, variant: 'destructive' });
        } else {
             toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setBatchToDelete(null);
    };

    const handleScheduleChange = (index: number, field: 'day' | 'time', value: string) => {
        const newSchedule = [...schedule];
        newSchedule[index][field] = value;
        setSchedule(newSchedule);
    };

    const addScheduleRow = () => setSchedule([...schedule, { day: '', time: '' }]);
    const removeScheduleRow = (index: number) => setSchedule(schedule.filter((_, i) => i !== index));

    const getStatus = (startDate: string, endDate: string): {text: string, variant: "accent" | "secondary" | "warning"} => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (now < start) return { text: "Upcoming", variant: "warning" };
        if (now > end) return { text: "Completed", variant: "secondary" };
        return { text: "Ongoing", variant: "accent" };
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>All Batches</CardTitle>
                        <CardDescription>Manage course batches across all your branches.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog(null)}>
                        <PlusCircle className="mr-2"/> Create Batch
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Batch Name</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Students</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {batches.map(batch => {
                                const status = getStatus(batch.startDate, batch.endDate);
                                return (
                                    <TableRow key={batch.id}>
                                        <TableCell className="font-medium">{batch.name}</TableCell>
                                        <TableCell>{allCourses.find(c => c.id === batch.courseId)?.title || 'N/A'}</TableCell>
                                        <TableCell>{allBranches.find(b => b.id === batch.branchId)?.name || 'N/A'}</TableCell>
                                        <TableCell>{batch.studentCount} / {batch.capacity}</TableCell>
                                        <TableCell><Badge variant={status.variant}>{status.text}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleOpenDialog(batch)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setBatchToDelete(batch)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{editingBatch ? 'Edit Batch' : 'Create New Batch'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2"> <Label htmlFor="name">Batch Name</Label> <Input id="name" value={name} onChange={e => setName(e.target.value)} /> </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Course</Label>
                            <Select value={courseId} onValueChange={setCourseId}><SelectTrigger><SelectValue placeholder="Select Course..." /></SelectTrigger>
                                <SelectContent>{allCourses.map(c => <SelectItem key={c.id} value={c.id!}>{c.title}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                             <Label>Branch</Label>
                             <Select value={branchId} onValueChange={setBranchId}><SelectTrigger><SelectValue placeholder="Select Branch..." /></SelectTrigger>
                                <SelectContent>{allBranches.map(b => <SelectItem key={b.id} value={b.id!}>{b.name}</SelectItem>)}</SelectContent>
                             </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Instructors</Label>
                            <Popover>
                                <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start">{selectedInstructors.length > 0 ? selectedInstructors.map(i => i.name).join(', ') : 'Select Instructors...'}</Button></PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search instructors..." />
                                        <CommandEmpty>No instructor found.</CommandEmpty>
                                        <CommandGroup>
                                            {allInstructors.map(inst => (
                                                <CommandItem key={inst.id} onSelect={() => {
                                                    setSelectedInstructors(prev => prev.some(i => i.id === inst.id) ? prev.filter(i => i.id !== inst.id) : [...prev, inst]);
                                                }}>
                                                    <Check className={cn("mr-2 h-4 w-4", selectedInstructors.some(i => i.id === inst.id) ? "opacity-100" : "opacity-0")} />
                                                    {inst.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Schedule</Label>
                            {schedule.map((s, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input placeholder="Day (e.g., Saturday)" value={s.day} onChange={e => handleScheduleChange(index, 'day', e.target.value)} />
                                    <Input placeholder="Time (e.g., 7:00 PM)" value={s.time} onChange={e => handleScheduleChange(index, 'time', e.target.value)} />
                                    <Button variant="ghost" size="icon" onClick={() => removeScheduleRow(index)}><X className="h-4 w-4 text-destructive"/></Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={addScheduleRow} className="w-full">Add Schedule</Button>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"> <Label>Start Date</Label> <DatePicker date={startDate} setDate={setStartDate} /> </div>
                            <div className="space-y-2"> <Label>End Date</Label> <DatePicker date={endDate} setDate={setEndDate} /> </div>
                         </div>
                         <div className="space-y-2"> <Label>Capacity</Label> <Input type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))} /></div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleSave} disabled={isSaving}>{isSaving && <Loader2 className="animate-spin mr-2"/>}Save Batch</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!batchToDelete} onOpenChange={(open) => !open && setBatchToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the batch <strong>{batchToDelete?.name}</strong>.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
