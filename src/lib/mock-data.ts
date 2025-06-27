// This file acts as a mock database, centralizing all content.
// In a real-world application, this data would come from a database via an API.

import {
  Video,
  FileText,
  ClipboardList,
  HelpCircle,
  Trophy,
} from 'lucide-react';

export type Course = {
  id: string;
  title: string;
  description: string;
  instructor: { // Primary instructor
    name: string;
    title: string;
    avatarUrl: string;
    bio: string;
    dataAiHint: string;
  };
  instructors?: { // Multiple instructors for the course
    name: string;
    title: string;
    avatarUrl: string;
    dataAiHint: string;
  }[];
  imageUrl: string;
  dataAiHint: string;
  category: string;
  subCategory?: string;
  price: string;
  rating?: number;
  reviews?: number;
  whatYouWillLearn?: string[];
  syllabus?: { title: string; content: string }[];
  features?: string[];
  features_detailed?: { title: string; description: string }[];
  imageTitle?: string;
  classRoutine?: { day: string; subject: string; time: string }[];
  faqs?: { question: string; answer: string }[];
};


export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  dataAiHint: string;
  content: string;
};

export const courses: Course[] = [
  {
    id: '1',
    title: 'HSC 2025 ক্র্যাশ কোর্স - বিজ্ঞান',
    description: 'এইচএসসি ২০২৫ পরীক্ষার্থীদের জন্য পূর্ণাঙ্গ প্রস্তুতি নিশ্চিত করতে একটি সম্পূর্ণ অনলাইন ব্যাচ। অভিজ্ঞ শিক্ষকদের সাথে লাইভ ক্লাস, লেকচার শিট, এবং পরীক্ষার মাধ্যমে সেরা প্রস্তুতি নিন।',
    instructor: {
      name: 'Jubayer Ahmed',
      title: 'Lead Developer & Instructor',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Jubayer is a seasoned full-stack developer with over 10 years of experience building applications for high-growth startups and established tech companies.',
      dataAiHint: 'male teacher',
    },
    instructors: [
       { name: 'Jubayer Ahmed', title: 'Physics', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'male teacher' },
       { name: 'Sadia Islam', title: 'Chemistry', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'female teacher' },
       { name: 'Raihan Chowdhury', title: 'Math', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'male instructor' },
       { name: 'Ayesha Khan', title: 'Biology', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'female instructor' },
    ],
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'physics class',
    category: 'HSC',
    subCategory: 'বিজ্ঞান',
    price: 'BDT 4500',
    rating: 4.8,
    reviews: 120,
    whatYouWillLearn: [
        'Build enterprise-level React applications',
        'Master server-side rendering with Next.js',
        'Design and consume RESTful APIs',
        'Implement robust authentication and authorization',
        'Deploy applications using Docker and Vercel',
    ],
    syllabus: [
        { title: 'পদার্থবিজ্ঞান', content: 'ভৌত জগৎ ও পরিমাপ, ভেক্টর, গতিবিদ্যা, নিউটনীয় বলবিদ্যা, কাজ, ক্ষমতা ও শক্তি।' },
        { title: 'রসায়ন', content: 'ল্যাবরেটরির নিরাপদ ব্যবহার, গুণগত রসায়ন, মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন, রাসায়নিক পরিবর্তন।' },
        { title: 'উচ্চতর গণিত', content: 'ম্যাট্রিক্স ও নির্ণায়ক, ভেক্টর, সরলরেখা, বৃত্ত, বিন্যাস ও সমাবেশ।' },
        { title: 'জীববিজ্ঞান', content: 'কোষ ও এর গঠন, কোষ বিভাজন, অণুজীব, উদ্ভিদ শারীরতত্ত্ব, প্রাণী শারীরতত্ত্ব। ' },
    ],
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'ডেইলি এক্সাম', 'সাপ্তাহিক পরীক্ষা', 'প্রশ্ন-উত্তর সেশন', 'ফাইনাল মডেল টেস্ট'],
    features_detailed: [
        { title: 'লাইভ ক্লাস', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'লেকচার শীট', description: 'প্রতিটি ক্লাসের পর নোট' },
        { title: 'ডেইলি এক্সাম', description: 'দৈনিক অগ্রগতি যাচাই' },
        { title: 'সাপ্তাহিক পরীক্ষা', description: 'সাপ্তাহিক পরীক্ষার মাধ্যমে প্রস্তুতি' },
        { title: 'প্রশ্ন-উত্তর সেশন', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'ফাইনাল মডেল টেস্ট', description: 'চূড়ান্ত পরীক্ষার প্রস্তুতি' },
    ],
    imageTitle: 'PCMB',
    classRoutine: [
        { day: 'শনি', subject: 'পদার্থবিজ্ঞান', time: 'সন্ধ্যা ৭:০০' },
        { day: 'রবি', subject: 'রসায়ন', time: 'সন্ধ্যা ৭:০০' },
        { day: 'সোম', subject: 'উচ্চতর গণিত', time: 'সন্ধ্যা ৭:০০' },
        { day: 'মঙ্গল', subject: 'জীববিজ্ঞান', time: 'সন্ধ্যা ৭:০০' },
    ],
    faqs: [
        { question: 'কোর্সটি কীভাবে কিনব?', answer: 'আপনি "Enroll Now" বাটনে ক্লিক করে বিকাশ, নগদ বা কার্ডের মাধ্যমে পেমেন্ট করে কোর্সটি কিনতে পারেন।' },
        { question: 'ক্লাসগুলো কি লাইভ হবে?', answer: 'হ্যাঁ, সকল ক্লাস লাইভ অনুষ্ঠিত হবে এবং প্রতিটি ক্লাসের রেকর্ডেড ভিডিও পোর্টালে পাওয়া যাবে।' },
        { question: 'কোর্সের ম্যাটেরিয়ালগুলো কোথায় পাব?', answer: 'সকল লেকচার শীট এবং অন্যান্য রিসোর্স আপনার স্টুডেন্ট ড্যাশবোর্ডের "Resources" সেকশনে পাবেন।' }
    ]
  },
  {
    id: '2',
    title: 'Admission Test Prep (Medical)',
    description: 'A comprehensive course designed to help you ace the medical admission tests with in-depth lessons, practice questions, and mock tests.',
    instructor: {
      name: 'Dr. Sadia Islam',
      title: 'Medical Admission Specialist',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Sadia is a doctor and an experienced instructor who has helped hundreds of students get into their dream medical colleges.',
      dataAiHint: 'female doctor'
    },
    instructors: [
       { name: 'Dr. Sadia Islam', title: 'Biology', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'female doctor' },
       { name: 'Dr. Karim Ahmed', title: 'Chemistry', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'male doctor' },
       { name: 'Dr. Farzana Begum', title: 'Physics', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'female scientist' },
       { name: 'Mr. Anisul Haque', title: 'General Knowledge', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'male teacher' },
    ],
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'medical students',
    category: 'Admission',
    subCategory: 'Medical',
    price: 'BDT 5000',
    rating: 4.9,
    reviews: 250,
    features: ['বিষয়ভিত্তিক ক্লাস', 'প্রশ্নব্যাংক সলভ', 'ফাইনাল মডেল টেস্ট', 'লেকচার শীট', 'ডেইলি এক্সাম', 'সাপ্তাহিক পরীক্ষা'],
    imageTitle: 'Medical',
    features_detailed: [
        { title: 'লাইভ ক্লাস', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'লেকচার শীট', description: 'প্রতিটি ক্লাসের পর নোট' },
        { title: 'ডেইলি এক্সাম', description: 'দৈনিক অগ্রগতি যাচাই' },
        { title: 'সাপ্তাহিক পরীক্ষা', description: 'সাপ্তাহিক পরীক্ষার মাধ্যমে প্রস্তুতি' },
        { title: 'প্রশ্ন-উত্তর সেশন', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'ফাইনাল মডেল টেস্ট', description: ' চূড়ানত পরীক্ষার প্রস্তুতি' },
    ],
    syllabus: [
        { title: 'জীববিজ্ঞান', content: 'প্রাণী বৈচিত্র্য, কোষ ও টিস্যু, জেনেটিক্স, মানব শারীরতত্ত্ব, উদ্ভিদ বিজ্ঞান।' },
        { title: 'রসায়ন', content: 'জৈব রসায়ন, পরিমাণগত রসায়ন, তড়িৎ রসায়ন, পরিবেশ রসায়ন।' },
        { title: 'পদার্থবিজ্ঞান', content: 'আধুনিক পদার্থবিজ্ঞান, ভৌত আলোকবিজ্ঞান, চল তড়িৎ, চৌম্বক।' },
        { title: 'সাধারণ জ্ঞান ও ইংরেজি', content: 'বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলী, ইংরেজি গ্রামার ও ভোকাবুলারি।' },
    ],
    classRoutine: [
        { day: 'শনি', subject: 'জীববিজ্ঞান', time: 'সন্ধ্যা ৭:০০' },
        { day: 'সোম', subject: 'রসায়ন', time: 'সন্ধ্যা ৭:০০' },
        { day: 'বুধ', subject: 'পদার্থবিজ্ঞান', time: 'সন্ধ্যা ৭:০০' },
        { day: 'বৃহঃ', subject: 'সাধারণ জ্ঞান ও ইংরেজি', time: 'রাত ৯:০০' },
    ],
    faqs: [
        { question: 'মেডিকেল ভর্তি পরীক্ষার জন্য যোগ্যতা কী?', answer: 'সাধারণত এসএসসি এবং এইচএসসিতে জীববিজ্ঞানসহ নির্দিষ্ট জিপিএ প্রয়োজন হয়। বিস্তারিত সার্কুলারে উল্লেখ থাকে।' },
        { question: 'নেগেটিভ মার্কিং আছে কি?', answer: 'হ্যাঁ, মেডিকেল ভর্তি পরীক্ষায় প্রতিটি ভুল উত্তরের জন্য ০.২৫ নম্বর কাটা হয়।' },
        { question: 'এই কোর্সের ক্লাসগুলো রেকর্ডেড থাকবে?', answer: 'হ্যাঁ, প্রতিটি লাইভ ক্লাসের রেকর্ডিং আপনার ড্যাশবোর্ডে পাওয়া যাবে।' }
    ]
  },
  {
    id: '3',
    title: 'IELTS Preparation Course',
    description: 'Achieve your desired IELTS band score with our intensive preparation course covering all four modules: Listening, Reading, Writing, and Speaking.',
    instructor: {
        name: 'Raihan Chowdhury',
        title: 'Certified IELTS Trainer',
        avatarUrl: 'https://placehold.co/100x100',
        bio: 'Raihan has been teaching IELTS for over 8 years and has a proven track record of helping students achieve high scores.',
        dataAiHint: 'english teacher'
    },
    instructors: [
       { name: 'Raihan Chowdhury', title: 'Speaking & Writing', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'male instructor' },
       { name: 'Jessica Miller', title: 'Listening & Reading', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'female instructor' },
    ],
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'ielts exam',
    category: 'Language',
    price: 'BDT 3000',
    rating: 4.7,
    reviews: 180,
    features: [' রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ', 'মক টেস্ট', 'Speaking সেশন' ],
    imageTitle: 'IELTS Prep',
    features_detailed: [
        { title: 'Listening Module', description: 'Practice with real exam-like audio clips.' },
        { title: 'Reading Module', description: 'Learn strategies for different question types.' },
        { title: 'Writing Module', description: 'Master Task 1 and Task 2 with expert feedback.' },
        { title: 'Speaking Module', description: 'One-on-one practice sessions.' },
        { title: 'Mock Tests', description: 'Full-length mock tests to simulate exam conditions.' },
        { title: 'Strategy Sessions', description: 'Tips and tricks to maximize your score.' },
    ],
    syllabus: [
        { title: 'Listening', content: 'Introduction to listening skills, question types, note-taking, practice tests.' },
        { title: 'Reading', content: 'Skimming, scanning, understanding academic texts, practice with passages.' },
        { title: 'Writing', content: 'Analyzing Task 1 (graphs, charts), structuring Task 2 essays, vocabulary for writing.' },
        { title: 'Speaking', content: 'Part 1, Part 2 (cue card), and Part 3 practice, pronunciation, and fluency development.' },
    ],
    classRoutine: [
        { day: 'Flexible', subject: 'Recorded Modules', time: 'Anytime' },
        { day: 'Saturday', subject: 'Live Speaking Practice', time: '8:00 PM' },
    ],
    faqs: [
        { question: 'What is the duration of this course?', answer: 'This is a self-paced course with lifetime access to materials. Live sessions are held weekly.' },
        { question: 'Will I get a certificate?', answer: 'Yes, a certificate of completion is provided after you finish all the modules and mock tests.' },
    ]
  },
  {
    id: '4',
    title: 'Data Science with Python',
    description: 'Learn the fundamentals of data science and machine learning using Python. This course is perfect for beginners with no prior programming experience.',
    instructor: {
        name: 'Ayesha Khan',
        title: 'Data Scientist',
        avatarUrl: 'https://placehold.co/100x100',
        bio: 'Ayesha is a professional data scientist working in the tech industry, with a passion for teaching and sharing her knowledge.',
        dataAiHint: 'female programmer'
    },
     instructors: [
       { name: 'Ayesha Khan', title: 'Lead Instructor', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'female programmer' },
       { name: 'David Chen', title: 'Machine Learning Expert', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'male programmer' },
    ],
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'python code',
    category: 'Skills',
    price: 'BDT 5500',
    rating: 4.8,
    reviews: 300,
    features: [' রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ', 'প্রজেক্ট', 'সার্টিফিকেট' ],
    imageTitle: 'Data Science',
    features_detailed: [
        { title: 'Python Programming', description: 'Master the basics of Python for data analysis.' },
        { title: 'Data Analysis', description: 'Learn libraries like NumPy and Pandas.' },
        { title: 'Data Visualization', description: 'Create stunning charts with Matplotlib and Seaborn.' },
        { title: 'Machine Learning', description: 'Understand algorithms with Scikit-learn.' },
        { title: 'Real-world Projects', description: 'Apply your skills to solve practical problems.' },
        { title: 'Career Guidance', description: 'Get tips on building your data science portfolio.' },
    ],
    syllabus: [
        { title: 'Module 1: Python Basics', content: 'Variables, data types, loops, functions, and object-oriented programming.' },
        { title: 'Module 2: Data Manipulation with Pandas', content: 'DataFrames, data cleaning, grouping, and merging.' },
        { title: 'Module 3: Data Visualization', content: 'Creating plots, charts, and histograms to understand data.' },
        { title: 'Module 4: Introduction to Machine Learning', content: 'Supervised vs. unsupervised learning, regression, classification.' },
    ],
    classRoutine: [
        { day: 'Flexible', subject: 'All Modules (Recorded)', time: 'Anytime' },
        { day: 'Sunday', subject: 'Live Q&A Session', time: '9:00 PM' },
    ],
    faqs: [
        { question: 'Do I need any prior programming experience?', answer: 'No, this course is designed for absolute beginners.' },
        { question: 'What software will I need?', answer: 'You will need a computer with Python and Jupyter Notebook installed. We will guide you through the setup process.' },
    ]
  },
  {
    id: '5',
    title: 'SSC 2025 Online Batch',
    description: 'A complete online batch for SSC 2025 candidates covering all subjects with live classes, lecture sheets, and regular exams.',
    instructor: {
      name: 'Farhan Mahmud',
      title: 'Experienced SSC Tutor',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Farhan has been teaching for over 12 years and specializes in preparing students for public exams.',
      dataAiHint: 'male teacher'
    },
    instructors: [
       { name: 'Farhan Mahmud', title: 'General Math', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'male teacher' },
       { name: 'Nusrat Jahan', title: 'English', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'female teacher' },
    ],
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'classroom students',
    category: 'SSC',
    price: 'BDT 4000',
    rating: 4.7,
    reviews: 95,
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'প্র্যাকটিস', 'ফাইনাল মডেল টেস্ট', 'সাপ্তাহিক পরীক্ষা'],
    imageTitle: 'SSC 2025',
    features_detailed: [
        { title: 'লাইভ ক্লাস', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'লেকচার শীট', description: 'প্রতিটি ক্লাসের পর নোট' },
        { title: 'ডেইলি এক্সাম', description: 'দৈনিক অগ্রগতি যাচাই' },
        { title: 'সাপ্তাহিক পরীক্ষা', description: 'সাপ্তাহিক পরীক্ষার মাধ্যমে প্রস্তুতি' },
        { title: 'প্রশ্ন-উত্তর সেশন', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'ফাইনাল মডেল টেস্ট', description: ' চূড়ানত পরীক্ষার প্রস্তুতি' },
    ],
    syllabus: [
        { title: 'গণিত', content: 'বীজগণিত, জ্যামিতি, ত্রিকোণমিতি, এবং পরিমিতি।' },
        { title: 'ইংরেজি', content: 'Grammar, composition, seen and unseen passages.' },
        { title: 'বিজ্ঞান', content: 'পদার্থ, রসায়ন, এবং জীববিজ্ঞানের মৌলিক ধারণা।' },
        { title: 'বাংলাদেশ ও বিশ্বপরিচয়', content: ' ইতিহাস, ভূগোল, এবং নাগরিকত্ব।' },
    ],
    classRoutine: [
        { day: 'শনি', subject: 'গণিত', time: 'বিকাল ৫:০০' },
        { day: 'সোম', subject: 'ইংরেজি', time: 'বিকাল ৫:০০' },
        { day: 'বুধ', subject: 'বিজ্ঞান', time: 'বিকাল ৫:০০' },
    ],
    faqs: [
        { question: 'এই কোর্সটি কোন বোর্ডের জন্য?', answer: 'এই কোর্সটি বাংলাদেশের সকল শিক্ষা বোর্ডের সিলেবাস অনুযায়ী তৈরি করা হয়েছে।' },
        { question: 'ক্লাস মিস করলে কী হবে?', answer: 'প্রতিটি লাইভ ক্লাসের রেকর্ডিং আপনার ড্যাশবোর্ডে থাকবে, তাই আপনি যেকোনো সময় দেখে নিতে পারবেন।' }
    ]
  },
  {
    id: '6',
    title: 'HSC 2025 Commerce Batch',
    description: 'Join our comprehensive online batch for HSC 2025 commerce students. Get access to live classes, solve practice problems and clear your doubts.',
    instructor: {
      name: 'Nusrat Jahan',
      title: 'HSC Specialist',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Nusrat is a passionate educator with a knack for making complex topics easy to understand.',
      dataAiHint: 'female teacher'
    },
    instructors: [
       { name: 'Nusrat Jahan', title: 'Accounting', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'female teacher' },
       { name: 'Imran Khan', title: 'Finance', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'male teacher' },
    ],
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'lecture hall',
    category: 'HSC',
    subCategory: 'বাণিজ্য',
    price: 'BDT 4500',
    rating: 4.6,
    reviews: 80,
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'প্র্যাকটিস', 'ফাইনাল মডেল টেস্ট'],
    imageTitle: 'HSC 2025',
    features_detailed: [
        { title: 'লাইভ ক্লাস', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'লেকচার শীট', description: 'প্রতিটি ক্লাসের পর নোট' },
        { title: 'ডেইলি এক্সাম', description: 'দৈনিক অগ্রগতি যাচাই' },
        { title: 'সাপ্তাহিক পরীক্ষা', description: 'সাপ্তাহিক পরীক্ষার মাধ্যমে প্রস্তুতি' },
    ],
     syllabus: [
        { title: 'হিসাববিজ্ঞান', content: 'হিসাববিজ্ঞানের পরিচিতি, হিসাবের বইসমূহ, রেওয়ামিল, আর্থিক বিবরণী।' },
        { title: 'ফিন্যান্স, ব্যাংকিং ও বীমা', content: 'অর্থায়নের সূচনা, আর্থিক বাজার, ব্যাংকের পরিচিতি, বীমার ধারণা।' },
        { title: 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা', content: 'ব্যবসায়ের মৌলিক ধারণা, একমালিকানা ব্যবসায়, অংশীদারি ব্যবসায়, ব্যবস্থাপনা।' },
    ],
    classRoutine: [
        { day: 'রবি', subject: 'হিসাববিজ্ঞান', time: 'সন্ধ্যা ৭:০০' },
        { day: 'মঙ্গল', subject: 'ফিন্যান্স, ব্যাংকিং ও বীমা', time: 'সন্ধ্যা ৭:০০' },
        { day: 'বৃহঃ', subject: 'ব্যবসায় সংগঠন', time: 'সন্ধ্যা ৭:০০' },
    ],
    faqs: [
        { question: 'এই কোর্সটি কাদের জন্য?', answer: 'এই কোর্সটি এইচএসসি ২০২৫ এর বাণিজ্য বিভাগের শিক্ষার্থীদের জন্য।' },
        { question: 'কোর্সের মেয়াদ কতদিন?', answer: 'কোর্সটি এইচএসসি পরীক্ষা পর্যন্ত চলবে।' }
    ]
  },
  {
    id: '7',
    title: 'HSC ICT Masterclass',
    description: 'Master the HSC ICT syllabus with our recorded masterclass. Learn from the best and score high in your exams.',
    instructor: {
      name: 'Jubayer Ahmed',
      title: 'ICT Expert',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Jubayer is a seasoned full-stack developer with over 10 years of experience building applications for high-growth startups and established tech companies.',
      dataAiHint: 'male teacher'
    },
    instructors: [
       { name: 'Jubayer Ahmed', title: 'Lead Instructor', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'male teacher' },
    ],
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'computer circuit',
    category: 'HSC',
    price: 'BDT 2500',
    rating: 4.9,
    reviews: 150,
    features: ['রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ', 'সাপোর্ট সেশন'],
    imageTitle: 'HSC ICT',
    features_detailed: [
        { title: 'Chapter-wise Lectures', description: 'Detailed video lectures for all chapters.' },
        { title: 'Problem Solving', description: 'Creative question and programming problem solving.' },
        { title: 'CQ & MCQ Practice', description: 'Practice sessions for both types of questions.' },
        { title: '24/7 Support', description: 'Get your doubts cleared anytime in the support forum.' },
    ],
    syllabus: [
        { title: 'Chapter 1: Information & Communication Technology', content: 'World Village, Virtual Reality, AI.' },
        { title: 'Chapter 3: Number Systems & Digital Devices', content: 'Binary, Octal, Hexadecimal, Logic Gates.' },
        { title: 'Chapter 4: Introduction to HTML', content: 'Web design basics, tags, tables, forms.' },
        { title: 'Chapter 5: Programming Language', content: 'Introduction to C programming, loops, arrays, functions.' },
    ],
    classRoutine: [
        { day: 'Flexible', subject: 'All Modules (Recorded)', time: 'Anytime' },
    ],
    faqs: [
        { question: 'Is this course enough for A+?', answer: 'Yes, this course covers the entire syllabus in-depth and is designed to help you achieve the highest grade.' },
    ]
  },
  {
    id: '8',
    title: 'Graphic Design Fundamentals',
    description: 'Learn the basics of graphic design including Photoshop, Illustrator, and Figma. Build a strong portfolio to start your design career.',
    instructor: {
      name: 'Sadia Islam',
      title: 'Professional Graphic Designer',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Sadia is a creative designer with a passion for visual storytelling and teaching design principles.',
      dataAiHint: 'female artist'
    },
    instructors: [
       { name: 'Sadia Islam', title: 'Lead Designer', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'female artist' },
    ],
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'graphic design',
    category: 'Skills',
    price: 'BDT 3500',
    rating: 4.8,
    reviews: 210,
    features: ['ফটোশপ', 'ইলাস্ট্রেটর', 'ফিigma', 'ফ্রিল্যান্সিং গাইডলাইন'],
    imageTitle: 'Graphics',
    features_detailed: [
        { title: 'Adobe Photoshop', description: 'Photo editing, manipulation, and digital art.' },
        { title: 'Adobe Illustrator', description: 'Vector graphics, logo design, and illustrations.' },
        { title: 'Figma', description: 'UI/UX design for web and mobile apps.' },
        { title: 'Design Principles', description: 'Learn about color theory, typography, and layout.' },
        { title: 'Portfolio Building', description: 'Create a professional portfolio to showcase your work.' },
        { title: 'Freelancing', description: 'Learn how to start your career as a freelance designer.' },
    ],
    syllabus: [
        { title: 'Module 1: Introduction to Design', content: 'Elements and principles of design.' },
        { title: 'Module 2: Mastering Photoshop', content: 'Tools, layers, masks, and projects.' },
        { title: 'Module 3: Vector Art with Illustrator', content: 'Pen tool, shapes, gradients, and branding projects.' },
        { title: 'Module 4: UI/UX with Figma', content: 'Wireframing, prototyping, and creating user interfaces.' },
    ],
    classRoutine: [
        { day: 'Flexible', subject: 'All Modules (Recorded)', time: 'Anytime' },
        { day: 'Friday', subject: 'Live Project Review', time: '8:00 PM' },
    ],
    faqs: [
        { question: 'Do I need a powerful computer for this course?', answer: 'A mid-range computer that can run Adobe software smoothly is recommended.' },
        { question: 'Will I get any software?', answer: 'We do not provide software. Students need to have their own licensed copies of Adobe Photoshop and Illustrator.' },
    ]
  },
  {
    id: '9',
    title: 'Engineering Admission',
    description: 'Prepare for engineering university admission tests with our specialized course. Cover Physics, Chemistry, and Higher Math in detail.',
    instructor: {
      name: 'Jubayer Ahmed',
      title: 'Engineering Admission Expert',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Jubayer is a seasoned full-stack developer with over 10 years of experience building applications for high-growth startups and established tech companies.',
      dataAiHint: 'male engineer'
    },
    instructors: [
       { name: 'Jubayer Ahmed', title: 'Physics', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'male engineer' },
       { name: 'Dr. Sadia Islam', title: 'Chemistry', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'female scientist' },
       { name: 'Raihan Chowdhury', title: 'Math', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'male teacher' },
    ],
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'engineering drawing',
    category: 'Admission',
    subCategory: 'Engineering',
    price: 'BDT 5000',
    rating: 4.8,
    reviews: 280,
    features: ['ফিজিক্স', 'ক্যামিস্ট্রি', 'হায়ার ম্যাথ', 'প্রশ্নব্যাংক সলভ', 'মডেল টেস্ট'],
    imageTitle: 'Engineering',
    features_detailed: [
        { title: 'লাইভ ক্লাস', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'প্রশ্নব্যাংক সলভ', description: 'বিগত বছরের প্রশ্ন সমাধান' },
        { title: 'ডেইলি এক্সাম', description: 'দৈনিক অগ্রগতি যাচাই' },
        { title: 'সাপ্তাহিক পরীক্ষা', description: 'সাপ্তাহিক পরীক্ষার মাধ্যমে প্রস্তুতি' },
        { title: 'শর্টকাট টেকনিক', description: 'দ্রুত প্রব্লেম সলভ করার কৌশল' },
        { title: 'ফাইনাল মডেল টেস্ট', description: ' চূড়ান্ত পরীক্ষার প্রস্তুতি' },
    ],
    syllabus: [
        { title: 'Physics', content: 'Mechanics, Electromagnetism, Modern Physics, and problem-solving sessions.' },
        { title: 'Chemistry', content: 'Organic Chemistry, Inorganic Chemistry, Physical Chemistry concepts and practice.' },
        { title: 'Higher Math', content: 'Calculus, Matrices, Complex Numbers, Analytical Geometry, and advanced topics.' },
    ],
    classRoutine: [
        { day: 'শনি-সোম-বুধ', subject: 'Physics, Chemistry, Math', time: 'রাত ৮:০০' },
    ],
    faqs: [
        { question: 'Is this course suitable for BUET admission?', answer: 'Yes, this course is designed to cover the syllabus of all major engineering universities in Bangladesh, including BUET, KUET, RUET, and CUET.' },
        { question: 'How many model tests are included?', answer: 'There are over 20 model tests included in this course.' },
    ]
  },
  {
    id: '10',
    title: 'University (Ka unit) Admission',
    description: 'A complete guide for Dhaka University Ka-unit admission test. Prepare with the best mentors and materials.',
    instructor: {
      name: 'Farhan Mahmud',
      title: 'DU Admission Mentor',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Farhan has been teaching for over 12 years and specializes in preparing students for public exams.',
      dataAiHint: 'male teacher'
    },
    instructors: [
       { name: 'Farhan Mahmud', title: 'Lead Mentor', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'male teacher' },
    ],
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'university building',
    category: 'Admission',
    price: 'BDT 5000',
    rating: 4.7,
    reviews: 220,
    features: ['বিষয়ভিত্তিক ক্লাস', 'প্রশ্নব্যাংক সলভ', 'ফাইনাল মডেল টেস্ট'],
    imageTitle: 'DU Ka Unit',
    features_detailed: [
        { title: 'লাইভ ক্লাস', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'প্রশ্নব্যাংক সলভ', description: 'বিগত বছরের প্রশ্ন সমাধান' },
        { title: 'এক্সাম', description: 'প্রস্তুতি যাচাই' },
        { title: 'মডেল টেস্ট', description: ' চূড়ান্ত পরীক্ষার প্রস্তুতি' },
    ],
    syllabus: [
        { title: 'Physics', content: 'HSC syllabus based in-depth lectures.' },
        { title: 'Chemistry', content: 'HSC syllabus based in-depth lectures.' },
        { title: 'Math', content: 'HSC syllabus based in-depth lectures.' },
        { title: 'Biology', content: 'HSC syllabus based in-depth lectures.' },
    ],
    classRoutine: [
        { day: 'প্রতিদিন', subject: 'লাইভ ক্লাস ও পরীক্ষা', time: 'সন্ধ্যা ৭:৩০' },
    ],
    faqs: [
        { question: 'How is this course different?', answer: 'We focus on the specific patterns of DU Ka-unit questions and provide exclusive shortcut techniques.' },
    ]
  },
  {
    id: '11',
    title: 'BCS Preliminary Course',
    description: 'Prepare for the BCS preliminary exam with our comprehensive course covering all subjects.',
    instructor: {
      name: 'Raihan Chowdhury',
      title: 'BCS Cadre Officer',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Raihan has been teaching for over 8 years and has a proven track record of helping students achieve high scores.',
      dataAiHint: 'government official'
    },
    instructors: [
       { name: 'Raihan Chowdhury', title: 'Lead Instructor', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'government official' },
    ],
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'government building',
    category: 'Job Prep',
    price: 'BDT 4000',
    rating: 4.8,
    reviews: 400,
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'ডেইলি এক্সাম', 'মডেল টেস্ট'],
    imageTitle: 'BCS Preli',
    features_detailed: [
        { title: 'Subject-wise Classes', description: 'Detailed classes on all 10 subjects.' },
        { title: 'PDF Lecture Sheets', description: 'Downloadable notes for every class.' },
        { title: 'Regular Exams', description: 'Quizzes and exams to track your progress.' },
        { title: 'Final Model Tests', description: 'Prepare for the final exam with full-length model tests.' },
    ],
    syllabus: [
        { title: 'Bangla & English', content: 'Language and literature.' },
        { title: 'Bangladesh & International Affairs', content: 'Current events, history, and geography.' },
        { title: 'General Science & ICT', content: 'Basic science concepts and computer literacy.' },
        { title: 'Mathematical Reasoning & Mental Ability', content: 'Problem-solving and analytical skills.' },
    ],
    classRoutine: [
        { day: 'Friday & Saturday', subject: 'Live Classes', time: '10:00 AM & 8:00 PM' },
    ],
    faqs: [
        { question: 'Is this course enough for the preliminary exam?', answer: 'Yes, this course comprehensively covers all the topics required for the BCS preliminary exam.' },
    ]
  },
  {
    id: '12',
    title: 'Bank Job Preparation',
    description: 'A complete course for bank job seekers. Cover math, english, general knowledge and analytical skills.',
    instructor: {
      name: 'Ayesha Khan',
      title: 'Bank Officer',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Ayesha is a professional data scientist working in the tech industry, with a passion for teaching and sharing her knowledge.',
      dataAiHint: 'female banker'
    },
    instructors: [
       { name: 'Ayesha Khan', title: 'Lead Instructor', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'female banker' },
    ],
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'bank interior',
    category: 'Job Prep',
    price: 'BDT 3500',
    rating: 4.7,
    reviews: 350,
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'ডেইলি এক্সাম', 'ভাইভা টিপস'],
    imageTitle: 'Bank Job',
    features_detailed: [
        { title: 'Math Classes', description: 'Shortcut techniques for quick problem-solving.' },
        { title: 'English Classes', description: 'Focus on grammar, vocabulary, and writing.' },
        { title: 'General Knowledge', description: 'Covering recent and important topics.' },
        { title: 'Mock Tests', description: 'Simulate real bank job exams.' },
    ],
    syllabus: [
        { title: 'Quantitative Aptitude', content: 'Arithmetic, Algebra, Geometry.' },
        { title: 'English Language', content: 'Grammar, Comprehension, Vocabulary.' },
        { title: 'General Awareness', content: 'Current affairs, banking industry knowledge.' },
        { title: 'Analytical Ability', content: 'Puzzles, data interpretation.' },
    ],
    classRoutine: [
        { day: 'Sunday & Tuesday', subject: 'Live Classes', time: '9:00 PM' },
    ],
    faqs: [
        { question: 'Which banks does this course cover?', answer: 'This course is designed for the recruitment exams of all government and private banks in Bangladesh.' },
    ]
  },
  {
    id: '13',
    title: 'HSC 25 Online Batch - Arts',
    category: 'এইচএসসি ২৫ অনলাইন ব্যাচ',
    subCategory: 'মানবিক',
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'প্র্যাকটিস', 'ফাইনাল মডেল টেস্ট'],
    price: '৳ ৪২০০',
    imageTitle: 'মানবিক শাখা',
    imageUrl: 'https://placehold.co/300x400',
    dataAiHint: 'history book',
    description: 'A complete online batch for HSC 2025 Arts students covering all subjects with live classes, lecture sheets, and regular exams.',
    instructor: {
      name: 'Nusrat Jahan',
      title: 'HSC Specialist',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Nusrat is a passionate educator with a knack for making complex topics easy to understand.',
      dataAiHint: 'female teacher'
    },
    instructors: [
       { name: 'Nusrat Jahan', title: 'History', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'female teacher' },
       { name: 'Imran Khan', title: 'Civics', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'male teacher' },
    ],
    rating: 4.5,
    reviews: 70,
    features_detailed: [
        { title: 'লাইভ ক্লাস', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'লেকচার শীট', description: 'প্রতিটি ক্লাসের পর নোট' },
        { title: 'ডেইলি এক্সাম', description: 'দৈনিক অগ্রগতি যাচাই' },
        { title: 'সাপ্তাহিক পরীক্ষা', description: 'সাপ্তাহিক পরীক্ষার মাধ্যমে প্রস্তুতি' },
    ],
    syllabus: [
        { title: 'ইতিহাস', content: 'বাংলার ইতিহাস, ইউরোপের ইতিহাস, এবং বিশ্ব ইতিহাস।' },
        { title: 'পৌরনীতি ও সুশাসন', content: 'মৌলিক ধারণা, সরকার, সংবিধান, এবং রাজনৈতিক ব্যবস্থা।' },
        { title: 'অর্থনীতি', content: 'মৌলিক অর্থনৈতিক ধারণা, চাহিদা ও জোগান, বাজার।' },
        { title: 'যুক্তিবিদ্যা', content: 'যুক্তিবিদ্যার পরিচিতি, অবরোহ ও আরোহ অনুমান।' },
    ],
    classRoutine: [
        { day: 'রবি', subject: 'ইতিহাস', time: 'বিকাল ৪:০০' },
        { day: 'মঙ্গল', subject: 'পৌরনীতি', time: 'বিকাল ৪:০০' },
        { day: 'বৃহঃ', subject: 'অর্থনীতি', time: 'বিকাল ৪:০০' },
    ],
    faqs: [
        { question: 'Will this course cover all subjects for the Arts group?', answer: 'Yes, this course covers all compulsory and major subjects for the HSC Arts stream.' },
    ]
  },
  {
    id: '14',
    title: 'HSC Physics Subject Course',
    category: 'বিষয়ভিত্তিক কোর্স',
    price: '৳ ৭৫০',
    imageTitle: 'PHYSICS',
    imageUrl: 'https://placehold.co/300x400',
    dataAiHint: 'physics equation',
    features: ['রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ', 'সাপোর্ট সেশন'],
    description: 'Master Physics for your HSC exams with our detailed subject-based course. Access recorded classes, lecture sheets, and quizzes anytime.',
    instructor: {
      name: 'Jubayer Ahmed',
      title: 'Physics Expert',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Jubayer is a seasoned full-stack developer with over 10 years of experience building applications for high-growth startups and established tech companies.',
      dataAiHint: 'male teacher'
    },
    instructors: [
       { name: 'Jubayer Ahmed', title: 'Instructor', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'male teacher' },
    ],
    rating: 4.9,
    reviews: 180,
    features_detailed: [
        { title: 'Chapter-wise Videos', description: 'In-depth recorded lectures for each chapter.' },
        { title: 'Concept Clarity', description: 'Focus on building strong conceptual understanding.' },
        { title: 'Problem Solving', description: 'Solutions to a wide range of creative questions.' },
        { title: 'Doubt Clearing', description: 'Dedicated sessions to clear your doubts.' },
    ],
    syllabus: [
        { title: 'Physics 1st Paper', content: 'Vectors, Dynamics, Newtonian Mechanics, Work Power Energy, Gravitation, etc.' },
        { title: 'Physics 2nd Paper', content: 'Thermal Physics, Static Electricity, Current Electricity, Modern Physics, etc.' },
    ],
    classRoutine: [
        { day: 'Flexible', subject: 'All Modules (Recorded)', time: 'Anytime' },
    ],
    faqs: [
        { question: 'Is this course recorded or live?', answer: 'This is a fully recorded course, so you can learn at your own pace.' },
    ]
  },
   {
    id: '15',
    title: 'টেস্ট পেপার সলভ - বিজ্ঞান',
    category: 'টেস্ট পেপার সলভ',
    subCategory: 'বিজ্ঞান',
    price: '৳ ৯৫০',
    imageTitle: 'বিজ্ঞান শাখা',
    imageUrl: 'https://placehold.co/300x400',
    dataAiHint: 'exam paper',
    features: ['ফিজিক্স', 'ক্যামিস্ট্রি', 'বায়োলজি', 'হায়ার ম্যাথ'],
    description: 'Solve test papers for the science stream with our expert teachers. Get ready for your final exams with confidence.',
    instructor: {
        name: 'Sadia Islam',
        title: 'Exam Specialist',
        avatarUrl: 'https://placehold.co/100x100',
        bio: 'Sadia is a doctor and an experienced instructor who has helped hundreds of students get into their dream medical colleges.',
        dataAiHint: 'female doctor'
    },
    instructors: [
       { name: 'Sadia Islam', title: 'Biology', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'female doctor' },
       { name: 'Jubayer Ahmed', title: 'Physics & Math', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'male teacher' },
    ],
    rating: 4.8,
    reviews: 130,
    features_detailed: [
        { title: 'Live Solving Classes', description: 'Solve top college test papers live with teachers.' },
        { title: 'PDF Solve Sheets', description: 'Get detailed PDF solutions for every question.' },
        { title: 'Time Management', description: 'Learn how to manage your time effectively in exams.' },
        { title: 'Suggestion', description: 'Get important suggestions before your exam.' },
    ],
    syllabus: [
        { title: 'Physics', content: 'Solving test papers from top colleges.' },
        { title: 'Chemistry', content: 'Solving test papers from top colleges.' },
        { title: 'Higher Math', content: 'Solving test papers from top colleges.' },
        { title: 'Biology', content: 'Solving test papers from top colleges.' },
    ],
    classRoutine: [
        { day: 'Daily', subject: 'Live Solving Class', time: '8:30 PM' },
    ],
    faqs: [
        { question: 'Which test papers will be solved?', answer: 'We will be solving test papers from renowned colleges across the country.' },
    ]
  },
  {
    id: '16',
    title: 'মাস্টার কোর্স - ওয়েব ডেভেলপমেন্ট',
    category: 'মাস্টার কোর্স',
    price: 'Free',
    imageTitle: 'ওয়েব ডেভেলপমেন্ট',
    imageUrl: 'https://placehold.co/300x400',
    dataAiHint: 'programming code',
    features: ['HTML', 'CSS', 'JavaScript', 'Bootstrap'],
    description: 'Learn the basics of web development for free. Start your journey into the world of coding with our master course.',
    instructor: {
        name: 'Jubayer Ahmed',
        title: 'Lead Developer & Instructor',
        avatarUrl: 'https://placehold.co/100x100',
        bio: 'Jubayer is a seasoned full-stack developer with over 10 years of experience building applications for high-growth startups and established tech companies.',
        dataAiHint: 'male teacher'
    },
    instructors: [
       { name: 'Jubayer Ahmed', title: 'Instructor', avatarUrl: 'https://placehold.co/100x100', dataAiHint: 'male teacher' },
    ],
    rating: 4.9,
    reviews: 500,
    features_detailed: [
        { title: 'HTML5', description: 'Learn the structure of web pages.' },
        { title: 'CSS3', description: 'Style your web pages and create beautiful layouts.' },
        { title: 'JavaScript', description: 'Make your web pages interactive.' },
        { title: 'Bootstrap 5', description: 'Build responsive websites quickly.' },
    ],
    syllabus: [
        { title: 'HTML', content: 'Tags, attributes, forms, and semantic HTML.' },
        { title: 'CSS', content: 'Selectors, box model, Flexbox, Grid, and responsive design.' },
        { title: 'JavaScript', content: 'Variables, data types, DOM manipulation, and events.' },
    ],
    classRoutine: [
        { day: 'Flexible', subject: 'All Modules (Recorded)', time: 'Anytime' },
    ],
    faqs: [
        { question: 'Is this course really free?', answer: 'Yes, this master course is completely free of charge.' },
        { question: 'Will I get a certificate?', answer: 'Yes, you will receive a certificate of completion after finishing the course.' },
    ]
  }
];

