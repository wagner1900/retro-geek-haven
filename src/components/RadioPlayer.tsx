
import { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, Volume2, RefreshCw } from 'lucide-react';

const RadioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [statusMessage, setStatusMessage] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  const playlist = useMemo(
    () => [
      {
        name: 'Listen.moe',
        artist: 'Anime Radio',
        url: 'https://listen.moe/stream',
      },
      {
        name: 'J-pop PowerPlay',
        artist: 'Power 181',
        url: 'https://listen.power181.com/181-japan.mp3',
      },
    ],
    [],
  );

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setStatusMessage('');
      })
      .catch(() => {
        setIsPlaying(false);
        setStatusMessage('Seu navegador bloqueou a reprodução automática. Clique em play para tentar novamente.');
      });
  };


  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleStreamIssue = () => {
      setStatusMessage('Perdemos a conexão. Trocando para uma fonte alternativa...');
      setCurrentTrack((prev) => (prev + 1) % playlist.length);
    };

    audio.addEventListener('error', handleStreamIssue);
    audio.addEventListener('stalled', handleStreamIssue);

    return () => {
      audio.removeEventListener('error', handleStreamIssue);
      audio.removeEventListener('stalled', handleStreamIssue);
    };
  }, [isPlaying, playlist.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = playlist[currentTrack].url;
    audio.load();

    if (isPlaying) {
      audio
        .play()
        .then(() => setStatusMessage(''))
        .catch(() => setStatusMessage('Não conseguimos tocar esta estação. Tente novamente.'));
    }
  }, [currentTrack, isPlaying, playlist]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4 min-w-80 z-50">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-cyan-400 mb-1">🎵 BelieveRadio</h3>
        <p className="text-sm text-gray-300">{playlist[currentTrack].name}</p>
        <p className="text-xs text-gray-400">{playlist[currentTrack].artist}</p>
      </div>

      <audio
        ref={audioRef}
        src={playlist[currentTrack].url}
        loop
      />

      <div className="flex items-center justify-center space-x-4 mb-4">
        <button
          onClick={togglePlay}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 p-3 rounded-full text-white hover:scale-110 transition-transform"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <Volume2 className="w-4 h-4 text-gray-400" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {statusMessage && (
        <div className="mt-3 text-xs text-amber-300 flex items-center justify-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-400 text-center">
        Música ambiente para sua experiência geek!
      </div>
    </div>
  );
};

export default RadioPlayer;
