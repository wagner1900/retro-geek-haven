import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const secret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!secret) {
      throw new Error("STRIPE_SECRET_KEY not set");
    }
    const stripe = new Stripe(secret, {
      apiVersion: "2023-10-16",
    });

    const products = await stripe.products.list({ active: true, limit: 100 });
    const prices = await stripe.prices.list({ active: true, limit: 100 });

    const items = products.data.map((product) => {
      const price = prices.data.find((p) => p.product === product.id);
      return {
        id: product.id,
        name: product.name,
        image: product.images?.[0] || "/placeholder.svg",
        price: price?.unit_amount ? price.unit_amount / 100 : 0,
      };
    });

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
