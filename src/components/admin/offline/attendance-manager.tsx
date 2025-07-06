
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AttendanceRecord, Batch, Branch, User } from '@/lib/types';
import { Edit, Loader2, Search } from 'lucide-react';
import { updateAttendanceStatusAction } from '@/app/actions/attendance.actions';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type AttendanceWithDetails = AttendanceRecord & {
  studentName?: string;
  studentRoll?: string;
  batchName?: string;
  branchName?: string;
};

interface AttendanceManagerProps {
  initialRecords: AttendanceRecord[];
  allStudents: User[];
  allBatches: Batch[];
  allBranches: Branch[];
}

const getStatusBadgeVariant = (status: AttendanceRecord['status']) => {
  switch (status) {
    case 'Present': return 'accent';
    case 'Late': return 'warning';
    case 'Absent': return 'destructive';
    default: return 'secondary';
  }
};

export function AttendanceManager({ initialRecords, allStudents, allBatches, allBranches }: AttendanceManagerProps) {
  const { toast } = useToast();
  const [records, setRecords] = useState<AttendanceWithDetails[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceWithDetails | null>(null);
  const [newStatus, setNewStatus] = useState<AttendanceRecord['status'] | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const recordsWithDetails = initialRecords.map(record => {
      const student = allStudents.find(s => s.id === record.studentId);
      const batch = allBatches.find(b => b.id === record.batchId);
      const branch = allBranches.find(br => br.id === record.branchId);
      return {
        ...record,
        studentName: student?.name || 'Unknown Student',
        studentRoll: student?.offlineRollNo || student?.classRoll || 'N/A',
        batchName: batch?.name || 'Unknown Batch',
        branchName: branch?.name || 'Unknown Branch',
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecords(recordsWithDetails);
    setFilteredRecords(recordsWithDetails);
  }, [initialRecords, allStudents, allBatches, allBranches]);

  useMemo(() => {
    let result = records;

    if (searchTerm) {
      result = result.filter(r => 
        r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentRoll?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      result = result.filter(r => r.date === formattedDate);
    }
    if (selectedBranch !== 'all') {
      result = result.filter(r => r.branchId === selectedBranch);
    }
    if (selectedBatch !== 'all') {
      result = result.filter(r => r.batchId === selectedBatch);
    }

    setFilteredRecords(result);
  }, [searchTerm, selectedDate, selectedBranch, selectedBatch, records]);

  const stats = useMemo(() => {
    return filteredRecords.reduce((acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        acc.total++;
        return acc;
    }, { Present: 0, Absent: 0, Late: 0, total: 0 });
  }, [filteredRecords]);
  
  const handleOpenEditDialog = (record: AttendanceWithDetails) => {
    setEditingRecord(record);
    setNewStatus(record.status);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
      if (!editingRecord || !newStatus) return;
      
      setIsSaving(true);
      const result = await updateAttendanceStatusAction(editingRecord.id!, newStatus, 'admin_id_placeholder');
      
      if(result.success) {
          toast({ title: "Success", description: "Attendance status updated." });
          setRecords(prev => prev.map(r => r.id === editingRecord.id ? {...r, status: newStatus} : r));
          setIsDialogOpen(false);
      } else {
          toast({ title: "Error", description: result.message, variant: "destructive" });
      }
      setIsSaving(false);
  };


  return (
    <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">Based on current filters</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-600">Present</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.Present}</div>
                    <p className="text-xs text-muted-foreground">{stats.total > 0 ? `${((stats.Present / stats.total) * 100).toFixed(1)}%` : '0%'}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-600">Absent</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.Absent}</div>
                     <p className="text-xs text-muted-foreground">{stats.total > 0 ? `${((stats.Absent / stats.total) * 100).toFixed(1)}%` : '0%'}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-600">Late</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.Late}</div>
                     <p className="text-xs text-muted-foreground">{stats.total > 0 ? `${((stats.Late / stats.total) * 100).toFixed(1)}%` : '0%'}</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>View and manage all recorded attendance across all branches.</CardDescription>
                <div className="flex flex-col md:flex-row gap-2 pt-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by student name or roll..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                    </div>
                    <DatePicker date={selectedDate} setDate={setSelectedDate} />
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}><SelectTrigger><SelectValue placeholder="Filter by Branch" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">All Branches</SelectItem>{allBranches.map(b => <SelectItem key={b.id} value={b.id!}>{b.name}</SelectItem>)}</SelectContent>
                    </Select>
                     <Select value={selectedBatch} onValueChange={setSelectedBatch}><SelectTrigger><SelectValue placeholder="Filter by Batch" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">All Batches</SelectItem>{allBatches.map(b => <SelectItem key={b.id} value={b.id!}>{b.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Roll</TableHead>
                            <TableHead>Batch</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRecords.map(record => (
                            <TableRow key={record.id}>
                                <TableCell>{format(new Date(record.date), 'PPP')}</TableCell>
                                <TableCell>{record.studentName}</TableCell>
                                <TableCell><Badge variant="outline">{record.studentRoll}</Badge></TableCell>
                                <TableCell>{record.batchName}</TableCell>
                                <TableCell><Badge variant={getStatusBadgeVariant(record.status)}>{record.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="outline" onClick={() => handleOpenEditDialog(record)}><Edit className="mr-2 h-4 w-4"/> Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                         {filteredRecords.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">No records found for the selected filters.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Attendance for {editingRecord?.studentName}</DialogTitle>
                    <p className="text-sm text-muted-foreground">Date: {editingRecord && format(new Date(editingRecord.date), 'PPP')}</p>
                </DialogHeader>
                 <div className="py-4">
                    <RadioGroup value={newStatus} onValueChange={(value) => setNewStatus(value as AttendanceRecord['status'])} className="flex justify-around gap-4">
                        <Label className="flex flex-col items-center justify-center gap-2 cursor-pointer p-4 border rounded-lg w-full has-[:checked]:bg-green-100 has-[:checked]:border-green-400">
                           <RadioGroupItem value="Present" id="edit-present" /> Present
                        </Label>
                        <Label className="flex flex-col items-center justify-center gap-2 cursor-pointer p-4 border rounded-lg w-full has-[:checked]:bg-red-100 has-[:checked]:border-red-400">
                           <RadioGroupItem value="Absent" id="edit-absent" /> Absent
                        </Label>
                        <Label className="flex flex-col items-center justify-center gap-2 cursor-pointer p-4 border rounded-lg w-full has-[:checked]:bg-yellow-100 has-[:checked]:border-yellow-400">
                           <RadioGroupItem value="Late" id="edit-late" /> Late
                        </Label>
                    </RadioGroup>
                 </div>
                 <div className="flex justify-end">
                    <Button onClick={handleUpdateStatus} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 animate-spin" />}
                        Update Status
                    </Button>
                 </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
