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
import { ItemsModel } from '../../../models/itemsModel';

@Component({
  selector: 'app-studentregistration',
  templateUrl: './studentregistration.component.html',
  styleUrls: ['./studentregistration.component.scss']
})
export class StudentregistrationComponent implements OnInit {

  listData: any=[];
  rolemodel:any={};
  itemForm: FormGroup;
  UpdatedRoleId:any;
  accountInfo:any={"CatagoryName":"", "CatagoryId":"","Descripation":"","Image":""};
  UpdateModel:any;
  @ViewChild('myModal', {static: false}) public myModal: ModalDirective;
  UpdatedId: any;
  message: any;
  files: any;page:any;
  filestring: string="";
  ServerName: string;
  @ViewChild('myInput')
  searchText:any={};
  myInputVariable: ElementRef;
  courseList: any=[];
  searchMd: any={};
  countryList: any=[];
  totalItems: number = 0;
  currentPage: number   = 1;
  pageSized=20;
  appModel:any= {};
  constructor(private router: Router,private dataservice: DataService,private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService) 
  {
    this.searchMd.searchText="";
    this.searchMd={};
    this.ServerName=this.myHttpservie.serverName;
    if(this.rolemodel)
    {
     this.itemForm = this.formBuilder.group({
      FirstName: [this.accountInfo.FirstName,[ Validators.required,Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]],
      LastName: [this.accountInfo.LastName,[ Validators.required,Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]],
      Address: [this.accountInfo.Address,[Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]],
      CertifiedApplicantId: [this.accountInfo.CertifiedApplicantId],
      RegistrationDate: [this.accountInfo.RegistrationDate ,[ Validators.required]],
      Email: [this.accountInfo.Email ,[ Validators.required,Validators.email]],
      Mobile: [this.accountInfo.Mobile ,[ Validators.required]],
      Specialty: [this.accountInfo.Specialty ,[ Validators.required]],
      CourseName: [this.accountInfo.CourseName ,[ Validators.required]],
      CountryId: [this.accountInfo.CountryId ,[ Validators.required]]

   });
    }
  }
  ngOnInit() {
    
    
    this.getAllApplicants();
  }

  getCourse() {
  
  
    this.courseList=[];
    this.myHttpservie.getActiveCourses().subscribe((Data) => {
      this.courseList = Data.json() ;
     
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }

  getAllApplicants() {
     
    this.spinner.show();
    this.listData=[];
    this.appModel={};
    this. appModel.PageNumber=this.currentPage;
    this.appModel.PageSize=10;
    var search=this.searchMd.searchText;
    if(search==undefined)
    {
      search="";
    }
    if(search==null)
    {
      search="";
    }
    this.appModel.SearchTerm=search;
    this.myHttpservie.getApplicantsRegistrations(this.appModel).subscribe((Data) => {
      console.log(Data.json());
      
      var data=Data.json();
      this.listData = data.Data;
      this.totalItems=data.TotalPages;
      this.getCountries();
      this.getCourse();
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  getCountries() {
  

    this.countryList=[];
    this.myHttpservie.getCountries().subscribe((Data) => {
      this.countryList = Data.json() ;
     
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  Reset()
  {
    this.itemForm.reset();
  }
 
  save() {
    if(this.itemForm.valid==true)
    {
     
        
        this.spinner.show();      
        this.accountInfo=this.itemForm.value;       
        this.myHttpservie.saveRegisterApplicant(this.accountInfo).subscribe((Date) => {
          this.getAllApplicants();
          this.toastr.success(Date.json(), 'Success!');
          this.spinner.hide();
          this.myModal.hide();
          this.itemForm.reset();
          this.UpdatedId="";
          this.filestring="";
        }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
      
     
    }
    else {
      Object.keys(this.itemForm.controls).forEach(field => {
      const control = this.itemForm.get(field);
      control.markAsTouched({ onlySelf: true });
     });
    }
  
      
  }
  status(itemno)
  {
     
    if(confirm("Are you sure to change Status"))
    {
    this.myHttpservie.changeStatusofApplicant(itemno).subscribe(result=>{
      this.message=result.json();     
    this.spinner.hide();
     this.toastr.success(this.message,"Sucessful");
    this.getAllApplicants();
   },error=>{this.toastr.warning('Server Error',error.statusText),this.toastr.show()});
  }
  }

  Edit(val)
  {
   
  
    this.UpdatedId=val.CertifiedApplicantId;
    this.itemForm.controls.CertifiedApplicantId.setValue(val.CertifiedApplicantId);
    this.itemForm.controls.CourseName.setValue(val.CourseName);
    this.itemForm.controls.CountryId.setValue(val.CountryId);
    this.itemForm.controls.FirstName.setValue(val.FirstName);
    this.itemForm.controls.LastName.setValue(val.LastName);
    this.itemForm.controls.RegistrationDate.setValue(formatDate(val.RegistrationDate, 'M/d/yyyy', 'en'));
    this.itemForm.controls.Mobile.setValue(val.Mobile);
    // this.itemForm.controls.OtherMobile.setValue(val.OtherMobile);
    this.itemForm.controls.Email.setValue(val.Email);
    this.itemForm.controls.Address.setValue(val.Address);
 this.itemForm.controls.Specialty.setValue(val.Specialty);
  
  }
  create()
  {
  
    this.itemForm.reset();
    this.UpdatedId=null;
    this.myInputVariable.nativeElement.value = "";
  }
  getFiles(event: any) {

    this.files = event.target.files;
    var reader = new FileReader();
    reader.onload = this._handleReaderLoaded.bind(this);
    reader.readAsBinaryString(this.files[0]);
  }
  _handleReaderLoaded(readerEvt: any) {
     
    var binaryString = readerEvt.target.result;
    this.filestring = btoa(binaryString);  // Converting binary string data.
  }
  viewServices(val)
  {
    this.dataservice.setSaleInvoice(val);
    this.router.navigate(['/applicantsservices']);
  }
  pageChanged(event)
  {
     
    if(this.currentPage!=event.page)
    {
      this.currentPage=event.page;
      this.getAllApplicants();
    }
    
  }
  search()
  {
    this.getAllApplicants();
  }
  addInvoice(val) {
    // Assuming `val` contains the ID you want to pass
    this.router.navigateByUrl(`applicant-invoice/${val.CertifiedApplicantId}`);
  }
  viewCustomerAccount(val)
  {
    this.router.navigateByUrl(`view-customer-account/${val.CertifiedApplicantId}`)
  }
  deleteRegistration(val)
  {
    if(confirm("Are you sure to delete this"))
    this.spinner.show();      
          
    this.myHttpservie.deleteRegistration(val.CertifiedApplicantId).subscribe((Date) => {
      this.getAllApplicants();
      this.toastr.success(Date.json(), 'Success!');
      this.spinner.hide();
      this.myModal.hide();
      this.itemForm.reset();
      this.UpdatedId="";
      this.filestring="";
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });

  }
}
