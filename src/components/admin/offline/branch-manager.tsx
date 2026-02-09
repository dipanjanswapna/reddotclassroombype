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
import { PlusCircle, Edit, Trash2, Loader2, MoreVertical, X, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Branch, Classroom, User } from '@/lib/types';
import { saveBranchAction, deleteBranchAction } from '@/app/actions/offline.actions';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BranchManagerProps {
  initialBranches: Branch[];
  allManagers: User[];
}

export function BranchManager({ initialBranches, allManagers }: BranchManagerProps) {
    const { toast } = useToast();
    const [branches, setBranches] = useState<Branch[]>(initialBranches);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [branchCode, setBranchCode] = useState('');
    const [officeHours, setOfficeHours] = useState('');
    const [holidays, setHolidays] = useState('');
    const [managerId, setManagerId] = useState<string | undefined>('');
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);


    const handleOpenDialog = (branch: Branch | null) => {
        setEditingBranch(branch);
        if (branch) {
            setName(branch.name);
            setAddress(branch.address);
            setContactPhone(branch.contactPhone);
            setContactEmail(branch.contactEmail);
            setBranchCode(branch.branchCode || '');
            setOfficeHours(branch.officeHours || '');
            setHolidays(branch.holidays || '');
            setManagerId(branch.managerId || '');
            setClassrooms(branch.classrooms || []);
        } else {
            setName('');
            setAddress('');
            setContactPhone('');
            setContactEmail('');
            setBranchCode('');
            setOfficeHours('');
            setHolidays('');
            setManagerId('');
            setClassrooms([]);
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!name || !address) {
            toast({ title: 'Error', description: 'Center name and address are required.', variant: 'destructive'});
            return;
        }
        setIsSaving(true);

        const result = await saveBranchAction({
            id: editingBranch?.id,
            name,
            address,
            contactPhone,
            contactEmail,
            branchCode,
            officeHours,
            holidays,
            managerId,
            classrooms: classrooms.filter(c => c.name),
        });

        if (result.success) {
            toast({ title: 'Success', description: result.message });
            window.location.reload();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setIsSaving(false);
    };
    
    const handleDelete = async () => {
        if (!branchToDelete?.id) return;
        const result = await deleteBranchAction(branchToDelete.id);
        if (result.success) {
            setBranches(branches.filter(b => b.id !== branchToDelete.id));
            toast({ title: 'Center Deleted', description: result.message, variant: 'destructive' });
        } else {
             toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setBranchToDelete(null);
    };
    
    const handleClassroomChange = (id: string, field: keyof Omit<Classroom, 'id'>, value: string | number) => {
        setClassrooms(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };
    const addClassroom = () => setClassrooms(prev => [...prev, { id: `new_${Date.now()}`, name: '', capacity: 0, equipment: '' }]);
    const removeClassroom = (id: string) => setClassrooms(prev => prev.filter(c => c.id !== id));

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary"/> Offline Centers</CardTitle>
                        <CardDescription>Manage your organization's physical education centers.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog(null)}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Add New Center
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Center Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {branches.map(branch => (
                                <TableRow key={branch.id}>
                                    <TableCell className="font-medium">{branch.name}</TableCell>
                                    <TableCell>{branch.branchCode || 'N/A'}</TableCell>
                                    <TableCell>{branch.address}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{branch.contactPhone}</span>
                                            <span className="text-xs text-muted-foreground">{branch.contactEmail}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenDialog(branch)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => setBranchToDelete(branch)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Center
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {branches.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No offline centers found. Create one to get started.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingBranch ? 'Edit Center Details' : 'Create New Offline Center'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2"> <Label>Center Name</Label> <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Mirpur Center"/> </div>
                         <div className="space-y-2"> <Label>Center Code</Label> <Input value={branchCode} onChange={e => setBranchCode(e.target.value)} placeholder="e.g., UTT-01" /> </div>
                       </div>
                        <div className="space-y-2"> <Label>Physical Address</Label> <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Full address of the center"/> </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2"> <Label>Contact Phone</Label> <Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} /> </div>
                           <div className="space-y-2"> <Label>Contact Email</Label> <Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} /> </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2"> <Label>Office Hours</Label> <Input value={officeHours} onChange={e => setOfficeHours(e.target.value)} placeholder="e.g., Sat-Thu, 9AM-6PM" /> </div>
                           <div className="space-y-2"> <Label>Holidays</Label> <Input value={holidays} onChange={e => setHolidays(e.target.value)} placeholder="e.g., Friday" /> </div>
                        </div>
                        <div className="space-y-2">
                           <Label>Branch Manager</Label>
                           <Select value={managerId} onValueChange={setManagerId}>
                               <SelectTrigger><SelectValue placeholder="Select a manager..."/></SelectTrigger>
                               <SelectContent>
                                  {allManagers.map(manager => <SelectItem key={manager.id} value={manager.id!}>{manager.name}</SelectItem>)}
                               </SelectContent>
                           </Select>
                        </div>
                        
                        <div className="space-y-2 pt-4 border-t">
                            <Label className="font-semibold">Classrooms & Facilities</Label>
                             <div className="space-y-2">
                                {classrooms.map((room, index) => (
                                    <div key={room.id} className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
                                        <Input placeholder="Classroom Name" value={room.name} onChange={e => handleClassroomChange(room.id, 'name', e.target.value)} />
                                        <Input placeholder="Capacity" type="number" value={room.capacity} onChange={e => handleClassroomChange(room.id, 'capacity', Number(e.target.value))} className="w-24" />
                                        <Input placeholder="Equipment (e.g., Smart Board)" value={room.equipment} onChange={e => handleClassroomChange(room.id, 'equipment', e.target.value)} />
                                        <Button variant="ghost" size="icon" onClick={() => removeClassroom(room.id)}><X className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" onClick={addClassroom} className="w-full">Add Classroom</Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="animate-spin mr-2"/>}
                            Save Center Information
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!branchToDelete} onOpenChange={(open) => !open && setBranchToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action will permanently delete the center <strong>{branchToDelete?.name}</strong> and remove all associated batches from this location.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete Center</AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
