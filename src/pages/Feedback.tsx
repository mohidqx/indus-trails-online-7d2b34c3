import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Star, Send, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TourOption {
  id: string;
  title: string;
}

export default function Feedback() {
  const { toast } = useToast();
  const [tours, setTours] = useState<TourOption[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    tour: '',
    rating: 0,
    feedback: '',
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTours = async () => {
      const { data } = await supabase
        .from('tours')
        .select('id, title')
        .eq('is_active', true)
        .order('title');
      if (data) setTours(data);
    };
    fetchTours();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user?.id || null,
          name: formData.name,
          email: formData.email,
          tour_name: formData.tour || null,
          rating: formData.rating,
          message: formData.feedback,
          is_approved: false,
        });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to submit feedback. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Thank You!',
        description: 'Your feedback has been submitted successfully.',
      });

      setFormData({
        name: '',
        email: '',
        tour: '',
        rating: 0,
        feedback: '',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 sm:pt-40 pb-16 sm:pb-20 bg-gradient-mountain">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-snow mb-4 sm:mb-6">
            Share Your Experience
          </h1>
          <p className="text-base sm:text-xl text-snow/80 max-w-2xl mx-auto">
            Your feedback helps us improve and inspires future travelers
          </p>
        </div>
      </section>

      {/* Feedback Form */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-lg">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
                    Leave Feedback
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Tell us about your experience
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Your Name *
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Which tour did you take?
                  </label>
                  <select
                    value={formData.tour}
                    onChange={(e) => setFormData({ ...formData, tour: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm sm:text-base"
                  >
                    <option value="">Select a tour...</option>
                    {tours.map((tour) => (
                      <option key={tour.id} value={tour.title}>
                        {tour.title}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    How would you rate your experience? *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                            star <= (hoveredRating || formData.rating)
                              ? 'fill-accent text-accent'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {formData.rating > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {formData.rating === 5
                        ? 'Excellent!'
                        : formData.rating === 4
                        ? 'Great!'
                        : formData.rating === 3
                        ? 'Good'
                        : formData.rating === 2
                        ? 'Fair'
                        : 'Poor'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Feedback *
                  </label>
                  <Textarea
                    required
                    rows={5}
                    value={formData.feedback}
                    onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                    placeholder="Tell us about your experience - what you loved, what could be improved..."
                  />
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || formData.rating === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Feedback
                      <Send className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
