
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Loader2, MoreVertical, X, Check, Image as ImageIcon, Video, Music } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Question, QuestionOption, MatchingPair } from '@/lib/types';
import { saveQuestionAction, deleteQuestionAction } from '@/app/actions/question-bank.actions';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';

interface QuestionBankClientProps {
  initialQuestions: Question[];
  subjects: string[];
  chapters: string[];
}

const difficultyColors = {
  Easy: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:border-yellow-700 dark:text-yellow-300',
  Hard: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300',
};

const questionTypes: Question['type'][] = ['MCQ', 'True/False', 'Fill in the Blanks', 'Short Answer', 'Essay', 'Matching'];

export function QuestionBankClient({ initialQuestions, subjects: allSubjects, chapters: allChapters }: QuestionBankClientProps) {
    const { toast } = useToast();
    const [questions, setQuestions] = useState<Question[]>(initialQuestions);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);
    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

    // Filters
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [chapterFilter, setChapterFilter] = useState('all');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const filteredQuestions = useMemo(() => {
        return questions.filter(q => 
            (subjectFilter === 'all' || q.subject === subjectFilter) &&
            (chapterFilter === 'all' || q.chapter === chapterFilter) &&
            (difficultyFilter === 'all' || q.difficulty === difficultyFilter) &&
            (typeFilter === 'all' || q.type === typeFilter)
        );
    }, [questions, subjectFilter, chapterFilter, difficultyFilter, typeFilter]);

    const handleOpenDialog = (question: Question | null) => {
        setEditingQuestion(question ? { ...question } : { type: 'MCQ', difficulty: 'Medium', points: 1, options: [{id: 'opt1', text: '', isCorrect: true}], matchingPairs: [{id: 'match1', prompt: '', match: ''}] });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingQuestion) return;
        setIsSaving(true);
        
        const result = await saveQuestionAction(editingQuestion);

        if (result.success) {
            toast({ title: 'Success', description: result.message });
            window.location.reload(); // Simple refresh to get latest data
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setIsSaving(false);
        setIsDialogOpen(false);
    };

    const handleDelete = async () => {
        if (!questionToDelete?.id) return;
        const result = await deleteQuestionAction(questionToDelete.id);
        if (result.success) {
            setQuestions(questions.filter(q => q.id !== questionToDelete.id));
            toast({ title: 'Question Deleted', description: result.message, variant: 'destructive' });
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setQuestionToDelete(null);
    };
    
    // Form field update handlers
    const updateField = (field: keyof Question, value: any) => {
        setEditingQuestion(prev => prev ? { ...prev, [field]: value } : null);
    };
    const updateOption = (optionId: string, field: 'text' | 'isCorrect', value: string | boolean) => {
        setEditingQuestion(prev => {
            if (!prev) return null;
            const newOptions = prev.options?.map(opt => {
                if (opt.id === optionId) {
                    return { ...opt, [field]: value };
                }
                // For single-correct MCQ, uncheck others when a new one is checked
                if (prev.type === 'MCQ' && field === 'isCorrect' && value === true) {
                    return { ...opt, isCorrect: false };
                }
                return opt;
            });
            // Ensure the clicked one is set correctly after unchecking others
            if (prev.type === 'MCQ' && field === 'isCorrect' && value === true) {
                const finalOptions = newOptions?.map(opt => opt.id === optionId ? { ...opt, isCorrect: true } : opt);
                return { ...prev, options: finalOptions };
            }
            return { ...prev, options: newOptions };
        });
    };

    const addOption = () => {
        setEditingQuestion(prev => prev ? { ...prev, options: [...(prev.options || []), { id: `opt_${Date.now()}`, text: '', isCorrect: false }] } : null);
    };
    const removeOption = (optionId: string) => {
        setEditingQuestion(prev => prev ? { ...prev, options: prev.options?.filter(o => o.id !== optionId) } : null);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Question Bank</CardTitle>
                    <CardDescription>Create, edit, and manage all exam questions.</CardDescription>
                </div>
                <Button onClick={() => handleOpenDialog(null)}><PlusCircle className="mr-2" />Create Question</Button>
            </div>
            
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap gap-2">
                        <Select value={subjectFilter} onValueChange={setSubjectFilter}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by Subject" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">All Subjects</SelectItem>{allSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                         <Select value={chapterFilter} onValueChange={setChapterFilter}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by Chapter" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">All Chapters</SelectItem>{allChapters.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                         <Select value={difficultyFilter} onValueChange={setDifficultyFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Filter by Difficulty" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">All Difficulties</SelectItem><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent>
                        </Select>
                         <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Filter by Type" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">All Types</SelectItem>{questionTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Question</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Difficulty</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredQuestions.map(q => (
                                <TableRow key={q.id}>
                                    <TableCell className="font-medium max-w-sm truncate">{q.text}</TableCell>
                                    <TableCell><Badge variant="secondary">{q.type}</Badge></TableCell>
                                    <TableCell><Badge className={difficultyColors[q.difficulty]}>{q.difficulty}</Badge></TableCell>
                                    <TableCell>{q.subject || 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleOpenDialog(q)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => setQuestionToDelete(q)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{editingQuestion?.id ? 'Edit Question' : 'Create New Question'}</DialogTitle>
                    </DialogHeader>
                    {editingQuestion && (
                        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                            <div className="space-y-2">
                                <Label>Question Type</Label>
                                <Select value={editingQuestion.type} onValueChange={(v: Question['type']) => updateField('type', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{questionTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Question Text</Label>
                                <Textarea value={editingQuestion.text} onChange={e => updateField('text', e.target.value)} rows={3} />
                                {editingQuestion.type === 'Fill in the Blanks' && <p className="text-xs text-muted-foreground">Use __BLANK__ to indicate a blank space.</p>}
                            </div>
                            
                            {/* Type-specific fields */}
                            {editingQuestion.type === 'MCQ' && (
                                <div className="p-4 border rounded-md space-y-2">
                                    <Label>Options</Label>
                                    {editingQuestion.options?.map(opt => (
                                        <div key={opt.id} className="flex items-center gap-2">
                                            <Checkbox checked={opt.isCorrect} onCheckedChange={(checked) => updateOption(opt.id, 'isCorrect', !!checked)} />
                                            <Input value={opt.text} onChange={e => updateOption(opt.id, 'text', e.target.value)} className="flex-grow"/>
                                            <Button variant="ghost" size="icon" onClick={() => removeOption(opt.id)}><X className="h-4 w-4 text-destructive"/></Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={addOption}>Add Option</Button>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2"><Label>Points</Label><Input type="number" value={editingQuestion.points} onChange={e => updateField('points', Number(e.target.value))} /></div>
                                <div className="space-y-2"><Label>Difficulty</Label>
                                    <Select value={editingQuestion.difficulty} onValueChange={(v: Question['difficulty']) => updateField('difficulty', v)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2"><Label>Subject</Label><Input value={editingQuestion.subject || ''} onChange={e => updateField('subject', e.target.value)} /></div>
                            </div>

                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleSave} disabled={isSaving}>{isSaving && <Loader2 className="animate-spin mr-2"/>}Save Question</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             <AlertDialog open={!!questionToDelete} onOpenChange={(open) => !open && setQuestionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the question.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
