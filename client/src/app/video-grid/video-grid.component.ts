import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { LicodeService, Stream } from './../licode.service';

@Component({
  selector: 'video-grid',
  templateUrl: './video-grid.component.html',
  styleUrls: ['./video-grid.component.css']
})

export class VideoGridComponent implements OnInit {

  private streams: Stream[] = [];
  private mode: string;
  private streamSubscription: Subscription;

  constructor(private licodeService: LicodeService) {
    this.mode = 'grid';
    this.streamSubscription = this.licodeService.getStreams().subscribe(streams => { this.streams = streams; });
    this.streamSubscription = this.licodeService.getMode().subscribe(mode => { this.mode = mode; });
  }

  ngOnInit() {
  }

  onClick(stream) {
    console.log(stream);
  }

}
