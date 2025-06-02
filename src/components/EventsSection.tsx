
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

const EventsSection = () => {
  const events = [
    {
      id: 1,
      title: 'BelieveCon 2024',
      date: '15 de Junho',
      time: '14:00 - 22:00',
      location: 'Centro de Convenções São Paulo',
      address: 'Rua das Convenções, 123 - Vila Olímpia, SP',
      description: 'O maior evento geek da América Latina! Cosplay, games, mangás e muito mais.',
      attendees: 2500,
      image: '/placeholder.svg'
    },
    {
      id: 2,
      title: 'Torneio de Games Retrô',
      date: '28 de Junho',
      time: '16:00 - 20:00',
      location: 'BelieveStore Arena',
      address: 'Av. Paulista, 456 - Bela Vista, SP',
      description: 'Competição épica de jogos clássicos! Street Fighter, Pac-Man e muito mais.',
      attendees: 150,
      image: '/placeholder.svg'
    },
    {
      id: 3,
      title: 'Noite do Anime',
      date: '10 de Julho',
      time: '19:00 - 01:00',
      location: 'Club Otaku',
      address: 'Rua dos Animes, 789 - Liberdade, SP',
      description: 'Sessão especial de animes clássicos com DJs tocando soundtracks épicas!',
      attendees: 300,
      image: '/placeholder.svg'
    }
  ];

  return (
    <section id="events" className="py-20 px-4 bg-black/20">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
          EVENTOS PRESENCIAIS
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-black/40 backdrop-blur-sm rounded-lg border border-pink-400/30 overflow-hidden hover:border-pink-400 transition-all hover:scale-105 group"
            >
              <div className="h-48 bg-gradient-to-br from-pink-500/20 to-red-500/20 flex items-center justify-center">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3">{event.title}</h3>
                <p className="text-gray-300 mb-4 text-sm">{event.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-pink-400" />
                    <span className="text-white">{event.date}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-pink-400" />
                    <span className="text-white">{event.time}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-pink-400" />
                    <div>
                      <p className="text-white font-semibold">{event.location}</p>
                      <p className="text-gray-400 text-xs">{event.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="w-4 h-4 text-pink-400" />
                    <span className="text-white">{event.attendees} participantes esperados</span>
                  </div>
                </div>
                
                <button className="w-full mt-6 bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 px-6 rounded-lg font-bold hover:scale-105 transition-transform group-hover:shadow-lg group-hover:shadow-pink-500/25">
                  GARANTIR PRESENÇA
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
          <h3 className="text-2xl font-bold text-white mb-4">🏆 SORTEIOS EXCLUSIVOS 🏆</h3>
          <p className="text-gray-300 mb-4">
            Os jogadores com mais pontos concorrem a prêmios incríveis nos eventos presenciais!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-black/40 p-4 rounded-lg">
              <p className="text-yellow-400 font-bold">1º Lugar</p>
              <p className="text-white">Console Retrô + 10 jogos</p>
            </div>
            <div className="bg-black/40 p-4 rounded-lg">
              <p className="text-gray-400 font-bold">2º Lugar</p>
              <p className="text-white">Action Figure Limitada</p>
            </div>
            <div className="bg-black/40 p-4 rounded-lg">
              <p className="text-amber-600 font-bold">3º Lugar</p>
              <p className="text-white">Kit Mangás Premium</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
