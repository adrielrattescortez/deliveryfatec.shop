
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    const requestData = await req.json();
    const { paymentIntentId } = requestData;
    
    if (!paymentIntentId) {
      throw new Error("Payment Intent ID is required");
    }
    
    // Recuperar o PaymentIntent do Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Inicializar o cliente Supabase para atualizar o pedido
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false } }
    );
    
    let orderStatus = "awaiting_payment";
    
    // Verificar o status do pagamento
    if (paymentIntent.status === "succeeded") {
      orderStatus = "pending"; // Pagamento confirmado, pedido pendente
      
      // Atualizar o status do pedido no banco de dados
      await supabaseAdmin
        .from("orders")
        .update({ status: orderStatus })
        .eq("payment_intent_id", paymentIntentId);
    }
    
    return new Response(
      JSON.stringify({
        status: orderStatus,
        payment_status: paymentIntent.status
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error checking payment status:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
