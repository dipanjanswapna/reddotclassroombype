
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
import { useToast } from '@/hooks/use-toast';
import { allInstructors, Instructor, organizations } from '@/lib/mock-data';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PlusCircle, MoreVertical, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const partnerId = 'org_medishark'; // Mock partner ID
const partnerInstructors = allInstructors.filter(inst => inst.organizationId === partnerId);


export default function PartnerTeacherManagementPage() {
  const { toast } = useToast();
  const [instructors, setInstructors] = useState<Instructor[]>(partnerInstructors);

  const handleRemoveTeacher = (id: string) => {
    setInstructors(instructors.filter(inst => inst.id !== id));
     toast({
      title: "Teacher Removed",
      description: "The teacher has been removed from your organization.",
      variant: 'destructive',
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Teacher Management
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">
            Manage all teachers associated with your organization.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2" />
          Invite New Teacher
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Teachers</CardTitle>
          <CardDescription>A list of all teachers in your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Title/Expertise</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructors.map((inst) => (
                <TableRow key={inst.id}>
                  <TableCell className="flex items-center gap-3">
                     <Avatar className="h-9 w-9">
                        <AvatarImage src={inst.avatarUrl} alt={inst.name} />
                        <AvatarFallback>{inst.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{inst.name}</span>
                  </TableCell>
                  <TableCell>
                    {inst.title}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleRemoveTeacher(inst.id)}>
                                <Trash2 className="mr-2 h-4 w-4"/> Remove
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
    </div>
  );
}
