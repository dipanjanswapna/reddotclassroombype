
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Folder as FolderIcon, List as ListIcon, PlusCircle, MoreVertical } from 'lucide-react';
import { Folder, List } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { saveFolder, deleteFolder, saveList, deleteList } from '@/app/actions/planner.actions';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface FolderListSidebarProps {
  folders: Folder[];
  lists: List[];
  onFoldersChange: React.Dispatch<React.SetStateAction<Folder[]>>;
  onListsChange: React.Dispatch<React.SetStateAction<List[]>>;
  onSelectList: (listId: string) => void;
  activeListId: string;
}

export function FolderListSidebar({ folders, lists, onFoldersChange, onListsChange, onSelectList, activeListId }: FolderListSidebarProps) {
    const { userInfo } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [newFolderName, setNewFolderName] = useState('');
    const [newList, setNewList] = useState<{ name: string; folderId: string }>({ name: '', folderId: 'none' });
    
    const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
    const [isListDialogOpen, setIsListDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{type: 'folder' | 'list', item: Folder | List} | null>(null);

    const handleSaveFolder = async () => {
        if (!newFolderName.trim() || !userInfo) return;
        await saveFolder({ name: newFolderName, userId: userInfo.uid });
        setNewFolderName('');
        setIsFolderDialogOpen(false);
        toast({ title: "Folder Created!" });
        router.refresh();
    };
    
    const handleSaveList = async () => {
        if (!newList.name.trim() || !userInfo) return;
        await saveList({ 
            name: newList.name,
            folderId: newList.folderId === 'none' ? undefined : newList.folderId,
            userId: userInfo.uid
        });
        setNewList({ name: '', folderId: 'none' });
        setIsListDialogOpen(false);
        toast({ title: "List Created!" });
        router.refresh();
    };
    
    const handleDelete = async () => {
        if (!itemToDelete) return;
        if (itemToDelete.type === 'folder') {
            await deleteFolder(itemToDelete.item.id!);
            onFoldersChange(prev => prev.filter(f => f.id !== itemToDelete.item.id));
            onListsChange(prev => prev.filter(l => l.folderId !== itemToDelete.item.id));
        } else {
            await deleteList(itemToDelete.item.id!);
            onListsChange(prev => prev.filter(l => l.id !== itemToDelete.item.id));
        }
        setItemToDelete(null);
        toast({ title: `${itemToDelete.type.charAt(0).toUpperCase() + itemToDelete.type.slice(1)} Deleted`});
    };
  
    const unassignedLists = lists.filter(l => !l.folderId);

  return (
    <>
    <Card className="rounded-[20px] border-primary/20 shadow-xl overflow-hidden bg-card">
      <CardHeader className="p-4 bg-primary/5 border-b border-primary/10">
        <CardTitle className="text-xs font-black uppercase tracking-widest">Workspace</CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-2">
        <div className="grid grid-cols-2 gap-2 p-2">
            <Button variant="outline" className="h-8 text-[9px] font-black uppercase tracking-widest rounded-lg border-primary/10" onClick={() => setIsFolderDialogOpen(true)}><PlusCircle className="mr-1 h-3 w-3"/> Folder</Button>
            <Button variant="outline" className="h-8 text-[9px] font-black uppercase tracking-widest rounded-lg border-primary/10" onClick={() => setIsListDialogOpen(true)}><PlusCircle className="mr-1 h-3 w-3"/> List</Button>
        </div>

        <Button 
            onClick={() => onSelectList('all')} 
            variant={activeListId === 'all' ? 'secondary' : 'ghost'} 
            className="w-full justify-start gap-2 h-9 rounded-xl font-bold text-xs uppercase tracking-tighter"
        >
            All Tasks
        </Button>
        
        <Accordion type="multiple" className="w-full space-y-1">
          {folders.map(folder => (
            <AccordionItem key={folder.id} value={folder.id!} className="border-none">
              <div className="flex items-center group px-2 rounded-xl hover:bg-muted/50 transition-all">
                 <AccordionTrigger className="hover:no-underline py-2 flex-grow text-xs font-black uppercase tracking-tighter">
                    <div className="flex items-center gap-2">
                        <FolderIcon className="h-3.5 w-3.5 text-primary"/>
                        <span>{folder.name}</span>
                    </div>
                </AccordionTrigger>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"><MoreVertical className="h-3.5 w-3.5"/></Button></DropdownMenuTrigger>
                    <DropdownMenuContent className="rounded-xl shadow-2xl">
                        <DropdownMenuItem className="text-xs font-bold" onClick={() => setItemToDelete({type: 'folder', item: folder})}>Delete Folder</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <AccordionContent className="pl-4 pt-1 space-y-1">
                    {lists.filter(l => l.folderId === folder.id).map(list => (
                        <div key={list.id} className="flex items-center group rounded-lg hover:bg-primary/5 transition-all">
                            <Button 
                                variant={activeListId === list.id ? 'secondary' : 'ghost'} 
                                className="w-full justify-start gap-2 h-8 flex-grow text-[11px] font-medium" 
                                onClick={() => onSelectList(list.id!)}
                            >
                                <ListIcon className="h-3 w-3 text-muted-foreground"/> {list.name}
                            </Button>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"><MoreVertical className="h-3.5 w-3.5"/></Button></DropdownMenuTrigger>
                                <DropdownMenuContent className="rounded-xl shadow-2xl">
                                    <DropdownMenuItem className="text-xs font-bold" onClick={() => setItemToDelete({type: 'list', item: list})}>Delete List</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}
                    <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground justify-start gap-2 h-8" onClick={() => { setNewList({ name: '', folderId: folder.id! }); setIsListDialogOpen(true); }}>
                        <PlusCircle className="h-3 w-3"/> Add list
                    </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="space-y-1 pt-2 border-t border-primary/5">
           {unassignedLists.map(list => (
                <div key={list.id} className="flex items-center group rounded-lg hover:bg-primary/5 transition-all px-2">
                    <Button 
                        variant={activeListId === list.id ? 'secondary' : 'ghost'} 
                        className="w-full justify-start gap-2 h-8 flex-grow text-[11px] font-medium" 
                        onClick={() => onSelectList(list.id!)}
                    >
                        <ListIcon className="h-3 w-3 text-muted-foreground"/> {list.name}
                    </Button>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"><MoreVertical className="h-3.5 w-3.5"/></Button></DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-xl shadow-2xl">
                            <DropdownMenuItem className="text-xs font-bold" onClick={() => setItemToDelete({type: 'list', item: list})}>Delete List</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
    
    <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent className="rounded-[25px]"><DialogHeader><DialogTitle className="font-headline uppercase tracking-tight">Create New Folder</DialogTitle></DialogHeader>
        <Input className="rounded-xl" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="e.g., HSC 2025" />
        <DialogFooter><Button className="rounded-xl font-bold uppercase tracking-widest text-xs h-11" onClick={handleSaveFolder}>Save Folder</Button></DialogFooter></DialogContent>
    </Dialog>
    
    <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
         <DialogContent className="rounded-[25px]"><DialogHeader><DialogTitle className="font-headline uppercase tracking-tight">Create New List</DialogTitle></DialogHeader>
         <Input className="rounded-xl" value={newList.name} onChange={(e) => setNewList(p => ({...p, name: e.target.value}))} placeholder="e.g., Physics Chapter 5" />
         <Select value={newList.folderId} onValueChange={(v) => setNewList(p => ({...p, folderId: v}))}>
            <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select a folder (optional)..." /></SelectTrigger>
            <SelectContent className="rounded-xl">
                <SelectItem value="none">No Folder</SelectItem>
                {folders.map(f => <SelectItem key={f.id} value={f.id!}>{f.name}</SelectItem>)}
            </SelectContent>
         </Select>
         <DialogFooter><Button className="rounded-xl font-bold uppercase tracking-widest text-xs h-11" onClick={handleSaveList}>Save List</Button></DialogFooter></DialogContent>
    </Dialog>

    <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent className="rounded-[25px]">
            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{itemToDelete?.item.name}". If this is a folder, all lists and tasks within it will also be deleted.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
