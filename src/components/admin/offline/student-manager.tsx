
'use client';

import { useState, useMemo } from 'react';
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
import { Edit, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { User, Branch, Batch } from '@/lib/types';
import { saveUserAction } from '@/app/actions/user.actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface StudentManagerProps {
  initialStudents: User[];
  allBranches: Branch[];
  allBatches: Batch[];
}

export function StudentManager({ initialStudents, allBranches, allBatches }: StudentManagerProps) {
    const { toast } = useToast();
    const [students, setStudents] = useState<User[]>(initialStudents);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingStudent, setEditingStudent] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [assignedBranchId, setAssignedBranchId] = useState<string | undefined>('');
    const [assignedBatchId, setAssignedBatchId] = useState<string | undefined>('');
    const [offlineRollNo, setOfflineRollNo] = useState<string | undefined>('');

    const handleOpenDialog = (student: User) => {
        setEditingStudent(student);
        setAssignedBranchId(student.assignedBranchId || '');
        setAssignedBatchId(student.assignedBatchId || '');
        setOfflineRollNo(student.offlineRollNo || '');
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingStudent) return;
        setIsSaving(true);
        const userData = {
            id: editingStudent.id,
            assignedBranchId,
            assignedBatchId,
            offlineRollNo,
        };

        const result = await saveUserAction(userData);

        if (result.success) {
            toast({ title: 'Success', description: result.message });
            setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...userData } : s));
            setIsDialogOpen(false);
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setIsSaving(false);
    };
    
    const availableBatches = useMemo(() => {
        if (!assignedBranchId) return [];
        return allBatches.filter(b => b.branchId === assignedBranchId);
    }, [assignedBranchId, allBatches]);

    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.offlineRollNo && student.offlineRollNo.includes(searchTerm))
    );

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Offline Students</CardTitle>
                    <CardDescription>Manage students enrolled in your offline batches.</CardDescription>
                     <div className="relative pt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1.2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or roll..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Batch</TableHead>
                                <TableHead>Offline Roll</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.map(student => {
                                const branch = allBranches.find(b => b.id === student.assignedBranchId);
                                const batch = allBatches.find(b => b.id === student.assignedBatchId);
                                return (
                                <TableRow key={student.id}>
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={student.avatarUrl} alt={student.name} />
                                            <AvatarFallback>{student.name.substring(0,2)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{student.name}</p>
                                            <p className="text-sm text-muted-foreground">{student.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{branch?.name || <span className="text-muted-foreground">N/A</span>}</TableCell>
                                    <TableCell>{batch?.name || <span className="text-muted-foreground">N/A</span>}</TableCell>
                                    <TableCell>
                                        {student.offlineRollNo ? <Badge variant="outline">{student.offlineRollNo}</Badge> : <span className="text-muted-foreground">N/A</span>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(student)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Offline Student Details</DialogTitle>
                        <DialogDescription>Assign a branch, batch, and roll number for {editingStudent?.name}.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Branch</Label>
                            <Select value={assignedBranchId} onValueChange={setAssignedBranchId}>
                                <SelectTrigger><SelectValue placeholder="Select Branch..." /></SelectTrigger>
                                <SelectContent>{allBranches.map(b => <SelectItem key={b.id} value={b.id!}>{b.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label>Batch</Label>
                            <Select value={assignedBatchId} onValueChange={setAssignedBatchId} disabled={!assignedBranchId}>
                                <SelectTrigger><SelectValue placeholder="Select Batch..." /></SelectTrigger>
                                <SelectContent>{availableBatches.map(b => <SelectItem key={b.id} value={b.id!}>{b.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="roll">Offline Roll No.</Label>
                            <Input id="roll" value={offlineRollNo} onChange={e => setOfflineRollNo(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleSave} disabled={isSaving}>{isSaving && <Loader2 className="animate-spin mr-2"/>}Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
