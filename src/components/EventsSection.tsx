
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

const EventsSection = () => {
  const events = [
    {
      id: 1,
      title: 'Kame Rider - Legado',
      date: '7 de Junho - Sábado',
      time: '10h às 20h',
      location: 'Centro Cultural Banco do Nordeste',
      address: 'Fortaleza, CE',
      description:
        'Celebração do herói japonês com exibições e bate-papos entre fãs.',
      attendees: 300,
      image: '/placeholder.svg',
    },
    {
      id: 2,
      title: 'Aldeia Geek 2° edição',
      date: '5 de Julho - Sábado',
      time: 'Horário a definir',
      location: 'Aldeia Hip Hop',
      address: 'Caucaia, CE',
      description: 'Encontro geek com muitas atrações e cultura pop.',
      attendees: 400,
      image: '/placeholder.svg',
    },
    {
      id: 3,
      title: 'Bazar HQ',
      date: '15 de Junho - Domingo',
      time: '13h às 18h30',
      location: 'Praça Luiza Távora',
      address: 'Fortaleza, CE',
      description: 'Feira de quadrinhos e colecionáveis ao ar livre.',
      attendees: 250,
      image: '/placeholder.svg',
    },
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
              <p className="text-white">Mousepad</p>
            </div>
            <div className="bg-black/40 p-4 rounded-lg">
              <p className="text-gray-400 font-bold">2º Lugar</p>
              <p className="text-white">Funkopop</p>
            </div>
            <div className="bg-black/40 p-4 rounded-lg">
              <p className="text-amber-600 font-bold">3º Lugar</p>
              <p className="text-white">Placa Decorativa</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
