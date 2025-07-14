
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
import { PlusCircle, Edit, Trash2, Loader2, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Notice } from '@/lib/types';
import { saveNoticeAction, deleteNoticeAction } from '@/app/actions/notice.actions';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/auth-context';
import { Badge } from '@/components/ui/badge';

interface NoticeClientProps {
  initialNotices: Notice[];
}

export function NoticeClient({ initialNotices }: NoticeClientProps) {
    const { toast } = useToast();
    const { userInfo } = useAuth();
    const [notices, setNotices] = useState<Notice[]>(initialNotices);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingNotice, setEditingNotice] = useState<Partial<Notice> | null>(null);
    const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);

    const handleOpenDialog = (notice: Notice | null) => {
        setEditingNotice(notice ? { ...notice } : { title: '', content: '', isPublished: true });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingNotice || !editingNotice.title || !userInfo) {
            toast({ title: 'Error', description: 'Title is required.', variant: 'destructive'});
            return;
        }
        setIsSaving(true);
        const noticeData: Partial<Notice> = {
            ...editingNotice,
            authorId: userInfo.uid,
            authorRole: userInfo.role,
        };

        const result = await saveNoticeAction(noticeData);

        if (result.success) {
            toast({ title: 'Success', description: result.message });
            window.location.reload(); // Refresh data
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setIsSaving(false);
        setIsDialogOpen(false);
    };

    const handleDelete = async () => {
        if (!noticeToDelete?.id) return;
        const result = await deleteNoticeAction(noticeToDelete.id);
        if (result.success) {
            setNotices(notices.filter(n => n.id !== noticeToDelete.id));
            toast({ title: 'Notice Deleted', description: result.message, variant: 'destructive' });
        } else {
             toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setNoticeToDelete(null);
    };

    const updateField = (field: keyof Notice, value: any) => {
        setEditingNotice(prev => prev ? { ...prev, [field]: value } : null);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>All Notices</CardTitle>
                        <CardDescription>Manage important announcements for your users.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog(null)}>
                        <PlusCircle className="mr-2"/> Create Notice
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Published Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {notices.map(notice => (
                                <TableRow key={notice.id}>
                                    <TableCell className="font-medium">{notice.title}</TableCell>
                                    <TableCell>{format(safeToDate(notice.publishedAt), 'PPP')}</TableCell>
                                    <TableCell><Badge variant={notice.isPublished ? "accent" : "secondary"}>{notice.isPublished ? 'Published' : 'Draft'}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleOpenDialog(notice)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => setNoticeToDelete(notice)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingNotice?.id ? 'Edit Notice' : 'Create New Notice'}</DialogTitle>
                    </DialogHeader>
                    {editingNotice && (
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2"> <Label htmlFor="title">Title</Label> <Input id="title" value={editingNotice.title || ''} onChange={e => updateField('title', e.target.value)} /> </div>
                            <div className="space-y-2"> <Label htmlFor="content">Content</Label> <Textarea id="content" rows={10} value={editingNotice.content || ''} onChange={e => updateField('content', e.target.value)} /> </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="isPublished" checked={editingNotice.isPublished} onCheckedChange={(checked) => updateField('isPublished', checked)} />
                                <Label htmlFor="isPublished">Publish this notice immediately</Label>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleSave} disabled={isSaving}>{isSaving && <Loader2 className="animate-spin mr-2"/>}Save Notice</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!noticeToDelete} onOpenChange={(open) => !open && setNoticeToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the notice: <strong>{noticeToDelete?.title}</strong>.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
