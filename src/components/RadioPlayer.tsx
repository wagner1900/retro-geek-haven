
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, SkipForward, SkipBack } from 'lucide-react';

const RadioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

  const playlist = [
    { name: 'Anime Lo-fi Mix', artist: 'RetroBeats', url: 'https://www.soundjay.com/misc/bell-ringing-05.wav' },
    { name: '8-bit Adventure', artist: 'PixelSound', url: 'https://www.soundjay.com/misc/bell-ringing-05.wav' },
    { name: 'Cyberpunk Nights', artist: 'NeonWave', url: 'https://www.soundjay.com/misc/bell-ringing-05.wav' },
    { name: 'Game OST Remix', artist: 'RetroMixer', url: 'https://www.soundjay.com/misc/bell-ringing-05.wav' },
  ];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

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
        onEnded={nextTrack}
        loop
      />

      <div className="flex items-center justify-center space-x-4 mb-4">
        <button
          onClick={prevTrack}
          className="p-2 text-white hover:text-cyan-400 transition-colors"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        
        <button
          onClick={togglePlay}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 p-3 rounded-full text-white hover:scale-110 transition-transform"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        
        <button
          onClick={nextTrack}
          className="p-2 text-white hover:text-cyan-400 transition-colors"
        >
          <SkipForward className="w-5 h-5" />
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

      <div className="mt-2 text-xs text-gray-400 text-center">
        Música ambiente para sua experiência geek!
      </div>
    </div>
  );
};

export default RadioPlayer;
