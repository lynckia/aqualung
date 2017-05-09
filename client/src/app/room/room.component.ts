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

  private id: any;
  private nickname: string;
  private role: string;

  constructor(
    private route: ActivatedRoute,
    private licodeService: LicodeService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {

      this.id = params['id'];
      this.nickname = params['nickname'];

      if (parseInt(this.id) == this.id) this.role = 'host';
      else this.role = 'guest';

      console.log('***********ROLE', this.role);

      this.licodeService.connect(this.id, this.nickname).subscribe(
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
