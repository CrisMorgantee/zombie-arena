export default class Zombie {
  constructor(x, y, target) {
    this.position = { x, y };
    this.target = target;
    this.speed = 60;
    this.velocity = { x: 0, y: 0 };
    this.width = 48;
    this.height = 48;
    this.isAlive = true;
  }

  update(deltaTime) {
    const dx = this.target.position.x + this.target.width / 2 - (this.position.x + this.width / 2);
    const dy = this.target.position.y + this.target.height / 2 - (this.position.y + this.height / 2);
    const distance = Math.hypot(dx, dy);

    if (distance > 0) {
      this.velocity.x = (dx / distance) * this.speed;
      this.velocity.y = (dy / distance) * this.speed;
    }

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  render(ctx) {
    ctx.save();
    ctx.fillStyle = '#66ff66';
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    ctx.restore();
  }
}