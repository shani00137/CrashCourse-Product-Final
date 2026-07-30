import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { HttpProvierService } from '../../../providers/http-provier.service';

import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../../providers/data.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {


  MenuList: any=[];
  navItems:any= [];
  message:string;
  itemForm: FormGroup;
  UpdatedRoleId:any;
  formModel:any={"UserName":"","Password":""};
 
  @ViewChild('myModal', {static: false}) public myModal: ModalDirective;
  usersInfo: any;
  
  UserNo: any;
  UserName: any;
  CreatedDate: any;
  ExpireDate: any;
  data:any=[];
  StoreId: any;
  constructor( private dataService: DataService,private router:Router, private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService)
   {
    this.itemForm = this.formBuilder.group({
      UserName: [this.formModel.UserName,[ Validators.required]],
      Password: [this.formModel.Password,[ Validators.required]],
    
  });
 
}
ngOnInit(): void 
{
} 
onLogin()
{
  this.spinner.show();;
    this.myHttpservie.getLoginDetail(this.itemForm.value).subscribe(data=>{
      this.usersInfo=data.json();
    
      this.spinner.hide();

      if(this.usersInfo.length>0)
      {
          this.itemForm.reset();
          for (var i = 0; i < this.usersInfo.length; i++) {


              this.data = this.usersInfo[i];

              this.UserNo = this.data["UserNo"];
            
              this.UserName = this.data["UserName"];
              this.ExpireDate=this.data["ExpireDate"];
              this.CreatedDate=this.data["CreatedDate"];
              this.StoreId=this.data["StoreId"];
           
              if (typeof (Storage) !== 'undefined') {
                sessionStorage.setItem('UserNo', this.UserNo);
                sessionStorage.setItem('UserName', this.UserName);
                sessionStorage.setItem('ExpireDate', this.ExpireDate);
                sessionStorage.setItem('CreatedDate', this.CreatedDate);
                sessionStorage.setItem('StoreId', this.StoreId);
                
        }

              break;


          }
          this.spinner.hide();
         
        
           this.getMenus(this.UserNo);

      }
      else
      {
        this.spinner.hide();
          this.toastr.error("Please enter corrrect User and Password","Wrong User or Password....!");
      }
    },error=>{this.spinner.hide(), this.toastr.warning("Server error",error._body)})
 
}
getMenus(userNo:any) {
  
  this.myHttpservie.getAllMenuandPages(userNo).subscribe((data) => {
     
      this.MenuList=data.json();
      if(this.MenuList.length)
      {
      
        
            for(let i=0;i<this.MenuList.length;i++)
            {
              debugger
                this.navItems.push(
                  {
                    
                    name: this.MenuList[i].MenuName,
                    url: this.MenuList[i].MenuUrl,
                    icon:  'icon-cursor',
                    children: this.MenuList[i].PageName
                  }
                )
              
            }
            this.dataService.changeMessage(this.navItems);
            this.router.navigateByUrl('/dashboard');
      }
      
   
  }, error => { });
}
}

