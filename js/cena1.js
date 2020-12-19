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
var player1;
var player2;
var up;
var down;
var left;
var right;
var parede;
var voz;
var cursors;
var timedEvent;
var timer;
var timerText;
var trilha;

cena1.preload = function () {
  // Tilesets
  this.load.image("terreno", "assets/terreno.png");
  this.load.image("ARCas", "assets/ARCas.png");

  // Tilemap
  this.load.tilemapTiledJSON("map", "assets/cena1.json");

  // Jogador 1
  this.load.spritesheet("player1", "assets/player1.png", {
    frameWidth: 16,
    frameHeight: 16,
  });

  // Jogador 2
  this.load.spritesheet("player2", "assets/player2.png", {
    frameWidth: 16,
    frameHeight: 16,
  });

  // Trilha sonora
  this.load.audio("trilha", "assets/cena1.mp3");

  // Efeitos sonoros
  this.load.audio("parede", "assets/parede.mp3");
  this.load.audio("voz", "assets/voz.mp3");

  // Tela cheia
  this.load.spritesheet("fullscreen", "assets/fullscreen.png", {
    frameWidth: 64,
    frameHeight: 64,
  });
};

cena1.create = function () {
  // Iniciando contagem regressiva...
  timer = 60;

  // Trilha sonora
  trilha = this.sound.add("trilha");
  trilha.play();

  // Efeitos sonoros
  parede = this.sound.add("parede");
  voz = this.sound.add("voz");

  // Tilemap
  map = this.make.tilemap({ key: "map" });

  // Tilesets
  tileset0 = map.addTilesetImage("terreno", "terreno");
  tileset1 = map.addTilesetImage("ARCas", "ARCas");

  // Camada 1: terreno
  terreno = map.createStaticLayer("terreno", tileset0, 0, 0);

  // Personagens
  player1 = this.physics.add.sprite(400, 300, "player1");
  player2 = this.physics.add.sprite(300, 400, "player2");

  // Camada 2: ARCas
  ARCas = map.createStaticLayer("ARCas", tileset1, 0, 0);

  // Personagens colidem com os limites da cena
  player1.setCollideWorldBounds(true);
  player2.setCollideWorldBounds(true);

  // Detecção de colisão: terreno
  terreno.setCollisionByProperty({ collides: true });
  this.physics.add.collider(player1, terreno, hitCave, null, this);
  this.physics.add.collider(player2, terreno, hitCave, null, this);

  // Detecção de colisão e disparo de evento: ARCas
  ARCas.setCollisionByProperty({ collides: true });
  this.physics.add.collider(player1, ARCas, hitARCa, null, this);
  this.physics.add.collider(player2, ARCas, hitARCa, null, this);

  // Animação do jogador 1: a esquerda
  this.anims.create({
    key: "left1",
    frames: this.anims.generateFrameNumbers("player1", {
      start: 0,
      end: 6,
    }),
    frameRate: 10,
    repeat: -1,
  });

  // Animação do jogador 2: a esquerda
  this.anims.create({
    key: "left2",
    frames: this.anims.generateFrameNumbers("player2", {
      start: 0,
      end: 6,
    }),
    frameRate: 10,
    repeat: -1,
  });

  // Animação do jogador 1: a direita
  this.anims.create({
    key: "right1",
    frames: this.anims.generateFrameNumbers("player1", {
      start: 15,
      end: 21,
    }),
    frameRate: 10,
    repeat: -1,
  });

  // Animação do jogador 2: a direita
  this.anims.create({
    key: "right2",
    frames: this.anims.generateFrameNumbers("player2", {
      start: 15,
      end: 21,
    }),
    frameRate: 10,
    repeat: -1,
  });

  // Animação do jogador 1: ficar parado (e virado para a direita)
  this.anims.create({
    key: "stopped1",
    frames: this.anims.generateFrameNumbers("player1", {
      start: 11,
      end: 14,
    }),
    frameRate: 5,
    repeat: -1,
  });

  // Animação do jogador 2: ficar parado (e virado para a direita)
  this.anims.create({
    key: "stopped2",
    frames: this.anims.generateFrameNumbers("player2", {
      start: 11,
      end: 14,
    }),
    frameRate: 5,
    repeat: -1,
  });

  // Direcionais do teclado
  cursors = this.input.keyboard.createCursorKeys();
  up = this.input.keyboard.addKey("W");
  down = this.input.keyboard.addKey("S");
  left = this.input.keyboard.addKey("A");
  right = this.input.keyboard.addKey("D");

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

  // Câmera seguindo o personagem 1
  this.cameras.main.startFollow(player1);

  // Botão de ativar/desativar tela cheia
  var button = this.add
    .image(800 - 16, 16, "fullscreen", 0)
    .setOrigin(1, 0)
    .setInteractive()
    .setScrollFactor(0);

  // Ao clicar no botão de tela cheia
  button.on(
    "pointerup",
    function () {
      if (this.scale.isFullscreen) {
        button.setFrame(0);
        this.scale.stopFullscreen();
      } else {
        button.setFrame(1);
        this.scale.startFullscreen();
      }
    },
    this
  );

  // Tecla "F" também ativa/desativa tela cheia
  var FKey = this.input.keyboard.addKey("F");
  FKey.on(
    "down",
    function () {
      if (this.scale.isFullscreen) {
        button.setFrame(0);
        this.scale.stopFullscreen();
      } else {
        button.setFrame(1);
        this.scale.startFullscreen();
      }
    },
    this
  );
};

cena1.update = function (time, delta) {
  // Controle do personagem 1: WASD
  if (left.isDown) {
    player1.body.setVelocityX(-100);
    player1.anims.play("left1", true);
  } else if (right.isDown) {
    player1.body.setVelocityX(100);
    player1.anims.play("right1", true);
  } else {
    player1.body.setVelocity(0);
    player1.anims.play("stopped1", true);
  }
  if (up.isDown) {
    player1.body.setVelocityY(-100);
  } else if (down.isDown) {
    player1.body.setVelocityY(100);
  } else {
    player1.body.setVelocityY(0);
  }

  // Controle do personagem 2: direcionais
  if (cursors.left.isDown) {
    player2.body.setVelocityX(-100);
    player2.anims.play("left2", true);
  } else if (cursors.right.isDown) {
    player2.body.setVelocityX(100);
    player2.anims.play("right2", true);
  } else {
    player2.body.setVelocity(0);
    player2.anims.play("stopped2", true);
  }
  if (cursors.up.isDown) {
    player2.body.setVelocityY(-100);
  } else if (cursors.down.isDown) {
    player2.body.setVelocityY(100);
  } else {
    player2.body.setVelocityY(0);
  }
};

function hitCave(player, terreno) {
  // Ao passar pela frente da caverna, toca o efeito sonoro
  voz.play();
}

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
  }
}

// Exportar a cena
export { cena1 };
