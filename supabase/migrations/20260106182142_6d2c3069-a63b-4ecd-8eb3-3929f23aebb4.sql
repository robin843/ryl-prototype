INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('876d63eb-d4ed-4f8c-afba-c3d1c14f2de9', 'admin'),
  ('40971fd0-22d1-47ac-bd1e-633621292c8a', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;