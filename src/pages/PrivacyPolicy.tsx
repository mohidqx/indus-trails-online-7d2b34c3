import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Shield, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

export default function PrivacyPolicy() {
  const [content, setContent] = useState('<p>Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.</p><h2>Information We Collect</h2><p>We collect information you provide directly to us, such as when you create an account, make a booking, or contact us.</p><h2>How We Use Your Information</h2><p>We use the information to process bookings, improve our services, and communicate with you about your trips.</p><h2>Data Protection</h2><p>We implement appropriate security measures to protect your personal information against unauthorized access or disclosure.</p><h2>Contact Us</h2><p>If you have questions about this privacy policy, please contact us at info@industours.pk</p>');

  useEffect(() => {
    supabase.from('site_content').select('value').eq('key', 'privacy_policy').maybeSingle().then(({ data }) => {
      if (data?.value && typeof data.value === 'string') setContent(data.value);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="page-hero">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-to-t from-mountain/90 via-mountain/40 to-mountain/60" />
        <div className="relative container mx-auto px-4 sm:px-6 text-center z-10 animate-fade-up">
          <span className="premium-badge !text-snow !border-snow/15 !bg-snow/[0.06] mb-4 inline-flex">
            <Shield className="w-4 h-4 text-accent" /> Legal
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-snow mb-4 no-select">Privacy Policy</h1>
          <p className="text-base sm:text-xl text-snow/80 max-w-2xl mx-auto">How we protect your data and privacy</p>
          <div className="gold-divider mx-auto mt-6" />
        </div>
      </section>

      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto bg-card rounded-2xl p-6 sm:p-10 shadow-lg prose prose-sm sm:prose-base dark:prose-invert max-w-none"
          >
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
