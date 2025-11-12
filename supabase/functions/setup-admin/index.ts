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
    // SECURITY: This function requires service role authentication
    const authHeader = req.headers.get("Authorization");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Verify that request is using service role key
    if (!authHeader || !authHeader.includes(serviceRoleKey)) {
      console.error("Unauthorized: Service role key required");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized: This function requires service role access",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get admin credentials from request body
    const { adminEmail, adminPassword } = await req.json();

    if (!adminEmail || !adminPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Admin email and password are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate password strength
    if (adminPassword.length < 12) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Password must be at least 12 characters long",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Checking for existing admin user...");

    // Check if admin user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const adminExists = existingUser.users.find((u) => u.email === adminEmail);

    if (adminExists) {
      console.log("Admin user already exists");
      
      // Ensure admin role is assigned
      const { data: roleData } = await supabaseAdmin
        .from("user_roles")
        .select("*")
        .eq("user_id", adminExists.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        // Assign admin role
        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: adminExists.id, role: "admin" });

        if (roleError) {
          throw new Error(`Failed to assign admin role: ${roleError.message}`);
        }
        console.log("Admin role assigned");
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Admin setup request processed successfully",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Creating new admin user...");

    // Create admin user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "System Administrator",
        role: "admin",
      },
    });

    if (createError || !newUser.user) {
      throw new Error(`Failed to create admin user: ${createError?.message}`);
    }

    console.log("Admin user created, assigning role...");

    // Assign admin role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role: "admin" });

    if (roleError) {
      throw new Error(`Failed to assign admin role: ${roleError.message}`);
    }

    console.log("Admin setup complete");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin setup request processed successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Setup admin error:", error);
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
