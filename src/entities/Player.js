import Entity from './Entity.js';
import AssetLoader from '../core/AssetLoader.js';

export default class Player extends Entity {
  constructor(x, y, input, mouse) {
    super(x, y);
    this.speed = 180;
    this.input = input;
    this.mouse = mouse;
    this.sprite = AssetLoader.getImage('player');
    this.width = 64;
    this.height = 64;
  }

  update(deltaTime) {
    let dx = 0;
    let dy = 0;

    if (this.input.isDown('ArrowUp') || this.input.isDown('KeyW')) dy -= 1;
    if (this.input.isDown('ArrowDown') || this.input.isDown('KeyS')) dy += 1;
    if (this.input.isDown('ArrowLeft') || this.input.isDown('KeyA')) dx -= 1;
    if (this.input.isDown('ArrowRight') || this.input.isDown('KeyD')) dx += 1;

    const len = Math.hypot(dx, dy);
    if (len > 0) {
      this.velocity.x = (dx / len) * this.speed;
      this.velocity.y = (dy / len) * this.speed;
    } else {
      this.velocity.x = 0;
      this.velocity.y = 0;
    }

    super.update(deltaTime);
  }

  getAimAngle() {
    const dx = this.mouse.x - (this.position.x + this.width / 2);
    const dy = this.mouse.y - (this.position.y + this.height / 2);
    return Math.atan2(dy, dx);
  }

  render(ctx) {
    if (!this.sprite) return;

    const angle = this.getAimAngle();

    ctx.save();
    ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
    ctx.rotate(angle);
    ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}