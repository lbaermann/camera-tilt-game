import {Injectable} from '@angular/core';

export interface Image {
  data: Buffer;
  width: number;
  height: number;
}

export interface BinaryImage {
  data: Buffer;
  binaryData: boolean[];
  width: number;
  height: number;
}

@Injectable()
export class ImageProcessorService {

  constructor() {
  }

  static getPixel(image: Image, row: number, col: number): number {
    return image.data[ImageProcessorService.getPixelIndex(image, row, col)];
  }

  static getPixelIndex(image: Image, row: number, col: number): number {
    return (row * image.width + col) * 4;
  }

  consumeImage(image: Image): BinaryImage {
    this.convertToBlackWhite(image.data);

    for (let i = 0; i < 1; i++) {
      this.morphologicOp(image, (top, right, bottom, left) => top || right || bottom || left);
      this.morphologicOp(image, (top, right, bottom, left) => top && right && bottom && left);
    }

    const binaryData: boolean[] = new Array(image.width * image.height);
    for (let i = 0; i < image.width; i++) {
      for (let j = 0; j < image.height; j++) {
        binaryData[i * image.width + j] = ImageProcessorService.getPixel(image, i, j) > 0;
      }
    }
    return {
      data: image.data,
      binaryData: binaryData,
      width: image.width,
      height: image.height
    };
  }

  private morphologicOp(image: Image, functor: (top: number, right: number, bottom: number, left: number) => number) {
    const imgCopy: Image = {
      data: new Buffer(image.data),
      width: image.width,
      height: image.height
    };
    for (let row = 1; row < image.width - 1; row++) {
      for (let col = 1; col < image.height - 1; col++) {
        const index = ImageProcessorService.getPixelIndex(image, row, col);
        const above = ImageProcessorService.getPixel(imgCopy, row - 1, col);
        const below = ImageProcessorService.getPixel(imgCopy, row + 1, col);
        const left = ImageProcessorService.getPixel(imgCopy, row, col - 1);
        const right = ImageProcessorService.getPixel(imgCopy, row, col + 1);

        if (above || below || right || left) {
          this.setPixel(image.data, index, 255);
        } else {
          this.setPixel(image.data, index, 0);
        }
      }
    }
  }

  private convertToBlackWhite(data: Buffer) {
    const avg = this.calcMedian(data);
    for (let i = 0; i < data.byteLength; i += 4) {
      const localAvg = (data[i] + data[i + 1] + data[i + 2] + data[i + 3]) / 4;
      const resultingPixel = localAvg >= avg ? 255 : 0;
      this.setPixel(data, i, resultingPixel);
    }
  }

  /*private calcAvg(data: Buffer) {
    let sum = 0;
    for (let i = 0; i < data.byteLength; i++) {
      sum += data[i];
    }
    return sum / data.byteLength;
  }*/

  private calcMedian(data: Buffer) {
    const buffer = new Buffer(data);
    buffer.sort();
    return buffer[buffer.byteLength / 2];
  }

  private setPixel(data: Buffer, i: number, resultingPixel: number) {
    for (let j = 0; j < 4; j++) {
      data[i + j] = resultingPixel;
    }
  }
}
