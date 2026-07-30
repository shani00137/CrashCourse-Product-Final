import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpProvierService } from '../../../providers/http-provier.service';

import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  passwordModel:any={}
  constructor(private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService) 
  {
   
  }


  ngOnInit() {
  }
  Save()
  {
   
    if(this.passwordModel.newpassword==this.passwordModel.confirmpassword1)
    {
      this.spinner.show();
     
      this.myHttpservie.ChanagePassword(sessionStorage.getItem("UserNo"), this.passwordModel.OldPassword,this.passwordModel.newpassword).subscribe((Data) => {
        var response = Data.json() ;
        this.toastr.success("Response", response);
        this.passwordModel={};
        this.spinner.hide();
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
    
    }
    else
    {
      alert('Confirm Password Not Match');
    }
      
  }
}
