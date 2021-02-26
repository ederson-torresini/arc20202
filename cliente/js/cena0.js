// Importar a próxima cena
import { cena1 } from "./cena1.js";

// Criar a cena 0
var cena0 = new Phaser.Scene("Cena 0");

cena0.preload = function () {
  // Imagem de fundo
  this.load.image("cadeado", "assets/cena0.png");
};

cena0.create = function () {
  // Conectar no servidor via WebSocket
  this.socket = io();

  // Disparar evento quando jogador entrar na partida
  var self = this;
  this.socket.on("jogadorEntrou", function (player) {
    console.log("Meu id: %s", self.socket.id);
    console.log("Jogador %s entrou na partida", player);
  });

  // Disparar evento quando jogador sair da partida
  this.socket.on("disconnect", function (player) {
    console.log("Jogador %s saiu na partida", player);
  });

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
