class AmmoBox {
  constructor(scene, x, y) {
    this.value = 100;
    this.p = 96 / 100;
    this.bullets = scene.physics.add.group();
    this.x = x;
    this.y = y;
    this.draw();
  }

  clip() {
    return this.value;
  }

  shoot() {
    this.value -= 10;

    if (this.value < 0) {
      this.value = 0;
    }

    this.draw();

    return this.value === 0;
  }

  fill() {
    this.value += 50;

    if (this.value > 100) {
      this.value = 100;
    }

    this.draw();

    return this.value === 100;
  }

  draw() {
    this.bullets.clear(true, true);
    if (this.value > 0) {
      this.bullets.createMultiple({
        key: "bullet",
        repeat: this.value / 10 - 1,
        setXY: { x: this.x, y: this.y, stepX: 10 },
      });
    }

    this.bullets.children.iterate(function (child) {
      child.setScale(0.05);
    });
  }
}

export default AmmoBox;
