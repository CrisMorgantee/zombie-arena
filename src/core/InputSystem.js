export default class InputSystem {
  constructor() {
    this.keys = new Set();

    // Guardamos as funções para poder removê-las em destroy().
    this._onKeyDown = (e) => this.keys.add(e.code);
    this._onKeyUp = (e) => this.keys.delete(e.code);
    // Sem isto, telas "grudam" se a janela perder foco durante um keydown.
    this._onBlur = () => this.keys.clear();

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
  }

  isDown(keyCode) {
    return this.keys.has(keyCode);
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onBlur);
    this.keys.clear();
  }
}