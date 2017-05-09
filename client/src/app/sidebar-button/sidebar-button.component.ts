import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'sidebar-button',
  templateUrl: './sidebar-button.component.html',
  styleUrls: ['./sidebar-button.component.css']
})
export class SidebarButtonComponent implements OnInit {
  @Input()
  iconName: string;

  constructor() { }

  ngOnInit() {
  }

}
