# 🧟 Zombie Arena

Jogo de sobrevivência em `<canvas>` — JavaScript puro (ES Modules), sem build e sem dependências.

## Como rodar

Qualquer servidor estático serve (ES Modules exigem HTTP, não `file://`):

```bash
npm start        # npx serve na porta 5500
# ou
npm run dev      # vite (hot reload)
# ou
python3 -m http.server 5500
```

Depois abra `http://localhost:5500`.

## Controles

- **WASD** ou **setas** — mover
- **Mouse** — mirar
- **Clique / segurar** — atirar (cadência limitada por cooldown)

## Mecânicas

- Zumbis perseguem o player e causam dano por contato (com cooldown de mordida).
- Player tem HP + i-frames (invulnerabilidade breve após levar dano).
- Balas usam colisão por varredura (segmento × círculo) — não atravessam alvos em frames longos.
- Dificuldade progressiva: intervalo de spawn cai de 2 s até um piso de 0,5 s.
- Game over com placar; recarregue a página para jogar de novo.

## Estrutura

```
main.js                  bootstrap
index.html
src/core/
  Game.js                orquestra estado, spawns, colisões, HUD
  Loop.js                requestAnimationFrame + clamp de deltaTime
  InputSystem.js         teclado (com cleanup/destroy)
  AudioSystem.js         WebAudio (opcional, tolerante a falhas)
  AssetLoader.js         carregamento de imagens (rejeita em erro)
  collision.js           utilitários AABB / segmento-círculo
src/entities/
  Entity.js  Player.js  Zombie.js  Bullet.js
assets/                  imagens e áudio
```

## Debug

A instância do jogo fica exposta em `window.__game` no console do navegador.
