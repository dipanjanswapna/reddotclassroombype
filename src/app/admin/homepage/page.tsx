
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Save, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HomepageConfig } from '@/lib/types';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import { saveHomepageConfigAction } from '@/app/actions/homepage.actions';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

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
  
  const handleNestedInputChange = (section: keyof HomepageConfig, subSectionKey: string, key: string, value: string, index: number) => {
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

  const addHeroBanner = () => {
    setConfig(prev => prev ? ({
      ...prev,
      heroBanners: [
        ...prev.heroBanners,
        { id: Date.now(), href: '/courses/', imageUrl: 'https://placehold.co/800x450.png', alt: 'New Banner', dataAiHint: 'banner placeholder' }
      ]
    }) : null);
  };

  const removeHeroBanner = (id: number) => {
    setConfig(prev => prev ? ({
      ...prev,
      heroBanners: prev.heroBanners.filter(banner => banner.id !== id)
    }) : null);
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
              <CardDescription>Manage the two promotional videos and their thumbnails.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              {config.videoSection.videos.map((video, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-semibold">Video {index + 1}</h4>
                     <div className="space-y-1">
                      <Label>Image URL</Label>
                      <Input value={video.imageUrl} onChange={(e) => handleNestedInputChange('videoSection', 'videos', 'imageUrl', e.target.value, index)} />
                    </div>
                     <div className="space-y-1">
                      <Label>Video URL (YouTube/Vimeo)</Label>
                      <Input value={video.videoUrl} onChange={(e) => handleNestedInputChange('videoSection', 'videos', 'videoUrl', e.target.value, index)} />
                    </div>
                </div>
              ))}
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
