
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Loader2, MoreVertical, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Question } from '@/lib/types';
import { saveQuestionAction, deleteQuestionAction } from '@/app/actions/question-bank.actions';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';

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
        setEditingQuestion(question ? { ...question } : { 
            type: 'MCQ', 
            difficulty: 'Medium', 
            points: 1, 
            options: [{id: 'opt1', text: '', isCorrect: false}], 
            blanks: [''],
            matchingPairs: [{id: 'match1', prompt: '', match: ''}],
            subject: '',
            chapter: ''
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingQuestion) return;
        setIsSaving(true);
        
        const result = await saveQuestionAction(editingQuestion);

        if (result.success) {
            toast({ title: 'Success', description: result.message });
            window.location.reload();
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
            if (!prev?.options) return prev;
            const newOptions = prev.options.map(opt => 
                opt.id === optionId ? { ...opt, [field]: value } : opt
            );
            return { ...prev, options: newOptions };
        });
    };

    const addOption = () => {
        setEditingQuestion(prev => prev ? { ...prev, options: [...(prev.options || []), { id: `opt_${Date.now()}`, text: '', isCorrect: false }] } : null);
    };
    const removeOption = (optionId: string) => {
        setEditingQuestion(prev => prev ? { ...prev, options: prev.options?.filter(o => o.id !== optionId) } : null);
    };

    const addBlank = () => {
        setEditingQuestion(prev => prev ? { ...prev, blanks: [...(prev.blanks || []), ''] } : null);
    };
    const updateBlank = (index: number, value: string) => {
        setEditingQuestion(prev => {
            if (!prev || !prev.blanks) return prev;
            const newBlanks = [...prev.blanks];
            newBlanks[index] = value;
            return { ...prev, blanks: newBlanks };
        });
    };
    const removeBlank = (index: number) => {
        setEditingQuestion(prev => prev ? { ...prev, blanks: prev.blanks?.filter((_, i) => i !== index) } : null);
    };
    
    const addMatchingPair = () => {
        setEditingQuestion(prev => prev ? { ...prev, matchingPairs: [...(prev.matchingPairs || []), { id: `match_${Date.now()}`, prompt: '', match: '' }] } : null);
    };
    const updateMatchingPair = (id: string, field: 'prompt' | 'match', value: string) => {
        setEditingQuestion(prev => prev ? { ...prev, matchingPairs: prev.matchingPairs?.map(p => p.id === id ? { ...p, [field]: value } : p) } : null);
    };
    const removeMatchingPair = (id: string) => {
        setEditingQuestion(prev => prev ? { ...prev, matchingPairs: prev.matchingPairs?.filter(p => p.id !== id) } : null);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Question Bank</h1>
                    <p className="mt-1 text-lg text-muted-foreground">
                        Create, edit, and manage all exam questions for the platform.
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog(null)}><PlusCircle className="mr-2" />Create Question</Button>
            </div>
            
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap gap-2">
                        <Select value={subjectFilter} onValueChange={setSubjectFilter}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Subject" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">All Subjects</SelectItem>{allSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                         <Select value={chapterFilter} onValueChange={setChapterFilter}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Chapter" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">All Chapters</SelectItem>{allChapters.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                         <Select value={difficultyFilter} onValueChange={setDifficultyFilter}><SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Filter by Difficulty" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">All Difficulties</SelectItem><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent>
                        </Select>
                         <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Filter by Type" /></SelectTrigger>
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
                                <TableHead>Chapter</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredQuestions.map(q => (
                                <TableRow key={q.id}>
                                    <TableCell className="font-medium max-w-sm truncate">{q.text}</TableCell>
                                    <TableCell><Badge variant="secondary">{q.type}</Badge></TableCell>
                                    <TableCell><Badge className={(difficultyColors as any)[q.difficulty]}>{q.difficulty}</Badge></TableCell>
                                    <TableCell>{q.subject || 'N/A'}</TableCell>
                                    <TableCell>{q.chapter || 'N/A'}</TableCell>
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
                                <Textarea value={editingQuestion.text || ''} onChange={e => updateField('text', e.target.value)} rows={3} />
                                {editingQuestion.type === 'Fill in the Blanks' && <p className="text-xs text-muted-foreground">Use __BLANK__ to indicate a blank space.</p>}
                            </div>
                            
                            {editingQuestion.type === 'MCQ' && (
                                <div className="p-4 border rounded-md space-y-2">
                                    <Label>Options (check all correct answers)</Label>
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

                             {editingQuestion.type === 'True/False' && (
                                <div className="p-4 border rounded-md space-y-2">
                                    <Label>Correct Answer</Label>
                                    <RadioGroup value={editingQuestion.correctAnswer} onValueChange={(v) => updateField('correctAnswer', v)}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="True" id="true" />
                                            <Label htmlFor="true">True</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="False" id="false" />
                                            <Label htmlFor="false">False</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            )}

                            {editingQuestion.type === 'Fill in the Blanks' && (
                                <div className="p-4 border rounded-md space-y-2">
                                    <Label>Correct Answers for Blanks</Label>
                                    <p className="text-xs text-muted-foreground">Add one answer for each __BLANK__ in your question text, in order.</p>
                                    {editingQuestion.blanks?.map((blank, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input value={blank} onChange={e => updateBlank(index, e.target.value)} />
                                            <Button variant="ghost" size="icon" onClick={() => removeBlank(index)}><X className="h-4 w-4 text-destructive"/></Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={addBlank}>Add Blank Answer</Button>
                                </div>
                            )}

                            {editingQuestion.type === 'Matching' && (
                                <div className="p-4 border rounded-md space-y-2">
                                    <Label>Matching Pairs</Label>
                                    <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center text-center text-sm font-medium">
                                        <p>Prompt</p><div></div><p>Match</p><div></div>
                                    </div>
                                    {editingQuestion.matchingPairs?.map((pair) => (
                                        <div key={pair.id} className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
                                            <Input value={pair.prompt} onChange={e => updateMatchingPair(pair.id, 'prompt', e.target.value)} />
                                            <span className="text-muted-foreground">=</span>
                                            <Input value={pair.match} onChange={e => updateMatchingPair(pair.id, 'match', e.target.value)} />
                                            <Button variant="ghost" size="icon" onClick={() => removeMatchingPair(pair.id)}><X className="h-4 w-4 text-destructive"/></Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={addMatchingPair}>Add Pair</Button>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2"><Label>Points</Label><Input type="number" value={editingQuestion.points || 1} onChange={e => updateField('points', Number(e.target.value))} /></div>
                                <div className="space-y-2"><Label>Difficulty</Label>
                                    <Select value={editingQuestion.difficulty} onValueChange={(v: Question['difficulty']) => updateField('difficulty', v)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2"><Label>Subject</Label><Input value={editingQuestion.subject || ''} onChange={e => updateField('subject', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Chapter</Label><Input value={editingQuestion.chapter || ''} onChange={e => updateField('chapter', e.target.value)} /></div>
                            </div>
                             <div className="space-y-2">
                                <Label>Explanation (Optional)</Label>
                                <Textarea value={editingQuestion.explanation || ''} onChange={e => updateField('explanation', e.target.value)} rows={2} />
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
