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
  private streamSubscription: Subscription;

  private mode: string;

  constructor(private licodeService: LicodeService) {
    this.mode = 'grid';
    this.streamSubscription = this.licodeService.getStreams().subscribe(streams => { this.streams = streams; });
  }

  ngOnInit() {
  }

  onClick(stream) {
    console.log(stream);
  }

}
