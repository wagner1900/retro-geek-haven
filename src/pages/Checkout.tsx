
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const productName = searchParams.get('name') || '';
  const productPrice = parseFloat(searchParams.get('price') || '0');
  const [cep, setCep] = useState('');
  const fallbackShipping = 20;
  const [shipping, setShipping] = useState<number>(fallbackShipping);
  const [loadingFrete, setLoadingFrete] = useState(false);
  const [loadingPay, setLoadingPay] = useState(false);

  const calculateShipping = async () => {
    if (!cep) return;
    setLoadingFrete(true);
    try {
      const sanitizedCep = cep.replace(/\D/g, '');
      const params = new URLSearchParams({
        nCdEmpresa: '',
        sDsSenha: '',
        nCdServico: '04014',
        sCepOrigem: '01001000',
        sCepDestino: sanitizedCep,
        nVlPeso: '1',
        nCdFormato: '1',
        nVlComprimento: '20',
        nVlAltura: '20',
        nVlLargura: '20',
        nVlDiametro: '0',
        sCdMaoPropria: 'n',
        nVlValorDeclarado: '0',
        sCdAvisoRecebimento: 'n',
        StrRetorno: 'json'
      });
      const url = `https://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      const valor = data?.cServico?.[0]?.Valor || '0';
      const price = parseFloat(valor.replace(',', '.'));
      if (!isNaN(price) && price > 0) {
        setShipping(price);
      } else {
        setShipping(fallbackShipping);
      }
    } catch (e) {
      toast.error('Erro ao calcular frete. Usando valor padrão.');
      setShipping(fallbackShipping);
    } finally {
      setLoadingFrete(false);
    }
  };

  const handlePayment = async () => {
    setLoadingPay(true);
    try {
      const finalPrice = productPrice + shipping;
      
      // Criar nome do produto incluindo informação do frete
      const productNameWithShipping = `${productName} (inclui frete: R$ ${shipping.toFixed(2)})`;
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          productName: productNameWithShipping, 
          price: finalPrice 
        }
      });
      if (error) throw error;
      
      // Usar a chave pública do Stripe a partir das variáveis de ambiente
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      const stripe = (window as any).Stripe(stripeKey);
      
      if (stripe && data.sessionId) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch (e: any) {
      console.error('Erro ao iniciar pagamento:', e);
      toast.error('Erro ao iniciar pagamento');
    } finally {
      setLoadingPay(false);
    }
  };

  const total = productPrice + shipping;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-cyan-400/30 w-full max-w-md space-y-4 text-white">
        <h1 className="text-2xl font-bold text-center">Finalizar Compra</h1>
        <p><strong>Produto:</strong> {productName}</p>
        <p><strong>Preço:</strong> R$ {productPrice.toFixed(2)}</p>

        <input
          type="text"
          placeholder="CEP"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          className="w-full px-4 py-2 bg-black/50 border border-cyan-400/30 rounded-lg focus:border-cyan-400 focus:outline-none"
        />

        <button
          onClick={calculateShipping}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg"
          disabled={loadingFrete}
        >
          {loadingFrete ? 'Calculando...' : 'Calcular Frete'}
        </button>

        <div className="bg-white/10 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span>Produto:</span>
            <span>R$ {productPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Frete:</span>
            <span>R$ {shipping.toFixed(2)}</span>
          </div>
          <hr className="border-cyan-400/30" />
          <div className="flex justify-between text-lg font-bold text-cyan-400">
            <span>Total a Pagar:</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-sm text-center text-gray-300">
          O produto será entregue aos Correios em até 7 dias úteis após a confirmação do pagamento.
        </p>

        <button
          onClick={handlePayment}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 rounded-lg hover:scale-105 transition-transform"
          disabled={loadingPay}
        >
          {loadingPay ? 'Processando...' : `Pagar R$ ${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
