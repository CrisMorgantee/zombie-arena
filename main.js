import Game from './src/core/Game.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const game = new Game(canvas, ctx);

// start() é async: aguardar evita race entre o fim do carregamento de assets
// e o primeiro frame/interação. Erros são logrados para não falhar em silêncio.
game.start().catch((err) => {
  console.error('[main] falha ao iniciar o jogo:', err);
});

// Expõe a instância para debug no console do navegador.
window.__game = game;
