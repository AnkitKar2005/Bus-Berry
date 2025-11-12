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

    // Admin credentials - CHANGE THESE BEFORE FIRST RUN
    const ADMIN_EMAIL = "admin@busbooker.com";
    const ADMIN_PASSWORD = "BusBooker@Admin2024!";

    console.log("Checking for existing admin user...");

    // Check if admin user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const adminExists = existingUser.users.find((u) => u.email === ADMIN_EMAIL);

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

      // Return generic message to prevent user enumeration
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
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
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

    // Return generic message to prevent user enumeration
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
