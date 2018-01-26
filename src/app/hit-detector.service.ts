import {Injectable} from '@angular/core';
import {BinaryImage, ImageProcessorService} from './image-processor.service';
import {DotModel} from './dot/dot.model';

export enum HitDirection {
  NO_HIT,
  HIT_VERTICAL,
  HIT_HORIZONTAL
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

    return ImageProcessorService.getPixel(this.imageMask, imgY, imgX) === 0;
  }

  hitsWall(dot: DotModel): HitDirection {
    if (this.imageMask == null) {
      return HitDirection.NO_HIT;
    }
    const x = dot.centerX;
    const y = dot.centerY;

    if (this.isBlocked(x, y)) {
      if (this.isBlocked(x + this.screenPxPerImgPxHoriz, y)
        || this.isBlocked(x - this.screenPxPerImgPxHoriz, y)) {
        return HitDirection.HIT_HORIZONTAL;
      }
      if (this.isBlocked(x, y + this.screenPxPerImgPxVerti)
        || this.isBlocked(x, y - this.screenPxPerImgPxVerti)) {
        return HitDirection.HIT_VERTICAL;
      }
    }

    return HitDirection.NO_HIT;
  }
}
