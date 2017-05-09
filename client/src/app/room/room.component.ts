import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LicodeService } from './../licode.service';
import { BusService } from './../bus.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
  providers: [LicodeService, BusService]
})
export class RoomComponent implements OnInit {

  private id: any;
  private nickname: string;
  private role: string;

  private chat_active:boolean = false;
  private settings_active:boolean = false;

  constructor(
    private route: ActivatedRoute,
    private licodeService: LicodeService,
    private busService: BusService
  ) {
    this.busService.messageSent$.subscribe(
      message => {
        console.log(message);
        switch(message) {
          case 'comment':
            this.chat_active = !this.chat_active;
            break;
          case 'gear':
            this.settings_active = !this.settings_active;
            break;
        }
      });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {

      this.id = params['id'];
      this.nickname = params['nickname'];

      if (parseInt(this.id) == this.id) this.role = 'host';
      else this.role = 'guest';
      
      this.licodeService.connect(this.id, this.nickname, this.role).subscribe(
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
