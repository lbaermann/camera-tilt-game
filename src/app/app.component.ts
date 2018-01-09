import {Component, OnInit} from '@angular/core';
import {DotModel} from './dot/dot.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  player = new DotModel();
  whole = new DotModel();
  score = 0;

  get currentFriction() {
    return DotModel.friction;
  }

  ngOnInit(): void {
    this.whole.radius = 20;
    this.restartGame();

    setInterval(() => this.gameLoop(), 10);

    this.initKeyControl();
    this.initTiltControl();
  }

  private restartGame() {
    this.centerPlayer();
    this.randomlyPlaceWhole();
    this.score = 0;
    DotModel.friction = 0.95;
  }

  private centerPlayer() {
    this.player.centerX = window.innerWidth / 2;
    this.player.centerY = window.innerHeight / 2;
    this.player.xSpeed = 0;
    this.player.ySpeed = 0;
  }

  private initTiltControl() {
    window.addEventListener('deviceorientation', (e: DeviceOrientationEvent) => {
      const factor = 0.01;
      this.player.xSpeed += e.gamma * factor;
      this.player.ySpeed += e.beta * factor;
    });
  }

  private initKeyControl() {
    window.addEventListener('keydown', e => {
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

  gameLoop() {
    this.player.advanceOneStep();

    if (this.player.touches(this.whole)) {
      this.score++;
      this.randomlyPlaceWhole();
      this.centerPlayer();
      DotModel.friction = 0.8 + Math.random() * 0.19; // From 0.8 to 0.99 is ok
    }

    if (this.player.centerX < 0
      || this.player.centerX > window.innerWidth
      || this.player.centerY < 0
      || this.player.centerY > window.innerHeight) {
      this.restartGame();
    }
  }

  randomlyPlaceWhole() {
    this.whole.x = Math.random() * window.innerWidth;
    this.whole.y = Math.random() * window.innerHeight;
  }

}
