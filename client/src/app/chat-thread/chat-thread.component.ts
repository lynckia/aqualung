import { Component, OnInit, ViewChild } from '@angular/core';
import { ChatMessageModel } from '../chat-message/chatmessage';
import { Subscription } from 'rxjs/Subscription';
import { LicodeService } from '../licode.service';


@Component({
  selector: 'chat-thread',
  templateUrl: './chat-thread.component.html',
  styleUrls: ['./chat-thread.component.css']
})


export class ChatThreadComponent implements OnInit {
  private chatMessages : ChatMessageModel[] = [];
  private chatSubscription: Subscription;
  @ViewChild('chatlist') chatBox:any;

  constructor(private licodeService: LicodeService) {
    this.chatSubscription = this.licodeService.getChatMessages().subscribe(
      chatMessages => {
        this.chatMessages = chatMessages;
        if (this.chatBox) {
          this.chatBox.nativeElement.scrollTop =this.chatBox.nativeElement.scrollHeight;
        }
      });
  }
  ngOnInit(): void {
  }
  onEnter(box: HTMLInputElement) {
    this.licodeService.publishChatMessage(box.value);
    box.value = "";
  }
}
