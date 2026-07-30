import { InjectableCompiler } from "@angular/compiler/src/injectable_compiler";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { DataService } from "./data.service";
import { UtilityService } from "./utility.service";

@Injectable()
export class AuthGuard implements CanActivate
{
    constructor(private router: Router, private utilityService: UtilityService){

    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean  {
       
        var isActive=true;
        this.utilityService.isLogged().then((info)=>{
             
            isActive=info;
        });
        return isActive;
    }
    
}