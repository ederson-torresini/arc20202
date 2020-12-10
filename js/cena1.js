var cena1 = new Phaser.Scene("Cena 1");
var map;
var tileset0;
var terreno;
var tileset1;
var ARCas;
var player;
var parede;
var cursors;

cena1.preload = function () {
  this.load.image("terreno", "assets/terreno.png");
  this.load.image("ARCas", "assets/ARCas.png");
  this.load.tilemapTiledJSON("map", "assets/cena-1.json");
  this.load.spritesheet("player", "assets/player.png", {
    frameWidth: 16,
    frameHeight: 16,
  });
  this.load.audio("parede", "assets/parede.ogg");
};

cena1.create = function() {
  // Sounds
  parede = this.sound.add("parede");

  // Tilemap
  map = this.make.tilemap({ key: "map" });

  // Tilesets
  tileset0 = map.addTilesetImage("terreno", "terreno");
  tileset1 = map.addTilesetImage("ARCas", "ARCas");

  // Terrain
  terreno = map.createStaticLayer("terreno", tileset0, 0, 0);

  // Player
  player = this.physics.add.sprite(400, 304, "player");

  // Buildings
  ARCas = map.createStaticLayer("ARCas", tileset1, 0, 0);

  // Collision detection
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

  cursors = this.input.keyboard.createCursorKeys();
}

cena1.update = function(time, delta) {
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
}

function hitARCa(player, ARCas) {
  parede.play();
}

export { cena1 };
