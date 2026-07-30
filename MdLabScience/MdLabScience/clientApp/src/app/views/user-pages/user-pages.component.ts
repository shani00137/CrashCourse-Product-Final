import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpProvierService } from '../../../providers/http-provier.service';

import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-user-pages',
  templateUrl: './user-pages.component.html',
  styleUrls: ['./user-pages.component.scss']
})
export class UserPagesComponent implements OnInit {

  @ViewChild('myModal', {static: false}) public myModal: ModalDirective;
  userPagedetail: any;
  menulist: any;
  itemForm: FormGroup;
  formModel:any={"PageHeader":"","PageIcone":"","PageName":"","MenuId":"","EmpCode":""};
  UpdatePageId: any;
  constructor(private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService)
   {
    
    this.itemForm = this.formBuilder.group({
      PageHeader: [this.formModel.PageHeader,[ Validators.required]],
      PageIcone: [this.formModel.PageIcone,[ Validators.required]],
      PageName: [this.formModel.PageName,[ Validators.required]],
      MenuId:  [this.formModel.MenuId,[ Validators.required]],
      PageId:  [this.formModel.PageId],
  });
 
 
 1  
   }

  ngOnInit() {
    this.getuserPageList();
    this.getmenuList();
    this.itemForm.controls.Menu.setValue(1);
  }
  getuserPageList() {

    this.spinner.show();
    this.myHttpservie.getUserPageList().subscribe(result => {
    
      this.userPagedetail = result.json();
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });

  }
  changeMenu(e)
  {
    this.itemForm.controls.MenuId.setValue(e.target.value);
  }
  getmenuList() {
    this.spinner.show();
    this.myHttpservie.getMenuList().subscribe(result => {
  
      this.menulist = result.json();
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  Reset()
  {
    this.itemForm.reset();
  }
  create()
  {
    this.itemForm.reset();
    this.itemForm.controls.MenuId.setValue(null);
  }
  save()
  {
    if(this.UpdatePageId)
    {
     
      this.myHttpservie.updateUserPage(this.itemForm.value)
      .subscribe((data) => {

        this.getuserPageList();
        this.myModal.hide();
        this.itemForm.reset();
        this.spinner.hide();
        this.toastr.success('Record Updated....!', 'Success!');
      });
    //alert(JSON.stringify(this.model));

   
    }
    else
    {
      this.spinner.show();
      this.myHttpservie.saveUserPage(this.itemForm.value)
      .subscribe((data) => {
  
        this.getuserPageList();
        this.myModal.hide();
        this.itemForm.reset();
        this.spinner.hide();
        this.toastr.success('Record Inserted....!', 'Sucess!');
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
    }

  //alert(JSON.stringify(this.model));

  
  }
  Edit(val)
  {
   
    this.UpdatePageId=val.PageId;
    this.formModel.PageHeader=val.name
   this.formModel.PageIcone=val.icon;
   this.formModel.PageName=val.url;
   this.formModel.MenuId=val.MenuId;
   this.formModel.PageId=val.PageId;
   this.itemForm.controls.MenuId.setValue(val.MenuId);
  }
}