export const blogPosts: BlogPost[] = [
    {
        slug: "study-tips-for-hsc",
        title: "Effective Study Tips for HSC Candidates",
        excerpt: "Discover proven strategies to boost your preparation for the upcoming HSC exams and achieve your desired results.",
        imageUrl: "https://placehold.co/600x400",
        dataAiHint: "student studying",
        content: `
        <p>The HSC exam is a significant milestone in a student's life in Bangladesh. Proper preparation is key to success. Here are some effective study tips to help you excel:</p>
        <h3 class="font-bold text-lg mt-4 mb-2">1. Create a Realistic Study Routine</h3>
        <p>A well-planned routine is the first step towards effective preparation. Allocate specific time slots for each subject, and make sure to include short breaks to avoid burnout. Consistency is more important than long hours of study.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">2. Understand, Don't Just Memorize</h3>
        <p>Focus on understanding the core concepts rather than rote memorization. This will help you answer creative and analytical questions, which are common in the HSC syllabus.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">3. Practice with Test Papers</h3>
        <p>Solving previous years' question papers and model tests is crucial. It helps you understand the exam pattern, manage your time effectively, and identify your weak areas.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">4. Stay Healthy</h3>
        <p>Don't neglect your health. Ensure you get enough sleep, eat nutritious food, and engage in some form of physical activity. A healthy mind resides in a healthy body.</p>
        <p class="mt-4">By following these tips, you can significantly improve your preparation and confidence for the HSC exams. Good luck!</p>
        `
    },
    {
        slug: "choosing-university-subject",
        title: "How to Choose the Right University Subject for You",
        excerpt: "A comprehensive guide to help you navigate the difficult decision of choosing a subject for your university studies.",
        imageUrl: "https://placehold.co/600x400",
        dataAiHint: "university campus",
        content: `
        <p>Choosing a university subject is one of the most critical decisions of your life. It can shape your career and future. Here’s a guide to help you make an informed choice:</p>
        <h3 class="font-bold text-lg mt-4 mb-2">1. Assess Your Interests and Passions</h3>
        <p>What subjects do you genuinely enjoy studying? Think about what you are passionate about. Studying a subject you love will make your university years more enjoyable and fulfilling.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">2. Consider Your Strengths</h3>
        <p>Identify your academic strengths. Are you good at analytical thinking, creative tasks, or problem-solving? Choose a subject that plays to your strengths.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">3. Research Career Prospects</h3>
        <p>Look into the career opportunities associated with different subjects. What kind of jobs can you get? What is the potential for growth? Websites like LinkedIn and job portals can be excellent resources.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">4. Talk to People</h3>
        <p>Speak with current university students, recent graduates, and professionals in fields that interest you. Their insights and experiences can be invaluable.</p>
        <p class="mt-4">Making this decision takes time, so start early and do thorough research. Choose wisely, and you'll be on the path to a successful and satisfying career.</p>
        `
    },
    {
        slug: "importance-of-skills-development",
        title: "The Importance of Skill Development Beyond Academics",
        excerpt: "Learn why developing practical skills is crucial for your career and how you can get started today.",
        imageUrl: "https://placehold.co/600x400",
        dataAiHint: "person coding",
        content: `
        <p>In today's competitive job market, academic qualifications alone are often not enough. Developing practical skills is essential for career success. Here's why:</p>
        <h3 class="font-bold text-lg mt-4 mb-2">1. Enhances Employability</h3>
        <p>Employers look for candidates who can hit the ground running. Skills like coding, graphic design, digital marketing, or public speaking make you a more attractive candidate.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">2. Fosters Adaptability</h3>
        <p>The world is changing rapidly. New technologies and industries are emerging constantly. Having a diverse skill set makes you more adaptable to these changes and new opportunities.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">3. Boosts Confidence</h3>
        <p>Mastering a new skill can be a great confidence booster. It proves that you are a capable learner and can take on new challenges.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">How to Get Started?</h3>
        <p>Platforms like Red Dot Classroom offer a wide range of skill development courses. You can learn coding, design, languages, and much more from the comfort of your home. Start today and invest in your future.</p>
        `
    },
];
