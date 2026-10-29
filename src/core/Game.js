import Bullet from '../entities/Bullet.js';
import Player from '../entities/Player.js';
import Zombie from '../entities/Zombie.js';
import AssetLoader from './AssetLoader.js';
import AudioSystem from './AudioSystem.js';
import InputSystem from './InputSystem.js';
import Loop from './Loop.js';
import { centerOf, segmentCircleIntersect, rectsOverlap } from './collision.js';

const SHOOT_COOLDOWN = 0.18;   // segundos entre disparos
const BASE_SPAWN_INTERVAL = 2; // segundos (início da dificuldade)
const MIN_SPAWN_INTERVAL = 0.5;
const DIFFICULTY_RAMP = 0.04;  // redução do intervalo por segundo de jogo
const MAX_ZOMBIES = 40;        // teto para não explodir a CPU

export default class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.loop = new Loop(this);

    this.input = new InputSystem();
    this.mouse = { x: 0, y: 0 };
    this._onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      // Escala caso o canvas seja redimensionado via CSS
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;
    };
    canvas.addEventListener('mousemove', this._onMouseMove);

    this.audio = new AudioSystem();
    this.bullets = [];
    this.player = new Player(100, 100, this.input, this.mouse);
    this.zombies = [];
    this.spawnTimer = 0;
    this.spawnInterval = BASE_SPAWN_INTERVAL;
    this.score = 0;
    this.elapsed = 0;
    this.gameOver = false;

    this._fireRequested = false;
    this._mouseDown = false;
    this._shootTimer = 0; // cooldown restante até poder disparar de novo
    this._onMouseDown = () => {
      this._mouseDown = true;
      this._fireRequested = true; // clique único sempre dispara (se cooldown pronto)
    };
    this._onMouseUp = () => { this._mouseDown = false; };
    canvas.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mouseup', this._onMouseUp);

    // Limites dinâmicos da arena: Bullet usa isto em vez de números mágicos
    this.bounds = { width: canvas.width, height: canvas.height };
  }

  async start() {
    try {
      await AssetLoader.loadImage('player', './assets/images/player.png');
    } catch (err) {
      // Sem imagem crítica o jogo não tem como rodar.
      console.error('[Game] falha ao carregar assets:', err);
      this._showMessage(`Erro ao carregar assets: ${err.message}`);
      return;
    }
    // Áudio é opcional e nunca deve bloquear o início do jogo.
    await this.audio.load('shoot', './assets/audio/shoot1.mp3');
    this.player.sprite = AssetLoader.getImage('player');
    this.loop.start();
  }

  _showMessage(text) {
    this.ctx.fillStyle = '#eee';
    this.ctx.font = '20px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
  }

  shoot() {
    const angle = this.player.getAimAngle();
    const bullet = new Bullet(
      this.player.position.x + this.player.width / 2,
      this.player.position.y + this.player.height / 2,
      angle,
      this.bounds
    );
    this.bullets.push(bullet);
    this.audio.play('shoot');
  }

  spawnZombie() {
    if (this.zombies.length >= MAX_ZOMBIES) return;
    const x = Math.random() < 0.5 ? -32 : this.bounds.width + 32;
    const y = Math.random() * this.bounds.height;
    this.zombies.push(new Zombie(x, y, this.player));
  }

  update(deltaTime) {
    if (this.gameOver) return;

    this.elapsed += deltaTime;

    // Cooldown de disparo: segurar o mouse dispara em cadência fixa;
    // um clique único sempre dispara assim que o cooldown estiver pronto.
    this._shootTimer -= deltaTime;
    const wantsFire = this._mouseDown || this._fireRequested;
    if (wantsFire && this._shootTimer <= 0 && this.player.isAlive) {
      this.shoot();
      this._shootTimer = SHOOT_COOLDOWN;
    }
    this._fireRequested = false;

    this.player.update(deltaTime);
    this.bullets.forEach((b) => b.update(deltaTime));
    this.bullets = this.bullets.filter((b) => b.isAlive);

    // Dificuldade progressiva: spawns ficam mais frequentes com o tempo
    this.spawnInterval = Math.max(MIN_SPAWN_INTERVAL, BASE_SPAWN_INTERVAL - this.elapsed * DIFFICULTY_RAMP);
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnZombie();
    }
    this.zombies.forEach((z) => z.update(deltaTime));

    // Bala × Zumbi: colisão por varredura (segmento do frame anterior até o
    // atual) para balas rápidas não atravessarem alvos em frames longos.
    for (const bullet of this.bullets) {
      if (!bullet.isAlive) continue;
      for (const zombie of this.zombies) {
        if (!zombie.isAlive) continue;
        const c = centerOf(zombie);
        const hit = segmentCircleIntersect(
          bullet.previousPosition.x, bullet.previousPosition.y,
          bullet.position.x, bullet.position.y,
          c.x, c.y,
          bullet.radius + zombie.width / 2
        );
        if (hit) {
          bullet.isAlive = false;
          zombie.takeDamage(bullet.damage);
          if (!zombie.isAlive) this.score += 1;
          break;
        }
      }
    }
    this.zombies = this.zombies.filter((z) => z.isAlive);

    // Zumbi × Player: mordidas com cooldown + i-frames no player
    for (const zombie of this.zombies) {
      if (rectsOverlap(zombie, this.player) && zombie.canAttack()) {
        const damaged = this.player.takeDamage(zombie.contactDamage);
        if (damaged) zombie.onAttack();
      }
    }

    if (!this.player.isAlive) {
      this.gameOver = true;
      this.loop.stop();
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.player.render(this.ctx);
    this.bullets.forEach((b) => b.render(this.ctx));
    this.zombies.forEach((z) => z.render(this.ctx));

    // HUD simples
    this.ctx.save();
    this.ctx.fillStyle = '#eee';
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, 10, 24);
    this.ctx.fillText(`HP: ${this.player.hp}/${this.player.maxHp}`, 10, 44);
    this.ctx.restore();

    if (this.gameOver) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this._showMessage(`GAME OVER — Score: ${this.score} · recarregue a página para jogar de novo`);
      this.ctx.restore();
    }
  }

  destroy() {
    this.loop.stop();
    this.input.destroy();
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mouseup', this._onMouseUp);
  }
}
