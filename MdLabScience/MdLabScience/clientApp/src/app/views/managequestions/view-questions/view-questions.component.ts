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
  selector: 'app-view-questions',
  templateUrl: './view-questions.component.html',
  styleUrls: ['./view-questions.component.css']
})
export class ViewQuestionsComponent implements OnInit {
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
  
  accountInfo:any={"QuestionList":"","QuestionId":"", "CatagoryId":"","SubCatagoryId":"","QuestionContent":"","QuestionOptionsList":""};
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
  htmlContentOptions:'';
  @Input() isChecked = false;
  configWiz: NgWizardConfig = {
    selected: 0,
    theme: THEME.arrows,
    toolbarSettings: {
      toolbarExtraButtons: [
        {
          text: 'Finish',
          class: 'btn btn-info',
          event: () => {
          
          }
        },
        {
          text: 'Reset',
          class: 'btn btn-danger',
          event: () => {
            this.resetWizard();
          }
        }
      ]
    }
  };
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
  exerciseList: any=[];
  selectedExcerise: any;

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
     
   });
   this.courseForm = this.courseFormBuilder.group({

    CourseIdList: [this.accountInfo.CourseIdList,[ Validators.required]],    
    ExerciseRecordId: [this.accountInfo.ExerciseRecordId], 
   
 });
    }
   this.filterItemList=[];
  }
  ngOnInit() {

    this.getCourses();  
    
   
  }
  getCourses() {
  
    this.spinner.show();
    this.courseList=[];
    this.myHttpservie.getActiveCourses().subscribe((Data) => {
      this.courseList = Data.json() ;
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  getExerciseList() {
  
    this.spinner.show();
    
    this.myHttpservie.getAllExcercise().subscribe((Data) => {
      var list=Data.json();
      this.exerciseList=[];
       
      for(let i=0;i<list.length;i++)
      {
        if(list[i].EndFrom<this.filterItemList.length)
        {
          this.exerciseList.push(list[i])
        }
      }
    
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  search()
  {
     
    this.getQuestions();
  }
 
  onScrollDown(ev) {
    //  
    // console.log("scrolled down!!", ev);

    // // add another 20 items
    // const start = this.sum;
    // this.skip=this.sum;
    // this.sum += 20;
    // //this.appendItems(start, this.sum);

    // this.direction = "down";
    // this.getQuestions();
  }

  onUp(ev) {
    console.log("scrolled up!", ev);
    const start = this.sum;
    this.sum += 20;
    //this.prependItems(start, this.sum);

    this.direction = "up";
  }
  generateWord() {
    //return chance.word();
  }

 
  showPreviousStep(event?: Event) {
   
    this.ngWizardService.previous();
  }
 
  showNextStep(event?: Event) {
    this.ngWizardService.next();
  }
 
  resetWizard(event?: Event) {
    this.ngWizardService.reset();
  }
 
  setTheme(theme: THEME) {
    this.ngWizardService.theme(theme);
  }
 
  stepChanged(args: StepChangedArgs) {
  
  }
  
   selectchange(args: any) {
     
    this.value = args.target.value;
    this.itemForm.controls.CatagoryId.setValue(this.value);
    //this.getSubCatagorybyId(this.value);
  }
  selectchangeSubCatagory(args: any) {
  
    this.itemForm.controls.SubCatagoryId.setValue(args.target.value);
  }
  downloadsample()
  {
    this.spinner.show()
    var FileSaver = require('file-saver');
    var url=this.myHttpservie.serverName+"api/Questions/DownloadQuestionModel/QuestionModal"
    FileSaver.saveAs(url, "QuestionModal.xlsx");
    this.spinner.hide();
    
  }

 
  getQuestions() {
  
    this.spinner.show();
    //this.listData=[];
  
    this.myHttpservie.getAllQuestion(this.courseForm.controls.CourseIdList.value).subscribe((Data) => {
      debugger
      this.listData = Data.json() ;
      this.filterItemList=Data.json();
      this.getExerciseList();
      this.spinner.hide();

    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  Reset()
  {
    this.itemForm.reset();
  }
  Create()
  {
    this.dataservice.setPurchaseInvoice(0);
    this.router.navigate(['/addupdatequestion']);
    // this.itemForm.reset();
    // this.optinsList=[];
    // this.ngWizardService.reset();
    // this.UpdatedId=null;
  }
  deleteQuestion(val)
  {
    if(confirm('Are you sure to delete this.'))
    this.spinner.show();
    this.listData=[];
    this.myHttpservie.deleteQuestion(val.QuestionId).subscribe((Data) => {
      let response=Data.json();
      this.toastr.error(response, 'Response!');
      this.listData=[];
      this.getQuestions();
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  save() {
       
   this.stepOffset=1;
      
  }
  selectAll(event)
  {
     
  

    this.selectedForDelete=true;
    if ( event.target.checked==true )
    {
    this.listData.forEach(data=>{
      data.IsSelected=true;
      this.selectedDeletedList.push(data);
    });
  

  
  }
  else
  {
    this.listData.forEach(data=>{
      data.IsSelected=false;
    });
    this.selectedDeletedList=[];
  }
  }
  deleteMultiselection()
  {
    if(confirm("Are you sure to delete "+this.selectedDeletedList.length+ " Questions ?"))
    {
      if(this.selectedDeletedList.length>0)
      {
        this.spinner.show();
      this.accountInfo.QuestionList=this.selectedDeletedList;
      this.myHttpservie.deleteMultQuestions(this.accountInfo).subscribe((Data) => {
        this.listData=[];
        this.getQuestions();
        var response=Data.json();
    
  
        this.toastr.success(response, 'Sucess!');
        this.spinner.hide(); 
     
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
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
  editQuestion(val)
  {
    this.dataservice.setPurchaseInvoice(val);
    this.router.navigate(['/addupdatequestion']);
    // this.UpdatedId=val.QuestionId;
    // this.itemForm.controls.QuestionContent.setValue(val.QuestionContent);
    // this.itemForm.controls.CourseId.setValue(val.CourseId);
 
    // this.itemForm.controls.QuestionId.setValue(val.QuestionId);
    // this.optinsList=val.QuestionOptions
    
  }
  editOptions(val)
  {
    this.editOptionSelected=val;
  }
  AddOtion()
  {
    debugger
    if(this.htmlContentOptions!=undefined )
    {
      if((this.optinsList.length<5))
      {
        this.optinsList.push(
          {
            Options:this.htmlContentOptions,
            IsRightAns:false
           
          }
         )
      }
      
      else
    {
        this.toastr.warning('Alert','Maximum options are 5 only.')
    }
    
       this.htmlContentOptions=undefined;
    }
   
  }
  addFordelete(event,val)
  {
     
    this.selectedForDelete=true;
    if(event.target.checked==true)
    {
        this.selectedDeletedList.push(val);
    }
    else
    {
     
      for(let i=0; i<this.selectedDeletedList.length;i++)
      {
          if(this.selectedDeletedList[i].QuestionId==val.QuestionId)
          {
            this.selectedDeletedList.splice(i,1);
          }

      }
      this.listData.forEach((data,index)=>{
        if(data.QuestionId==val.QuestionId)
        {
           
          this.listData[index].IsSelected=false;
        }
       
       
      });
    
    }
   
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
  deleteOption(index)
  {
    debugger
    this.optinsList.splice(index,1);
  }
  exportExcel()
  {
    this.spinner.show();
    this.myHttpservie.exportQuestionInExcel(this.courseForm.controls.CourseIdList.value)
    .subscribe(fileData =>
      {
        var FileSaver = require('file-saver');
        const blob = new Blob([fileData], { type : 'application/vnd.ms.excel' });
        const file = new File([blob], "Questions" + '.xls', { type: 'application/vnd.ms.excel' });
        FileSaver.saveAs(file);
        this.spinner.hide();            

      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
  }
  importQuestionCreate()
  {
    this.myModalUpdate.show();
    this.myInputVariable.nativeElement.value = "";
  }

  importQuestions()
  {
    this.spinner.show();
    this.myModalUpdate.hide();
      this.myHttpservie.importQuestions(this.formDataExcel).subscribe(data => {
       
        this.spinner.hide();
        this.toastr.success(data.json(),"Response");
        this.getQuestions();
        
      }, error=>{this.spinner.hide, this.toastr.error("Response",error)
      });
    
    
  }
  fileChange(event) {
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      this.formDataExcel= new FormData();
      this.formDataExcel.append('file', file, file.name);
  
    }
  }
  selectchangeCatagoryFilter(event)
  {
    this.FilterCatagory=event.target.value
  }
  selectchangecourseList(event)
  {
    this.FilterSubCatagory=event.target.value
  }
  ApplyFilter()
  {
     
    this.isFilterApplied=true;
    this.listData=[];
    this.spinner.show();
    this.myHttpservie.filterQuestions(this.FilterCatagory, this.FilterSubCatagory).subscribe((Data) => {
      debugger
     
      this.listData = Data.json() ;
  
   
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });

   
    if(this.FilterCatagory==0 && this.FilterSubCatagory==0)
    {
      this.isFilterApplied=false;
    }
  
  }
  onChangeExcercise($event)
  {
    if($event!=undefined)
    {
      this.selectedExcerise;
      this.spinner.show();
       
      
      this.myHttpservie.getQuestionByExcercise($event.StartFrom, $event.EndFrom,this.courseForm.controls.CourseIdList.value).subscribe((Data) => {
        debugger
        this.listData = Data.json() ;
        this.filterItemList=Data.json();
        this.spinner.hide();
  
      }, error => { this.spinner.hide(), this.toastr.warning('Server not Response...', 'Please Refresh!') });
    }

  }
}
