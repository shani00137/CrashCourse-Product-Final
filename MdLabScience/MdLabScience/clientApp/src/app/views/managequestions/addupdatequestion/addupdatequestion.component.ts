import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { HttpProvierService } from '../../../../providers/http-provier.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgWizardConfig, THEME, StepChangedArgs, NgWizardService } from 'ng-wizard';
import { Router } from '@angular/router';
import { DataService } from '../../../../providers/data.service';

@Component({
  selector: 'app-addupdatequestion',
  templateUrl: './addupdatequestion.component.html',
  styleUrls: ['./addupdatequestion.component.scss']
})
export class AddupdatequestionComponent implements OnInit {

  isDropup = true;
  isSearchFinsish: boolean=false;
  formDataExcel:FormData;
  listData: any=[];
  courseList:any=[];
  selectedDeletedList=[];
  rolemodel:any={};
  subcatagoryList:any=[];
  optinsList:any=[];
  itemForm: FormGroup;
  courseForm: FormGroup;
  UpdatedRoleId:any;
  QuestionContentHtml:''
  @ViewChild('myInput')
  myInputVariable: ElementRef;
  filterList:any=[];
  
  accountInfo:any={"QuestionList":"","QuestionId":"", "CatagoryId":"","QuestionOptions":"","QuestionContent":"","QuestionOptionsList":""};
  UpdateModel:'';
  @ViewChild('myModal', {static: false}) public myModal: ModalDirective;
  @ViewChild('myModalUpdate', {static: false}) public myModalUpdate: ModalDirective;

  
  stepOffset:any=0;
  UpdatedId: any;
  message: any;
  isFilterApplied:boolean=false;
  files: any;
  selectedForDelete:boolean;
  filestring: string;
  ServerName: string;
  searchText:any;
  page:any;
  editOptionSelected:any={};
  ContentOptionsModel:any={};
  @Input() isChecked = false;

  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '10rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [
      ['bold']
      ],
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ]
  };
  config2: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '3rem',
    showToolbar: false,
    minHeight: '3rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [
      ['bold']
      ],
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ]
  };

  value: any;
  catagoryList: any=[];
  sTrueSelected: any;
  isTrueSelected: any;
  sum = 500;
  skip=0;
  throttle = 300;
  scrollDistance = 1;
  scrollUpDistance = 2;
  direction = "";
  filterItemList:any=[]
  modalOpen = false;
  temList:any=[];
  FilterSubCatagory: any=0;
  FilterCatagory: any=0;
  UpdatedQuestion: any;
  QuestionId: any;

  constructor(private router: Router,private dataservice: DataService,private ngWizardService: NgWizardService,private courseFormBuilder: FormBuilder, private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService) 
  {
    this.ServerName=this.myHttpservie.serverName;
    this.selectedForDelete=false;
    if(this.rolemodel)
    {
     this.itemForm = this.formBuilder.group({
      QuestionContent: [this.accountInfo.QuestionContent,[ Validators.required]],
      CourseId: [this.accountInfo.CourseId,[ Validators.required]],   
      QuestionId: [this.accountInfo.QuestionId],
      QuestionOptions: [this.accountInfo.QuestionOptions],
      
     
   });
   this.courseForm = this.courseFormBuilder.group({

    CourseIdList: [this.accountInfo.CourseIdList,[ Validators.required]],    
   
 });
    }
   this.filterItemList=[];
  }
  ngOnInit() {
    this.getCourses();
    this.UpdatedQuestion=this.dataservice.getPurchaseInvoice();
     
    if(this.UpdatedQuestion!=null )
    {
      this.QuestionId=this.UpdatedQuestion.QuestionId;
      this.getQuestionById(this.QuestionId);
    }
  }
  getCourses() {
  
    this.spinner.show();
    this.courseList=[];
    this.myHttpservie.getActiveCourses().subscribe((Data) => {
      this.courseList = Data.json() ;
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  submitQuestion()
  {
     
    if(this.itemForm.valid)
    {
      if(this.optinsList.length>2)
      {
          this.isTrueSelected=this.selectOptionTrueOrFlase();
          if(this.isTrueSelected==true)
          {
            if(this.UpdatedId)
            {
               
              this.spinner.show();
              this.accountInfo=this.itemForm.value;
              this.accountInfo.Image=this.filestring;
              this.accountInfo.QuestionOptionsList=this.optinsList;
            
              this.myHttpservie.updateQuestion(this.accountInfo).subscribe((Date) => {
             
                this.toastr.success('Record Updated....!', 'Sucess!');
                this.spinner.hide();
              
              this.itemForm.reset();





                this.UpdatedId="";
                this.filestring="";
                this.optinsList=[];
              
                this.listData=[];
               
              }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
            }
            else
            {
              this.spinner.show();
              this.accountInfo=this.itemForm.value;
              this.accountInfo.Image=this.filestring;
              this.accountInfo.QuestionOptionsList=this.optinsList;
              this.myHttpservie.SaveQuestion(this.accountInfo).subscribe((Data) => {
           
              
                this.accountInfo.CatagoryId=this.value;
             
                this.toastr.success('Record Inserted....!', 'Sucess!');
                this.spinner.hide();
                this.filestring="";
                this.optinsList=[];
               
                this.filterItemList=[];
                this.listData=[];
              
              }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
            }
          }
          else
          {
            this.toastr.warning('Please choose Right one amoung the Options...','Alert')
          }
      }
      else
      {
        this.toastr.warning('Please add Question Options which are more then TWO..','Alert')
      }
    }
  }
  selectOptionTrueOrFlase(): any {
    let valueis=false;
    for(let i=0;i<this.optinsList.length;i++)
    {
      
          if(this.optinsList[i].IsRightAns==true)
          {
            valueis=true;
              break;
          }
          else
          {
            valueis=false;
          }

          
    }
    return valueis;
  }
  Changestatus(index,status)
  {
    for(let i=0;i<this.optinsList.length;i++)
    {
      debugger
          if(i==index)
          {
              this.optinsList[i].IsRightAns=true;
          }
          else
          {
            this.optinsList[i].IsRightAns=false;
          }
    }
    
  }
  AddOtion()
  {
    debugger
    if(this.itemForm.controls.QuestionOptions.value)
    {
      if((this.optinsList.length<5))
      {
        this.optinsList.push(
          {
            Options:this.itemForm.controls.QuestionOptions.value,
            IsRightAns:false
           
          }
         );
         this.itemForm.controls.QuestionOptions.setValue('');
         
      }
      
      else
    {
        this.toastr.warning('Alert','Maximum options are 5 only.')
    }
    
      
    }
   
  }
  editQuestion(val)
  {
     

    this.UpdatedId=val.QuestionId;
    this.itemForm.controls.QuestionContent.setValue(val.QuestionContent);
    this.itemForm.controls.CourseId.setValue(val.CourseId); 
    this.itemForm.controls.QuestionId.setValue(val.QuestionId);
    this.optinsList=val.QuestionOptions
    this.QuestionId=val.QuestionId;
  
  }
  gotoNextQuestion()
  {
    
        this.spinner.show(); 
        if(this.itemForm.controls.QuestionId.value=="")
        {
          this.itemForm.controls.QuestionId.setValue(0);
        }   
        if(this.itemForm.controls.QuestionId.value==null)
        {
          this.itemForm.controls.QuestionId.setValue(this.QuestionId);
        }   
       
    this.myHttpservie.getNextQuestion(this.itemForm.controls.QuestionId.value).subscribe((Data) => {
      var response = Data.json() ;
       
      if(response.length>0)
      {
        this.editQuestion(response[0]);
      }
      else
      {
        this.toastr.warning("No More Questions","Alert");
        this.optinsList=[];
      }
      

      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  deleteOption(index)
  {
    debugger
    this.optinsList.splice(index,1);
  }
  gotoLastQuestion()
  {
     
        this.spinner.show(); 
        if(this.itemForm.controls.QuestionId.value=="")
        {
          this.itemForm.controls.QuestionId.setValue(1);
        } 
        if(this.itemForm.controls.QuestionId.value==null)
        {
          this.itemForm.controls.QuestionId.setValue(this.QuestionId);
        }   
       
    this.myHttpservie.getLastQuestion(this.itemForm.controls.QuestionId.value).subscribe((Data) => {
      var response = Data.json() ;
    
      this.editQuestion(response[0]);
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  deleteQuestion(val)
  {
    if(confirm('Are you sure to delete this.'))
    this.spinner.show();
   
    this.myHttpservie.deleteQuestion(val.QuestionId).subscribe((Data) => {
      let response=Data.json();
      this.toastr.error(response, 'Response!');
      this.getQuestionById(this.QuestionId);
      
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  getQuestionById(id)
  {
    
    this.myHttpservie.getQuestionById(id).subscribe((Data) => {
      var response = Data.json() ;
       
      this.editQuestion(response[0]);
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  reset()
  {
    this.itemForm.reset();
    this.UpdatedId=null;
    this.QuestionId=0;
    this.optinsList=[];
  }
}