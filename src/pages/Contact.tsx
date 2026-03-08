import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSiteContent } from '@/hooks/useSiteContent';
import { supabase } from '@/integrations/supabase/client';

export default function Contact() {
  const { toast } = useToast();
  const { data: content } = useSiteContent();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sitePhone = (content?.phone as string) || '+92 300 1234567';
  const siteEmail = (content?.email as string) || 'info@industours.pk';
  const siteAddress = (content?.address as string) || 'Blue Area, F-7 Markaz, Islamabad, Pakistan 44000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from('contact_messages').insert([{
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      subject: formData.subject,
      message: formData.message,
    }] as any);

    if (error) {
      toast({ title: 'Error', description: 'Failed to send message. Please try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Message Sent!', description: 'We will get back to you within 24 hours.' });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }
    setIsSubmitting(false);
  };

  const contactInfo = [
    { icon: MapPin, title: 'Office Address', value: siteAddress },
    { icon: Phone, title: 'Phone', value: sitePhone, href: `tel:${sitePhone.replace(/\s/g, '')}` },
    { icon: Mail, title: 'Email', value: siteEmail, href: `mailto:${siteEmail}` },
    { icon: Clock, title: 'Office Hours', value: 'Monday - Saturday: 9:00 AM - 7:00 PM\nSunday: 10:00 AM - 4:00 PM' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="page-hero">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.08),transparent_60%)]" />
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10 animate-fade-up">
          <span className="premium-badge !text-snow !border-snow/15 !bg-snow/[0.06] mb-4 inline-flex">
            <MessageSquare className="w-4 h-4 text-accent" />
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-snow mb-4 sm:mb-6">Contact Us</h1>
          <p className="text-base sm:text-xl text-snow/80 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message!
          </p>
          <div className="gold-divider mx-auto mt-6" />
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
            {/* Contact Info */}
            <div className="space-y-6 sm:space-y-8 animate-fade-up">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-4 sm:mb-6">Get In Touch</h2>
                <div className="gold-divider mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Whether you have questions about our tours, need help planning your trip, or just
                  want to say hello, we're here for you.
                </p>
              </div>

              <div className="space-y-4 sm:space-y-5">
                {contactInfo.map(({ icon: Icon, title, value, href }) => (
                  <div key={title} className="flex items-start gap-3 sm:gap-4 p-3 rounded-xl hover:bg-muted/20 transition-colors group">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">{title}</h3>
                      {href ? (
                        <a href={href} className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 animate-fade-up delay-200">
              <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-premium">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-2 sm:mb-3">Send Us a Message</h2>
                <div className="gold-divider mb-6" />

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                      <div className="premium-input rounded-md">
                        <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" className="border-0 bg-transparent" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                      <div className="premium-input rounded-md">
                        <Input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" className="border-0 bg-transparent" />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                      <div className="premium-input rounded-md">
                        <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+92 300 1234567" className="border-0 bg-transparent" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Subject *</label>
                      <div className="premium-input rounded-md">
                        <Input required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Tour Inquiry" className="border-0 bg-transparent" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Message *</label>
                    <div className="premium-input rounded-md">
                      <Textarea required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Tell us about your travel plans..." className="border-0 bg-transparent resize-none" />
                    </div>
                  </div>

                  <Button type="submit" variant="gold" size="lg" disabled={isSubmitting} className="w-full sm:w-auto shadow-gold">
                    {isSubmitting ? 'Sending...' : (
                      <>Send Message <Send className="w-5 h-5 ml-2" /></>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-64 sm:h-80 md:h-96">
        <iframe
          title="Office Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26580.36685879695!2d73.0350991!3d33.7042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfbf4e5f6a52c5%3A0x5d0c7f8f5c12b61f!2sF-7%20Markaz%2C%20Islamabad%2C%20Islamabad%20Capital%20Territory%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000"
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      <Footer />
    </div>
  );
}
