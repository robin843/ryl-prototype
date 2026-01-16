-- Add rate limiting to waitlist inserts to prevent spam
-- Only allow 5 signups per email per hour
CREATE OR REPLACE FUNCTION public.check_waitlist_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  signup_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO signup_count
  FROM public.product_waitlist
  WHERE email = NEW.email
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF signup_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for rate limiting
CREATE TRIGGER waitlist_rate_limit_trigger
  BEFORE INSERT ON public.product_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.check_waitlist_rate_limit();