
import { useState } from 'react';
import { ShoppingCart, User, Star } from 'lucide-react';

interface HeaderProps {
  userPoints: number;
}

const Header = ({ userPoints }: HeaderProps) => {
  const [cartItems, setCartItems] = useState(0);

  return (
    <header className="relative z-50 bg-black/80 backdrop-blur-sm border-b-2 border-cyan-400">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">B</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                BelieveStore
              </h1>
              <p className="text-xs text-gray-400">Ultimate Geek Paradise</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#products" className="text-white hover:text-cyan-400 transition-colors font-pixel">
              Produtos
            </a>
            <a href="#games" className="text-white hover:text-cyan-400 transition-colors font-pixel">
              Mini-Games
            </a>
            <a href="#events" className="text-white hover:text-cyan-400 transition-colors font-pixel">
              Eventos
            </a>
            <a href="#leaderboard" className="text-white hover:text-cyan-400 transition-colors font-pixel">
              Ranking
            </a>
          </nav>

          {/* User actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-yellow-400/20 px-3 py-2 rounded-lg">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">{userPoints}</span>
            </div>
            <button className="relative p-2 text-white hover:text-cyan-400 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems}
                </span>
              )}
            </button>
            <button className="p-2 text-white hover:text-cyan-400 transition-colors">
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
