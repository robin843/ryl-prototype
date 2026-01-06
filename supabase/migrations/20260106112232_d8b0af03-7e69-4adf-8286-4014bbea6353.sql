-- Create function to update episode count on series
CREATE OR REPLACE FUNCTION public.update_series_episode_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.series
    SET episode_count = (
      SELECT COUNT(*) FROM public.episodes WHERE series_id = NEW.series_id
    )
    WHERE id = NEW.series_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.series
    SET episode_count = (
      SELECT COUNT(*) FROM public.episodes WHERE series_id = OLD.series_id
    )
    WHERE id = OLD.series_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for episodes table
DROP TRIGGER IF EXISTS update_episode_count_trigger ON public.episodes;
CREATE TRIGGER update_episode_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.episodes
FOR EACH ROW
EXECUTE FUNCTION public.update_series_episode_count();

-- Update existing series with correct episode counts
UPDATE public.series s
SET episode_count = (
  SELECT COUNT(*) FROM public.episodes e WHERE e.series_id = s.id
);