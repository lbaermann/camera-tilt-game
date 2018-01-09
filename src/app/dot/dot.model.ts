const friction = 0.95;

export class DotModel {

  x: number;
  y: number;
  radius = 10;
  xSpeed = 0;
  ySpeed = 0;

  constructor() {
  }

  get centerX(): number {
    return this.x + this.radius;
  }

  set centerX(value: number) {
    this.x = value - this.radius;
  }

  get centerY(): number {
    return this.y + this.radius;
  }

  set centerY(value: number) {
    this.y = value - this.radius;
  }

  advanceOneStep() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    // Friction
    this.xSpeed *= friction;
    this.ySpeed *= friction;
  }

  touches(other: DotModel): boolean {
    return true;
  }

}
