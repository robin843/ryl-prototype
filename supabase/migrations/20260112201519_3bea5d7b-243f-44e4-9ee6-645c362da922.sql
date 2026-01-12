-- Create admin_notifications table
CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies: Only admins can read notifications
CREATE POLICY "Admins can view notifications"
ON public.admin_notifications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update notifications (mark as read)
CREATE POLICY "Admins can update notifications"
ON public.admin_notifications
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete notifications
CREATE POLICY "Admins can delete notifications"
ON public.admin_notifications
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Function to auto-create notification on new producer application
CREATE OR REPLACE FUNCTION public.notify_admin_on_producer_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, link, metadata)
  VALUES (
    'producer_application',
    'Neue Producer-Bewerbung',
    'Neue Bewerbung von ' || NEW.company_name,
    '/admin?tab=applications',
    jsonb_build_object('application_id', NEW.id, 'company_name', NEW.company_name)
  );
  RETURN NEW;
END;
$$;

-- Trigger to fire on new producer application
CREATE TRIGGER on_new_producer_application
  AFTER INSERT ON public.producer_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_producer_application();