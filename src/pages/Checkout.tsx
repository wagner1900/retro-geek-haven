
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

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return numbers.slice(0, 5) + '-' + numbers.slice(5, 8);
  };

  const validateCep = (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    return cleanCep.length === 8;
  };

  const calculateShipping = async () => {
    if (!cep) {
      toast.error('Por favor, digite o CEP');
      return;
    }

    if (!validateCep(cep)) {
      toast.error('CEP deve ter 8 dígitos');
      return;
    }

    setLoadingFrete(true);
    console.log('Calculando frete para CEP:', cep);

    try {
      const sanitizedCep = cep.replace(/\D/g, '');
      
      // Simulação de cálculo de frete baseado na região
      const cepNumber = parseInt(sanitizedCep);
      let calculatedShipping = fallbackShipping;

      if (cepNumber >= 1000000 && cepNumber <= 19999999) {
        // Região Sudeste
        calculatedShipping = 15;
      } else if (cepNumber >= 20000000 && cepNumber <= 28999999) {
        // Rio de Janeiro
        calculatedShipping = 18;
      } else if (cepNumber >= 40000000 && cepNumber <= 48999999) {
        // Bahia
        calculatedShipping = 25;
      } else if (cepNumber >= 50000000 && cepNumber <= 56999999) {
        // Pernambuco
        calculatedShipping = 30;
      } else if (cepNumber >= 60000000 && cepNumber <= 63999999) {
        // Ceará
        calculatedShipping = 35;
      } else if (cepNumber >= 70000000 && cepNumber <= 76999999) {
        // Distrito Federal
        calculatedShipping = 22;
      } else if (cepNumber >= 80000000 && cepNumber <= 87999999) {
        // Paraná
        calculatedShipping = 20;
      } else if (cepNumber >= 90000000 && cepNumber <= 99999999) {
        // Rio Grande do Sul
        calculatedShipping = 28;
      }

      setShipping(calculatedShipping);
      toast.success(`Frete calculado: R$ ${calculatedShipping.toFixed(2)}`);
      console.log('Frete calculado:', calculatedShipping);
    } catch (e) {
      console.error('Erro ao calcular frete:', e);
      toast.error('Erro ao calcular frete. Usando valor padrão.');
      setShipping(fallbackShipping);
    } finally {
      setLoadingFrete(false);
    }
  };

  const handlePayment = async () => {
    if (!validateCep(cep)) {
      toast.error('Por favor, calcule o frete primeiro');
      return;
    }

    setLoadingPay(true);
    console.log('Iniciando pagamento...');
    
    try {
      const finalPrice = productPrice + shipping;
      
      // Criar nome do produto incluindo informação do frete
      const productNameWithShipping = `${productName} (inclui frete: R$ ${shipping.toFixed(2)})`;
      
      console.log('Dados do pagamento:', {
        productName: productNameWithShipping,
        price: finalPrice,
        originalPrice: productPrice,
        shipping: shipping
      });

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          productName: productNameWithShipping, 
          price: finalPrice 
        }
      });

      if (error) {
        console.error('Erro na função create-payment:', error);
        throw error;
      }

      console.log('Resposta do create-payment:', data);
      
      if (data.url) {
        console.log('Redirecionando para:', data.url);
        // Abrir o checkout do Stripe em uma nova aba
        window.open(data.url, '_blank');
        toast.success('Redirecionando para o pagamento...');
      } else {
        throw new Error('URL de pagamento não recebida');
      }
    } catch (e: any) {
      console.error('Erro ao iniciar pagamento:', e);
      toast.error(`Erro ao iniciar pagamento: ${e.message}`);
    } finally {
      setLoadingPay(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setCep(formatted);
  };

  const total = productPrice + shipping;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-cyan-400/30 w-full max-w-md space-y-4 text-white">
        <h1 className="text-2xl font-bold text-center">Finalizar Compra</h1>
        <p><strong>Produto:</strong> {productName}</p>
        <p><strong>Preço:</strong> R$ {productPrice.toFixed(2)}</p>

        <div className="space-y-2">
          <label className="block text-sm font-medium">CEP de entrega:</label>
          <input
            type="text"
            placeholder="00000-000"
            value={cep}
            onChange={handleCepChange}
            maxLength={9}
            className="w-full px-4 py-2 bg-black/50 border border-cyan-400/30 rounded-lg focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <button
          onClick={calculateShipping}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg disabled:opacity-50"
          disabled={loadingFrete || !cep}
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
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
          disabled={loadingPay || !validateCep(cep)}
        >
          {loadingPay ? 'Processando...' : `Pagar R$ ${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
