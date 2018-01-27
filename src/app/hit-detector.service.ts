import {Injectable} from '@angular/core';
import {BinaryImage, ImageProcessorService} from './image-processor.service';
import {DotModel} from './dot/dot.model';

export enum HitDirection {
  NO_HIT,
  HIT_VERTICAL,
  HIT_HORIZONTAL,
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
    if (blocked(x, topY)
      || blocked(x, bottomY)) {
      return HitDirection.HIT_VERTICAL;
    }
    if (blocked(leftX, y)
      || blocked(rightX, y)) {
      return HitDirection.HIT_HORIZONTAL;
    }


    return HitDirection.NO_HIT;
  }

  findRandomFreePosition(): { screenX: number, screenY: number } {
    if (this.imageMask == null) {
      return {
        screenX: window.innerWidth / 2,
        screenY: window.innerHeight / 2
      };
    }
    const indices: number[] = [];
    const data = this.imageMask.binaryData;
    for (let i = 0; i < data.length; i++) {
      if (data[i]) {
        indices.push(i);
      }
    }
    const random = Math.floor(Math.random() * indices.length - 1);
    const indexToUse = indices[random];
    const row = Math.floor(indexToUse / this.imageMask.width);
    const col = indexToUse % this.imageMask.width;
    return {
      screenX: this.screenPxPerImgPxHoriz * col + this.screenPxPerImgPxHoriz / 2,
      screenY: this.screenPxPerImgPxVerti * row + this.screenPxPerImgPxVerti / 2
    };
  }
}
