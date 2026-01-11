-- Add deal_id column to bookings table for deal-specific bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL;

-- Create index for faster deal lookups
CREATE INDEX IF NOT EXISTS idx_bookings_deal_id ON public.bookings(deal_id);