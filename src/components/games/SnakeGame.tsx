
import { useState, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface SnakeGameProps {
  onPointsEarned: (points: number) => void;
}

const SnakeGame = ({ onPointsEarned }: SnakeGameProps) => {
  const BOARD_SIZE = 20;
  const INITIAL_SNAKE = [{ x: 10, y: 10 }];
  const INITIAL_FOOD = { x: 15, y: 15 };

  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);

  const generateFood = useCallback((currentSnake: Array<{ x: number; y: number }> = snake) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));

    return newFood;
  }, [snake]);

  const resetGame = () => {
    const initialSnake = INITIAL_SNAKE;
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection({ x: 0, y: 0 });
    setScore(0);
    setGameRunning(false);
  };

  const startGame = () => {
    const initialSnake = INITIAL_SNAKE;
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setScore(0);
    setDirection({ x: 1, y: 0 });
    setGameRunning(true);
  };

const handleKeyPress = useCallback((e: KeyboardEvent) => {
  if (!gameRunning) return;

    switch (e.key) {
      case 'ArrowUp':
        setDirection(prev => prev.y === 0 ? { x: 0, y: -1 } : prev);
        break;
      case 'ArrowDown':
        setDirection(prev => prev.y === 0 ? { x: 0, y: 1 } : prev);
        break;
      case 'ArrowLeft':
        setDirection(prev => prev.x === 0 ? { x: -1, y: 0 } : prev);
        break;
      case 'ArrowRight':
        setDirection(prev => prev.x === 0 ? { x: 1, y: 0 } : prev);
        break;
    }
  }, [gameRunning]);

  const moveUp = () =>
    setDirection(prev => (prev.y === 0 ? { x: 0, y: -1 } : prev));
  const moveDown = () =>
    setDirection(prev => (prev.y === 0 ? { x: 0, y: 1 } : prev));
  const moveLeft = () =>
    setDirection(prev => (prev.x === 0 ? { x: -1, y: 0 } : prev));
  const moveRight = () =>
    setDirection(prev => (prev.x === 0 ? { x: 1, y: 0 } : prev));

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (!gameRunning) return;

    const gameLoop = setInterval(() => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };

        head.x += direction.x;
        head.y += direction.y;

        // Check walls
        if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
          setGameRunning(false);
          toast.error('Game Over! Você bateu na parede.');
          return prevSnake;
        }

        // Check self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameRunning(false);
          toast.error('Game Over! Você se mordeu.');
          return prevSnake;
        }

        newSnake.unshift(head);

        // Check food
        if (head.x === food.x && head.y === food.y) {
          setFood(generateFood());
          setScore(prev => prev + 1);
          onPointsEarned(10);
          toast.success('+10 pontos! 🐍');
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 150);

    return () => clearInterval(gameLoop);
  }, [direction, food, gameRunning, generateFood, onPointsEarned]);

  return (
    <div className="bg-black/60 p-8 rounded-lg border border-green-400/30">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-green-400 mb-2 font-pixel">Snake Retrô</h3>
        <p className="text-white mb-4">Score: {score} | Use as setas para controlar</p>
        
        {!gameRunning ? (
          <div className="space-y-4">
            <button
              onClick={startGame}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition-colors"
            >
              INICIAR JOGO
            </button>
            {score > 0 && (
              <button
                onClick={resetGame}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600 transition-colors ml-4"
              >
                REINICIAR
              </button>
            )}
          </div>
        ) : (
          <div className="text-green-400 font-bold animate-pulse">JOGANDO...</div>
        )}
      </div>

      <div className="grid grid-cols-20 gap-0.5 bg-gray-900 p-4 rounded-lg max-w-lg mx-auto" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
          const x = index % BOARD_SIZE;
          const y = Math.floor(index / BOARD_SIZE);
          const isSnake = snake.some(segment => segment.x === x && segment.y === y);
          const isFood = food.x === x && food.y === y;
          const isHead = snake[0] && snake[0].x === x && snake[0].y === y;

          return (
            <div
              key={index}
              className={`aspect-square ${
                isSnake
                  ? isHead
                    ? 'bg-green-300'
                    : 'bg-green-500'
                  : isFood
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-gray-800'
              }`}
            />
          );
        })}
      </div>
      {/* Mobile Controls */}
      <div className="mt-4 md:hidden flex flex-col items-center space-y-2">
        <button
          onClick={moveUp}
          className="p-3 bg-gray-700 rounded-full active:bg-gray-600"
        >
          <ArrowUp className="w-6 h-6 text-white" />
        </button>
        <div className="flex space-x-4">
          <button
            onClick={moveLeft}
            className="p-3 bg-gray-700 rounded-full active:bg-gray-600"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={moveDown}
            className="p-3 bg-gray-700 rounded-full active:bg-gray-600"
          >
            <ArrowDown className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={moveRight}
            className="p-3 bg-gray-700 rounded-full active:bg-gray-600"
          >
            <ArrowRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
