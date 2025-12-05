
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("Usuário não autenticado");
    }

    const { productName, productPrice, shippingCost, shippingAddress } = await req.json();

    if (!productName || typeof productName !== "string") {
      throw new Error("Nome do produto inválido");
    }

    if (typeof productPrice !== "number" || productPrice <= 0) {
      throw new Error("Preço do produto inválido");
    }

    if (typeof shippingCost !== "number" || shippingCost < 0) {
      throw new Error("Custo de frete inválido");
    }

    const shippingCity = shippingAddress?.city ?? "";
    const shippingState = shippingAddress?.uf ?? shippingAddress?.state ?? "";
    const shippingCep = shippingAddress?.cep ?? "";
    const shippingLine1 = shippingAddress?.address ?? shippingAddress?.line1 ?? "";

    if (!shippingCity || !shippingState || !shippingCep || !shippingLine1) {
      throw new Error("Endereço de entrega incompleto");
    }

    const shippingAmountCents = Math.round(shippingCost * 100);
    const productAmountCents = Math.round(productPrice * 100);
    const totalAmountCents = productAmountCents + shippingAmountCents;

    // Usar a chave secreta do Stripe configurada (somente modo de produção)
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada para produção");
    }

    if (stripeKey.startsWith("sk_test")) {
      throw new Error("STRIPE_SECRET_KEY deve ser uma chave live (sk_live_*) para aceitar cartões reais");
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      shipping_address_collection: {
        allowed_countries: ["BR"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: `Envio para ${shippingCity}/${shippingState}`,
            type: "fixed_amount",
            fixed_amount: {
              amount: shippingAmountCents,
              currency: "brl",
            },
            delivery_estimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
      ],
      metadata: {
        shipping_city: shippingCity,
        shipping_state: shippingState,
        shipping_cep: shippingCep,
        shipping_address_line: shippingLine1,
      },
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: { name: productName },
            unit_amount: productAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/`,
    });

    // Salvar pedido no banco
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseService.from("orders").insert({
      user_id: user.id,
      stripe_session_id: session.id,
      product_name: productName,
      amount: totalAmountCents,
      currency: "brl",
      status: "pending"
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
