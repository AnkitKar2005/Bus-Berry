-- Create storage buckets for bus images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('bus-images', 'bus-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for bus images
CREATE POLICY "Anyone can view bus images"
ON storage.objects FOR SELECT
USING (bucket_id = 'bus-images');

CREATE POLICY "Operators can upload bus images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bus-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Operators can delete own bus images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'bus-images' AND
  auth.uid() IS NOT NULL
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(booking_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_schedule_id ON public.bookings(schedule_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_buses_operator_id ON public.buses(operator_id);
CREATE INDEX IF NOT EXISTS idx_buses_approval_status ON public.buses(approval_status);
CREATE INDEX IF NOT EXISTS idx_reviews_bus_id ON public.reviews(bus_id);
CREATE INDEX IF NOT EXISTS idx_reviews_operator_id ON public.reviews(operator_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Add rating columns to buses table
ALTER TABLE public.buses 
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for reviews
CREATE POLICY "Users can view all reviews"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create reviews for own bookings"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = reviews.booking_id 
    AND bookings.user_id = auth.uid()
    AND bookings.status = 'confirmed'
  )
);

CREATE POLICY "Users can update own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
ON public.reviews FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Function to update bus ratings
CREATE OR REPLACE FUNCTION update_bus_ratings()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to update ratings
DROP TRIGGER IF EXISTS update_bus_ratings_trigger ON public.reviews;
CREATE TRIGGER update_bus_ratings_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_bus_ratings();

-- Function to create booking notification
CREATE OR REPLACE FUNCTION create_booking_notification()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger for booking notifications
DROP TRIGGER IF EXISTS booking_notification_trigger ON public.bookings;
CREATE TRIGGER booking_notification_trigger
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION create_booking_notification();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to get bus analytics
CREATE OR REPLACE FUNCTION get_analytics_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  total_bookings BIGINT,
  total_revenue NUMERIC,
  total_users BIGINT,
  total_buses BIGINT,
  bookings_trend JSONB,
  revenue_trend JSONB
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;