import {Injectable} from '@angular/core';

@Injectable()
export class TiltControlService {

  verticalAcceleration = 0;
  horizontalAcceleration = 0;
  private mode: 'portrait' | 'landscape_right' | 'landscape_left';

  init() {
    this.detectOrientation();
    window.addEventListener('orientationchange', e => {
      this.detectOrientation();
    });
    window.addEventListener('deviceorientation', e => {
      const factor = 0.01;
      switch (this.mode) {
        case 'portrait':
          this.horizontalAcceleration = e.gamma * factor;
          this.verticalAcceleration = e.beta * factor;
          break;
        case 'landscape_right':
          this.horizontalAcceleration = e.beta * factor;
          this.verticalAcceleration = -e.gamma * factor;
          break;
        case 'landscape_left':
          this.horizontalAcceleration = -e.beta * factor;
          this.verticalAcceleration = e.gamma * factor;
          break;
      }
    });
  }

  private detectOrientation() {
    switch (window.orientation) {
      case -90:
        this.mode = 'landscape_left';
        break;
      case 0:
        this.mode = 'portrait';
        break;
      case 90:
        this.mode = 'landscape_right';
        break;
    }
  }


}
