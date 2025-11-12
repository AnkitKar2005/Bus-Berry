-- Fix Function Search Path Mutable issue
-- Add search_path to functions that are missing it

-- Fix generate_booking_reference function
CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN 'BUS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$function$;

-- Fix update_bus_ratings function
CREATE OR REPLACE FUNCTION public.update_bus_ratings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.buses
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.reviews
      WHERE bus_id = NEW.bus_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE bus_id = NEW.bus_id
    )
  WHERE id = NEW.bus_id;
  
  RETURN NEW;
END;
$function$;

-- Fix can_cancel_booking function
CREATE OR REPLACE FUNCTION public.can_cancel_booking(booking_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  departure_time timestamp with time zone;
  now_time timestamp with time zone;
BEGIN
  SELECT s.departure_date + b.departure_time INTO departure_time
  FROM bookings bk
  JOIN schedules s ON s.id = bk.schedule_id
  JOIN buses b ON b.id = s.bus_id
  WHERE bk.id = booking_id;
  
  now_time := now();
  
  -- Check if departure is more than 6 hours away
  RETURN departure_time - now_time > interval '6 hours';
END;
$function$;

-- Fix setup_admin_user function
CREATE OR REPLACE FUNCTION public.setup_admin_user(admin_email text, admin_password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix create_booking_notification function
CREATE OR REPLACE FUNCTION public.create_booking_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Notify user about booking confirmation
  IF NEW.status = 'confirmed' AND NEW.payment_verified = true THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.user_id,
      'booking_confirmed',
      'Booking Confirmed',
      'Your booking ' || NEW.booking_reference || ' has been confirmed!',
      jsonb_build_object('booking_id', NEW.id, 'booking_reference', NEW.booking_reference)
    );
  END IF;
  
  -- Notify about cancellation
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.user_id,
      'booking_cancelled',
      'Booking Cancelled',
      'Your booking ' || NEW.booking_reference || ' has been cancelled.',
      jsonb_build_object('booking_id', NEW.id, 'booking_reference', NEW.booking_reference)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix get_analytics_stats function
CREATE OR REPLACE FUNCTION public.get_analytics_stats(days_back integer DEFAULT 30)
RETURNS TABLE(total_bookings bigint, total_revenue numeric, total_users bigint, total_buses bigint, bookings_trend jsonb, revenue_trend jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  WITH booking_stats AS (
    SELECT 
      COUNT(*) as total_bookings,
      SUM(total_fare) as total_revenue
    FROM public.bookings
    WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
  ),
  user_count AS (
    SELECT COUNT(*) as total_users
    FROM public.profiles
  ),
  bus_count AS (
    SELECT COUNT(*) as total_buses
    FROM public.buses
    WHERE approval_status = 'approved'
  ),
  daily_bookings AS (
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as count,
      SUM(total_fare) as revenue
    FROM public.bookings
    WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at)
  )
  SELECT 
    bs.total_bookings,
    bs.total_revenue,
    uc.total_users,
    bc.total_buses,
    (SELECT jsonb_agg(jsonb_build_object('date', date, 'count', count)) FROM daily_bookings) as bookings_trend,
    (SELECT jsonb_agg(jsonb_build_object('date', date, 'revenue', revenue)) FROM daily_bookings) as revenue_trend
  FROM booking_stats bs, user_count uc, bus_count bc;
END;
$function$;