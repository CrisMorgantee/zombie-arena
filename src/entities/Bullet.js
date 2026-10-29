export default class Bullet {
  /**
   * @param {number} x      posição inicial
   * @param {number} y      posição inicial
   * @param {number} angle  ângulo do disparo (rad)
   * @param {object} bounds limites da arena ({ width, height }) — evita
   *                        dimensões mágicas hardcodeadas no update()
   */
  constructor(x, y, angle, bounds) {
    this.position = { x, y };
    // Posição do frame anterior (usada na colisão por varredura)
    this.previousPosition = { x, y };
    this.bounds = bounds;
    this.speed = 600;
    this.velocity = {
      x: Math.cos(angle) * this.speed,
      y: Math.sin(angle) * this.speed,
    };
    this.radius = 4;
    this.damage = 1;
    this.isAlive = true;
  }

  update(deltaTime) {
    this.previousPosition.x = this.position.x;
    this.previousPosition.y = this.position.y;

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // remove bullet if out of bounds (limites vêm do canvas, não de números fixos)
    const { width, height } = this.bounds;
    if (
      this.position.x < -this.radius || this.position.x > width + this.radius ||
      this.position.y < -this.radius || this.position.y > height + this.radius
    ) {
      this.isAlive = false;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
