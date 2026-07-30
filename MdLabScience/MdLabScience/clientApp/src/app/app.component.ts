import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { IconSetService } from '@coreui/icons-angular';
import { freeSet } from '@coreui/icons';
import { UtilityService } from '../providers/utility.service';
import { HubConnection } from '@aspnet/signalr';
import * as signalR from '@aspnet/signalr';
import { ToastrService } from 'ngx-toastr';
import getMAC, { isMAC } from 'getmac'

@Component({
  // tslint:disable-next-line
  selector: 'body',
  template: '<router-outlet></router-outlet>',
  providers: [IconSetService],
})
export class AppComponent implements OnInit {
  private _hubConnection: HubConnection;
  constructor(
    private router: Router,
    public iconSet: IconSetService,
    public utilityService:UtilityService,
    private toastr: ToastrService
  ) {
    // iconSet singleton
    iconSet.icons = { ...freeSet };
  }


  ngOnInit() {
  
    
    //this.toastr.info("Payment Still pending.. Please pay our software payment..thanks","Alert")
  //   this._hubConnection = new signalR.HubConnectionBuilder()
  //   .withUrl("http://localhost:2222/signalr")
  //   .build();

  // this._hubConnection
  //   .start()
  //   .then(() => console.log('Connection started!'))
  //   .catch(err => console.log('Error while establishing connection :('));
     
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  //   window.addEventListener('storage', (event) => {
  //     if (event.storageArea == localStorage) {
  //          let token = localStorage.getItem('token_name');
  //          if(token == undefined) { 
  //            // Perform logout
  //            //Navigate to login/home
  //             this.router.navigate(['/login']); 
  //          }
  //     }
  // });
    
    this.getUserAuthication();
  }
  getUserAuthication(): any {
     
    this.utilityService.isLogged().then((result: boolean) => {
      if (!result) {
        debugger
          this.router.navigateByUrl('/login');

      }
      else {
        debugger
        //this.router.navigateByUrl('/dashboard');
      }

    });
  }
}
