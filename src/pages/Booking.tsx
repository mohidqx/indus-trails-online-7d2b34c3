import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, Users, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Tour {
  id: string;
  title: string;
  price: number;
  discount_price: number | null;
}

export default function Booking() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoadingTours, setIsLoadingTours] = useState(true);
  const [formData, setFormData] = useState({
    tour: '',
    date: '',
    travelers: '2',
    name: '',
    email: '',
    phone: '',
    nationality: '',
    cnic: '',
    address: '',
    specialRequests: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    setIsLoadingTours(true);
    const { data, error } = await supabase
      .from('tours')
      .select('id, title, price, discount_price')
      .eq('is_active', true)
      .order('title');

    if (!error && data) {
      setTours(data);
    }
    setIsLoadingTours(false);
  };

  const selectedTour = tours.find((t) => t.id === formData.tour);
  const tourPrice = selectedTour ? selectedTour.discount_price || selectedTour.price : 0;
  const totalPrice = tourPrice * parseInt(formData.travelers || '1');

  const isPakistani = formData.nationality.toLowerCase().includes('pakistan');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from('bookings').insert({
        user_id: user?.id || null,
        tour_id: formData.tour || null,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_nationality: formData.nationality || null,
        customer_cnic: isPakistani ? formData.cnic : null,
        customer_address: formData.address || null,
        travel_date: formData.date,
        num_travelers: parseInt(formData.travelers),
        special_requests: formData.specialRequests || null,
        total_price: totalPrice,
        status: 'pending',
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to submit booking. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Booking Request Submitted!',
        description: 'We will contact you within 24 hours to confirm your booking.',
      });

      setStep(4);
    } catch (error) {
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
      <section className="relative pt-32 pb-20 bg-gradient-mountain">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-snow mb-6">Book Your Adventure</h1>
          <p className="text-xl text-snow/80 max-w-2xl mx-auto">
            Start your journey to Pakistan's northern paradise
          </p>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-8 bg-secondary/30 border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex justify-center">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step > s ? <Check className="w-5 h-5" /> : s}
                  </div>
                  <span className={`hidden sm:block ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s === 1 ? 'Select Tour' : s === 2 ? 'Your Details' : 'Confirm'}
                  </span>
                  {s < 3 && <div className="w-8 h-0.5 bg-border" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            {step === 1 && (
              <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Select Your Tour</h2>

                {isLoadingTours ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Choose a Tour Package *</label>
                      <select
                        value={formData.tour}
                        onChange={(e) => setFormData({ ...formData, tour: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground"
                        required
                      >
                        <option value="">Select a tour...</option>
                        {tours.map((tour) => (
                          <option key={tour.id} value={tour.id}>
                            {tour.title} - PKR {(tour.discount_price || tour.price).toLocaleString()}
                          </option>
                        ))}
                      </select>
                      {tours.length === 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          No tours available at the moment. Please contact us directly.
                        </p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Preferred Date *
                        </label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <Users className="w-4 h-4 inline mr-2" />
                          Number of Travelers *
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={formData.travelers}
                          onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {selectedTour && (
                      <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
                        <div className="flex justify-between items-center">
                          <span className="text-foreground font-medium">Estimated Total:</span>
                          <span className="text-2xl font-bold text-primary">PKR {totalPrice.toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">* Final price will be confirmed after booking</p>
                      </div>
                    )}

                    <Button variant="gold" size="lg" className="w-full" onClick={() => setStep(2)} disabled={!formData.date}>
                      Continue
                    </Button>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Your Details</h2>

                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone Number *</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+92 300 1234567"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Nationality *</label>
                      <Input
                        value={formData.nationality}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                        placeholder="Pakistani"
                        required
                      />
                    </div>
                  </div>

                  {isPakistani && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">CNIC Number *</label>
                      <Input
                        value={formData.cnic}
                        onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                        placeholder="12345-1234567-1"
                        required={isPakistani}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Complete Address *</label>
                    <Textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="House #, Street, City, Province, Postal Code"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Special Requests</label>
                    <Textarea
                      rows={3}
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      placeholder="Any dietary requirements, accessibility needs, or special requests..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button
                      variant="gold"
                      size="lg"
                      className="flex-1"
                      onClick={() => setStep(3)}
                      disabled={
                        !formData.name ||
                        !formData.email ||
                        !formData.phone ||
                        !formData.nationality ||
                        (isPakistani && !formData.cnic) ||
                        !formData.address
                      }
                    >
                      Continue to Review
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Review Your Booking</h2>

                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-secondary">
                    <h3 className="font-semibold text-foreground mb-4">Tour Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tour:</span>
                        <span className="text-foreground">{selectedTour?.title || 'Custom Request'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="text-foreground">{formData.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Travelers:</span>
                        <span className="text-foreground">{formData.travelers}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-secondary">
                    <h3 className="font-semibold text-foreground mb-4">Contact Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="text-foreground">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="text-foreground">{formData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="text-foreground">{formData.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nationality:</span>
                        <span className="text-foreground">{formData.nationality}</span>
                      </div>
                      {isPakistani && formData.cnic && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CNIC:</span>
                          <span className="text-foreground">{formData.cnic}</span>
                        </div>
                      )}
                      {formData.address && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Address:</span>
                          <span className="text-foreground text-right max-w-[60%]">{formData.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground font-medium">Total Amount:</span>
                      <span className="text-3xl font-bold text-primary">PKR {totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" size="lg" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button variant="gold" size="lg" className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Booking Request'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald flex items-center justify-center">
                  <Check className="w-10 h-10 text-snow" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Booking Request Submitted!</h2>
                <p className="text-muted-foreground mb-8">
                  Thank you for choosing Indus Tours. We have received your booking request and will contact you within 24
                  hours to confirm the details and payment.
                </p>
                <Button variant="gold" size="lg" asChild>
                  <a href="/">Return to Home</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
