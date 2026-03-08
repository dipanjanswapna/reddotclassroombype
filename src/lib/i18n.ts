/**
 * @fileOverview Internationalization (i18n) Dictionary.
 * Centralized translations for RDC Master Ecosystem.
 */
export const t: Record<string, Record<string, string>> = {
  // Navigation
  nav_home: { en: 'Home', bn: 'হোম' },
  nav_rdc_store: { en: 'RDC Store', bn: 'RDC স্টোর' },
  nav_courses: { en: 'Courses', bn: 'কোর্সসমূহ' },
  nav_admission_test: { en: 'Admission Test', bn: 'ভর্তি পরীক্ষা' },
  nav_offline_hub: { en: 'Offline Hub', bn: 'অফলাইন হাব' },
  nav_more: { en: 'More', bn: 'আরও' },
  nav_blog: { en: 'Blog', bn: 'ব্লগ' },
  nav_faq: { en: 'FAQ', bn: 'জিজ্ঞাসা' },
  nav_about: { en: 'About Us', bn: 'আমাদের সম্পর্কে' },
  nav_contact: { en: 'Contact', bn: 'যোগাযোগ' },
  nav_class_6_12: { en: 'Class 6-12', bn: '৬ষ্ঠ -১২শ শ্রেণী' },
  nav_skills: { en: 'Skills', bn: 'স্কিলস' },
  rdc_shop: { en: 'RDC Shop', bn: 'RDC শপ' },
  hotline: { en: 'Hotline', bn: 'হটলাইন' },
  login: { en: 'Login', bn: 'লগইন' },
  signup: { en: 'Sign Up', bn: 'নিবন্ধন' },
  register: { en: 'Register', bn: 'নিবন্ধন করুন' },
  dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
  
  // Header Info
  best_learning_platform: { en: 'Best Learning Platform', bn: 'সেরা লার্নিং প্ল্যাটফর্ম' },
  shop_description: { 
    en: 'Red Dot Classroom (RDC Shop) is a Dhaka, Bangladesh based online education center.', 
    bn: 'রেড ডট ক্লাসরুম (RDC শপ) ঢাকা, বাংলাদেশ ভিত্তিক একটি অনলাইন শিক্ষা কেন্দ্র।' 
  },

  // Login & Signup
  login_welcome: { en: 'Welcome back', bn: 'স্বাগতম' },
  login_desc: { en: 'Enter your credentials to access your portal.', bn: 'আপনার পোর্টালে প্রবেশ করতে তথ্য দিন।' },
  or_login_with_roll: { en: 'Or login with Class Roll', bn: 'অথবা ক্লাস রোল দিয়ে লগইন করুন' },
  class_roll: { en: 'Class Roll', bn: 'ক্লাস রোল' },
  password: { en: 'Password', bn: 'পাসওয়ার্ড' },
  find_roll_title: { en: 'Find Roll Number', bn: 'রোল নম্বর খুঁজুন' },
  find_roll_desc: { en: 'Enter your registered email to find your roll.', bn: 'আপনার রেজিস্টার্ড ইমেইল দিয়ে রোল খুঁজুন।' },
  email: { en: 'Email Address', bn: 'ইমেইল এড্রেস' },
  forgot_password: { en: 'Forgot password?', bn: 'পাসওয়ার্ড ভুলে গেছেন?' },
  email_login: { en: 'Email Login', bn: 'ইমেইল লগইন' },
  login_with_staff_id: { en: 'Login with Staff ID', bn: 'স্টাফ আইডি দিয়ে লগইন' },
  staff_id: { en: 'Staff Registration ID', bn: 'স্টাফ রেজিস্ট্রেশন আইডি' },
  no_account: { en: "Don't have an account?", bn: 'অ্যাকাউন্ট নেই?' },
  already_have_account: { en: 'Already have an account?', bn: 'আগে থেকেই অ্যাকাউন্ট আছে?' },
  create_account: { en: 'Create Account', bn: 'অ্যাকাউন্ট তৈরি করুন' },
  signup_desc: { en: 'Join thousands of students across Bangladesh.', bn: 'সারা দেশের হাজারো শিক্ষার্থীর সাথে যুক্ত হোন।' },
  or_continue_with: { en: 'Or continue with', bn: 'অথবা কন্টিনিউ করুন' },
  full_name: { en: 'Full Name', bn: 'পূর্ণ নাম' },
  registering_as: { en: 'Registering as', bn: 'নিবন্ধন করছেন' },
  student: { en: 'Student', bn: 'শিক্ষার্থী' },
  guardian: { en: 'Guardian', bn: 'অভিভাগক' },
  accept_terms: { en: 'I accept the Terms and Conditions', bn: 'আমি ব্যবহারের শর্তাবলী মেনে নিচ্ছি' },
  you_agree_to: { en: 'By signing up, you agree to our', bn: 'নিবন্ধন করার মাধ্যমে আপনি আমাদের' },
  terms_of_service: { en: 'Terms of Service', bn: 'ব্যবহারের শর্তাবলী' },
  and: { en: 'and', bn: 'এবং' },
  privacy_policy: { en: 'Privacy Policy', bn: 'গোপনীয়তা নীতি' },

  // Callback Form
  callback_title: { en: 'Request a callback', bn: 'কলব্যাক রিকোয়েস্ট করুন' },
  mobile_number: { en: 'Mobile Number', bn: 'মোবাইল নম্বর' },
  class_label: { en: 'Class', bn: 'ক্লাস' },
  your_goal: { en: 'Your Goal', bn: 'আপনার লক্ষ্য' },
  submit: { en: 'Submit', bn: 'জমা দিন' },

  // Role Applications
  become_a_teacher: { en: 'Become a Teacher', bn: 'শিক্ষক হিসেবে যোগ দিন' },
  become_a_seller: { en: 'Become a Seller', bn: 'সেলার হিসেবে যোগ দিন' },
  become_an_affiliate: { en: 'Become an Affiliate', bn: 'অ্যাফিলিয়েট হিসেবে যোগ দিন' },
  become_a_moderator: { en: 'Become a Moderator', bn: ' মডারেটর হিসেবে যোগ দিন' },
  teacher_signup_desc: { en: 'Apply to join our elite faculty team.', bn: 'আমাদের এলিট ফ্যাকাল্টি টিমে যোগ দিতে আবেদন করুন।' },
  affiliate_signup_desc: { en: 'Earn rewards by referring new students.', bn: 'রেফার করে ইনকাম করুন।' },
  moderator_signup_desc: { en: 'Help maintain our community standards.', bn: 'কমিউনিটির মান বজায় রাখতে সহায়তা করুন।' },
  submit_application: { en: 'Submit Application', bn: 'আবেদন জমা দিন' },
  confirm_password: { en: 'Confirm Password', bn: 'পাসওয়ার্ড নিশ্চিত করুন' },
  expertise_title: { en: 'Expertise / Title', bn: 'দক্ষতা / পদবী' },
  your_bio: { en: 'Your Biography', bn: 'আপনার সম্পর্কে' },

  // Password Reset
  forgot_password_q: { en: 'Forgot Password?', bn: 'পাসওয়ার্ড ভুলে গেছেন?' },
  password_reset_desc: { en: "Enter your email to receive a reset link.", bn: 'পাসওয়ার্ড रिसেট লিঙ্ক পেতে ইমেইল দিন।' },
  send_reset_link: { en: 'Send Reset Link', bn: 'রিসেট লিঙ্ক পাঠান' },
  back_to_login: { en: 'Back to Login', bn: 'লগইনে ফিরে যান' },

  // Common
  footer_tagline: { en: 'Quality education for every student in Bangladesh.', bn: 'বাংলাদেশের প্রতিটি শিক্ষার্থীর জন্য গুণগত শিক্ষা।' },
  quick_links: { en: 'Quick Links', bn: 'প্রয়োজনীয় লিঙ্ক' },
  for_students: { en: 'For Students', bn: 'শিক্ষার্থীদের জন্য' },
  student_guardian_login: { en: 'Student & Guardian Login', bn: 'শিক্ষার্থী ও অভিভাবক লগইন' },
  join_us: { en: 'Join Our Team', bn: 'আমাদের সাথে যোগ দিন' },
  legal: { en: 'Legal', bn: 'আইনগত' },
  copyright: { en: 'All rights reserved.', bn: 'সর্বস্বত্ব সংরক্ষিত।' },
  view_all: { en: 'View All', bn: 'সব দেখুন' },

  // Offline Hub
  offline_hubs_title: { en: 'RDC Physical Centers', bn: 'RDC ফিজিক্যাল সেন্টারসমূহ' },
  offline_hubs_subtitle: { en: 'Visit us at any of our state-of-the-art locations.', bn: 'আমাদের অত্যাধুনিক সেন্টারগুলো ভিজিট করুন।' },
  offline_hero_subtitle: { en: 'Experience the fusion of digital excellence and physical interaction.', bn: 'ডিজিটাল উৎকর্ষ এবং সরাসরি শিক্ষার এক অনন্য সমন্বয়।' },
  explore_programs: { en: 'Explore Programs', bn: 'প্রোগ্রামগুলো দেখুন' },
  find_center: { en: 'Find Center', bn: 'সেন্টার খুঁজুন' },
  multimedia_classrooms: { en: 'Multimedia Classrooms', bn: 'মাল্টিমিডিয়া ক্লাসরুম' },
  multimedia_desc: { en: 'Digital smart boards and high-speed connectivity.', bn: 'ডিজিটাল স্মার্ট বোর্ড এবং উচ্চগতির ইন্টারনেট সুবিধা।' },
  top_educators: { en: 'Top Educators', bn: 'সেরা শিক্ষকবৃন্দ' },
  top_educators_desc: { en: "Direct access to the country's elite mentors.", bn: 'দেশের শ্রেষ্ঠ মেন্টরদের কাছ থেকে সরাসরি শেখার সুযোগ।' },
  exam_environment: { en: 'Exam Environment', bn: 'পরীক্ষার পরিবেশ' },
  exam_environment_desc: { en: 'Standardized testing conditions for peak performance.', bn: 'সেরা প্রস্তুতির জন্য মানসম্মত পরীক্ষার পরিবেশ।' },
  our_programs_title: { en: 'Available Programs', bn: 'আমাদের প্রোগ্রামসমূহ' },
  our_programs_subtitle: { en: 'Pick your path to academic excellence.', bn: 'একাডেমিক সাফল্যের জন্য আপনার সঠিক কোর্সটি বেছে নিন।' },
  have_a_question: { en: 'Have a Question?', bn: 'কোনো প্রশ্ন আছে?' },
  talk_to_advisors: { en: 'Talk to our student advisors anytime.', bn: 'আমাদের স্টুডেন্ট অ্যাডভাইজারদের সাথে যেকোনো সময় কথা বলুন।' },
  call_now: { en: 'Call Now', bn: 'কল করুন' },
  message_whatsapp: { en: 'Message on WhatsApp', bn: 'হোয়াটসঅ্যাপে মেসেজ দিন' },

  // About Page Extras
  our_mission: { en: 'Our Mission', bn: 'আমাদের লক্ষ্য' },
  our_vision: { en: 'Our Vision', bn: 'আমাদের ভিশন' },
  core_values: { en: 'Core Values', bn: 'মূল লক্ষ্য' },
  visionary_team: { en: 'The Visionary Team', bn: 'ভিশনারি টিম' },
  philosophy: { en: 'Our Philosophy', bn: 'আমাদের দর্শন' },
  our_identity: { en: 'Our Identity', bn: 'আমাদের পরিচয়' },

  // Contact & Support Extras
  connect_with_us: { en: 'Connect With Us', bn: 'আমাদের সাথে যুক্ত হোন' },
  support_center: { en: 'Support Center', bn: 'সাপোর্ট সেন্টার' },
  call_us: { en: 'Call Us', bn: 'আমাদের কল করুন' },
  email_support: { en: 'Email Support', bn: 'ইমেইল সাপোর্ট' },
  our_office: { en: 'Our Office', bn: 'আমাদের অফিস' },
  send_message: { en: 'Send Message', bn: 'মেসেজ পাঠান' },
  support_hours: { en: 'Support Hours', bn: 'সাপোর্ট আওয়ার' },

  // Course Details Extras
  overview: { en: 'Overview', bn: 'ওভারভিউ' },
  instructors: { en: 'Instructors', bn: 'শিক্ষকবৃন্দ' },
  curriculum: { en: 'Curriculum', bn: 'কারিকুলাম' },
  syllabus: { en: 'Syllabus', bn: 'সিলেবাস' },
  payment_info: { en: 'Payment Process', bn: 'পেমেন্ট প্রক্রিয়া' },
  payment_desc: { en: 'Our payment process is very simple. You can pay via bKash, Nagad, Rocket or any card.', bn: 'আমাদের পেমেন্ট প্রক্রিয়া খুবই সহজ। আপনি বিকাশ, নগদ, রকেট বা কার্ডের মাধ্যমে পেমেন্ট করতে পারেন।' },
  cycles: { en: 'Cycles', bn: 'সাইকেল' },
  popular_courses: { en: 'Popular Courses', bn: 'জনপ্রিয় কোর্সসমূহ' },
  prebook_now: { en: 'Prebook Now', bn: 'প্রি-বুক করুন' },

  // Store Extras
  store_hub: { en: 'Store Hub', bn: 'স্টোর হাব' },
  all_products: { en: 'All Products', bn: 'সকল পণ্য' },
  search_placeholder: { en: 'Search for courses, books...', bn: 'কোর্স বা বই খুঁজুন...' },
  customer_feedback: { en: 'Customer Feedback', bn: 'ক্রেতাদের মতামত' },
  similar_items: { en: 'Similar Items', bn: 'একই ধরণের পণ্য' },

  // Teacher Extras
  teacher_bio: { en: 'Instructor Biography', bn: 'শিক্ষকের পরিচিতি' },
  teacher_courses: { en: 'My Courses', bn: 'আমার কোর্সসমূহ' },
  free_masterclasses: { en: 'Free Masterclasses', bn: 'ফ্রি মাস্টারক্লাস' },
  back_to_home: { en: 'Back to Home', bn: 'হোমে ফিরে যান' },
};
