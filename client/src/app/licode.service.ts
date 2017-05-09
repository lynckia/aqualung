import { Injectable } from '@angular/core';
import { Http, Response }	from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

declare var Erizo:any;

export class Stream {
  id: number;
  active: boolean;
  stream: any;
  screensharing: boolean;
}

@Injectable()
export class LicodeService {

  private basicExampleUrl = 'http://chotis2.dit.upm.es:3001/createToken';
  private streams: BehaviorSubject<Stream[]>;
  private dataStore: {
    streams: Stream[];
  }
  private room;

  constructor(private http: Http) {
    this.dataStore = { streams: [] };
    this.streams = <BehaviorSubject<Stream[]>>new BehaviorSubject([]);
  }

  connect(id): Observable<any> {
    console.log('Licode service, creating token for room', id);

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

  private onRoomConnected(roomEvent) {
    let nativeStreams = roomEvent.streams;
    for (let stream of nativeStreams) {
      this.room.subscribe(stream);
    }
  }

  private onAddStream(streamEvent) {
    this.room.subscribe(streamEvent.stream);
  }

  private playStream(streamEvent) {
    let licodeStream = streamEvent.stream;
    this.dataStore.streams.push({id: licodeStream.getID(), active: true, screensharing: licodeStream.hasScreen(), stream: licodeStream});
    this.streams.next(Object.assign({}, this.dataStore).streams);
  }

  private removeStream(streamEvent) {
    let licodeStream = streamEvent.stream;
    this.dataStore.streams.forEach((stream, index) => {
      if (stream.id === licodeStream.getID()) {
        this.dataStore.streams.splice(index, 1);
      }
    });
    this.streams.next(Object.assign({}, this.dataStore).streams);
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
