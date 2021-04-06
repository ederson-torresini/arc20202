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
var parede;
var voz;
var cursors;
var timedEvent;
var timer;
var timerText;
var life = 0;
var lifeText;
var trilha;
var jogador;
var ice_servers = {
  iceServers: [{ url: "stun:stun.l.google.com:19302" }],
};
var localConnection;
var remoteConnection;
var midias;
const audio = document.querySelector("audio");

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
  terreno.setCollisionByProperty({ collides: true });

  // Personagens
  player1 = this.physics.add.sprite(400, 300, "player1");
  player2 = this.physics.add.sprite(300, 400, "player2");

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

  // Camada 2: ARCas
  ARCas = map.createStaticLayer("ARCas", tileset1, 0, 0);
  ARCas.setCollisionByProperty({ collides: true });

  // Direcionais do teclado
  cursors = this.input.keyboard.createCursorKeys();

  // Mostra há quanto tempo estão jogando (a vida dos jogadores)
  lifeText = this.add.text(20, 24, life, {
    fontSize: "32px",
    fill: "#cccccc",
  });
  lifeText.setScrollFactor(0);

  // Mostra na tela o contador
  timerText = this.add.text(16, 16, timer, {
    fontSize: "32px",
    fill: "#000000",
  });
  timerText.setScrollFactor(0);

  // Cena (960x960) maior que a tela (800x600)
  this.cameras.main.setBounds(0, 0, 960, 960);
  this.physics.world.setBounds(0, 0, 960, 960);

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

  // Conectar no servidor via WebSocket
  this.socket = io();

  // Disparar evento quando jogador entrar na partida
  var self = this;
  var physics = this.physics;
  var cameras = this.cameras;
  var time = this.time;
  var socket = this.socket;

  this.socket.on("jogadores", function (jogadores) {
    if (jogadores.primeiro === self.socket.id) {
      // Define jogador como o primeiro
      jogador = 1;

      // Personagens colidem com os limites da cena
      player1.setCollideWorldBounds(true);

      // Detecção de colisão: terreno
      physics.add.collider(player1, terreno, hitCave, null, this);

      // Detecção de colisão e disparo de evento: ARCas
      physics.add.collider(player1, ARCas, hitARCa, null, this);

      // Câmera seguindo o personagem 1
      cameras.main.startFollow(player1);

      navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
          midias = stream;
        })
        .catch((error) => console.log(error));
    } else if (jogadores.segundo === self.socket.id) {
      // Define jogador como o segundo
      jogador = 2;

      // Personagens colidem com os limites da cena
      player2.setCollideWorldBounds(true);

      // Detecção de colisão: terreno
      physics.add.collider(player2, terreno, hitCave, null, this);

      // Detecção de colisão e disparo de evento: ARCas
      physics.add.collider(player2, ARCas, hitARCa, null, this);

      // Câmera seguindo o personagem 2
      cameras.main.startFollow(player2);

      navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
          midias = stream;
          localConnection = new RTCPeerConnection(ice_servers);
          midias
            .getTracks()
            .forEach((track) => localConnection.addTrack(track, midias));
          localConnection.onicecandidate = ({ candidate }) => {
            candidate &&
              socket.emit("candidate", jogadores.primeiro, candidate);
          };
          console.log(midias);
          localConnection.ontrack = ({ streams: [midias] }) => {
            audio.srcObject = midias;
          };
          localConnection
            .createOffer()
            .then((offer) => localConnection.setLocalDescription(offer))
            .then(() => {
              socket.emit(
                "offer",
                jogadores.primeiro,
                localConnection.localDescription
              );
            });
        })
        .catch((error) => console.log(error));
    }

    // Os dois jogadores estão conectados
    console.log(jogadores);
    if (jogadores.primeiro !== undefined && jogadores.segundo !== undefined) {
      // Contagem regressiva em segundos (1.000 milissegundos)
      timer = 60;
      timedEvent = time.addEvent({
        delay: 1000,
        callback: countdown,
        callbackScope: this,
        loop: true,
      });
    }
  });

  this.socket.on("offer", (socketId, description) => {
    remoteConnection = new RTCPeerConnection(ice_servers);
    midias
      .getTracks()
      .forEach((track) => remoteConnection.addTrack(track, midias));
    remoteConnection.onicecandidate = ({ candidate }) => {
      candidate && socket.emit("candidate", socketId, candidate);
    };
    remoteConnection.ontrack = ({ streams: [midias] }) => {
      audio.srcObject = midias;
    };
    remoteConnection
      .setRemoteDescription(description)
      .then(() => remoteConnection.createAnswer())
      .then((answer) => remoteConnection.setLocalDescription(answer))
      .then(() => {
        socket.emit("answer", socketId, remoteConnection.localDescription);
      });
  });

  socket.on("answer", (description) => {
    localConnection.setRemoteDescription(description);
  });

  socket.on("candidate", (candidate) => {
    const conn = localConnection || remoteConnection;
    conn.addIceCandidate(new RTCIceCandidate(candidate));
  });

  // Desenhar o outro jogador
  this.socket.on("desenharOutroJogador", ({ frame, x, y }) => {
    if (jogador === 1) {
      player2.setFrame(frame);
      player2.x = x;
      player2.y = y;
    } else if (jogador === 2) {
      player1.setFrame(frame);
      player1.x = x;
      player1.y = y;
    }
  });
};
cena1.update = function (time, delta) {
  // Controle do personagem por direcionais
  if (jogador === 1 && timer >= 0) {
    if (cursors.left.isDown) {
      player1.body.setVelocityX(-100);
      player1.anims.play("left1", true);
    } else if (cursors.right.isDown) {
      player1.body.setVelocityX(100);
      player1.anims.play("right1", true);
    } else {
      player1.body.setVelocity(0);
      player1.anims.play("stopped1", true);
    }
    if (cursors.up.isDown) {
      player1.body.setVelocityY(-100);
    } else if (cursors.down.isDown) {
      player1.body.setVelocityY(100);
    } else {
      player1.body.setVelocityY(0);
    }
    this.socket.emit("estadoDoJogador", {
      frame: player1.anims.currentFrame.index,
      x: player1.body.x,
      y: player1.body.y,
    });
  } else if (jogador === 2 && timer >= 0) {
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
    this.socket.emit("estadoDoJogador", {
      frame: player2.anims.currentFrame.index,
      x: player2.body.x,
      y: player2.body.y,
    });
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
  // Adiciona o tempo de vida em 1 segundo
  life += 1;
  lifeText.setText(life);

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
