
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Package, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const siteUrl = typeof window !== 'undefined'
    ? (import.meta.env.VITE_SITE_URL || window.location.origin)
    : '';

  const pageDescription = 'Pagamento confirmado na BelieveStore. Veja os detalhes do seu pedido e próxima etapa de entrega.';
  const keywords = [
    'pagamento confirmado',
    'confirmação de pedido',
    'BelieveStore',
    'loja geek',
    'status do pedido',
  ];

  const structuredData = siteUrl ? {
    '@context': 'https://schema.org',
    '@type': 'Order',
    name: 'Pedido BelieveStore',
    orderStatus: 'https://schema.org/PaymentComplete',
    url: `${siteUrl}/payment-success`,
  } : undefined;

  const seoProps = {
    title: 'Pagamento confirmado | BelieveStore',
    description: pageDescription,
    url: '/payment-success',
    keywords,
    structuredData,
    noIndex: true,
  };

  useEffect(() => {
    if (sessionId) {
      loadOrderDetails();
    }
  }, [sessionId]);

  const loadOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .single();

      if (error) throw error;

      if (data) {
        setOrderDetails(data);
        // Marcar como pago
        await supabase
          .from('orders')
          .update({ status: 'paid' })
          .eq('id', data.id);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar detalhes do pedido: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <SEO {...seoProps} />
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO {...seoProps} />
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-green-400/30 text-center max-w-md w-full">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />

          <h1 className="text-3xl font-bold text-white mb-4">Pagamento Confirmado!</h1>

          <div className="bg-green-500/20 rounded-lg p-4 mb-6">
            <Package className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-white font-bold">Seu pedido foi processado com sucesso</p>
          </div>

          {orderDetails && (
            <div className="bg-white/10 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-cyan-400 font-bold mb-2">Detalhes do Pedido:</h3>
              <p className="text-white"><strong>Produto:</strong> {orderDetails.product_name}</p>
              <p className="text-white"><strong>Valor:</strong> R$ {(orderDetails.amount / 100).toFixed(2)}</p>
              <p className="text-white"><strong>Status:</strong> Pago ✅</p>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-gray-300">
              Você receberá um email de confirmação em breve com os detalhes da entrega.
            </p>
            <p className="text-gray-300">
              O endereço informado no checkout do Stripe será usado para calcular e confirmar o frete.
            </p>
            <p className="text-gray-300">
              O produto será entregue aos Correios em até 7 dias úteis após a confirmação do pagamento.
            </p>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 px-6 rounded-lg font-bold hover:scale-105 transition-transform flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar à Loja</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
