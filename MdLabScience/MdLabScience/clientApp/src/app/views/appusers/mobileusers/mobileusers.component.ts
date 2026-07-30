import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { HttpProvierService } from '../../../../providers/http-provier.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ElementRef } from '@angular/core';
import { formatDate } from '@angular/common';
import { DataService } from '../../../../providers/data.service';
import { Router } from '@angular/router';
import { validateLocaleAndSetLanguage } from 'typescript';

@Component({
  selector: 'app-mobileusers',
  templateUrl: './mobileusers.component.html',
  styleUrls: ['./mobileusers.component.scss']
})
export class MobileusersComponent implements OnInit {

  listData: any=[];
  rolemodel:any={};
  itemForm: FormGroup;
  UpdatedRoleId:any;
  accountInfo:any={"CatagoryName":"", "CatagoryId":"","Descripation":"","Image":""};
  @ViewChild('passwordModal', {static: false}) public passwordModal: ModalDirective;
  @ViewChild('searchModal', {static: false}) public searchModal: ModalDirective;
  UpdateModel:any;
  @ViewChild('myModal', {static: false}) public myModal: ModalDirective;
  UpdatedId: any;
  message: any;
  files: any;
  filestring: string="";
  ServerName: string;
  @ViewChild('myInput')
  searchMD:any;
  myInputVariable: ElementRef;
  courseList: any=[];
  searchText:any;
  countryList: any=[];
  appList: any[];
  passwordForm:FormGroup;
  passwordInfo:any={"password":"","UserNo":"","SalemanId":""};
  appModel:any= {};
  totalItems: number = 0;
  currentPage: number   = 1;
  pageSized=20;

  constructor(private formBuilderPassword: FormBuilder,private router: Router,private dataservice: DataService,private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService) 
  {
 
    this.ServerName=this.myHttpservie.serverName;
    this.passwordForm=this.formBuilderPassword.group({
      UserNo:[this.passwordInfo.UserNo],
      password:[this.passwordInfo.password ,[ Validators.required, Validators.minLength(5)]]
    });
    if(this.rolemodel)
    {
     this.itemForm = this.formBuilder.group({
      UserName: [this.accountInfo.UserName,[ Validators.required,Validators.maxLength(30),Validators.minLength(5)]],
      Password: [this.accountInfo.Password,[ Validators.required,Validators.maxLength(8),Validators.minLength(5)]],
      ApplicantId: [this.accountInfo.ApplicantId,[ Validators.required]],
      AppUserId: [this.accountInfo.AppUserId],
 
   });
    }
  }
  ngOnInit() {

    this.getAllAppUsers();
    this.getApplicant();
   
  }

