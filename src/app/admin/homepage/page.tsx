'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Save, X, Loader2, Youtube, CheckCircle, ChevronDown, Facebook, Linkedin, Twitter, ExternalLink, PackageOpen, Check, Store, ChevronsUpDown, Image as ImageIcon, Info, Sparkles } from 'lucide-react';
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

/**
 * @fileOverview Admin Homepage Management
 * Unified CMS for controlling all dynamic sections of the homepage.
 * Optimized for high-density editing with 20px corners and wall-to-wall layout.
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

    const handleDeepNestedLangChange = (sectionKey: keyof HomepageConfig, arrayKey: string, index: number, field: string, lang: 'bn' | 'en', value: string) => {
        setConfig(prev => {
            if (!prev || index < 0) return prev;
            
            const section = (prev[sectionKey] as any) || { display: true };
            const array = section[arrayKey] ? [...section[arrayKey]] : [];
    
            if (array[index]) {
                const item = { ...array[index] };
                const langObject = { ...(item[field] || {}) };
                langObject[lang] = value;
                item[field] = langObject;
                array[index] = item;
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

  const addCategory = () => {
    setConfig(prev => {
        if (!prev) return null;
        const newCategory: CategoryItem = {
            id: Date.now(),
            title: { bn: 'নতুন ক্যাটাগরি', en: 'New Category' },
            imageUrl: 'https://placehold.co/400x500.png',
            linkUrl: '/courses',
            dataAiHint: 'category placeholder',
        };
        const currentCategories = prev.categoriesSection?.categories || [];
        return {
            ...prev,
            categoriesSection: { ...prev.categoriesSection, categories: [...currentCategories, newCategory] }
        };
    });
  };

  const removeCategory = (id: number) => {
    setConfig(prev => {
        if (!prev || !prev.categoriesSection) return null;
        return {
            ...prev,
            categoriesSection: { ...prev.categoriesSection, categories: prev.categoriesSection.categories.filter(c => c.id !== id) }
        };
    });
  };

  const addWhyChooseUsFeature = () => {
    setConfig(p => {
        if (!p || !p.whyChooseUs) return null;
        return {
            ...p, 
            whyChooseUs: {
                ...p.whyChooseUs, 
                features: [
                    ...(p.whyChooseUs.features || []), 
                    {id: `feat_${Date.now()}`, iconUrl: 'https://placehold.co/48x48.png', dataAiHint: 'icon', title: {bn: 'নতুন ফিচার', en: 'New Feature'}}
                ]
            }
        };
    });
  };

  const removeWhyChooseUsFeature = (id: string) => setConfig(p => !p || !p.whyChooseUs ? null : {...p, whyChooseUs: {...p.whyChooseUs, features: p.whyChooseUs.features.filter(f => f.id !== id)}});
    
  const addTestimonial = () => setConfig(p => !p || !p.whyChooseUs ? null : {...p, whyChooseUs: {...p.whyChooseUs, testimonials: [...(p.whyChooseUs.testimonials || []), {id: `test_${Date.now()}`, quote: {bn: '', en: ''}, studentName: '', college: '', imageUrl: 'https://placehold.co/120x120.png', dataAiHint: 'student person'}]}});
  const removeTestimonial = (id: string) => setConfig(p => !p || !p.whyChooseUs ? null : {...p, whyChooseUs: {...p.whyChooseUs, testimonials: p.whyChooseUs.testimonials.filter(t => t.id !== id)}});

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 px-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1 mb-2">
        <div className="border-l-4 border-primary pl-4">
          <h1 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight">Homepage <span className="text-primary">CMS</span></h1>
          <p className="mt-1 text-[10px] md:text-sm text-muted-foreground font-medium">Control the content displayed on your homepage.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto shadow-xl rounded-xl font-black h-11 md:h-12 uppercase tracking-widest px-6 md:px-8 text-[10px] md:text-xs">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-full h-auto p-1 bg-muted/50 rounded-xl mb-6 min-w-max">
                <TabsTrigger value="general" className="rounded-lg px-6 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:shadow-md">General</TabsTrigger>
                <TabsTrigger value="hero" className="rounded-lg px-6 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:shadow-md">Hero & Banners</TabsTrigger>
                <TabsTrigger value="courses" className="rounded-lg px-6 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:shadow-md">Course Sections</TabsTrigger>
                <TabsTrigger value="content" className="rounded-lg px-6 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:shadow-md">Content & Testimonials</TabsTrigger>
                <TabsTrigger value="pages" className="rounded-lg px-6 py-2.5 font-black uppercase text-[10px] tracking-widest data-[state=active]:shadow-md">Special Pages</TabsTrigger>
            </TabsList>
        </div>

        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="px-1"
            >
                {/* --- GENERAL TAB --- */}
                <TabsContent value="general" className="space-y-8 mt-0">
                    <Card className="rounded-[20px] shadow-sm border-primary/10">
                        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                            <CardTitle className="text-sm font-black uppercase tracking-tight">Branding & Logic</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Site Logo URL</Label>
                                <Input value={config.logoUrl || ''} onChange={e => handleSimpleValueChange('logoUrl', e.target.value)} placeholder="https://example.com/logo.png" className="rounded-xl h-12" />
                            </div>
                            <div className="space-y-4 border-t border-primary/5 pt-6">
                                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Section Visibility</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {allSections.map(section => (
                                        <div key={section.key} className="flex items-center justify-between rounded-xl border border-primary/5 p-4 bg-muted/20">
                                            <span className="text-[11px] font-black uppercase tracking-tight">{section.label}</span>
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
                    <Card className="rounded-[20px] shadow-sm border-primary/10">
                        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                            <CardTitle className="text-sm font-black uppercase tracking-tight">Main Hero Banners</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <Info className="w-3.5 h-3.5 text-primary" />
                                <span>High-resolution 16:9 images are recommended.</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {safeHeroBanners.map((banner, index) => (
                                <div key={banner.id} className="p-5 border border-primary/5 rounded-[20px] space-y-4 relative bg-muted/10">
                                    <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full" onClick={() => removeHeroBanner(banner.id)}><X className="h-4 w-4"/></Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Banner Image URL</Label>
                                            <Input placeholder="https://..." value={banner.imageUrl} onChange={e => handleHeroBannerChange(index, 'imageUrl', e.target.value)} className="rounded-xl h-11" />
                                            {banner.imageUrl && (
                                                <div className="mt-3 relative aspect-[16/9] w-48 rounded-xl overflow-hidden border-2 border-white shadow-lg bg-black">
                                                    <img src={banner.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Destination URL</Label>
                                            <Input placeholder="e.g., /courses/physics-batch" value={banner.href} onChange={e => handleHeroBannerChange(index, 'href', e.target.value)} className="rounded-xl h-11" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full border-dashed rounded-xl h-14 font-black uppercase tracking-widest text-[10px]" onClick={addHeroBanner}><PlusCircle className="mr-2 h-4 w-4"/>Add New Banner</Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[20px] shadow-sm border-primary/10">
                        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                            <CardTitle className="text-sm font-black uppercase tracking-tight">Offline & Shop Slides</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {safeOfflineSlides.map((slide, index) => (
                                <div key={slide.id} className="p-5 border border-primary/5 rounded-[20px] space-y-4 relative bg-muted/10">
                                    <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full" onClick={() => removeOfflineSlide(slide.id)}><X className="h-4 w-4"/></Button>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Slide Image URL</Label>
                                        <Input placeholder="Enter image URL..." value={slide.imageUrl} onChange={e => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'imageUrl', e.target.value)} className="rounded-xl h-11" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Badge Title</Label><Input placeholder="e.g., SPECIAL OFFER" value={slide.title} onChange={e => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'title', e.target.value)} className="rounded-xl h-11" /></div>
                                        <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Main Heading</Label><Input placeholder="e.g., Join our new Physics Batch" value={slide.subtitle} onChange={e => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'subtitle', e.target.value)} className="rounded-xl h-11" /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Offer Price</Label><Input placeholder="e.g., ৳1,200" value={slide.price} onChange={e => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'price', e.target.value)} className="rounded-xl h-11" /></div>
                                        <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Original Price</Label><Input placeholder="e.g., ৳3,000" value={slide.originalPrice} onChange={e => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'originalPrice', e.target.value)} className="rounded-xl h-11" /></div>
                                    </div>
                                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Enroll Button Link</Label><Input placeholder="e.g., /checkout/course-id" value={slide.enrollHref} onChange={e => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'enrollHref', e.target.value)} className="rounded-xl h-11" /></div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full border-dashed rounded-xl h-14 font-black uppercase tracking-widest text-[10px]" onClick={addOfflineSlide}><PlusCircle className="mr-2 h-4 w-4"/>Add Carousel Slide</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- COURSE SECTIONS TAB --- */}
                <TabsContent value="courses" className="space-y-8 mt-0">
                    <Card className="rounded-[20px] shadow-sm border-primary/10">
                        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                            <CardTitle className="text-sm font-black uppercase tracking-tight">Categories Grid</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Section Title (BN)</Label><Input value={config.categoriesSection?.title?.bn || ''} onChange={e => handleSectionLangChange('categoriesSection', 'title', 'bn', e.target.value)} className="rounded-xl h-11"/></div>
                                <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Section Title (EN)</Label><Input value={config.categoriesSection?.title?.en || ''} onChange={e => handleSectionLangChange('categoriesSection', 'title', 'en', e.target.value)} className="rounded-xl h-11"/></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {config.categoriesSection?.categories?.map((cat, index) => (
                                    <div key={cat.id} className="p-4 border border-primary/5 rounded-[20px] bg-muted/10 relative space-y-3">
                                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive rounded-full" onClick={() => removeCategory(cat.id)}><X className="h-4 w-4"/></Button>
                                        <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase tracking-widest opacity-60">Title (EN)</Label><Input value={cat.title?.en} onChange={e => handleNestedArrayChange('categoriesSection', 'categories', index, 'title', { ...cat.title, en: e.target.value })} className="h-9 rounded-lg" /></div>
                                        <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase tracking-widest opacity-60">Image URL</Label><Input value={cat.imageUrl} onChange={e => handleNestedArrayChange('categoriesSection', 'categories', index, 'imageUrl', e.target.value)} className="h-9 rounded-lg" /></div>
                                        <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase tracking-widest opacity-60">Link</Label><Input value={cat.linkUrl} onChange={e => handleNestedArrayChange('categoriesSection', 'categories', index, 'linkUrl', e.target.value)} className="h-9 rounded-lg" /></div>
                                    </div>
                                ))}
                                <Button variant="outline" className="border-dashed rounded-[20px] h-auto min-h-[150px] flex flex-col gap-2 font-black uppercase text-[10px] tracking-widest" onClick={addCategory}>
                                    <PlusCircle className="h-6 w-6 text-primary" />
                                    Add Category
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- CONTENT TAB --- */}
                <TabsContent value="content" className="space-y-8 mt-0">
                    <Card className="rounded-[20px] border-primary/10 shadow-sm overflow-hidden">
                        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                            <CardTitle className="text-sm font-black uppercase tracking-tight">Why Choose Us & Testimonials</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Section Title (BN)</Label><Input value={config.whyChooseUs?.title?.bn || ''} onChange={e => handleSectionLangChange('whyChooseUs', 'title', 'bn', e.target.value)} className="rounded-xl h-11"/></div>
                                <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Description (BN)</Label><Textarea value={config.whyChooseUs?.description?.bn || ''} onChange={e => handleSectionLangChange('whyChooseUs', 'description', 'bn', e.target.value)} rows={2} className="rounded-xl"/></div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-primary/5">
                                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Success Stories (Testimonials)</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {config.whyChooseUs?.testimonials?.map((t, index) => (
                                        <div key={t.id} className="p-5 border border-primary/5 rounded-[20px] bg-muted/10 relative space-y-4">
                                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => removeTestimonial(t.id)}><X className="h-4 w-4"/></Button>
                                            <div className="space-y-2"><Label className="text-[9px] font-black">Student Name</Label><Input value={t.studentName} onChange={e => handleNestedArrayChange('whyChooseUs', 'testimonials', index, 'studentName', e.target.value)} className="h-10 rounded-xl" /></div>
                                            <div className="space-y-2"><Label className="text-[9px] font-black">Quote (BN)</Label><Textarea value={t.quote?.bn || ''} onChange={e => handleDeepNestedLangChange('whyChooseUs', 'testimonials', index, 'quote', 'bn', e.target.value)} rows={2} className="rounded-xl h-20" /></div>
                                            <div className="space-y-2"><Label className="text-[9px] font-black">Image URL</Label><Input value={t.imageUrl} onChange={e => handleNestedArrayChange('whyChooseUs', 'testimonials', index, 'imageUrl', e.target.value)} className="h-10 rounded-xl" /></div>
                                        </div>
                                    ))}
                                    <Button variant="outline" className="border-dashed rounded-[20px] h-auto min-h-[120px] font-black uppercase text-[10px] tracking-widest" onClick={addTestimonial}><PlusCircle className="mr-2 h-4 w-4"/> Add Testimonial</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- PAGES TAB --- */}
                <TabsContent value="pages" className="space-y-8 mt-0">
                    <Card className="rounded-[20px] shadow-sm border-primary/10">
                        <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                            <CardTitle className="text-sm font-black uppercase tracking-tight">"Have a Question?" Section</CardTitle>
                            <CardDescription className="mt-1">Manage the contact/callback CTA on the homepage.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Main Title (EN)</Label><Input value={config.offlineHubSection?.contactSection?.title?.en || ''} onChange={e => handleSectionLangChange('offlineHubSection', 'contactSection', 'title', 'en', e.target.value)} className="rounded-xl h-11"/></div>
                                <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Subtitle (EN)</Label><Textarea value={config.offlineHubSection?.contactSection?.subtitle?.en || ''} onChange={e => handleSectionLangChange('offlineHubSection', 'contactSection', 'subtitle', 'en', e.target.value)} rows={2} className="rounded-xl"/></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-primary/5 pt-6">
                                <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Call Number</Label><Input value={config.offlineHubSection?.contactSection?.callButtonNumber || ''} onChange={e => handleSectionValueChange('offlineHubSection', 'contactSection', 'callButtonNumber', e.target.value)} className="rounded-xl h-11"/></div>
                                <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">WhatsApp Number</Label><Input value={config.offlineHubSection?.contactSection?.whatsappNumber || ''} onChange={e => handleSectionValueChange('offlineHubSection', 'contactSection', 'whatsappNumber', e.target.value)} className="rounded-xl h-11"/></div>
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
