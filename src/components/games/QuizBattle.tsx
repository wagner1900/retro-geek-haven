
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Brain, Users, Trophy, Timer } from 'lucide-react';

interface QuizBattleProps {
  onPointsEarned: (points: number) => void;
  user: any;
}

const QuizBattle = ({ onPointsEarned, user }: QuizBattleProps) => {
  const [gameState, setGameState] = useState<'lobby' | 'waiting' | 'playing' | 'finished'>('lobby');
  const [roomCode, setRoomCode] = useState('');
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const questions = [
    {
      question: "Qual anime tem o protagonista Monkey D. Luffy?",
      options: ["Naruto", "One Piece", "Dragon Ball", "Attack on Titan"],
      correct: 1
    },
    {
      question: "Em qual console foi lançado Super Mario Bros?",
      options: ["Atari", "Nintendo Entertainment System", "Sega Genesis", "PlayStation"],
      correct: 1
    },
    {
      question: "Qual é o nome do protagonista de The Legend of Zelda?",
      options: ["Zelda", "Link", "Ganondorf", "Epona"],
      correct: 1
    },
    {
      question: "Qual anime é conhecido por 'Kamehameha'?",
      options: ["Naruto", "One Piece", "Dragon Ball", "Bleach"],
      correct: 2
    },
    {
      question: "Em que ano foi lançado o primeiro Pokémon?",
      options: ["1994", "1996", "1998", "2000"],
      correct: 1
    }
  ];

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleNextQuestion();
    }
  }, [timeLeft, gameState]);

  const createRoom = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para criar uma sala!');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('generate_room_code');
      if (error) throw error;

      const roomCode = data;
      
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .insert({
          room_code: roomCode,
          game_type: 'quiz',
          max_players: 4,
          status: 'waiting'
        })
        .select()
        .single();

      if (roomError) throw roomError;

      await joinRoom(roomCode);
      setRoomCode(roomCode);
      toast.success(`Sala criada! Código: ${roomCode}`);
    } catch (error: any) {
      toast.error('Erro ao criar sala: ' + error.message);
    }
  };

  const joinRoom = async (code: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para entrar numa sala!');
      return;
    }

    try {
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('room_code', code)
        .eq('status', 'waiting')
        .single();

      if (roomError) throw roomError;

      const { error: participantError } = await supabase
        .from('game_participants')
        .insert({
          room_id: room.id,
          user_id: user.id,
          player_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Player'
        });

      if (participantError) throw participantError;

      setCurrentRoom(room);
      setGameState('waiting');
      setRoomCode(code);
      loadParticipants(room.id);
      toast.success('Entrou na sala!');
    } catch (error: any) {
      toast.error('Erro ao entrar na sala: ' + error.message);
    }
  };

  const loadParticipants = async (roomId: string) => {
    const { data, error } = await supabase
      .from('game_participants')
      .select('*')
      .eq('room_id', roomId);

    if (!error && data) {
      setParticipants(data);
      if (data.length >= 2) {
        // Pode iniciar o jogo
      }
    }
  };

  // Atualiza a lista de participantes periodicamente enquanto a sala estiver em espera
  useEffect(() => {
    if (gameState === 'waiting' && currentRoom) {
      const interval = setInterval(() => loadParticipants(currentRoom.id), 2000);
      return () => clearInterval(interval);
    }
  }, [gameState, currentRoom]);

  const startGame = async () => {
    if (participants.length < 2) {
      toast.error('Precisa de pelo menos 2 jogadores!');
      return;
    }

    try {
      await supabase
        .from('game_rooms')
        .update({ status: 'playing', started_at: new Date().toISOString() })
        .eq('id', currentRoom.id);

      setGameState('playing');
      setCurrentQuestion(0);
      setScore(0);
      setTimeLeft(10);
      toast.success('Jogo iniciado!');
    } catch (error: any) {
      toast.error('Erro ao iniciar jogo: ' + error.message);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    
    if (answerIndex === questions[currentQuestion].correct) {
      const points = Math.max(1, timeLeft);
      setScore(score + points);
    }

    setTimeout(() => handleNextQuestion(), 1000);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(10);
      setSelectedAnswer(null);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    try {
      await supabase
        .from('game_participants')
        .update({ score })
        .eq('room_id', currentRoom.id)
        .eq('user_id', user.id);

      // Determinar vencedor
      const { data: finalResults } = await supabase
        .from('game_participants')
        .select('*')
        .eq('room_id', currentRoom.id)
        .order('score', { ascending: false });

      if (finalResults && finalResults.length > 0) {
        const winner = finalResults[0];
        
        await supabase
          .from('game_rooms')
          .update({ 
            status: 'finished', 
            finished_at: new Date().toISOString(),
            winner_id: winner.user_id
          })
          .eq('id', currentRoom.id);

        if (winner.user_id === user.id) {
          onPointsEarned(100); // Pontos por vencer
          toast.success('🏆 Você venceu!');
        } else {
          onPointsEarned(score); // Pontos pela pontuação
          toast.info(`Você ficou em ${finalResults.findIndex(p => p.user_id === user.id) + 1}º lugar!`);
        }
      }

      setGameState('finished');
    } catch (error: any) {
      toast.error('Erro ao finalizar jogo: ' + error.message);
    }
  };

  if (gameState === 'lobby') {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-purple-400/30 text-center">
        <div className="flex items-center justify-center mb-6">
          <Brain className="w-12 h-12 text-purple-400 mr-4" />
          <h3 className="text-3xl font-bold text-white font-pixel">Quiz Battle</h3>
        </div>
        <p className="text-gray-300 mb-8">Teste seus conhecimentos geek contra outros jogadores!</p>
        
        <div className="space-y-4">
          <button
            onClick={createRoom}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-bold hover:scale-105 transition-transform"
          >
            Criar Sala
          </button>
          
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Código da sala"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2 bg-black/50 border border-purple-400/30 rounded-lg text-white focus:border-purple-400 focus:outline-none"
            />
            <button
              onClick={() => joinRoom(roomCode)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'waiting') {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-purple-400/30 text-center">
        <h3 className="text-2xl font-bold text-white mb-4 font-pixel">Sala: {roomCode}</h3>
        <div className="flex items-center justify-center mb-6">
          <Users className="w-8 h-8 text-purple-400 mr-2" />
          <span className="text-white">{participants.length}/4 jogadores</span>
        </div>
        
        <div className="space-y-2 mb-6">
          {participants.map((participant, index) => (
            <div key={participant.id} className="bg-purple-500/20 px-4 py-2 rounded-lg text-white">
              {participant.player_name}
            </div>
          ))}
        </div>

        {participants.length >= 2 && (
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-8 rounded-lg font-bold hover:scale-105 transition-transform"
          >
            Iniciar Jogo
          </button>
        )}
      </div>
    );
  }

  if (gameState === 'playing') {
    const question = questions[currentQuestion];
    
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-purple-400/30">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-white font-bold">Pergunta {currentQuestion + 1}/{questions.length}</span>
            <span className="text-purple-400 font-bold">Score: {score}</span>
          </div>
          <div className="flex items-center space-x-2 text-red-400">
            <Timer className="w-5 h-5" />
            <span className="font-bold text-xl">{timeLeft}s</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-6 font-pixel">{question.question}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={`p-4 rounded-lg text-white font-bold transition-all ${
                selectedAnswer === index
                  ? index === question.correct
                    ? 'bg-green-500'
                    : 'bg-red-500'
                  : selectedAnswer !== null && index === question.correct
                    ? 'bg-green-500'
                    : 'bg-purple-500/30 hover:bg-purple-500/50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-purple-400/30 text-center">
        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-4 font-pixel">Jogo Finalizado!</h3>
        <p className="text-xl text-purple-400 mb-6">Sua pontuação: {score}</p>
        
        <button
          onClick={() => setGameState('lobby')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-8 rounded-lg font-bold hover:scale-105 transition-transform"
        >
          Jogar Novamente
        </button>
      </div>
    );
  }

  return null;
};

export default QuizBattle;
