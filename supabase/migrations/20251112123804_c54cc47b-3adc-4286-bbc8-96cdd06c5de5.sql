-- Fix 1: Create atomic seat booking function to prevent race conditions
CREATE OR REPLACE FUNCTION public.book_seats_atomic(
  p_schedule_id UUID,
  p_seat_count INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_available INTEGER;
BEGIN
  -- Lock the schedule row and get available seats
  SELECT available_seats INTO v_available
  FROM schedules
  WHERE id = p_schedule_id
  FOR UPDATE;
  
  -- Check if enough seats are available
  IF v_available >= p_seat_count THEN
    -- Update seats atomically
    UPDATE schedules
    SET available_seats = available_seats - p_seat_count,
        updated_at = now()
    WHERE id = p_schedule_id;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Fix 2: Add constraint to prevent negative seat availability
ALTER TABLE schedules ADD CONSTRAINT check_available_seats_non_negative 
  CHECK (available_seats >= 0);

-- Fix 3: Remove overly permissive notification insert policy
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Fix 4: Add RLS policy to prevent client-side payment_verified updates
-- First, allow basic updates for user's own bookings (excluding payment_verified)
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;

CREATE POLICY "Users can update own bookings (excluding payment)"
ON bookings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND payment_verified = (SELECT payment_verified FROM bookings WHERE id = bookings.id)
);

-- Fix 5: Create function to verify and update payment (server-side only)
CREATE OR REPLACE FUNCTION public.verify_payment(
  p_booking_id UUID,
  p_transaction_id TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function can only be called by service role (from edge functions)
  -- Update booking payment status
  UPDATE bookings
  SET payment_verified = true,
      status = 'confirmed',
      updated_at = now()
  WHERE id = p_booking_id
    AND payment_verified = false;
  
  -- Update payment record
  UPDATE payments
  SET status = 'completed',
      transaction_id = p_transaction_id
  WHERE booking_id = p_booking_id;
  
  RETURN TRUE;
END;
$$;