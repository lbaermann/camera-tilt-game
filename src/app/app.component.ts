import {Component, OnInit} from '@angular/core';
import {DotModel, Position} from './dot/dot.model';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {Image, ImageProcessorService} from './image-processor.service';
import {HitDetectorService, HitDirection} from './hit-detector.service';
import jpeg from 'jpeg-js';
import {TiltControlService} from './tilt-control.service';

const GAME_OVER_STRING = 'GAME OVER';
const START_STRING = 'Press to start';
const WAIT_STRING = 'Please wait...';
const WAIT_DECODING_STRING = 'Decoding image...';
const WAIT_TRANSFORMING_STRING = 'Transforming image...';
const WAIT_DISPLAYING_STRING = 'Displaying image...';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  player = new DotModel();
  whole = new DotModel();
  score = 0;
  paused = false;
  centerText: string;
  image: string | SafeUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  maskImg: string | SafeUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

  constructor(private sanitizer: DomSanitizer,
              private imageProcessor: ImageProcessorService,
              private hitDetector: HitDetectorService,
              private tiltControl: TiltControlService) {
  }

  get currentFriction() {
    return DotModel.friction;
  }

  ngOnInit(): void {
    this.randomlyPlacePlayer();
    this.whole.centerX = -100;
    this.whole.radius = 20;
    this.paused = true;
    this.centerText = START_STRING;

    requestAnimationFrame(time => this.gameLoop());

    this.initKeyControl();
    this.tiltControl.init();
  }

  private restartGame() {
    this.randomlyPlacePlayer();
    this.randomlyPlaceWhole();
    this.paused = false;
    this.score = 0;
    DotModel.friction = 0.95;
  }

  private randomlyPlacePlayer() {
    const freePosition = this.hitDetector.findRandomFreePosition(this.player.radius);
    this.player.centerX = freePosition.screenX;
    this.player.centerY = freePosition.screenY;
    this.player.xSpeed = 0;
    this.player.ySpeed = 0;
  }

  private randomlyPlaceWhole() {
    const radius = this.whole.radius;
    const position = this.hitDetector.findRandomFreePosition(radius);
    this.whole.centerX = position.screenX;
    this.whole.centerY = position.screenY;
  }

  private gameOver() {
    this.paused = true;
    this.centerText = GAME_OVER_STRING;
  }

  centerTextClicked() {
    if (!this.paused) {
      return; // If game is not paused, the user doesn't see the center text and didn't want to click on it
    }
    this.restartGame();
    this.centerText = null;
  }

  cameraChanged(files: FileList) {
    this.paused = true;
    this.centerText = WAIT_STRING;

    const file = files[0];
    const blob = new Blob([file]);
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onload = ev => {
      const original = new Uint8Array(reader.result);

      this.centerText = WAIT_DECODING_STRING;
      setTimeout(() => {
        const image: Image = jpeg.decode(original, true);
        this.centerText = WAIT_TRANSFORMING_STRING;

        setTimeout(() => {
          const result = this.imageProcessor.consumeImage(image);
          this.centerText = WAIT_DISPLAYING_STRING;

          setTimeout(() => {
            this.image = this.createDataUrl(result.real);
            this.maskImg = this.createDataUrl(result.maskImg);
            this.hitDetector.imageMask = result.mask;

            this.restartGame();
          }, 10);
        }, 10);
      }, 10);
    };
  }

  private createDataUrl(resultImage: Image) {
    const resultData = jpeg.encode(resultImage, 100).data;
    const resultBlob = new Blob([resultData], {type: 'image/jpeg'});
    return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(resultBlob));
  }

  private initKeyControl() {
    window.addEventListener('keydown', e => {
      if (this.paused) {
        return;
      }
      const key = e.keyCode ? e.keyCode : e.which;
      const amount = 2;
      switch (key) {
        case 37: // left key
          this.player.xSpeed -= amount;
          break;
        case 38: // up key
          this.player.ySpeed -= amount;
          break;
        case 39: // right key
          this.player.xSpeed += amount;
          break;
        case 40: // down key
          this.player.ySpeed += amount;
          break;
      }
    });
  }

  private gameLoop() {
    this.handleTiltControlData();

    const posBefore = this.player.centerPos;
    this.player.advanceOneStep();

    this.detectHits(posBefore);
    this.detectLevelUp();
    this.detectGameOver();

    requestAnimationFrame(time => this.gameLoop());
  }

  private handleTiltControlData() {
    if (this.paused) {
      return;
    }
    this.player.xSpeed += this.tiltControl.horizontalAcceleration;
    this.player.ySpeed += this.tiltControl.verticalAcceleration;
  }

  private detectHits(posBefore: Position) {
    const reflectionFactor = -0.75;
    const hitDirection = this.hitDetector.hitsWall(this.player);
    switch (hitDirection) {
      case HitDirection.HIT_DOWN:
        if (this.player.ySpeed > 0) {
          this.player.centerY = posBefore.y;
          this.player.ySpeed *= reflectionFactor;
        }
        break;
      case HitDirection.HIT_UP:
        if (this.player.ySpeed < 0) {
          this.player.centerY = posBefore.y;
          this.player.ySpeed *= reflectionFactor;
        }
        break;
      case HitDirection.HIT_LEFT:
        if (this.player.xSpeed < 0) {
          this.player.centerX = posBefore.x;
          this.player.xSpeed *= reflectionFactor;
        }
        break;
      case HitDirection.HIT_RIGHT:
        if (this.player.xSpeed > 0) {
          this.player.centerX = posBefore.x;
          this.player.xSpeed *= reflectionFactor;
        }
        break;
      case HitDirection.HIT_DIAGONAL:
        this.player.centerPos = posBefore;
        this.player.xSpeed *= reflectionFactor;
        this.player.ySpeed *= reflectionFactor;
        break;
    }
  }

  private detectGameOver() {
    if (this.player.centerX < 0
      || this.player.centerX > window.innerWidth
      || this.player.centerY < 0
      || this.player.centerY > window.innerHeight) {
      this.gameOver();
    }
  }

  private detectLevelUp() {
    if (this.player.touches(this.whole)) {
      this.score++;
      this.randomlyPlaceWhole();
      this.randomlyPlacePlayer();
      DotModel.friction = 0.9 + Math.random() * 0.099; // From 0.9 to 0.999 is ok
    }
  }
}
