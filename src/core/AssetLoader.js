export default class AssetLoader {
  static images = new Map();

  static loadImage(name, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        AssetLoader.images.set(name, img);
        resolve(img);
      };
      // Sem onerror a Promise nunca resolveria em caso de 404/corrupção,
      // travando o carregamento do jogo silenciosamente.
      img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`));
      img.src = src;
    });
  }

  static getImage(name) {
    return AssetLoader.images.get(name);
  }
}