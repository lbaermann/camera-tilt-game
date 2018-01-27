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

    console.log(`Before: ${image.width}x${image.height}`);
    const scale = 8;
    image = this.scaleDown(image, Math.floor(window.innerWidth / scale), Math.floor(window.innerHeight / scale));
    console.log(`After: ${image.width}x${image.height}`);

    const binaryData = this.extractBinaryImgData(image);
    return {
      data: image.data,
      binaryData: binaryData,
      width: image.width,
      height: image.height
    };
  }

  private extractBinaryImgData(image: Image) {
    const binaryData: boolean[] = new Array(image.width * image.height);
    for (let i = 0; i < image.height; i++) {
      for (let j = 0; j < image.width; j++) {
        binaryData[i * image.width + j] = ImageProcessorService.getPixel(image, i, j) > 0;
      }
    }
    return binaryData;
  }

  private convertToBlackWhite(data: Buffer) {
    const avg = this.calcMedian(data);
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
      data: new Buffer(newWidth * newHeight * 4)
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
      data: new Buffer(image.data),
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

  /*private calcAvg(data: Buffer): number {
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
