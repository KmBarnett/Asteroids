import Phaser from "phaser";
import "./styles/index.scss";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "screen",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);
let player;
let cursors;
let pews;
let background;

function shoot(game) {
  const { x, y } = player.body.center;
  const newPew = pews.create(x, y, "pew");
  newPew.setAngle(player.angle);

  newPew.setScale(0.1);
  game.physics.velocityFromAngle(newPew.angle, 500, newPew.body.velocity);
}

function preload() {
  this.load.image("pew", "./assets/pew.svg");
  this.load.image("space", "./assets/space.jpg");
  this.load.image("planet", "./assets/planet.svg");
  this.load.image("spiral", "./assets/pew.svg");
  this.load.spritesheet("ship", "./assets/ship.png", {
    frameWidth: 715,
    frameHeight: 370,
  });
}

function create() {
  background = this.add.image(400, 300, "space");
  background.setScale(.45)
  pews = this.physics.add.group();
  cursors = this.input.keyboard.createCursorKeys();
  player = this.physics.add.sprite(400, 400, "ship");
  player.setScale(0.15);
  player.setAngle(-90);
  player.setDepth(1);

  this.anims.create({
    key: "no-gas",
    frames: [{ key: "ship", frame: 0 }],
    frameRate: 0,
  });

  this.anims.create({
    key: "forward",
    frames: [{ key: "ship", frame: 1 }],
    frameRate: 0,
  });

  this.anims.create({
    key: "reverse",
    frames: [{ key: "ship", frame: 2 }],
    frameRate: 0,
  });

  this.input.keyboard.on("keydown-SPACE", () => {
    shoot(this);
  });
}

let speed = 0;
function update() {
  // player.body.velocity.x -= 1;
  // player.body.velocity.y -= 1;
  player.body.angularVelocity = 0;

  if (speed > 300) {
    speed = 300;
  } else if (speed < -100) {
    speed = -100;
  }
  if (cursors.left.isDown) {
    player.setAngle(player.angle - 5);
  } else if (cursors.right.isDown) {
    player.setAngle(player.angle + 5);
  }

  if (
    (cursors.left.isDown ||
    cursors.right.isDown) &&
    (cursors.up.isUp &&
    cursors.down.isUp)
  ) {
    speed = 0
  }

  if (cursors.up.isDown) {
    speed += 5;
    this.physics.velocityFromAngle(player.angle, speed, player.body.velocity);
    player.anims.play("forward");

  } else if (cursors.down.isDown) {
    speed -= 5;
    this.physics.velocityFromAngle(player.angle, speed, player.body.velocity);
    player.anims.play("reverse");

  } else if (cursors.down.isUp && cursors.up.isUp) {
    player.anims.play("no-gas");
  }

  this.physics.world.wrap(player, 32);
}
