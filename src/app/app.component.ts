import {Component, OnInit} from '@angular/core';
import {DotModel} from './dot/dot.model';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {Image, ImageProcessorService} from './image-processor.service';

const GAME_OVER_STRING = 'GAME OVER';
const START_STRING = 'Press to start';

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

  constructor(private sanitizer: DomSanitizer,
              private imageProcessor: ImageProcessorService) {
  }

  get currentFriction() {
    return DotModel.friction;
  }

  ngOnInit(): void {
    this.centerPlayer();
    this.whole.centerX = -100;
    this.whole.radius = 20;
    this.paused = true;
    this.centerText = START_STRING;

    setInterval(() => this.gameLoop(), 10);

    this.initKeyControl();
    this.initTiltControl();
  }

  private restartGame() {
    this.centerPlayer();
    this.randomlyPlaceWhole();
    this.paused = false;
    this.score = 0;
    DotModel.friction = 0.95;
  }

  private centerPlayer() {
    this.player.centerX = window.innerWidth / 2;
    this.player.centerY = window.innerHeight / 2;
    this.player.xSpeed = 0;
    this.player.ySpeed = 0;
  }

  private randomlyPlaceWhole() {
    const radius = this.whole.radius;
    this.whole.centerX = radius + Math.random() * (window.innerWidth - 2 * radius);
    this.whole.centerY = radius + Math.random() * (window.innerHeight - 2 * radius);
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
    const file = files[0];
    const blob = new Blob([file]);
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onload = ev => {
      const original = new Uint8Array(reader.result);

      const jpeg = require('jpeg-js');
      const image: Image = jpeg.decode(original);
      const resultImage = this.imageProcessor.consumeImage(image);
      const resultData = jpeg.encode(resultImage, 100).data;
      const resultBlob = new Blob([resultData], {type: 'image/jpeg'});
      this.image = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(resultBlob));
    };
  }

  private initTiltControl() {
    window.addEventListener('deviceorientation', (e: DeviceOrientationEvent) => {
      if (this.paused) {
        return;
      }
      const factor = 0.01;
      this.player.xSpeed += e.gamma * factor;
      this.player.ySpeed += e.beta * factor;
    });
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
    this.player.advanceOneStep();

    this.detectLevelUp();
    this.detectGameOver();
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
      this.centerPlayer();
      DotModel.friction = 0.8 + Math.random() * 0.19; // From 0.8 to 0.99 is ok
    }
  }
}
