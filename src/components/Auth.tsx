
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, LogIn, LogOut, UserPlus } from 'lucide-react';

interface AuthProps {
  user: any;
  onAuthChange: () => void;
}

const Auth = ({ user, onAuthChange }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Login realizado com sucesso!');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              display_name: name,
            }
          }
        });
        if (error) {
          if (error.message && error.message.toLowerCase().includes('already')) {
            toast.error('Email j\u00e1 cadastrado. Tente fazer login.');
            setIsLogin(true);
          } else {
            throw error;
          }
        } else {
          toast.success('Conta criada! Verifique seu email.');
        }
      }
      onAuthChange();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logout realizado!');
      onAuthChange();
    }
  };

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-cyan-400">
          <User className="w-5 h-5" />
          <span className="text-sm">{user.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-cyan-400/30">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setIsLogin(true)}
          className={`px-4 py-2 rounded-lg ${isLogin ? 'bg-cyan-500 text-white' : 'text-cyan-400'}`}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`px-4 py-2 rounded-lg ${!isLogin ? 'bg-cyan-500 text-white' : 'text-cyan-400'}`}
        >
          Cadastro
        </button>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-black/50 border border-cyan-400/30 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 bg-black/50 border border-cyan-400/30 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 bg-black/50 border border-cyan-400/30 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>{loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}</span>
        </button>
      </form>
    </div>
  );
};

export default Auth;
