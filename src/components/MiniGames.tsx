
import { useState } from 'react';
import SnakeGame from './games/SnakeGame';
import MemoryGame from './games/MemoryGame';
import QuizBattle from './games/QuizBattle';
import RacingGame from './games/RacingGame';
import { Gamepad2, Users, Brain, Zap } from 'lucide-react';

interface MiniGamesProps {
  onPointsEarned: (points: number) => void;
  user: any;
}

const MiniGames = ({ onPointsEarned, user }: MiniGamesProps) => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games = [
    {
      id: 'snake',
      name: 'Snake Retrô',
      description: 'Jogo clássico da cobrinha! Ganhe 10 pontos por maçã coletada.',
      component: <SnakeGame onPointsEarned={onPointsEarned} />,
      color: 'from-green-500 to-emerald-500',
      icon: Gamepad2,
      multiplayer: false
    },
    {
      id: 'memory',
      name: 'Memory Game',
      description: 'Teste sua memória! Ganhe 50 pontos ao completar.',
      component: <MemoryGame onPointsEarned={onPointsEarned} />,
      color: 'from-blue-500 to-purple-500',
      icon: Gamepad2,
      multiplayer: false
    },
    {
      id: 'quiz',
      name: 'Quiz Battle',
      description: 'Batalha de conhecimento geek! Multiplayer até 4 jogadores.',
      component: <QuizBattle onPointsEarned={onPointsEarned} user={user} />,
      color: 'from-purple-500 to-pink-500',
      icon: Brain,
      multiplayer: true
    },
    {
      id: 'racing',
      name: 'Corrida Espacial',
      description: 'Corrida de velocidade! Aperte espaço e seja o mais rápido.',
      component: <RacingGame onPointsEarned={onPointsEarned} user={user} />,
      color: 'from-orange-500 to-red-500',
      icon: Zap,
      multiplayer: true
    }
  ];

  return (
    <section id="games" className="py-20 px-4 bg-black/20">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-pixel">
          MINI-GAMES
        </h2>

        {!activeGame ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {games.map((game) => {
              const IconComponent = game.icon;
              return (
                <div
                  key={game.id}
                  className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-cyan-400/30 hover:border-cyan-400 transition-all hover:scale-105 hover:shadow-xl text-center"
                >
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${game.color} flex items-center justify-center animate-pulse`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex items-center justify-center mb-2">
                    <h3 className="text-2xl font-bold text-white font-pixel">{game.name}</h3>
                    {game.multiplayer && (
                      <div className="ml-2" title="Multiplayer">
                        <Users className="w-6 h-6 text-cyan-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 mb-6">{game.description}</p>
                  {game.multiplayer && !user && (
                    <p className="text-yellow-400 text-sm mb-4">⚠️ Login necessário para jogos multiplayer</p>
                  )}
                  <button
                    onClick={() => setActiveGame(game.id)}
                    disabled={game.multiplayer && !user}
                    className={`bg-gradient-to-r ${game.color} text-white px-8 py-3 rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed font-pixel`}
                  >
                    JOGAR AGORA
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => setActiveGame(null)}
              className="mb-8 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-pixel"
            >
              VOLTAR AOS JOGOS
            </button>
            {games.find(game => game.id === activeGame)?.component}
          </div>
        )}
      </div>
    </section>
  );
};

export default MiniGames;
