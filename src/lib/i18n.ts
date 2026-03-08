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
    en: 'Red Dot Classroom (RDC Shop) is a Dhaka, Bangladesh based online education center specializing in providing high-quality educational resources to students nationwide.', 
    bn: 'রেড ডট ক্লাসরুম (RDC শপ) ঢাকা, বাংলাদেশ ভিত্তিক একটি অনলাইন শিক্ষা কেন্দ্র, যা সারা দেশের শিক্ষার্থীদের উচ্চ-মানের শিক্ষামূলক সম্পদ প্রদানে বিশেষজ্ঞ।' 
  },

  // Login Page
  login_welcome: { en: 'Welcome Back', bn: 'স্বাগতম' },
  login_desc: { en: 'Enter your credentials to access your portal.', bn: 'আপনার পোর্টালে প্রবেশ করতে তথ্য দিন।' },
  or_login_with_roll: { en: 'Or login with Class Roll', bn: 'অথবা ক্লাস রোল দিয়ে লগইন করুন' },
  class_roll: { en: 'Class Roll', bn: 'ক্লাস রোল' },
  password: { en: 'Password', bn: 'পাসওয়ার্ড' },
  find_roll_title: { en: 'Find Roll Number', bn: 'রোল নম্বর খুঁজুন' },
  find_roll_desc: { en: 'Enter your registered email to find your roll.', bn: 'আপনার রেজিস্টার্ড ইমেইল দিয়ে রোল খুঁজুন।' },
  email: { en: 'Email Address', bn: 'ইমেইল এড্রেস' },
  forgot_password: { en: 'Forgot Password?', bn: 'পাসওয়ার্ড ভুলে গেছেন?' },
  email_login: { en: 'Email Login', bn: 'ইমেইল লগইন' },
  login_with_staff_id: { en: 'Login with Staff ID', bn: 'স্টাফ আইডি দিয়ে লগইন' },
  staff_id: { en: 'Staff Registration ID', bn: 'স্টাফ রেজিস্ট্রেশন আইডি' },
  no_account: { en: "Don't have an account?", bn: 'অ্যাকাউন্ট নেই?' },
  already_have_account: { en: 'Already have an account?', bn: 'আগে থেকেই অ্যাকাউন্ট আছে?' },

  // Signup Page
  create_account: { en: 'Create Account', bn: 'অ্যাকাউন্ট তৈরি করুন' },
  signup_desc: { en: 'Join thousands of students across Bangladesh.', bn: 'সারা দেশের হাজারো শিক্ষার্থীর সাথে যুক্ত হোন।' },
  or_continue_with: { en: 'Or continue with', bn: 'অথবা কন্টিনিউ করুন' },
  full_name: { en: 'Full Name', bn: 'পূর্ণ নাম' },
  registering_as: { en: 'Registering as', bn: 'নিবন্ধন করছেন' },
  student: { en: 'Student', bn: 'শিক্ষার্থী' },
  guardian: { en: 'Guardian', bn: 'অভিভাবক' },
  accept_terms: { en: 'I accept the Terms and Conditions', bn: 'আমি ব্যবহারের শর্তাবলী মেনে নিচ্ছি' },
  you_agree_to: { en: 'By signing up, you agree to our', bn: 'নিবন্ধন করার মাধ্যমে আপনি আমাদের' },
  terms_of_service: { en: 'Terms of Service', bn: 'ব্যবহারের শর্তাবলী' },
  and: { en: 'and', bn: 'এবং' },
  privacy_policy: { en: 'Privacy Policy', bn: 'গোপনীয়তা নীতি' },

  // Role Applications
  become_a_teacher: { en: 'Become a Teacher', bn: 'শিক্ষক হিসেবে যোগ দিন' },
  become_a_seller: { en: 'Become a Seller', bn: 'সেলার হিসেবে যোগ দিন' },
  become_an_affiliate: { en: 'Become an Affiliate', bn: 'অ্যাফিলিয়েট হিসেবে যোগ দিন' },
  become_a_moderator: { en: 'Become a Moderator', bn: 'মডারেটর হিসেবে যোগ দিন' },
  teacher_signup_desc: { en: 'Apply to join our elite faculty team.', bn: 'আমাদের এলিট ফ্যাকাল্টি টিমে যোগ দিতে আবেদন করুন।' },
  affiliate_signup_desc: { en: 'Earn rewards by referring new students.', bn: 'রেফার করে ইনকাম করুন।' },
  moderator_signup_desc: { en: 'Help maintain our community standards.', bn: 'কমিউনিটির মান বজায় রাখতে সহায়তা করুন।' },
  submit_application: { en: 'Submit Application', bn: 'আবেদন জমা দিন' },
  confirm_password: { en: 'Confirm Password', bn: 'পাসওয়ার্ড নিশ্চিত করুন' },
  expertise_title: { en: 'Expertise / Title', bn: 'দক্ষতা / পদবী' },
  your_bio: { en: 'Your Biography', bn: 'আপনার সম্পর্কে' },

  // Password Reset
  forgot_password_q: { en: 'Forgot Password?', bn: 'পাসওয়ার্ড ভুলে গেছেন?' },
  password_reset_desc: { en: "Enter your email to receive a reset link.", bn: 'পাসওয়ার্ড রিসেট লিঙ্ক পেতে ইমেইল দিন।' },
  send_reset_link: { en: 'Send Reset Link', bn: 'রিসেট লিঙ্ক পাঠান' },
  back_to_login: { en: 'Back to Login', bn: 'লগইনে ফিরে যান' },

  // Sections
  footer_tagline: { en: 'Quality education for every student in Bangladesh.', bn: 'বাংলাদেশের প্রতিটি শিক্ষার্থীর জন্য গুণগত শিক্ষা।' },
  quick_links: { en: 'Quick Links', bn: 'প্রয়োজনীয় লিঙ্ক' },
  for_students: { en: 'For Students', bn: 'শিক্ষার্থীদের জন্য' },
  student_guardian_login: { en: 'Student & Guardian Login', bn: 'শিক্ষার্থী ও অভিভাবক লগইন' },
  join_us: { en: 'Join Our Team', bn: 'আমাদের সাথে যোগ দিন' },
  teacher_seller_staff_login: { en: 'Staff & Seller Login', bn: 'স্টাফ ও সেলার লগইন' },
  legal: { en: 'Legal', bn: 'আইনগত' },
  copyright: { en: 'All rights reserved.', bn: 'সর্বস্বত্ব সংরক্ষিত।' },
  view_all: { en: 'View All', bn: 'সব দেখুন' },
};
