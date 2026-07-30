import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { HttpProvierService } from '../../../../providers/http-provier.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ElementRef } from '@angular/core';
import { DataService } from '../../../../providers/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-applicantsservices',
  templateUrl: './applicantsservices.component.html',
  styleUrls: ['./applicantsservices.component.scss']
})
export class ApplicantsservicesComponent implements OnInit {
  listData: any[];
  rolemodel:any={};
  itemForm: FormGroup;
  UpdatedRoleId:any;
  accountInfo:any={"AdditionalDocumentsDataflowRemarks":"","AdditionalDocumentsDataflow":"","Remarks":"","Others":"","DataFlowTransferred":"","DataFlowRemarks":"","AdditionalDocuments":"","RegistrationCertificate":"","MatricMarketSheet":"","ExperienceCertificate":"", "CNIC":"", "Passport":"","Photo":"","Degree":""};
  UpdateModel:any;
  @ViewChild('myModal', {static: false}) public myModal: ModalDirective;
  UpdatedId: any={};
  message: any;
  files: any;
  filestring: string="";
  ServerName: string;
  @ViewChild('myInput')
  searchText:any;
  myInputVariable: ElementRef;
  photo: any;
  photoUrl: any;
  passport: any;
  degree: any;
  matricsheetdegree: any;
  intermediaesheet: any;
  experienceCertificate: any;
  additionalDocument: any;
  Degree: any;
  AdditionalDocuments: any;
  RegistrationCertificate: any;
  DegreeUrl: any;
  AdditionalDocumentsUrl: any;
  RegistrationCertificateUrl: any;
  experienceCertificateUrl: any;
  intermediaesheetUrl: any;
  matricsheetdegreeUrl: any;
  GoodStandingDocuments:any;
  passportUrl: any;
  GoodStandingDocumentsUrl: any;
  constructor(private router: Router,private dataservice: DataService,private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService) 
  {
    this.ServerName=this.myHttpservie.serverName;
    this.ServerName=this.myHttpservie.serverName;
    this.itemForm = this.formBuilder.group({  
      ApplicantId: [this.accountInfo.ApplicantId],        
      Photo: [this.accountInfo.Photo],  
      Passport: [this.accountInfo.Passport],
      Degree: [this.accountInfo.Degree],  
      DegreeMarkSheet: [this.accountInfo.DegreeMarkSheet],  
      MatricMarketSheet: [this.accountInfo.MatricMarketSheet],
      IntermediateMarkSheet: [this.accountInfo.IntermediateMarkSheet],    
      ExperienceCertificate: [this.accountInfo.ExperienceCertificate],  
      RegistrationCertificate: [this.accountInfo.RegistrationCertificate],  
      AdditionalDocuments: [this.accountInfo.AdditionalDocuments],    
      DataFlowRemarks: [this.accountInfo.DataFlowRemarks],  
      GoodStandingDocuments:[this.GoodStandingDocuments]
      // DataFlowTransferred: [this.accountInfo.DataFlowTransferred], 
      // Others: [this.accountInfo.Others],  
      // Remarks: [this.accountInfo.Remarks],  
      // AdditionalDocumentsDataflow: [this.accountInfo.AdditionalDocumentsDataflow],   
      // AdditionalDocumentsDataflowRemarks: [this.accountInfo.AdditionalDocumentsDataflowRemarks],  
   });
  }
  ngOnInit() {
     
    this.UpdatedId=this.dataservice.getSaleInvoice();
    if(this.UpdatedId==undefined)
    {
      this.router.navigate(['/applicants']);
    }
    else
    {
      if(this.UpdatedId)
      {
       
        setTimeout(() => {
          this.getFormUpdate(); 
       }, 1000);
        
      }
    }
   
  }
  getFormUpdate() {
    this.spinner.show();
     
      this.myHttpservie.getAplicantServicebyId(this.UpdatedId.ApplicantId).subscribe((Date) => {
        var data=Date.json();
        this.photoUrl=data[0].Photo;
        this.DegreeUrl=data[0].Degree;
        this.AdditionalDocumentsUrl=data[0].AdditionalDocuments;
        this.RegistrationCertificateUrl=data[0].RegistrationCertificate;
        this.experienceCertificateUrl=data[0].ExperienceCertificate;
        this.intermediaesheetUrl=data[0].IntermediateMarkSheet;
        this.matricsheetdegreeUrl=data[0].MatricMarketSheet;
        this.passportUrl=data[0].Passport;
        this.RegistrationCertificateUrl=data[0].RegistrationCertificate;
        this.GoodStandingDocumentsUrl=data[0].GoodStandingDocuments;
        this.itemForm.controls.DataFlowRemarks.setValue(data[0].DataFlowRemarks)
         
        // this.itemForm.controls.CNIC.setValue(data[0].CNIC); 
        // this.itemForm.controls.Photo.setValue(data[0].Photo); 
        // this.itemForm.controls.Passport.setValue(data[0].Passport); 
        // this.itemForm.controls.Degree.setValue(data[0].Degree); 
        // this.itemForm.controls.MatricMarketSheet.setValue(data[0].MatricMarketSheet); 
        // this.itemForm.controls.ExperienceCertificate.setValue(data[0].ExperienceCertificate); 
        // this.itemForm.controls.RegistrationCertificate.setValue(data[0].RegistrationCertificate); 
        // this.itemForm.controls.AdditionalDocuments.setValue(data[0].AdditionalDocuments); 
        // this.itemForm.controls.DataFlowRemarks.setValue(data[0].DataFlowRemarks); 
        // this.itemForm.controls.DataFlowTransferred.setValue(data[0].DataFlowTransferred);
        // this.itemForm.controls.DataFlowTransferred.setValue(data[0].DataFlowTransferred);
        // this.itemForm.controls.Others.setValue(data[0].Others);
        // this.itemForm.controls.Remarks.setValue(data[0].Remarks);
        // this.itemForm.controls.AdditionalDocumentsDataflow.setValue(data[0].AdditionalDocumentsDataflow);
        // this.itemForm.controls.AdditionalDocumentsDataflowRemarks.setValue(data[0].AdditionalDocumentsDataflowRemarks);
        // this.accountInfo.CNIC=data[0].CNIC; 
        // this.accountInfo.Photo=data[0].Photo; 
        // this.accountInfo.Passport=data[0].Passport; 
        // this.accountInfo.Degree=data[0].Degree;       
        // this.accountInfo.MatricMarketSheet=data[0].MatricMarketSheet; 
        // this.accountInfo.ExperienceCertificate=data[0].ExperienceCertificate; 
        // this.accountInfo.AdditionalDocuments=data[0].AdditionalDocuments; 
        // this.accountInfo.DataFlowTransferred=data[0].DataFlowTransferred; 
        // this.accountInfo.AdditionalDocumentsDataflow=data[0].AdditionalDocumentsDataflow; 
        this.spinner.hide();   
    
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  photoFileChange(event) {
  
    if (event.target.files.length > 0) {
       
      const file = event.target.files[0];
      this.photo=file;
    }
  }
  viewAttacment(url)
  {
    window.open(this.ServerName+url, "_blank");
  }
  passportFileChange(event)
  {
    if (event.target.files.length > 0) {
       
      const file = event.target.files[0];
      this.passport=file;
    }
  }
  degreeFileChange(event)
  {
    if (event.target.files.length > 0) {
       
      const file = event.target.files[0];
      this.degree=file;
    }
  }
  matricsheetdegreeFileChange(event)
  {
    if (event.target.files.length > 0) {
       
      const file = event.target.files[0];
      this.matricsheetdegree=file;
    }
  }
  intermediaesheetFileChange(event)
  {
    if (event.target.files.length > 0) {
       
      const file = event.target.files[0];
      this.intermediaesheet=file;
    }
  }
  experienceCertificateFileChange(event)
  {
    if (event.target.files.length > 0) {
       
      const file = event.target.files[0];
      this.experienceCertificate=file;
    }
  }
  additionalDocumentFileChange(event)
  {
    if (event.target.files.length > 0) {
       
      const file = event.target.files[0];
      this.additionalDocument=file;
    }
  }
  registrationCertificateFileChange(event)
  {
    if (event.target.files.length > 0) {
       
      const file = event.target.files[0];
      this.RegistrationCertificate=file;
    }
  }
  goodStandingDocumentsChange(event)
  {
    if (event.target.files.length > 0) {
       
      const file = event.target.files[0];
      this.GoodStandingDocuments=file;
    }
  }
  
 
  generateFileName(prefix) {
    return  prefix+'_'+this.UpdatedId.ApplicantId
  }
  save() {
       
       
      this.spinner.show();
      const formDataUpdate = new FormData();
      if(this.photo!=null)
      {
        formDataUpdate.append('Photo', this.photo,this.generateFileName("Photo")+this.photo.name);
      }
      if(this.additionalDocument!=null)
      {
        formDataUpdate.append('AdditionalDocument', this.additionalDocument,this.generateFileName("AdditionalDocument")+this.additionalDocument.name);
      }
      if(this.experienceCertificate!=null)
      {
        formDataUpdate.append('ExperienceCertificate', this.experienceCertificate,this.generateFileName("ExperienceCertificate")+this.experienceCertificate.name);
      }
      if(this.intermediaesheet!=null)
      {
        formDataUpdate.append('IntermediateMarkSheet', this.intermediaesheet,this.generateFileName("IntermediateMarkSheet")+this.intermediaesheet.name);
      }
      if(this.matricsheetdegree!=null)
      {
        formDataUpdate.append('Matricsheetdegree', this.matricsheetdegree,this.generateFileName("Matricsheetdegree")+this.matricsheetdegree.name);
      }
      if(this.degree!=null)
      {
        formDataUpdate.append('Degree', this.degree,this.generateFileName("Degree")+this.degree.name);
      }
      if(this.passport!=null)
      {
        formDataUpdate.append('Passport', this.passport,this.generateFileName("Passport")+this.passport.name);
      }
      if(this.RegistrationCertificate!=null)
      {
        formDataUpdate.append('PasRegistrationCertificatesport', this.RegistrationCertificate,this.generateFileName("RegistrationCertificate")+this.RegistrationCertificate.name);
      }
      if(this.GoodStandingDocuments!=null)
      {
        formDataUpdate.append('GoodStandingDocuments', this.GoodStandingDocuments,this.generateFileName("GoodStandingDocuments")+this.GoodStandingDocuments.name);
      }
      
      formDataUpdate.append('ApplicantId', this.UpdatedId.ApplicantId);
      formDataUpdate.append('DataFlowRemarks', this.itemForm.controls.DataFlowRemarks.value)
      
      this.myHttpservie.saveApplicantServices(formDataUpdate).subscribe((Date) => {
        this.toastr.success(Date.json(), 'Response!');
        this.spinner.hide();   
        this.getFormUpdate(); 
    
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
    
  }


}
