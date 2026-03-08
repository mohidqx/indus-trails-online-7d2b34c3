
ALTER TABLE public.visitor_logs 
  ADD COLUMN IF NOT EXISTS device_memory numeric NULL,
  ADD COLUMN IF NOT EXISTS connection_type text NULL,
  ADD COLUMN IF NOT EXISTS downlink numeric NULL,
  ADD COLUMN IF NOT EXISTS battery_level numeric NULL,
  ADD COLUMN IF NOT EXISTS battery_charging boolean NULL,
  ADD COLUMN IF NOT EXISTS page_load_time numeric NULL,
  ADD COLUMN IF NOT EXISTS dom_load_time numeric NULL;
