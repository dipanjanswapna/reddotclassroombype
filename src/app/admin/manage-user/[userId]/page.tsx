'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Course, Enrollment, AttendanceRecord, Batch, Branch, SupportTicket, Prebooking, Invoice } from '@/lib/types';
import { getUser, getEnrollmentsByUserId, getCourses, getAttendanceForStudent, getBatches, getBranches, getSupportTicketsByUserId, getPrebookingsByUserId, getInvoiceByEnrollmentId, getDocument, getCourse } from '@/lib/firebase/firestore';
import { saveUserAction } from '@/app/actions/user.actions';
import { createInvoiceAction } from '@/app/actions/invoice.actions';
import { enrollInCourseAction } from '@/app/actions/enrollment.actions';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { safeToDate } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar, Check, ChevronsUpDown, DollarSign, Edit, GraduationCap, Loader2, User as UserIcon, Ticket, Bookmark, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { InvoiceView } from '@/components/invoice-view';
import { useAuth } from '@/context/auth-context';

const roleIcons: { [key in User['role']]: React.ReactNode } = {
  Student: <GraduationCap className="h-4 w-4" />,
  Teacher: <UserIcon className="h-4 w-4" />,
  Guardian: <UserIcon className="h-4 w-4" />,
  Admin: <UserIcon className="h-4 w-4" />,
  Affiliate: <UserIcon className="h-4 w-4" />,
  Moderator: <UserIcon className="h-4 w-4" />,
  Seller: <UserIcon className="h-4 w-4" />,
  'Doubt Solver': <UserIcon className="h-4 w-4" />,
};

