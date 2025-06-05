
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProductCatalogProps {
  user: any;
}

const ProductCatalog = ({ user }: ProductCatalogProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('list-products');
        if (error) throw error;
        setProducts(data.items);
      } catch (e) {
        toast.error('Erro ao carregar produtos');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handlePurchase = (productName: string, price: number) => {
    if (!user) {
      toast.error('Você precisa estar logado para comprar!');
      return;
    }

    const params = new URLSearchParams({
      name: productName,
      price: price.toString(),
    });
    window.location.href = `/checkout?${params.toString()}`;
  };

  return (
    <section id="products" className="py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          PRODUTOS ÉPICOS
        </h2>

        {loading ? (
          <p className="text-center text-white">Carregando...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-cyan-400/30 hover:border-cyan-400 transition-all hover:scale-105 group"
              >
                <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg mb-4 flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{product.name}</h4>
                <p className="text-2xl font-bold text-cyan-400 mb-4">R$ {product.price.toFixed(2)}</p>
                <button
                  onClick={() => handlePurchase(product.name, product.price)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 px-6 rounded-lg font-bold flex items-center justify-center space-x-2 hover:scale-105 transition-transform group-hover:shadow-lg group-hover:shadow-cyan-500/25"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>COMPRAR AGORA</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCatalog;
