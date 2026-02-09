'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Save, X, Loader2, Youtube, CheckCircle, ChevronDown, Facebook, Linkedin, Twitter, ExternalLink, PackageOpen, Check, Store, ChevronsUpDown, Image as ImageIcon, Info } from 'lucide-react';
import Image from 'next/image';
import { HomepageConfig, TeamMember, TopperPageCard, TopperPageSection, WhyChooseUsFeature, Testimonial, OfflineHubHeroSlide, Organization, Instructor, StoreHomepageSection, StoreHomepageBanner, Course, CategoryItem, SocialChannel } from '@/lib/types';
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
        
        if (fetchedConfig) {
            if (!Array.isArray(fetchedConfig.heroBanners)) fetchedConfig.heroBanners = [];
            if (fetchedConfig.offlineHubHeroCarousel && !Array.isArray(fetchedConfig.offlineHubHeroCarousel.slides)) {
                fetchedConfig.offlineHubHeroCarousel.slides = [];
            }
            if (!Array.isArray(fetchedConfig.liveCoursesIds)) fetchedConfig.liveCoursesIds = [];
            if (!Array.isArray(fetchedConfig.sscHscCourseIds)) fetchedConfig.sscHscCourseIds = [];
            if (!Array.isArray(fetchedConfig.admissionCoursesIds)) fetchedConfig.admissionCoursesIds = [];
        }

        setConfig(fetchedConfig);
        setAllInstructors(Array.isArray(instructorsData) ? instructorsData.filter(i => i.status === 'Approved') : []);
        setAllOrganizations(Array.isArray(organizationsData) ? organizationsData.filter(o => o.status === 'approved') : []);
        setAllCourses(Array.isArray(coursesData) ? coursesData : []);
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
            const array = Array.isArray(section[arrayKey]) ? [...section[arrayKey]] : [];
            
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

    const handleHeroBannerChange = (index: number, field: string, value: any) => {
        setConfig(prev => {
            if (!prev) return null;
            const newBanners = Array.isArray(prev.heroBanners) ? [...prev.heroBanners] : [];
            if (newBanners[index]) {
                newBanners[index] = { ...newBanners[index], [field]: value };
            }
            return { ...prev, heroBanners: newBanners };
        });
    };

    const handleStringArrayChange = (section: CourseIdSections, value: string) => {
        const ids = value.split(',').map(id => id.trim()).filter(Boolean);
        setConfig(prev => prev ? ({ ...prev, [section]: ids }) : null);
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

  const addHeroBanner = () => {
    setConfig(prev => {
        if (!prev) return null;
        const currentBanners = Array.isArray(prev.heroBanners) ? prev.heroBanners : [];
        return {
            ...prev,
            heroBanners: [
                ...currentBanners,
                { id: Date.now(), href: '', imageUrl: '', alt: '', dataAiHint: '' }
            ]
        }
    });
  };

  const removeHeroBanner = (id: number) => {
    setConfig(prev => {
        if (!prev) return null;
        const currentBanners = Array.isArray(prev.heroBanners) ? prev.heroBanners : [];
        return {
            ...prev,
            heroBanners: currentBanners.filter(banner => banner.id !== id)
        };
    });
  };

  const addOfflineSlide = () => {
    setConfig(prev => {
      if (!prev) return null;
      const newSlide: OfflineHubHeroSlide = {
          id: Date.now(),
          imageUrl: '',
          dataAiHint: '',
          title: '',
          subtitle: '',
          price: '',
          originalPrice: '',
          enrollHref: ''
      };
      const offlineCarousel = prev.offlineHubHeroCarousel || { display: true, slides: [] };
      const currentSlides = Array.isArray(offlineCarousel.slides) ? offlineCarousel.slides : [];
      return {
          ...prev,
          offlineHubHeroCarousel: { ...offlineCarousel, slides: [...currentSlides, newSlide] }
      };
    });
  };

  const removeOfflineSlide = (id: number) => {
    setConfig(prev => {
      if (!prev || !prev.offlineHubHeroCarousel) return null;
      const currentSlides = Array.isArray(prev.offlineHubHeroCarousel.slides) ? prev.offlineHubHeroCarousel.slides : [];
      const newSlides = currentSlides.filter(s => s.id !== id);
      return { ...prev, offlineHubHeroCarousel: { ...prev.offlineHubHeroCarousel, slides: newSlides } };
    });
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><LoadingSpinner className="h-12 w-12"/></div>;
  }
  
  if (!config) {
     return <div className="flex h-screen items-center justify-center"><p>Could not load homepage configuration.</p></div>;
  }

  const allSections = [
    { key: 'welcomeSection', label: 'Welcome Section'},
    { key: 'strugglingStudentSection', label: 'Struggling Student Banner'},
    { key: 'offlineHubHeroCarousel', label: 'Offline Hub & RDC Shop Carousel'},
    { key: 'categoriesSection', label: 'Categories Section' },
    { key: 'journeySection', label: 'Journey (Live Courses)' },
    { key: 'teachersSection', label: 'Teachers Section' },
    { key: 'videoSection', label: 'Video Section' },
    { key: 'sscHscSection', label: 'SSC & HSC Section' },
    { key: 'masterclassSection', label: 'Masterclass Section' },
    { key: 'admissionSection', label: 'Admission Section' },
    { key: 'jobPrepSection', label: 'Job Prep Section' },
    { key: 'whyChooseUs', label: 'Why Choose Us' },
    { key: 'freeClassesSection', label: 'Free Classes' },
    { key: 'aboutUsSection', label: 'About Us'},
    { key: 'collaborations', label: 'Collaborations' },
    { key: 'partnersSection', label: 'Partners' },
    { key: 'socialMediaSection', label: 'Social Media' },
    { key: 'notesBanner', label: 'Notes Banner' },
    { key: 'appPromo', label: 'App Promo' },
    { key: 'requestCallbackSection', label: 'Callback Section'},
  ] as const;

  const safeHeroBanners = Array.isArray(config.heroBanners) ? config.heroBanners : [];
  const safeOfflineSlides = Array.isArray(config.offlineHubHeroCarousel?.slides) ? config.offlineHubHeroCarousel.slides : [];

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
                {/* --- GENERAL TAB --- */}
                <TabsContent value="general" className="space-y-8 mt-0">
                    <Card className="rounded-2xl shadow-sm border-white/10">
                        <CardHeader><CardTitle>Branding & Visibility</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Site Logo URL</Label>
                                <Input value={config.logoUrl || ''} onChange={e => handleSimpleValueChange('logoUrl', e.target.value)} placeholder="https://example.com/logo.png" />
                            </div>
                            <div className="space-y-4 border-t pt-4">
                                <Label className="font-bold">Section Visibility</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {allSections.map(section => (
                                        <div key={section.key} className="flex items-center justify-between rounded-xl border p-3 bg-muted/20">
                                            <span className="text-xs font-semibold">{section.label}</span>
                                            <Switch 
                                                checked={(config as any)[section.key]?.display ?? true} 
                                                onCheckedChange={(val) => handleSectionToggle(section.key, val)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- HERO TAB --- */}
                <TabsContent value="hero" className="space-y-8 mt-0">
                    <Card className="rounded-2xl shadow-sm border-white/10">
                        <CardHeader>
                            <CardTitle>Main Hero Banners</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <Info className="w-4 h-4 text-primary" />
                                <span>পোস্ট ইমেজ (PostIMG) ব্যবহার করলে অবশ্যই <strong>"Direct Link"</strong> কপি করে এখানে দিবেন।</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {safeHeroBanners.map((banner, index) => (
                                <div key={banner.id} className="p-4 border rounded-xl space-y-3 relative bg-muted/10">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => removeHeroBanner(banner.id)}><X className="h-4 w-4"/></Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Image URL (Direct Link)</Label>
                                            <Input placeholder="e.g., https://i.postimg.cc/..." value={banner.imageUrl} onChange={e => handleHeroBannerChange(index, 'imageUrl', e.target.value)} />
                                            {banner.imageUrl && (
                                                <div className="mt-2 relative aspect-[16/9] w-32 rounded-md overflow-hidden border bg-black">
                                                    <img src={banner.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Link URL</Label>
                                            <Input placeholder="e.g., /courses/physics-batch" value={banner.href} onChange={e => handleHeroBannerChange(index, 'href', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full border-dashed rounded-xl" onClick={addHeroBanner}><PlusCircle className="mr-2 h-4 w-4"/>Add Banner</Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm border-white/10">
                        <CardHeader>
                            <CardTitle>Offline Hub & RDC Shop Carousel</CardTitle>
                            <CardDescription>The slim sliding banner used on Shop and Offline Hub pages.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {safeOfflineSlides.map((slide, index) => (
                                <div key={slide.id} className="p-4 border rounded-xl space-y-3 relative bg-muted/10">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => removeOfflineSlide(slide.id)}><X className="h-4 w-4"/></Button>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Image URL (Direct Link)</Label>
                                        <Input placeholder="Enter image URL..." value={slide.imageUrl} onChange={e => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'imageUrl', e.target.value)} />
                                        {slide.imageUrl && (
                                            <div className="mt-2 relative aspect-[21/7] w-48 rounded-md overflow-hidden border bg-black">
                                                <img src={slide.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1"><Label className="text-xs">Title (Badge)</Label><Input placeholder="e.g., SPECIAL OFFER" value={slide.title} onChange={e => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'title', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Subtitle (Heading)</Label><Input placeholder="e.g., Join our new Physics Batch" value={slide.subtitle} onChange={e => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'subtitle', e.target.value)} /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1"><Label className="text-xs">Offer Price</Label><Input placeholder="e.g., ৳1,200" value={slide.price} onChange={e => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'price', e.target.value)} /></div>
                                        <div className="space-y-1"><Label className="text-xs">Original Price</Label><Input placeholder="e.g., ৳3,000" value={slide.originalPrice} onChange={e => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'originalPrice', e.target.value)} /></div>
                                    </div>
                                    <div className="space-y-1"><Label className="text-xs">Enroll Link URL</Label><Input placeholder="e.g., /checkout/course-id" value={slide.enrollHref} onChange={e => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'enrollHref', e.target.value)} /></div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full border-dashed rounded-xl" onClick={addOfflineSlide}><PlusCircle className="mr-2 h-4 w-4"/>Add Carousel Slide</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- COURSE SECTIONS TAB --- */}
                <TabsContent value="courses" className="space-y-8 mt-0">
                    <Card className="rounded-2xl shadow-sm border-white/10">
                        <CardHeader><CardTitle>Featured Course Lists</CardTitle><CardDescription>Enter comma-separated course IDs to display in each homepage section.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2"><Label>Journey Section (Live Courses IDs)</Label><Input value={Array.isArray(config.liveCoursesIds) ? config.liveCoursesIds.join(', ') : ''} onChange={e => handleStringArrayChange('liveCoursesIds', e.target.value)} /></div>
                            <div className="space-y-2"><Label>SSC & HSC Section IDs</Label><Input value={Array.isArray(config.sscHscCourseIds) ? config.sscHscCourseIds.join(', ') : ''} onChange={e => handleStringArrayChange('sscHscCourseIds', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Admission Section IDs</Label><Input value={Array.isArray(config.admissionCoursesIds) ? config.admissionCoursesIds.join(', ') : ''} onChange={e => handleStringArrayChange('admissionCoursesIds', e.target.value)} /></div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- PAGES TAB --- */}
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
                                <Label className="font-bold text-primary flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Hero Media (Use Direct Link)</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Hero Image URL</Label>
                                        <Input value={config.offlineHubSection?.heroImageUrl || ''} onChange={e => handleSectionValueChange('offlineHubSection', 'heroImageUrl', e.target.value)} className="rounded-xl" placeholder="e.g., https://i.postimg.cc/..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hero Image AI Hint</Label>
                                        <Input value={config.offlineHubSection?.heroImageDataAiHint || ''} onChange={e => handleSectionValueChange('offlineHubSection', 'heroImageDataAiHint', e.target.value)} className="rounded-xl" placeholder="e.g., modern classroom" />
                                    </div>
                                </div>
                                {config.offlineHubSection?.heroImageUrl && (
                                    <div className="mt-2 rounded-xl border overflow-hidden aspect-[3/2] relative max-w-sm bg-black mx-auto md:mx-0">
                                        <img src={config.offlineHubSection.heroImageUrl} alt="Hero Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
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
