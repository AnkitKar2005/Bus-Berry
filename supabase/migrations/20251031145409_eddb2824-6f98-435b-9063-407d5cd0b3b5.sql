-- Create admin user function that will be called to set up the initial admin
-- This ensures only ONE admin user exists with a specific email

-- First, let's create a function to set up the admin user
CREATE OR REPLACE FUNCTION public.setup_admin_user(admin_email TEXT, admin_password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if admin already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = admin_email;
  
  IF admin_user_id IS NULL THEN
    -- Admin doesn't exist, return message to create manually
    RETURN 'Admin user must be created through Supabase Auth';
  END IF;
  
  -- Ensure the user has admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN 'Admin user configured successfully';
END;
$$;

-- Add a check to prevent multiple admin users (optional security measure)
CREATE OR REPLACE FUNCTION public.prevent_multiple_admins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  IF NEW.role = 'admin'::app_role THEN
    SELECT COUNT(*) INTO admin_count
    FROM public.user_roles
    WHERE role = 'admin'::app_role
    AND user_id != NEW.user_id;
    
    IF admin_count > 0 THEN
      RAISE EXCEPTION 'Only one admin user is allowed in the system';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce single admin rule
DROP TRIGGER IF EXISTS enforce_single_admin ON public.user_roles;
CREATE TRIGGER enforce_single_admin
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  WHEN (NEW.role = 'admin'::app_role)
  EXECUTE FUNCTION public.prevent_multiple_admins();