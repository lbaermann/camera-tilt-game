import {Injectable} from '@angular/core';

export interface Image {
  data: Buffer;
  width: number;
  height: number;
}

@Injectable()
export class ImageProcessorService {

  constructor() {
  }

  consumeImage(image: Image): Image {
    const data: Buffer = image.data;

    this.convertToBlackWhite(data);

    for (let row = 1; row < image.width - 1; row++) {
      for (let col = 1; col < image.height - 1; col++) {
        const index = this.getPixelIndex(image, row, col);
        const above = this.getPixelIndex(image, row - 1, col);
        const below = this.getPixelIndex(image, row + 1, col);
        const left = this.getPixelIndex(image, row, col - 1);
        const right = this.getPixelIndex(image, row, col + 1);

        /*if (above && below && left && right) {
          this.setPixel(image.data, index, 255);
        } else {
          this.setPixel(image.data, index, 0);
        }*/
      }
    }

    return image;
  }

  private getPixel(image: Image, row: number, col: number): number {
    return image.data[this.getPixelIndex(image, row, col)];
  }

  private getPixelIndex(image: Image, row: number, col: number): number {
    return (row * image.width + col) * 4;
  }

  private convertToBlackWhite(data: Buffer) {
    let sum = 0;
    for (let i = 0; i < data.byteLength; i++) {
      sum += data[i];
    }
    const avg = sum / data.byteLength;
    for (let i = 0; i < data.byteLength; i += 4) {
      const localAvg = (data[i] + data[i + 1] + data[i + 2] + data[i + 3]) / 4;
      const resultingPixel = localAvg >= avg ? 255 : 0;
      this.setPixel(data, i, resultingPixel);
    }
  }

  private setPixel(data: Buffer, i: number, resultingPixel: number) {
    for (let j = 0; j < 4; j++) {
      data[i + j] = resultingPixel;
    }
  }
}
