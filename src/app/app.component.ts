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

  ngOnInit(): void {
    this.player.centerX = window.innerWidth / 2;
    this.player.centerY = window.innerHeight / 2;
    this.whole.radius = 20;
    this.randomlyPlaceWhole();

    setInterval(() => this.gameLoop(), 10);

    this.initKeyControl();
    this.initTiltControl();
  }

  private initTiltControl() {
    window.addEventListener('deviceorientation', (e: DeviceOrientationEvent) => {
      const factor = 1;
      this.player.xSpeed += e.beta * factor;
      this.player.ySpeed += e.gamma * factor;
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
  }

  randomlyPlaceWhole() {
    this.whole.x = Math.random() * window.innerWidth;
    this.whole.y = Math.random() * window.innerHeight;
  }

}
