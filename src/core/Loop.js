export default class Loop {
  constructor(game) {
    this.game = game;
    this.rafId = null;
  }

  start() {
    const loop = (time) => {
      let deltaTime = (time - this.lastTime) / 1000;
      this.lastTime = time;

      // Clamp: ao trocar de aba o delta pode ser enorme (segundos/minutos),
      // o que faria entidades "teletransportarem" e atravessarem colisões.
      deltaTime = Math.min(deltaTime, Loop.MAX_DELTA);

      this.game.update(deltaTime);
      this.game.render();

      this.rafId = requestAnimationFrame(loop);
    };

    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }
}

Loop.MAX_DELTA = 0.05; // 50 ms — teto de simulação por frame