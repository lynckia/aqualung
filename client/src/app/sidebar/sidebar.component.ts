import { Component, OnInit, Input } from '@angular/core';
import { BusService } from '../bus.service';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})

export class SidebarComponent implements OnInit {
  @Input()
  role: string;

  private buttons:string[];
  constructor(private busService: BusService) {

  }

  ngOnInit() {
    console.log('REOLELEELEL ', this.role);
    if (this.role === 'host') {
      this.buttons = [
        'th',
        'comment',
        'television',
        'bars',
        'gear'
      ];
    } else {
      this.buttons = [
        'th',
        'comment',
        'television',
        'gear'
      ];
    }
    
  }

  private onClick(button:string) {
    console.log(button);
    this.busService.sendMessageToBus(button);
  }

}
