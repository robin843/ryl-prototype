-- Add birthdate, gender, and age_at_signup to profiles
ALTER TABLE public.profiles
ADD COLUMN birthdate date,
ADD COLUMN gender text,
ADD COLUMN age_at_signup integer;

-- Add check constraint for valid gender values
ALTER TABLE public.profiles
ADD CONSTRAINT valid_gender CHECK (gender IS NULL OR gender IN ('male', 'female', 'diverse', 'prefer_not_to_say'));