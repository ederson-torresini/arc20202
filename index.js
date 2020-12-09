const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 608,
  parent: "game-container",
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("terreno", "assets/terreno.png");
  this.load.image("ARCas", "assets/ARCas.png");
  this.load.tilemapTiledJSON("map", "assets/cena-1.json");
  this.load.spritesheet("player", "assets/player.png", {
    frameWidth: 16,
    frameHeight: 16
  });
}

function create() {
  const map = this.make.tilemap({ key: "map" });

  const tileset0 = map.addTilesetImage("terreno", "terreno");
  const tileset1 = map.addTilesetImage("ARCas", "ARCas");

  const terreno = map.createStaticLayer("terreno", tileset0, 0, 0);
  const ARCas = map.createStaticLayer("ARCas", tileset1, 0, 0);

  player = this.physics.add.sprite(400, 304, "player");
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("player", {
      start: 0,
      end: 6
    }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("player", {
      start: 15,
      end: 21
    }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "stopped",
    frames: this.anims.generateFrameNumbers("player", {
      start: 11,
      end: 14
    }),
    frameRate: 5,
    repeat: -1
  });

  cursors = this.input.keyboard.createCursorKeys();

  ARCas.setCollisionBetween(0, 9999);
  // ARCas.setCollisionByProperty({ "collides": true });
  // const debugGraphics = this.add.graphics().setAlpha(0.75);
  // ARCas.renderDebug(debugGraphics, {
  //   tileColor: null,
  //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
  //   faceColor: new Phaser.Display.Color(40, 39, 37, 255)
  // });

  this.physics.add.collider(player, ARCas);
}

function update(time, delta) {
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

  //player.body.velocity.normalize().scale(speed);
}