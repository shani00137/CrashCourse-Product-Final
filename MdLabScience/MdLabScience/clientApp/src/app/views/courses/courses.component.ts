import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { HttpProvierService } from '../../../providers/http-provier.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ElementRef } from '@angular/core';
import { UtilityService } from '../../../providers/utility.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {

  listData: any[];
  rolemodel:any={};
  itemForm: FormGroup;
  itemMaterialForm:FormGroup;
  UpdatedRoleId:any;
  accountInfo:any={"CatagoryName":"", "CatagoryId":"","Descripation":"","Image":""};
  UpdateModel:any;
  @ViewChild('myModal', {static: false}) public myModal: ModalDirective;
  @ViewChild('materialModal', {static: false}) public materialModal: ModalDirective;
  
  UpdatedId: any;
  message: any;
  files: any;
  filestring: string="";
  ServerName: string;
  @ViewChild('myInput')
  searchText:any;
  myInputVariable: ElementRef;
  CourseUrl: any;
  appModel:any= {};
  totalItems: number = 0;
  currentPage: number   = 1;
  pageSized=20;
  searchMd:any={};
  attachmentList: any[];
  CourseMaterialId: any;
  PDF:any="PDF";
  Video:any="Video";
  Audio:any="Audio"
  progress: number;
  isUploading: boolean;
  IsProcessingStart: boolean;
  reponse: HttpResponse<unknown>;
  dataResponse: any={};
  progressObj: any;
  ResponseText: string;
  progressText:any;

  constructor( public utilityService:UtilityService,private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService) 
  {
 
    this.utilityService.sesstionManager();
    this.ServerName=this.myHttpservie.serverName;
  
     this.itemForm = this.formBuilder.group({
      CourseName: [this.accountInfo.CourseName,[ Validators.required,Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]],
      CourseId: [this.accountInfo.CourseId],
      CourseCode: [this.accountInfo.CourseCode],
          
   });

   this.itemMaterialForm = this.formBuilder.group({
    CourseId: [this.accountInfo.CourseId ,[ Validators.required]],
    MaterialType: [this.accountInfo.MaterialType,[ Validators.required]],
    CourseUrl:[this.accountInfo.CourseUrl,[ Validators.required]]      
 });
   
  }
  ngOnInit() {

    this.getCourse();
  }
  generateFileName(prefix) {
    return  prefix+'_'+this.itemForm.controls.CourseName.value;
  }
  downloadOutline(val)
  {
     
    var ext =  val.CourseUrl.split('.').pop();
    var FileSaver = require('file-saver');   
    FileSaver.saveAs(this.ServerName+val.CourseUrl, "attachment."+ext);
  }
  onOutlineFileChange(event) {
  
    if (event.target.files.length > 0) {
       
      const file = event.target.files[0];
      this.CourseUrl=file;
    }
  }
  getCourse() {
  
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
    this.myHttpservie.getCourses(this.appModel).subscribe((Data) => {
      var data= Data.json() ;
      this.listData = data.Data;
      this.totalItems=data.TotalPages;
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  pageChanged(event)
  {
     
    if(this.currentPage!=event.page)
    {
      this.currentPage=event.page;
      this.getCourse();
    }
    
  }
  search()
  {
    this.getCourse();
  }
  Reset()
  {
    this.itemForm.reset();
  }
  delete(val)
  {
    if(confirm('Are you sure to delete this.'))
    {
      this.spinner.show();
      this.listData=[];
      this.myHttpservie.deleteCourse(val.CourseCode).subscribe((Data) => {
        let response=Data.json();
        this.toastr.error(response, 'Response!');
        this.getCourse();
        this.spinner.hide();
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
    }
  
  }
  onCourseUrlFileChange(event) {
  
    if (event.target.files.length > 0) {
       
      const file = event.target.files[0];
      this.CourseUrl=file;
    }
  }
  save() {
        
    if(this.UpdatedId)
    {
     
      
      this.spinner.show();
      const formData = new FormData();
      if(this.CourseUrl!=null)
      {
        formData.append('CourseUrl', this.CourseUrl,this.generateFileName("Course")+this.CourseUrl.name);
      }
      formData.append('CourseName', this.itemForm.controls.CourseName.value);
      formData.append('CourseCode', this.itemForm.controls.CourseCode.value);
      formData.append('CourseId', this.itemForm.controls.CourseId.value);
      this.myHttpservie.updateCourse(formData).subscribe((Date) => {
        this.getCourse();
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
      const formData = new FormData();
      if(this.CourseUrl!=null)
      {
        formData.append('CourseUrl', this.CourseUrl,this.generateFileName("Course")+this.CourseUrl.name);
      }
      formData.append('CourseName', this.itemForm.controls.CourseName.value);
      formData.append('CourseCode', this.itemForm.controls.CourseCode.value);
      
      this.myHttpservie.saveCourse(formData).subscribe((Data) => {
        this.getCourse();
        this.myModal.hide();
        this.itemForm.reset();
        this.toastr.success(Data.json(), 'Sucess!');
        this.spinner.hide();
        this.filestring="";
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
    }
      
  }

  saveCourseMaterial()
  {
     
    if(this.itemMaterialForm.valid)
    {
      this.progress = 0;
      this.isUploading = true;
      this.ResponseText = "";
      this.IsProcessingStart = false;
      const formData = new FormData();     
      var data=this.itemMaterialForm.controls.MaterialType.value; 
      const maxSizeInBytes = 100 * 1024 * 1024; // 100MB in bytes
        // if (this.CourseUrl.size > maxSizeInBytes) {
        //   this.toastr.success("Response","Upload Successfully");
        // }
      if(this.CourseUrl!=null)
      {
        formData.append('CourseUrl', this.CourseUrl);
      }
      formData.append('MaterialType', data);
      formData.append('CourseId', this.itemMaterialForm.controls.CourseId.value);
      this.myHttpservie.SaveCourseMaterial(formData).subscribe((event:any) => {
       
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round(100 * event.loaded / event.total);
          if (this.progress == 100) {

            this.isUploading = false;
            this.progress = 0;
            this.IsProcessingStart = true;
     
          }
        } else if (event instanceof HttpResponse) {
         
          console.log(event);
          this.reponse = event;
          this.dataResponse = this.reponse.body;
          this.progressObj = this.dataResponse.Info;

          this.IsProcessingStart = false;
         this.toastr.success("Response","Upload Successfully");
          this.getAttachments(this.itemMaterialForm.controls.CourseId.value);
       
     
          this.myModal.hide();
          this.itemMaterialForm.controls.MaterialType.setValue(null);
          this.itemMaterialForm.controls.CourseUrl.setValue(null);
          this.UpdatedId="";
          this.filestring="";
        }
      
      }, error => { this.spinner.hide(), console.log(error),  this.toastr.warning('Server not Response...', 'Please Refresh!') });
    }
    else
    {
      this.itemMaterialForm.markAllAsTouched();
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
  viewAttachment(val)
  {
    this.materialModal.show();
    this.itemMaterialForm.controls.CourseId.setValue(val.CourseId);
    this.CourseMaterialId=val.CourseMaterialId;
    this.getAttachments(val.CourseId);
  }
  getAttachments(courseId) {
    this.attachmentList=[]
    this.myHttpservie.GetCourseMaterial(courseId).subscribe((Data) => {
      var data= Data.json() ;
      console.log(data);
      this.attachmentList = data;     
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  DeleteCourseMaterial(val)
  {
    if(confirm('Are you sure to delete'))
    {
      this.spinner.show();
      this.myHttpservie.DeleteCourseMaterial(val.CourseMaterialId).subscribe((Data) => {
        this.toastr.success("Deleted Successfully","Response");
        this.getAttachments(val.CourseId);
        this.spinner.hide();
        this.spinner.hide();
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
    }
  
  }

}
