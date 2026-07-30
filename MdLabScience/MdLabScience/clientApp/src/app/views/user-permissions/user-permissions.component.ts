import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpProvierService } from '../../../providers/http-provier.service';

import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-user-permissions',
  templateUrl: './user-permissions.component.html',
  styleUrls: ['./user-permissions.component.scss']
})
export class UserPermissionsComponent implements OnInit {

  @ViewChild('myModal', {static: false}) public myModal: ModalDirective;
  userPagedetail: any;
  menulist: any;
  itemForm: FormGroup;
  searchText:any;
  page:any;
  UpdatePageId: any;
  userRoles: any;
  pages: any;
  userpermissioninfo: any=[];
  userperm8issioninfo: any=[];
  valueRoleList: any;
  nameRoleList: any;
  Selectedvaluet: any;
  value: any;
  name: any;
  checkExistingPage: boolean;
  permissionlist: any;
  usermodel: any={};
  constructor(private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService)
   {
   }

  ngOnInit() {
    this.getPagesList();
    

    this.getRoleList();
  }
  getRoleList() {
    this.spinner.show();
    this.myHttpservie.getUserRoleList().subscribe((Data) => {
      this.userRoles = Data.json();
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  getPagesList() {
    this.spinner.show();
    this.myHttpservie.getPagesList().subscribe((Data) => {
      this.pages = Data.json();
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  //getRoleList
  selectchangeRoleList(args: any) {
    this.Selectedvaluet = args.target.value;
   
    this.getPermisionList();
  }
  getPermisionList() {
    this.spinner.show();
    this.myHttpservie.getPermissionById(this.Selectedvaluet).subscribe((Data) => {
      this.userpermissioninfo = Data.json() ;
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  selectchangePageList(args: any) {
     
    this.value = args.target.value;
    this.name = args.target.options[args.target.selectedIndex].text;
  }
  savePermission() {
  
            this.spinner.show();
          if (this.Selectedvaluet && this.value) {
            this.usermodel.roleid = this.Selectedvaluet;
            this.usermodel.pageid = this.value;
              this.spinner.show();
            this.myHttpservie.savePermission(this.usermodel).subscribe((Data) => {
              this.getPermisionList();
              var response=Data.json();
              this.spinner.hide();
              this.toastr.success("Response", response);
            })
            this.checkExistingPage = false;
          }
}
  //delete pergmission pages
  deletePermission(k: any) {
    if (confirm('Are you sure to want to delete')) {
      this.myHttpservie.deletePermission(k).subscribe((Date) => {

        this.toastr.warning('Record Delete....!', 'Sucess!');

        this.getPermisionList();
      });
    }
  }
}
