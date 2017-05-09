import { Injectable } from '@angular/core';
import { Http, Response }	from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { BusService } from './bus.service';

import { ChatMessageModel } from './chat-message/chatmessage';
import { ScreenRequestModel } from './request-item/request-item.component';


declare var Erizo:any;

export class Stream {
  id: number;
  active: boolean;
  stream: any;
  local: boolean;
  screensharing: boolean;
}

@Injectable()
export class LicodeService {

  private basicExampleUrl = 'https://chotis2.dit.upm.es:3004/createToken';
  private streams: BehaviorSubject<Stream[]>;
  private chatMessages: BehaviorSubject<ChatMessageModel[]>;
  private screenRequests: BehaviorSubject<ScreenRequestModel[]>;
  private mode: BehaviorSubject<string>;
  private dataStore: {
    streams: Stream[],
    chatMessages: ChatMessageModel[],
    screenRequests: ScreenRequestModel[],
    mode: string
  };
  private room;
  private myStream;
  private myScreen;
  private nickname: string;
  private role: string;
  private currentMode = {
    modeName: 'grid',
    mainStreamId: undefined
  };
  private hostMode = undefined;

  constructor(private http: Http, private busService:BusService) {

    this.dataStore = { streams: [], chatMessages: [], screenRequests: [], mode: 'grid' };
    this.streams = <BehaviorSubject<Stream[]>>new BehaviorSubject([]);
    this.chatMessages = <BehaviorSubject<ChatMessageModel[]>>new BehaviorSubject([]);
    this.screenRequests = <BehaviorSubject<ScreenRequestModel[]>>new BehaviorSubject([]);
    this.mode = <BehaviorSubject<string>>new BehaviorSubject('grid');

    this.busService.messageSent$.subscribe(
      message => {
        console.log('Licode Service, Received Messsage from bus', message);
        switch(message) {
          case 'television':
            if(!this.myScreen) {
              this.publishScreen();
            } else {
              this.unPublishScreen();
            }
          case 'th':
            this.maybeToggleLocalMode();
            break;
          default:
            console.log('Licode Service, Unvalid message');
        }
      }
    );
  }

  connect(id, nickname, role): Observable<any> {
    console.log('Licode service, creating token for room', id, ' name ', nickname);
    this.nickname = nickname;
    this.role = role;

    var roomData = {username: 'user', role: 'presenter', room: id};
    if (this.role === 'guest') roomData['roomId'] = id;
    else roomData['room'] = id;

    return this.http.post(this.basicExampleUrl, roomData)
    .map(res => {
      let token = res.text();
      this.room = Erizo.Room({token: token});
      this.room.connect();

      this.room.addEventListener('room-connected',    this.onRoomConnected.bind(this));
      this.room.addEventListener('stream-added',      this.onAddStream.bind(this));
      this.room.addEventListener('stream-removed',    this.removeStream.bind(this));
      this.room.addEventListener('stream-subscribed', this.playStream.bind(this));
      this.applyMode();
      return this.room;
    })
    .catch(this.handleError);
  }

  getRoom() {
    return this.room;
  }

  getStreams(): Observable<Stream[]> {
    return this.streams.asObservable();
  }

  getMode(): Observable<string> {
    return this.mode.asObservable();
  }

  getMyNickname(): string {
    return this.nickname;
  }

  publish(video, audio) {
    video = video || true;
    audio = audio || true;
    this.myStream = Erizo.Stream({audio: audio, video: video, data: true, attributes: {name:this.nickname}});
    this.myStream.init();
    this.myStream.addEventListener('access-accepted', (event) => {
      console.log("Access to screen sharing granted");
      this.room.publish(this.myStream);
    });
    this.myStream.addEventListener('access-denied', (event) => {
      console.log("Access to screen sharing rejected");
    });
  }

  unpublish() {
    this.room.unpublish(this.myStream);
  }

  updateAVConstraints(video, audio) {
    this.unpublish();
    this.publish(video, audio);
  }

  getScreenRequests() :Observable<ScreenRequestModel[]> {
    return this.screenRequests.asObservable();
  }

  getChatMessages() :Observable<ChatMessageModel[]> {
    return this.chatMessages.asObservable();
  }

  publishChatMessage(text:string) {
    this.myStream.sendData({type:'Chat', text:text, nickname: this.nickname});
    this.dataStore.chatMessages.push(new ChatMessageModel(this.nickname, text));
    this.notifyChatChange();
  }

  private publishScreen() {
    this.myScreen = Erizo.Stream({screen: true, data: true, attributes: {myStream: this.myStream.getID()}});
    this.myScreen.init();
    this.myScreen.addEventListener('access-accepted', (event) => {
      console.log("Access to webcam and/or microphone granted");
      var self = this;
      this.room.publish(this.myScreen, {}, function (id, error) {
        if (self.role === 'guest') {
          self.myStream.sendData({type:'Control', action: 'screenRequest', streamId: id});
        } else {
          self.currentMode.modeName = 'screensharing';
          self.applyMode();
        }
      });
      
    });
    this.myScreen.addEventListener('access-denied', (event) => {
      console.log("Access to webcam and/or microphone rejected");
    });
  }

  private unPublishScreen() {
    this.room.unpublish(this.myScreen);
    this.myScreen.close();
    this.myScreen = undefined;
  }

  private onRoomConnected(roomEvent) {
    let nativeStreams = roomEvent.streams;
    this.publish(true, true);
    for (let stream of nativeStreams) {
      this.onAddStream({stream: stream});
    }

  }

