import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule }   from '@angular/router';

import { AppComponent } from './app.component';
import { RoomComponent } from './room/room.component';
import { HomeComponent } from './home/home.component';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { VideoGridComponent } from './video-grid/video-grid.component'
import { ChatThreadComponent } from './chat-thread/chat-thread.component';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { SidebarButtonComponent } from './sidebar-button/sidebar-button.component'
import { SidebarComponent } from './sidebar/sidebar.component';
import { SettingsComponent } from './settings/settings.component';
import { RequestThreadComponent } from './request-thread/request-thread.component';
import { RequestItemComponent } from './request-item/request-item.component';

@NgModule({
  declarations: [
    AppComponent,
    RoomComponent,
    HomeComponent,
    VideoPlayerComponent,
    VideoGridComponent,
    ChatThreadComponent,
    ChatMessageComponent,
    SidebarComponent,
    SidebarButtonComponent,
    SettingsComponent,
    RequestThreadComponent,
    RequestItemComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot([
      {
        path: '', component: HomeComponent
      },
      {
        path: 'room/:id', component: RoomComponent
      },
      {
        path: 'chat', component: ChatThreadComponent
      }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
