
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductCatalog from '@/components/ProductCatalog';
import MiniGames from '@/components/MiniGames';
import RadioPlayer from '@/components/RadioPlayer';
import EventsSection from '@/components/EventsSection';
import Leaderboard from '@/components/Leaderboard';
import Footer from '@/components/Footer';

const Index = () => {
  const [userPoints, setUserPoints] = useState(() => {
    return parseInt(localStorage.getItem('believestore_points') || '0');
  });

  const addPoints = (points: number) => {
    const newPoints = userPoints + points;
    setUserPoints(newPoints);
    localStorage.setItem('believestore_points', newPoints.toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-20 h-20 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-pink-400 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/3 w-12 h-12 bg-yellow-400 rounded-full animate-ping"></div>
        </div>
        
        <Header userPoints={userPoints} />
        <Hero />
        <ProductCatalog />
        <MiniGames onPointsEarned={addPoints} />
        <Leaderboard currentUserPoints={userPoints} />
        <EventsSection />
        <RadioPlayer />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
