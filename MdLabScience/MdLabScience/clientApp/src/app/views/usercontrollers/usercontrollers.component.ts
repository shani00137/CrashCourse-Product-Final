import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpProvierService } from '../../../providers/http-provier.service';

import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { error } from 'protractor';


@Component({
  selector: 'app-usercontrollers',
  templateUrl: './usercontrollers.component.html',
  styleUrls: ['./usercontrollers.component.css']
})
export class UsercontrollersComponent implements OnInit {
  listData: any[];
  rolemodel:any={};
  itemForm: FormGroup;
  UpdatedRoleId:any;
  searchText:any;
  accountInfo:any={"ControllerName":"", "ControllerUrl":"", "ControllerId":"","MenuId":""};
  UpdateModel:any;
  @ViewChild('myModal', {static: false}) public myModal: ModalDirective;
  UpdatedId: any;
  message: any;
  menulist: any=[];
  constructor(private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService) 
  {
    if(this.rolemodel)
    {
     this.itemForm = this.formBuilder.group({
      ControllerName: [this.accountInfo.Desgination,[ Validators.required]],
      ControllerUrl: [this.accountInfo.Desgination,[ Validators.required]],
      ControllerId: [this.accountInfo.ControllerId],
      MenuId:  [this.accountInfo.MenuId,[ Validators.required]],
   });
    }
  }

  ngOnInit() {
    this.getControllers();
    this.getmenuList();
  }
  getControllers() {
  
    this.spinner.show();
    this.listData=[];
    this.myHttpservie.getUserControllers().subscribe((Data) => {
      this.listData = Data.json() ;
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', error.statusText) });
  }
  changeMenu(e) {
   
    this.itemForm.controls.Menu.setValue(e.target.value);
  }
  Reset()
  {
    this.itemForm.reset();
  }
  save() {
        
    if(this.accountInfo.ControllerId)
    {
      
      this.spinner.show();
   
      this.myHttpservie.updateUserController(this.itemForm.value).subscribe((Date) => {
        this.getControllers();
        this.toastr.success('Record Updated....!', 'Sucess!');
        this.spinner.hide();
        this.myModal.hide();
        this.itemForm.reset();
        this.UpdatedId="";
      }, error => { this.spinner.hide(), this.toastr.warning(error.statusText, 'Please Refresh!') });
    }
    else
    {
      this.spinner.show();
      this.myHttpservie.saveUserController(this.itemForm.value).subscribe((Data) => {
        this.getControllers();
        this.myModal.hide();
        this.itemForm.reset();
        this.toastr.success('Record Inserted....!', 'Sucess!');
        this.spinner.hide();
      },error=>{this.toastr.warning(error.statusText),"Response", this.spinner.hide()});
    }
      
  }
  Edit(val)
  {
   
    this.UpdatedId=val.ControllerId;
    this.accountInfo.ControllerName=val.ControllerName
   this.accountInfo.ControllerUrl=val.ControllerUrl;
   this.accountInfo.ControllerId=val.ControllerId;
   this.itemForm.controls.MenuId.setValue(val.MenuId);
 
  
  }
  create()
  {
    this.itemForm.reset();
  }
  getmenuList() {
    this.spinner.show();
    this.myHttpservie.getMenuList().subscribe(result => {
  
      this.menulist = result.json();
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  deleteController(id:any)
  {
    
    if(confirm('Are you sure to want to Controller'))
    {
      this.spinner.show();
    
      this.myHttpservie.deleteUserController(id).subscribe((data) => {
        
          this.message=data.json();
            this.toastr.success(this.message, 'Success!');
            this.getControllers();
        this.spinner.hide();
      }, error => { this.spinner.hide(), this.toastr.warning(error.statusText, 'Please Refresh!') });
    
    }
  }

}
