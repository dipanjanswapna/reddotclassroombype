'use client';

import { useState } from 'react';
import { Eye, Pencil, Trash2, MoreVertical, Shield, UserCog, GraduationCap } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type User = {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Teacher' | 'Guardian' | 'Admin';
  status: 'Active' | 'Suspended';
  joined: string;
};

const mockUsers: User[] = [
  { id: 'usr_stud_001', name: 'Student Name', email: 'student@rdc.com', role: 'Student', status: 'Active', joined: '2024-05-20' },
  { id: 'usr_tech_002', name: 'Teacher Name', email: 'teacher@rdc.com', role: 'Teacher', status: 'Active', joined: '2024-03-10' },
  { id: 'usr_guar_003', name: 'Guardian Name', email: 'guardian@rdc.com', role: 'Guardian', status: 'Active', joined: '2024-05-21' },
  { id: 'usr_admn_004', name: 'Admin Name', email: 'admin@rdc.com', role: 'Admin', status: 'Active', joined: '2024-01-01' },
  { id: 'usr_stud_005', name: 'Suspended Student', email: 'suspended@rdc.com', role: 'Student', status: 'Suspended', joined: '2024-04-15' },
];

const roleIcons: { [key in User['role']]: React.ReactNode } = {
  Student: <GraduationCap className="h-4 w-4" />,
  Teacher: <UserCog className="h-4 w-4" />,
  Guardian: <Shield className="h-4 w-4" />,
  Admin: <UserCog className="h-4 w-4" />,
};

const roleColors: { [key in User['role']]: string } = {
  Student: 'border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
  Teacher: 'border-green-300 bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
  Guardian: 'border-purple-300 bg-purple-50 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
  Admin: 'border-primary/30 bg-primary/10 text-primary',
};

export default function UserManagementPage() {
  const [users, setUsers] = useState(mockUsers);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    setUsers(users.filter(user => user.id !== userToDelete.id));
    toast({
      title: "User Deleted",
      description: `User "${userToDelete.name}" has been permanently deleted.`,
      variant: 'destructive',
    });
    setUserToDelete(null); // Close the dialog
  };
  
  const handleSuspendUser = (userToSuspend: User) => {
    setUsers(users.map(user => 
        user.id === userToSuspend.id 
        ? { ...user, status: user.status === 'Active' ? 'Suspended' : 'Active' } 
        : user
    ));
    toast({
        title: "User Status Updated",
        description: `User "${userToSuspend.name}" has been ${userToSuspend.status === 'Active' ? 'suspended' : 'activated'}.`,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">User Management</h1>
        <p className="mt-1 text-lg text-muted-foreground">View and manage all user accounts on the platform.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all registered users.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.id}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`gap-2 ${roleColors[user.role]}`}>
                      {roleIcons[user.role]}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'accent' : 'warning'}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>{user.joined}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="mr-2" />View Profile</DropdownMenuItem>
                        <DropdownMenuItem><Pencil className="mr-2" />Edit User</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSuspendUser(user)}>
                            {user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onSelect={() => setUserToDelete(user)}
                        >
                          <Trash2 className="mr-2" />Delete User
                        </DropdownMenuItem>
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
              This action cannot be undone. This will permanently delete the account for <strong>{userToDelete?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
