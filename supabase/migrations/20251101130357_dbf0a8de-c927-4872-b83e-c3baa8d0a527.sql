-- Add approval status for buses
ALTER TABLE public.buses ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add payment verification to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_verified boolean DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS qr_code_data text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone;

-- Add last_active tracking for users
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active timestamp with time zone DEFAULT now();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_buses_approval_status ON public.buses(approval_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_verified ON public.bookings(payment_verified);

-- Update RLS policy for buses to only show approved buses to public
DROP POLICY IF EXISTS "Anyone can view active buses" ON public.buses;
CREATE POLICY "Anyone can view approved active buses" ON public.buses
FOR SELECT USING (is_active = true AND approval_status = 'approved');

-- Allow operators to view their own buses regardless of approval status
CREATE POLICY "Operators can view own buses" ON public.buses
FOR SELECT USING (operator_id = auth.uid());

-- Admin can view all buses
CREATE POLICY "Admins can view all buses" ON public.buses
FOR SELECT USING (is_admin(auth.uid()));

-- Admin can update bus approval status
CREATE POLICY "Admins can update buses" ON public.buses
FOR UPDATE USING (is_admin(auth.uid()));

-- Admin can delete buses
CREATE POLICY "Admins can delete buses" ON public.buses
FOR DELETE USING (is_admin(auth.uid()));

-- Function to check if booking can be cancelled
CREATE OR REPLACE FUNCTION can_cancel_booking(booking_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;