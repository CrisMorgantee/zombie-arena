export default class Loop {
  constructor(game) {
    this.game = game;
    this.rafId = null;
  }

  start() {
    const loop = (time) => {
      const deltaTime = (time - this.lastTime) / 1000;
      this.lastTime = time;

      this.game.update(deltaTime);
      this.game.render();

      this.rafId = requestAnimationFrame(loop);
    };

    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}