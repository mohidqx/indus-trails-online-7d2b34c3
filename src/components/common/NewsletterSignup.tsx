import { useState } from 'react';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    
    const { error } = await supabase.from('newsletter_subscribers').insert({
      email: email.trim(),
      source: 'footer',
    });

    if (error?.code === '23505') {
      toast({ title: "Already subscribed!", description: "You're already on our list 🎉" });
    } else if (error) {
      toast({ title: "Error", description: "Could not subscribe. Try again.", variant: "destructive" });
    } else {
      setSubscribed(true);
      toast({ title: "Subscribed! 🎉", description: "You'll receive our best deals & travel tips." });
    }
    setIsLoading(false);
  };

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-sm">
        <CheckCircle className="w-4 h-4" />
        <span>Subscribed! Check your inbox 🎉</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="flex gap-2">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
      </button>
    </form>
  );
}
