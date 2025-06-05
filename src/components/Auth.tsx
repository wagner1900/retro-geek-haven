
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

  // Função para limpar estado de autenticação
  const cleanupAuthState = () => {
    // Limpar tokens do localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Limpar tokens do sessionStorage se existir
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Limpar estado antes de fazer login
        cleanupAuthState();
        
        // Tentar logout global primeiro
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch (err) {
          // Continuar mesmo se o logout falhar
          console.log('Logout preventivo falhou, continuando...');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email ou senha incorretos. Verifique suas credenciais.');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Email não confirmado. Verifique sua caixa de entrada.');
          } else {
            toast.error(`Erro no login: ${error.message}`);
          }
          return;
        }

        if (data.user) {
          toast.success('Login realizado com sucesso!');
          onAuthChange();
          // Forçar recarregamento da página para garantir estado limpo
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      } else {
        // Cadastro
        const redirectUrl = window.location.origin;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              display_name: name,
            }
          }
        });
        
        if (error) {
          if (error.message.includes('User already registered')) {
            toast.error('Este email já está cadastrado. Tente fazer login.');
            setIsLogin(true);
          } else if (error.message.includes('Password should be at least')) {
            toast.error('A senha deve ter pelo menos 6 caracteres.');
          } else if (error.message.includes('Unable to validate email address')) {
            toast.error('Email inválido. Verifique o formato do email.');
          } else {
            toast.error(`Erro no cadastro: ${error.message}`);
          }
          return;
        }

        if (data.user) {
          if (data.user.email_confirmed_at) {
            toast.success('Conta criada e confirmada! Fazendo login...');
            onAuthChange();
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          } else {
            toast.success('Conta criada! Verifique seu email para confirmar.');
          }
        }
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      toast.error(`Erro inesperado: ${error.message || 'Tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Limpar estado primeiro
      cleanupAuthState();
      
      // Fazer logout
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('Erro no logout:', error);
        toast.error(`Erro no logout: ${error.message}`);
      } else {
        toast.success('Logout realizado com sucesso!');
      }
      
      // Sempre chamar onAuthChange e recarregar a página
      onAuthChange();
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error: any) {
      console.error('Erro no logout:', error);
      toast.error('Erro no logout. Recarregando a página...');
      window.location.href = '/';
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
          className={`px-4 py-2 rounded-lg transition-colors ${
            isLogin ? 'bg-cyan-500 text-white' : 'text-cyan-400 hover:bg-cyan-500/20'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !isLogin ? 'bg-cyan-500 text-white' : 'text-cyan-400 hover:bg-cyan-500/20'
          }`}
        >
          Cadastro
        </button>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-black/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 bg-black/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Senha (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 bg-black/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
          required
          minLength={6}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </span>
        </button>
      </form>
      
      {!isLogin && (
        <p className="text-xs text-gray-400 mt-4 text-center">
          Ao se cadastrar, você concorda com nossos termos de uso
        </p>
      )}
    </div>
  );
};

export default Auth;
