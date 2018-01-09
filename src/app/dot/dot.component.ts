import {Component, Input, OnInit, Output} from '@angular/core';
import {DotModel} from './dot.model';

@Component({
  selector: 'app-dot',
  templateUrl: './dot.component.html',
  styleUrls: ['./dot.component.css']
})
export class DotComponent implements OnInit {

  @Input()
  model: DotModel;

  @Input()
  styleName: string;

  constructor() { }

  ngOnInit() {
  }

}
