import { Users, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupBookingSectionProps {
  travelers: number;
  onTravelersChange: (n: number) => void;
}

const groupDiscounts = [
  { min: 5, max: 9, percent: 5, label: '5-9 travelers' },
  { min: 10, max: 19, percent: 10, label: '10-19 travelers' },
  { min: 20, max: 50, percent: 15, label: '20-50 travelers' },
];

export function getGroupDiscount(travelers: number): number {
  const tier = groupDiscounts.find((d) => travelers >= d.min && travelers <= d.max);
  return tier?.percent || 0;
}

export default function GroupBookingSection({ travelers, onTravelersChange }: GroupBookingSectionProps) {
  const currentDiscount = getGroupDiscount(travelers);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Users className="w-4 h-4 text-primary" />
        Group Booking Discounts
      </div>

      <div className="grid grid-cols-3 gap-2">
        {groupDiscounts.map((tier) => (
          <button
            key={tier.min}
            onClick={() => onTravelersChange(tier.min)}
            className={cn(
              'p-3 rounded-xl border text-center transition-all',
              travelers >= tier.min && travelers <= tier.max
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-border/40 hover:border-primary/30 hover:bg-primary/5'
            )}
          >
            <p className="text-lg font-bold text-primary">{tier.percent}%</p>
            <p className="text-[11px] text-muted-foreground">{tier.label}</p>
          </button>
        ))}
      </div>

      {currentDiscount > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/10 border border-accent/20">
          <Tag className="w-4 h-4 text-accent" />
          <span className="text-sm text-accent font-medium">
            Group discount: {currentDiscount}% off for {travelers} travelers!
          </span>
        </div>
      )}

      {travelers >= 5 && (
        <p className="text-xs text-muted-foreground">
          Corporate & family groups welcome. Contact us for custom packages with 50+ travelers.
        </p>
      )}
    </div>
  );
}
