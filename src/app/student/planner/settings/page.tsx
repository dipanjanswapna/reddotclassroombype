
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { saveUserAction } from '@/app/actions/user.actions';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';

const themes = [
    { name: 'Default', value: 'default', color: 'bg-primary' },
    { name: 'Forest', value: 'forest', color: 'bg-green-600' },
    { name: 'Ocean', value: 'ocean', color: 'bg-blue-600' },
    { name: 'Sunset', value: 'sunset', color: 'bg-orange-600' },
    { name: 'Rose', value: 'rose', color: 'bg-rose-600' },
];

const whiteNoises = [
    { name: 'None', value: 'none' },
    { name: 'Rain', value: 'rain' },
    { name: 'Forest', value: 'forest' },
    { name: 'Cafe', value: 'cafe' },
];

export default function PlannerSettingsPage() {
    const { userInfo, refreshUserInfo } = useAuth();
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
            toast({ title: 'Success', description: 'Your planner settings have been saved.'});
        } catch(error) {
            toast({ title: 'Error', description: 'Could not save settings.', variant: 'destructive'});
        } finally {
            setIsSaving(false);
        }
    }
    
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Planner Settings</CardTitle>
          <CardDescription>Customize the appearance and behavior of your study planner.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {themes.map(theme => (
                        <button key={theme.value} onClick={() => setSelectedTheme(theme.value)} className={`p-4 rounded-lg border-2 ${selectedTheme === theme.value ? 'border-primary' : 'border-transparent'}`}>
                           <div className={`h-16 w-full rounded-md ${theme.color}`}></div>
                           <p className="mt-2 text-sm font-medium">{theme.name}</p>
                        </button>
                    ))}
                </div>
            </div>
             <div className="space-y-2">
                <Label>Focus Sound (White Noise)</Label>
                <Select value={selectedNoise} onValueChange={setSelectedNoise}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        {whiteNoises.map(noise => (
                            <SelectItem key={noise.value} value={noise.value}>{noise.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="p-4 border rounded-md space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="font-semibold">Google Calendar Sync</Label>
                        <p className="text-xs text-muted-foreground">Sync your study plan with your Google Calendar.</p>
                    </div>
                    <Button><CalendarIcon className="mr-2 h-4 w-4"/>Sync Now</Button>
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Save Settings
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

