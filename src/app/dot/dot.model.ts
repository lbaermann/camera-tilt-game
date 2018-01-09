const friction = 0.95;

export class DotModel {

  x: number;
  y: number;
  xSpeed = 0;
  ySpeed = 0;

  constructor() {
  }

  advanceOneStep() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    // Friction
    this.xSpeed *= friction;
    this.ySpeed *= friction;
  }

}
