
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Processing assign-admin-role request");
    
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const requestData = await req.json();
    const { userId, email } = requestData;

    console.log("Received userId:", userId, "email:", email);

    if (!userId && !email) {
      console.error("No userId or email provided in request body");
      return new Response(
        JSON.stringify({ error: "User ID or email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify that the user exists in the auth.users table
    let userExists = false;
    let foundUserId = userId;
    
    // Check if the user exists
    if (userId) {
      const { data: userData, error: userError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();
        
      if (userError) {
        console.log("User not found in profiles with ID:", userId);
        
        // Try to find by user_id in auth.users (requires admin privileges)
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (authUser?.user) {
          console.log("User found in auth.users:", authUser.user.id);
          userExists = true;
          
          // Create profile for the user if it doesn't exist
          const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .insert({ 
              id: userId,
              email: authUser.user.email,
              name: authUser.user.user_metadata?.name || authUser.user.email
            });
            
          if (profileError) {
            console.error("Error creating profile:", profileError);
          } else {
            console.log("Profile created for user:", userId);
          }
        }
      } else {
        userExists = true;
        console.log("User found in profiles:", userData);
      }
    } else if (email) {
      // If email is provided, find the user by email
      const { data: user, error: userError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();
        
      if (!userError && user) {
        foundUserId = user.id;
        userExists = true;
        console.log("User found by email:", email, "with ID:", foundUserId);
      } else {
        // Try to find by email in auth.users
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
        const matchingUser = authUsers?.users?.find(u => u.email === email);
        
        if (matchingUser) {
          foundUserId = matchingUser.id;
          userExists = true;
          console.log("User found in auth.users by email:", email, "with ID:", foundUserId);
          
          // Create profile for the user if it doesn't exist
          const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .insert({ 
              id: matchingUser.id,
              email: matchingUser.email,
              name: matchingUser.user_metadata?.name || matchingUser.email
            });
            
          if (profileError) {
            console.error("Error creating profile:", profileError);
          } else {
            console.log("Profile created for user:", matchingUser.id);
          }
        }
      }
    }

    if (!userExists) {
      console.error("User does not exist in the database");
      return new Response(
        JSON.stringify({ 
          error: "User does not exist in the database", 
          details: "The user must be created before assigning an admin role" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if user already has admin role
    const { data: existingRole, error: roleCheckError } = await supabaseAdmin
      .from("user_roles")
      .select("*")
      .eq("user_id", foundUserId)
      .eq("role", "admin");

    if (roleCheckError) {
      console.error("Error checking existing role:", roleCheckError);
    } else if (existingRole && existingRole.length > 0) {
      console.log("User already has admin role");
      return new Response(
        JSON.stringify({ success: true, message: "User already has admin role" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert the admin role using the service role client
    console.log("Assigning admin role to user:", foundUserId);
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: foundUserId, role: "admin" });

    if (error) {
      console.error("Error assigning admin role:", error);
      return new Response(
        JSON.stringify({ error: "Failed to assign admin role", details: error }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Admin role assigned successfully");
    return new Response(
      JSON.stringify({ success: true, message: "Admin role assigned successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Unexpected error in assign-admin-role function:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
