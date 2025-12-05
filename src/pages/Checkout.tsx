
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const productName = searchParams.get('name') || '';
  const productPrice = parseFloat(searchParams.get('price') || '0');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [uf, setUf] = useState('');
  const fallbackShipping = 35; // Valor padrão mais alto para longas distâncias
  const [shipping, setShipping] = useState<number>(fallbackShipping);
  const [loadingFrete, setLoadingFrete] = useState(false);
  const [loadingPay, setLoadingPay] = useState(false);

  const siteUrl = typeof window !== 'undefined'
    ? (import.meta.env.VITE_SITE_URL || window.location.origin)
    : '';

  const pageTitle = productName
    ? `Comprar ${productName} | Checkout BelieveStore`
    : 'Checkout | BelieveStore';

  const pageDescription = productName
    ? `Finalize a compra de ${productName} com cálculo de frete dinâmico e pagamento seguro na BelieveStore.`
    : 'Finalize suas compras com frete calculado automaticamente e pagamento seguro na BelieveStore.';

  const keywords = [
    'checkout geek',
    'pagamento seguro',
    'BelieveStore',
    'frete calculado',
    'loja geek',
  ];

  const checkoutStructuredData = siteUrl ? {
    '@context': 'https://schema.org',
    '@type': 'CheckoutPage',
    name: pageTitle,
    description: pageDescription,
    url: `${siteUrl}/checkout`,
    potentialAction: {
      '@type': 'BuyAction',
      target: `${siteUrl}/checkout`,
    },
  } : undefined;

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
      
      // Cálculo de frete baseado na distância de Fortaleza, CE
      const cepNumber = parseInt(sanitizedCep);
      let calculatedShipping = fallbackShipping;

      // Ceará (região local) - frete mais barato
      if (cepNumber >= 60000000 && cepNumber <= 63999999) {
        calculatedShipping = 12;
      } 
      // Nordeste (estados vizinhos) - frete médio
      else if (
        (cepNumber >= 40000000 && cepNumber <= 48999999) || // Bahia
        (cepNumber >= 50000000 && cepNumber <= 56999999) || // Pernambuco
        (cepNumber >= 57000000 && cepNumber <= 57999999) || // Alagoas
        (cepNumber >= 58000000 && cepNumber <= 58999999) || // Paraíba
        (cepNumber >= 59000000 && cepNumber <= 59999999) || // Rio Grande do Norte
        (cepNumber >= 64000000 && cepNumber <= 64999999) || // Piauí
        (cepNumber >= 65000000 && cepNumber <= 65999999)    // Maranhão
      ) {
        calculatedShipping = 18;
      }
      // Norte - distância média-alta
      else if (
        (cepNumber >= 66000000 && cepNumber <= 68999999) || // Pará/Amapá
        (cepNumber >= 69000000 && cepNumber <= 69999999) || // Acre/Amazonas/Roraima/Rondônia
        (cepNumber >= 77000000 && cepNumber <= 77999999)    // Tocantins
      ) {
        calculatedShipping = 32;
      }
      // Centro-Oeste - distância alta
      else if (
        (cepNumber >= 70000000 && cepNumber <= 76999999) || // Distrito Federal/Goiás
        (cepNumber >= 78000000 && cepNumber <= 78999999)    // Mato Grosso/Mato Grosso do Sul
      ) {
        calculatedShipping = 28;
      }
      // Sudeste - distância muito alta
      else if (
        (cepNumber >= 1000000 && cepNumber <= 19999999) ||  // São Paulo
        (cepNumber >= 20000000 && cepNumber <= 28999999) || // Rio de Janeiro
        (cepNumber >= 29000000 && cepNumber <= 29999999) || // Espírito Santo
        (cepNumber >= 30000000 && cepNumber <= 39999999)    // Minas Gerais
      ) {
        calculatedShipping = 38;
      }
      // Sul - distância máxima
      else if (
        (cepNumber >= 80000000 && cepNumber <= 87999999) || // Paraná
        (cepNumber >= 88000000 && cepNumber <= 89999999) || // Santa Catarina
        (cepNumber >= 90000000 && cepNumber <= 99999999)    // Rio Grande do Sul
      ) {
        calculatedShipping = 42;
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

    if (!address || !city || !uf) {
      toast.error('Por favor, preencha endereço, cidade e estado');
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
        shipping: shipping,
        address,
        city,
        uf
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
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        url="/checkout"
        keywords={keywords}
        structuredData={checkoutStructuredData}
      />

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

        <div className="space-y-2">
          <label className="block text-sm font-medium">Endereço:</label>
          <input
            type="text"
            placeholder="Rua, número e complemento"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2 bg-black/50 border border-cyan-400/30 rounded-lg focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Cidade:</label>
          <input
            type="text"
            placeholder="Cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-2 bg-black/50 border border-cyan-400/30 rounded-lg focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Estado:</label>
          <input
            type="text"
            placeholder="UF"
            value={uf}
            onChange={(e) => setUf(e.target.value.toUpperCase())}
            maxLength={2}
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
            <span>Frete (origem: Fortaleza/CE):</span>
            <span>R$ {shipping.toFixed(2)}</span>
          </div>
          <hr className="border-cyan-400/30" />
          <div className="flex justify-between text-lg font-bold text-cyan-400">
            <span>Total a Pagar:</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-sm text-center text-gray-300">
          Envio a partir de Fortaleza/CE. O produto será entregue aos Correios em até 7 dias úteis após a confirmação do pagamento.
        </p>

        <button
          onClick={handlePayment}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
          disabled={
            loadingPay ||
            !validateCep(cep) ||
            !address ||
            !city ||
            !uf
          }
        >
          {loadingPay ? 'Processando...' : `Pagar R$ ${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
