
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Zap, Flag, Users, Trophy } from 'lucide-react';

interface RacingGameProps {
  onPointsEarned: (points: number) => void;
  user: any;
}

const RacingGame = ({ onPointsEarned, user }: RacingGameProps) => {
  const [gameState, setGameState] = useState<'lobby' | 'waiting' | 'playing' | 'finished'>('lobby');
  const [roomCode, setRoomCode] = useState('');
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [raceProgress, setRaceProgress] = useState<{[key: string]: number}>({});
  const [raceFinished, setRaceFinished] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const FINISH_LINE = 100;

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState === 'playing' && !raceFinished && (event.code === 'Space' || event.key === ' ')) {
      event.preventDefault();
      const newPosition = Math.min(playerPosition + 2, FINISH_LINE);
      setPlayerPosition(newPosition);
      
      // Atualizar progresso no banco
      updateProgress(newPosition);
      
      if (newPosition >= FINISH_LINE && !raceFinished) {
        finishRace();
      }
    }
  }, [gameState, playerPosition, raceFinished]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Obter o progresso dos outros jogadores enquanto a corrida estiver acontecendo
  useEffect(() => {
    if (gameState !== 'playing' || !currentRoom) return;

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('game_participants')
        .select('user_id, score')
        .eq('room_id', currentRoom.id);

      if (data) {
        const progress: { [key: string]: number } = {};
        data.forEach(p => {
          progress[p.user_id] = p.score;
        });
        setRaceProgress(progress);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, currentRoom]);

  const updateProgress = async (progress: number) => {
    if (!currentRoom || !user) return;
    
    try {
      await supabase
        .from('game_participants')
        .update({ score: progress })
        .eq('room_id', currentRoom.id)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

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
          game_type: 'racing',
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
          player_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Player',
          score: 0
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
    }
  };

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

      // Countdown
      setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setGameState('playing');
            setPlayerPosition(0);
            setRaceProgress({});
            setRaceFinished(false);
            toast.success('CORRIDA INICIADA! Aperte ESPAÇO para acelerar!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      toast.error('Erro ao iniciar jogo: ' + error.message);
    }
  };

  const finishRace = async () => {
    if (raceFinished) return;
    
    setRaceFinished(true);
    
    try {
      // Buscar todos os resultados
      const { data: finalResults } = await supabase
        .from('game_participants')
        .select('*')
        .eq('room_id', currentRoom.id)
        .order('score', { ascending: false });

      if (finalResults && finalResults.length > 0) {
        const playerResult = finalResults.find(p => p.user_id === user.id);
        const position = finalResults.findIndex(p => p.user_id === user.id) + 1;

        if (position === 1) {
          // Atualizar vencedor
          await supabase
            .from('game_rooms')
            .update({ 
              status: 'finished', 
              finished_at: new Date().toISOString(),
              winner_id: user.id
            })
            .eq('id', currentRoom.id);

          onPointsEarned(200); // Pontos por vencer
          toast.success('🏆 Você venceu a corrida!');
        } else {
          onPointsEarned(Math.max(50, 200 - (position * 30))); // Pontos por posição
          toast.info(`Você terminou em ${position}º lugar!`);
        }
      }

      setTimeout(() => setGameState('finished'), 2000);
    } catch (error: any) {
      toast.error('Erro ao finalizar corrida: ' + error.message);
    }
  };

  if (gameState === 'lobby') {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-orange-400/30 text-center">
        <div className="flex items-center justify-center mb-6">
          <Zap className="w-12 h-12 text-orange-400 mr-4" />
          <h3 className="text-3xl font-bold text-white font-pixel">Corrida Espacial</h3>
        </div>
        <p className="text-gray-300 mb-8">Aperte ESPAÇO o mais rápido possível para vencer!</p>
        
        <div className="space-y-4">
          <button
            onClick={createRoom}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg font-bold hover:scale-105 transition-transform"
          >
            Criar Sala
          </button>
          
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Código da sala"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2 bg-black/50 border border-orange-400/30 rounded-lg text-white focus:border-orange-400 focus:outline-none"
            />
            <button
              onClick={() => joinRoom(roomCode)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
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
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-orange-400/30 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Sala: {roomCode}</h3>
        <div className="flex items-center justify-center mb-6">
          <Users className="w-8 h-8 text-orange-400 mr-2" />
          <span className="text-white">{participants.length}/4 corredores</span>
        </div>
        
        <div className="space-y-2 mb-6">
          {participants.map((participant, index) => (
            <div key={participant.id} className="bg-orange-500/20 px-4 py-2 rounded-lg text-white flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              {participant.player_name}
            </div>
          ))}
        </div>

        {participants.length >= 2 && (
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-8 rounded-lg font-bold hover:scale-105 transition-transform"
          >
            Iniciar Corrida
          </button>
        )}
      </div>
    );
  }

  if (countdown > 0) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-orange-400/30 text-center">
        <div className="text-8xl font-bold text-orange-400 mb-4">{countdown}</div>
        <p className="text-white text-xl">Prepare-se para a corrida!</p>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-orange-400/30">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white font-pixel">Corrida Espacial</h3>
          <div className="text-orange-400 font-bold">
            Progresso: {playerPosition.toFixed(1)}%
          </div>
        </div>

        <div className="mb-8">
          <div className="relative bg-gray-800 h-20 rounded-lg overflow-hidden border-2 border-orange-400">
            {/* Pista */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600"></div>
            
            {/* Linha de chegada */}
            <div className="absolute right-0 top-0 w-2 h-full bg-yellow-400 animate-pulse"></div>
            
            {/* Nave do jogador */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-12 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg transition-all duration-100"
              style={{ left: `${playerPosition}%` }}
            >
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                🚀
              </div>
            </div>

            {/* Outras naves (participantes) */}
            {participants.filter(p => p.user_id !== user?.id).map((participant, index) => (
              <div
                key={participant.id}
                className="absolute w-10 h-6 bg-gradient-to-r from-red-400 to-pink-500 rounded-lg"
                style={{ 
                  left: `${raceProgress[participant.user_id] || 0}%`,
                  top: `${20 + (index * 15)}%`
                }}
              >
                <div className="w-full h-full flex items-center justify-center text-white text-xs">
                  🛸
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-white text-xl mb-4">
            Aperte <span className="bg-orange-500 px-2 py-1 rounded font-bold">ESPAÇO</span> para acelerar!
          </p>
          <div className="flex justify-center space-x-4">
            <Flag className="w-8 h-8 text-yellow-400" />
            <span className="text-white text-lg">Meta: 100%</span>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-orange-400/30 text-center">
        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-4">Corrida Finalizada!</h3>
        <p className="text-xl text-orange-400 mb-6">Sua posição final: {playerPosition.toFixed(1)}%</p>
        
        <button
          onClick={() => setGameState('lobby')}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-8 rounded-lg font-bold hover:scale-105 transition-transform"
        >
          Correr Novamente
        </button>
      </div>
    );
  }

  return null;
};

export default RacingGame;
