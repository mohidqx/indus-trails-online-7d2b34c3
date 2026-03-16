import { Award, Crown, Shield, Star, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoyaltyTierCardProps {
  completedTrips: number;
  totalPoints: number;
}

const tiers = [
  { name: 'Explorer', min: 0, icon: Star, color: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-muted', perks: ['Basic support', 'Newsletter access'] },
  { name: 'Bronze', min: 2, icon: Shield, color: 'text-amber-700', bg: 'bg-amber-500/10', border: 'border-amber-500/20', perks: ['5% off next trip', 'Priority support', 'Early access to deals'] },
  { name: 'Silver', min: 5, icon: Award, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', perks: ['10% off all tours', 'Free airport pickup', 'Dedicated agent'] },
  { name: 'Gold', min: 10, icon: Crown, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20', perks: ['15% off all tours', 'Free hotel upgrade', 'VIP lounge access', 'Complimentary guide'] },
  { name: 'Platinum', min: 20, icon: Gem, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', perks: ['20% off everything', 'Free premium vehicle', 'Personal concierge', 'Custom itinerary'] },
];

export default function LoyaltyTierCard({ completedTrips, totalPoints }: LoyaltyTierCardProps) {
  const currentTier = [...tiers].reverse().find((t) => completedTrips >= t.min) || tiers[0];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progress = nextTier ? ((completedTrips - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;
  const Icon = currentTier.icon;

  return (
    <div className={cn('rounded-2xl border p-6 space-y-4', currentTier.bg, currentTier.border)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', currentTier.bg)}>
            <Icon className={cn('w-6 h-6', currentTier.color)} />
          </div>
          <div>
            <h3 className={cn('text-lg font-serif font-bold', currentTier.color)}>{currentTier.name} Tier</h3>
            <p className="text-xs text-muted-foreground">{totalPoints} loyalty points</p>
          </div>
        </div>
      </div>

      {nextTier && (
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{completedTrips} trips completed</span>
            <span>{nextTier.min - completedTrips} more to {nextTier.name}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700', currentTier.color.replace('text-', 'bg-'))}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-foreground mb-2">Your Perks:</p>
        <div className="flex flex-wrap gap-1.5">
          {currentTier.perks.map((perk) => (
            <span key={perk} className="px-2.5 py-1 rounded-full bg-background/50 text-[11px] text-muted-foreground border border-border/40">
              {perk}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
