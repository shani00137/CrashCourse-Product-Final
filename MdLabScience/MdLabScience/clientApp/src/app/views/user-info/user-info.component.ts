import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpProvierService } from '../../../providers/http-provier.service';

import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ɵINTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS } from '@angular/platform-browser-dynamic';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {

  roledetail: any[];
  rolemodel:any={};
  itemForm: FormGroup;
  UpdatedRoleId:any;
  formModel:any={"EmpCode":"","UserName":"","ExpireDate":"","RoleId":"","Email":""};
  UpdateModel:any;
  @ViewChild('myModal', {static: false}) public myModal: ModalDirective;
  @ViewChild('passwordModal', {static: false}) public passwordModal: ModalDirective;
  
  userRoles: any;
  value: any;
  passwordForm:FormGroup;
  passwordInfo:any={"password":"","UserNo":"","SalemanId":""};
  message: any;
  userinfo: any;
  UpdatedUserNo: any;
  employeList: any;
  UpdatedUser: any;
  passwordResetUserNo: any;
  salemandList: any=[];
  constructor(private formBuilderPassword: FormBuilder,private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService)
   {
    this.passwordForm=this.formBuilderPassword.group({
      UserNo:[this.passwordInfo.UserNo],
      password:[this.passwordInfo.password ,[ Validators.required, Validators.minLength(5)]]
    });
    this.itemForm = this.formBuilder.group({
      UserName: [this.formModel.UserName,[ Validators.required]],
   
      Email:[this.formModel.Email,Validators.compose([Validators.required, Validators.email])],
      RoleId:  [this.formModel.RoleId,[ Validators.required]],
      UserNo:  [this.formModel.UserNo],
      SalemanId:[this.formModel.SalemanId]
  });
   }

  ngOnInit() {
    this.getRoleList();
    this.getUserList();
   // this.GetSalemanList();
   
    
  }

  getUserList() {
   
    this.spinner.show();
    this.userinfo=[];
    this.myHttpservie.getUserInfoList().subscribe((Data) => {
      this.userinfo = Data.json() ;
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  create()
  {
    this.itemForm.reset();
   this.UpdatedUserNo="";
    
  }
  // GetSalemanList() {
  
  //   this.spinner.show();
  //   this.salemandList=[];
  //   this.myHttpservie.getAllSaleman().subscribe((Data) => {
  //     this.salemandList = Data.json() ;
  //     this.spinner.hide();
  //   }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  // }
  editPassword(val)
  {
    this.passwordResetUserNo=val.UserNo;
    
  }
  resetPassword()
  {
     
   
      var password= new String (this.passwordInfo.password);
      if(password.length>=5)
      {

      
      this.spinner.show();
    
      this.myHttpservie.resetUserPassword(this.passwordResetUserNo, this.passwordInfo.password).subscribe((Data) => {
        var response = Data.json() ;
        this.toastr.info(response,"Response",  {timeOut: 20000})
        this.spinner.hide();
        this.passwordModal.hide();
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
    }
  
  else

  {
    this.toastr.warning("Alert","Password Minimum length 5 words")
  }
}   
    
    
  
  Reset()
  {
    this.itemForm.reset();
  }
  selectchange(args: any) {
     
    this.value = args.target.value;
    this.formModel.setValue.RoleId(this.value);
  }
  selectchangeSaleman(args: any)
  {
     
    this.value = args.target.value;
    this.formModel.setValue.SalemanId(this.value);
  }
  getRoleList() {
    this.spinner.show();
    this.userRoles=[];
    this.myHttpservie.getUserRoleList().subscribe((Data) => {
      this.userRoles = Data.json();
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  save()
  {
    if(this.UpdatedUserNo)
    {
      this.spinner.show();
      this.myHttpservie.updateUserInfo(this.itemForm.value).subscribe((data) => {
        var response=data.json();
        this.myModal.hide();
        this.formModel={};
        this.itemForm.reset();
        this.toastr.success('Response',response);
        this.getUserList();
       
        this.spinner.hide();
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
    }
    else
    {
    this.spinner.show();
    this.myHttpservie.saveUserInfo(this.itemForm.value).subscribe((Data) => {
      
      var message=Data.json();
      this.spinner.hide();
      this.myModal.hide();
      this.formModel={};
        this.itemForm.reset();
      this.getUserList();
      this.toastr.info(message,'Alert...', {
        closeButton: true,
        disableTimeOut:true
      });
    }, error => { this.spinner.hide(), this.toastr.warning('Server  Response...', error._body) });
  }
  }
  Edit(val)
  {
    
   this.itemForm.reset();
 
    this.UpdatedUserNo=val.UserNo;
    this.itemForm.controls.Email.setValue(val.Email);
    this.itemForm.controls.UserName.setValue(val.UserName);
    this.itemForm.controls.UserNo.setValue(val.UserNo);
    this.itemForm.controls.RoleId.setValue(val.RoleId);
    this.itemForm.controls.SalemanId.setValue(val.SalemanId)

   if(val.EmpCode)
   {
    this.itemForm.controls.EmpCode.setValue(val.EmpCode);
   }
   
  }
  selectchangeEmployee(args)
  {
     
    this.value = args.target.value;
    this.formModel.setValue.EmpCode(this.value);
  }
  Changestatus(classid:any,status:any)
  {
    
    if(confirm('Are you sure to want to Change Status of Class'))
    {
      this.spinner.show();
    
      this.myHttpservie.changeUserStatus(classid,status).subscribe((data) => {
        
          this.message=data.json();
            this.toastr.success(this.message, 'Success!');
            this.getUserList();
        this.spinner.hide();
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
    
    }
  }
  
}
