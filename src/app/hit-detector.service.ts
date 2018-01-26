import {Injectable} from '@angular/core';
import {BinaryImage, ImageProcessorService} from './image-processor.service';

@Injectable()
export class HitDetectorService {

  imageMask: BinaryImage;

  constructor() {
  }

  isBlocked(screenX: number, screenY: number): boolean {
    const screenPxPerImgPxHoriz = window.innerWidth / this.imageMask.width;
    const screenPxPerImgPxVerti = window.innerHeight / this.imageMask.height;

    const imgX = Math.floor(screenX / screenPxPerImgPxHoriz);
    const imgY = Math.floor(screenY / screenPxPerImgPxVerti);

    return ImageProcessorService.getPixel(this.imageMask, imgY, imgX) === 0;
  }
}
