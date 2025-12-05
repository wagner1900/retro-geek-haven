
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductCatalog from '@/components/ProductCatalog';
import MiniGames from '@/components/MiniGames';
import RadioPlayer from '@/components/RadioPlayer';
import EventsSection from '@/components/EventsSection';
import Leaderboard from '@/components/Leaderboard';
import Footer from '@/components/Footer';
import Auth from '@/components/Auth';
import SEO from '@/components/SEO';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(() => {
    return parseInt(localStorage.getItem('believestore_points') || '0');
  });

  const siteUrl = typeof window !== 'undefined'
    ? (import.meta.env.VITE_SITE_URL || window.location.origin)
    : '';

  const pageDescription = 'Explore produtos geeks exclusivos, mini-games com sistema de pontos e eventos presenciais na BelieveStore.';
  const pageKeywords = [
    'loja geek',
    'mini-games online',
    'eventos geek',
    'colecionáveis',
    'BelieveStore',
    'produtos nerd',
  ];

  const structuredData = siteUrl ? {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'BelieveStore',
    url: siteUrl,
    description: pageDescription,
    image: 'https://lovable.dev/opengraph-image-p98pqg.png',
    sameAs: [
      'https://twitter.com/believestore',
      'https://www.facebook.com/believestore',
      'https://www.instagram.com/believestore',
    ],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  } : undefined;

  useEffect(() => {
    let mounted = true;

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user || null);
        
        if (event === 'SIGNED_OUT') {
          setShowAuth(false);
          // Limpar pontuação local
          localStorage.removeItem('believestore_points');
          setUserPoints(0);
          console.log('Usuário deslogado, dados limpos');
        }
        
        if (event === 'SIGNED_IN' && session?.user) {
          setShowAuth(false);
          console.log('Usuário logado:', session.user.email);
          
          // Carregar pontuação do usuário após login (com delay para evitar conflitos)
          setTimeout(() => {
            if (mounted) {
              loadUserPoints(session.user.id);
            }
          }, 500);
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token atualizado para:', session?.user?.email);
        }
        
        setLoading(false);
      }
    );

    // Verificar sessão existente
    const getInitialSession = async () => {
      try {
        console.log('Verificando sessão existente...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          // Se houver erro, limpar estado
          localStorage.removeItem('believestore_points');
          setUserPoints(0);
        } else if (session?.user) {
          console.log('Sessão existente encontrada:', session.user.email);
          setSession(session);
          setUser(session.user);
          loadUserPoints(session.user.id);
        } else {
          console.log('Nenhuma sessão ativa encontrada');
        }
      } catch (error) {
        console.error('Erro ao inicializar sessão:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserPoints = async (userId: string) => {
    try {
      console.log('Carregando pontos para usuário:', userId);
      
      const { data: userScore, error } = await supabase
        .from('user_scores')
        .select('total_points')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar pontuação:', error);
        return;
      }

      if (userScore) {
        console.log('Pontos carregados:', userScore.total_points);
        setUserPoints(userScore.total_points);
        localStorage.setItem('believestore_points', userScore.total_points.toString());
      } else {
        console.log('Nenhuma pontuação encontrada, mantendo 0');
        setUserPoints(0);
        localStorage.setItem('believestore_points', '0');
      }
    } catch (error) {
      console.error('Erro ao carregar pontuação:', error);
    }
  };

  const addPoints = (points: number) => {
    const newPoints = userPoints + points;
    setUserPoints(newPoints);
    localStorage.setItem('believestore_points', newPoints.toString());
    
    console.log(`Pontos adicionados: ${points}, Total: ${newPoints}`);
    
    // Atualizar pontuação no banco se o usuário estiver logado
    if (user) {
      updateUserScore(newPoints);
    }
  };

  const updateUserScore = async (points: number) => {
    try {
      console.log('Atualizando pontuação no banco:', points);
      
      const { data: existingScore } = await supabase
        .from('user_scores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const playerName = user.user_metadata?.display_name || 
                        user.user_metadata?.full_name || 
                        user.email?.split('@')[0] || 
                        'Player';

      if (existingScore) {
        const { error } = await supabase
          .from('user_scores')
          .update({
            total_points: points,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Erro ao atualizar pontuação:', error);
        } else {
          console.log('Pontuação atualizada com sucesso');
        }
      } else {
        const { error } = await supabase
          .from('user_scores')
          .insert({
            user_id: user.id,
            player_name: playerName,
            total_points: points
          });
          
        if (error) {
          console.error('Erro ao inserir pontuação:', error);
        } else {
          console.log('Nova pontuação criada');
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar pontuação:', error);
    }
  };

  const handleAuthChange = async () => {
    try {
      console.log('Recarregando dados do usuário...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao recarregar sessão:', error);
        return;
      }
      
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        loadUserPoints(session.user.id);
      }
    } catch (error) {
      console.error('Erro ao recarregar dados do usuário:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="BelieveStore | Loja Geek com Mini-Games e Eventos"
        description={pageDescription}
        url="/"
        keywords={pageKeywords}
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-pink-400 rounded-full animate-bounce"></div>
            <div className="absolute bottom-20 left-1/3 w-12 h-12 bg-yellow-400 rounded-full animate-ping"></div>
          </div>

          <Header
            userPoints={userPoints}
            user={user}
            onAuthClick={() => setShowAuth(!showAuth)}
          />

          {showAuth && !user && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="relative w-full max-w-md">
                <button
                  onClick={() => setShowAuth(false)}
                  className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                >
                  ×
                </button>
                <Auth user={user} onAuthChange={handleAuthChange} />
              </div>
            </div>
          )}

          <Hero />
          <ProductCatalog user={user} />
          <MiniGames onPointsEarned={addPoints} user={user} />
          <Leaderboard currentUserPoints={userPoints} />
          <EventsSection />
          <RadioPlayer />
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Index;
