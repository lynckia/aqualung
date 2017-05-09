import { Injectable } from '@angular/core';
import { Http, Response }	from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { ChatMessageModel } from './chat-message/chatmessage';

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

  private basicExampleUrl = 'http://chotis2.dit.upm.es:3001/createToken';
  private streams: BehaviorSubject<Stream[]>;
  private chatMessages: BehaviorSubject<ChatMessageModel[]>;
  private dataStore: {
    streams: Stream[],
    chatMessages: ChatMessageModel[]
  };
  private room;
  private myStream;
  private nickname: string;
  private role: string;

  constructor(private http: Http) {
    this.dataStore = { streams: [], chatMessages: [] };
    this.streams = <BehaviorSubject<Stream[]>>new BehaviorSubject([]);
    this.chatMessages = <BehaviorSubject<ChatMessageModel[]>>new BehaviorSubject([]);
  }

  connect(id, nickname, role): Observable<any> {
    console.log('Licode service, creating token for room', id, ' name ', nickname);
    this.nickname = nickname;
    this.role = role;

    return this.http.post(this.basicExampleUrl, {username: 'user', role: 'presenter', room: id})
    .map(res => {
      let token = res.text();
      this.room = Erizo.Room({token: token});
      this.room.connect();

      this.room.addEventListener('room-connected',    this.onRoomConnected.bind(this));
      this.room.addEventListener('stream-added',      this.onAddStream.bind(this));
      this.room.addEventListener('stream-removed',    this.removeStream.bind(this));
      this.room.addEventListener('stream-subscribed', this.playStream.bind(this));

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

  publish() {
    this.myStream = Erizo.Stream({audio: true, video: true, data: true, attributes: {name:this.nickname}});
    this.myStream.init();
    this.myStream.addEventListener('access-accepted', (event) => {
      console.log("Access to webcam and/or microphone granted");
      this.room.publish(this.myStream);
    });
    this.myStream.addEventListener('access-denied', (event) => {
      console.log("Access to webcam and/or microphone rejected");
    });
  }
  getChatMessages() :Observable<ChatMessageModel[]> {
    return this.chatMessages.asObservable();
  }

  publishChatMessage(text:string) {
    console.log("ROOM", this.room)
    this.myStream.sendData({type:'Chat', text:text, nickname: this.nickname});
    this.dataStore.chatMessages.push(new ChatMessageModel(this.nickname, text));
    this.notifyChatChange();
  }

  private onRoomConnected(roomEvent) {
    let nativeStreams = roomEvent.streams;
    this.publish();
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
    this.dataStore.streams.push({id: licodeStream.getID(),
                                 active: true,
                                 screensharing: licodeStream.hasScreen(),
                                 stream: licodeStream,
                                 local: this.myStream === licodeStream});
    this.notifyStreamsChange();
  }

  private removeStream(streamEvent) {
    let licodeStream = streamEvent.stream;
    this.dataStore.streams.forEach((stream, index) => {
      if (stream.id === licodeStream.getID()) {
        this.dataStore.streams.splice(index, 1);
      }
    });
    this.notifyStreamsChange();
  }

  private notifyStreamsChange() {
    let newStreamList = Object.assign({}, this.dataStore).streams;
    newStreamList.sort((a:Stream, b:Stream) => {
      if (a.local) { return -1; }
      return 1;
    });
    this.streams.next(newStreamList);
  }
  private notifyChatChange() {
    let newChatList = Object.assign({}, this.dataStore).chatMessages;
    this.chatMessages.next(newChatList);
  }

  private onDataMessage(streamEvent) {
    console.log("New data message ", streamEvent);
    switch(streamEvent.msg.type) {
      case 'Chat':
        let theMessage = streamEvent.msg;
        console.log("new chat message", theMessage);
        this.dataStore.chatMessages.push(new ChatMessageModel(theMessage.nickname, theMessage.text));
        this.notifyChatChange();
      break;
      case 'Control':
        console.log("new control message");
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


}
