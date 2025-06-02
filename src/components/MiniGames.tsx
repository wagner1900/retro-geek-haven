
import { useState } from 'react';
import SnakeGame from './games/SnakeGame';
import MemoryGame from './games/MemoryGame';
import { Gamepad2 } from 'lucide-react';

interface MiniGamesProps {
  onPointsEarned: (points: number) => void;
}

const MiniGames = ({ onPointsEarned }: MiniGamesProps) => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games = [
    {
      id: 'snake',
      name: 'Snake Retrô',
      description: 'Jogo clássico da cobrinha! Ganhe 10 pontos por maçã coletada.',
      component: <SnakeGame onPointsEarned={onPointsEarned} />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'memory',
      name: 'Memory Game',
      description: 'Teste sua memória! Ganhe 50 pontos ao completar.',
      component: <MemoryGame onPointsEarned={onPointsEarned} />,
      color: 'from-blue-500 to-purple-500'
    }
  ];

  return (
    <section id="games" className="py-20 px-4 bg-black/20">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          MINI-GAMES
        </h2>

        {!activeGame ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-cyan-400/30 hover:border-cyan-400 transition-all hover:scale-105 text-center"
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${game.color} flex items-center justify-center`}>
                  <Gamepad2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{game.name}</h3>
                <p className="text-gray-300 mb-6">{game.description}</p>
                <button
                  onClick={() => setActiveGame(game.id)}
                  className={`bg-gradient-to-r ${game.color} text-white px-8 py-3 rounded-lg font-bold hover:scale-105 transition-transform`}
                >
                  JOGAR AGORA
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => setActiveGame(null)}
              className="mb-8 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
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
