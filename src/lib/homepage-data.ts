
// This file acts as a mock database for homepage content.
// In a real application, this data would be fetched from a CMS or database.

export const homepageConfig = {
  heroBanners: [
    { id: 1, href: '/courses/9', imageUrl: 'https://placehold.co/800x450.png', alt: 'Engineering Program', dataAiHint: 'engineering program' },
    { id: 2, href: '/courses/2', imageUrl: 'https://placehold.co/800x450.png', alt: 'Medical 25 Program', dataAiHint: 'medical program students' },
    { id: 3, href: '/courses/1', imageUrl: 'https://placehold.co/800x450.png', alt: 'ID Timers Batch 25', dataAiHint: 'classroom students' },
    { id: 4, href: '/courses/10', imageUrl: 'https://placehold.co/800x450.png', alt: 'ACS Program', dataAiHint: 'university admission' },
    { id: 5, href: '/courses/13', imageUrl: 'https://placehold.co/800x450.png', alt: 'Arts Program', dataAiHint: 'history book' },
  ],
  liveCoursesIds: ['13', '1', '6', '14'],
  teachersSection: {
    title: {
      bn: 'প্রতি বিষয়ের একাধিক অভিজ্ঞ শিক্ষক',
      en: 'Experienced Teachers for Every Subject'
    },
    subtitle: {
      bn: 'আমাদের এডমিশন ইউনিট এ বিগত বছর গুলোয় অভাবনীয় সাফল্য',
      en: 'Unprecedented success in our admission unit over the past years'
    },
    buttonText: {
      bn: 'সবাইকে দেখুন',
      en: 'See All'
    },
    instructorIds: ['ins-ja', 'ins-si', 'ins-rc', 'ins-fm', 'ins-ka']
  },
  videoSection: {
    title: {
      bn: 'সফল শিক্ষার্থীদের কোর্সে কী কী থাকছে?',
      en: "What's in the course for successful students?"
    },
    description: {
      bn: 'নিজেকে এগিয়ে রাখতে আজই শুরু করুন আপনার পছন্দের কোর্স',
      en: 'Start your favorite course today to get ahead'
    },
    videos: [
      { imageUrl: 'https://placehold.co/600x400.png', alt: 'Online course feature', videoUrl: '#', dataAiHint: 'online learning' },
      { imageUrl: 'https://placehold.co/600x400.png', alt: 'Best science videos', videoUrl: '#', dataAiHint: 'science experiment' },
    ]
  },
  sscHscCourseIds: ['5', '1', '6', '7'],
  masterClassesIds: ['16', '7', '8', '3'],
  admissionCoursesIds: ['2', '9', '10', '1'],
  jobCoursesIds: ['11', '12', '4', '8'],
  whyChooseUs: {
    title: {
      bn: 'কেন আমরাই শিক্ষার্থী ও অভিভাবকদের প্রথম পছন্দ?',
      en: 'Why are we the first choice for students and parents?'
    },
    features: [
      { 
        icon: 'Trophy', 
        title: { bn: 'সেরা প্রশিক্ষক', en: 'Best Instructors' }, 
        description: { bn: 'দেশের সেরা শিক্ষকরা ক্লাস নেন', en: 'The best teachers in the country take classes' } 
      },
      { 
        icon: 'BookOpen', 
        title: { bn: 'লাইভ ক্লাস', en: 'Live Classes' }, 
        description: { bn: 'সরাসরি প্রশ্ন করার সুযোগ', en: 'Opportunity to ask questions directly' } 
      },
      { 
        icon: 'Users', 
        title: { bn: 'সহপাঠীদের সাথে প্রস্তুতি', en: 'Preparation with classmates' }, 
        description: { bn: 'একসাথে পড়াশোনা ও মডেল টেস্ট', en: 'Group study and model tests' } 
      },
    ]
  },
  collaborations: {
    title: {
      bn: 'আমাদের সহযোগী প্রতিষ্ঠানসমূহ',
      en: 'Our Collaborations'
    },
    items: [
      {
        id: 1,
        name: 'MA-NAVI LTD.',
        type: 'organization',
        logoUrl: 'https://placehold.co/150x150.png',
        dataAiHint: 'company logo',
        description: {
          bn: 'Ma-Navi একটি কনসাল্টিং ফার্ম যা বিশ্বের বিভিন্ন দেশের শিক্ষার্থীদের জাপানের বিভিন্ন বিশ্ববিদ্যালয় বা ল্যাঙ্গুয়েজ স্কুলে ভর্তি হতে সাহায্য করে এবং বাংলাদেশিদের জাপানে চাকরি পেতে সহায়তা করে।',
          en: 'Ma-Navi is a consulting firm that helps students from around the world enter universities or language schools in Japan and supports Bangladeshis in securing jobs in Japan.'
        },
        cta: { text: {bn: 'ওয়েবসাইট দেখুন', en: 'View Website'}, href: '#' },
        socials: { facebook: '#', youtube: '' }
      },
      {
        id: 2,
        name: 'MediShark',
        type: 'organization',
        logoUrl: 'https://placehold.co/150x150.png',
        dataAiHint: 'medical logo',
        description: {
          bn: 'স্নাতক স্তরের শিক্ষার্থীদের জন্য ১ম - ২য় বর্ষ, ৩য় - ৪র্থ বর্ষ এবং ৫ম বর্ষের কোর্স। স্নাতকোত্তর স্তরের শিক্ষার্থীদের জন্য FCPS এবং MRCP কোর্স।',
          en: 'Undergraduate courses for 1st - 2nd year, 3rd - 4th year, and 5th year students. Postgraduate courses for FCPS and MRCP students.'
        },
        cta: { text: {bn: 'ওয়েবসাইট দেখুন', en: 'View Website'}, href: '#' },
        socials: { facebook: '#', youtube: '#' }
      },
      {
        id: 3,
        name: 'Md Nazmus Sakib',
        type: 'individual',
        logoUrl: 'https://placehold.co/150x150.png',
        dataAiHint: 'male portrait',
        description: {
          bn: 'রসায়ন বিভাগ, ঢাকা বিশ্ববিদ্যালয়, সিওও, এসিএস গ্রুপ। রসায়নের প্রশিক্ষক।',
          en: 'Chemistry Dept. Dhaka University, COO, ACS Group. Instructor of Chemistry.'
        },
        cta: { text: {bn: 'সকল কোর্স', en: 'All Courses'}, href: '#' },
        socials: { facebook: '#', youtube: '#' }
      }
    ]
  },
  socialMediaSection: {
    title: {
      bn: 'সোশ্যাল মিডিয়াতে যোগাযোগ করো',
      en: 'Connect with us on Social Media'
    },
    description: {
      bn: 'আমাদের সোশ্যাল মিডিয়া চ্যানেলগুলোতে যুক্ত হয়ে পড়াশোনার আপডেট পেয়ে যাও সবার আগে',
      en: 'Join our social media channels to get all the academic updates first'
    },
    channels: [
      {
        id: 1,
        platform: 'YouTube',
        name: {bn: 'ইউটিউব চ্যানেল', en: 'YouTube Channel'},
        handle: '@AbhiDattaTushar156',
        stat1_value: '354K',
        stat1_label: {bn: 'সাবস্ক্রাইবার', en: 'subscribers'},
        stat2_value: '533',
        stat2_label: {bn: 'ভিডিও', en: 'videos'},
        description: {bn: 'পড়াশোনার সকল আপডেট, লাইভ ক্লাস এবং ফ্রি কনটেন্ট পেতে সাবস্ক্রাইব করুন', en: 'Subscribe to get all academic updates, live classes, and free content'},
        ctaText: {bn: 'সাবস্ক্রাইব করুন', en: 'Subscribe Now'},
        ctaUrl: '#',
      },
      {
        id: 2,
        platform: 'Facebook Group',
        name: {bn: 'ফেসবুক গ্রুপ', en: 'Facebook Group'},
        handle: 'RhomBus Parallel Science Hub',
        stat1_value: '156.0K',
        stat1_label: {bn: 'সদস্য', en: 'members'},
        stat2_value: '',
        stat2_label: {bn: '', en: ''},
        description: {bn: 'দৈনিক স্টাডি টিপস, নোটস পেতে এবং লার্নিং কমিউনিটিতে যুক্ত হতে গ্রুপে জয়েন করুন', en: 'Join the group to get daily study tips, notes, and join the learning community'},
        ctaText: {bn: 'জয়েন গ্রুপ', en: 'Join Group'},
        ctaUrl: '#',
      },
      {
        id: 3,
        platform: 'Facebook Page',
        name: {bn: 'ফেসবুক পেজ', en: 'Facebook Page'},
        handle: 'RhomBus Parallel Science Hub',
        stat1_value: '69K',
        stat1_label: {bn: 'লাইক', en: 'likes'},
        stat2_value: '152K',
        stat2_label: {bn: 'ফলোয়ার', en: 'followers'},
        description: {bn: 'কোর্স আপডেট, স্পেশাল অফার এবং লাইভ সেশনের নোটিফিকেশন পেতে পেজ ফলো করুন', en: 'Follow the page to get course updates, special offers, and live session notifications'},
        ctaText: {bn: 'ফলো করুন', en: 'Follow Page'},
        ctaUrl: '#',
      },
      {
        id: 4,
        platform: 'Facebook Page',
        name: {bn: 'RhomBus Publication', en: 'RhomBus Publication'},
        handle: '',
        stat1_value: '12K',
        stat1_label: {bn: 'লাইক', en: 'likes'},
        stat2_value: '14K',
        stat2_label: {bn: 'ফলোয়ার', en: 'followers'},
        description: {bn: 'কোর্স আপডেট, স্পেশাল অফার এবং লাইভ সেশনের নোটিফিকেশন পেতে পেজ ফলো করুন', en: 'Follow the page to get course updates, special offers, and live session notifications'},
        ctaText: {bn: 'ফলো করুন', en: 'Follow Page'},
        ctaUrl: '#',
      },
    ]
  },
  notesBanner: {
    title: {
      bn: 'আমাদের নোট ও সাজেশন পড়ে প্রস্তুতি নাও!',
      en: 'Prepare with our notes and suggestions!'
    },
    description: {
      bn: 'সেরা নোট, লেকচার শিট ও গুরুত্বপূর্ণ সাজেশন খুঁজে নাও সহজেই।',
      en: 'Easily find the best notes, lecture sheets, and important suggestions.'
    },
    buttonText: {
      bn: 'সকল নোটস দেখুন',
      en: 'See All Notes'
    },
  },
  statsSectionTitle: {
    bn: 'আমাদের শিক্ষার্থীদের সাফল্য',
    en: 'Our Students\' Success'
  },
  stats: [
    { value: '১,২১৬+', label: { bn: 'মেডিকেল ও ডেন্টাল', en: 'Medical & Dental'} },
    { value: '৮৫+', label: { bn: 'বুয়েট', en: 'BUET'} },
    { value: '৯', label: { bn: 'আইবিএ (ঢাকা বিশ্ববিদ্যালয়)', en: 'IBA (Dhaka University)'} },
  ],
  appPromo: {
    title: {
      bn: 'যেকোনো জায়গায় বসে শিখুন, যখন যা প্রয়োজন!',
      en: 'Learn anywhere, anytime!'
    },
    description: {
      bn: 'আমাদের অ্যাপ ডাউনলোড করে স্মার্টফোনেই গুছিয়ে নিন আপনার সম্পূর্ণ প্রস্তুতি।',
      en: 'Download our app and prepare completely on your smartphone.'
    },
    imageUrl: 'https://placehold.co/400x500.png',
    googlePlayUrl: '#',
    appStoreUrl: '#',
  }
};
