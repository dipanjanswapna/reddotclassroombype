
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Loader2, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@/lib/types';
import { getUsers, deleteUserAction, getInstructorByUid } from '@/lib/firebase/firestore';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';
import { saveUserAction } from '@/app/actions/user.actions';

export default function DoubtSolverManagementPage() {
    const { toast } = useToast();
    const { signup } = useAuth();
    const [solvers, setSolvers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingSolver, setEditingSolver] = useState<Partial<User> | null>(null);
    const [solverToDelete, setSolverToDelete] = useState<User | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const allUsers = await getUsers();
            setSolvers(allUsers.filter(u => u.role === 'Doubt Solver'));
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to load doubt solvers.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenDialog = (solver: Partial<User> | null) => {
        setEditingSolver(solver);
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingSolver || !editingSolver.name || !editingSolver.email) {
            toast({ title: 'Error', description: 'Name and email are required.', variant: 'destructive' });
            return;
        }
        setIsSaving(true);
        let result;
        if (editingSolver.id) {
            result = await saveUserAction(editingSolver);
        } else {
            // New user creation by admin
            try {
                if (!editingSolver.password) throw new Error("Password is required for new solvers.");
                // Create user auth account
                const userCredential = await signup(editingSolver.email, editingSolver.password, editingSolver.name, 'Doubt Solver');

                // Then save the user data using the server action, which doesn't have public checks
                const userData: Partial<User> = {
                    ...editingSolver,
                    uid: userCredential.user.uid,
                    status: 'Active',
                    role: 'Doubt Solver'
                };
                delete userData.password; // Do not save password in Firestore
                result = await saveUserAction(userData);

                 if (result.success) {
                    await getInstructorByUid(userCredential.user.uid); // Ensure instructor profile is created
                }

            } catch(e: any) {
                result = { success: false, message: e.message };
            }
        }

        if (result.success) {
            toast({ title: 'Success', description: result.message || 'Doubt Solver saved successfully.' });
            fetchData();
            setIsDialogOpen(false);
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
        setIsSaving(false);
    };
    
    const handleDelete = async () => {
        if (!solverToDelete?.id) return;
        const result = await deleteUserAction(solverToDelete.id);
        if (result.success) {
            fetchData();
            toast({ title: 'Doubt Solver Deleted', description: result.message, variant: 'destructive' });
        } else {
             toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setSolverToDelete(null);
    };

    if (loading) {
        return <div className="flex h-[calc(100vh-8rem)] items-center justify-center"><LoadingSpinner /></div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Doubt Solver Management</h1>
                    <p className="mt-1 text-lg text-muted-foreground">Create and manage your team of doubt solvers.</p>
                </div>
                <Button onClick={() => handleOpenDialog({ role: 'Doubt Solver', status: 'Active' })}><PlusCircle className="mr-2" />Add Doubt Solver</Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Doubt Solvers</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {solvers.map(solver => (
                                <TableRow key={solver.id}>
                                    <TableCell className="font-medium">{solver.name}</TableCell>
                                    <TableCell>{solver.email}</TableCell>
                                    <TableCell><Badge variant={solver.status === 'Active' ? 'accent' : 'destructive'}>{solver.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleOpenDialog(solver)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => setSolverToDelete(solver)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={(open) => { if(!open) setEditingSolver(null); setIsDialogOpen(open) }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingSolver?.id ? 'Edit Doubt Solver' : 'Create Doubt Solver'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={editingSolver?.name || ''} onChange={e => setEditingSolver(p => ({...p, name: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={editingSolver?.email || ''} onChange={e => setEditingSolver(p => ({...p, email: e.target.value}))} disabled={!!editingSolver?.id} />
                        </div>
                        {!editingSolver?.id && (
                             <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" onChange={e => setEditingSolver(p => ({...p, password: e.target.value}))} />
                             </div>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="animate-spin mr-2"/>}Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!solverToDelete} onOpenChange={(open) => !open && setSolverToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the doubt solver account for {solverToDelete?.name}.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
