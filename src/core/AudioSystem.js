export default class AudioSystem {
  constructor() {
    this.context = new (window.AudioContext || window.AudioContext)();
    this.buffers = new Map();
  }

  async load(name, src) {
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    this.buffers.set(name, audioBuffer);
  }

  play(name, options = {}) {
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
