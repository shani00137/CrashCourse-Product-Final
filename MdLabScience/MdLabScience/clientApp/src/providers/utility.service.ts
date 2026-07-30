import { Injectable, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
@Injectable()
export class UtilityService {
  constructor(private _router: Router, private route: ActivatedRoute, private redirect: Router) {

  }
  isLogged(): Promise<boolean> {
   
    if (typeof (Storage) !== 'undefined') {
      if (sessionStorage.getItem('UserNo')) {
        return Promise.resolve(true);
      }
      else
      {
        this._router.navigateByUrl('/login');
      }
    }
    return Promise.resolve(false);

  }
  sesstionManager() {
    this.isLogged().then((result: boolean) => {
      if (!result) {
        this._router.navigate(['/login']);
      }
    });

  }

}
