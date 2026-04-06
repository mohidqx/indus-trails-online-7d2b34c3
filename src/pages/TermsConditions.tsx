import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

export default function TermsConditions() {
  const [content, setContent] = useState('<p>These terms and conditions govern your use of our services and website.</p><h2>Booking Terms</h2><p>All bookings are subject to availability. A booking is confirmed only after you receive a written confirmation from us.</p><h2>Payment</h2><p>Full payment or a deposit is required at the time of booking. Payment methods include bank transfer, JazzCash, and EasyPaisa.</p><h2>Cancellation Policy</h2><p>Cancellations must be made at least 48 hours before the departure date. Cancellation fees may apply depending on the timing.</p><h2>Liability</h2><p>Indus Tours Pakistan acts as a facilitator and is not liable for unforeseen circumstances including weather, road conditions, or natural events.</p><h2>Contact</h2><p>For questions regarding these terms, contact us at info@industours.pk or call +92 311 8088007.</p>');

  useEffect(() => {
    supabase.from('site_content').select('value').eq('key', 'booking_terms').maybeSingle().then(({ data }) => {
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
            <FileText className="w-4 h-4 text-accent" /> Legal
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-snow mb-4 no-select">Terms & Conditions</h1>
          <p className="text-base sm:text-xl text-snow/80 max-w-2xl mx-auto">Please read our terms carefully before booking</p>
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
