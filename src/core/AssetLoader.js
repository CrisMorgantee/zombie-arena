export default class AssetLoader {
  static images = new Map();

  static loadImage(name, src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        AssetLoader.images.set(name, img);
        resolve(img);
      };
      img.src = src;
    });
  }

  static getImage(name) {
    return AssetLoader.images.get(name);
  }
}