-- Add column to track if creator has seen the studio tutorial
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_seen_studio_tutorial BOOLEAN DEFAULT FALSE;