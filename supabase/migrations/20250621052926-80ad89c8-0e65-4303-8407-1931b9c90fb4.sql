
-- Create enum types only if they don't exist
DO $$ BEGIN
    CREATE TYPE bus_type AS ENUM ('seater', 'sleeper', 'both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('passenger', 'operator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update buses table with comprehensive details
ALTER TABLE buses 
ADD COLUMN IF NOT EXISTS bus_name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS fare_per_km NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS departure_time TIME,
ADD COLUMN IF NOT EXISTS arrival_time TIME,
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';

-- Create route_stops table for managing up to 5 stops per route
CREATE TABLE IF NOT EXISTS route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  stop_name TEXT NOT NULL,
  stop_order INTEGER NOT NULL,
  arrival_time TIME,
  departure_time TIME,
  fare_from_origin NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create operator_earnings table for tracking money
CREATE TABLE IF NOT EXISTS operator_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  withdrawn_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key constraints (only if they don't exist)
DO $$ BEGIN
    ALTER TABLE buses ADD CONSTRAINT fk_buses_operator FOREIGN KEY (operator_id) REFERENCES profiles(id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE schedules ADD CONSTRAINT fk_schedules_bus FOREIGN KEY (bus_id) REFERENCES buses(id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE schedules ADD CONSTRAINT fk_schedules_route FOREIGN KEY (route_id) REFERENCES routes(id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bookings ADD CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES profiles(id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bookings ADD CONSTRAINT fk_bookings_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE payments ADD CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_order ON route_stops(route_id, stop_order);
CREATE INDEX IF NOT EXISTS idx_operator_earnings_operator ON operator_earnings(operator_id);
CREATE INDEX IF NOT EXISTS idx_buses_operator ON buses(operator_id);

-- Add trigger to update booking reference (only if it doesn't exist)
CREATE OR REPLACE FUNCTION update_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
    NEW.booking_reference = generate_booking_reference();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_booking_reference ON bookings;
CREATE TRIGGER trigger_update_booking_reference
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_reference();

-- Add trigger to update available seats
DROP TRIGGER IF EXISTS trigger_update_available_seats ON bookings;
CREATE TRIGGER trigger_update_available_seats
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_available_seats();
