import { Component, OnInit, Input} from '@angular/core';
import { Stream } from '../licode.service'

@Component({
  selector: 'request-item',
  templateUrl: './request-item.component.html',
  styleUrls: ['./request-item.component.css']
})

export class RequestItemComponent implements OnInit {
	
	@Input() 
	request: ScreenRequestModel;
  
  constructor() { }

  ngOnInit() {
  }

}

export class ScreenRequestModel {

	private stream:Stream;

  constructor(stream:Stream) {
  	console.log('ppaspdapspdapsdpaspdpasdpasd', stream);
  	this.stream = stream;
  }

  getStream() {
  	return this.stream;
  }
}
