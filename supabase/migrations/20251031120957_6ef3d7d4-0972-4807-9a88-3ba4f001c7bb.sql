-- Create app_role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'operator', 'passenger');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table with proper security
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS issues)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin');
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles" ON public.user_roles
FOR ALL
USING (public.is_admin(auth.uid()));

-- Drop the problematic profiles policy and replace it
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Make profiles.role column read-only by removing update capability
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile (except role)" ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Update existing RLS policies to use the new roles system
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" ON public.coupons
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Operators can create routes" ON public.routes;
CREATE POLICY "Operators can create routes" ON public.routes
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'operator') OR public.is_admin(auth.uid()));

-- Fix route_stops policies to verify ownership
DROP POLICY IF EXISTS "Operators can create route stops" ON public.route_stops;

CREATE POLICY "Operators can create stops for own routes" ON public.route_stops
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.routes r
    JOIN public.schedules s ON s.route_id = r.id
    JOIN public.buses b ON b.id = s.bus_id
    WHERE r.id = route_stops.route_id
      AND b.operator_id = auth.uid()
  )
);

CREATE POLICY "Operators can update own route stops" ON public.route_stops
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.routes r
    JOIN public.schedules s ON s.route_id = r.id
    JOIN public.buses b ON b.id = s.bus_id
    WHERE r.id = route_stops.route_id
      AND b.operator_id = auth.uid()
  )
);

CREATE POLICY "Operators can delete own route stops" ON public.route_stops
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.routes r
    JOIN public.schedules s ON s.route_id = r.id
    JOIN public.buses b ON b.id = s.bus_id
    WHERE r.id = route_stops.route_id
      AND b.operator_id = auth.uid()
  )
);

-- Fix routes UPDATE policy to verify ownership
DROP POLICY IF EXISTS "Operators can update own routes" ON public.routes;

CREATE POLICY "Operators can update own routes" ON public.routes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.schedules s
    JOIN public.buses b ON b.id = s.bus_id
    WHERE s.route_id = routes.id
      AND b.operator_id = auth.uid()
  )
);

-- Update handle_new_user trigger to create default passenger role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'passenger')
  );
  
  -- Insert role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'passenger')
  );
  
  RETURN NEW;
END;
$$;