-- Create the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create hotels table
CREATE TABLE public.hotels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
  amenities TEXT[],
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add hotel_id to tours table (tour includes this hotel stay)
ALTER TABLE public.tours ADD COLUMN hotel_id UUID REFERENCES public.hotels(id);

-- Enable RLS
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

-- RLS policies for hotels
CREATE POLICY "Anyone can view active hotels"
ON public.hotels
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage hotels"
ON public.hotels
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_hotels_updated_at
BEFORE UPDATE ON public.hotels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample hotels
INSERT INTO public.hotels (name, location, description, star_rating, amenities) VALUES
('Serena Hotel Hunza', 'Karimabad, Hunza', 'Luxury mountain resort with stunning views of Rakaposhi and surrounding peaks. Premium accommodations with traditional architecture.', 5, ARRAY['Free WiFi', 'Restaurant', 'Room Service', 'Mountain View', 'Heating', 'Parking']),
('Eagle Nest Hotel', 'Duikar, Hunza', 'Perched at 10,000 feet with panoramic views of Hunza Valley. Perfect for stargazing and sunrise views.', 4, ARRAY['Free WiFi', 'Restaurant', 'Terrace', 'Mountain View', 'Heating']),
('Shangrila Resort', 'Skardu', 'Famous resort on the shores of Lower Kachura Lake. Known as "Heaven on Earth" with unique accommodations.', 4, ARRAY['Free WiFi', 'Restaurant', 'Lake View', 'Garden', 'Boating', 'Parking']),
('PTDC Motel Naran', 'Naran', 'Government-run motel in the heart of Naran with easy access to Saif-ul-Malook Lake and Babusar Pass.', 3, ARRAY['Restaurant', 'Parking', 'River View', 'Heating']),
('Swat Serena Hotel', 'Mingora, Swat', 'Elegant hotel in the valley of Swat with modern amenities and traditional hospitality.', 4, ARRAY['Free WiFi', 'Restaurant', 'Pool', 'Gym', 'Conference Room', 'Parking']),
('Pine Park Hotel', 'Shogran', 'Cozy mountain retreat surrounded by pine forests with views of Makra Peak.', 3, ARRAY['Restaurant', 'Bonfire', 'Mountain View', 'Heating', 'Parking']);