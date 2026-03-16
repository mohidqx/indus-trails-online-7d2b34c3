import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Availability {
  available_date: string;
  slots_total: number | null;
  slots_booked: number | null;
  is_available: boolean | null;
  price_override: number | null;
}

export default function TourAvailabilityCalendar({ tourId }: { tourId: string }) {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetch = async () => {
      const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
      const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];
      const { data } = await supabase
        .from('tour_availability')
        .select('available_date, slots_total, slots_booked, is_available, price_override')
        .eq('tour_id', tourId)
        .gte('available_date', start)
        .lte('available_date', end);
      if (data) setAvailability(data);
    };
    fetch();
  }, [tourId, currentMonth]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getAvailability = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return availability.find((a) => a.available_date === dateStr);
  };

  return (
    <div className="bg-card rounded-2xl p-5 border border-border/40 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-serif font-bold text-foreground">Availability</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">←</button>
          <span className="text-sm font-medium text-foreground min-w-[140px] text-center">{monthName}</span>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">→</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-1 font-medium">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const av = getAvailability(day);
          const isPast = new Date(year, month, day) < new Date(new Date().setHours(0, 0, 0, 0));
          const slotsLeft = av ? (av.slots_total || 0) - (av.slots_booked || 0) : null;
          const isAvailable = av?.is_available !== false && !isPast && slotsLeft !== 0;

          return (
            <div
              key={day}
              className={cn(
                'aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors',
                isPast && 'opacity-30',
                av && isAvailable && 'bg-emerald-500/10 border border-emerald-500/20',
                av && !isAvailable && 'bg-destructive/10 border border-destructive/20',
                !av && !isPast && 'hover:bg-muted/50'
              )}
            >
              <span className={cn('font-medium', av && isAvailable ? 'text-emerald-600' : av ? 'text-destructive' : 'text-foreground')}>{day}</span>
              {av && slotsLeft !== null && (
                <span className="text-[9px] mt-0.5">
                  {isAvailable ? `${slotsLeft} left` : 'Full'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Available</span>
        <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-destructive" /> Full</span>
      </div>
    </div>
  );
}
