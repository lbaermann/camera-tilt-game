export interface Position {
  x: number;
  y: number;
}

export class DotModel {

  static friction = 0.95;

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

  get centerPos(): Position {
    return {
      x: this.centerX,
      y: this.centerY
    };
  }
  set centerPos(value: Position) {
    this.centerX = value.x;
    this.centerY = value.y;
  }

  advanceOneStep() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    // Friction
    this.xSpeed *= DotModel.friction;
    this.ySpeed *= DotModel.friction;
  }

  touches(other: DotModel): boolean {
    // Touches if distance between centers is smaller than both radii added
    const dx = other.centerX - this.centerX;
    const dy = other.centerY - this.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radiiSum = this.radius + other.radius;
    return distance < radiiSum;
  }

}
