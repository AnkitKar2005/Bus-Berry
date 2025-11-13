import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get('x-razorpay-signature');
    const body = await req.text();

    // Verify webhook signature
    if (signature) {
      const expectedSignature = createHmac('sha256', razorpayKeySecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const payload = JSON.parse(body);
    console.log('Razorpay webhook received:', payload.event);

    if (payload.event === 'payment.captured') {
      const paymentEntity = payload.payload.payment.entity;
      const bookingId = paymentEntity.notes?.booking_id;
      const paymentId = paymentEntity.id;

      if (!bookingId) {
        console.error('No booking_id in payment notes');
        return new Response(
          JSON.stringify({ error: 'Missing booking_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Call verify_payment RPC to update booking
      const { data, error } = await supabase.rpc('verify_payment', {
        p_booking_id: bookingId,
        p_transaction_id: paymentId
      });

      if (error) {
        console.error('Error verifying payment:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to verify payment' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Payment verified for booking:', bookingId);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
