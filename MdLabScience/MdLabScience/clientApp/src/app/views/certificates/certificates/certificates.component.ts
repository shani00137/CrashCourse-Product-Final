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

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.scss']
})
export class CertificatesComponent implements OnInit {
  itemForm: FormGroup;
  accountInfo:any={};
  constructor(private router: Router,private dataservice: DataService,private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService) 
  {
    this.itemForm = this.formBuilder.group({
      Name: [this.accountInfo.Name,[ Validators.required]],
      SerialNo: [this.accountInfo.SerialNo,[ Validators.required]],
      StartDate: [this.accountInfo.StartDate,[ Validators.required]],
      EndDate: [this.accountInfo.EndDate,[ Validators.required]],
      Export: [this.accountInfo.EndDate,[ Validators.required]],
      CourseName: [this.accountInfo.CourseName],
   
      // Email: [this.accountInfo.Email ,[Validators.email]],
   });
  }

  ngOnInit(): void {
    this.accountInfo.Export=null;
  }
  export()
  {
    
    if(this.itemForm.valid)
    {
      this.spinner.show();
      this.myHttpservie.ExportCertificate(this.accountInfo)
      .subscribe(fileData =>
        {
         this.spinner.hide();
        
        let b:any = new Blob([fileData], { type: 'application/pdf' });
        var url= window.URL.createObjectURL(b);
          window.open(url);
        }
      );
    }
    else
    {
        this.itemForm.markAllAsTouched();
    }
   
  }
  Reset()

  {
    this.itemForm.reset();
  }
}
