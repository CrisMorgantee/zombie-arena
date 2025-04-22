import Bullet from '../entities/Bullet.js';
import Player from '../entities/Player.js';
import Zombie from '../entities/Zombie.js';
import AssetLoader from './AssetLoader.js';
import AudioSystem from './AudioSystem.js';
import InputSystem from './InputSystem.js';
import Loop from './Loop.js';

export default class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.loop = new Loop(this);

    this.input = new InputSystem();
    this.mouse = { x: 0, y: 0 };
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.audio = new AudioSystem();
    this.bullets = [];

    canvas.addEventListener('mousedown', () => {
      const angle = this.player.getAimAngle();
      const bullet = new Bullet(
        this.player.position.x + this.player.width / 2,
        this.player.position.y + this.player.height / 2,
        angle
      );
      this.bullets.push(bullet);
      this.audio.play('shoot');
    });

    this.player = new Player(100, 100, this.input, this.mouse);
    this.zombies = [];
    this.spawnTimer = 0;
    this.spawnInterval = 2; // segundos
  }

  async start() {
    await AssetLoader.loadImage('player', './assets/images/player.png');
    await this.audio.load('shoot', './assets/audio/shoot1.mp3');
    this.player.sprite = AssetLoader.getImage('player');
    this.loop.start();
  }

  update(deltaTime) {
    this.player.update(deltaTime);
    this.bullets.forEach(b => b.update(deltaTime));
    this.bullets = this.bullets.filter(b => b.isAlive);

    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      const x = Math.random() < 0.5 ? -32 : this.canvas.width + 32;
      const y = Math.random() * this.canvas.height;
      this.zombies.push(new Zombie(x, y, this.player));
    }
    this.zombies.forEach(z => z.update(deltaTime));

    for (const bullet of this.bullets) {
      for (const zombie of this.zombies) {
        const dx = bullet.position.x - (zombie.position.x + zombie.width / 2);
        const dy = bullet.position.y - (zombie.position.y + zombie.height / 2);
        const dist = Math.hypot(dx, dy);
        if (dist < bullet.radius + zombie.width / 2) {
          bullet.isAlive = false;
          zombie.isAlive = false;
        }
      }
    }
    this.zombies = this.zombies.filter(z => z.isAlive);
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.player.render(this.ctx);
    this.bullets.forEach(b => b.render(this.ctx));
    this.zombies.forEach(z => z.render(this.ctx));
  }
}