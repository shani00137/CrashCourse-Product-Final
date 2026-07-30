import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpProvierService } from '../../../providers/http-provier.service';

import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';



@Component({
  selector: 'app-userroles',
  templateUrl: './userroles.component.html',
  styleUrls: ['./userroles.component.scss']
})
export class UserrolesComponent implements OnInit {
  roledetail: any[];
  rolemodel:any={};
  itemForm: FormGroup;
  UpdatedRoleId:any;
  accountInfo:any={"RoleName":"","RoleId":""};
  UpdateModel:any;
  @ViewChild('myModal', {static: false}) public myModal: ModalDirective;
  constructor(private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService)
   {
     if(this.rolemodel)
     {
      this.itemForm = this.formBuilder.group({
        RoleName: [this.accountInfo.RoleName,[ Validators.pattern(".*\\S.*[a-zA-z0-9 ]"),Validators.required, Validators.minLength(3)]],
        RoleId: [this.accountInfo.RoleId],
    });
     }
   
    }

  ngOnInit() {
    this.getUserList();
  }
  getUserList() {
  
    this.spinner.show();
    this.roledetail=[];
    this.myHttpservie.getUserRoleList().subscribe((Data) => {
      this.roledetail = Data.json() ;
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  Reset()
  {
    this.itemForm.reset();
    this.UpdatedRoleId="";
  }
  save() {
       
    if(this.UpdatedRoleId)
    {
      
      this.spinner.show();
   
      this.myHttpservie.updateUserRole(this.itemForm.value).subscribe((Date) => {
        this.getUserList();
        this.toastr.success('Record Updated....!', 'Sucess!');
        this.spinner.hide();
        this.myModal.hide();
        this.itemForm.reset();
        this.UpdatedRoleId="";
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
    }
    else
    {
      this.spinner.show();
      this.myHttpservie.saveUserRole(this.itemForm.value).subscribe((Data) => {
        this.getUserList();
        this.myModal.hide();
        this.itemForm.reset();
        this.toastr.success('Record Inserted....!', 'Sucess!');
        this.spinner.hide();
      });
    }
      
  }
  Edit(val)
  {
   
    this.UpdatedRoleId=val.RoleId;
   
   this.itemForm.controls.RoleName.setValue(val.RoleName);
   this.itemForm.controls.RoleId.setValue(val.RoleId)
  }
  create()
  {
    this.itemForm.reset();
  }
}
