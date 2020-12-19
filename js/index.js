// Importar todas as cenas
import { cena0 } from "./cena0.js";
import { cena1 } from "./cena1.js";
import { cena2 } from "./cena2.js";

// Configuração do jogo
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: "game",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
  },
  scene: [cena0, cena1, cena2],
};

// Criar o objeto principal
const game = new Phaser.Game(config);
