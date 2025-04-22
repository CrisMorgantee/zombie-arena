export default class Bullet {
  constructor(x, y, angle) {
    this.position = { x, y };
    this.speed = 600;
    this.velocity = {
      x: Math.cos(angle) * this.speed,
      y: Math.sin(angle) * this.speed,
    };
    this.radius = 4;
    this.isAlive = true;
  }

  update(deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // remove bullet if out of bounds
    if (
      this.position.x < -this.radius || this.position.x > 960 + this.radius ||
      this.position.y < -this.radius || this.position.y > 540 + this.radius
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
