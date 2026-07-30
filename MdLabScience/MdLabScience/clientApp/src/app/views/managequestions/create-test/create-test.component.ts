import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { HttpProvierService } from '../../../../providers/http-provier.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ElementRef } from '@angular/core';

import { Router } from '@angular/router';
import { DataService } from '../../../../providers/data.service';

@Component({
  selector: 'app-create-test',
  templateUrl: './create-test.component.html',
  styleUrls: ['./create-test.component.scss']
})
export class CreateTestComponent implements OnInit {
  listData: any[];
  rolemodel:any={};
  itemForm: FormGroup;
  UpdatedRoleId:any;
  accountInfo:any={"ApplicantId":"[]", "CatagoryId":"","Descripation":"","Image":""};
  UpdateModel:any;
  @ViewChild('myModal', {static: false}) public myModal: ModalDirective;
  UpdatedId: any;
  message: any;
  files: any;
  filestring: string="";
  ServerName: string;
  @ViewChild('myInput')
  searchText:any;
  myInputVariable: ElementRef;
  courseList: any[];
  applicantList: any[];
  loading:boolean=false;
  testList: any[];
  dueDate: Date;
  constructor(private router: Router,private dataservice: DataService,private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService) 
  {
    
    this.loading=false;
    this.ServerName=this.myHttpservie.serverName;
    if(this.rolemodel)
    {
     this.itemForm = this.formBuilder.group({
      
      TestId: [this.accountInfo.CourseId],
      CourseId: [this.accountInfo.CourseId],
      TestDate: [this.accountInfo.TestDate],
      Questions: [this.accountInfo.Questions],
      Duration:[this.accountInfo.Duration],
      ApplicantId:[this.accountInfo.ApplicantId]
   });
    }
    this.itemForm.controls.ApplicantId.setValue([]);
  
    var sdate = new Date();
    sdate.setDate(sdate.getDate() - 1 );
    this.dueDate=sdate;
  }
  ngOnInit() {
    this.getCourse();
    this.getLastExams();
  
  }

  getCourse() {
  
    this.spinner.show();
    this.courseList=[];
    this.myHttpservie.getActiveCourses().subscribe((Data) => {
      this.courseList = Data.json() ;
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  getLastExams() {
  
    this.spinner.show();
    this.testList=[];
    this.myHttpservie.getRecentTest().subscribe((Data) => {
      this.testList = Data.json() ;
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  getAllApplicants(id) {
  
    this.loading=true;
    this.applicantList=[];
    this.myHttpservie.getActiveApplicants(id).subscribe((Data) => {
      this.applicantList = Data.json() ;
      this.loading=false;
     
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  Reset()
  {
    this.itemForm.reset();
  }
  selectCourse(val)
  {
    this.getAllApplicants(val.CourseId);
  }
  delete(val)
  {
    if(confirm('Are you sure to delete this.'))
    {
      this.spinner.show();
      this.listData=[];
      this.myHttpservie.deleteAppUserTest(val).subscribe((Data) => {
        let response=Data.json();
        this.toastr.error(response, 'Response!');
        this.getLastExams();
        this.spinner.hide();
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
    }
  
  }
  save() {
       
    
      this.spinner.show();
      this.accountInfo=this.itemForm.value;
      this.accountInfo.Image=this.filestring;
      this.myHttpservie.saveApplicantTest(this.accountInfo).subscribe((Data) => {
        this.getCourse();
        this.myModal.hide();
        this.itemForm.reset();
        this.getLastExams();
        this.toastr.success(Data.json(), 'Response!');
        this.spinner.hide();
        this.filestring="";
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
    
      
  }
  percentClass(val)
{
   
  if(val>=0 && val<=35)
  {
    return 'progress-bar bg-danger';
  }
  if(val>36 && val<=60)
  {
    return 'progress-bar bg-warning';
  }
  if(val>61 && val<=100)
  {
    return 'progress-bar bg-success';
  }
  
  
  
}
  Edit(val)
  {
   
    this.UpdatedId=val.CourseId;
    this.itemForm.controls.CourseId.setValue(val.CourseId);
    this.itemForm.controls.CourseCode.setValue(val.CourseCode);
    this.itemForm.controls.CourseName.setValue(val.CourseName);
  
  }
  create()
  {
  
    this.itemForm.reset();
    this.UpdatedId=null;
  }
  status(itemno)
  {
     
    if(confirm("Are you sure to change Status"))
    {
    this.myHttpservie.changeStatusOfCourse(itemno).subscribe(result=>{
      this.message=result.json();     
    this.spinner.hide();
     this.toastr.success(this.message,"Sucessful");
    this.myModal.hide();
     this.itemForm.reset();
     this.getCourse()
   },error=>{this.toastr.warning('Server Error',error.statusText),this.toastr.show()});
  }
  }
  viewTestDetails(val)
  {
    this.dataservice.setSaleInvoice(val);
    this.router.navigate(['/testdetails']);
  }

}
