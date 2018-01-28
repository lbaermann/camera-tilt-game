import {Injectable} from '@angular/core';
import {BinaryImage} from './image-processor.service';
import {DotModel} from './dot/dot.model';

export enum HitDirection {
  NO_HIT,
  HIT_UP,
  HIT_DOWN,
  HIT_LEFT,
  HIT_RIGHT,
  HIT_DIAGONAL
}

@Injectable()
export class HitDetectorService {

  imageMask: BinaryImage = null;

  private get screenPxPerImgPxHoriz(): number {
    return window.innerWidth / this.imageMask.width;
  }

  private get screenPxPerImgPxVerti(): number {
    return window.innerHeight / this.imageMask.height;
  }

  constructor() {
  }

  isBlocked(screenX: number, screenY: number): boolean {
    if (this.imageMask == null) {
      return false;
    }
    const imgX = Math.floor(screenX / this.screenPxPerImgPxHoriz);
    const imgY = Math.floor(screenY / this.screenPxPerImgPxVerti);

    const img = this.imageMask;
    return !img.binaryData[imgY * img.width + imgX];
  }

  hitsWall(dot: DotModel): HitDirection {
    if (this.imageMask == null) {
      return HitDirection.NO_HIT;
    }
    const x = dot.centerX;
    const y = dot.centerY;
    const r = dot.radius;
    const topY = y - r;
    const bottomY = y + r;
    const leftX = x - r;
    const rightX = x + r;

    const blocked = (sx, sy) => this.isBlocked(sx, sy) ? 1 : 0;
    if (blocked(leftX, topY)
      + blocked(leftX, bottomY)
      + blocked(rightX, bottomY)
      + blocked(rightX, topY) === 1) {
      return HitDirection.HIT_DIAGONAL;
    }
    if (blocked(x, topY)) {
      return HitDirection.HIT_UP;
    }
    if (blocked(x, bottomY)) {
      return HitDirection.HIT_DOWN;
    }
    if (blocked(leftX, y)) {
      return HitDirection.HIT_LEFT;
    }
    if (blocked(rightX, y)) {
      return HitDirection.HIT_RIGHT;
    }

    return HitDirection.NO_HIT;
  }

  findRandomFreePosition(radius: number): { screenX: number, screenY: number } {
    const randomPos = {
      screenX: window.innerWidth / 4 + Math.random() * window.innerWidth / 2,
      screenY: window.innerHeight / 4 + Math.random() * window.innerHeight / 2
    };
    if (this.imageMask == null) {
      return randomPos;
    }
    const radiusInImgPx = Math.floor(radius / Math.min(this.screenPxPerImgPxVerti, this.screenPxPerImgPxHoriz)) + 1;
    const indices: number[] = [];
    const data = this.imageMask.binaryData;
    const width = this.imageMask.width;
    for (let row = 0; row < this.imageMask.height; row++) {
      outer: for (let col = 0; col < width; col++) {
        const i = row * width + col;

        for (let row2 = row - radiusInImgPx; row2 < row + radiusInImgPx; row2++) {
          for (let col2 = col - radiusInImgPx; col2 < col + radiusInImgPx; col2++) {
            const index = row2 * width + col2;
            if (!data[index]) {
              continue outer;
            }
          }
        }

        indices.push(i);
      }
    }
    if (indices.length === 0) {
      return randomPos;
    }
    const random = Math.floor(Math.random() * indices.length - 1);
    const indexToUse = indices[random];
    const rowUsed = Math.floor(indexToUse / width);
    const colUsed = indexToUse % width;
    return {
      screenX: this.screenPxPerImgPxHoriz * colUsed + this.screenPxPerImgPxHoriz / 2,
      screenY: this.screenPxPerImgPxVerti * rowUsed + this.screenPxPerImgPxVerti / 2
    };
  }
}
