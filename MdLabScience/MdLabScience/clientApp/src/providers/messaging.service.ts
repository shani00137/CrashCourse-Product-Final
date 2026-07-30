import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs'
 
@Injectable()
export class MessagingService {
 
currentMessage = new BehaviorSubject(null);
 
constructor() {
 
   
  }
 
 
 
 
}
