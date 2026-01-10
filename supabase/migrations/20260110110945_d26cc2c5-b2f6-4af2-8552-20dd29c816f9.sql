-- SCHRITT 1: Video Assets Tabelle (Media-Core)
CREATE TABLE public.video_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  storage_path text NOT NULL,
  duration_seconds integer,
  status text NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'ready', 'failed')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.video_assets ENABLE ROW LEVEL SECURITY;

-- Creator kann eigene Assets erstellen
CREATE POLICY "Creators can insert own video assets"
ON public.video_assets
FOR INSERT
WITH CHECK (auth.uid() = creator_id);

-- Creator kann eigene Assets sehen
CREATE POLICY "Creators can view own video assets"
ON public.video_assets
FOR SELECT
USING (auth.uid() = creator_id);

-- Creator kann eigene Assets updaten (status ändern)
CREATE POLICY "Creators can update own video assets"
ON public.video_assets
FOR UPDATE
USING (auth.uid() = creator_id);

-- SCHRITT 2: Episode ↔ Video trennen
-- Neue Spalte video_asset_id hinzufügen
ALTER TABLE public.episodes
ADD COLUMN video_asset_id uuid REFERENCES public.video_assets(id);

-- Index für Performance
CREATE INDEX idx_episodes_video_asset_id ON public.episodes(video_asset_id);

-- Viewer können Assets sehen wenn Episode published ist (nach FK existiert)
CREATE POLICY "Anyone can view video assets of published episodes"
ON public.video_assets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.episodes e
    WHERE e.video_asset_id = video_assets.id
    AND e.status = 'published'
  )
);