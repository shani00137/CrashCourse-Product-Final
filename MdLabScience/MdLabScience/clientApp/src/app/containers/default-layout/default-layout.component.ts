import {Component, OnInit, ViewChild } from '@angular/core';
import { navItems } from '../../_nav';
import { HttpProvierService } from '../../../providers/http-provier.service';
import { DataService } from '../../../providers/data.service';
import { NavData } from '../../models/navModel';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnInit {
  
  public sidebarMinimized = false;
  navItems:any=[];
  MenuList: any=[];
  @ViewChild(DefaultLayoutComponent) child;
  message:any=[];
  User: string;
  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }
  constructor(private data: DataService, private myHttpservie:HttpProvierService)
  {
    this.User=sessionStorage.getItem("UserName")
  }
  ngOnInit(): void {
  var data=this.data.getMessage();
  this.navItems=data;
  //   setTimeout(() => {
      
     
  // }, 4000);
    // this.navItems.push(
    //   {
    //     name: 'Dashboard',
    //     url: '/dashboard',
    //     icon: 'icon-speedometer',
    //     badge: {
    //       variant: 'info',
    //       text: 'NEW'
    //     }
    //   },
    //   {
    //     name: 'Dashboard',
    //     url: '/dashboard',
    //     icon: 'icon-speedometer',
    //     badge: {
    //       variant: 'info',
    //       text: 'NEW'
    //     }
    //   },
    //   {
    //     name: 'Dashboard',
    //     url: '/dashboard',
    //     icon: 'icon-speedometer',
    //     badge: {
    //       variant: 'info',
    //       text: 'NEW'
    //     }
    //   },
    //   {
    //     name: 'Base',
    //     url: '/base',
    //     icon: 'icon-puzzle',
    //     children: [
    //       {
    //         name: 'Cards',
    //         url: '/base/cards',
    //         icon: 'icon-puzzle'
    //       },
    //       {
    //         name: 'Carousels',
    //         url: '/base/carousels',
    //         icon: 'icon-puzzle'
    //       },
    //       {
    //         name: 'Collapses',
    //         url: '/base/collapses',
    //         icon: 'icon-puzzle'
    //       },
    //       {
    //         name: 'Forms',
    //         url: '/base/forms',
    //         icon: 'icon-puzzle'
    //       },
    //       {
    //         name: 'Navbars',
    //         url: '/base/navbars',
    //         icon: 'icon-puzzle'
    
    //       },
    //       {
    //         name: 'Pagination',
    //         url: '/base/paginations',
    //         icon: 'icon-puzzle'
    //       },
    //       {
    //         name: 'Popovers',
    //         url: '/base/popovers',
    //         icon: 'icon-puzzle'
    //       },
    //       {
    //         name: 'Progress',
    //         url: '/base/progress',
    //         icon: 'icon-puzzle'
    //       },
    //       {
    //         name: 'Switches',
    //         url: '/base/switches',
    //         icon: 'icon-puzzle'
    //       },
    //       {
    //         name: 'Tables',
    //         url: '/base/tables',
    //         icon: 'icon-puzzle'
    //       },
    //       {
    //         name: 'Tabs',
    //         url: '/base/tabs',
    //         icon: 'icon-puzzle'
    //       },
    //       {
    //         name: 'Tooltips',
    //         url: '/base/tooltips',
    //         icon: 'icon-puzzle'
    //       }
    //     ]
    //   },
    // );
  }
  Logout()
  {
    sessionStorage.setItem('UserNo',"");
    sessionStorage.setItem('NavItems',"");
   
  }
  
}
