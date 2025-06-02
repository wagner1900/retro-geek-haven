
const Footer = () => {
  return (
    <footer className="bg-black/80 py-12 px-4 border-t border-cyan-400/30">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e descrição */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-white">B</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  BelieveStore
                </h3>
                <p className="text-xs text-gray-400">Ultimate Geek Paradise</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Sua loja geek definitiva com os melhores produtos, mini-games viciantes e eventos incríveis. 
              Junte pontos, suba no ranking e concorra a prêmios exclusivos!
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-cyan-400/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-cyan-400/40 transition-colors">
                <span className="text-cyan-400">📧</span>
              </div>
              <div className="w-8 h-8 bg-purple-400/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-400/40 transition-colors">
                <span className="text-purple-400">📱</span>
              </div>
              <div className="w-8 h-8 bg-pink-400/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-pink-400/40 transition-colors">
                <span className="text-pink-400">📸</span>
              </div>
            </div>
          </div>

          {/* Links rápidos */}
          <div>
            <h4 className="text-white font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li><a href="#products" className="text-gray-400 hover:text-cyan-400 transition-colors">Produtos</a></li>
              <li><a href="#games" className="text-gray-400 hover:text-cyan-400 transition-colors">Mini-Games</a></li>
              <li><a href="#leaderboard" className="text-gray-400 hover:text-cyan-400 transition-colors">Ranking</a></li>
              <li><a href="#events" className="text-gray-400 hover:text-cyan-400 transition-colors">Eventos</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-bold mb-4">Contato</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📧 contato@believestore.com</li>
              <li>📱 (11) 99999-9999</li>
              <li>📍 São Paulo, SP</li>
              <li>🕒 Seg-Sex 9h-18h</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 BelieveStore. Todos os direitos reservados. | 
            <span className="text-cyan-400"> Made with 💜 for geeks</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
