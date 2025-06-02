
const Hero = () => {
  return (
    <section className="relative py-20 px-4 text-center overflow-hidden">
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            LEVEL UP!
          </h2>
          <p className="text-xl md:text-2xl text-white mb-8 font-pixel">
            Sua loja geek definitiva de games e animes com produtos épicos, mini-games e eventos incríveis!
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-cyan-500/25">
              EXPLORAR PRODUTOS
            </button>
            <button className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-pink-500/25">
              JOGAR MINI-GAMES
            </button>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-cyan-400/30 rounded-full animate-float"></div>
      <div className="absolute top-40 right-20 w-20 h-20 bg-purple-400/30 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-400/30 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
    </section>
  );
};

export default Hero;
