import {Injectable} from '@angular/core';

export interface Image {
  data: Uint8Array;
  width: number;
  height: number;
}

export interface BinaryImage {
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

  consumeImage(image: Image): { real: Image, mask: BinaryImage } {
    this.convertToBlackWhite(image.data);
    for (let i = 0; i < 1; i++) {
      this.morphologicOp(image, (top, right, bottom, left) => top || right || bottom || left);
      this.morphologicOp(image, (top, right, bottom, left) => top && right && bottom && left);
    }

    const downscaled1 = image; // this.scaleDownRelativeToWindow(image, 2);
    const downscaled2 = this.scaleDownRelativeToWindow(downscaled1, 8);
    const binary = this.extractBinaryImage(downscaled2);

    return {
      real: downscaled1,
      mask: binary
    };
  }

  private scaleDownRelativeToWindow(image: Image, scale: number) {
    return this.scaleDown(image,
      Math.floor(window.innerWidth / scale),
      Math.floor(window.innerHeight / scale));
  }

  private extractBinaryImage(image: Image): BinaryImage {
    const binaryData: boolean[] = new Array(image.width * image.height);
    for (let i = 0; i < image.height; i++) {
      for (let j = 0; j < image.width; j++) {
        binaryData[i * image.width + j] = ImageProcessorService.getPixel(image, i, j) > 0;
      }
    }
    return {
      binaryData: binaryData,
      width: image.width,
      height: image.height
    };
  }

  private convertToBlackWhite(data: Uint8Array) {
    const avg = this.calcHistogramQuantil(data);
    console.log(`Histogramm median is ${avg}`);
    for (let i = 0; i < data.byteLength; i += 4) {
      const localAvg = (data[i] + data[i + 1] + data[i + 2] + data[i + 3]) / 4;
      const resultingPixel = localAvg >= avg ? 255 : 0;
      this.setPixel(data, i, resultingPixel);
    }
  }

  private scaleDown(image: Image, newWidth: number, newHeight: number): Image {
    if (newWidth > image.width || newHeight > image.height) {
      console.log('Not scaling down!');
      return image;
    }
    console.log(`Should scale down to: ${newWidth}x${newHeight}`);
    const newImg: Image = {
      width: newWidth,
      height: newHeight,
      data: new Uint8Array(newWidth * newHeight * 4)
    };
    const oldPerNewPxHoriz = image.width / newWidth;
    const oldPerNewPxVerti = image.height / newHeight;
    const newPxSizeHoriz = Math.floor(oldPerNewPxHoriz);
    const newPxSizeVerti = Math.floor(oldPerNewPxVerti);
    console.log(`New px size ${newPxSizeHoriz}x${newPxSizeVerti}`);
    for (let row = 0; row < newImg.height; row++) {
      for (let col = 0; col < newImg.width; col++) {
        const oldStartRow = Math.floor(row * oldPerNewPxVerti);
        const oldStartCol = Math.floor(col * oldPerNewPxHoriz);
        let sum = 0;
        for (let i = 0; i < newPxSizeHoriz; i++) {
          for (let j = 0; j < newPxSizeVerti; j++) {
            sum += ImageProcessorService.getPixel(image, oldStartRow + j, oldStartCol + i);
          }
        }
        const avg = sum / (newPxSizeHoriz * newPxSizeVerti);
        const index = ImageProcessorService.getPixelIndex(newImg, row, col);
        this.setPixel(newImg.data, index, avg >= 128 ? 255 : 0);
      }
    }
    return newImg;
  }

  private morphologicOp(image: Image, functor: (top: number, right: number, bottom: number, left: number) => number) {
    const imgCopy: Image = {
      data: new Uint8Array(image.data),
      width: image.width,
      height: image.height
    };
    for (let row = 1; row < image.height - 1; row++) {
      for (let col = 1; col < image.width - 1; col++) {
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

  private calcHistogramQuantil(data: Uint8Array): number {
    const histogramm: { [key: number]: number } = {};
    for (let i = 0; i < data.byteLength; i += 4) {
      const grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (histogramm[grayscale]) {
        histogramm[grayscale]++;
      } else {
        histogramm[grayscale] = 1;
      }
    }
    const keys = Object.keys(histogramm);
    keys.sort();
    const quantilFactor = 0.25;
    return parseInt(keys[Math.floor(keys.length * quantilFactor)], 10);
  }

  private setPixel(data: Uint8Array, i: number, resultingPixel: number) {
    for (let j = 0; j < 4; j++) {
      data[i + j] = resultingPixel;
    }
  }
}
