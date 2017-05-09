import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  private buttons:string[];
  constructor() {
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
  }

}
