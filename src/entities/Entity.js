export default class Entity {
  constructor(x, y) {
    this.position = { x: x, y: y };
    this.velocity = { x: 0, y: 0 };
    this.width = 32;
    this.height = 32;
    this.speed = 0;
    this.isAlive = true;
  }

  update(deltaTime) {
    if (!this.isAlive) return;

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }
}