
import { ShoppingCart, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  currency: string;
  price_id?: string;
  active: boolean;
  metadata?: Record<string, string>;
}

interface ProductCatalogProps {
  user: any;
}

const ProductCatalog = ({ user }: ProductCatalogProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async (showToast = false) => {
    try {
      setRefreshing(true);
      console.log('Carregando produtos do Stripe...');
      
      const { data, error } = await supabase.functions.invoke('list-products');
      
      if (error) {
        console.error('Erro na função:', error);
        throw error;
      }

      console.log('Resposta da função:', data);

      if (data.success && data.items) {
        setProducts(data.items);
        console.log(`${data.items.length} produtos carregados`);
        if (showToast) {
          toast.success(`${data.items.length} produtos carregados do Stripe`);
        }
      } else {
        throw new Error(data.error || 'Resposta inválida da API');
      }
    } catch (e: any) {
      console.error('Erro ao carregar produtos:', e);
      toast.error(`Erro ao carregar produtos: ${e.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handlePurchase = (product: Product) => {
    if (!user) {
      toast.error('Você precisa estar logado para comprar!');
      return;
    }

    const params = new URLSearchParams({
      name: product.name,
      price: product.price.toString(),
      product_id: product.id,
      price_id: product.price_id || ''
    });
    window.location.href = `/checkout?${params.toString()}`;
  };

  const handleRefresh = () => {
    loadProducts(true);
  };

  return (
    <section id="products" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            PRODUTOS ÉPICOS
          </h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-white">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Carregando produtos do Stripe...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-white">
            <p className="text-xl mb-4">Nenhum produto encontrado</p>
            <p className="text-gray-400">Verifique se há produtos ativos cadastrados no Stripe</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-cyan-400/30 hover:border-cyan-400 transition-all hover:scale-105 group"
              >
                <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{product.name}</h4>
                {product.description && (
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{product.description}</p>
                )}
                <p className="text-2xl font-bold text-cyan-400 mb-4">
                  R$ {product.price.toFixed(2)}
                </p>
                <button
                  onClick={() => handlePurchase(product)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 px-6 rounded-lg font-bold flex items-center justify-center space-x-2 hover:scale-105 transition-transform group-hover:shadow-lg group-hover:shadow-cyan-500/25"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>COMPRAR AGORA</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div className="mt-8 text-center text-gray-400 text-sm">
            {products.length} produto{products.length !== 1 ? 's' : ''} carregado{products.length !== 1 ? 's' : ''} do Stripe
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCatalog;
