import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject }    from 'rxjs/Subject';


@Injectable()
export class BusService {
  private messageBusSource = new Subject<string>();
  messageSent$ = this.messageBusSource.asObservable();

  constructor() { }
  sendMessageToBus(message:string) {
    this.messageBusSource.next(message);
  }
}
