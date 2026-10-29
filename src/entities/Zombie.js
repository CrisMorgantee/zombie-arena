import Entity from './Entity.js';

export default class Zombie extends Entity {
  constructor(x, y, target) {
    super(x, y);
    this.target = target;
    this.speed = 60;
    this.width = 48;
    this.height = 48;
    this.hp = 1;               // vida: permite tough zombies no futuro
    this.contactDamage = 10;   // dano ao player por "mordida"
    this.attackCooldown = 0.8; // segundos entre mordidas
    this._attackTimer = 0;
    this.hitFlash = 0;         // feedback visual ao levar dano
  }

  update(deltaTime) {
    if (!this.isAlive) return;

    this._attackTimer -= deltaTime;
    if (this.hitFlash > 0) this.hitFlash -= deltaTime;

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

  /** Aplica dano; morre ao chegar a 0. */
  takeDamage(amount) {
    if (!this.isAlive) return;
    this.hp -= amount;
    this.hitFlash = 0.1;
    if (this.hp <= 0) this.isAlive = false;
  }

  /** True se este zumbi pode morder agora (cooldown pronto). */
  canAttack() {
    return this._attackTimer <= 0;
  }

  onAttack() {
    this._attackTimer = this.attackCooldown;
  }

  render(ctx) {
    ctx.save();
    ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#66ff66';
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    ctx.restore();
  }
}
