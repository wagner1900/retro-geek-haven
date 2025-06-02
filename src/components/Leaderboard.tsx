
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardProps {
  currentUserPoints: number;
}

const Leaderboard = ({ currentUserPoints }: LeaderboardProps) => {
  // Simulando dados do leaderboard
  const topPlayers = [
    { name: 'OtakuMaster', points: 2450, avatar: '🥇' },
    { name: 'PixelHero', points: 2190, avatar: '🥈' },
    { name: 'AnimeKing', points: 1980, avatar: '🥉' },
    { name: 'RetroGamer', points: 1750, avatar: '🎮' },
    { name: 'MangaLover', points: 1520, avatar: '📚' },
    { name: 'Você', points: currentUserPoints, avatar: '👤' },
  ];

  const sortedPlayers = topPlayers.sort((a, b) => b.points - a.points);
  const userRank = sortedPlayers.findIndex(player => player.name === 'Você') + 1;

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400" />;
      case 2: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 text-center text-white font-bold">{index + 1}</span>;
    }
  };

  return (
    <section id="leaderboard" className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          RANKING DOS CAMPEÕES
        </h2>

        <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-yellow-400/30 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-yellow-400/20 px-4 py-2 rounded-lg">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">Sua Posição: #{userRank}</span>
            </div>
          </div>

          <div className="space-y-4">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.name}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  player.name === 'Você'
                    ? 'bg-cyan-500/20 border-cyan-400 scale-105'
                    : 'bg-white/5 border-white/10'
                } transition-all hover:scale-102`}
              >
                <div className="flex items-center space-x-4">
                  {getRankIcon(index)}
                  <span className="text-2xl">{player.avatar}</span>
                  <div>
                    <p className={`font-bold ${player.name === 'Você' ? 'text-cyan-400' : 'text-white'}`}>
                      {player.name}
                    </p>
                    {player.name === 'Você' && (
                      <p className="text-xs text-cyan-300">Esse é você!</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-yellow-400">{player.points}</p>
                  <p className="text-xs text-gray-400">pontos</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
            <p className="text-white font-bold mb-2">🎁 PRÓXIMO EVENTO PRESENCIAL 🎁</p>
            <p className="text-gray-300">O jogador com mais pontos concorre ao sorteio exclusivo!</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
