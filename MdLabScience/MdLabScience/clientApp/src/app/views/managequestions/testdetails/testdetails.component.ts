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
  selector: 'app-testdetails',
  templateUrl: './testdetails.component.html',
  styleUrls: ['./testdetails.component.scss']
})
export class TestdetailsComponent implements OnInit {
  UpdatedId: any;
  datalist: any=[];
  searchText:any;
  constructor(private router: Router,private dataservice: DataService,private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService) { 

  }

  ngOnInit(): void {
    this.UpdatedId=this.dataservice.getSaleInvoice();
    if(this.UpdatedId==undefined)
    {
      this.router.navigate(['/create-test']);
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
    this.datalist=[];
    this.myHttpservie.getUserTestDetailsById(this.UpdatedId.TestId).subscribe((Data) => {
      this.datalist = Data.json() ;
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }

}
