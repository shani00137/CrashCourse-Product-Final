import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { HttpProvierService } from '../../../providers/http-provier.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ElementRef } from '@angular/core';

@Component({
  selector: 'app-back-updatabase',
  templateUrl: './back-updatabase.component.html',
  styleUrls: ['./back-updatabase.component.scss']
})
export class BackUpdatabaseComponent implements OnInit {

  listData: any[];
  rolemodel:any={};
  itemForm: FormGroup;
  UpdatedRoleId:any;
  accountInfo:any={"CatagoryName":"", "CatagoryId":"","Descripation":"","Image":""};
  UpdateModel:any;
  @ViewChild('myModal', {static: false}) public myModal: ModalDirective;
  UpdatedId: any;
  message: any;
  files: any;
  filestring: string="";
  ServerName: string;
  @ViewChild('myInput')
myInputVariable: ElementRef;
  constructor(private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService) 
  {

    this.ServerName=this.myHttpservie.serverName;
    this.ServerName=this.myHttpservie.serverName;
    if(this.rolemodel)
    {
     this.itemForm = this.formBuilder.group({ 
      Description: [this.accountInfo.Description], 
      FileName: [this.accountInfo.FileName],    
   });
    }
  
  }
  ngOnInit() {
    this.getAllbackup();
  }

  getAllbackup() {
  
    this.spinner.show();
    this.listData=[];
    this.myHttpservie.getAllBackUp().subscribe((Data) => {
      this.listData = Data.json() ;
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }

  create()
  {
    this.myInputVariable.nativeElement.value = "";
    this.itemForm.reset();
    this.UpdatedId=null;
  }
  save()
  {
    this.spinner.show();
    this.accountInfo=this.itemForm.value;
 
    this.myHttpservie.createBackup(this.accountInfo).subscribe((Date) => {    
      this.toastr.success(Date.json(), 'Response!');
      this.spinner.hide();
      this.getAllbackup();
      this.myModal.hide();

    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  download(val)
  {
     
    this.spinner.show()
    var FileSaver = require('file-saver');
    var url=this.ServerName+"BackupFiles/"+val.FileName
    FileSaver.saveAs(url, val.FileName);
   
    this.spinner.hide();
  }

}
