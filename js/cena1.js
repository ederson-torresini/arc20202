// Importar a próxima cena
import { cena2 } from "./cena2.js";

// Criar a cena 1
var cena1 = new Phaser.Scene("Cena 1");

// Variáveis locais
var map;
var tileset0;
var terreno;
var tileset1;
var ARCas;
var player;
var parede;
var cursors;
var timedEvent;
var timer;
var timerText;
var trilha;

cena1.preload = function () {
  this.load.image("terreno", "assets/terreno.png");
  this.load.image("ARCas", "assets/ARCas.png");
  this.load.tilemapTiledJSON("map", "assets/cena1.json");
  this.load.spritesheet("player", "assets/player.png", {
    frameWidth: 16,
    frameHeight: 16,
  });
  this.load.audio("trilha", "assets/cena1.mp3");
  this.load.audio("parede", "assets/parede.mp3");
};

cena1.create = function () {
  // Iniciando contagem regressiva...
  timer = 60;

  // Trilha sonora
  trilha = this.sound.add("trilha");
  trilha.play();

  // Efeitos sonoros
  parede = this.sound.add("parede");

  // Tilemap
  map = this.make.tilemap({ key: "map" });

  // Tilesets
  tileset0 = map.addTilesetImage("terreno", "terreno");
  tileset1 = map.addTilesetImage("ARCas", "ARCas");

  // Terreno
  terreno = map.createStaticLayer("terreno", tileset0, 0, 0);

  // Personagem
  player = this.physics.add.sprite(400, 304, "player");

  // Prédios (ARCas)
  ARCas = map.createStaticLayer("ARCas", tileset1, 0, 0);

  // Detecção de colisão
  ARCas.setCollisionByProperty({ collides: true });
  player.setCollideWorldBounds(true);
  this.physics.add.collider(player, ARCas, hitARCa, null, this);

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("player", {
      start: 0,
      end: 6,
    }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("player", {
      start: 15,
      end: 21,
    }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "stopped",
    frames: this.anims.generateFrameNumbers("player", {
      start: 11,
      end: 14,
    }),
    frameRate: 5,
    repeat: -1,
  });

  // Direcionais do teclado
  cursors = this.input.keyboard.createCursorKeys();

  // Contagem regressiva em segundos (1.000 milissegundos)
  timedEvent = this.time.addEvent({
    delay: 1000,
    callback: countdown,
    callbackScope: this,
    loop: true,
  });

  // Mostra na tela o contador
  timerText = this.add.text(16, 16, timer, {
    fontSize: "32px",
    fill: "#000",
  });
  timerText.setScrollFactor(0);

  // Cena (960x960) maior que a tela (800x600)
  this.cameras.main.setBounds(0, 0, 960, 960);
  this.physics.world.setBounds(0, 0, 960, 960);

  // Câmera seguindo o personagem
  this.cameras.main.startFollow(player);
};

cena1.update = function (time, delta) {
  if (cursors.left.isDown) {
    player.body.setVelocityX(-100);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(100);
    player.anims.play("right", true);
  } else {
    player.body.setVelocity(0);
    player.anims.play("stopped", true);
  }

  if (cursors.up.isDown) {
    player.body.setVelocityY(-100);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(100);
  } else {
    player.body.setVelocityY(0);
  }
};

function hitARCa(player, ARCas) {
  // Ao colidir com a parede, toca o efeito sonoro
  parede.play();
}

function countdown() {
  // Reduz o contador em 1 segundo
  timer -= 1;
  timerText.setText(timer);

  // Se o contador chegar a zero, inicia a cena 2
  if (timer === 0) {
    trilha.stop();
    this.scene.start(cena2);
    timer = 10;
  }
}

// Exportar a cena
export { cena1 };
