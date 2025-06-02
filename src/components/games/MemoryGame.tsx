
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface MemoryGameProps {
  onPointsEarned: (points: number) => void;
}

const MemoryGame = ({ onPointsEarned }: MemoryGameProps) => {
  // Lista de símbolos usados no jogo. Todos precisam ser únicos para
  // evitar pares extras que quebram a lógica de conclusão.
  const symbols = ['🎮', '🎯', '⭐', '🎪', '🎨', '🎭', '👾', '🎵'];
  const [cards, setCards] = useState<Array<{ id: number; symbol: string; isFlipped: boolean; isMatched: boolean }>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  const initializeGame = () => {
    const gameSymbols = [...symbols, ...symbols];
    const shuffledCards = gameSymbols
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setGameCompleted(false);
    setGameStarted(true);
  };

  const handleCardClick = (cardId: number) => {
    if (!gameStarted || gameCompleted) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      setTimeout(() => {
        const [firstId, secondId] = newFlippedCards;
        const firstCard = cards.find(c => c.id === firstId);
        const secondCard = cards.find(c => c.id === secondId);

        if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true }
              : c
          ));
          toast.success('Par encontrado! 🎉');
        } else {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false }
              : c
          ));
        }
        
        setFlippedCards([]);
      }, 1000);
    }
  };

  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setGameCompleted(true);
      setGameStarted(false);
      onPointsEarned(50);
      toast.success(`Parabéns! Você ganhou 50 pontos! Jogadas: ${moves}`);
    }
  }, [cards, moves, onPointsEarned]);

  return (
    <div className="bg-black/60 p-8 rounded-lg border border-purple-400/30">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-purple-400 mb-2 font-pixel">Memory Game</h3>
        <p className="text-white mb-4">
          Jogadas: {moves} | Encontre todos os pares!
        </p>
        
        {!gameStarted ? (
          <button
            onClick={initializeGame}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-600 transition-colors"
          >
            {gameCompleted ? 'JOGAR NOVAMENTE' : 'INICIAR JOGO'}
          </button>
        ) : (
          <div className="text-purple-400 font-bold animate-pulse">MEMORIZE OS PARES!</div>
        )}
      </div>

      {gameStarted && (
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center text-2xl font-bold ${
                card.isFlipped || card.isMatched
                  ? card.isMatched
                    ? 'bg-green-500 text-white scale-105'
                    : 'bg-blue-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {card.isFlipped || card.isMatched ? card.symbol : '?'}
            </div>
          ))}
        </div>
      )}

      {gameCompleted && (
        <div className="text-center mt-6 p-4 bg-green-500/20 rounded-lg border border-green-400">
          <p className="text-green-400 font-bold">
            🎉 Jogo Concluído! Você ganhou 50 pontos! 🎉
          </p>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
