'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Save, X, Loader2, Youtube, CheckCircle, ChevronDown, Facebook, Linkedin, Twitter, ExternalLink, PackageOpen, Check, Store, ChevronsUpDown } from 'lucide-react';
import Image from 'next/image';
import { HomepageConfig, TeamMember, TopperPageCard, TopperPageSection, WhyChooseUsFeature, Testimonial, OfflineHubHeroSlide, Organization, Instructor, StoreHomepageSection, StoreHomepageBanner, Course } from '@/lib/types';
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
type CategoryItem = HomepageConfig['categoriesSection']['categories'][0];


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
  
  // --- State Update Handlers ---

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

    const handleCarouselSettingChange = (key: 'autoplay' | 'autoplayDelay', value: any) => {
        setConfig(prev => {
            if (!prev) return null;
            return {
                ...prev,
                heroCarousel: {
                    ...(prev.heroCarousel || { autoplay: true, autoplayDelay: 5000 }),
                    [key]: value
                }
            };
        });
    };
    
    const handleAppPromoChange = (key: keyof HomepageConfig['appPromo'], value: any) => {
        setConfig(prev => {
            if (!prev) return null;
            return { 
                ...prev, 
                appPromo: { 
                    ...(prev.appPromo || {}), 
                    [key]: value 
                } 
            };
        });
    };
  
    const handleSocialLinkChange = (memberId: string, linkIndex: number, field: 'platform' | 'url', value: string) => {
        setConfig(prev => {
            if (!prev || !prev.aboutUsSection) return null;
            const newMembers = prev.aboutUsSection.teamMembers.map(member => {
                if (member.id === memberId) {
                    const newLinks = [...member.socialLinks];
                    newLinks[linkIndex] = { ...newLinks[linkIndex], [field]: value };
                    return { ...member, socialLinks: newLinks };
                }
                return member;
            });
            return { ...prev, aboutUsSection: { ...prev.aboutUsSection, teamMembers: newMembers } };
        });
    };

  const addHeroBanner = () => {
    setConfig(prev => prev ? ({
      ...prev,
      heroBanners: [
        ...prev.heroBanners,
        { id: Date.now(), href: '/courses/', imageUrl: 'https://placehold.co/800x450.png', alt: 'New Banner', dataAiHint: 'banner placeholder' }
      ]
    }) : null);
  };
  
  const addCategory = () => {
    setConfig(prev => {
        if (!prev) return null;
        const newCategory: CategoryItem = {
            id: Date.now(),
            title: 'New Category',
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

  const addPartner = () => {
    setConfig(prev => {
        if (!prev) return null;
        const partnersSection = prev.partnersSection || { display: true, title: { bn: 'আমাদের পার্টনার', en: 'Our Partners' }, partners: [] };
        const newPartner = {
            id: Date.now(),
            name: 'New Partner',
            logoUrl: 'https://placehold.co/140x60.png',
            href: '#',
            dataAiHint: 'company logo'
        };
        return {
            ...prev,
            partnersSection: { ...partnersSection, partners: [...(partnersSection.partners || []), newPartner] }
        };
    });
  };
  
  const addFreeClass = () => {
    setConfig(prev => {
      if (!prev) return null;
      const freeClassesSection = prev.freeClassesSection || { display: true, title: { bn: '', en: '' }, subtitle: {bn: '', en: ''}, classes: []};
      const newClass = {
        id: `fc_${Date.now()}`,
        title: 'New Free Class',
        youtubeUrl: '',
        subject: '',
        instructor: '',
        grade: 'ক্লাস ৯'
      };
      return {
        ...prev,
        freeClassesSection: { ...freeClassesSection, classes: [...(freeClassesSection.classes || []), newClass]}
      };
    });
  };

  const addSocialChannel = () => {
    setConfig(prev => {
        if (!prev) return null;
        const newChannel: SocialChannel = {
            id: Date.now(),
            platform: 'YouTube',
            name: { bn: 'নতুন চ্যানেল', en: 'New Channel' },
            handle: '@newchannel',
            stat1_value: '0',
            stat1_label: { bn: 'সাবস্ক্রাইবার', en: 'Subscribers' },
            stat2_value: '0',
            stat2_label: { bn: 'ভিডিও', en: 'Videos' },
            description: { bn: 'চ্যানেলের বিবরণ', en: 'Channel description' },
            ctaText: { bn: 'সাবস্ক্রাইব করুন', en: 'Subscribe' },
            ctaUrl: '#',
        };
        const socialSection = prev.socialMediaSection || { display: true, title: {bn: '', en: ''}, description: {bn: '', en: ''}, channels: [] };
        return {
            ...prev,
            socialMediaSection: { ...socialSection, channels: [...(socialSection.channels || []), newChannel] }
        };
    });
  };

  const removeHeroBanner = (id: number) => {
    setConfig(prev => prev ? ({
      ...prev,
      heroBanners: prev.heroBanners.filter(banner => banner.id !== id)
    }) : null);
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

  const removePartner = (id: number) => {
    setConfig(prev => {
        if (!prev || !prev.partnersSection) return null;
        const newPartners = prev.partnersSection.partners.filter(p => p.id !== id);
        return {
            ...prev,
            partnersSection: { ...partnersSection, partners: newPartners }
        };
    });
  };
  
  const removeFreeClass = (id: string) => {
    setConfig(prev => {
      if (!prev || !prev.freeClassesSection) return null;
      const updatedClasses = prev.freeClassesSection.classes.filter(c => c.id !== id);
      return { ...prev, freeClassesSection: { ...prev.freeClassesSection, classes: updatedClasses }};
    });
  };

  const removeSocialChannel = (id: number) => {
    setConfig(prev => {
        if (!prev || !prev.socialMediaSection) return null;
        const newChannels = prev.socialMediaSection.channels.filter(c => c.id !== id);
        return { ...prev, socialMediaSection: { ...socialMediaSection, channels: newChannels } };
    });
  };

  const addTeamMember = () => {
    setConfig(prev => {
        if (!prev || !prev.aboutUsSection) return null;
        const newMember: TeamMember = {
            id: `member_${Date.now()}`,
            name: 'New Member',
            title: 'Designation',
            imageUrl: 'https://placehold.co/400x500.png',
            dataAiHint: 'person professional',
            socialLinks: [{ platform: 'facebook', url: '#' }]
        };
        return { ...prev, aboutUsSection: { ...prev.aboutUsSection, teamMembers: [...(prev.aboutUsSection.teamMembers || []), newMember] } };
    });
  };

  const removeTeamMember = (id: string) => {
    setConfig(prev => {
        if (!prev || !prev.aboutUsSection) return null;
        const newMembers = prev.aboutUsSection.teamMembers.filter(m => m.id !== id);
        return { ...prev, aboutUsSection: { ...prev.aboutUsSection, teamMembers: newMembers } };
    });
  };

  const addSocialLink = (memberId: string) => {
     setConfig(prev => {
        if (!prev || !prev.aboutUsSection) return null;
        const newMembers = prev.aboutUsSection.teamMembers.map(member => {
            if (member.id === memberId) {
                const newLinks = [...member.socialLinks, { platform: 'facebook', url: '#' }];
                return { ...member, socialLinks: newLinks };
            }
            return member;
        });
        return { ...prev, aboutUsSection: { ...prev.aboutUsSection, teamMembers: newMembers } };
    });
  }

  const removeSocialLink = (memberId: string, index: number) => {
    setConfig(prev => {
        if (!prev || !prev.aboutUsSection) return null;
        const newMembers = prev.aboutUsSection.teamMembers.map(member => {
            if (member.id === memberId) {
                const newLinks = member.socialLinks.filter((_, i) => i !== index);
                return { ...member, socialLinks: newLinks };
            }
            return member;
        });
        return { ...prev, aboutUsSection: { ...prev.aboutUsSection, teamMembers: newMembers } };
    });
  }
    
    // Why Choose Us Section
    const addWhyChooseUsFeature = () => setConfig(p => !p || !p.whyChooseUs ? null : {...p, whyChooseUs: {...p.whyChooseUs, features: [...(p.whyChooseUs.features || []), {id: `feat_${Date.now()}`, iconUrl: 'https://placehold.co/48x48.png', dataAiHint: 'icon', title: {bn: 'নতুন ফিচার', en: 'New Feature'}}]}});
    const removeWhyChooseUsFeature = (id: string) => setConfig(p => !p || !p.whyChooseUs ? null : {...p, whyChooseUs: {...p.whyChooseUs, features: p.whyChooseUs.features.filter(f => f.id !== id)}});
    
    const addTestimonial = () => setConfig(p => !p || !p.whyChooseUs ? null : {...p, whyChooseUs: {...p.whyChooseUs, testimonials: [...(p.whyChooseUs.testimonials || []), {id: `test_${Date.now()}`, quote: {bn: '', en: ''}, studentName: '', college: '', imageUrl: 'https://placehold.co/120x120.png', dataAiHint: 'student person'}]}});
    const removeTestimonial = (id: string) => setConfig(p => !p || !p.whyChooseUs ? null : {...p, whyChooseUs: {...p.whyChooseUs, testimonials: p.whyChooseUs.testimonials.filter(t => t.id !== id)}});
    
    // Offline Hub Carousel handlers
    const addOfflineSlide = () => {
        setConfig(prev => {
        if (!prev) return null;
        const newSlide: OfflineHubHeroSlide = {
            id: Date.now(),
            imageUrl: 'https://placehold.co/1200x343.png',
            dataAiHint: 'students course banner',
            title: 'New Slide Title',
            subtitle: 'New Slide Subtitle',
            price: '৳0',
            originalPrice: '৳0',
            enrollHref: '#'
        };
        const offlineCarousel = prev.offlineHubHeroCarousel || { display: true, slides: [] };
        return {
            ...prev,
            offlineHubHeroCarousel: { ...offlineCarousel, slides: [...(offlineCarousel.slides || []), newSlide] }
        };
        });
    };

    const removeOfflineSlide = (id: number) => {
        setConfig(prev => {
        if (!prev || !prev.offlineHubHeroCarousel) return null;
        const newSlides = prev.offlineHubHeroCarousel.slides.filter(s => s.id !== id);
        return { ...prev, offlineHubHeroCarousel: { ...prev.offlineHubHeroCarousel, slides: newSlides } };
        });
    };

  const handleInstructorChange = (instructorId: string, add: boolean) => {
      setConfig(prev => {
          if (!prev) return null;
          const currentIds = prev.teachersSection?.instructorIds || [];
          const newIds = add 
              ? [...currentIds, instructorId]
              : currentIds.filter(id => id !== instructorId);
          return {
              ...prev,
              teachersSection: {
                  ...(prev.teachersSection || { display: true, title: {bn: '', en: ''}, subtitle: {bn: '', en: ''}, buttonText: {bn: '', en: ''}, instructorIds:[] }),
                  instructorIds: newIds
              }
          }
      });
  };

  const handleCollaborationChange = (orgId: string, add: boolean) => {
      setConfig(prev => {
          if (!prev) return null;
          const currentIds = prev.collaborations?.organizationIds || [];
          const newIds = add 
              ? [...currentIds, orgId]
              : currentIds.filter(id => id !== orgId);
          return {
              ...prev,
              collaborations: {
                  ...(prev.collaborations || { display: true, title: {bn: '', en: ''}, organizationIds: [] }),
                  organizationIds: newIds
              }
          }
      });
  };

  const allSections = [
    { key: 'welcomeSection', label: 'Welcome Section'},
    { key: 'strugglingStudentSection', label: 'Struggling Student Banner'},
    { key: 'topperPageSection', label: 'Strugglers/Topper Page'},
    { key: 'offlineHubHeroCarousel', label: 'Offline Hub & RDC Shop Carousel'},
    { key: 'categoriesSection', label: 'Categories Section' },
    { key: 'journeySection', label: 'Journey Section (Live Courses)' },
    { key: 'teachersSection', label: 'Teachers Section' },
    { key: 'videoSection', label: 'Video Section' },
    { key: 'sscHscSection', label: 'SSC & HSC Section' },
    { key: 'masterclassSection', label: 'Masterclass Section' },
    { key: 'admissionSection', label: 'Admission Section' },
    { key: 'jobPrepSection', label: 'Job Prep Section' },
    { key: 'whyChooseUs', label: 'Why Choose Us Section' },
    { key: 'freeClassesSection', label: 'Free Classes Section' },
    { key: 'aboutUsSection', label: 'About Us Section'},
    { key: 'collaborations', label: 'Collaborations Section' },
    { key: 'partnersSection', label: 'Partners Section' },
    { key: 'socialMediaSection', label: 'Social Media Section' },
    { key: 'notesBanner', label: 'Notes Banner' },
    { key: 'statsSection', label: 'Stats Section' },
    { key: 'appPromo', label: 'App Promo Section' },
    { key: 'requestCallbackSection', label: 'Request Callback Section'},
    { key: 'storeHomepageSection', label: 'Store Homepage'},
  ] as const;

  const handleSectionToggle = (sectionKey: typeof allSections[number]['key'], value: boolean) => {
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

  const addStoreBanner = () => {
    setConfig(prev => {
        if (!prev) return null;
        const storeSection = prev.storeHomepageSection || {};
        const newBanner: StoreHomepageBanner = { id: `banner_${Date.now()}`, imageUrl: 'https://placehold.co/600x400.png', linkUrl: '#' };
        const bannerCarousel = [...(storeSection.bannerCarousel || []), newBanner];
        return { ...prev, storeHomepageSection: { ...storeSection, bannerCarousel } };
    });
  };
  
  const removeStoreBanner = (id: string) => {
     setConfig(prev => {
        if (!prev) return null;
        const storeSection = prev.storeHomepageSection || {};
        const bannerCarousel = storeSection.bannerCarousel?.filter(b => b.id !== id);
        return { ...prev, storeHomepageSection: { ...storeSection, bannerCarousel } };
    });
  };
  
  const updateStoreBanner = (id: string, field: 'imageUrl' | 'linkUrl', value: string) => {
      setConfig(prev => {
        if (!prev) return null;
        const storeSection = prev.storeHomepageSection || {};
        const bannerCarousel = storeSection.bannerCarousel?.map(b => b.id === id ? { ...b, [field]: value } : b);
        return { ...prev, storeHomepageSection: { ...storeSection, bannerCarousel } };
    });
  };

  const CourseSelector = ({ 
    label, 
    sectionKey, 
    currentIds 
  }: { 
    label: string, 
    sectionKey: CourseIdSections, 
    currentIds: string[] 
  }) => (
    <div className="space-y-2">
        <Label className="font-bold text-primary">{label}</Label>
        <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-10 bg-muted/20">
            {currentIds.length === 0 && <p className="text-xs text-muted-foreground p-1">No courses selected.</p>}
            {currentIds.map(id => {
                const course = allCourses.find(c => c.id === id);
                return course ? (
                    <Badge key={id} variant="secondary" className="gap-1">
                        {course.title}
                        <Button variant="ghost" size="icon" className="h-3 w-3 p-0 hover:bg-transparent" onClick={() => handleCourseIdToggle(sectionKey, id, false)}>
                            <X className="h-3 w-3 text-destructive"/>
                        </Button>
                    </Badge>
                ) : null;
            })}
        </div>
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between">
                    Add course to {label}...
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Search courses..." />
                    <CommandEmpty>No course found.</CommandEmpty>
                    <CommandGroup>
                        {allCourses.filter(c => !currentIds.includes(c.id!)).map(course => (
                            <CommandItem
                                key={course.id}
                                onSelect={() => handleCourseIdToggle(sectionKey, course.id!, true)}
                            >
                                <Check className="mr-2 h-4 w-4 opacity-0" />
                                {course.title}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    </div>
  );


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
        <Button onClick={handleSave} disabled={isSaving} className="shadow-lg">
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
                <TabsContent value="general" className="space-y-8 mt-0">
                    <Card className="rounded-2xl shadow-sm border-white/10">
                        <CardHeader>
                            <CardTitle>Site Branding</CardTitle>
                            <CardDescription>Manage the main logo for the entire site.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="logoUrl">Site Logo URL</Label>
                                <Input id="logoUrl" value={config.logoUrl || ''} onChange={(e) => handleSimpleValueChange('logoUrl', e.target.value)} placeholder="https://example.com/logo.png"/>
                                <p className="text-xs text-muted-foreground">If a URL is provided, it will replace the default logo across the site.</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl shadow-sm border-white/10">
                        <CardHeader><CardTitle>Animation Settings</CardTitle><CardDescription>Control the scroll speed of homepage carousels.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2"><Label>Teachers Carousel Speed (seconds)</Label><Input type="number" value={config.teachersSection?.scrollSpeed ?? 25} onChange={(e) => handleSectionValueChange('teachersSection', 'scrollSpeed', parseInt(e.target.value) || 25)}/></div>
                            <div className="space-y-2"><Label>Partners Carousel Speed (seconds)</Label><Input type="number" value={config.partnersSection?.scrollSpeed ?? 25} onChange={(e) => handleSectionValueChange('partnersSection', 'scrollSpeed', parseInt(e.target.value) || 25)}/></div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl shadow-sm border-white/10">
                        <CardHeader><CardTitle>Floating WhatsApp Button</CardTitle><CardDescription>Manage the floating chat button on public pages.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-xl border p-4 shadow-sm bg-muted/20">
                                <Label htmlFor="floatingWhatsApp-display" className="font-semibold">Display Button</Label>
                                <Switch id="floatingWhatsApp-display" checked={config.floatingWhatsApp?.display} onCheckedChange={(checked) => setConfig((prev) => prev ? { ...prev, floatingWhatsApp: { ...(prev.floatingWhatsApp || { display: true, number: '' }), display: checked } } : null )}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="floatingWhatsApp-number">WhatsApp Number</Label>
                                <Input id="floatingWhatsApp-number" value={config.floatingWhatsApp?.number || ''} onChange={(e) => setConfig((prev) => prev ? { ...prev, floatingWhatsApp: { ...(prev.floatingWhatsApp || { display: true, number: '' }), number: e.target.value } } : null)} placeholder="e.g. 8801XXXXXXXXX"/>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl shadow-sm border-white/10">
                        <CardHeader><CardTitle>Section Visibility</CardTitle><CardDescription>Toggle the visibility of sections on the homepage.</CardDescription></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {allSections.map(section => (
                            <div key={section.key} className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/30 transition-colors">
                            <Label htmlFor={section.key} className="text-sm font-medium">{section.label}</Label>
                            <Switch id={section.key} checked={(config as any)[section.key]?.display ?? true} onCheckedChange={(value) => handleSectionToggle(section.key, value)}/>
                            </div>
                        ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hero" className="space-y-8 mt-0">
                    <Card className="rounded-2xl shadow-sm border-white/10">
                        <CardHeader><CardTitle>Hero Carousel</CardTitle><CardDescription>Manage the main banners on the homepage.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            {config.heroBanners.map((banner, index) => (
                                <div key={banner.id} className="p-4 border rounded-xl space-y-4 relative bg-muted/20">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeHeroBanner(banner.id)}><X className="h-5 w-5"/></Button>
                                <h4 className="font-bold text-primary">Banner {index + 1}</h4>
                                <div className="space-y-2"><Label>Image URL</Label><Input value={banner.imageUrl} onChange={(e) => handleNestedArrayChange('heroBanners', 'heroBanners', index, 'imageUrl', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Link URL (e.g., /courses/1)</Label><Input value={banner.href} onChange={(e) => handleNestedArrayChange('heroBanners', 'heroBanners', index, 'href', e.target.value)} /></div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full border-dashed rounded-xl h-14" onClick={addHeroBanner}><PlusCircle className="mr-2"/>Add Banner</Button>
                            <div className="flex items-center justify-between rounded-xl border p-4 shadow-sm bg-muted/20"><Label htmlFor="autoplay-switch" className="font-semibold">Enable Autoplay</Label><Switch id="autoplay-switch" checked={config.heroCarousel?.autoplay ?? true} onCheckedChange={(checked) => handleCarouselSettingChange('autoplay', checked)}/></div>
                            <div className="space-y-2"><Label htmlFor="autoplay-delay">Autoplay Delay (ms)</Label><Input id="autoplay-delay" type="number" value={config.heroCarousel?.autoplayDelay ?? 5000} onChange={(e) => handleCarouselSettingChange('autoplayDelay', parseInt(e.target.value))} disabled={!config.heroCarousel?.autoplay}/></div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl shadow-sm border-white/10">
                        <CardHeader>
                            <CardTitle>Offline Hub & RDC Shop Carousel</CardTitle>
                            <CardDescription>Manage the slim banners on the Offline Hub and RDC Shop pages.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {config.offlineHubHeroCarousel?.slides?.map((slide, index) => (
                                <div key={slide.id} className="p-4 border rounded-xl space-y-4 relative bg-muted/20">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeOfflineSlide(slide.id)}><X className="h-5 w-5"/></Button>
                                    <h4 className="font-bold text-primary">Slide {index + 1}</h4>
                                    <div className="space-y-2"><Label>Image URL</Label><Input value={slide.imageUrl} onChange={(e) => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'imageUrl', e.target.value)} /></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Title</Label><Input value={slide.title} onChange={(e) => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'title', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Subtitle</Label><Input value={slide.subtitle} onChange={(e) => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'subtitle', e.target.value)} /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Offer Price</Label><Input value={slide.price} onChange={(e) => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'price', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Original Price</Label><Input value={slide.originalPrice} onChange={(e) => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'originalPrice', e.target.value)} /></div>
                                    </div>
                                    <div className="space-y-2"><Label>Enroll Link URL</Label><Input value={slide.enrollHref} onChange={(e) => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'enrollHref', e.target.value)} /></div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full border-dashed rounded-xl h-14" onClick={addOfflineSlide}><PlusCircle className="mr-2"/>Add Slide</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="courses" className="space-y-8 mt-0">
                    <Card className="rounded-2xl shadow-sm border-white/10">
                        <CardHeader><CardTitle>Categories Section</CardTitle><CardDescription>Manage the category cards shown on the homepage.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Section Title (BN)</Label><Input value={config.categoriesSection?.title?.bn || ''} onChange={e => handleSectionLangChange('categoriesSection', 'title', 'bn', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Section Title (EN)</Label><Input value={config.categoriesSection?.title?.en || ''} onChange={e => handleSectionLangChange('categoriesSection', 'title', 'en', e.target.value)} /></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {config.categoriesSection?.categories?.map((category, index) => (
                                <div key={category.id} className="p-4 border rounded-xl space-y-3 relative bg-muted/20">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-destructive" onClick={() => removeCategory(category.id)}><X className="h-5 w-5"/></Button>
                                    <h4 className="font-bold text-primary">Category {index + 1}</h4>
                                    <div className="space-y-2"><Label>Title</Label><Input value={category.title} onChange={(e) => handleNestedArrayChange('categoriesSection', 'categories', index, 'title', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Image URL</Label><Input value={category.imageUrl} onChange={(e) => handleNestedArrayChange('categoriesSection', 'categories', index, 'imageUrl', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Link URL</Label><Input value={category.linkUrl} onChange={(e) => handleNestedArrayChange('categoriesSection', 'categories', index, 'linkUrl', e.target.value)} /></div>
                                </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full border-dashed rounded-xl h-14" onClick={addCategory}><PlusCircle className="mr-2"/>Add Category</Button>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl shadow-sm border-white/10">
                        <CardHeader><CardTitle>Featured Courses Sections</CardTitle><CardDescription>Select the courses you want to feature in each section.</CardDescription></CardHeader>
                        <CardContent className="space-y-6">
                            <CourseSelector label="লাইভ কোর্সসমূহ" sectionKey="liveCoursesIds" currentIds={config.liveCoursesIds || []} />
                            <CourseSelector label="SSC ও HSC" sectionKey="sscHscCourseIds" currentIds={config.sscHscCourseIds || []} />
                            <CourseSelector label="মাস্টারক্লাস" sectionKey="masterClassesIds" currentIds={config.masterClassesIds || []} />
                            <CourseSelector label="Admission" sectionKey="admissionCoursesIds" currentIds={config.admissionCoursesIds || []} />
                            <CourseSelector label="Job Prep" sectionKey="jobCoursesIds" currentIds={config.jobCoursesIds || []} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="store" className="space-y-8 mt-0">
                    <Card className="rounded-2xl shadow-sm border-white/10">
                        <CardHeader>
                            <CardTitle>Store Banner Carousel</CardTitle>
                            <CardDescription>Add promotional banners for the store page.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {config.storeHomepageSection?.bannerCarousel?.map((banner, index) => (
                                <div key={banner.id} className="p-4 border rounded-xl space-y-4 relative bg-muted/20">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-destructive" onClick={() => removeStoreBanner(banner.id)}><X className="h-5 w-5"/></Button>
                                    <h4 className="font-bold text-primary">Banner {index + 1}</h4>
                                    <div className="space-y-2"><Label>Image URL</Label><Input value={banner.imageUrl} onChange={(e) => updateStoreBanner(banner.id, 'imageUrl', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Link URL (optional)</Label><Input value={banner.linkUrl || ''} onChange={(e) => updateStoreBanner(banner.id, 'linkUrl', e.target.value)} /></div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full border-dashed rounded-xl h-14" onClick={addStoreBanner}><PlusCircle className="mr-2"/>Add Banner</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="content" className="space-y-8 mt-0">
                    <Card className="rounded-2xl shadow-sm border-white/10">
                        <CardHeader>
                            <CardTitle>Welcome Section</CardTitle>
                            <CardDescription>Manage the welcome message shown below the header on the homepage.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-xl border p-4 shadow-sm bg-muted/20">
                                <Label htmlFor="welcome-display" className="font-semibold">Display Section</Label>
                                <Switch 
                                    id="welcome-display" 
                                    checked={config.welcomeSection?.display} 
                                    onCheckedChange={(checked) => handleSectionValueChange('welcomeSection', 'display', checked)}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Title (BN)</Label><Input value={config.welcomeSection?.title?.bn || ''} onChange={e => handleSectionLangChange('welcomeSection', 'title', 'bn', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Title (EN)</Label><Input value={config.welcomeSection?.title?.en || ''} onChange={e => handleSectionLangChange('welcomeSection', 'title', 'en', e.target.value)} /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Description (BN)</Label><Textarea value={config.welcomeSection?.description?.bn || ''} onChange={e => handleSectionLangChange('welcomeSection', 'description', 'bn', e.target.value)} rows={4}/></div>
                                <div className="space-y-2"><Label>Description (EN)</Label><Textarea value={config.welcomeSection?.description?.en || ''} onChange={e => handleSectionLangChange('welcomeSection', 'description', 'en', e.target.value)} rows={4}/></div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pages" className="space-y-8 mt-0">
                    <Card className="rounded-2xl shadow-sm border-white/10">
                        <CardHeader>
                            <CardTitle>Strugglers/Topper Page</CardTitle>
                            <CardDescription>Manage the content for the "/strugglers-studies" page.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Page Title</Label>
                                <Input value={config.topperPageSection?.title || ''} onChange={e => handleSectionValueChange('topperPageSection', 'title', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Main Illustration Image URL</Label>
                                <Input value={config.topperPageSection?.mainImageUrl || ''} onChange={e => handleSectionValueChange('topperPageSection', 'mainImageUrl', e.target.value)} />
                            </div>
                            <div className="space-y-4 pt-4 border-t">
                                <Label className="font-bold text-primary">Feature Cards</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {config.topperPageSection?.cards?.map((card, index) => (
                                        <div key={card.id} className="p-4 border rounded-xl space-y-3 bg-muted/20">
                                            <h4 className="font-bold">Card {index + 1}</h4>
                                            <div className="space-y-2"><Label>Icon URL</Label><Input value={card.iconUrl} onChange={e => handleNestedArrayChange('topperPageSection', 'cards', index, 'iconUrl', e.target.value)} /></div>
                                            <div className="space-y-2"><Label>Title</Label><Input value={card.title} onChange={e => handleNestedArrayChange('topperPageSection', 'cards', index, 'title', e.target.value)} /></div>
                                            <div className="space-y-2"><Label>Description</Label><Textarea value={card.description} onChange={e => handleNestedArrayChange('topperPageSection', 'cards', index, 'description', e.target.value)} rows={2}/></div>
                                        </div>
                                    ))}
                                </div>
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
