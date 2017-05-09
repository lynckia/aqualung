import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { LicodeService } from '../licode.service';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  @Input()
  starting:boolean;

  stream: any;

  @ViewChild('audioInputSelect')audioInputSelect: any;
  @ViewChild('videoInputSelect')videoInputSelect: any;
  @ViewChild('videoElement')    videoElement: any;

  constructor(private licodeService: LicodeService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.start();
  }

  private start() {
    if (this.stream) {
      this.stream.getTracks().forEach(function(track) {
        track.stop();
      });
    }
    let audioSource = this.audioInputSelect.nativeElement.value;
    let videoSource = this.videoInputSelect.nativeElement.value;

    let constraints = {
      audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
      video: {deviceId: videoSource ? {exact: videoSource} : undefined}
    };

    navigator.mediaDevices.getUserMedia(constraints).
        then(this.gotStream.bind(this)).
        then(this.gotDevices.bind(this)).
        catch(this.handleError.bind(this));
  }

  private gotStream(stream) {
    this.stream = stream;
    this.videoElement.nativeElement.srcObject = stream;
    // Refresh button list in case labels have become available
    return navigator.mediaDevices.enumerateDevices();
  }

  private gotDevices(deviceInfos) {
    let selectors = [this.audioInputSelect.nativeElement, this.videoInputSelect.nativeElement];

    let values = selectors.map(function(select) {
      return select.value;
    });

    selectors.forEach(function(select) {
      while (select.firstChild) {
        select.removeChild(select.firstChild);
      }
    });

    for (let i = 0; i !== deviceInfos.length; ++i) {
      let deviceInfo = deviceInfos[i];
      let option = document.createElement('option');
      option.value = deviceInfo.deviceId;
      if (deviceInfo.kind === 'audioinput') {
        option.text = deviceInfo.label ||
            'microphone ' + (this.audioInputSelect.nativeElement.length + 1);
        this.audioInputSelect.nativeElement.appendChild(option);

      } else if (deviceInfo.kind === 'videoinput') {
        option.text = deviceInfo.label || 'camera ' + (this.videoInputSelect.nativeElement.length + 1);
        this.videoInputSelect.nativeElement.appendChild(option);
      } else {
        console.log('Some other kind of source/device: ', deviceInfo);
      }
    }
    selectors.forEach(function(select, selectorIndex) {
      if (Array.prototype.slice.call(select.childNodes).some(function(n) {
        return n.value === values[selectorIndex];
      })) {
        select.value = values[selectorIndex];
      }
    });
  }

  private handleError() {

  }

  private saveSettings() {
    let audioSource = this.audioInputSelect.nativeElement.value;
    let videoSource = this.videoInputSelect.nativeElement.value;

    let constraints = {
      audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
      video: {deviceId: videoSource ? {exact: videoSource} : undefined}
    };

    this.licodeService.updateAVConstraints(constraints.video, constraints.audio);
  }

  private cancel() {

  }

  private onChange(value:string) {
    this.start();
  }

}
