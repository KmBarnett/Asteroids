import Phaser from "phaser";
import GasMeter from "./GasMeter";
import AmmoBox from "./AmmoBox";
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

let game = new Phaser.Game(config);
let player;
let cursors;
let pews;
let background;
let bullets;
let fuelMeter;
let gas;
let asteroids;
let asteroidCount;
let score = 0;
let scoreText;
let gameOver = false;

function newGame() {
  if (gameOver) {
    game = new Phaser.Game(config);
    player;
    cursors;
    pews;
    background;
    bullets;
    fuelMeter;
    gas;
    asteroids;
    asteroidCount;
    score = 0;
    scoreText;
    gameOver = false;
  }
}

function shoot(game) {
  if (player.ammo.clip() && !gameOver) {
    const { x, y } = player.body.center;
    const newPew = pews.create(x, y, "pew");
    newPew.setAngle(player.angle);

    newPew.setScale(0.1);
    game.physics.velocityFromAngle(newPew.angle, 500, newPew.body.velocity);
    player.ammo.shoot();
  }
}

function newCan() {
  let can = gas.create(
    Phaser.Math.Between(50, 750),
    Phaser.Math.Between(50, 550),
    "fuel"
  );
  can.setScale(0.05);
}

function newAmmo() {
  let ammo = bullets.create(
    Phaser.Math.Between(50, 750),
    Phaser.Math.Between(50, 550),
    "ammo"
  );
  ammo.setScale(0.05);
}

function moveCan(can) {
  can.x = Phaser.Math.Between(50, 750);
  can.y = Phaser.Math.Between(50, 550);
}

function collectGas(player, fuel) {
  player.gas.fill();
  fuel.disableBody(true, true);
  newCan();
}

function destroyAsteroid(pew, asteroid) {
  score += 100;
  asteroid.disableBody(true, true);
  pew.disableBody(true, true);
  scoreText.setText("Score: " + score);
}

function newAsteroid(game) {
  let asteroid = asteroids.create(
    Phaser.Math.Between(50, 750),
    Phaser.Math.Between(50, 550),
    "astroid"
  );

  Phaser.Math.Angle.Random();
  asteroid.setAngle(Phaser.Math.Between(0, 360));

  game.physics.velocityFromAngle(asteroid.angle, 100, asteroid.body.velocity);
}

function collectAmmo(player, ammo) {
  player.ammo.fill();
  ammo.disableBody(true, true);
  newAmmo();
}

function gameEnd(ship, asteroid) {
  if (ship && asteroid) {
    ship.disableBody(true, true);
  }

  player.setTint(0xff0000);
  gameOver = true;

  this.input.keyboard.on("keydown-SPACE", () => {
    newGame();
  });
}

function preload() {
  this.load.image("pew", "./assets/pew.svg");
  this.load.image("bullet", "./assets/bullet.svg");
  this.load.image("ammo", "./assets/ammo.svg");
  this.load.image("fuel", "./assets/fuel.svg");
  this.load.image("astroid", "./assets/astroid.png");
  this.load.image("fuel-meter", "./assets/meter.svg");
  this.load.image("space", "./assets/space.jpg");
  this.load.spritesheet("ship", "./assets/ship.png", {
    frameWidth: 715,
    frameHeight: 370,
  });
}

function create() {
  background = this.add.image(400, 300, "space");
  fuelMeter = this.add.image(700, 500, "fuel-meter");
  background.setScale(0.45);
  fuelMeter.setScale(0.25);
  pews = this.physics.add.group();
  cursors = this.input.keyboard.createCursorKeys();
  player = this.physics.add.sprite(400, 400, "ship");
  player.setScale(0.15);
  player.setAngle(-90);
  player.setDepth(1);
  player.gas = new GasMeter(this, 650, 565);
  player.ammo = new AmmoBox(this, 650, 415);
  background.setDepth(-1);
  asteroids = this.physics.add.group();

  scoreText = this.add.text(16, 16, "Score: 0", {
    fontSize: "32px",
    fill: "#000",
  });

  let asteroid = asteroids.create(
    Phaser.Math.Between(50, 750),
    Phaser.Math.Between(50, 550),
    "astroid"
  );

  Phaser.Math.Angle.Random();
  asteroid.setAngle(Phaser.Math.Between(0, 360));

  this.physics.velocityFromAngle(asteroid.angle, 100, asteroid.body.velocity);

  gas = this.physics.add.group();
  bullets = this.physics.add.group();
  let can = gas.create(
    Phaser.Math.Between(50, 750),
    Phaser.Math.Between(50, 550),
    "fuel"
  );
  can.setScale(0.05);

  let ammo = bullets.create(
    Phaser.Math.Between(50, 750),
    Phaser.Math.Between(50, 550),
    "ammo"
  );
  ammo.setScale(0.05);

  this.physics.add.overlap(player, gas, collectGas, null, this);
  this.physics.add.overlap(player, bullets, collectAmmo, null, this);
  this.physics.add.collider(gas, fuelMeter, moveCan, null, this);
  this.physics.add.collider(pews, asteroids, destroyAsteroid, null, this);
  this.physics.add.overlap(player, asteroids, gameEnd, null, this);

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
  asteroidCount = score / 100 + 1;
  if (gameOver) {
    this.physics.pause();
    this.add.text(300, 275, "Game Over", { fontSize: "32px", fill: "yellow" });
    player.anims.play("no-gas");
    return;
  }
  player.ammo;
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
    (cursors.left.isDown || cursors.right.isDown) &&
    cursors.up.isUp &&
    cursors.down.isUp
  ) {
    speed = 0;
  }

  if (cursors.up.isDown) {
    speed += 5;
    this.physics.velocityFromAngle(player.angle, speed, player.body.velocity);
    player.gas.decrease(speed / 1000);
    player.anims.play("forward");
  } else if (cursors.down.isDown) {
    speed -= 5;
    this.physics.velocityFromAngle(player.angle, speed, player.body.velocity);
    player.gas.decrease(Math.abs(speed) / 1000);
    player.anims.play("reverse");
  } else if (cursors.down.isUp && cursors.up.isUp) {
    player.anims.play("no-gas");
  }

  if (player.gas.gauge() === 0) {
    gameEnd(null, null, this);
  }

  if (asteroidCount > 5) {
    asteroidCount = 5;
  }

  if (asteroids.countActive(true) < asteroidCount) {
    newAsteroid(this);
  }
  this.physics.world.wrap(player, 32);
  this.physics.world.wrap(asteroids, 32);
}
