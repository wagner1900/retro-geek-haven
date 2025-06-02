
import { Trophy, User, LogIn } from 'lucide-react';

interface HeaderProps {
  userPoints: number;
  user: any;
  onAuthClick: () => void;
}

const Header = ({ userPoints, user, onAuthClick }: HeaderProps) => {
  return (
    <header className="p-4 bg-black/30 backdrop-blur-sm border-b border-cyan-400/30">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            BELIEVESTORE
          </h1>
          <div className="hidden md:flex items-center space-x-6 text-white">
            <a href="#products" className="hover:text-cyan-400 transition-colors">Produtos</a>
            <a href="#games" className="hover:text-cyan-400 transition-colors">Games</a>
            <a href="#events" className="hover:text-cyan-400 transition-colors">Eventos</a>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-yellow-400/20 px-4 py-2 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-bold">{userPoints} pts</span>
          </div>
          
          {user ? (
            <div className="flex items-center space-x-2 text-cyan-400">
              <User className="w-5 h-5" />
              <span className="text-sm hidden md:block">{user.email}</span>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
