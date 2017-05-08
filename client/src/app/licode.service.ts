import { Injectable } from '@angular/core';
import { Http, Response }	from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

declare var Erizo:any;

@Injectable()
export class LicodeService {

  constructor(private http: Http) { }

  private basicExampleUrl = 'http://chotis2.dit.upm.es:3001/createToken';

  connect(id): Observable<any> {
  	console.log('Licode service, creating token for room', id);

	 	return this.http.post(this.basicExampleUrl, {username: 'user', role: 'presenter', room: 'pepe'})
               .map(res => {
               		let token = res.text();
               		let room = Erizo.Room({token: token});
               		room.connect();
               		return room;
               	})
               .catch(this.handleError);

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