  private onAddStream(streamEvent) {
    if (streamEvent.stream.getID() !== this.myStream.getID()) {
      this.room.subscribe(streamEvent.stream);
      streamEvent.stream.addEventListener("stream-data", this.onDataMessage.bind(this));
    } else {
      this.playStream({stream: this.myStream});
    }
  }

  private playStream(streamEvent) {
    let licodeStream = streamEvent.stream;
    var stream = {id: licodeStream.getID(),
                  active: true,
                  screensharing: licodeStream.hasScreen(),
                  stream: licodeStream,
                  local: this.myStream === licodeStream};
    this.dataStore.streams.push(stream);
    if (this.myStream && this.currentMode.modeName === 'screensharing') {
      this.maybeSwitchHostMode('screensharing', stream);
    }
  }

  private removeStream(streamEvent) {
    let licodeStream = streamEvent.stream;
    if (licodeStream.getID() === this.currentMode.mainStreamId) {
      this.currentMode = {
        modeName: 'grid',
        mainStreamId: undefined
      };
    }

    this.dataStore.streams.forEach((stream, index) => {
      if (stream.id === licodeStream.getID()) {
        this.dataStore.streams.splice(index, 1);
      }
    });
    this.applyMode();
  }

  private notifyStreamsChange() {
    let newStreamList = Object.assign({}, this.dataStore).streams;
    this.streams.next(newStreamList);
  }

  private notifyModeChange() {
    let newMode = Object.assign({}, this.dataStore).mode;
    this.mode.next(newMode);
  }

  private notifyChatChange() {
    let newChatList = Object.assign({}, this.dataStore).chatMessages;
    this.chatMessages.next(newChatList);
  }

  private notifyRequestsChange() {
    let newRequestsList = Object.assign({}, this.dataStore).screenRequests;
    this.screenRequests.next(newRequestsList);
  }

  private onDataMessage(streamEvent) {
    console.log("New data message ", streamEvent);
    let theMessage = streamEvent.msg;
    let theStream = streamEvent.stream;
    switch(theMessage.type) {
      case 'Chat':
        console.log("new chat message", theMessage);
        this.dataStore.chatMessages.push(new ChatMessageModel(theMessage.nickname, theMessage.text));
        this.notifyChatChange();
      break;
      case 'Control':
        console.log("new control message", theMessage);
        switch (theMessage.action) {
          case 'switchMode':
            this.hostMode = theMessage.mode;
            this.currentMode = theMessage.mode;
            this.applyMode();
            break;
          case 'screenRequest':
            if (this.role === 'host') {
              let stream = {id: theMessage.streamId,
                            active: true,
                            screensharing: true,
                            stream: {},
                            local: false};
              this.dataStore.screenRequests.push(new ScreenRequestModel(stream));
              this.notifyRequestsChange();
            }
            break
          default:
            console.log("Unknown Control message");
        }
        break;
      default:
        console.log("Default");
    }
  }

  private handleError (error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

  private maybeToggleLocalMode() {
    if (!this.hostMode){
      console.log("There is not a hostMode yet");
      return;
    }
    if (this.currentMode == this.hostMode) {
      this.currentMode.modeName = 'grid';
    } else {
      this.currentMode = this.hostMode;
    }
    this.applyMode();
  }

  private publishNewMode (mode:any) {
    if (this.role === 'guest') {
      return;
    }
    this.myStream.sendData({type:'Control', action: 'switchMode', mode:mode});
  }

  maybeSwitchHostMode(newMode:string, stream:Stream) {
    console.log("maybeSwitchHostMode", newMode, stream);
    if (this.role === 'guest') {
      return;
    }
    this.currentMode.modeName = newMode;
    this.currentMode.mainStreamId = stream.id;
    this.hostMode = this.currentMode;
    this.publishNewMode(this.currentMode);
    this.applyMode();
  }

  private applyMode() {
    let currentStreamId = this.currentMode.mainStreamId;
    let mode = this.currentMode.modeName;
    let mainStreamId;
    let mainStream:Stream;
    if (mode !== 'grid') {
      for (let stream of this.dataStore.streams) {
        if (currentStreamId === stream.id) {
          mainStreamId = currentStreamId;
          mainStream = stream;
        }
      }
      if (!mainStream) {
        return;
      }
    }

    let screenStreamId;
    switch(this.currentMode.modeName) {
      case 'grid':
        this.dataStore.streams.sort((a:Stream, b:Stream) => {
          if (a.local) { return -1; }
          return 1;
        });
        break;
      case 'oneplusn':
        mainStreamId = mainStream.id;
        this.dataStore.streams.sort((a:Stream, b:Stream) => {
          if (a.id === mainStreamId) {
            return -1;
          } else if (b.id === mainStreamId) {
            return 1;
          } else if (a.local) {
            return -1;
          }
          return 1;
        });
        break;
      case 'screensharing':
        screenStreamId = mainStream.id;
        mainStreamId = mainStream.stream.getAttributes().myStream;
        this.dataStore.streams.sort((a:Stream, b:Stream) => {
          if (a.id === screenStreamId) {
            return -1;
          } else if (b.id === screenStreamId) {
            return 1;
          } else if (a.id === mainStreamId) {
            return -1;
          } else if (b.id === mainStreamId) {
            return 1;
          } else if (a.local) {
            return -1;
          }
          return 1;
        });
        break;
      default:
        console.log('Unknown mode', mode);
        return;
    }
    this.dataStore.mode = mode;
    this.notifyStreamsChange();
    this.notifyModeChange();
  }
}
