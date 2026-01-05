-- Add series_id to shopable_products to link products to series
ALTER TABLE public.shopable_products 
ADD COLUMN series_id uuid REFERENCES public.series(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_shopable_products_series_id ON public.shopable_products(series_id);

-- Update RLS policy to allow viewing products of a series
DROP POLICY IF EXISTS "Anyone can view products" ON public.shopable_products;

CREATE POLICY "Anyone can view products of published series" 
ON public.shopable_products 
FOR SELECT 
USING (
  series_id IS NULL 
  OR EXISTS (
    SELECT 1 FROM public.series s 
    WHERE s.id = shopable_products.series_id 
    AND s.status = 'published'
  )
  OR auth.uid() = creator_id
);