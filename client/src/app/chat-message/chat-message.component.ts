import { Component, OnInit, Input } from '@angular/core';
import { ChatMessageModel } from './chatmessage';

@Component({
  selector: 'chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent implements OnInit {
  @Input() message: ChatMessageModel;
  constructor() { }

  ngOnInit() {
    console.log(this.message);
  }
}
