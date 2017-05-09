import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { LicodeService, Stream } from '../licode.service';

@Component({
  selector: 'video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})

export class VideoPlayerComponent implements OnInit, OnDestroy {
  @Input()
  stream: Stream;

  @Input()
  visible: boolean;

  constructor(private licodeService: LicodeService) {
  }

  ngOnInit() {
    let options = {
      loader: false,
      bar: false
    };
    setTimeout(() => {
      if (!this.visible) {
        // this.nativeStream.muteVideo();
      }
      this.nativeStream.play("aqua_video_stream_" + this.stream.id, options);
    }, 0);
  }

  ngOnDestroy() {
  }

  maybeFeatureVideo() {
    console.log("MaybeSwitchHostMode", this.stream)
    this.licodeService.maybeSwitchHostMode('oneplusn', this.stream);
  }

  private get nativeStream() {
    return this.stream.stream;
  }

}
