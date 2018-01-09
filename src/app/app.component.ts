import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  playerTop: number;
  playerLeft: number;
  wholeTop: number;
  wholeLeft: number;

  ngOnInit(): void {
    this.playerLeft = 50;
    this.playerTop = 50;
    this.randomlyPlaceWhole();

    window.onkeydown = e => {
      const key = e.keyCode ? e.keyCode : e.which;
      const amount = 20;
      console.log(key);
      switch (key) {
        case 37: // left key
          this.playerLeft -= amount;
          break;
        case 38: // up key
          this.playerTop -= amount;
          break;
        case 39: // right key
          this.playerLeft += amount;
          break;
        case 40: // down key
          this.playerTop += amount;
          break;

      }
    };

  }

  randomlyPlaceWhole() {
    this.wholeTop = Math.random() * window.innerHeight;
    this.wholeLeft = Math.random() * window.innerWidth;
  }

}
