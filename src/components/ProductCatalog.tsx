
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCatalogProps {
  user: any;
}

const ProductCatalog = ({ user }: ProductCatalogProps) => {
  const categories = [
    {
      name: 'Action Figures',
      products: [
        { id: 1, name: 'Naruto Hokage Figure', price: 89.99, image: '/placeholder.svg', category: 'anime' },
        { id: 2, name: 'Goku Super Saiyan', price: 129.99, image: '/placeholder.svg', category: 'anime' },
        { id: 3, name: 'Link Breath of Wild', price: 149.99, image: '/placeholder.svg', category: 'games' },
      ]
    },
    {
      name: 'Mangás & Livros',
      products: [
        { id: 4, name: 'One Piece Vol. 100', price: 24.99, image: '/placeholder.svg', category: 'manga' },
        { id: 5, name: 'Attack on Titan Box', price: 199.99, image: '/placeholder.svg', category: 'manga' },
        { id: 6, name: 'Demon Slayer Complete', price: 159.99, image: '/placeholder.svg', category: 'manga' },
      ]
    },
    {
      name: 'Games & Acessórios',
      products: [
        { id: 7, name: 'Controle PS5 Personalizado', price: 299.99, image: '/placeholder.svg', category: 'games' },
        { id: 8, name: 'Teclado Mecânico RGB', price: 449.99, image: '/placeholder.svg', category: 'tech' },
        { id: 9, name: 'Headset Gamer 7.1', price: 199.99, image: '/placeholder.svg', category: 'tech' },
      ]
    }
  ];

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

        {categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 font-pixel">{category.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.products.map((product) => (
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
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductCatalog;
