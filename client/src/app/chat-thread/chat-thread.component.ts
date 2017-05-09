import { Component, OnInit } from '@angular/core';
import { ChatMessageModel } from '../chat-message/chatmessage';
import { Subscription } from 'rxjs/Subscription';
import { LicodeService } from '../licode.service';

@Component({
  selector: 'app-chat-thread',
  templateUrl: './chat-thread.component.html',
  styleUrls: ['./chat-thread.component.css'],
  providers: [ LicodeService ]
})
export class ChatThreadComponent implements OnInit {
  private chatMessages : ChatMessageModel[] = [];
  private chatSubscription: Subscription;

  constructor(private licodeService: LicodeService) {
    this.chatSubscription = this.licodeService.getChatMessages().subscribe(
      chatMessages => {
        this.chatMessages = chatMessages;
      });
  }
  ngOnInit(): void {
  }
  onEnter(value: string) {
    console.log("Sending ", value);
    this.licodeService.publishChatMessage(value); }
}
