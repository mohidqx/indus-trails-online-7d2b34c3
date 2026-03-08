import { useState, useEffect } from 'react';
import { MapPin, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BookingTick {
  name: string;
  tour: string;
  time: string;
}

export default function LiveBookingTicker() {
  const [bookings, setBookings] = useState<BookingTick[]>([]);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('customer_name, created_at, tours(title)')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setBookings(data.map((b: any) => ({
          name: b.customer_name?.split(' ')[0] || 'Someone',
          tour: b.tours?.title || 'a tour',
          time: getTimeAgo(b.created_at),
        })));
      }
    };
    fetchRecent();
  }, []);

  useEffect(() => {
    if (bookings.length === 0) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % bookings.length);
        setVisible(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [bookings.length]);

  if (bookings.length === 0) return null;

  const b = bookings[current];

  return (
    <div className={`fixed bottom-24 left-4 z-40 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="bg-background/95 backdrop-blur border border-border rounded-xl px-4 py-3 shadow-lg max-w-[280px]">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              <span className="text-primary">{b.name}</span> booked {b.tour}
            </p>
            <p className="text-muted-foreground text-[10px] flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {b.time}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