export default function ManageUserPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { userInfo: adminInfo } = useAuth();
    const userId = params.userId as string;

    const [user, setUser] = useState<User | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [allBatches, setAllBatches] = useState<Batch[]>([]);
    const [allBranches, setAllBranches] = useState<Branch[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [prebookings, setPrebookings] = useState<Prebooking[]>([]);
    const [loading, setLoading] = useState(true);

    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
    const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [loadingInvoice, setLoadingInvoice] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form states
    const [editingUser, setEditingUser] = useState<Partial<User>>({});
    const [selectedCourseToEnroll, setSelectedCourseToEnroll] = useState<Course | null>(null);
    const [paymentDetails, setPaymentDetails] = useState({
      totalFee: '',
      paidAmount: '',
      paymentMethod: 'Cash',
      discount: '',
    });
    
    const fetchData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const userData = await getUser(userId);
            setUser(userData);
            setEditingUser(userData || {});

            if (userData) {
                const [
                    coursesData, 
                    enrollmentData, 
                    attendanceData, 
                    batchesData, 
                    branchesData,
                    ticketsData,
                    prebookingsData
                ] = await Promise.all([
                    getCourses(),
                    getEnrollmentsByUserId(userData.uid),
                    getAttendanceForStudent(userData.id!),
                    getBatches(),
                    getBranches(),
                    getSupportTicketsByUserId(userData.uid),
                    getPrebookingsByUserId(userData.uid),
                ]);

                setAllCourses(coursesData);
                setEnrollments(enrollmentData);
                setAttendance(attendanceData);
                setAllBatches(batchesData);
                setAllBranches(branchesData);
                setTickets(ticketsData);
                setPrebookings(prebookingsData);
                
                if (userData.role === 'Student') {
                    const enrolledCourseIds = enrollmentData.map(e => e.courseId);
                    setEnrolledCourses(coursesData.filter(c => enrolledCourseIds.includes(c.id!)));
                }
            }
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            toast({ title: "Error", description: "Could not load user data.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [userId, toast]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleProfileSave = async () => {
        if (!editingUser.id) return;
        setIsSaving(true);
        const result = await saveUserAction(editingUser);
        if (result.success) {
            toast({ title: "Success", description: "User profile updated." });
            await fetchData(); // Re-fetch all data
            setIsProfileDialogOpen(false);
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
        setIsSaving(false);
    };
    
    const handleManualEnroll = async () => {
        if (!user || !selectedCourseToEnroll || !adminInfo) return;
        setIsSaving(true);
        const totalFeeNum = parseFloat(paymentDetails.totalFee) || 0;
        const paidAmountNum = parseFloat(paymentDetails.paidAmount) || 0;
        const discountNum = parseFloat(paymentDetails.discount) || 0;
        const dueAmountNum = totalFeeNum - paidAmountNum - discountNum;

        const result = await enrollInCourseAction({
            courseId: selectedCourseToEnroll.id!, 
            userId: user.uid,
            paymentDetails: {
                totalFee: totalFeeNum,
                paidAmount: paidAmountNum,
                dueAmount: dueAmountNum,
                paymentMethod: paymentDetails.paymentMethod,
                discount: discountNum,
                paymentDate: new Date().toISOString(),
                recordedBy: adminInfo.uid,
            }
        });

        if (result.success) {
            toast({ title: "Success", description: `${user.name} has been enrolled.`});
            await fetchData(); // Re-fetch
            setIsEnrollDialogOpen(false);
            setSelectedCourseToEnroll(null);
            setPaymentDetails({ totalFee: '', paidAmount: '', paymentMethod: 'Cash', discount: '' });
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
        setIsSaving(false);
    };

    const handleViewInvoice = async (enrollment: Enrollment) => {
        if (!enrollment.id || !user) return;
        setLoadingInvoice(true);
        setIsInvoiceOpen(true);
        try {
          let invoice: Invoice | null = null;
          if (enrollment.invoiceId) {
            invoice = await getDocument<Invoice>('invoices', enrollment.invoiceId);
          }
          
          if (!invoice) {
              invoice = await getInvoiceByEnrollmentId(enrollment.id);
          }
          
          if (!invoice) {
              const course = await getCourse(enrollment.courseId);
              if (course) {
                  const creationResult = await createInvoiceAction(enrollment, user, course);
                  if (creationResult.success && creationResult.invoiceId) {
                      invoice = await getDocument<Invoice>('invoices', creationResult.invoiceId);
                  } else {
                      throw new Error(creationResult.message || 'Failed to create invoice.');
                  }
              }
          }

          if (invoice && !invoice.courseDetails.communityUrl) {
            const course = await getCourse(invoice.courseId);
            if(course) {
                 const isCycleEnrollment = !!invoice.courseDetails.cycleName;
                 const cycle = isCycleEnrollment ? course.cycles?.find(c => c.title === invoice.courseDetails.cycleName) : null;
                 const communityUrl = isCycleEnrollment ? cycle?.communityUrl : course.communityUrl;
                 if (communityUrl) {
                     invoice.courseDetails.communityUrl = communityUrl;
                 }
            }
          }
          
          if (invoice) {
            setSelectedInvoice(invoice);
          } else {
            toast({ title: 'Error', description: 'Could not find or create the invoice.', variant: 'destructive' });
            setIsInvoiceOpen(false);
          }
        } catch(err: any) {
          toast({ title: 'Error', description: `An error occurred while handling the invoice: ${err.message}`, variant: 'destructive' });
          setIsInvoiceOpen(false);
        } finally {
          setLoadingInvoice(false);
        }
    };
    
    const attendanceWithDetails = useMemo(() => {
        return attendance.map(rec => ({
            ...rec,
            courseName: allCourses.find(c => c.id === rec.courseId)?.title || 'N/A',
        })).sort((a,b) => safeToDate(b.date).getTime() - safeToDate(a.date).getTime());
    }, [attendance, allCourses]);

    const prebookingsWithDetails = useMemo(() => {
        return prebookings.map(pre => ({
            ...pre,
            courseName: allCourses.find(c => c.id === pre.courseId)?.title || 'N/A',
        })).sort((a,b) => safeToDate(b.prebookingDate).getTime() - safeToDate(a.prebookingDate).getTime());
    }, [prebookings, allCourses]);
    
    const dueAmount = useMemo(() => {
      const total = parseFloat(paymentDetails.totalFee) || 0;
      const paid = parseFloat(paymentDetails.paidAmount) || 0;
      const discount = parseFloat(paymentDetails.discount) || 0;
      return (total - paid - discount).toFixed(2);
    }, [paymentDetails.totalFee, paymentDetails.paidAmount, paymentDetails.discount]);

    if (loading) {
        return <div className="flex items-center justify-center h-[calc(100vh-8rem)]"><LoadingSpinner className="w-12 h-12 m-auto" /></div>;
    }

    if (!user) {
        return <p className="p-8 text-center">User not found.</p>;
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-20 w-20 border">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>{user.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">{user.name}</h1>
                            <Badge variant="outline" className="capitalize">{user.role}</Badge>
                        </div>
                        <p className="text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground">Reg. No: {user.registrationNumber || 'N/A'}</p>
                    </div>
                     <Button className="ml-auto" variant="outline" onClick={() => setIsProfileDialogOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                </CardHeader>
            </Card>

            <Tabs defaultValue="profile">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    {user.role === 'Student' && <TabsTrigger value="courses">Courses</TabsTrigger>}
                    {user.role === 'Student' && <TabsTrigger value="attendance">Attendance</TabsTrigger>}
                    {user.role === 'Student' && <TabsTrigger value="payments">Payments</TabsTrigger>}
                    {user.role === 'Student' && <TabsTrigger value="prebookings">Pre-bookings</TabsTrigger>}
                    <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-4">
                     <Card>
                        <CardHeader><CardTitle>Detailed Information</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                             <p><strong>Status:</strong> <Badge variant={user.status === 'Active' ? 'accent' : 'destructive'}>{user.status}</Badge></p>
                             <p><strong>Joined:</strong> {user.joined ? format(safeToDate(user.joined), 'PPP') : 'N/A'}</p>
                             <p><strong>Class Roll:</strong> {user.classRoll || 'N/A'}</p>
                             <p><strong>Offline Roll:</strong> {user.offlineRollNo || 'N/A'}</p>
                             <p><strong>Branch:</strong> {allBranches.find(b => b.id === user.assignedBranchId)?.name || 'N/A'}</p>
                             <p><strong>Batch:</strong> {allBatches.find(b => b.id === user.assignedBatchId)?.name || 'N/A'}</p>
                             <p><strong>Father's Name:</strong> {user.fathersName || 'N/A'}</p>
                             <p><strong>Mother's Name:</strong> {user.mothersName || 'N/A'}</p>
                             <p><strong>Mobile No:</strong> {user.mobileNumber || 'N/A'}</p>
                             <p><strong>Guardian's Mobile:</strong> {user.guardianMobileNumber || 'N/A'}</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {user.role === 'Student' && (
                  <>
                    <TabsContent value="courses" className="mt-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Enrolled Courses</CardTitle>
                                    <CardDescription>Courses the student is currently enrolled in.</CardDescription>
                                </div>
                                <Button onClick={() => setIsEnrollDialogOpen(true)}>Enroll in New Course</Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Progress</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {enrolledCourses.map(course => {
                                            const enrollment = enrollments.find(e => e.courseId === course.id);
                                            return (
                                                <TableRow key={course.id}>
                                                    <TableCell>{course.title}</TableCell>
                                                    <TableCell><Progress value={enrollment?.progress || 0} className="w-32" /></TableCell>
                                                    <TableCell><Badge variant="secondary" className="capitalize">{enrollment?.status}</Badge></TableCell>
                                                </TableRow>
                                            )
                                        })}
                                        {enrolledCourses.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">Not enrolled in any courses.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="attendance" className="mt-4">
                         <Card>
                            <CardHeader><CardTitle>Attendance History</CardTitle></CardHeader>
                            <CardContent>
                               <Table>
                                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Course</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                       {attendanceWithDetails.map(rec => (
                                           <TableRow key={rec.id}>
                                                <TableCell>{format(safeToDate(rec.date), 'PPP')}</TableCell>
                                                <TableCell>{rec.courseName}</TableCell>
                                                <TableCell><Badge>{rec.status}</Badge></TableCell>
                                           </TableRow>
                                       ))}
                                       {attendance.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No attendance records found.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="payments" className="mt-4">
                         <Card>
                            <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
                            <CardContent>
                               <Table>
                                    <TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead>Invoice</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                       {enrollments.map(enr => {
                                           const course = allCourses.find(c => c.id === enr.courseId);
                                           return (
                                                <TableRow key={enr.id}>
                                                    <TableCell>{course?.title || 'N/A'}</TableCell>
                                                    <TableCell>{enr.totalFee ? `৳${enr.totalFee}` : 'N/A'}</TableCell>
                                                    <TableCell>{format(safeToDate(enr.enrollmentDate), 'PPP')}</TableCell>
                                                    <TableCell>
                                                        <Button variant="outline" size="sm" onClick={() => handleViewInvoice(enr)}>
                                                            <Eye className="mr-2 h-4 w-4"/> View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                           )
                                       })}
                                        {enrollments.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">No payment history.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="prebookings" className="mt-4">
                        <Card>
                            <CardHeader><CardTitle>Pre-booking History</CardTitle></CardHeader>
                            <CardContent>
                               <Table>
                                    <TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                       {prebookingsWithDetails.map(pre => (
                                            <TableRow key={pre.id}>
                                                <TableCell>{pre.courseName}</TableCell>
                                                <TableCell>{format(safeToDate(pre.prebookingDate), 'PPP')}</TableCell>
                                            </TableRow>
                                       ))}
                                        {prebookings.length === 0 && <TableRow><TableCell colSpan={2} className="text-center">No pre-bookings found.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                  </>
                )}
                 <TabsContent value="tickets" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Support Tickets</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Last Updated</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {tickets.map(ticket => (
                                        <TableRow key={ticket.id}>
                                            <TableCell className="font-medium">{ticket.subject}</TableCell>
                                            <TableCell><Badge variant="outline">{ticket.category || 'General'}</Badge></TableCell>
                                            <TableCell><Badge variant={ticket.status === 'Closed' ? 'accent' : 'warning'}>{ticket.status}</Badge></TableCell>
                                            <TableCell>{format(safeToDate(ticket.updatedAt), 'PPP')}</TableCell>
                                        </TableRow>
                                    ))}
                                    {tickets.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">No support tickets found.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                 </TabsContent>
            </Tabs>

            {/* Edit Profile Dialog */}
            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Profile for {user.name}</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                        <div className="space-y-2"><Label>Name</Label><Input value={editingUser.name || ''} onChange={e => setEditingUser(p => ({...p, name: e.target.value}))}/></div>
                        <div className="space-y-2"><Label>Email</Label><Input value={editingUser.email || ''} disabled /></div>
                        {user.role === 'Student' && (
                            <>
                            <div className="space-y-2"><Label>Class Roll</Label><Input value={editingUser.classRoll || ''} onChange={e => setEditingUser(p => ({...p, classRoll: e.target.value}))}/></div>
                             <div className="space-y-2"><Label>Offline Roll</Label><Input value={editingUser.offlineRollNo || ''} onChange={e => setEditingUser(p => ({...p, offlineRollNo: e.target.value}))}/></div>
                             <div className="space-y-2">
                                <Label>Branch</Label>
                                <Select value={editingUser.assignedBranchId} onValueChange={value => setEditingUser(p => ({...p, assignedBranchId: value, assignedBatchId: ''}))}><SelectTrigger><SelectValue placeholder="Select Branch..." /></SelectTrigger>
                                    <SelectContent>{allBranches.map(b => <SelectItem key={b.id} value={b.id!}>{b.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Batch</Label>
                                <Select value={editingUser.assignedBatchId} onValueChange={value => setEditingUser(p => ({...p, assignedBatchId: value}))} disabled={!editingUser.assignedBranchId}>
                                    <SelectTrigger><SelectValue placeholder="Select Batch..." /></SelectTrigger>
                                    <SelectContent>{allBatches.filter(b => b.branchId === editingUser.assignedBranchId).map(b => <SelectItem key={b.id} value={b.id!}>{b.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleProfileSave} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 animate-spin"/>}Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Enroll Course Dialog */}
             <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Enroll {user.name} in a Course</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="w-full justify-between h-12 rounded-xl">
                                    {selectedCourseToEnroll ? selectedCourseToEnroll.title : "Select a course..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search courses..." />
                                    <CommandEmpty>No course found.</CommandEmpty>
                                    <CommandGroup>
                                        {allCourses.filter(c => c.status === 'Published').map(course => (
                                            <CommandItem key={course.id} onSelect={() => {
                                                setSelectedCourseToEnroll(course);
                                                setPaymentDetails(prev => ({...prev, totalFee: course.price.replace(/[^0-9.]/g, '')}))
                                            }}>
                                                <Check className={selectedCourseToEnroll?.id === course.id ? 'opacity-100 mr-2' : 'opacity-0 mr-2'}/>
                                                {course.title}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                         </Popover>
                         {selectedCourseToEnroll && (
                             <Card className="bg-muted">
                                 <CardHeader>
                                    <CardTitle className="text-lg">Payment Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="space-y-1">
                                        <Label>Total Fee</Label>
                                        <Input value={paymentDetails.totalFee} onChange={e => setPaymentDetails(p => ({...p, totalFee: e.target.value}))}/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="discount">Discount</Label>
                                            <Input id="discount" type="number" value={paymentDetails.discount} onChange={e => setPaymentDetails(p => ({...p, discount: e.target.value}))}/>
                                        </div>
                                         <div className="space-y-1">
                                            <Label htmlFor="paidAmount">Paid Amount</Label>
                                            <Input id="paidAmount" type="number" value={paymentDetails.paidAmount} onChange={e => setPaymentDetails(p => ({...p, paidAmount: e.target.value}))}/>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Due Amount</Label>
                                        <Input value={dueAmount} disabled/>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Payment Method</Label>
                                        <Select value={paymentDetails.paymentMethod} onValueChange={(v) => setPaymentDetails(p => ({...p, paymentMethod: v}))}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                                <SelectItem value="bKash">bKash</SelectItem>
                                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="Cheque">Cheque</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                             </Card>
                         )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleManualEnroll} disabled={isSaving || !selectedCourseToEnroll}>{isSaving && <Loader2 className="mr-2 animate-spin"/>}Enroll Student</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Invoice Dialog */}
            <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
                <DialogContent className="max-w-4xl p-0">
                   <div className="max-h-[85vh] overflow-y-auto">
                        {loadingInvoice ? (
                            <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : selectedInvoice ? (
                            <InvoiceView invoice={selectedInvoice} />
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
