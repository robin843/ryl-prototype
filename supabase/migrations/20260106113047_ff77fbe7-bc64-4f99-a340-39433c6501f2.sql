-- Create producer_applications table
CREATE TABLE public.producer_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  company_name TEXT NOT NULL,
  description TEXT NOT NULL,
  portfolio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.producer_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own application
CREATE POLICY "Users can view their own application"
ON public.producer_applications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own application
CREATE POLICY "Users can insert their own application"
ON public.producer_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.producer_applications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all applications
CREATE POLICY "Admins can update all applications"
ON public.producer_applications
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_producer_applications_updated_at
BEFORE UPDATE ON public.producer_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();