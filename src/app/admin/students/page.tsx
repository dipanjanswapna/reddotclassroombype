

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, Pencil, Trash2, MoreVertical, Shield, UserCog, GraduationCap, AreaChart, PlusCircle, Loader2, UserCheck, UserX, Handshake, Search, Settings } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/lib/types';
import { getUsers } from '@/lib/firebase/firestore';
import { saveUserAction, deleteUserAction } from '@/app/actions/user.actions';
import { LoadingSpinner } from '@/components/loading-spinner';
import Link from 'next/link';

const roleIcons: { [key in User['role']]: React.ReactNode } = {
  Student: <GraduationCap className="h-4 w-4" />,
  Teacher: <UserCog className="h-4 w-4" />,
  Guardian: <Shield className="h-4 w-4" />,
  Admin: <UserCog className="h-4 w-4" />,
  Affiliate: <UserCheck className="h-4 w-4" />,
  Moderator: <UserX className="h-4 w-4" />,
  Seller: <Handshake className="h-4 w-4" />,
};

const roleColors: { [key in User['role']]: string } = {
  Student: 'border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
  Teacher: 'border-green-300 bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
  Guardian: 'border-purple-300 bg-purple-50 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
  Admin: 'border-primary/30 bg-primary/10 text-primary',
  Affiliate: 'border-yellow-300 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
  Moderator: 'border-orange-300 bg-orange-50 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700',
  Seller: 'border-indigo-300 bg-indigo-50 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700',
};

const statusColors: { [key in User['status']]: string } = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Suspended: 'bg-red-100 text-red-800 border-red-200',
    'Pending Approval': 'bg-yellow-100 text-yellow-800 border-yellow-200',
};


export default function StudentUserManagementPage() {
  const [studentUsers, setStudentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for the dialog
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>('Student');
  const [mobileNumber, setMobileNumber] = useState('');
  const [guardianMobileNumber, setGuardianMobileNumber] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const fetchedUsers = await getUsers();
        const studentRoles: User['role'][] = ['Student', 'Guardian'];
        setStudentUsers(fetchedUsers.filter(user => studentRoles.includes(user.role)));
    } catch(e) {
        toast({ title: 'Error', description: 'Could not fetch users', variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (user: User | null) => {
    setEditingUser(user);
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setMobileNumber(user.mobileNumber || '');
      setGuardianMobileNumber(user.guardianMobileNumber || '');
    } else {
      // Reset for new user
      setName('');
      setEmail('');
      setRole('Student');
      setMobileNumber('');
      setGuardianMobileNumber('');
    }
    setIsDialogOpen(true);
  };
  
  const handleSaveUser = async () => {
    if (!name || !email) {
      toast({ title: "Missing Information", description: "Please fill out all fields.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const result = await saveUserAction({ 
        id: editingUser?.id, 
        name, 
        email, 
        role, 
        joined: editingUser?.joined || new Date().toISOString().split('T')[0], 
        status: editingUser?.status || 'Active',
        mobileNumber,
        guardianMobileNumber
    });
    if(result.success) {
        toast({ title: editingUser ? 'User Updated' : 'User Created', description: result.message });
        await fetchData();
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setIsSaving(false);
    setIsDialogOpen(false);
  };


  const handleDeleteUser = async () => {
    if (!userToDelete || !userToDelete.id) return;
    const result = await deleteUserAction(userToDelete.id);
    if(result.success) {
      toast({ title: "User Deleted", description: `User "${userToDelete.name}" has been permanently deleted.` });
      await fetchData();
    } else {
       toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setUserToDelete(null);
  };
  
  const handleStatusUpdate = async (userToUpdate: User, newStatus: User['status']) => {
    if(!userToUpdate.id) return;
    const result = await saveUserAction({ id: userToUpdate.id, status: newStatus });
    if(result.success) {
        await fetchData();
        toast({
            title: "User Status Updated",
            description: `User "${userToUpdate.name}" has been ${newStatus === 'Active' ? 'activated' : newStatus.toLowerCase()}.`,
        });
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };
  
  const filteredUsers = studentUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.classRoll && user.classRoll.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Student & Guardian Management</h1>
          <p className="mt-1 text-lg text-muted-foreground">View and manage all student and guardian accounts.</p>
        </div>
        <Button onClick={() => handleOpenDialog(null)}>
          <PlusCircle className="mr-2" />
          Create User
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Student & Guardian Users</CardTitle>
          <CardDescription>A list of all registered students and guardians. You can search by name, email, or class roll.</CardDescription>
          <div className="relative pt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1.2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search by name, email, or class roll..."
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
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Class Roll</TableHead>
                <TableHead>Registration No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`gap-2 ${roleColors[user.role]}`}>
                      {roleIcons[user.role]}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.classRoll || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="max-w-[120px] truncate">{user.registrationNumber || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[user.status]}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                           <Link href={`/admin/manage-user/${user.id}`}><Settings className="mr-2"/>Manage Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleOpenDialog(user)}><Pencil className="mr-2" />Quick Edit</DropdownMenuItem>
                        {user.status === 'Active' && user.role !== 'Admin' && (
                           <DropdownMenuItem onClick={() => handleStatusUpdate(user, 'Suspended')}>
                                <UserX className="mr-2 text-destructive"/>Suspend User
                            </DropdownMenuItem>
                         )}
                          {user.status === 'Suspended' && (
                           <DropdownMenuItem onClick={() => handleStatusUpdate(user, 'Active')}>
                                <UserCheck className="mr-2 text-green-600"/>Re-activate User
                            </DropdownMenuItem>
                         )}
                        {user.role !== 'Admin' && <DropdownMenuSeparator />}
                        {user.role !== 'Admin' && (
                            <DropdownMenuItem 
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onSelect={() => setUserToDelete(user)}
                            >
                            <Trash2 className="mr-2" />Delete User
                            </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account for <strong>{userToDelete?.name}</strong> and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update the details for this user.' : 'Fill in the details for the new user.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Role</Label>
                <Select value={role} onValueChange={(v: User['role']) => setRole(v)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Guardian">Guardian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mobileNumber" className="text-right">Mobile No.</Label>
                <Input id="mobileNumber" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="guardianMobileNumber" className="text-right">Guardian Mobile</Label>
                <Input id="guardianMobileNumber" value={guardianMobileNumber} onChange={e => setGuardianMobileNumber(e.target.value)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleSaveUser} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 animate-spin"/>}
                Save User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
