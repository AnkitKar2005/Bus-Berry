import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find bookings that are pending for more than 15 minutes
    const { data: expiredBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id, schedule_id, seat_numbers')
      .eq('status', 'pending')
      .eq('payment_verified', false)
      .lt('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());

    if (fetchError) {
      console.error('Error fetching expired bookings:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch expired bookings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let releasedCount = 0;

    for (const booking of expiredBookings || []) {
      // Cancel the booking
      const { error: cancelError } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (cancelError) {
        console.error(`Error cancelling booking ${booking.id}:`, cancelError);
        continue;
      }

      // Release the seats
      const { error: seatError } = await supabase
        .from('schedules')
        .update({ 
          available_seats: supabase.rpc('available_seats') + booking.seat_numbers.length 
        })
        .eq('id', booking.schedule_id);

      if (seatError) {
        console.error(`Error releasing seats for booking ${booking.id}:`, seatError);
      } else {
        releasedCount++;
        console.log(`Released ${booking.seat_numbers.length} seats for booking ${booking.id}`);
      }
    }

    console.log(`Released ${releasedCount} expired bookings`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        releasedCount,
        message: `Released ${releasedCount} expired bookings`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error releasing expired bookings:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
