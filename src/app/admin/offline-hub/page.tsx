

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building, BookCopy, Users, Users2, ClipboardCheck } from "lucide-react"
import { BranchManager } from "@/components/admin/offline/branch-manager";
import { getBranches, getBatches, getCourses, getInstructors, getUsers, getAttendanceRecords } from "@/lib/firebase/firestore";
import { BatchManager } from "@/components/admin/offline/batch-manager";
import { StudentManager } from "@/components/admin/offline/student-manager";
import { OfflineCourseManager } from "@/components/admin/offline/offline-course-manager";
import { AttendanceManager } from "@/components/admin/offline/attendance-manager";

export default async function AdminOfflineHubPage() {
    const [
        initialBranches, 
        initialBatches,
        allCourses,
        allInstructors,
        allUsers,
        allAttendanceRecords
    ] = await Promise.all([
        getBranches(),
        getBatches(),
        getCourses(),
        getInstructors(),
        getUsers(),
        getAttendanceRecords(),
    ]);
    
    const studentUsers = allUsers.filter(u => u.role === 'Student');
    const managerUsers = allUsers.filter(u => u.role === 'Moderator');
    const offlineCourses = allCourses.filter(c => c.type === 'Offline' || c.type === 'Hybrid');


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Offline Hub Management</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Manage all offline branches, courses, batches, and students.
                </p>
            </div>
            <Tabs defaultValue="branches" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="branches"><Building className="mr-2"/>Branches</TabsTrigger>
                    <TabsTrigger value="batches"><Users2 className="mr-2"/>Batches</TabsTrigger>
                    <TabsTrigger value="courses"><BookCopy className="mr-2"/>Courses</TabsTrigger>
                    <TabsTrigger value="students"><Users className="mr-2"/>Students</TabsTrigger>
                    <TabsTrigger value="attendance"><ClipboardCheck className="mr-2"/>Attendance</TabsTrigger>
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
                    <OfflineCourseManager initialCourses={offlineCourses} />
                </TabsContent>
                 <TabsContent value="students" className="mt-6">
                   <StudentManager
                        initialStudents={studentUsers}
                        allBranches={initialBranches}
                        allBatches={initialBatches}
                   />
                </TabsContent>
                <TabsContent value="attendance" className="mt-6">
                    <AttendanceManager 
                        initialRecords={allAttendanceRecords}
                        allStudents={studentUsers}
                        allBatches={initialBatches}
                        allBranches={initialBranches}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
