export default class AudioSystem {
  constructor() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    // Navegadores sem suporte a WebAudio: o jogo segue funcionando sem som.
    this.context = AudioCtx ? new AudioCtx() : null;
    this.buffers = new Map();
  }

  async load(name, src) {
    if (!this.context) return;
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`HTTP ${response.status} em ${src}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.buffers.set(name, audioBuffer);
    } catch (err) {
      // Áudio é opcional: registra o problema mas não impede o jogo de iniciar.
      console.warn(`[AudioSystem] não foi possível carregar "${name}" (${src}):`, err);
    }
  }

  play(name, options = {}) {
    if (!this.context) return;

    // Autoplay policy: o contexto inicia "suspended" até um gesto do usuário.
    if (this.context.state === 'suspended') {
      this.context.resume().catch(() => {});
    }

    const buffer = this.buffers.get(name);
    if (!buffer) return;

    const source = this.context.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.context.createGain();
    gainNode.gain.value = options.volume ?? 1;

    source.connect(gainNode).connect(this.context.destination);
    source.start(0);
  }
}
