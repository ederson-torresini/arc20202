// Importar a próxima cena
import { cena1 } from "./cena1.js";

// Criar a cena 0
var cena0 = new Phaser.Scene("Cena 0");

cena0.preload = function () {
  // Imagem de fundo
  this.load.image("cadeado", "./assets/cena0.png");
};

cena0.create = function () {
  // Botão com a imagem de fundo
  var button = this.add.image(400, 300, "cadeado", 0).setInteractive();

  // Ao clicar no botão, inicia a cena 1
  button.on(
    "pointerdown",
    function () {
      this.scene.start(cena1);
    },
    this
  );
};

cena0.update = function () {};

// Exportar a cena
export { cena0 };
