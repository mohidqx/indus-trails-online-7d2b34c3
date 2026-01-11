import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, Users, Check, Loader2, Tag } from 'lucide-react';
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

interface Deal {
  id: string;
  title: string;
  discount_percent: number | null;
  code: string | null;
  tour_id: string | null;
}

export default function Booking() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const dealId = searchParams.get('deal');
  
  const [step, setStep] = useState(1);
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
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
    if (dealId) {
      fetchDeal(dealId);
    }
  }, [dealId]);

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

  const fetchDeal = async (id: string) => {
    const { data } = await supabase
      .from('deals')
      .select('id, title, discount_percent, code, tour_id')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();
    
    if (data) {
      setSelectedDeal(data);
      if (data.tour_id) {
        setFormData(prev => ({ ...prev, tour: data.tour_id! }));
      }
    }
  };

  const selectedTour = tours.find((t) => t.id === formData.tour);
  const basePrice = selectedTour ? selectedTour.discount_price || selectedTour.price : 0;
  const discountPercent = selectedDeal?.discount_percent || 0;
  const discountedPrice = discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice;
  const totalPrice = discountedPrice * parseInt(formData.travelers || '1');

  const isPakistani = formData.nationality.toLowerCase().includes('pakistan');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        tour_id: formData.tour || null,
        deal_id: selectedDeal?.id || null,
        travel_date: formData.date,
        num_travelers: parseInt(formData.travelers || '1'),
        customer_name: formData.name.trim(),
        customer_email: formData.email.trim(),
        customer_phone: formData.phone.trim(),
        customer_nationality: formData.nationality.trim() || null,
        customer_cnic: isPakistani ? (formData.cnic.trim() || null) : null,
        customer_address: formData.address.trim() || null,
        special_requests: formData.specialRequests.trim() || null,
        total_price: Math.round(totalPrice),
      };

      const { error } = await supabase.functions.invoke('create-booking', {
        body: payload,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to submit booking. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Booking Request Submitted!',
        description: 'We will contact you within 24 hours to confirm your booking.',
      });

      setStep(4);
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
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 bg-gradient-mountain">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-snow mb-4 sm:mb-6">
            {selectedDeal ? 'Claim Your Deal' : 'Book Your Adventure'}
          </h1>
          <p className="text-base sm:text-xl text-snow/80 max-w-2xl mx-auto">
            {selectedDeal ? selectedDeal.title : "Start your journey to Pakistan's northern paradise"}
          </p>
          {selectedDeal && (
            <div className="mt-4 inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full">
              <Tag className="w-4 h-4" />
              <span className="font-bold">{selectedDeal.discount_percent}% OFF</span>
              {selectedDeal.code && <span className="font-mono">• Code: {selectedDeal.code}</span>}
            </div>
          )}
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-6 sm:py-8 bg-secondary/30 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 sm:gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-1 sm:gap-2">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-all text-sm sm:text-base ${
                      step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step > s ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : s}
                  </div>
                  <span className={`hidden sm:block text-sm ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s === 1 ? 'Select Tour' : s === 2 ? 'Your Details' : 'Confirm'}
                  </span>
                  {s < 3 && <div className="w-4 sm:w-8 h-0.5 bg-border" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            {step === 1 && (
              <div className="bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-lg">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-4 sm:mb-6">Select Your Tour</h2>

                {isLoadingTours ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Choose a Tour Package *</label>
                      <select
                        value={formData.tour}
                        onChange={(e) => setFormData({ ...formData, tour: e.target.value })}
                        className="w-full h-11 px-3 sm:px-4 rounded-lg border border-input bg-background text-foreground text-sm sm:text-base"
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

                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
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
                      <div className="p-4 sm:p-6 rounded-xl bg-primary/10 border border-primary/20">
                        {selectedDeal && discountPercent > 0 && (
                          <div className="flex items-center gap-2 mb-2 text-sm">
                            <Tag className="w-4 h-4 text-accent" />
                            <span className="text-accent font-medium">{discountPercent}% discount applied!</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-foreground font-medium">Estimated Total:</span>
                          <div className="text-right">
                            {selectedDeal && discountPercent > 0 && (
                              <span className="text-sm text-muted-foreground line-through mr-2">
                                PKR {(basePrice * parseInt(formData.travelers || '1')).toLocaleString()}
                              </span>
                            )}
                            <span className="text-xl sm:text-2xl font-bold text-primary">
                              PKR {Math.round(totalPrice).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2">* Final price will be confirmed after booking</p>
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
              <div className="bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-lg">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-4 sm:mb-6">Your Details</h2>

                <form className="space-y-4 sm:space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
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

                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
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

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button variant="outline" size="lg" onClick={() => setStep(1)} className="order-2 sm:order-1">
                      Back
                    </Button>
                    <Button
                      variant="gold"
                      size="lg"
                      className="flex-1 order-1 sm:order-2"
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
              <div className="bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-lg">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-4 sm:mb-6">Review Your Booking</h2>

                <div className="space-y-4 sm:space-y-6">
                  {selectedDeal && (
                    <div className="p-4 sm:p-6 rounded-xl bg-accent/10 border border-accent/20">
                      <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-accent" />
                        <span className="font-semibold text-accent">Deal Applied: {selectedDeal.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedDeal.discount_percent}% discount
                        {selectedDeal.code && ` • Code: ${selectedDeal.code}`}
                      </p>
                    </div>
                  )}
                  
                  <div className="p-4 sm:p-6 rounded-xl bg-secondary">
                    <h3 className="font-semibold text-foreground mb-3 sm:mb-4">Tour Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tour:</span>
                        <span className="text-foreground text-right">{selectedTour?.title || 'Custom Request'}</span>
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

                  <div className="p-4 sm:p-6 rounded-xl bg-secondary">
                    <h3 className="font-semibold text-foreground mb-3 sm:mb-4">Contact Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="text-foreground">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="text-foreground text-right break-all">{formData.email}</span>
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

                  <div className="p-4 sm:p-6 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground font-medium">Total Amount:</span>
                      <span className="text-2xl sm:text-3xl font-bold text-primary">PKR {Math.round(totalPrice).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button variant="outline" size="lg" onClick={() => setStep(2)} className="order-2 sm:order-1">
                      Back
                    </Button>
                    <Button variant="gold" size="lg" className="flex-1 order-1 sm:order-2" onClick={handleSubmit} disabled={isSubmitting}>
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
              <div className="bg-card rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-lg text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-full bg-emerald/20 flex items-center justify-center">
                  <Check className="w-8 h-8 sm:w-10 sm:h-10 text-emerald" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-4">Booking Submitted!</h2>
                <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                  Thank you for your booking request. Our team will contact you within 24 hours to confirm your adventure.
                </p>
                <Button variant="gold" size="lg" onClick={() => window.location.href = '/tours'}>
                  Explore More Tours
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