
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Folder as FolderIcon, List as ListIcon, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Folder, List } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { saveFolder, deleteFolder, saveList } from '@/app/actions/planner.actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FolderListSidebarProps {
  folders: Folder[];
  lists: List[];
  onFoldersChange: React.Dispatch<React.SetStateAction<Folder[]>>;
  onListsChange: React.Dispatch<React.SetStateAction<List[]>>;
}

export function FolderListSidebar({ folders, lists, onFoldersChange, onListsChange }: FolderListSidebarProps) {
    const { userInfo } = useAuth();
    const { toast } = useToast();
    const [newFolderName, setNewFolderName] = useState('');
    const [newList, setNewList] = useState({ name: '', folderId: '' });
    
    const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
    const [isListDialogOpen, setIsListDialogOpen] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);

    const handleSaveFolder = async () => {
        if (!newFolderName.trim() || !userInfo) return;
        
        const newFolder: Partial<Folder> = { name: newFolderName, userId: userInfo.uid, createdAt: new Date() as any };
        await saveFolder(newFolder);
        
        // This is an optimistic update. A better approach might refetch or get the created object back.
        onFoldersChange(prev => [...prev, { ...newFolder, id: `temp-${Date.now()}` }]);
        
        setNewFolderName('');
        setIsFolderDialogOpen(false);
        toast({ title: "Folder Created!" });
    };
    
    const handleSaveList = async () => {
        if (!newList.name.trim() || !userInfo) return;

        const newListData: Partial<List> = { ...newList, userId: userInfo.uid, createdAt: new Date() as any };
        await saveList(newListData);
        
        onListsChange(prev => [...prev, { ...newListData, id: `temp-${Date.now()}` }]);

        setNewList({ name: '', folderId: '' });
        setIsListDialogOpen(false);
        toast({ title: "List Created!" });
    };
    
    const handleDeleteFolder = async () => {
        if (!folderToDelete?.id) return;
        await deleteFolder(folderToDelete.id);
        
        onFoldersChange(prev => prev.filter(f => f.id !== folderToDelete.id));
        // Also remove lists associated with that folder from the UI
        onListsChange(prev => prev.filter(l => l.folderId !== folderToDelete.id));
        
        setFolderToDelete(null);
        toast({ title: "Folder Deleted", description: `"${folderToDelete.name}" and all its lists were deleted.`});
    };
  
    const unassignedLists = lists.filter(l => !l.folderId);

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Folders & Lists</CardTitle>
        <CardDescription>Organize your tasks.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full" onClick={() => setIsFolderDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4"/> New Folder</Button>
        <Button variant="outline" className="w-full" onClick={() => setIsListDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4"/> New List</Button>
        
        <Accordion type="multiple" className="w-full">
          {folders.map(folder => (
            <AccordionItem key={folder.id} value={folder.id!}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                    <FolderIcon className="h-4 w-4 text-primary"/>
                    <span className="font-semibold">{folder.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-4">
                 <div className="space-y-1">
                    {lists.filter(l => l.folderId === folder.id).map(list => (
                        <Button key={list.id} variant="ghost" className="w-full justify-start gap-2">
                            <ListIcon className="h-4 w-4"/> {list.name}
                        </Button>
                    ))}
                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => { setNewList({ name: '', folderId: folder.id! }); setIsListDialogOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Add list
                    </Button>
                 </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="space-y-1 pt-4 border-t">
           {unassignedLists.map(list => (
                <Button key={list.id} variant="ghost" className="w-full justify-start gap-2">
                    <ListIcon className="h-4 w-4"/> {list.name}
                </Button>
            ))}
        </div>
      </CardContent>
    </Card>
    
    {/* Dialogs */}
    <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Create New Folder</DialogTitle></DialogHeader>
        <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="e.g., HSC 2025" />
        <DialogFooter><Button onClick={handleSaveFolder}>Save Folder</Button></DialogFooter></DialogContent>
    </Dialog>
    
    <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
         <DialogContent><DialogHeader><DialogTitle>Create New List</DialogTitle></DialogHeader>
         <Input value={newList.name} onChange={(e) => setNewList(p => ({...p, name: e.target.value}))} placeholder="e.g., Physics Chapter 5" />
         <Select value={newList.folderId} onValueChange={(v) => setNewList(p => ({...p, folderId: v}))}>
            <SelectTrigger><SelectValue placeholder="Select a folder (optional)..." /></SelectTrigger>
            <SelectContent>
                <SelectItem value="">No Folder</SelectItem>
                {folders.map(f => <SelectItem key={f.id} value={f.id!}>{f.name}</SelectItem>)}
            </SelectContent>
         </Select>
         <DialogFooter><Button onClick={handleSaveList}>Save List</Button></DialogFooter></DialogContent>
    </Dialog>

    <AlertDialog open={!!folderToDelete} onOpenChange={(open) => !open && setFolderToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the folder "{folderToDelete?.name}" and all lists and tasks within it.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteFolder} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

