import { useCurrency, CurrencyCode } from '@/hooks/useCurrency';
import { DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const currencies: CurrencyCode[] = ['PKR', 'USD', 'EUR', 'GBP'];

export default function CurrencyToggle({ className, scrolled }: { className?: string; scrolled?: boolean }) {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className={cn('relative group', className)}>
      <button
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-2 rounded-xl transition-all duration-300 text-sm font-medium',
          scrolled ? 'text-foreground hover:bg-muted' : 'text-snow/70 hover:bg-snow/10'
        )}
        aria-label="Currency"
      >
        <DollarSign className="w-4 h-4" />
        <span className="text-xs">{currency}</span>
      </button>
      <div className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="bg-card border border-border rounded-xl shadow-xl p-1 min-w-[80px]">
          {currencies.map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={cn(
                'w-full px-3 py-1.5 rounded-lg text-sm text-left transition-colors',
                currency === c ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
