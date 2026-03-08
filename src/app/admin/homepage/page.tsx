'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Save, X, Loader2, Youtube, CheckCircle, ChevronDown, Facebook, Linkedin, Twitter, ExternalLink, PackageOpen, Check, Store, ChevronsUpDown, Image as ImageIcon, Info, Sparkles, MessageSquare, Zap, Target } from 'lucide-react';
import Image from 'next/image';
import { HomepageConfig, TeamMember, OfflineHubHeroSlide, Organization, Instructor, StoreHomepageBanner, Course, CategoryItem, SocialChannel, Product } from '@/lib/types';
import { getHomepageConfig, getInstructors, getOrganizations, getCourses, getProducts } from '@/lib/firebase/firestore';
import { saveHomepageConfigAction } from '@/app/actions/homepage.actions';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @fileOverview Super Powerful Admin Homepage CMS.
 * Standardized with rounded-xl corners and Title Case typography.
 */
export default function AdminHomepageManagementPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedConfig, instructorsData, organizationsData, coursesData, productsData] = await Promise.all([
            getHomepageConfig(),
            getInstructors(),
            getOrganizations(),
            getCourses({ status: 'Published' }),
            getProducts()
        ]);
        
        setConfig(fetchedConfig);
        setAllInstructors(instructorsData.filter(i => i.status === 'Approved'));
        setAllOrganizations(organizationsData.filter(o => o.status === 'approved'));
        setAllCourses(coursesData);
        setAllProducts(productsData);
      } catch (error) {
        console.error("CMS load error:", error);
        toast({ title: "Error", description: "Could not load CMS configuration.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    const result = await saveHomepageConfigAction(config);
    if (result.success) {
        toast({ title: 'Homepage Updated', description: 'All changes are now live.' });
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive'});
    }
    setIsSaving(false);
  };
  
    const handleSimpleValueChange = (key: keyof HomepageConfig, value: any) => {
        setConfig(prev => prev ? { ...prev, [key]: value } : null);
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
                    [field]: { ...fieldData, [lang]: value }
                }
            };
        });
    };

    const handleSectionValueChange = (sectionKey: keyof HomepageConfig, key: string, value: any) => {
        setConfig(prev => {
            if (!prev) return null;
            const sectionData = (prev[sectionKey] as any) || { display: true };
            return { ...prev, [sectionKey]: { ...sectionData, [key]: value } };
        });
    };

    const handleNestedArrayChange = (sectionKey: keyof HomepageConfig, arrayKey: string, index: number, field: string, value: any) => {
        setConfig(prev => {
            if (!prev) return null;
            const section = (prev[sectionKey] as any);
            const array = [...(section[arrayKey] || [])];
            if (array[index]) {
                array[index] = { ...array[index], [field]: value };
            }
            return { ...prev, [sectionKey]: { ...section, [arrayKey]: array } };
        });
    };

    const handleDeepNestedLangChange = (sectionKey: keyof HomepageConfig, arrayKey: string, index: number, field: string, lang: 'bn' | 'en', value: string) => {
        setConfig(prev => {
            if (!prev) return null;
            const section = (prev[sectionKey] as any);
            const array = [...(section[arrayKey] || [])];
            if (array[index]) {
                const item = { ...array[index] };
                const langObj = { ...(item[field] || {}) };
                langObj[lang] = value;
                item[field] = langObj;
                array[index] = item;
            }
            return { ...prev, [sectionKey]: { ...section, [arrayKey]: array } };
        });
    };

    const handleSectionToggle = (sectionKey: any, value: boolean) => {
        setConfig(prev => {
            if (!prev) return null;
            const section = (prev[sectionKey] as any) || {};
            return { ...prev, [sectionKey]: { ...section, display: value } };
        });
    };

  const addHeroBanner = () => {
    setConfig(prev => {
        if (!prev) return null;
        return {
            ...prev,
            heroBanners: [...(prev.heroBanners || []), { id: Date.now(), href: '', imageUrl: '', alt: '', dataAiHint: '' }]
        };
    });
  };

  const removeHeroBanner = (id: number) => {
    setConfig(prev => prev ? ({ ...prev, heroBanners: prev.heroBanners.filter(b => b.id !== id) }) : null);
  };

  const addCategory = () => {
    setConfig(prev => {
        if (!prev) return null;
        const newCat: CategoryItem = { id: Date.now(), title: { bn: '', en: '' }, imageUrl: '', linkUrl: '', dataAiHint: '' };
        return { ...prev, categoriesSection: { ...prev.categoriesSection, categories: [...(prev.categoriesSection.categories || []), newCat] } };
    });
  };

  const removeCategory = (id: number) => {
    setConfig(prev => prev ? ({ ...prev, categoriesSection: { ...prev.categoriesSection, categories: prev.categoriesSection.categories.filter(c => c.id !== id) } }) : null);
  };

  const handleInstructorToggle = (id: string, add: boolean) => {
      setConfig(prev => {
          if (!prev) return null;
          const current = prev.teachersSection?.instructorIds || [];
          const updated = add ? [...current, id] : current.filter(cid => cid !== id);
          return { ...prev, teachersSection: { ...prev.teachersSection, instructorIds: updated } };
      });
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner className="h-12 w-12"/></div>;
  if (!config) return <div className="flex h-screen items-center justify-center"><p>Configuration not found.</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 px-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1 mb-2">
        <div className="border-l-4 border-primary pl-4">
          <h1 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight text-left">Homepage <span className="text-primary">Master CMS</span></h1>
          <p className="mt-1 text-[10px] md:text-sm text-muted-foreground font-medium text-left">Power up your storefront with dynamic content management.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto h-12 shadow-xl rounded-xl font-black uppercase tracking-widest px-8">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
          Push Live
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-muted/50 rounded-xl mb-6">
            <TabsTrigger value="general" className="rounded-lg py-2.5 font-black uppercase text-[9px] tracking-widest">General</TabsTrigger>
            <TabsTrigger value="hero" className="rounded-lg py-2.5 font-black uppercase text-[9px] tracking-widest">Hero & Banners</TabsTrigger>
            <TabsTrigger value="courses" className="rounded-lg py-2.5 font-black uppercase text-[9px] tracking-widest">Courses</TabsTrigger>
            <TabsTrigger value="store" className="rounded-lg py-2.5 font-black uppercase text-[9px] tracking-widest">Store</TabsTrigger>
            <TabsTrigger value="content" className="rounded-lg py-2.5 font-black uppercase text-[9px] tracking-widest">Content</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg py-2.5 font-black uppercase text-[9px] tracking-widest">Settings</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                
                {/* --- GENERAL TAB --- */}
                <TabsContent value="general" className="space-y-8 mt-0">
                    <Card className="rounded-xl shadow-sm border-primary/10">
                        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                            <CardTitle className="text-sm font-black uppercase tracking-tight">Welcome Messaging</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6 text-left">
                            <div className="flex items-center justify-between rounded-xl border p-4 bg-muted/20 mb-4">
                                <span className="text-[11px] font-black uppercase">Enable Welcome Section</span>
                                <Switch checked={config.welcomeSection?.display ?? true} onCheckedChange={(val) => handleSectionToggle('welcomeSection', val)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase ml-1">Title (BN)</Label>
                                    <Input value={config.welcomeSection?.title?.bn || ''} onChange={e => handleSectionLangChange('welcomeSection', 'title', 'bn', e.target.value)} className="h-12 rounded-lg" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase ml-1">Title (EN)</Label>
                                    <Input value={config.welcomeSection?.title?.en || ''} onChange={e => handleSectionLangChange('welcomeSection', 'title', 'en', e.target.value)} className="h-12 rounded-lg" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase ml-1">Main Description (BN)</Label>
                                <Textarea value={config.welcomeSection?.description?.bn || ''} onChange={e => handleSectionLangChange('welcomeSection', 'description', 'bn', e.target.value)} rows={3} className="rounded-lg" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- HERO TAB --- */}
                <TabsContent value="hero" className="space-y-8 mt-0">
                    <Card className="rounded-xl shadow-sm border-primary/10">
                        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                            <CardTitle className="text-sm font-black uppercase tracking-tight">Main Hero Banners</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4 text-left">
                            {config.heroBanners.map((banner, index) => (
                                <div key={banner.id} className="p-5 border border-primary/10 rounded-xl bg-muted/10 relative space-y-4">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeHeroBanner(banner.id)}><X className="h-4 w-4"/></Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Image URL</Label><Input value={banner.imageUrl} onChange={e => handleNestedArrayChange('heroBanners', 'heroBanners', index, 'imageUrl', e.target.value)} className="rounded-lg" /></div>
                                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Destination</Label><Input value={banner.href} onChange={e => handleNestedArrayChange('heroBanners', 'heroBanners', index, 'href', e.target.value)} className="rounded-lg" /></div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full border-dashed h-12 rounded-xl font-black uppercase text-[10px]" onClick={addHeroBanner}><PlusCircle className="mr-2 h-4 w-4"/>Add Slide</Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl shadow-sm border-primary/10">
                        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                            <CardTitle className="text-sm font-black uppercase tracking-tight">Struggling Banner</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Heading (BN)</Label><Input value={config.strugglingStudentSection?.title?.bn || ''} onChange={e => handleSectionLangChange('strugglingStudentSection', 'title', 'bn', e.target.value)} className="rounded-lg" /></div>
                                <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Sparkle Text (BN)</Label><Input value={config.strugglingStudentSection?.subtitle?.bn || ''} onChange={e => handleSectionLangChange('strugglingStudentSection', 'subtitle', 'bn', e.target.value)} className="rounded-lg" /></div>
                            </div>
                            <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Illustration URL</Label><Input value={config.strugglingStudentSection?.imageUrl || ''} onChange={e => handleSectionValueChange('strugglingStudentSection', 'imageUrl', e.target.value)} className="rounded-lg" /></div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- COURSES TAB --- */}
                <TabsContent value="courses" className="space-y-8 mt-0">
                    <Card className="rounded-xl shadow-sm border-primary/10">
                        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                            <CardTitle className="text-sm font-black uppercase tracking-tight">Course ID Filters</CardTitle>
                            <CardDescription className="font-medium text-xs">Manage which courses appear in each dynamic section using comma-separated IDs.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6 text-left">
                            {[
                                { key: 'liveCoursesIds', label: 'Live Courses (Journey)' },
                                { key: 'sscHscCourseIds', label: 'SSC & HSC Preparation' },
                                { key: 'admissionCoursesIds', label: 'University Admission' },
                                { key: 'jobCoursesIds', label: 'Job & BCS Preparation' }
                            ].map(sec => (
                                <div key={sec.key} className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase ml-1">{sec.label}</Label>
                                    <Input value={((config as any)[sec.key] || []).join(', ')} onChange={e => handleSimpleValueChange(sec.key as any, e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="course_id_1, course_id_2..." className="font-mono text-xs rounded-lg" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl shadow-sm border-primary/10">
                        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                            <CardTitle className="text-sm font-black uppercase tracking-tight">Featured Instructors</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 text-left">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {config.teachersSection?.instructorIds?.map(id => {
                                    const inst = allInstructors.find(i => i.id === id);
                                    return inst ? <Badge key={id} variant="secondary" className="px-3 h-8 gap-2 uppercase font-black text-[9px] rounded-lg">
                                        {inst.name} <X className="h-3 w-3 cursor-pointer" onClick={() => handleInstructorToggle(id, false)} />
                                    </Badge> : null;
                                })}
                            </div>
                            <Popover>
                                <PopoverTrigger asChild><Button variant="outline" className="w-full rounded-xl">Add Instructor to Homepage</Button></PopoverTrigger>
                                <PopoverContent className="p-0 border-primary/10 rounded-xl overflow-hidden shadow-2xl">
                                    <Command>
                                        <CommandInput placeholder="Search approved faculty..." />
                                        <CommandEmpty>No instructors found.</CommandEmpty>
                                        <CommandGroup>
                                            {allInstructors.filter(i => !config.teachersSection?.instructorIds?.includes(i.id!)).map(inst => (
                                                <CommandItem key={inst.id} onSelect={() => handleInstructorToggle(inst.id!, true)} className="cursor-pointer">
                                                    <Check className="mr-2 h-4 w-4 opacity-0" /> {inst.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- SETTINGS TAB --- */}
                <TabsContent value="settings" className="space-y-8 mt-0">
                    <Card className="rounded-xl shadow-sm border-primary/10">
                        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                            <CardTitle className="text-sm font-black uppercase tracking-tight">Floating Communications</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6 text-left">
                            <div className="flex items-center justify-between rounded-xl border p-4 bg-muted/20">
                                <div className="space-y-0.5">
                                    <span className="text-[11px] font-black uppercase">Floating WhatsApp</span>
                                    <p className="text-[9px] font-bold opacity-60">Global support button visibility</p>
                                </div>
                                <Switch checked={config.floatingWhatsApp?.display} onCheckedChange={(val) => setConfig(prev => prev ? ({ ...prev, floatingWhatsApp: { ...prev.floatingWhatsApp, display: val } }) : null)} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase ml-1">WhatsApp Number</Label>
                                <Input value={config.floatingWhatsApp?.number || ''} onChange={e => setConfig(prev => prev ? ({ ...prev, floatingWhatsApp: { ...prev.floatingWhatsApp, number: e.target.value } }) : null)} placeholder="8801XXXXXXXXX" className="h-12 rounded-lg" />
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
