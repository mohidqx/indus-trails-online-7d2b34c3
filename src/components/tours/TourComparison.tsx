import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Scale, Check, X, Star, Clock, Users, DollarSign } from 'lucide-react';

interface Tour {
  id: string;
  title: string;
  price: number;
  discount_price: number | null;
  duration: string | null;
  difficulty: string | null;
  max_group_size: number | null;
  includes: string[] | null;
  image_url: string | null;
  description: string | null;
}

export default function TourComparison() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    supabase.from('tours').select('*').eq('is_active', true).then(({ data }) => {
      if (data) setTours(data);
    });
  }, []);

  const selectedTours = tours.filter(t => selected.includes(t.id));

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/20 transition"
      >
        <Scale className="w-4 h-4" /> Compare Tours
      </button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" /> Compare Tours
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground text-sm">Close</button>
      </div>

      {/* Select tours */}
      <div className="flex gap-2 flex-wrap mb-6">
        {tours.map(tour => (
          <button
            key={tour.id}
            onClick={() => {
              setSelected(prev =>
                prev.includes(tour.id)
                  ? prev.filter(id => id !== tour.id)
                  : prev.length < 3 ? [...prev, tour.id] : prev
              );
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              selected.includes(tour.id)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
            }`}
          >
            {tour.title}
          </button>
        ))}
      </div>

      {selected.length < 2 && (
        <p className="text-sm text-muted-foreground text-center py-8">Select 2-3 tours to compare</p>
      )}

      {selected.length >= 2 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-muted-foreground font-medium">Feature</th>
                {selectedTours.map(t => (
                  <th key={t.id} className="text-center p-3 font-medium text-foreground min-w-[150px]">{t.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/30">
                <td className="p-3 text-muted-foreground flex items-center gap-2"><DollarSign className="w-3 h-3" /> Price</td>
                {selectedTours.map(t => (
                  <td key={t.id} className="p-3 text-center">
                    <span className="font-bold text-primary">PKR {(t.discount_price || t.price).toLocaleString()}</span>
                    {t.discount_price && <span className="text-xs text-muted-foreground line-through ml-1">PKR {t.price.toLocaleString()}</span>}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/30">
                <td className="p-3 text-muted-foreground flex items-center gap-2"><Clock className="w-3 h-3" /> Duration</td>
                {selectedTours.map(t => <td key={t.id} className="p-3 text-center text-foreground">{t.duration || '—'}</td>)}
              </tr>
              <tr className="border-b border-border/30">
                <td className="p-3 text-muted-foreground flex items-center gap-2"><Star className="w-3 h-3" /> Difficulty</td>
                {selectedTours.map(t => <td key={t.id} className="p-3 text-center text-foreground">{t.difficulty || '—'}</td>)}
              </tr>
              <tr className="border-b border-border/30">
                <td className="p-3 text-muted-foreground flex items-center gap-2"><Users className="w-3 h-3" /> Group Size</td>
                {selectedTours.map(t => <td key={t.id} className="p-3 text-center text-foreground">{t.max_group_size || '—'}</td>)}
              </tr>
              {/* Inclusions */}
              {(() => {
                const allIncludes = [...new Set(selectedTours.flatMap(t => t.includes || []))];
                return allIncludes.map(inc => (
                  <tr key={inc} className="border-b border-border/10">
                    <td className="p-3 text-muted-foreground text-xs">{inc}</td>
                    {selectedTours.map(t => (
                      <td key={t.id} className="p-3 text-center">
                        {t.includes?.includes(inc) ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-red-400/50 mx-auto" />}
                      </td>
                    ))}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
