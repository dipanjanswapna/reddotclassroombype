'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { saveUserAction } from '@/app/actions/user.actions';
import { Calendar as CalendarIcon, Loader2, Sparkles, SlidersHorizontal, Volume2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const themes = [
    { name: 'Default', value: 'default', color: 'bg-primary' },
    { name: 'Forest', value: 'forest', color: 'bg-green-600' },
    { name: 'Ocean', value: 'ocean', color: 'bg-blue-600' },
    { name: 'Sunset', value: 'sunset', color: 'bg-orange-600' },
    { name: 'Rose', value: 'rose', color: 'bg-rose-600' },
];

const whiteNoises = [
    { name: 'No focus sound', value: 'none' },
    { name: 'Rainfall', value: 'rain' },
    { name: 'Zen Forest', value: 'forest' },
    { name: 'Study Cafe', value: 'cafe' },
];

/**
 * @fileOverview Planner Settings Page.
 * Refined high-density UI with 20px corners and tight spacing.
 */
export default function PlannerSettingsPage() {
    const { userInfo, refreshUserInfo } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    const [selectedTheme, setSelectedTheme] = useState(userInfo?.plannerSettings?.theme || 'default');
    const [selectedNoise, setSelectedNoise] = useState(userInfo?.plannerSettings?.whiteNoise || 'none');
    
    useEffect(() => {
        setSelectedTheme(userInfo?.plannerSettings?.theme || 'default');
        setSelectedNoise(userInfo?.plannerSettings?.whiteNoise || 'none');
    }, [userInfo]);
    
    const handleSave = async () => {
        if (!userInfo?.id) return;
        setIsSaving(true);
        try {
            await saveUserAction({
                id: userInfo.id,
                plannerSettings: {
                    theme: selectedTheme,
                    whiteNoise: selectedNoise
                }
            });
            await refreshUserInfo();
            toast({ title: 'Success', description: 'Planner preferences updated.'});
        } catch(error) {
            toast({ title: 'Error', description: 'Could not save settings.', variant: 'destructive'});
        } finally {
            setIsSaving(false);
        }
    };

    const handleGoogleCalendarSync = () => {
        if (!userInfo?.id) {
            toast({ title: 'Please log in first', variant: 'destructive'});
            return;
        }
        const authUrl = `/api/google-calendar/auth?userId=${userInfo.id}`;
        router.push(authUrl);
    };
    
  return (
    <div className="space-y-10 md:space-y-14">
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2 border-l-4 border-primary pl-6"
        >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">
                <SlidersHorizontal className="w-3 h-3" />
                Customization
            </div>
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight uppercase leading-tight">
                Planner <span className="text-primary">Preferences</span>
            </h1>
            <p className="text-muted-foreground font-medium text-base md:text-lg max-w-2xl">
                Personalize your workspace for maximum efficiency.
            </p>
        </motion.div>

      <Card className="rounded-[25px] border-primary/20 shadow-2xl overflow-hidden bg-card">
        <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
          <CardTitle className="text-xl font-black uppercase tracking-tight">Appearance & Sounds</CardTitle>
          <CardDescription className="font-medium text-xs">Choose how your productivity dashboard looks and sounds.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-10">
           <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Workspace Theme</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {themes.map(theme => (
                        <button 
                            key={theme.value} 
                            onClick={() => setSelectedTheme(theme.value)} 
                            className={cn(
                                "p-3 rounded-[20px] border-2 transition-all group relative overflow-hidden",
                                selectedTheme === theme.value ? 'border-primary bg-primary/5' : 'border-primary/5 bg-muted/20 hover:border-primary/20'
                            )}
                        >
                           <div className={cn("h-16 w-full rounded-xl shadow-inner mb-3", theme.color)}></div>
                           <p className="text-[10px] font-black uppercase tracking-tight text-foreground">{theme.name}</p>
                           {selectedTheme === theme.value && <Sparkles className="absolute top-2 right-2 w-3 h-3 text-primary" />}
                        </button>
                    ))}
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-primary/10 pt-10">
                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Focus Background Sound</Label>
                    <div className="relative">
                        <Volume2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50" />
                        <Select value={selectedNoise} onValueChange={setSelectedNoise}>
                            <SelectTrigger className="h-12 rounded-xl pl-10 font-bold border-primary/10 bg-background shadow-sm">
                                <SelectValue placeholder="Pick a focus sound..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-white/10">
                                {whiteNoises.map(noise => (
                                    <SelectItem key={noise.value} value={noise.value} className="font-bold text-xs uppercase">{noise.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1">Played automatically during work sessions.</p>
                </div>

                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">External Integration</Label>
                    <Card className="rounded-[20px] bg-muted/30 border-dashed border-2 border-primary/10 p-5">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-center sm:text-left">
                                <h4 className="font-black text-xs uppercase tracking-tight text-foreground">Google Calendar Sync</h4>
                                <p className="text-[10px] font-medium text-muted-foreground mt-1">Export your tasks to your Google calendar.</p>
                            </div>
                            <Button onClick={handleGoogleCalendarSync} variant="outline" className="rounded-xl h-10 px-6 font-black uppercase text-[10px] tracking-widest border-primary/20 hover:bg-primary hover:text-white transition-all">
                                <CalendarIcon className="mr-2 h-3.5 w-3.5"/>
                                Connect Now
                            </Button>
                        </div>
                    </Card>
                </div>
             </div>
        </CardContent>
        <CardFooter className="bg-primary/5 p-6 border-t border-primary/10 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="font-black uppercase tracking-widest px-10 h-12 rounded-xl shadow-xl shadow-primary/20">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                Save All Preferences
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
