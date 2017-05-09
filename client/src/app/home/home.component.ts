import { Component, OnInit } from '@angular/core';
import { Router, Routes }  from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
  	private router: Router
  ) { }

  ngOnInit() {
  }

  createRoom(event) {
  	console.log('Home Component, creating room');
  	let roomName = Math.floor(Math.random() * 1000000) + 1;
  	let hostKey = Math.floor(Math.random() * 1000000) + 1;
  	this.router.navigate(['/room', roomName, {key: hostKey}]);
  }

}
