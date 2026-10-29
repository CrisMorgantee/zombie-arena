import Entity from './Entity.js';
import AssetLoader from '../core/AssetLoader.js';

export default class Player extends Entity {
  constructor(x, y, input, mouse) {
    super(x, y);
    this.input = input;
    this.mouse = mouse;
    // O sprite é carregado de forma assíncrona pelo Game (AssetLoader.loadImage)
    // e atribuído após o carregamento. Aqui fica undefined até lá.
    this.sprite = AssetLoader.getImage('player');
    this.width = 64;
    this.height = 64;
    this.speed = 180;
    this.maxHp = 100;
    this.hp = this.maxHp;
    this.invincibleTimer = 0; // i-frames após levar dano
    this.damageFlash = 0;     // feedback visual ao levar dano
  }

  update(deltaTime) {
    if (!this.isAlive) return;

    if (this.invincibleTimer > 0) this.invincibleTimer -= deltaTime;
    if (this.damageFlash > 0) this.damageFlash -= deltaTime;

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

  /**
   * Aplica dano ao player (respeita i-frames). Retorna true se houve dano.
   */
  takeDamage(amount) {
    if (!this.isAlive || this.invincibleTimer > 0) return false;
    this.hp -= amount;
    this.invincibleTimer = 0.5; // meio segundo de invulnerabilidade
    this.damageFlash = 0.25;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isAlive = false;
    }
    return true;
  }

  render(ctx) {
    if (!this.sprite) return;

    const angle = this.getAimAngle();

    ctx.save();
    // Pisca durante i-frames para indicar que está imune
    if (this.invincibleTimer > 0) ctx.globalAlpha = 0.5;
    ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
    ctx.rotate(angle);
    ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    if (this.damageFlash > 0) {
      // tinta vermelha sobre o sprite ao levar dano
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = `rgba(255, 0, 0, ${this.damageFlash * 2})`;
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
    ctx.restore();
  }
}