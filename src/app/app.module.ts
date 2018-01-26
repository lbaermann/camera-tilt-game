import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { DotComponent } from './dot/dot.component';
import {ImageProcessorService} from './image-processor.service';
import {HitDetectorService} from './hit-detector.service';


@NgModule({
  declarations: [
    AppComponent,
    DotComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    ImageProcessorService,
    HitDetectorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
