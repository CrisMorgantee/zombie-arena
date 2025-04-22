export default class InputSystem {
  constructor() {
    this.keys = new Set();

    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
  }

  isDown(keyCode) {
    return this.keys.has(keyCode);
  }
}