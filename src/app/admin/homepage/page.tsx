

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Save, X, Loader2, Youtube, CheckCircle, ChevronDown, Facebook, Linkedin, Twitter, ExternalLink, PackageOpen } from 'lucide-react';
import Image from 'next/image';
import { HomepageConfig, TeamMember, TopperPageCard, TopperPageSection, WhyChooseUsFeature, Testimonial, OfflineHubHeroSlide } from '@/lib/types';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import { saveHomepageConfigAction } from '@/app/actions/homepage.actions';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Switch } from '@/components/ui/switch';
import { getYoutubeVideoId } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SocialChannel = NonNullable<HomepageConfig['socialMediaSection']['channels']>[0];
type CourseIdSections = 'liveCoursesIds' | 'sscHscCourseIds' | 'masterClassesIds' | 'admissionCoursesIds' | 'jobCoursesIds';
type CategoryItem = HomepageConfig['categoriesSection']['categories'][0];


export default function AdminHomepageManagementPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    async function fetchConfig() {
      try {
        const fetchedConfig = await getHomepageConfig();
        setConfig(fetchedConfig);
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

  const handleStringArrayChange = (section: CourseIdSections, value: string) => {
    const ids = value.split(',').map(id => id.trim()).filter(Boolean);
    setConfig(prev => prev ? ({ ...prev, [section]: ids }) : null);
  };
  
  const handleNestedInputChange = (section: keyof HomepageConfig, subSectionKey: string, key: string, value: string | number, index: number) => {
    setConfig(prevConfig => {
        if (!prevConfig) return null;
        const newConfig = JSON.parse(JSON.stringify(prevConfig));
        const sectionData = newConfig[section] as any;
        const subSectionData = sectionData[subSectionKey];

        if (Array.isArray(subSectionData) && index !== undefined && subSectionData[index]) {
            subSectionData[index][key] = value;
            newConfig[section][subSectionKey] = subSectionData;
        }
        return newConfig;
    });
  };
  
  const handleDeepNestedInputChange = (section: keyof HomepageConfig, subSectionKey: string, index: number, field: string, subfield: string, value: string) => {
    setConfig(prevConfig => {
        if (!prevConfig) return null;
        const newConfig = JSON.parse(JSON.stringify(prevConfig));
        if (newConfig[section]?.[subSectionKey]?.[index]?.[field]) {
          newConfig[section][subSectionKey][index][field][subfield] = value;
        }
        return newConfig;
    });
  };

  const handleSectionInputChange = (section: keyof HomepageConfig, key: string, value: string | number | { bn: string; en: string }) => {
    setConfig(prevConfig => {
      if (!prevConfig) return null;
      const newConfig = { ...prevConfig };
      if (newConfig[section]) {
        (newConfig[section] as any)[key] = value;
      }
      return newConfig;
    });
  };
  
  const handleSectionTitleChange = (section: keyof HomepageConfig, lang: 'bn' | 'en', value: string) => {
    setConfig(prevConfig => {
      if (!prevConfig) return null;
      const newConfig = JSON.parse(JSON.stringify(prevConfig)); // Deep copy
      if (newConfig[section] && (newConfig[section] as any).title) {
        (newConfig[section] as any).title[lang] = value;
      }
      return newConfig;
    });
  };
  
  const handleSectionLangChange = (section: keyof HomepageConfig, field: string, lang: 'bn' | 'en', value: string) => {
      setConfig(prevConfig => {
          if (!prevConfig) return null;
          const newConfig = JSON.parse(JSON.stringify(prevConfig));
          if (newConfig[section]?.[field]) {
              newConfig[section][field][lang] = value;
          }
          return newConfig;
      });
  };


  const handleSectionSubtitleChange = (section: keyof HomepageConfig, lang: 'bn' | 'en', value: string) => {
    setConfig(prevConfig => {
      if (!prevConfig) return null;
      const newConfig = JSON.parse(JSON.stringify(prevConfig)); // Deep copy
      if (newConfig[section] && (newConfig[section] as any).subtitle) {
        (newConfig[section] as any).subtitle[lang] = value;
      }
      return newConfig;
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
        const newCategory = {
            id: Date.now(),
            title: 'New Category',
            imageUrl: 'https://placehold.co/400x500.png',
            linkUrl: '/courses',
            dataAiHint: 'category placeholder',
        };
        return {
            ...prev,
            categoriesSection: { ...prev.categoriesSection, categories: [...(prev.categoriesSection?.categories || []), newCategory] }
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

  const handleHeroBannerChange = (index: number, field: 'imageUrl' | 'href', value: string) => {
    setConfig(prev => {
        if (!prev) return null;
        const newBanners = [...prev.heroBanners];
        const bannerToUpdate = { ...newBanners[index], [field]: value };
        newBanners[index] = bannerToUpdate;
        return { ...prev, heroBanners: newBanners };
    });
  };
  
  const handleCategoryChange = (index: number, field: keyof CategoryItem, value: string) => {
    setConfig(prev => {
        if (!prev || !prev.categoriesSection) return null;
        const newCategories = [...prev.categoriesSection.categories];
        const categoryToUpdate = { ...newCategories[index], [field]: value };
        newCategories[index] = categoryToUpdate;
        return { ...prev, categoriesSection: { ...prev.categoriesSection, categories: newCategories } };
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
        if (!prev || !prev.appPromo) return null;
        return { ...prev, appPromo: { ...prev.appPromo, [key]: value } };
    });
  };
  
  const handleTeamMemberChange = (id: string, field: keyof Omit<TeamMember, 'id' | 'socialLinks'>, value: string) => {
    setConfig(prev => {
        if (!prev || !prev.aboutUsSection) return null;
        const newMembers = prev.aboutUsSection.teamMembers.map(m => m.id === id ? { ...m, [field]: value } : m);
        return { ...prev, aboutUsSection: { ...prev.aboutUsSection, teamMembers: newMembers } };
    });
  };

  const handleSocialLinkChange = (memberId: string, index: number, field: 'platform' | 'url', value: string) => {
    setConfig(prev => {
        if (!prev || !prev.aboutUsSection) return null;
        const newMembers = prev.aboutUsSection.teamMembers.map(member => {
            if (member.id === memberId) {
                const newLinks = [...member.socialLinks];
                newLinks[index] = { ...newLinks[index], [field]: value as any };
                return { ...member, socialLinks: newLinks };
            }
            return member;
        });
        return { ...prev, aboutUsSection: { ...prev.aboutUsSection, teamMembers: newMembers } };
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

  const handleStrugglingSectionLangChange = (field: 'title' | 'subtitle' | 'buttonText', lang: 'bn' | 'en', value: string) => {
    setConfig(prevConfig => {
        if (!prevConfig || !prevConfig.strugglingStudentSection) return null;
        const newConfig = JSON.parse(JSON.stringify(prevConfig));
        if (newConfig.strugglingStudentSection[field]) {
            newConfig.strugglingStudentSection[field][lang] = value;
        }
        return newConfig;
    });
  };

    const handleTopperPageChange = (field: keyof TopperPageSection, value: string) => {
        setConfig(prev => {
            if (!prev || !prev.topperPageSection) return null;
            const newConfig = JSON.parse(JSON.stringify(prev));
            newConfig.topperPageSection[field] = value;
            return newConfig;
        });
    };

    const handleTopperCardChange = (id: string, field: keyof TopperPageCard, value: string) => {
        setConfig(prev => {
            if (!prev || !prev.topperPageSection) return null;
            const newCards = prev.topperPageSection.cards.map(c => 
                c.id === id ? { ...c, [field]: value } : c
            );
            const newConfig = JSON.parse(JSON.stringify(prev));
            newConfig.topperPageSection.cards = newCards;
            return newConfig;
        });
    };
    
    // Why Choose Us Section
    const addWhyChooseUsFeature = () => setConfig(p => !p || !p.whyChooseUs ? null : {...p, whyChooseUs: {...p.whyChooseUs, features: [...(p.whyChooseUs.features || []), {id: `feat_${Date.now()}`, iconUrl: 'https://placehold.co/48x48.png', dataAiHint: 'icon', title: {bn: 'নতুন ফিচার', en: 'New Feature'}}]}});
    const removeWhyChooseUsFeature = (id: string) => setConfig(p => !p || !p.whyChooseUs ? null : {...p, whyChooseUs: {...p.whyChooseUs, features: p.whyChooseUs.features.filter(f => f.id !== id)}});
    const updateWhyChooseUsFeature = (id: string, field: keyof WhyChooseUsFeature, value: any) => setConfig(p => !p || !p.whyChooseUs ? null : {...p, whyChooseUs: {...p.whyChooseUs, features: p.whyChooseUs.features.map(f => f.id === id ? {...f, [field]: value} : f)}});
    const addTestimonial = () => setConfig(p => !p || !p.whyChooseUs ? null : {...p, whyChooseUs: {...p.whyChooseUs, testimonials: [...(p.whyChooseUs.testimonials || []), {id: `test_${Date.now()}`, quote: {bn: '', en: ''}, studentName: '', college: '', imageUrl: 'https://placehold.co/120x120.png', dataAiHint: 'student person'}]}});
    const removeTestimonial = (id: string) => setConfig(p => !p || !p.whyChooseUs ? null : {...p, whyChooseUs: {...p.whyChooseUs, testimonials: p.whyChooseUs.testimonials.filter(t => t.id !== id)}});
    const updateTestimonial = (id: string, field: keyof Testimonial, value: any) => setConfig(p => !p || !p.whyChooseUs ? null : {...p, whyChooseUs: {...p.whyChooseUs, testimonials: p.whyChooseUs.testimonials.map(t => t.id === id ? {...f, [field]: value} : t)}});
    
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
            offlineHubHeroCarousel: { ...offlineCarousel, slides: [...offlineCarousel.slides, newSlide] }
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

  const allSections = [
    { key: 'strugglingStudentSection', label: 'Struggling Student Banner'},
    { key: 'topperPageSection', label: 'Strugglers/Topper Page'},
    { key: 'offlineHubHeroCarousel', label: 'Offline Hub Carousel'},
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
    { key: 'offlineHubSection', label: 'Offline Hub Section' },
  ] as const;

  const handleSectionToggle = (sectionKey: typeof allSections[number]['key'], value: boolean) => {
    setConfig(prevConfig => {
      if (!prevConfig) return null;
      const newConfig = { ...prevConfig };
      if (newConfig[sectionKey]) {
        (newConfig[sectionKey] as any).display = value;
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
                        <Input id="logoUrl" value={config.logoUrl || ''} onChange={(e) => setConfig(prev => prev ? ({ ...prev, logoUrl: e.target.value }) : null)} placeholder="https://example.com/logo.png"/>
                        <p className="text-xs text-muted-foreground">If a URL is provided, it will replace the default logo across the site.</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Animation Settings</CardTitle><CardDescription>Control the scroll speed of homepage carousels.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Teachers Carousel Speed (seconds)</Label><Input type="number" value={config.teachersSection?.scrollSpeed ?? 25} onChange={(e) => handleSectionInputChange('teachersSection', 'scrollSpeed', parseInt(e.target.value) || 25)}/></div>
                    <div className="space-y-2"><Label>Partners Carousel Speed (seconds)</Label><Input type="number" value={config.partnersSection?.scrollSpeed ?? 25} onChange={(e) => handleSectionInputChange('partnersSection', 'scrollSpeed', parseInt(e.target.value) || 25)}/></div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Floating WhatsApp Button</CardTitle><CardDescription>Manage the floating chat button on public pages.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor="floatingWhatsApp-display" className="font-medium">Display Button</Label>
                        <Switch id="floatingWhatsApp-display" checked={config.floatingWhatsApp?.display} onCheckedChange={(checked) => setConfig((prev) => prev ? { ...prev, floatingWhatsApp: { ...prev.floatingWhatsApp, display: checked } } : null )}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="floatingWhatsApp-number">WhatsApp Number</Label>
                        <Input id="floatingWhatsApp-number" value={config.floatingWhatsApp?.number || ''} onChange={(e) => setConfig((prev) => prev ? { ...prev, floatingWhatsApp: { ...prev.floatingWhatsApp, number: e.target.value } } : null)} placeholder="e.g. 8801XXXXXXXXX"/>
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
                        <div className="space-y-1"><Label>Image URL</Label><Input value={banner.imageUrl} onChange={(e) => handleHeroBannerChange(index, 'imageUrl', e.target.value)} /></div>
                        <div className="space-y-1"><Label>Link URL (e.g., /courses/1)</Label><Input value={banner.href} onChange={(e) => handleHeroBannerChange(index, 'href', e.target.value)} /></div>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={addHeroBanner}><PlusCircle className="mr-2"/>Add Banner</Button>
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm"><Label htmlFor="autoplay-switch" className="font-medium">Enable Autoplay</Label><Switch id="autoplay-switch" checked={config.heroCarousel?.autoplay ?? true} onCheckedChange={(checked) => handleCarouselSettingChange('autoplay', checked)}/></div>
                    <div className="space-y-2"><Label htmlFor="autoplay-delay">Autoplay Delay (ms)</Label><Input id="autoplay-delay" type="number" value={config.heroCarousel?.autoplayDelay ?? 5000} onChange={(e) => handleCarouselSettingChange('autoplayDelay', parseInt(e.target.value))} disabled={!config.heroCarousel?.autoplay}/></div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Offline Hub Carousel</CardTitle><CardDescription>Manage the slim banner on the Offline Hub page.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    {config.offlineHubHeroCarousel?.slides?.map((slide, index) => (
                        <div key={slide.id} className="p-4 border rounded-lg space-y-2 relative">
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeOfflineSlide(slide.id)}><X className="text-destructive h-4 w-4"/></Button>
                            <h4 className="font-semibold">Slide {index + 1}</h4>
                            <div className="space-y-1"><Label>Image URL</Label><Input value={slide.imageUrl} onChange={(e) => handleNestedInputChange('offlineHubHeroCarousel', 'slides', 'imageUrl', e.target.value, index)} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1"><Label>Title</Label><Input value={slide.title} onChange={(e) => handleNestedInputChange('offlineHubHeroCarousel', 'slides', 'title', e.target.value, index)} /></div>
                                <div className="space-y-1"><Label>Subtitle</Label><Input value={slide.subtitle} onChange={(e) => handleNestedInputChange('offlineHubHeroCarousel', 'slides', 'subtitle', e.target.value, index)} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1"><Label>Offer Price</Label><Input value={slide.price} onChange={(e) => handleNestedInputChange('offlineHubHeroCarousel', 'slides', 'price', e.target.value, index)} /></div>
                                <div className="space-y-1"><Label>Original Price</Label><Input value={slide.originalPrice} onChange={(e) => handleNestedInputChange('offlineHubHeroCarousel', 'slides', 'originalPrice', e.target.value, index)} /></div>
                            </div>
                            <div className="space-y-1"><Label>Enroll Link URL</Label><Input value={slide.enrollHref} onChange={(e) => handleNestedInputChange('offlineHubHeroCarousel', 'slides', 'enrollHref', e.target.value, index)} /></div>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={addOfflineSlide}><PlusCircle className="mr-2"/>Add Slide</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Struggling Student Section</CardTitle><CardDescription>Manage the "Struggling in Studies?" banner on the homepage.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Title (BN)</Label><Input value={config.strugglingStudentSection?.title?.bn || ''} onChange={e => handleStrugglingSectionLangChange('title', 'bn', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Title (EN)</Label><Input value={config.strugglingStudentSection?.title?.en || ''} onChange={e => handleStrugglingSectionLangChange('title', 'en', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Subtitle (BN)</Label><Input value={config.strugglingStudentSection?.subtitle?.bn || ''} onChange={e => handleStrugglingSectionLangChange('subtitle', 'bn', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Subtitle (EN)</Label><Input value={config.strugglingStudentSection?.subtitle?.en || ''} onChange={e => handleStrugglingSectionLangChange('subtitle', 'en', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Button Text (BN)</Label><Input value={config.strugglingStudentSection?.buttonText?.bn || ''} onChange={e => handleStrugglingSectionLangChange('buttonText', 'bn', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Button Text (EN)</Label><Input value={config.strugglingStudentSection?.buttonText?.en || ''} onChange={e => handleStrugglingSectionLangChange('buttonText', 'en', e.target.value)} /></div>
                    </div>
                    <div className="space-y-2"><Label>Image URL</Label><Input value={config.strugglingStudentSection?.imageUrl || ''} onChange={e => handleStrugglingSectionChange('imageUrl', e.target.value)} /></div>
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
        </TabsContent>
         <TabsContent value="courses" className="mt-6 space-y-8">
            <Card>
                <CardHeader><CardTitle>Categories Section</CardTitle><CardDescription>Manage the category cards shown on the homepage.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Section Title (BN)</Label><Input value={config.categoriesSection?.title?.bn || ''} onChange={e => handleSectionTitleChange('categoriesSection', 'bn', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Section Title (EN)</Label><Input value={config.categoriesSection?.title?.en || ''} onChange={e => handleSectionTitleChange('categoriesSection', 'en', e.target.value)} /></div>
                    </div>
                    {config.categoriesSection?.categories?.map((category, index) => (
                    <div key={category.id} className="p-4 border rounded-lg space-y-2 relative">
                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeCategory(category.id)}><X className="text-destructive h-4 w-4"/></Button>
                        <h4 className="font-semibold">Category {index + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1"><Label>Title</Label><Input value={category.title} onChange={(e) => handleCategoryChange(index, 'title', e.target.value)} /></div>
                        <div className="space-y-1"><Label>Image URL</Label><Input value={category.imageUrl} onChange={(e) => handleCategoryChange(index, 'imageUrl', e.target.value)} /></div>
                        <div className="space-y-1"><Label>Link URL</Label><Input value={category.linkUrl} onChange={(e) => handleCategoryChange(index, 'linkUrl', e.target.value)} /></div>
                        <div className="space-y-1"><Label>Image AI Hint</Label><Input value={category.dataAiHint} onChange={(e) => handleCategoryChange(index, 'dataAiHint', e.target.value)} /></div>
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Section Title (BN)</Label><Input value={config.freeClassesSection?.title?.bn || ''} onChange={e => handleSectionTitleChange('freeClassesSection', 'bn', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Section Subtitle (BN)</Label><Input value={config.freeClassesSection?.subtitle?.bn || ''} onChange={e => handleSectionSubtitleChange('freeClassesSection', 'bn', e.target.value)} /></div>
                    </div>
                    {config.freeClassesSection?.classes?.map((item, index) => (
                        <div key={item.id} className="p-4 border rounded-lg space-y-2 relative">
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeFreeClass(item.id)}><X className="text-destructive h-4 w-4"/></Button>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1"><Label>Class Title</Label><Input value={item.title} onChange={(e) => handleNestedInputChange('freeClassesSection', 'classes', 'title', e.target.value, index)} /></div>
                                <div className="space-y-1"><Label>Subject</Label><Input value={item.subject} onChange={(e) => handleNestedInputChange('freeClassesSection', 'classes', 'subject', e.target.value, index)} /></div>
                                <div className="space-y-1"><Label>Instructor</Label><Input value={item.instructor} onChange={(e) => handleNestedInputChange('freeClassesSection', 'classes', 'instructor', e.target.value, index)} /></div>
                                <div className="col-span-2 space-y-1"><Label>YouTube URL</Label><Input value={item.youtubeUrl} onChange={(e) => handleNestedInputChange('freeClassesSection', 'classes', 'youtubeUrl', e.target.value, index)} /></div>
                                <div className="col-span-2 space-y-1"><Label>Grade</Label><Input value={item.grade} onChange={(e) => handleNestedInputChange('freeClassesSection', 'classes', 'grade', e.target.value, index)} placeholder="e.g., ক্লাস ৯"/></div>
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
                    <CardTitle>Why Choose Us Section</CardTitle>
                    <CardDescription>Manage the "কেন RDC-তে আস্থা রাখবে?" section.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Section Title (BN)</Label><Input value={config.whyChooseUs?.title?.bn || ''} onChange={e => handleSectionLangChange('whyChooseUs', 'title', 'bn', e.target.value)} /></div>
                      <div className="space-y-2"><Label>Section Title (EN)</Label><Input value={config.whyChooseUs?.title?.en || ''} onChange={e => handleSectionLangChange('whyChooseUs', 'title', 'en', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Section Description (BN)</Label><Textarea value={config.whyChooseUs?.description?.bn || ''} onChange={e => handleSectionLangChange('whyChooseUs', 'description', 'bn', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Section Description (EN)</Label><Textarea value={config.whyChooseUs?.description?.en || ''} onChange={e => handleSectionLangChange('whyChooseUs', 'description', 'en', e.target.value)} /></div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t">
                        <Label className="font-semibold">Feature Cards</Label>
                        {config.whyChooseUs?.features?.map(feature => (
                        <div key={feature.id} className="p-3 border rounded-md space-y-2 relative">
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeWhyChooseUsFeature(feature.id)}><X className="text-destructive h-4 w-4"/></Button>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1"><Label>Title (BN)</Label><Input value={feature.title?.bn || ''} onChange={e => updateWhyChooseUsFeature(feature.id, 'title', {...feature.title, bn: e.target.value})}/></div>
                                <div className="space-y-1"><Label>Title (EN)</Label><Input value={feature.title?.en || ''} onChange={e => updateWhyChooseUsFeature(feature.id, 'title', {...feature.title, en: e.target.value})}/></div>
                            </div>
                            <div className="space-y-1"><Label>Icon URL</Label><Input value={feature.iconUrl} onChange={e => updateWhyChooseUsFeature(feature.id, 'iconUrl', e.target.value)}/></div>
                            <div className="space-y-1"><Label>Icon AI Hint</Label><Input value={feature.dataAiHint} onChange={e => updateWhyChooseUsFeature(feature.id, 'dataAiHint', e.target.value)}/></div>
                        </div>
                        ))}
                        <Button variant="outline" className="w-full border-dashed" onClick={addWhyChooseUsFeature}><PlusCircle className="mr-2"/>Add Feature</Button>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <Label className="font-semibold">Testimonials</Label>
                        {config.whyChooseUs?.testimonials?.map(t => (
                        <div key={t.id} className="p-3 border rounded-md space-y-2 relative">
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeTestimonial(t.id)}><X className="text-destructive h-4 w-4"/></Button>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1"><Label>Quote (BN)</Label><Textarea value={t.quote?.bn || ''} onChange={e => updateTestimonial(t.id, 'quote', {...t.quote, bn: e.target.value})}/></div>
                              <div className="space-y-1"><Label>Quote (EN)</Label><Textarea value={t.quote?.en || ''} onChange={e => updateTestimonial(t.id, 'quote', {...t.quote, en: e.target.value})}/></div>
                            </div>
                            <div className="space-y-1"><Label>Student Name</Label><Input value={t.studentName} onChange={e => updateTestimonial(t.id, 'studentName', e.target.value)}/></div>
                            <div className="space-y-1"><Label>College</Label><Input value={t.college} onChange={e => updateTestimonial(t.id, 'college', e.target.value)}/></div>
                            <div className="space-y-1"><Label>Image URL</Label><Input value={t.imageUrl} onChange={e => updateTestimonial(t.id, 'imageUrl', e.target.value)}/></div>
                            <div className="space-y-1"><Label>Image AI Hint</Label><Input value={t.dataAiHint} onChange={e => updateTestimonial(t.id, 'dataAiHint', e.target.value)}/></div>
                        </div>
                        ))}
                        <Button variant="outline" className="w-full border-dashed" onClick={addTestimonial}><PlusCircle className="mr-2"/>Add Testimonial</Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>About Us Section</CardTitle><CardDescription>Manage the team members displayed on the About Us page.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Section Title (BN)</Label><Input value={config.aboutUsSection?.title?.bn || ''} onChange={e => handleSectionTitleChange('aboutUsSection', 'bn', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Section Title (EN)</Label><Input value={config.aboutUsSection?.title?.en || ''} onChange={e => handleSectionTitleChange('aboutUsSection', 'en', e.target.value)} /></div>
                        <div className="space-y-2 col-span-2"><Label>Section Subtitle (EN)</Label><Textarea value={config.aboutUsSection?.subtitle?.en || ''} onChange={e => handleSectionSubtitleChange('aboutUsSection', 'en', e.target.value)} /></div>
                    </div>
                    {config.aboutUsSection?.teamMembers?.map((member, index) => (
                        <Collapsible key={member.id} className="p-4 border rounded-lg space-y-2 relative" defaultOpen>
                            <div className="flex justify-between items-start"><h4 className="font-semibold pt-2">Member {index + 1}: {member.name}</h4><div><Button variant="ghost" size="icon" onClick={() => removeTeamMember(member.id)}><X className="text-destructive h-4 w-4"/></Button><CollapsibleTrigger asChild><Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4"/></Button></CollapsibleTrigger></div></div>
                            <CollapsibleContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Name</Label><Input value={member.name} onChange={e => handleTeamMemberChange(member.id, 'name', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Title</Label><Input value={member.title} onChange={e => handleTeamMemberChange(member.id, 'title', e.target.value)} /></div>
                                </div>
                                <div className="space-y-2"><Label>Image URL</Label><Input value={member.imageUrl} onChange={e => handleTeamMemberChange(member.id, 'imageUrl', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Image AI Hint</Label><Input value={member.dataAiHint} onChange={e => handleTeamMemberChange(member.id, 'dataAiHint', e.target.value)} /></div>
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
                <CardContent className="grid md:grid-cols-2 gap-6">
                {config.videoSection?.videos?.map((video, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                        <h4 className="font-semibold">Video {index + 1}</h4>
                        <div className="space-y-1"><Label>Video Title</Label><Input value={video.title} onChange={(e) => handleNestedInputChange('videoSection', 'videos', 'title', e.target.value, index)} /></div>
                        <div className="space-y-1"><Label>YouTube Video URL</Label><Input value={video.videoUrl} onChange={(e) => handleNestedInputChange('videoSection', 'videos', 'videoUrl', e.target.value, index)} /></div>
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
                                <div className="space-y-2"><Label>Partner Name</Label><Input value={partner.name} onChange={(e) => handleNestedInputChange('partnersSection', 'partners', 'name', e.target.value, index)} /></div>
                                <div className="space-y-2"><Label>Logo URL</Label><Input value={partner.logoUrl} onChange={(e) => handleNestedInputChange('partnersSection', 'partners', 'logoUrl', e.target.value, index)} /></div>
                                <div className="space-y-2"><Label>Website Link</Label><Input value={partner.href} onChange={(e) => handleNestedInputChange('partnersSection', 'partners', 'href', e.target.value, index)} /></div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full border-dashed mt-4" onClick={addPartner}><PlusCircle className="mr-2" />Add Partner</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Social Media Section</CardTitle><CardDescription>Manage the "আমাদের সাথে কানেক্টেড থাকুন" section.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Section Title (BN)</Label><Input value={config.socialMediaSection?.title?.bn || ''} onChange={e => handleSectionTitleChange('socialMediaSection', 'bn', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Section Description (BN)</Label><Textarea value={config.socialMediaSection?.description?.bn || ''} onChange={e => handleSectionLangChange('socialMediaSection', 'description', 'bn', e.target.value)} /></div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Stats Section</CardTitle><CardDescription>Manage the "লক্ষাধিক শিক্ষার্থীর পথচলা" section.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Section Title (BN)</Label><Input value={config.statsSection?.title?.bn || ''} onChange={e => handleSectionTitleChange('statsSection', 'bn', e.target.value)} /></div>
                    {config.statsSection?.stats?.map((stat, index) => (
                        <div key={index} className="p-4 border rounded-lg grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Value</Label><Input value={stat.value} onChange={e => handleNestedInputChange('statsSection', 'stats', 'value', e.target.value, index)} /></div>
                            <div className="space-y-2"><Label>Label (BN)</Label><Input value={stat.label?.bn || ''} onChange={e => handleDeepNestedInputChange('statsSection', 'stats', index, 'label', 'bn', e.target.value)} /></div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="pages" className="mt-6 space-y-8">
            <Card>
                <CardHeader><CardTitle>Offline Hub Page Settings</CardTitle><CardDescription>Control the static content on the RDC OFFLINE HUB page. Programs and centers are now managed automatically.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Title (BN)</Label><Input value={config.offlineHubSection?.title?.bn || ''} onChange={e => handleSectionTitleChange('offlineHubSection', 'bn', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Title (EN)</Label><Input value={config.offlineHubSection?.title?.en || ''} onChange={e => handleSectionTitleChange('offlineHubSection', 'en', e.target.value)} /></div>
                        <div className="space-y-2 col-span-2"><Label>Subtitle (BN)</Label><Textarea value={config.offlineHubSection?.subtitle?.bn || ''} onChange={e => handleSectionSubtitleChange('offlineHubSection', 'bn', e.target.value)} /></div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Strugglers/Topper Page</CardTitle><CardDescription>Manage the content for the "/strugglers-studies" page.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Page Title</Label><Input value={config.topperPageSection?.title || ''} onChange={e => handleTopperPageChange('title', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Main Illustration Image URL</Label><Input value={config.topperPageSection?.mainImageUrl || ''} onChange={e => handleTopperPageChange('mainImageUrl', e.target.value)} /></div>
                    {config.topperPageSection?.cards?.map((card, index) => (
                        <div key={card.id} className="p-4 border rounded-lg space-y-2">
                            <h4 className="font-semibold">Card {index + 1}</h4>
                            <div className="space-y-1"><Label>Icon URL</Label><Input value={card.iconUrl} onChange={e => handleTopperCardChange(card.id, 'iconUrl', e.target.value)} /></div>
                            <div className="space-y-1"><Label>Title</Label><Input value={card.title} onChange={e => handleTopperCardChange(card.id, 'title', e.target.value)} /></div>
                            <div className="space-y-1"><Label>Description</Label><Textarea value={card.description} onChange={e => handleTopperCardChange(card.id, 'description', e.target.value)} rows={3}/></div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
