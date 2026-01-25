-- RLS Policies für brand_creator_partnerships (ohne existierende service_role policy)

-- Creators können ihre eigenen Partnerships sehen
CREATE POLICY "Creators can view their own partnerships"
ON public.brand_creator_partnerships
FOR SELECT
USING (auth.uid() = creator_id);

-- Creators können Partnerschaften anfragen (nur für sich selbst)
CREATE POLICY "Creators can request partnerships"
ON public.brand_creator_partnerships
FOR INSERT
WITH CHECK (auth.uid() = creator_id AND status = 'pending');

-- Brands können Partnerships zu ihrer Brand sehen
CREATE POLICY "Brands can view partnerships for their brand"
ON public.brand_creator_partnerships
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM brand_accounts ba 
  WHERE ba.id = brand_creator_partnerships.brand_id 
  AND ba.user_id = auth.uid()
));

-- Brands können Partnerships aktualisieren (accept/reject, commission rate)
CREATE POLICY "Brands can update partnerships for their brand"
ON public.brand_creator_partnerships
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM brand_accounts ba 
  WHERE ba.id = brand_creator_partnerships.brand_id 
  AND ba.user_id = auth.uid()
));

-- Admins können alles sehen
CREATE POLICY "Admins can view all partnerships"
ON public.brand_creator_partnerships
FOR SELECT
USING (has_role(auth.uid(), 'admin'));