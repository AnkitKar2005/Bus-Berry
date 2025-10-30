-- Create enum for bus types
CREATE TYPE bus_type AS ENUM ('ac', 'non_ac', 'sleeper', 'semi_sleeper', 'luxury');

-- Create enum for booking status
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Create enum for payment status
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('passenger', 'operator', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'passenger',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create routes table
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance NUMERIC NOT NULL,
  duration TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create buses table
CREATE TABLE public.buses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  bus_name TEXT NOT NULL,
  registration_no TEXT NOT NULL UNIQUE,
  bus_type bus_type NOT NULL,
  total_seats INTEGER NOT NULL,
  fare_per_km NUMERIC NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  amenities TEXT[],
  features TEXT[],
  images TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create schedules table
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id UUID REFERENCES public.buses(id) ON DELETE CASCADE,
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
  departure_date DATE NOT NULL,
  available_seats INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create route_stops table
CREATE TABLE public.route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
  stop_name TEXT NOT NULL,
  stop_order INTEGER NOT NULL,
  arrival_time TIME NOT NULL,
  departure_time TIME NOT NULL,
  fare_from_origin NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
  booking_reference TEXT UNIQUE NOT NULL,
  passenger_name TEXT NOT NULL,
  passenger_phone TEXT NOT NULL,
  passenger_email TEXT NOT NULL,
  seat_numbers INTEGER[] NOT NULL,
  total_fare NUMERIC NOT NULL,
  status booking_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT UNIQUE,
  status payment_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  min_fare NUMERIC,
  max_discount NUMERIC,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create operator_earnings table
CREATE TABLE public.operator_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  commission NUMERIC NOT NULL,
  net_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'withdrawn')),
  withdrawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for routes (public read, operators can create)
CREATE POLICY "Anyone can view routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Operators can create routes" ON public.routes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('operator', 'admin'))
);
CREATE POLICY "Operators can update own routes" ON public.routes FOR UPDATE USING (true);

-- RLS Policies for buses
CREATE POLICY "Anyone can view active buses" ON public.buses FOR SELECT USING (true);
CREATE POLICY "Operators can create buses" ON public.buses FOR INSERT WITH CHECK (
  auth.uid() = operator_id
);
CREATE POLICY "Operators can update own buses" ON public.buses FOR UPDATE USING (
  auth.uid() = operator_id
);
CREATE POLICY "Operators can delete own buses" ON public.buses FOR DELETE USING (
  auth.uid() = operator_id
);

-- RLS Policies for schedules
CREATE POLICY "Anyone can view schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Operators can create schedules" ON public.schedules FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.buses WHERE id = bus_id AND operator_id = auth.uid())
);
CREATE POLICY "Operators can update own schedules" ON public.schedules FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.buses WHERE id = bus_id AND operator_id = auth.uid())
);

-- RLS Policies for route_stops
CREATE POLICY "Anyone can view route stops" ON public.route_stops FOR SELECT USING (true);
CREATE POLICY "Operators can create route stops" ON public.route_stops FOR INSERT WITH CHECK (true);

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.schedules s 
    JOIN public.buses b ON s.bus_id = b.id 
    WHERE s.id = schedule_id AND b.operator_id = auth.uid()
  )
);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (
  auth.uid() = user_id
);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (
  auth.uid() = user_id
);

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid())
);

-- RLS Policies for coupons
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for operator_earnings
CREATE POLICY "Operators can view own earnings" ON public.operator_earnings FOR SELECT USING (
  auth.uid() = operator_id
);
CREATE POLICY "System can create earnings" ON public.operator_earnings FOR INSERT WITH CHECK (true);
CREATE POLICY "Operators can update own earnings" ON public.operator_earnings FOR UPDATE USING (
  auth.uid() = operator_id
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buses_updated_at BEFORE UPDATE ON public.buses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
BEGIN
  RETURN 'BUS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'passenger')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();