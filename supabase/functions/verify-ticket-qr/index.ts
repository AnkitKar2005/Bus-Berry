import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { qrData } = await req.json();

    if (!qrData || typeof qrData !== 'string') {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid QR data format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const qrSecret = Deno.env.get('QR_SIGNATURE_SECRET')!;

    // Split QR data into payload and signature
    const parts = qrData.split('.');
    if (parts.length !== 2) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid QR format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const [base64Payload, providedSignature] = parts;

    // Decode payload
    let payload;
    try {
      const payloadString = atob(base64Payload);
      payload = JSON.parse(payloadString);
    } catch (e) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid payload encoding' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify signature
    const encoder = new TextEncoder();
    const data = encoder.encode(atob(base64Payload));
    const keyData = encoder.encode(qrSecret);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = new Uint8Array(
      providedSignature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      data
    );

    if (!isValid) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check timestamp freshness (prevent replay of old QR codes)
    const ageInHours = (Date.now() - payload.timestamp) / (1000 * 60 * 60);
    if (ageInHours > 48) {
      return new Response(
        JSON.stringify({ valid: false, error: 'QR code expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ valid: true, payload }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error verifying QR code:', error);
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
