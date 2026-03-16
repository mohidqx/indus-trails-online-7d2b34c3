import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PricingRule {
  id: string;
  tour_id: string | null;
  rule_type: string;
  name: string;
  discount_percent: number;
  surcharge_percent: number;
  min_group_size: number | null;
  max_group_size: number | null;
  start_date: string | null;
  end_date: string | null;
  days_before_travel: number | null;
}

interface DynamicPriceResult {
  finalPrice: number;
  appliedRules: { name: string; adjustment: number }[];
  totalDiscount: number;
  totalSurcharge: number;
}

export function useDynamicPricing(tourId: string | null, basePrice: number, travelers: number, travelDate: string) {
  const [rules, setRules] = useState<PricingRule[]>([]);

  useEffect(() => {
    if (!tourId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('is_active', true)
        .or(`tour_id.eq.${tourId},tour_id.is.null`);
      if (data) setRules(data as PricingRule[]);
    };
    fetch();
  }, [tourId]);

  const calculate = (): DynamicPriceResult => {
    if (!tourId || basePrice === 0) return { finalPrice: basePrice, appliedRules: [], totalDiscount: 0, totalSurcharge: 0 };

    let totalDiscount = 0;
    let totalSurcharge = 0;
    const appliedRules: { name: string; adjustment: number }[] = [];
    const today = new Date();
    const travel = travelDate ? new Date(travelDate) : null;
    const daysUntilTravel = travel ? Math.ceil((travel.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

    rules.forEach((rule) => {
      let applies = false;

      switch (rule.rule_type) {
        case 'seasonal':
          if (rule.start_date && rule.end_date && travel) {
            const start = new Date(rule.start_date);
            const end = new Date(rule.end_date);
            applies = travel >= start && travel <= end;
          }
          break;
        case 'group_size':
          if (rule.min_group_size && travelers >= rule.min_group_size) {
            applies = !rule.max_group_size || travelers <= rule.max_group_size;
          }
          break;
        case 'early_bird':
          if (rule.days_before_travel && daysUntilTravel !== null) {
            applies = daysUntilTravel >= rule.days_before_travel;
          }
          break;
        case 'last_minute':
          if (rule.days_before_travel && daysUntilTravel !== null) {
            applies = daysUntilTravel <= rule.days_before_travel && daysUntilTravel >= 0;
          }
          break;
      }

      if (applies) {
        if (rule.discount_percent > 0) {
          totalDiscount += rule.discount_percent;
          appliedRules.push({ name: rule.name, adjustment: -rule.discount_percent });
        }
        if (rule.surcharge_percent > 0) {
          totalSurcharge += rule.surcharge_percent;
          appliedRules.push({ name: rule.name, adjustment: rule.surcharge_percent });
        }
      }
    });

    const netAdjustment = totalSurcharge - totalDiscount;
    const finalPrice = Math.max(basePrice * (1 + netAdjustment / 100), 0);

    return { finalPrice: Math.round(finalPrice), appliedRules, totalDiscount, totalSurcharge };
  };

  return calculate();
}
