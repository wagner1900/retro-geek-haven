
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
    console.log('Iniciando busca de produtos do Stripe...');
    
    // Usar a chave secreta do Stripe configurada
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "sk_test_REPLACE_ME";
    
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY não encontrada");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Buscar produtos ativos
    console.log('Buscando produtos...');
    const products = await stripe.products.list({ 
      active: true, 
      limit: 100,
      expand: ['data.default_price']
    });

    console.log(`Encontrados ${products.data.length} produtos`);

    // Buscar preços ativos
    console.log('Buscando preços...');
    const prices = await stripe.prices.list({ 
      active: true, 
      limit: 100 
    });

    console.log(`Encontrados ${prices.data.length} preços`);

    // Mapear produtos com seus preços
    const items = products.data.map((product) => {
      console.log(`Processando produto: ${product.name}`);
      
      // Tentar encontrar o preço padrão primeiro
      let price = null;
      if (product.default_price) {
        if (typeof product.default_price === 'string') {
          price = prices.data.find(p => p.id === product.default_price);
        } else {
          price = product.default_price;
        }
      }
      
      // Se não encontrou preço padrão, buscar qualquer preço do produto
      if (!price) {
        price = prices.data.find((p) => p.product === product.id);
      }

      const unitAmount = price?.unit_amount || 0;
      const currency = price?.currency || 'brl';
      
      // Converter de centavos para reais se a moeda for BRL
      const finalPrice = currency === 'brl' ? unitAmount / 100 : unitAmount / 100;

      console.log(`Produto ${product.name}: R$ ${finalPrice}`);

      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        image: product.images?.[0] || "/placeholder.svg",
        price: finalPrice,
        currency: currency,
        price_id: price?.id || null,
        active: product.active,
        metadata: product.metadata || {}
      };
    });

    console.log(`Retornando ${items.length} produtos processados`);

    return new Response(JSON.stringify({ 
      success: true,
      items,
      total: items.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      items: []
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
