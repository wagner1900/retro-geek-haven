
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

  // Função para limpar estado de autenticação completamente
  const cleanupAuthState = () => {
    // Limpar todos os tokens do Supabase do localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('believestore')) {
        localStorage.removeItem(key);
      }
    });
    
    // Limpar sessionStorage se existir
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('believestore')) {
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
        // LOGIN
        console.log('Tentando fazer login com:', email);
        
        // Limpar estado completamente antes do login
        cleanupAuthState();
        
        // Fazer logout global preventivo
        try {
          await supabase.auth.signOut({ scope: 'global' });
          console.log('Logout preventivo realizado');
        } catch (err) {
          console.log('Logout preventivo falhou, continuando...');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        
        if (error) {
          console.error('Erro no login:', error);
          
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email ou senha incorretos. Verifique suas credenciais.');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Email não confirmado. Verifique sua caixa de entrada ou tente cadastrar novamente.');
          } else if (error.message.includes('Too many requests')) {
            toast.error('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
          } else {
            toast.error(`Erro no login: ${error.message}`);
          }
          return;
        }

        if (data.user) {
          console.log('Login bem-sucedido:', data.user.email);
          toast.success('Login realizado com sucesso!');
          onAuthChange();
          // Forçar recarregamento para garantir estado limpo
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        // CADASTRO
        console.log('Tentando cadastrar:', email);
        
        // Validações básicas
        if (!email.includes('@')) {
          toast.error('Email inválido. Verifique o formato do email.');
          return;
        }
        
        if (password.length < 6) {
          toast.error('A senha deve ter pelo menos 6 caracteres.');
          return;
        }

        if (!name.trim()) {
          toast.error('Nome é obrigatório.');
          return;
        }

        // Limpar estado antes do cadastro
        cleanupAuthState();
        
        // URL de redirecionamento configurada corretamente
        const redirectUrl = `${window.location.origin}/`;
        console.log('URL de redirecionamento:', redirectUrl);
        
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              display_name: name.trim(),
              full_name: name.trim(),
            }
          }
        });
        
        if (error) {
          console.error('Erro no cadastro:', error);
          
          if (error.message.includes('User already registered')) {
            toast.error('Este email já está cadastrado. Tente fazer login ou use outro email.');
            setIsLogin(true);
          } else if (error.message.includes('Password should be at least')) {
            toast.error('A senha deve ter pelo menos 6 caracteres.');
          } else if (error.message.includes('Unable to validate email address')) {
            toast.error('Email inválido. Verifique o formato do email.');
          } else if (error.message.includes('Signup is disabled')) {
            toast.error('Cadastro temporariamente desabilitado. Tente novamente mais tarde.');
          } else {
            toast.error(`Erro no cadastro: ${error.message}`);
          }
          return;
        }

        if (data.user) {
          console.log('Cadastro realizado:', data.user);
          
          if (data.user.email_confirmed_at) {
            // Email já confirmado
            toast.success('Conta criada e confirmada automaticamente! Fazendo login...');
            onAuthChange();
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            // Email precisa ser confirmado
            toast.success(
              `Conta criada! Um email de confirmação foi enviado para ${email}. ` +
              'Verifique sua caixa de entrada e spam. Clique no link para ativar sua conta.',
              { duration: 8000 }
            );
            
            // Adicionar informação sobre possíveis problemas
            setTimeout(() => {
              toast.info(
                'Se o email não chegou, verifique: 1) Caixa de spam 2) Email digitado corretamente 3) Tente cadastrar novamente.',
                { duration: 10000 }
              );
            }, 3000);
          }
        }
      }
    } catch (error: any) {
      console.error('Erro inesperado:', error);
      toast.error(`Erro inesperado: ${error.message || 'Tente novamente em alguns minutos.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      console.log('Fazendo logout...');
      
      // Limpar estado primeiro
      cleanupAuthState();
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('Erro no logout:', error);
        toast.error(`Erro no logout: ${error.message}`);
      } else {
        console.log('Logout realizado com sucesso');
        toast.success('Logout realizado com sucesso!');
      }
      
      // Sempre chamar onAuthChange e recarregar
      onAuthChange();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Erro no logout:', error);
      toast.error('Erro no logout. Recarregando a página...');
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  // Função para reenviar email de confirmação
  const resendConfirmation = async () => {
    if (!email) {
      toast.error('Digite seu email primeiro.');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        toast.error(`Erro ao reenviar: ${error.message}`);
      } else {
        toast.success('Email de confirmação reenviado! Verifique sua caixa de entrada.');
      }
    } catch (error: any) {
      toast.error('Erro ao reenviar email.');
    } finally {
      setLoading(false);
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
          disabled={loading}
          className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          <span>{loading ? 'Saindo...' : 'Sair'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-cyan-400/30 max-w-md mx-auto">
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
            className="w-full px-4 py-3 bg-black/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-black/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Senha (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-black/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
          required
          minLength={6}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </span>
        </button>
      </form>

      {!isLogin && (
        <div className="mt-4 space-y-2">
          <button
            onClick={resendConfirmation}
            disabled={loading || !email}
            className="w-full text-cyan-400 hover:text-cyan-300 text-sm py-2 disabled:opacity-50"
          >
            Reenviar email de confirmação
          </button>
          <p className="text-xs text-gray-400 text-center">
            Ao se cadastrar, você concorda com nossos termos de uso.<br/>
            <span className="text-yellow-400">
              ⚠️ Verifique seu email e clique no link de confirmação para ativar a conta.
            </span>
          </p>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-400/30">
        <p className="text-xs text-blue-300 text-center">
          <strong>Problemas com email?</strong><br/>
          1. Verifique caixa de spam<br/>
          2. Confirme que digitou o email corretamente<br/>
          3. Use o botão "Reenviar confirmação"<br/>
          4. Alguns provedores podem demorar até 10 minutos
        </p>
      </div>
    </div>
  );
};

export default Auth;
