import { Component, OnInit } from '@angular/core';
import { BusService } from '../bus.service';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  private buttons:string[];
  constructor(private busService: BusService) {
    this.buttons = [
      'th',
      'comment',
      'television',
      'gear'
    ];
  }

  ngOnInit() {
  }

  private onClick(button:string) {
    console.log(button);
    this.busService.sendMessageToBus(button);
  }

}
