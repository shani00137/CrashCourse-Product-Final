import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpProvierService } from '../../../providers/http-provier.service';

import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-controller-permission',
  templateUrl: './user-controller-permission.component.html',
  styleUrls: ['./user-controller-permission.component.css']
})
export class UserControllerPermissionComponent implements OnInit {
  listData: any[];
  rolemodel:any={};
  itemForm: FormGroup;
  UpdatedRoleId:any;
  controllerList=[];
  UpdateModel:any;
  @ViewChild('myModal', {static: false}) public myModal: ModalDirective;
  UpdatedId: any;
  message: any;
  userinfo: any=[];
  Selectedvaluet: any;
  permissionModel:any= {};
  constructor(private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService) 
  {
    
  }

  ngOnInit() {
   
    this.getUserList();
  }
  Changestatus(controllerid,permission,val)
  {
     
    this.listData;
    console.log(val)
    for(let i=0;i<val.Controllers.length;i++)
    {
        if(val.Controllers[i].ControllerId==controllerid)
        {
            if(permission==true)
            {
              val.Controllers[i].Permission=false;
            }
            else
            {
              val.Controllers[i].Permission=true;
            }
        }
    }
  
    
  }
  savePermissins()
  {
    
    for(let i=0;i<this.listData.length;i++)
    {
      for(let w=0;w < this.listData[i].Controllers.length;w++)
      {
        this.controllerList.push(this.listData[i].Controllers[w])
      }
        
    }
     
    this.permissionModel={};
    this.permissionModel.UserNo=this.Selectedvaluet;
    this.permissionModel.PermissinList=this.controllerList
    this.spinner.show();
    this.myHttpservie.changeUserControllerPermissionStatus(this.permissionModel).subscribe((Data) => {
      this.message = Data.json() ;
      this.permissionModel={};
      this.controllerList=[];
      this.toastr.success(this.message,"Response")
      this.getPermission(this.Selectedvaluet);
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning(error.statusText, 'Response!') });
  }
  getUserList() {
   
    this.spinner.show();
    this.myHttpservie.getUserInfoList().subscribe((Data) => {
      this.userinfo = Data.json() ;
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server Response...', error.statusText) });
  }
  selectchangeUserList(args)
  {
    this.Selectedvaluet = args.target.value;
    this.getPermission(this.Selectedvaluet)
  }
  getPermission(val) {
  
    this.spinner.show();
    this.listData=[];
    this.myHttpservie.getAllUserPermission(val).subscribe((Data) => {
      this.listData = Data.json() ;
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }

}
