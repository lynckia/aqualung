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

  createRoom(room, nickname) {

  	if (!room) {
  		room = Math.floor(Math.random() * 1000000) + 1;	  		
  	}

  	this.router.navigate(['/room', room, {nickname: nickname}]);
  }

}
