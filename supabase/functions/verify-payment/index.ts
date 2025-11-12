import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { bookingId, transactionId, paymentGateway } = await req.json();

    if (!bookingId || !transactionId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Booking ID and transaction ID are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Verifying payment for booking: ${bookingId}`);

    // TODO: Add actual payment gateway verification here
    // For now, we'll just verify the transaction ID exists
    // In production, you would:
    // 1. Call payment gateway API to verify transaction
    // 2. Check transaction amount matches booking amount
    // 3. Verify transaction status is successful

    // Call the verify_payment database function
    const { data, error } = await supabaseAdmin.rpc('verify_payment', {
      p_booking_id: bookingId,
      p_transaction_id: transactionId,
    });

    if (error) {
      console.error("Payment verification error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to verify payment",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Payment verified successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and booking confirmed",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
