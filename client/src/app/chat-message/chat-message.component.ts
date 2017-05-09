import { Component, OnInit, Input } from '@angular/core';
import { ChatMessageModel } from './chatmessage';
import { LicodeService } from '../licode.service';

@Component({
  selector: 'chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent implements OnInit {
  @Input() message: ChatMessageModel;
  private isSelfMessage:boolean = false;
  constructor(private licodeService: LicodeService) {
  }
  ngOnInit() {
    this.isSelfMessage = this.message.nickname === this.licodeService.getMyNickname();

  }
}
