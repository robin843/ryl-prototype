-- Create product_waitlist table for Coming Soon email capture
CREATE TABLE public.product_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES public.shopable_products(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified_at TIMESTAMP WITH TIME ZONE,
  
  -- Prevent duplicate signups for same product
  CONSTRAINT unique_email_product UNIQUE (email, product_id)
);

-- Enable Row Level Security
ALTER TABLE public.product_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public signup)
CREATE POLICY "Anyone can sign up for waitlist" 
ON public.product_waitlist 
FOR INSERT 
WITH CHECK (true);

-- Only admins/producers can view waitlist
CREATE POLICY "Producers can view their product waitlist" 
ON public.product_waitlist 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.shopable_products sp
    WHERE sp.id = product_waitlist.product_id
    AND sp.creator_id = auth.uid()
  )
);

-- Create index for faster lookups
CREATE INDEX idx_product_waitlist_product ON public.product_waitlist(product_id);
CREATE INDEX idx_product_waitlist_email ON public.product_waitlist(email);