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

    const handleOpenDialog = (branch: Branch | null) => {
        setEditingBranch(branch);
        if (branch) {
            setIsDialogOpen(true);
        } else {
            setIsDialogOpen(true);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Save logic here
        setIsSaving(false);
    };
    
    const handleDelete = async () => {
        // Delete logic here
    };

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
                                    <TableCell>{branch.contactPhone}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenDialog(branch)}><Edit className="mr-2 h-4 w-4" /> Edit Details</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => setBranchToDelete(branch)}><Trash2 className="mr-2 h-4 w-4" /> Delete Center</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}