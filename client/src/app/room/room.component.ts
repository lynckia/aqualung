import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LicodeService } from './../licode.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
  providers: [LicodeService]
})
export class RoomComponent implements OnInit {

  private id: number;
  private nickname: string;
  private hostKey: number;

  constructor(
    private route: ActivatedRoute,
    private licodeService: LicodeService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {

      this.id = params['id'];
      this.nickname = params['nickname'];
      this.hostKey = params['key'];

      this.licodeService.connect(this.id, this.nickname, this.hostKey).subscribe(
        room => {
            // Log errors if any
            console.log('ahi va', room);
        },
        err => {
            // Log errors if any
            console.log(err);
        });
    });
  }
}
