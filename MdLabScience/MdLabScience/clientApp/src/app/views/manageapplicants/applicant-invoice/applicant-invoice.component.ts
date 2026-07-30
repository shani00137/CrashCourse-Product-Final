import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { HttpProvierService } from '../../../../providers/http-provier.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../../providers/data.service';
import { DatePipe } from '@angular/common';
import { CurrencyCode } from '../../../models/currencyModel';
import { ServiceModel } from '../../../models/serviceModel';

@Component({
  selector: 'app-applicant-invoice',
  templateUrl: './applicant-invoice.component.html',
  styleUrls: ['./applicant-invoice.component.scss']
})
export class ApplicantInvoiceComponent implements OnInit {

  CustomerId: any;
  CustomerMD:any={};
  accountList: any=[];
  TotalDebit: number;
  TotalCredit: number;
  Balance: number;
  accountInfo:any={"Date":"", "Amount":"","Remarks":"","Cheque":""};
  itemForm: FormGroup;
  page:any;
  selectedType:boolean;
  selectedPayment:boolean;
  paymentType:any;
  dateModel:any={};
  public myMath = Math;
  @ViewChild('myModal', {static: false}) public myModal: ModalDirective;
  @ViewChild('myModalExport', {static: false}) public myModalExport: ModalDirective;
  salemanList: any=[];
  invoiceList: any=[];
  applicantMD: any={};
  selectedApplicantId: any;
  currencyList=CurrencyCode;
  AllServiceList=ServiceModel;
  ServiceList:any=[];
  serviceMD:any={};
  constructor(private route: ActivatedRoute,private datePipe: DatePipe,private router: Router,private dataservice: DataService ,private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService) { 
    this.CustomerMD=this.dataservice.getSupplier();
    this.itemForm = this.formBuilder.group({
      PaidAmount: [this.accountInfo.PaidAmount,[ Validators.required]],
      Balance: [this.accountInfo.Balance,[ Validators.required]],
      Amount: [this.accountInfo.Amount,[ Validators.required]],
      AmountTable: [this.accountInfo.AmountTable],
      Service: [this.accountInfo.Service],
      DateTime: [this.accountInfo.DateTime,[ Validators.required]],
      Currency: [this.accountInfo.Currency,[ Validators.required]],
      Remarks: [this.accountInfo.Remarks],
      ApplicantId: [this.accountInfo.ApplicantId]

  });
  this.CustomerMD=this.dataservice.getCustomer();
  
}

  ngOnInit(): void {
    this.selectedPayment=true;
    this.selectedType=true;
    this.paymentType="Cash"
   
    this.route.params.subscribe(params => {
      // Retrieve the 'id' parameter from the URL
      const id = params['id'];
      this.selectedApplicantId=id;
      this.getApplicantInvoices(id);
      this.itemForm.controls.ApplicantId.setValue(id);
      console.log('ID from URL:', id);
    });
  }


  getApplicantInvoices(id) {
  
    this.spinner.show();
    this.invoiceList=[];
    this.myHttpservie.getApplicantInvoicesById(id).subscribe((Data) => {
      this.invoiceList = Data.json() ;
      console.log(this.invoiceList);
     if(this.invoiceList.length>0)
      {
        this.applicantMD=this.invoiceList[0];

      }
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server Response...', error.statusText) });
  }
  
  deleteInvoice(val)
  {

  }

 
  create()
  {
    this.itemForm.reset(); 
    this.accountInfo={};
    this.ServiceList=[];
    
  }
  printInvoice(val)
  {
       
        this.spinner.show()
        var FileSaver = require('file-saver');
        var url=this.myHttpservie.ExportInvoice(val.InvoiceId);
        FileSaver.saveAs(url, "Invoice.pdf");       
        this.spinner.hide();
  }
  Reset()
  {

  }
  editInvoice(val)
  {
     debugger;
    this.accountInfo=val;
    this.accountInfo.DateTime=new Date(val.DateTime);
    this.ServiceList=val.ServiceList;
    this.myModal.show();
    
  }
  savePayment()
  {
  
    if(this.itemForm.valid)
      {
        this.spinner.show();
    this.accountInfo.ApplicantId=this.selectedApplicantId;
    this.accountInfo.ServiceList=this.ServiceList;
    this.myHttpservie.SaveApplicantInvoice(this.accountInfo).subscribe((Data) => {
      this.getApplicantInvoices(this.selectedApplicantId);
    this.myModal.hide();
     this.itemForm.reset();
     this.toastr.success('Record Inserted....!', 'Sucess!');
     this.spinner.hide();
                
    }, error => { this.spinner.hide(), this.toastr.warning('Server Response...', error.statusText) });


          
   
      }
      else{
        this.itemForm.markAllAsTouched();

      }
   

  }

  calculateBalance() {
     
    var amount = parseFloat(this.itemForm.get('Amount').value);
    var paidAmount = parseFloat(this.itemForm.get('PaidAmount').value);
    if (isNaN(paidAmount)) {
      paidAmount = 0;
    }
    if(paidAmount<=amount)
      {
        this.accountInfo.Balance = amount - paidAmount;
      }
      else{
        this.toastr.warning("Paid Amount should greater then paid amount","Alert")
        this.accountInfo.PaidAmount=0;
      }
  
  }

  deleteTransaction(val)
  {
    if(confirm('Are you sure to delete this.'))
    {
      this.spinner.show();
     
      this.myHttpservie.deleteInvoice(val.InvoiceId).subscribe((Data) => {
        let response=Data.json();
        this.toastr.error(response, 'Response!');
        this.getApplicantInvoices(this.selectedApplicantId);
        this.spinner.hide();
      }, error => { this.spinner.hide(), this.toastr.warning('Server Response...', error.statusText) });
    }
    
  }
  formatCurrency(amount: number, currency: string): string {
    return `${amount} ${currency}`;
}
AddToList()
{
   console.log(this.itemForm.value)
  
  if(this.itemForm.controls.AmountTable.value>0 && this.itemForm.controls.Service.value)
    {
        let Object={"Service":this.itemForm.controls.Service.value,"Amount":this.itemForm.controls.AmountTable.value}
        this.ServiceList.push(Object);
        this.itemForm.controls.AmountTable.setValue(0);
        this.itemForm.controls.Service.setValue('');
        this.calculateTotal();
    }
}
  calculateTotal() {
    let TotalAmount=0;
    this.ServiceList.forEach(element => {
      TotalAmount=TotalAmount+element.Amount;
    });
    this.itemForm.controls.Amount.setValue(TotalAmount);
    this.itemForm.controls.Balance.setValue(TotalAmount);
  }
}
