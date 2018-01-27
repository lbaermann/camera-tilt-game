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
}
