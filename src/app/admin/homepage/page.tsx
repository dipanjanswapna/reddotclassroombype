
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Save, X, Loader2, Separator } from 'lucide-react';
import Image from 'next/image';
import { HomepageConfig } from '@/lib/types';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import { saveHomepageConfigAction } from '@/app/actions/homepage.actions';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Switch } from '@/components/ui/switch';

type SocialChannel = NonNullable<HomepageConfig['socialMediaSection']['channels']>[0];
type CourseIdSections = 'liveCoursesIds' | 'sscHscCourseIds' | 'masterClassesIds' | 'admissionCoursesIds' | 'jobCoursesIds';

export default function AdminHomepageManagementPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
        newConfig[section][subSectionKey][index][field][subfield] = value;
        return newConfig;
    });
  };

  const handleSectionInputChange = (section: keyof HomepageConfig, key: string, value: string | number) => {
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
      const newConfig = { ...prevConfig };
      if (newConfig[section]) {
        (newConfig[section] as any).title[lang] = value;
      }
      return newConfig;
    });
  };
  
  const handleSectionDescriptionChange = (section: keyof HomepageConfig, lang: 'bn' | 'en', value: string) => {
    setConfig(prevConfig => {
      if (!prevConfig) return null;
      const newConfig = { ...prevConfig };
      if (newConfig[section]) {
        (newConfig[section] as any).description[lang] = value;
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
            partnersSection: { ...partnersSection, partners: [...partnersSection.partners, newPartner] }
        };
    });
  };

  const removeHeroBanner = (id: number) => {
    setConfig(prev => prev ? ({
      ...prev,
      heroBanners: prev.heroBanners.filter(banner => banner.id !== id)
    }) : null);
  };
  
  const removePartner = (id: number) => {
    setConfig(prev => {
        if (!prev) return null;
        const partnersSection = prev.partnersSection || { display: true, title: { bn: '', en: '' }, partners: [] };
        const newPartners = partnersSection.partners.filter(p => p.id !== id);
        return {
            ...prev,
            partnersSection: { ...partnersSection, partners: newPartners }
        };
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
        return { ...prev, appPromo: { ...prev.appPromo, [key]: value } };
    });
  };

  const sections = [
    { key: 'journeySection', label: 'Journey Section (Live Courses)' },
    { key: 'teachersSection', label: 'Teachers Section' },
    { key: 'videoSection', label: 'Video Section' },
    { key: 'sscHscSection', label: 'SSC & HSC Section' },
    { key: 'masterclassSection', label: 'Masterclass Section' },
    { key: 'admissionSection', label: 'Admission Section' },
    { key: 'jobPrepSection', label: 'Job Prep Section' },
    { key: 'whyChooseUs', label: 'Why Choose Us Section' },
    { key: 'collaborations', label: 'Collaborations Section' },
    { key: 'partnersSection', label: 'Partners Section' },
    { key: 'socialMediaSection', label: 'Social Media Section' },
    { key: 'notesBanner', label: 'Notes Banner' },
    { key: 'statsSection', label: 'Stats Section' },
    { key: 'appPromo', label: 'App Promo Section' },
  ] as const;

  const handleSectionToggle = (sectionKey: typeof sections[number]['key'], value: boolean) => {
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
          <p className="mt-1 text-lg text-muted-foreground">Control the content displayed on your homepage.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2"/>}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Hero Carousel</CardTitle>
              <CardDescription>Manage the main banners on the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.heroBanners.map((banner, index) => (
                <div key={banner.id} className="p-4 border rounded-lg space-y-2 relative">
                   <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeHeroBanner(banner.id)}><X className="text-destructive h-4 w-4"/></Button>
                  <h4 className="font-semibold">Banner {index + 1}</h4>
                   <div className="space-y-1">
                      <Label>Image URL</Label>
                      <Input value={banner.imageUrl} onChange={(e) => handleHeroBannerChange(index, 'imageUrl', e.target.value)} />
                    </div>
                     <div className="space-y-1">
                      <Label>Link URL (e.g., /courses/1)</Label>
                      <Input value={banner.href} onChange={(e) => handleHeroBannerChange(index, 'href', e.target.value)} />
                    </div>
                </div>
              ))}
               <Button variant="outline" className="w-full border-dashed" onClick={addHeroBanner}><PlusCircle className="mr-2"/>Add Banner</Button>
            </CardContent>
             <CardHeader>
              <CardTitle>Carousel Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <Label htmlFor="autoplay-switch" className="font-medium">
                    Enable Autoplay
                    </Label>
                    <Switch
                        id="autoplay-switch"
                        checked={config.heroCarousel?.autoplay ?? true}
                        onCheckedChange={(checked) => handleCarouselSettingChange('autoplay', checked)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="autoplay-delay">Autoplay Delay (in milliseconds)</Label>
                    <Input 
                        id="autoplay-delay"
                        type="number"
                        value={config.heroCarousel?.autoplayDelay ?? 5000}
                        onChange={(e) => handleCarouselSettingChange('autoplayDelay', parseInt(e.target.value))}
                        disabled={!config.heroCarousel?.autoplay}
                    />
                </div>
            </CardContent>
          </Card>
          
           <Card>
              <CardHeader>
                <CardTitle>Featured Courses Sections</CardTitle>
                <CardDescription>Enter comma-separated course IDs to feature in each section.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="liveCoursesIds">লাইভ কোর্সসমূহ (IDs)</Label>
                      <Input id="liveCoursesIds" value={config.liveCoursesIds.join(', ')} onChange={(e) => handleStringArrayChange('liveCoursesIds', e.target.value)} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="sscHscCourseIds">SSC ও HSC (IDs)</Label>
                      <Input id="sscHscCourseIds" value={config.sscHscCourseIds.join(', ')} onChange={(e) => handleStringArrayChange('sscHscCourseIds', e.target.value)} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="masterClassesIds">মাস্টারক্লাস (IDs)</Label>
                      <Input id="masterClassesIds" value={config.masterClassesIds.join(', ')} onChange={(e) => handleStringArrayChange('masterClassesIds', e.target.value)} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="admissionCoursesIds">Admission (IDs)</Label>
                      <Input id="admissionCoursesIds" value={config.admissionCoursesIds.join(', ')} onChange={(e) => handleStringArrayChange('admissionCoursesIds', e.target.value)} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="jobCoursesIds">Job Prep (IDs)</Label>
                      <Input id="jobCoursesIds" value={config.jobCoursesIds.join(', ')} onChange={(e) => handleStringArrayChange('jobCoursesIds', e.target.value)} />
                  </div>
              </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Video Section</CardTitle>
              <CardDescription>Manage the promotional videos. Thumbnails are generated automatically from the YouTube URL.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              {config.videoSection.videos.map((video, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-semibold">Video {index + 1}</h4>
                     <div className="space-y-1">
                      <Label>Video Title</Label>
                      <Input value={video.title} onChange={(e) => handleNestedInputChange('videoSection', 'videos', 'title', e.target.value, index)} />
                    </div>
                     <div className="space-y-1">
                      <Label>YouTube Video URL</Label>
                      <Input value={video.videoUrl} onChange={(e) => handleNestedInputChange('videoSection', 'videos', 'videoUrl', e.target.value, index)} />
                    </div>
                </div>
              ))}
            </CardContent>
          </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Stats Section</CardTitle>
                    <CardDescription>Manage the "লক্ষাধিক শিক্ষার্থীর পথচলা" section.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Section Title (Bangla)</Label>
                        <Input value={config.statsSection.title.bn} onChange={e => handleSectionTitleChange('statsSection', 'bn', e.target.value)} />
                    </div>
                    {config.statsSection.stats.map((stat, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-2 relative">
                            <h4 className="font-semibold">Stat {index + 1}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Value</Label>
                                    <Input value={stat.value} onChange={e => handleNestedInputChange('statsSection', 'stats', 'value', e.target.value, index)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Label (Bangla)</Label>
                                    <Input value={stat.label.bn} onChange={e => handleDeepNestedInputChange('statsSection', 'stats', index, 'label', 'bn', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
          
           <Card>
                <CardHeader>
                    <CardTitle>Partners Section</CardTitle>
                    <CardDescription>Manage the logos of partners displayed on the homepage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        {config.partnersSection?.partners.map((partner, index) => (
                            <div key={partner.id} className="p-4 border rounded-lg space-y-4 relative">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removePartner(partner.id)}>
                                    <X className="text-destructive h-4 w-4" />
                                </Button>
                                <div className="space-y-2">
                                    <Label>Partner Name</Label>
                                    <Input value={partner.name} onChange={(e) => handleNestedInputChange('partnersSection', 'partners', 'name', e.target.value, index)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Logo URL</Label>
                                    <Input value={partner.logoUrl} onChange={(e) => handleNestedInputChange('partnersSection', 'partners', 'logoUrl', e.target.value, index)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Website Link</Label>
                                    <Input value={partner.href} onChange={(e) => handleNestedInputChange('partnersSection', 'partners', 'href', e.target.value, index)} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full border-dashed mt-4" onClick={addPartner}>
                        <PlusCircle className="mr-2" />
                        Add Partner
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Social Media Section</CardTitle>
                    <CardDescription>Manage the "আমাদের সাথে কানেক্টেড থাকুন" section.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Section Title (Bangla)</Label>
                        <Input value={config.socialMediaSection.title.bn} onChange={e => handleSectionTitleChange('socialMediaSection', 'bn', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Section Description (Bangla)</Label>
                        <Textarea value={config.socialMediaSection.description.bn} onChange={e => handleSectionDescriptionChange('socialMediaSection', 'bn', e.target.value)} />
                    </div>
                    {config.socialMediaSection.channels.map((channel, index) => (
                        <div key={channel.id} className="p-4 border rounded-lg space-y-4">
                            <h4 className="font-semibold">Channel {index + 1}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Platform</Label><Input value={channel.platform} onChange={e => handleNestedInputChange('socialMediaSection', 'channels', 'platform', e.target.value, index)} /></div>
                                <div className="space-y-2"><Label>Name (Bangla)</Label><Input value={(channel.name as any).bn} onChange={e => handleDeepNestedInputChange('socialMediaSection', 'channels', index, 'name', 'bn', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Handle</Label><Input value={channel.handle} onChange={e => handleNestedInputChange('socialMediaSection', 'channels', 'handle', e.target.value, index)} /></div>
                                <div className="space-y-2"><Label>Stat 1 Value</Label><Input value={channel.stat1_value} onChange={e => handleNestedInputChange('socialMediaSection', 'channels', 'stat1_value', e.target.value, index)} /></div>
                                <div className="space-y-2"><Label>Stat 1 Label (Bangla)</Label><Input value={(channel.stat1_label as any).bn} onChange={e => handleDeepNestedInputChange('socialMediaSection', 'channels', index, 'stat1_label', 'bn', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Stat 2 Value</Label><Input value={channel.stat2_value} onChange={e => handleNestedInputChange('socialMediaSection', 'channels', 'stat2_value', e.target.value, index)} /></div>
                                <div className="space-y-2"><Label>Stat 2 Label (Bangla)</Label><Input value={(channel.stat2_label as any).bn} onChange={e => handleDeepNestedInputChange('socialMediaSection', 'channels', index, 'stat2_label', 'bn', e.target.value)} /></div>
                                <div className="space-y-2"><Label>CTA Text (Bangla)</Label><Input value={(channel.ctaText as any).bn} onChange={e => handleDeepNestedInputChange('socialMediaSection', 'channels', index, 'ctaText', 'bn', e.target.value)} /></div>
                                <div className="space-y-2 col-span-2"><Label>CTA URL</Label><Input value={channel.ctaUrl} onChange={e => handleNestedInputChange('socialMediaSection', 'channels', 'ctaUrl', e.target.value, index)} /></div>
                                <div className="space-y-2 col-span-2"><Label>Description (Bangla)</Label><Textarea value={(channel.description as any).bn} onChange={e => handleDeepNestedInputChange('socialMediaSection', 'channels', index, 'description', 'bn', e.target.value)} /></div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notes Banner</CardTitle>
                    <CardDescription>Manage the "ফ্রি নোটস এবং লেকচার শিট" banner.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Title (Bangla)</Label>
                        <Input value={config.notesBanner.title.bn} onChange={e => handleDeepNestedInputChange('notesBanner', 'title', 0, 'bn', 'bn', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Description (Bangla)</Label>
                        <Input value={config.notesBanner.description.bn} onChange={e => handleDeepNestedInputChange('notesBanner', 'description', 0, 'bn', 'bn', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Button Text (Bangla)</Label>
                        <Input value={config.notesBanner.buttonText.bn} onChange={e => handleDeepNestedInputChange('notesBanner', 'buttonText', 0, 'bn', 'bn', e.target.value)} />
                    </div>
                </CardContent>
            </Card>

        </div>

        <div className="lg:col-span-1 space-y-8">
           <Card>
                <CardHeader>
                    <CardTitle>Site Branding</CardTitle>
                    <CardDescription>Manage the main logo for the entire site.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="logoUrl">Site Logo URL</Label>
                        <Input 
                            id="logoUrl"
                            value={config.logoUrl || ''} 
                            onChange={(e) => setConfig(prev => prev ? ({ ...prev, logoUrl: e.target.value }) : null)}
                            placeholder="https://example.com/logo.png"
                        />
                        <p className="text-xs text-muted-foreground">If a URL is provided, it will replace the default logo across the site.</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Animation Settings</CardTitle>
                    <CardDescription>Control the scroll speed of homepage carousels.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="teachersScrollSpeed">Teachers Carousel Speed (seconds)</Label>
                        <Input 
                        id="teachersScrollSpeed"
                        type="number"
                        value={config.teachersSection?.scrollSpeed ?? 25} 
                        onChange={(e) => handleSectionInputChange('teachersSection', 'scrollSpeed', parseInt(e.target.value) || 25)}
                        />
                        <p className="text-xs text-muted-foreground">Lower number means faster scroll. Default is 25.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="partnersScrollSpeed">Partners Carousel Speed (seconds)</Label>
                        <Input 
                        id="partnersScrollSpeed"
                        type="number"
                        value={config.partnersSection?.scrollSpeed ?? 25} 
                        onChange={(e) => handleSectionInputChange('partnersSection', 'scrollSpeed', parseInt(e.target.value) || 25)}
                        />
                        <p className="text-xs text-muted-foreground">Lower number means faster scroll. Default is 25.</p>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                <CardTitle>Floating WhatsApp Button</CardTitle>
                <CardDescription>Manage the floating chat button on public pages.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <Label htmlFor="floatingWhatsApp-display" className="font-medium">
                    Display Button
                    </Label>
                    <Switch
                    id="floatingWhatsApp-display"
                    checked={config.floatingWhatsApp.display}
                    onCheckedChange={(checked) =>
                        setConfig((prev) =>
                        prev
                            ? {
                                ...prev,
                                floatingWhatsApp: { ...prev.floatingWhatsApp, display: checked },
                            }
                            : null
                        )
                    }
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="floatingWhatsApp-number">WhatsApp Number</Label>
                    <Input
                    id="floatingWhatsApp-number"
                    value={config.floatingWhatsApp.number}
                    onChange={(e) =>
                        setConfig((prev) =>
                        prev
                            ? {
                                ...prev,
                                floatingWhatsApp: { ...prev.floatingWhatsApp, number: e.target.value },
                            }
                            : null
                        )
                    }
                    placeholder="e.g. 8801XXXXXXXXX"
                    />
                </div>
                </CardContent>
            </Card>
           <Card>
                <CardHeader>
                <CardTitle>Section Visibility</CardTitle>
                <CardDescription>Toggle the visibility of sections on the homepage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                {sections.map(section => (
                    <div key={section.key} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor={section.key} className="text-sm">{section.label}</Label>
                    </div>
                    <Switch
                        id={section.key}
                        checked={(config as any)[section.key]?.display ?? true}
                        onCheckedChange={(value) => handleSectionToggle(section.key, value)}
                    />
                    </div>
                ))}
                </CardContent>
            </Card>

          <Card>
            <CardHeader>
              <CardTitle>App Promo Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label>Title (Bangla)</Label>
                <Input value={config.appPromo.title.bn} onChange={(e) => handleAppPromoChange('title', { ...config.appPromo.title, bn: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Description (Bangla)</Label>
                <Textarea value={config.appPromo.description.bn} onChange={(e) => handleAppPromoChange('description', { ...config.appPromo.description, bn: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>App Screenshot Image URL</Label>
                <Input value={config.appPromo.imageUrl} onChange={(e) => handleAppPromoChange('imageUrl', e.target.value )} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
