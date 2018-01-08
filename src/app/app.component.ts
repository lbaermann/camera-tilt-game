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
    setTimeout(() => {
      this.wholeTop = 20;
    }, 1000);
  }

}
