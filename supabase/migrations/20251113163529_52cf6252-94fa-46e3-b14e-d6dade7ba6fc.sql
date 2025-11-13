-- Create audit_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Create index for performance
CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Create coupon_applications table to track coupon usage
CREATE TABLE IF NOT EXISTS public.coupon_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  discount_amount numeric NOT NULL,
  applied_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(coupon_id, booking_id)
);

-- Enable RLS on coupon_applications
ALTER TABLE public.coupon_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own coupon applications
CREATE POLICY "Users can view own coupon applications"
ON public.coupon_applications FOR SELECT
USING (auth.uid() = user_id);

-- System can create coupon applications (called from RPC)
CREATE POLICY "System can create coupon applications"
ON public.coupon_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_coupon_applications_user_id ON public.coupon_applications(user_id);
CREATE INDEX idx_coupon_applications_coupon_id ON public.coupon_applications(coupon_id);

-- Create rate_limits table for rate limiting tracking
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address inet,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1 NOT NULL,
  window_start timestamp with time zone DEFAULT now() NOT NULL,
  window_end timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT user_or_ip_required CHECK (user_id IS NOT NULL OR ip_address IS NOT NULL)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can access rate limits (for RPC functions)
CREATE POLICY "System manages rate limits"
ON public.rate_limits FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_rate_limits_user_id ON public.rate_limits(user_id);
CREATE INDEX idx_rate_limits_ip_endpoint ON public.rate_limits(ip_address, endpoint);
CREATE INDEX idx_rate_limits_window_end ON public.rate_limits(window_end);

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_actor_id uuid,
  p_action text,
  p_target_type text,
  p_target_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, metadata)
  VALUES (p_actor_id, p_action, p_target_type, p_target_id, p_metadata)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION public.validate_and_apply_coupon(
  p_coupon_code text,
  p_user_id uuid,
  p_total_fare numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon public.coupons;
  v_discount_amount numeric;
  v_usage_count integer;
BEGIN
  -- Find the coupon
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE code = UPPER(p_coupon_code)
    AND is_active = true
    AND valid_from <= now()
    AND valid_until >= now();
  
  -- Check if coupon exists
  IF v_coupon.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired coupon code');
  END IF;
  
  -- Check minimum fare requirement
  IF v_coupon.min_fare IS NOT NULL AND p_total_fare < v_coupon.min_fare THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Minimum fare of ₹' || v_coupon.min_fare || ' required'
    );
  END IF;
  
  -- Check usage limit
  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit THEN
    RETURN jsonb_build_object('success', false, 'error', 'Coupon usage limit reached');
  END IF;
  
  -- Calculate discount
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount_amount := (p_total_fare * v_coupon.discount_value / 100);
  ELSE
    v_discount_amount := v_coupon.discount_value;
  END IF;
  
  -- Apply max discount cap
  IF v_coupon.max_discount IS NOT NULL AND v_discount_amount > v_coupon.max_discount THEN
    v_discount_amount := v_coupon.max_discount;
  END IF;
  
  -- Ensure discount doesn't exceed total fare
  IF v_discount_amount > p_total_fare THEN
    v_discount_amount := p_total_fare;
  END IF;
  
  -- Increment usage count
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE id = v_coupon.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'coupon_id', v_coupon.id,
    'discount_amount', v_discount_amount
  );
END;
$$;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_endpoint text DEFAULT 'booking',
  p_max_requests integer DEFAULT 10,
  p_window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count integer;
  v_window_start timestamp with time zone;
  v_window_end timestamp with time zone;
BEGIN
  v_window_start := now();
  v_window_end := now() + (p_window_minutes || ' minutes')::interval;
  
  -- Clean up expired rate limit records
  DELETE FROM public.rate_limits
  WHERE window_end < now();
  
  -- Check existing rate limit
  SELECT request_count INTO v_current_count
  FROM public.rate_limits
  WHERE (
    (p_user_id IS NOT NULL AND user_id = p_user_id) OR
    (p_ip_address IS NOT NULL AND ip_address = p_ip_address)
  )
  AND endpoint = p_endpoint
  AND window_end > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no existing record or under limit
  IF v_current_count IS NULL THEN
    -- Create new rate limit record
    INSERT INTO public.rate_limits (user_id, ip_address, endpoint, request_count, window_start, window_end)
    VALUES (p_user_id, p_ip_address, p_endpoint, 1, v_window_start, v_window_end);
    RETURN true;
  ELSIF v_current_count < p_max_requests THEN
    -- Increment count
    UPDATE public.rate_limits
    SET request_count = request_count + 1
    WHERE (
      (p_user_id IS NOT NULL AND user_id = p_user_id) OR
      (p_ip_address IS NOT NULL AND ip_address = p_ip_address)
    )
    AND endpoint = p_endpoint
    AND window_end > now();
    RETURN true;
  ELSE
    -- Rate limit exceeded
    RETURN false;
  END IF;
END;
$$;