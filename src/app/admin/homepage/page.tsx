

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Save, X, Loader2, Youtube, CheckCircle, ChevronDown, Facebook, Linkedin, Twitter, ExternalLink, PackageOpen, Check } from 'lucide-react';
import Image from 'next/image';
import { HomepageConfig, TeamMember, TopperPageCard, TopperPageSection, WhyChooseUsFeature, Testimonial, OfflineHubHeroSlide, Organization, Instructor } from '@/lib/types';
import { getHomepageConfig, getInstructors, getOrganizations } from '@/lib/firebase/firestore';
import { saveHomepageConfigAction } from '@/app/actions/homepage.actions';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Switch } from '@/components/ui/switch';
import { getYoutubeVideoId } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';

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

  useEffect(() => {
    async function fetchConfig() {
      try {
        const [fetchedConfig, instructorsData, organizationsData] = await Promise.all([
            getHomepageConfig(),
            getInstructors(),
            getOrganizations()
        ]);
        setConfig(fetchedConfig);
        setAllInstructors(instructorsData.filter(i => i.status === 'Approved'));
        setAllOrganizations(organizationsData.filter(o => o.status === 'approved'));
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
  
  // --- Robust State Update Handlers ---

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

    const handleStringArrayChange = (section: CourseIdSections, value: string) => {
        const ids = value.split(',').map(id => id.trim()).filter(Boolean);
        setConfig(prev => prev ? ({ ...prev, [section]: ids }) : null);
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
            partnersSection: { ...prev.partnersSection, partners: newPartners }
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
        return { ...prev, socialMediaSection: { ...prev.socialMediaSection, channels: newChannels } };
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
            price: '₹0',
            originalPrice: '₹0',
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
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2"/>}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="hero">Hero & Banners</TabsTrigger>
            <TabsTrigger value="courses">Course Sections</TabsTrigger>
            <TabsTrigger value="content">Content Sections</TabsTrigger>
            <TabsTrigger value="pages">Special Pages</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-6 space-y-8">
            <Card>
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
            <Card>
                <CardHeader><CardTitle>Animation Settings</CardTitle><CardDescription>Control the scroll speed of homepage carousels.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Teachers Carousel Speed (seconds)</Label><Input type="number" value={config.teachersSection?.scrollSpeed ?? 25} onChange={(e) => handleSectionValueChange('teachersSection', 'scrollSpeed', parseInt(e.target.value) || 25)}/></div>
                    <div className="space-y-2"><Label>Partners Carousel Speed (seconds)</Label><Input type="number" value={config.partnersSection?.scrollSpeed ?? 25} onChange={(e) => handleSectionValueChange('partnersSection', 'scrollSpeed', parseInt(e.target.value) || 25)}/></div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Floating WhatsApp Button</CardTitle><CardDescription>Manage the floating chat button on public pages.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor="floatingWhatsApp-display" className="font-medium">Display Button</Label>
                        <Switch id="floatingWhatsApp-display" checked={config.floatingWhatsApp?.display} onCheckedChange={(checked) => setConfig((prev) => prev ? { ...prev, floatingWhatsApp: { ...(prev.floatingWhatsApp || { display: true, number: '' }), display: checked } } : null )}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="floatingWhatsApp-number">WhatsApp Number</Label>
                        <Input id="floatingWhatsApp-number" value={config.floatingWhatsApp?.number || ''} onChange={(e) => setConfig((prev) => prev ? { ...prev, floatingWhatsApp: { ...(prev.floatingWhatsApp || { display: true, number: '' }), number: e.target.value } } : null)} placeholder="e.g. 8801XXXXXXXXX"/>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Section Visibility</CardTitle><CardDescription>Toggle the visibility of sections on the homepage.</CardDescription></CardHeader>
                <CardContent className="space-y-2">
                {allSections.map(section => (
                    <div key={section.key} className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor={section.key} className="text-sm">{section.label}</Label>
                    <Switch id={section.key} checked={(config as any)[section.key]?.display ?? true} onCheckedChange={(value) => handleSectionToggle(section.key, value)}/>
                    </div>
                ))}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="hero" className="mt-6 space-y-8">
            <Card>
                <CardHeader><CardTitle>Hero Carousel</CardTitle><CardDescription>Manage the main banners on the homepage.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    {config.heroBanners.map((banner, index) => (
                        <div key={banner.id} className="p-4 border rounded-lg space-y-2 relative">
                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeHeroBanner(banner.id)}><X className="text-destructive h-4 w-4"/></Button>
                        <h4 className="font-semibold">Banner {index + 1}</h4>
                        <div className="space-y-1"><Label>Image URL</Label><Input value={banner.imageUrl} onChange={(e) => handleNestedArrayChange('heroBanners', 'heroBanners', index, 'imageUrl', e.target.value)} /></div>
                        <div className="space-y-1"><Label>Link URL (e.g., /courses/1)</Label><Input value={banner.href} onChange={(e) => handleNestedArrayChange('heroBanners', 'heroBanners', index, 'href', e.target.value)} /></div>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={addHeroBanner}><PlusCircle className="mr-2"/>Add Banner</Button>
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm"><Label htmlFor="autoplay-switch" className="font-medium">Enable Autoplay</Label><Switch id="autoplay-switch" checked={config.heroCarousel?.autoplay ?? true} onCheckedChange={(checked) => handleCarouselSettingChange('autoplay', checked)}/></div>
                    <div className="space-y-2"><Label htmlFor="autoplay-delay">Autoplay Delay (ms)</Label><Input id="autoplay-delay" type="number" value={config.heroCarousel?.autoplayDelay ?? 5000} onChange={(e) => handleCarouselSettingChange('autoplayDelay', parseInt(e.target.value))} disabled={!config.heroCarousel?.autoplay}/></div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Offline Hub & RDC Shop Carousel</CardTitle>
                    <CardDescription>Manage the slim banner on the Offline Hub and RDC Shop pages. This is controlled from the same place.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {config.offlineHubHeroCarousel?.slides?.map((slide, index) => (
                        <div key={slide.id} className="p-4 border rounded-lg space-y-2 relative">
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeOfflineSlide(slide.id)}><X className="text-destructive h-4 w-4"/></Button>
                            <h4 className="font-semibold">Slide {index + 1}</h4>
                            <div className="space-y-1"><Label>Image URL</Label><Input value={slide.imageUrl} onChange={(e) => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'imageUrl', e.target.value)} /></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1"><Label>Title</Label><Input value={slide.title} onChange={(e) => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'title', e.target.value)} /></div>
                                <div className="space-y-1"><Label>Subtitle</Label><Input value={slide.subtitle} onChange={(e) => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'subtitle', e.target.value)} /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1"><Label>Offer Price</Label><Input value={slide.price} onChange={(e) => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'price', e.target.value)} /></div>
                                <div className="space-y-1"><Label>Original Price</Label><Input value={slide.originalPrice} onChange={(e) => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'originalPrice', e.target.value)} /></div>
                            </div>
                            <div className="space-y-1"><Label>Enroll Link URL</Label><Input value={slide.enrollHref} onChange={(e) => handleNestedArrayChange('offlineHubHeroCarousel', 'slides', index, 'enrollHref', e.target.value)} /></div>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={addOfflineSlide}><PlusCircle className="mr-2"/>Add Slide</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>RDC Shop Banner</CardTitle>
                    <CardDescription>Manage the large banner image on the RDC Shop (/courses) page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor="shopBanner-display" className="font-medium">Display Banner</Label>
                        <Switch 
                            id="shopBanner-display" 
                            checked={config.rdcShopBanner?.display ?? true} 
                            onCheckedChange={(checked) => handleSectionValueChange('rdcShopBanner', 'display', checked)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shopBanner-imageUrl">Image URL</Label>
                        <Input id="shopBanner-imageUrl" value={config.rdcShopBanner?.imageUrl || ''} onChange={e => handleSectionValueChange('rdcShopBanner', 'imageUrl', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shopBanner-dataAiHint">Image AI Hint</Label>
                        <Input id="shopBanner-dataAiHint" value={config.rdcShopBanner?.dataAiHint || ''} onChange={e => handleSectionValueChange('rdcShopBanner', 'dataAiHint', e.target.value)} />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Struggling Student Section</CardTitle><CardDescription>Manage the "Struggling in Studies?" banner on the homepage.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Title (BN)</Label><Input value={config.strugglingStudentSection?.title?.bn || ''} onChange={e => handleSectionLangChange('strugglingStudentSection', 'title', 'bn', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Title (EN)</Label><Input value={config.strugglingStudentSection?.title?.en || ''} onChange={e => handleSectionLangChange('strugglingStudentSection', 'title', 'en', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Subtitle (BN)</Label><Input value={config.strugglingStudentSection?.subtitle?.bn || ''} onChange={e => handleSectionLangChange('strugglingStudentSection', 'subtitle', 'bn', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Subtitle (EN)</Label><Input value={config.strugglingStudentSection?.subtitle?.en || ''} onChange={e => handleSectionLangChange('strugglingStudentSection', 'subtitle', 'en', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Button Text (BN)</Label><Input value={config.strugglingStudentSection?.buttonText?.bn || ''} onChange={e => handleSectionLangChange('strugglingStudentSection', 'buttonText', 'bn', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Button Text (EN)</Label><Input value={config.strugglingStudentSection?.buttonText?.en || ''} onChange={e => handleSectionLangChange('strugglingStudentSection', 'buttonText', 'en', e.target.value)} /></div>
                    </div>
                    <div className="space-y-2"><Label>Image URL</Label><Input value={config.strugglingStudentSection?.imageUrl || ''} onChange={e => handleSectionValueChange('strugglingStudentSection', 'imageUrl', e.target.value)} /></div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Notes Banner</CardTitle><CardDescription>Manage the "ফ্রি নোটস এবং লেকচার শিট" banner.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Title (BN)</Label><Input value={config.notesBanner?.title?.bn || ''} onChange={e => handleSectionLangChange('notesBanner', 'title', 'bn', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Description (BN)</Label><Input value={config.notesBanner?.description?.bn || ''} onChange={e => handleSectionLangChange('notesBanner', 'description', 'bn', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Button Text (BN)</Label><Input value={config.notesBanner?.buttonText?.bn || ''} onChange={e => handleSectionLangChange('notesBanner', 'buttonText', 'bn', e.target.value)} /></div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>App Promo Section</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <div className="space-y-1"><Label>Title (BN)</Label><Input value={config.appPromo?.title?.bn || ''} onChange={(e) => handleAppPromoChange('title', { ...config.appPromo?.title, bn: e.target.value })} /></div>
                    <div className="space-y-1"><Label>Description (BN)</Label><Textarea value={config.appPromo?.description?.bn || ''} onChange={(e) => handleAppPromoChange('description', { ...config.appPromo?.description, bn: e.target.value })} /></div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Request Callback Section</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input value={config.requestCallbackSection?.imageUrl || ''} onChange={e => handleSectionValueChange('requestCallbackSection', 'imageUrl', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label>Image AI Hint</Label>
                        <Input value={config.requestCallbackSection?.dataAiHint || ''} onChange={e => handleSectionValueChange('requestCallbackSection', 'dataAiHint', e.target.value)} />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="courses" className="mt-6 space-y-8">
            <Card>
                <CardHeader><CardTitle>Categories Section</CardTitle><CardDescription>Manage the category cards shown on the homepage.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Section Title (BN)</Label><Input value={config.categoriesSection?.title?.bn || ''} onChange={e => handleSectionLangChange('categoriesSection', 'title', 'bn', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Section Title (EN)</Label><Input value={config.categoriesSection?.title?.en || ''} onChange={e => handleSectionLangChange('categoriesSection', 'title', 'en', e.target.value)} /></div>
                    </div>
                    {config.categoriesSection?.categories?.map((category, index) => (
                    <div key={category.id} className="p-4 border rounded-lg space-y-2 relative">
                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeCategory(category.id)}><X className="text-destructive h-4 w-4"/></Button>
                        <h4 className="font-semibold">Category {index + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1"><Label>Title</Label><Input value={category.title} onChange={(e) => handleNestedArrayChange('categoriesSection', 'categories', index, 'title', e.target.value)} /></div>
                        <div className="space-y-1"><Label>Image URL</Label><Input value={category.imageUrl} onChange={(e) => handleNestedArrayChange('categoriesSection', 'categories', index, 'imageUrl', e.target.value)} /></div>
                        <div className="space-y-1"><Label>Link URL</Label><Input value={category.linkUrl} onChange={(e) => handleNestedArrayChange('categoriesSection', 'categories', index, 'linkUrl', e.target.value)} /></div>
                        <div className="space-y-1"><Label>Image AI Hint</Label><Input value={category.dataAiHint} onChange={(e) => handleNestedArrayChange('categoriesSection', 'categories', index, 'dataAiHint', e.target.value)} /></div>
                        </div>
                    </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={addCategory}><PlusCircle className="mr-2"/>Add Category</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Featured Courses Sections</CardTitle><CardDescription>Enter comma-separated course IDs to feature in each section.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>লাইভ কোর্সসমূহ (IDs)</Label><Input value={config.liveCoursesIds?.join(', ') || ''} onChange={(e) => handleStringArrayChange('liveCoursesIds', e.target.value)} /></div>
                    <div className="space-y-2"><Label>SSC ও HSC (IDs)</Label><Input value={config.sscHscCourseIds?.join(', ') || ''} onChange={(e) => handleStringArrayChange('sscHscCourseIds', e.target.value)} /></div>
                    <div className="space-y-2"><Label>মাস্টারক্লাস (IDs)</Label><Input value={config.masterClassesIds?.join(', ') || ''} onChange={(e) => handleStringArrayChange('masterClassesIds', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Admission (IDs)</Label><Input value={config.admissionCoursesIds?.join(', ') || ''} onChange={(e) => handleStringArrayChange('admissionCoursesIds', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Job Prep (IDs)</Label><Input value={config.jobCoursesIds?.join(', ') || ''} onChange={(e) => handleStringArrayChange('jobCoursesIds', e.target.value)} /></div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Free Classes Section</CardTitle><CardDescription>Manage the "আমাদের সকল ফ্রি ক্লাসসমূহ" section.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Section Title (BN)</Label><Input value={config.freeClassesSection?.title?.bn || ''} onChange={e => handleSectionLangChange('freeClassesSection', 'title', 'bn', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Section Subtitle (BN)</Label><Input value={config.freeClassesSection?.subtitle?.bn || ''} onChange={e => handleSectionLangChange('freeClassesSection', 'subtitle', 'bn', e.target.value)} /></div>
                    </div>
                    {config.freeClassesSection?.classes?.map((item, index) => (
                        <div key={item.id} className="p-4 border rounded-lg space-y-2 relative">
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeFreeClass(item.id)}><X className="text-destructive h-4 w-4"/></Button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1"><Label>Class Title</Label><Input value={item.title} onChange={(e) => handleNestedArrayChange('freeClassesSection', 'classes', index, 'title', e.target.value)} /></div>
                                <div className="space-y-1"><Label>Subject</Label><Input value={item.subject} onChange={(e) => handleNestedArrayChange('freeClassesSection', 'classes', index, 'subject', e.target.value)} /></div>
                                <div className="space-y-1"><Label>Instructor</Label><Input value={item.instructor} onChange={(e) => handleNestedArrayChange('freeClassesSection', 'classes', index, 'instructor', e.target.value)} /></div>
                                <div className="col-span-2 space-y-1"><Label>YouTube URL</Label><Input value={item.youtubeUrl} onChange={(e) => handleNestedArrayChange('freeClassesSection', 'classes', index, 'youtubeUrl', e.target.value)} /></div>
                                <div className="col-span-2 space-y-1"><Label>Grade</Label><Input value={item.grade} onChange={(e) => handleNestedArrayChange('freeClassesSection', 'classes', index, 'grade', e.target.value)} placeholder="e.g., ক্লাস ৯"/></div>
                            </div>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={addFreeClass}><PlusCircle className="mr-2"/>Add Free Class</Button>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="content" className="mt-6 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome Section</CardTitle>
                    <CardDescription>Manage the welcome message shown below the header on the homepage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor="welcome-display" className="font-medium">Display Section</Label>
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
            <Card>
                <CardHeader>
                    <CardTitle>Teachers Section</CardTitle>
                    <CardDescription>Manage the featured teachers section on the homepage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Section Title (BN)</Label><Input value={config.teachersSection?.title?.bn || ''} onChange={e => handleSectionLangChange('teachersSection', 'title', 'bn', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Section Title (EN)</Label><Input value={config.teachersSection?.title?.en || ''} onChange={e => handleSectionLangChange('teachersSection', 'title', 'en', e.target.value)} /></div>
                        <div className="space-y-2 col-span-1 md:col-span-2"><Label>Section Subtitle (BN)</Label><Textarea value={config.teachersSection?.subtitle?.bn || ''} onChange={e => handleSectionLangChange('teachersSection', 'subtitle', 'bn', e.target.value)} /></div>
                        <div className="space-y-2 col-span-1 md:col-span-2"><Label>Button Text (BN)</Label><Input value={config.teachersSection?.buttonText?.bn || ''} onChange={e => handleSectionLangChange('teachersSection', 'buttonText', 'bn', e.target.value)} /></div>
                    </div>
                    <div className="space-y-2">
                        <Label>Select Instructors</Label>
                        <div className="flex flex-wrap gap-1">
                            {config.teachersSection?.instructorIds?.map(instId => {
                                const inst = allInstructors.find(i => i.id === instId);
                                return inst ? <Badge key={instId} variant="secondary">{inst.name} <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => handleInstructorChange(instId, false)}><X className="h-3 w-3"/></Button></Badge> : null;
                            })}
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full mt-2"><PlusCircle className="mr-2"/> Add Instructor</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search instructors..." />
                                    <CommandEmpty>No instructors found.</CommandEmpty>
                                    <CommandGroup>
                                        {allInstructors.filter(inst => !config.teachersSection?.instructorIds?.includes(inst.id!)).map(inst => (
                                            <CommandItem key={inst.id} onSelect={() => handleInstructorChange(inst.id!, true)}>
                                                {inst.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Collaborations Section</CardTitle>
                    <CardDescription>Select which organizations/sellers to feature as collaborators.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Section Title (BN)</Label><Input value={config.collaborations?.title?.bn || ''} onChange={e => handleSectionLangChange('collaborations', 'title', 'bn', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Section Title (EN)</Label><Input value={config.collaborations?.title?.en || ''} onChange={e => handleSectionLangChange('collaborations', 'title', 'en', e.target.value)} /></div>
                    </div>
                    <div className="space-y-2">
                        <Label>Select Organizations</Label>
                        <div className="flex flex-wrap gap-1">
                          {config.collaborations?.organizationIds?.map(orgId => {
                              const org = allOrganizations.find(o => o.id === orgId);
                              return org ? <Badge key={orgId} variant="secondary">{org.name} <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => handleCollaborationChange(orgId, false)}><X className="h-3 w-3"/></Button></Badge> : null;
                          })}
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full mt-2"><PlusCircle className="mr-2"/> Add Organization</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search organizations..." />
                                    <CommandEmpty>No organizations found.</CommandEmpty>
                                    <CommandGroup>
                                        {allOrganizations.filter(org => !config.collaborations?.organizationIds?.includes(org.id!)).map(org => (
                                            <CommandItem key={org.id} onSelect={() => handleCollaborationChange(org.id!, true)}>
                                                {org.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Why Choose Us Section</CardTitle>
                    <CardDescription>Manage the "কেন RDC-তে আস্থা রাখবে?" section.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Section Title (BN)</Label><Input value={config.whyChooseUs?.title?.bn || ''} onChange={e => handleSectionLangChange('whyChooseUs', 'title', 'bn', e.target.value)} /></div>
                      <div className="space-y-2"><Label>Section Title (EN)</Label><Input value={config.whyChooseUs?.title?.en || ''} onChange={e => handleSectionLangChange('whyChooseUs', 'title', 'en', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Section Description (BN)</Label><Textarea value={config.whyChooseUs?.description?.bn || ''} onChange={e => handleSectionLangChange('whyChooseUs', 'description', 'bn', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Section Description (EN)</Label><Textarea value={config.whyChooseUs?.description?.en || ''} onChange={e => handleSectionLangChange('whyChooseUs', 'description', 'en', e.target.value)} /></div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t">
                        <Label className="font-semibold">Feature Cards</Label>
                        {config.whyChooseUs?.features?.map((feature, index) => (
                        <div key={feature.id} className="p-3 border rounded-md space-y-2 relative">
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeWhyChooseUsFeature(feature.id)}><X className="text-destructive h-4 w-4"/></Button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1"><Label>Title (BN)</Label><Input value={feature.title?.bn || ''} onChange={e => handleDeepNestedLangChange('whyChooseUs', 'features', index, 'title', 'bn', e.target.value)}/></div>
                                <div className="space-y-1"><Label>Title (EN)</Label><Input value={feature.title?.en || ''} onChange={e => handleDeepNestedLangChange('whyChooseUs', 'features', index, 'title', 'en', e.target.value)}/></div>
                            </div>
                            <div className="space-y-1"><Label>Icon URL</Label><Input value={feature.iconUrl} onChange={e => handleNestedArrayChange('whyChooseUs', 'features', index, 'iconUrl', e.target.value)}/></div>
                            <div className="space-y-1"><Label>Icon AI Hint</Label><Input value={feature.dataAiHint} onChange={e => handleNestedArrayChange('whyChooseUs', 'features', index, 'dataAiHint', e.target.value)}/></div>
                        </div>
                        ))}
                        <Button variant="outline" className="w-full border-dashed" onClick={addWhyChooseUsFeature}><PlusCircle className="mr-2"/>Add Feature</Button>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <Label className="font-semibold">Testimonials</Label>
                        {config.whyChooseUs?.testimonials?.map((t, index) => (
                        <div key={t.id} className="p-3 border rounded-md space-y-2 relative">
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeTestimonial(t.id)}><X className="text-destructive h-4 w-4"/></Button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1"><Label>Quote (BN)</Label><Textarea value={t.quote?.bn || ''} onChange={e => handleDeepNestedLangChange('whyChooseUs', 'testimonials', index, 'quote', 'bn', e.target.value)}/></div>
                              <div className="space-y-1"><Label>Quote (EN)</Label><Textarea value={t.quote?.en || ''} onChange={e => handleDeepNestedLangChange('whyChooseUs', 'testimonials', index, 'quote', 'en', e.target.value)}/></div>
                            </div>
                            <div className="space-y-1"><Label>Student Name</Label><Input value={t.studentName} onChange={e => handleNestedArrayChange('whyChooseUs', 'testimonials', index, 'studentName', e.target.value)}/></div>
                            <div className="space-y-1"><Label>College</Label><Input value={t.college} onChange={e => handleNestedArrayChange('whyChooseUs', 'testimonials', index, 'college', e.target.value)}/></div>
                            <div className="space-y-1"><Label>Image URL</Label><Input value={t.imageUrl} onChange={e => handleNestedArrayChange('whyChooseUs', 'testimonials', index, 'imageUrl', e.target.value)}/></div>
                            <div className="space-y-1"><Label>Image AI Hint</Label><Input value={t.dataAiHint} onChange={e => handleNestedArrayChange('whyChooseUs', 'testimonials', index, 'dataAiHint', e.target.value)}/></div>
                        </div>
                        ))}
                        <Button variant="outline" className="w-full border-dashed" onClick={addTestimonial}><PlusCircle className="mr-2"/>Add Testimonial</Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>About Us Section</CardTitle><CardDescription>Manage the team members displayed on the About Us page.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Section Title (BN)</Label><Input value={config.aboutUsSection?.title?.bn || ''} onChange={e => handleSectionLangChange('aboutUsSection', 'title', 'bn', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Section Title (EN)</Label><Input value={config.aboutUsSection?.title?.en || ''} onChange={e => handleSectionLangChange('aboutUsSection', 'title', 'en', e.target.value)} /></div>
                        <div className="space-y-2 col-span-1 md:col-span-2"><Label>Section Subtitle (EN)</Label><Textarea value={config.aboutUsSection?.subtitle?.en || ''} onChange={e => handleSectionLangChange('aboutUsSection', 'subtitle', 'en', e.target.value)} /></div>
                    </div>
                    {config.aboutUsSection?.teamMembers?.map((member, index) => (
                        <Collapsible key={member.id} className="p-4 border rounded-lg space-y-2 relative" defaultOpen>
                            <div className="flex justify-between items-start"><h4 className="font-semibold pt-2">Member {index + 1}: {member.name}</h4><div><Button variant="ghost" size="icon" onClick={() => removeTeamMember(member.id)}><X className="text-destructive h-4 w-4"/></Button><CollapsibleTrigger asChild><Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4"/></Button></CollapsibleTrigger></div></div>
                            <CollapsibleContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Name</Label><Input value={member.name} onChange={e => handleNestedArrayChange('aboutUsSection', 'teamMembers', index, 'name', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Title</Label><Input value={member.title} onChange={e => handleNestedArrayChange('aboutUsSection', 'teamMembers', index, 'title', e.target.value)} /></div>
                                </div>
                                <div className="space-y-2"><Label>Image URL</Label><Input value={member.imageUrl} onChange={e => handleNestedArrayChange('aboutUsSection', 'teamMembers', index, 'imageUrl', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Image AI Hint</Label><Input value={member.dataAiHint} onChange={e => handleNestedArrayChange('aboutUsSection', 'teamMembers', index, 'dataAiHint', e.target.value)} /></div>
                                <div className="space-y-2">
                                    <Label>Social Links</Label>
                                    {member.socialLinks.map((link, linkIndex) => (
                                        <div key={linkIndex} className="flex items-center gap-2">
                                            <Select value={link.platform} onValueChange={(value) => handleSocialLinkChange(member.id, linkIndex, 'platform', value)}><SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="facebook">Facebook</SelectItem><SelectItem value="linkedin">LinkedIn</SelectItem><SelectItem value="twitter">Twitter</SelectItem><SelectItem value="external">External</SelectItem></SelectContent></Select>
                                            <Input value={link.url} onChange={e => handleSocialLinkChange(member.id, linkIndex, 'url', e.target.value)} placeholder="Full URL" />
                                            <Button variant="ghost" size="icon" onClick={() => removeSocialLink(member.id, linkIndex)}><X className="h-4 w-4 text-destructive"/></Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={() => addSocialLink(member.id)}><PlusCircle className="mr-2"/>Add Social Link</Button>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={addTeamMember}><PlusCircle className="mr-2"/>Add Team Member</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Video Section</CardTitle><CardDescription>Manage the promotional videos. Thumbnails are generated automatically from the YouTube URL.</CardDescription></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {config.videoSection?.videos?.map((video, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                        <h4 className="font-semibold">Video {index + 1}</h4>
                        <div className="space-y-1"><Label>Video Title</Label><Input value={video.title} onChange={(e) => handleNestedArrayChange('videoSection', 'videos', index, 'title', e.target.value)} /></div>
                        <div className="space-y-1"><Label>YouTube Video URL</Label><Input value={video.videoUrl} onChange={(e) => handleNestedArrayChange('videoSection', 'videos', index, 'videoUrl', e.target.value)} /></div>
                    </div>
                ))}
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Partners Section</CardTitle><CardDescription>Manage the logos of partners displayed on the homepage.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        {config.partnersSection?.partners?.map((partner, index) => (
                            <div key={partner.id} className="p-4 border rounded-lg space-y-4 relative">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removePartner(partner.id)}><X className="text-destructive h-4 w-4" /></Button>
                                <div className="space-y-2"><Label>Partner Name</Label><Input value={partner.name} onChange={(e) => handleNestedArrayChange('partnersSection', 'partners', index, 'name', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Logo URL</Label><Input value={partner.logoUrl} onChange={(e) => handleNestedArrayChange('partnersSection', 'partners', index, 'logoUrl', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Website Link</Label><Input value={partner.href} onChange={(e) => handleNestedArrayChange('partnersSection', 'partners', index, 'href', e.target.value)} /></div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full border-dashed mt-4" onClick={addPartner}><PlusCircle className="mr-2" />Add Partner</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Social Media Section</CardTitle><CardDescription>Manage the "আমাদের সাথে কানেক্টেড থাকুন" section.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Section Title (BN)</Label><Input value={config.socialMediaSection?.title?.bn || ''} onChange={e => handleSectionLangChange('socialMediaSection', 'title', 'bn', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Section Description (BN)</Label><Textarea value={config.socialMediaSection?.description?.bn || ''} onChange={e => handleSectionLangChange('socialMediaSection', 'description', 'bn', e.target.value)} /></div>
                    
                    <div className="space-y-4 pt-4 border-t">
                        <Label className="font-semibold">Channels</Label>
                        {config.socialMediaSection?.channels.map((channel, index) => (
                             <Collapsible key={channel.id} className="p-3 border rounded-md space-y-2 relative bg-muted/50">
                                <div className="flex justify-between items-center"><h4 className="font-medium pt-2">{channel.name?.bn || 'New Channel'}</h4><div><Button variant="ghost" size="icon" onClick={() => removeSocialChannel(channel.id)}><X className="text-destructive h-4 w-4"/></Button><CollapsibleTrigger asChild><Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4"/></Button></CollapsibleTrigger></div></div>
                                <CollapsibleContent className="space-y-4 pt-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Platform</Label>
                                            <Select value={channel.platform} onValueChange={(value) => handleNestedArrayChange('socialMediaSection', 'channels', index, 'platform', value)}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent><SelectItem value="YouTube">YouTube</SelectItem><SelectItem value="Facebook Page">Facebook Page</SelectItem></SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2"><Label>Channel Name (BN)</Label><Input value={channel.name?.bn || ''} onChange={e => handleDeepNestedLangChange('socialMediaSection', 'channels', index, 'name', 'bn', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Channel Handle</Label><Input value={channel.handle} onChange={e => handleNestedArrayChange('socialMediaSection', 'channels', index, 'handle', e.target.value)} placeholder="@handle" /></div>
                                        <div className="space-y-2"><Label>Stat 1 Value</Label><Input value={channel.stat1_value} onChange={e => handleNestedArrayChange('socialMediaSection', 'channels', index, 'stat1_value', e.target.value)} placeholder="e.g., 1.5M"/></div>
                                        <div className="space-y-2"><Label>Stat 1 Label (BN)</Label><Input value={channel.stat1_label?.bn || ''} onChange={e => handleDeepNestedLangChange('socialMediaSection', 'channels', index, 'stat1_label', 'bn', e.target.value)} placeholder="e.g., সাবস্ক্রাইবার" /></div>
                                        <div className="space-y-2"><Label>Stat 2 Value</Label><Input value={channel.stat2_value} onChange={e => handleNestedArrayChange('socialMediaSection', 'channels', index, 'stat2_value', e.target.value)} placeholder="e.g., 500+"/></div>
                                        <div className="space-y-2"><Label>Stat 2 Label (BN)</Label><Input value={channel.stat2_label?.bn || ''} onChange={e => handleDeepNestedLangChange('socialMediaSection', 'channels', index, 'stat2_label', 'bn', e.target.value)} placeholder="e.g., ভিডিও"/></div>
                                        <div className="space-y-2 col-span-2"><Label>Description (BN)</Label><Textarea value={channel.description?.bn || ''} onChange={e => handleDeepNestedLangChange('socialMediaSection', 'channels', index, 'description', 'bn', e.target.value)} rows={2} /></div>
                                        <div className="space-y-2"><Label>CTA Text (BN)</Label><Input value={channel.ctaText?.bn || ''} onChange={e => handleDeepNestedLangChange('socialMediaSection', 'channels', index, 'ctaText', 'bn', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>CTA URL</Label><Input value={channel.ctaUrl} onChange={e => handleNestedArrayChange('socialMediaSection', 'channels', index, 'ctaUrl', e.target.value)} /></div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                        <Button variant="outline" className="w-full border-dashed" onClick={addSocialChannel}><PlusCircle className="mr-2"/>Add Channel</Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Stats Section</CardTitle><CardDescription>Manage the "লক্ষাধিক শিক্ষার্থীর পথচলা" section.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Section Title (BN)</Label><Input value={config.statsSection?.title?.bn || ''} onChange={e => handleSectionLangChange('statsSection', 'title', 'bn', e.target.value)} /></div>
                    {config.statsSection?.stats?.map((stat, index) => (
                        <div key={index} className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Value</Label><Input value={stat.value} onChange={e => handleNestedArrayChange('statsSection', 'stats', index, 'value', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Label (BN)</Label><Input value={stat.label?.bn || ''} onChange={e => handleDeepNestedLangChange('statsSection', 'stats', index, 'label', 'bn', e.target.value)} /></div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="pages" className="mt-6 space-y-8">
            <Card>
                <CardHeader><CardTitle>Strugglers/Topper Page</CardTitle><CardDescription>Manage the content for the "/strugglers-studies" page.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Page Title</Label><Input value={config.topperPageSection?.title || ''} onChange={e => handleSectionValueChange('topperPageSection', 'title', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Main Illustration Image URL</Label><Input value={config.topperPageSection?.mainImageUrl || ''} onChange={e => handleSectionValueChange('topperPageSection', 'mainImageUrl', e.target.value)} /></div>
                    {config.topperPageSection?.cards?.map((card, index) => (
                        <div key={card.id} className="p-4 border rounded-lg space-y-2">
                            <h4 className="font-semibold">Card {index + 1}</h4>
                            <div className="space-y-1"><Label>Icon URL</Label><Input value={card.iconUrl} onChange={e => handleNestedArrayChange('topperPageSection', 'cards', index, 'iconUrl', e.target.value)} /></div>
                            <div className="space-y-1"><Label>Title</Label><Input value={card.title} onChange={e => handleNestedArrayChange('topperPageSection', 'cards', index, 'title', e.target.value)} /></div>
                            <div className="space-y-1"><Label>Description</Label><Textarea value={card.description} onChange={e => handleNestedArrayChange('topperPageSection', 'cards', index, 'description', e.target.value)} rows={3}/></div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
