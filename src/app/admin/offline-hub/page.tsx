

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building, BookCopy, Users, Users2 } from "lucide-react"
import { BranchManager } from "@/components/admin/offline/branch-manager";
import { PlaceholderPage } from "@/components/placeholder-page";
import { getBranches, getBatches, getCourses, getInstructors, getUsers } from "@/lib/firebase/firestore";
import { BatchManager } from "@/components/admin/offline/batch-manager";
import { StudentManager } from "@/components/admin/offline/student-manager";

export default async function AdminOfflineHubPage() {
    const [
        initialBranches, 
        initialBatches,
        allCourses,
        allInstructors,
        allUsers
    ] = await Promise.all([
        getBranches(),
        getBatches(),
        getCourses(),
        getInstructors(),
        getUsers(),
    ]);
    
    const studentUsers = allUsers.filter(u => u.role === 'Student');
    const managerUsers = allUsers.filter(u => u.role === 'Admin' || u.role === 'Moderator');

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Offline Hub Management</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Manage all offline branches, courses, batches, and students.
                </p>
            </div>
            <Tabs defaultValue="branches">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="branches"><Building className="mr-2"/>Branches</TabsTrigger>
                    <TabsTrigger value="batches"><Users2 className="mr-2"/>Batches</TabsTrigger>
                    <TabsTrigger value="courses"><BookCopy className="mr-2"/>Courses</TabsTrigger>
                    <TabsTrigger value="students"><Users className="mr-2"/>Students</TabsTrigger>
                </TabsList>
                <TabsContent value="branches" className="mt-6">
                    <BranchManager initialBranches={initialBranches} allManagers={managerUsers} />
                </TabsContent>
                <TabsContent value="batches" className="mt-6">
                   <BatchManager 
                        initialBatches={initialBatches}
                        allCourses={allCourses}
                        allBranches={initialBranches}
                        allInstructors={allInstructors}
                   />
                </TabsContent>
                <TabsContent value="courses" className="mt-6">
                    <PlaceholderPage title="Offline Courses" description="This section is under construction. Here you will be able to manage courses specifically designed for offline branches."/>
                </TabsContent>
                 <TabsContent value="students" className="mt-6">
                   <StudentManager
                        initialStudents={studentUsers}
                        allBranches={initialBranches}
                        allBatches={initialBatches}
                   />
                </TabsContent>
            </Tabs>
        </div>
    );
}
