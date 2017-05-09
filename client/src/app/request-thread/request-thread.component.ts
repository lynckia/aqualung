import { Component, OnInit } from '@angular/core';
import { ScreenRequestModel } from '../request-item/request-item.component';
import { Subscription } from 'rxjs/Subscription';
import { LicodeService } from '../licode.service';

@Component({
  selector: 'request-thread',
  templateUrl: './request-thread.component.html',
  styleUrls: ['./request-thread.component.css']
})

export class RequestThreadComponent implements OnInit {

  private screenRequests : ScreenRequestModel[] = [];

  constructor(private licodeService: LicodeService) { 
  	this.licodeService.getScreenRequests().subscribe(
      screenRequests => {
        this.screenRequests = screenRequests;
        console.log('screen requests', this.screenRequests);
      }
    );
  }

  ngOnInit() {
  }

  private onClick(request:ScreenRequestModel) {
    console.log('Voy a aceptar request the', request.getStream());
    this.licodeService.maybeSwitchHostMode('screensharing', request.getStream());  }

}