  resetPassword()
  {
     
   
      var password= new String (this.passwordInfo.password);
      if(password.length>=5)
      {

      
      this.spinner.show();
    
      this.myHttpservie.resetUserPasswordAppUser(sessionStorage.getItem("UserNo"), this.passwordInfo.password).subscribe((Data) => {
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
  getAllAppUsers() {
     
    this.spinner.show();
    this.listData=[];
    this.appModel={};
    this. appModel.PageNumber=this.currentPage;
    this.appModel.PageSize=10;
    var search=this.searchMD;
    if(search==undefined)
    {
      search="";
    }
    if(search==null)
    {
      search="";
    }
    if(search=="super")
    {
      search="";
    }
    this.appModel.SearchTerm=search;
    this.myHttpservie.getAllAppUsers(this.appModel).subscribe((Data) => {
     var data = Data.json() ;
      this.listData = data.Data;
      this.totalItems=data.TotalPages;
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  search()
  {
    this.searchModal.hide();
    this.getAllAppUsers();
  }
  pageChanged(event)
  {
     
    if(this.currentPage!=event.page)
    {
      this.currentPage=event.page;
      this.getAllAppUsers();
    }
    
  }
  getApplicant() {
  
    this.spinner.show();
    this.appList=[];
    this.myHttpservie.getApplicants().subscribe((Data) => {
      this.appList = Data.json() ;
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  editPassword(val)
  {
    this.passwordForm.controls.UserNo.setValue(val.AppUserId);
  }
  Reset()
  {
    this.itemForm.reset();
  }

  save() {
       
    if(this.UpdatedId)
    {
      
      this.spinner.show();
    
      this.accountInfo=this.itemForm.value;
      this.accountInfo.PhotoUrl=this.filestring;
      this.myHttpservie.updateApplicant(this.accountInfo).subscribe((Date) => {
        this.getAllAppUsers();
        this.toastr.success(Date.json(), 'Sucess!');
        this.spinner.hide();
        this.myModal.hide();
        this.itemForm.reset();
        this.UpdatedId="";
        this.filestring="";
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
    }
    else
    {
      this.spinner.show();
      
      this.accountInfo=this.itemForm.value;
      this.accountInfo.PhotoUrl=this.filestring;
      this.myHttpservie.saveAppUser(this.accountInfo).subscribe((Data) => {
        this.getAllAppUsers();
        this.myModal.hide();
        this.itemForm.reset();
        this.toastr.success(Data.json(), 'Sucess!');
        this.spinner.hide();
        this.filestring="";
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
    }
      
  }
  status(itemno)
  {
     
    if(confirm("Are you sure to change Status"))
    {
    this.myHttpservie.changeStatusofUsers(itemno).subscribe(result=>{
      this.message=result.json();     
    this.spinner.hide();
     this.toastr.success(this.message,"Sucessful");
    this.myModal.hide();
     this.itemForm.reset();
     this.getAllAppUsers()
   },error=>{this.toastr.warning('Server Error',error.statusText),this.toastr.show()});
  }
  }
  Edit(val)
  {
   var courses=[];
    val.CourseList.forEach(element => {
      courses.push(element.CourseId);
    });
    this.UpdatedId=val.ApplicantId;
    this.itemForm.controls.ApplicantId.setValue(val.ApplicantId);
    this.itemForm.controls.CourseId.setValue(courses);
    this.itemForm.controls.CountryId.setValue(val.CountryId);
    this.itemForm.controls.FirstName.setValue(val.FirstName);
    this.itemForm.controls.LastName.setValue(val.LastName);
    this.itemForm.controls.RegistrationDate.setValue(formatDate(val.RegistrationDate, 'M/d/yyyy', 'en'));
    this.itemForm.controls.Mobile.setValue(val.Mobile);
    this.itemForm.controls.OtherMobile.setValue(val.OtherMobile);
    this.itemForm.controls.Email.setValue(val.Email);
    this.itemForm.controls.Address.setValue(val.Address);
  
  }
  create()
  {
  
    this.itemForm.reset();
    this.UpdatedId=null;

  }
  selectApplicant(val)
  {
   var number= Math.floor((Math.random() * 1000) + 1);
    this.itemForm.controls.UserName.setValue(val.FirstName+val.LastName+val.ApplicantId+number);
  }
  viewServices(val)
  {
    this.dataservice.setSaleInvoice(val);
    this.router.navigate(['/applicantsservices']);
  }
  viewScreenShot(val)
  {
    this.dataservice.setCustomer(val);
    this.router.navigate(['/userscreenshots']);
  }
  delete(val)
  {
    if(confirm('Are you sure to delete this.'))
    {
      this.spinner.show();
      this.listData=[];
      this.myHttpservie.deleteCAppUsers(val.AppUserId).subscribe((Data) => {
        let response=Data.json();
        this.toastr.error(response, 'Response!');
        this.getAllAppUsers();
        this.spinner.hide();
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
    }
  
  }
  resetDeviceId(val)
  {
    if(confirm('Are you sure to Reset Device Id.'))
    {
      this.spinner.show();
      this.listData=[];
      this.myHttpservie.resetDeviceId(val.AppUserId).subscribe((Data) => {
        let response=Data.json();
        this.toastr.success(response, 'Response!');
        this.getAllAppUsers();
        this.spinner.hide();
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
    }
  }
  resetFilter()
  {
    this.searchMD="";
    this.getAllAppUsers();
  }

}
