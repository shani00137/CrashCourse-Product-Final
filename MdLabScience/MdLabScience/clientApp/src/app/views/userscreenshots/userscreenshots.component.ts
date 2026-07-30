import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { HttpProvierService } from '../../../providers/http-provier.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ElementRef } from '@angular/core';
import { DataService } from '../../../providers/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-userscreenshots',
  templateUrl: './userscreenshots.component.html',
  styleUrls: ['./userscreenshots.component.scss']
})
export class UserscreenshotsComponent implements OnInit {
  userObj: any={};
  listData: any[];
  appModel:any= {};
  currentPage: number=1;
  totalItems: number=0;
  ServerName: string;

  constructor(private router: Router,private dataservice: DataService,private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService) 
  {
    this.ServerName=this.myHttpservie.serverName;
   }

  ngOnInit(): void {
     
    this.userObj=this.dataservice.getCustomer();
    if(Object.keys(this.userObj).length === 0)
    {
      this.router.navigate(['/mobileusers']);
    }
    else
    {
      if(this.userObj)
      {
       
        this.getScreenShots(this.userObj.ApplicantId)
        
      }
    }
  
  }
  getScreenShots(id) {
    this.spinner.show();
    this.listData=[];
    this.appModel={};
    this. appModel.PageNumber=this.currentPage;
    this. appModel.ApplicantId=id;
    this.appModel.PageSize=10;
    this.myHttpservie.GetUserScreenShots(this.appModel).subscribe((Data) => {
     var data = Data.json() ;
      this.listData = data.Data;
      this.totalItems=data.TotalPages;
      console.log(this.listData)
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  pageChanged(event)
  {
     
    if(this.currentPage!=event.page)
    {
      this.currentPage=event.page;
      this.getScreenShots(this.userObj.ApplicantId)
    }
    
  }
  viewAttacment(url)
  {
    window.open(url, "_blank");
  }
}
