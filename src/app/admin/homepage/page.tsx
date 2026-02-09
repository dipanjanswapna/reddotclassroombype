'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Save, X, Loader2, Youtube, CheckCircle, ChevronDown, Facebook, Linkedin, Twitter, ExternalLink, PackageOpen, Check, Store, ChevronsUpDown, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { HomepageConfig, TeamMember, TopperPageCard, TopperPageSection, WhyChooseUsFeature, Testimonial, OfflineHubHeroSlide, Organization, Instructor, StoreHomepageSection, StoreHomepageBanner, Course, CategoryItem } from '@/lib/types';
import { getHomepageConfig, getInstructors, getOrganizations, getCourses } from '@/lib/firebase/firestore';
import { saveHomepageConfigAction } from '@/app/actions/homepage.actions';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Switch } from '@/components/ui/switch';
import { getYoutubeVideoId, cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

type SocialChannel = NonNullable<HomepageConfig['socialMediaSection']['channels']>[0];
type CourseIdSections = 'liveCoursesIds' | 'sscHscCourseIds' | 'masterClassesIds' | 'admissionCoursesIds' | 'jobCoursesIds';

export default function AdminHomepageManagementPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const [fetchedConfig, instructorsData, organizationsData, coursesData] = await Promise.all([
            getHomepageConfig(),
            getInstructors(),
            getOrganizations(),
            getCourses({ status: 'Published' })
        ]);
        setConfig(fetchedConfig);
        setAllInstructors(instructorsData.filter(i => i.status === 'Approved'));
        setAllOrganizations(organizationsData.filter(o => o.status === 'approved'));
        setAllCourses(coursesData);
      } catch (error) {
        console.error("Error fetching homepage config:", error);
        toast({ title: "Error", description: "Could not load homepage configuration.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, [toast]);

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    const result = await saveHomepageConfigAction(config);
    if (result.success) {
        toast({
            title: 'Homepage Updated',
            description: 'Your changes have been saved successfully.',
        });
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive'});
    }
    setIsSaving(false);
  };
  
    const handleSimpleValueChange = (key: keyof HomepageConfig, value: any) => {
        setConfig(prev => prev ? { ...prev, [key]: value } : null);
    };

    const handleSectionValueChange = (sectionKey: keyof HomepageConfig, key: string, value: any) => {
        setConfig(prev => {
            if (!prev) return null;
            const sectionData = (prev[sectionKey] as any) || { display: true };
            return {
                ...prev,
                [sectionKey]: {
                    ...sectionData,
                    [key]: value,
                },
            };
        });
    };

    const handleSectionLangChange = (sectionKey: keyof HomepageConfig, field: string, lang: 'bn' | 'en', value: string) => {
        setConfig(prev => {
            if (!prev) return null;
            const sectionData = (prev[sectionKey] as any) || { display: true };
            const fieldData = sectionData[field] || {};
            return {
                ...prev,
                [sectionKey]: {
                    ...sectionData,
                    [field]: {
                        ...fieldData,
                        [lang]: value,
                    }
                }
            };
        });
    };

    const handleNestedArrayChange = (sectionKey: keyof HomepageConfig, arrayKey: string, index: number, field: string, value: any) => {
        setConfig(prev => {
            if (!prev || index < 0) return prev;
            
            const section = (prev[sectionKey] as any) || { display: true };
            const array = section[arrayKey] ? [...section[arrayKey]] : [];
            
            if (array[index]) {
                array[index] = { ...array[index], [field]: value };
            }
            
            return {
                ...prev,
                [sectionKey]: {
                    ...section,
                    [arrayKey]: array
                }
            };
        });
    };

    const handleCourseIdToggle = (section: CourseIdSections, courseId: string, add: boolean) => {
        setConfig(prev => {
            if (!prev) return null;
            const currentIds = prev[section] || [];
            const newIds = add 
                ? [...currentIds, courseId]
                : currentIds.filter(id => id !== courseId);
            return { ...prev, [section]: newIds };
        });
    };

  const handleSectionToggle = (sectionKey: any, value: boolean) => {
    setConfig(prevConfig => {
      if (!prevConfig) return null;
      const newConfig = { ...prevConfig };
      if (newConfig[sectionKey]) {
        (newConfig[sectionKey] as any).display = value;
      } else {
        (newConfig as any)[sectionKey] = { display: value };
      }
      return newConfig;
    });
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><LoadingSpinner className="h-12 w-12"/></div>;
  }
  
  if (!config) {
     return <div className="flex h-screen items-center justify-center"><p>Could not load homepage configuration.</p></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Homepage Management</h1>
          <p className="mt-1 text-lg text-muted-foreground">Control the content displayed on your homepage using the tabs below.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="shadow-lg rounded-xl">
          {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2"/>}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-full h-auto p-1 bg-muted/50 rounded-xl mb-6 min-w-max">
                <TabsTrigger value="general" className="rounded-lg px-6 py-2.5 data-[state=active]:shadow-md">General</TabsTrigger>
                <TabsTrigger value="hero" className="rounded-lg px-6 py-2.5 data-[state=active]:shadow-md">Hero & Banners</TabsTrigger>
                <TabsTrigger value="courses" className="rounded-lg px-6 py-2.5 data-[state=active]:shadow-md">Course Sections</TabsTrigger>
                <TabsTrigger value="store" className="rounded-lg px-6 py-2.5 data-[state=active]:shadow-md">Store Homepage</TabsTrigger>
                <TabsTrigger value="content" className="rounded-lg px-6 py-2.5 data-[state=active]:shadow-md">Content Sections</TabsTrigger>
                <TabsTrigger value="pages" className="rounded-lg px-6 py-2.5 data-[state=active]:shadow-md">Special Pages</TabsTrigger>
            </TabsList>
        </div>

        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
            >
                <TabsContent value="pages" className="space-y-8 mt-0">
                    <Card className="rounded-2xl shadow-sm border-white/10">
                        <CardHeader>
                            <CardTitle>Offline Hub CMS</CardTitle>
                            <CardDescription>Manage titles, imagery, and button text for the Offline Hub page.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between rounded-xl border p-4 shadow-sm bg-muted/20">
                                <Label htmlFor="offline-hub-display" className="font-semibold">Display Page Content</Label>
                                <Switch 
                                    id="offline-hub-display" 
                                    checked={config.offlineHubSection?.display ?? true} 
                                    onCheckedChange={(checked) => handleSectionValueChange('offlineHubSection', 'display', checked)}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                <div className="space-y-2"><Label>Hero Title (BN)</Label><Input value={config.offlineHubSection?.heroTitle?.bn || ''} onChange={e => handleSectionLangChange('offlineHubSection', 'heroTitle', 'bn', e.target.value)} className="rounded-xl"/></div>
                                <div className="space-y-2"><Label>Hero Title (EN)</Label><Input value={config.offlineHubSection?.heroTitle?.en || ''} onChange={e => handleSectionLangChange('offlineHubSection', 'heroTitle', 'en', e.target.value)} className="rounded-xl"/></div>
                                <div className="space-y-2 col-span-2"><Label>Hero Subtitle (EN)</Label><Textarea value={config.offlineHubSection?.heroSubtitle?.en || ''} onChange={e => handleSectionLangChange('offlineHubSection', 'heroSubtitle', 'en', e.target.value)} className="rounded-xl" rows={2}/></div>
                            </div>
                            <div className="space-y-4 pt-4 border-t">
                                <Label className="font-bold text-primary flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Hero Media (Recommended Size: 600x400)</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Hero Image URL</Label>
                                        <Input value={config.offlineHubSection?.heroImageUrl || ''} onChange={e => handleSectionValueChange('offlineHubSection', 'heroImageUrl', e.target.value)} className="rounded-xl" placeholder="https://picsum.photos/seed/offline/600/400" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hero Image AI Hint</Label>
                                        <Input value={config.offlineHubSection?.heroImageDataAiHint || ''} onChange={e => handleSectionValueChange('offlineHubSection', 'heroImageDataAiHint', e.target.value)} className="rounded-xl" placeholder="e.g., modern classroom" />
                                    </div>
                                </div>
                                {config.offlineHubSection?.heroImageUrl && (
                                    <div className="mt-2 rounded-xl border overflow-hidden aspect-[3/2] relative max-w-sm bg-muted mx-auto md:mx-0">
                                        <Image src={config.offlineHubSection.heroImageUrl} alt="Hero Preview" fill className="object-cover" />
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                <div className="space-y-2"><Label>Explore Programs Button (EN)</Label><Input value={config.offlineHubSection?.exploreProgramsText?.en || ''} onChange={e => handleSectionLangChange('offlineHubSection', 'exploreProgramsText', 'en', e.target.value)} className="rounded-xl"/></div>
                                <div className="space-y-2"><Label>Find a Center Button (EN)</Label><Input value={config.offlineHubSection?.findCenterText?.en || ''} onChange={e => handleSectionLangChange('offlineHubSection', 'findCenterText', 'en', e.target.value)} className="rounded-xl"/></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                <div className="space-y-2"><Label>Programs Section Title (EN)</Label><Input value={config.offlineHubSection?.programsTitle?.en || ''} onChange={e => handleSectionLangChange('offlineHubSection', 'programsTitle', 'en', e.target.value)} className="rounded-xl"/></div>
                                <div className="space-y-2"><Label>Centers Section Title (EN)</Label><Input value={config.offlineHubSection?.centersTitle?.en || ''} onChange={e => handleSectionLangChange('offlineHubSection', 'centersTitle', 'en', e.target.value)} className="rounded-xl"/></div>
                                <div className="space-y-2 col-span-2"><Label>Centers Section Subtitle (EN)</Label><Input value={config.offlineHubSection?.centersSubtitle?.en || ''} onChange={e => handleSectionLangChange('offlineHubSection', 'centersSubtitle', 'en', e.target.value)} className="rounded-xl"/></div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}