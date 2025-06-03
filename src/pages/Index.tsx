
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

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [userPoints, setUserPoints] = useState(() => {
    return parseInt(localStorage.getItem('believestore_points') || '0');
  });

  useEffect(() => {
    // Verificar usuário atual
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_OUT') {
        setShowAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addPoints = (points: number) => {
    const newPoints = userPoints + points;
    setUserPoints(newPoints);
    localStorage.setItem('believestore_points', newPoints.toString());
    
    // Atualizar pontuação no banco se o usuário estiver logado
    if (user) {
      updateUserScore(newPoints);
    }
  };

  const updateUserScore = async (points: number) => {
    try {
      const { data: existingScore } = await supabase
        .from('user_scores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const playerName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Player';

      if (existingScore) {
        await supabase
          .from('user_scores')
          .update({
            total_points: points,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_scores')
          .insert({
            user_id: user.id,
            player_name: playerName,
            total_points: points
          });
      }
    } catch (error) {
      console.error('Erro ao atualizar pontuação:', error);
    }
  };

  const handleAuthChange = () => {
    // Recarregar dados do usuário
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  };

  return (
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
            <div className="relative">
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
  );
};

export default Index;
