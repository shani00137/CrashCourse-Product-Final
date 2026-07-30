import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { HttpProvierService } from '../../../../providers/http-provier.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../../providers/data.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-view-customer-account',
  templateUrl: './view-customer-account.component.html',
  styleUrls: ['./view-customer-account.component.css']
})
export class ViewCustomerAccountComponent implements OnInit {

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
  transactionList: any=[];
  
  constructor(private route: ActivatedRoute,private datePipe: DatePipe,private router: Router,private dataservice: DataService ,private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService) { 

  
}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      // Retrieve the 'id' parameter from the URL
      const id = params['id'];
      this.getTransactionType(id);
  
      console.log('ID from URL:', id);
    });
  }
  getTransactionType(id) {
    this.spinner.show();
    this.transactionList=[];
    this.myHttpservie.getApplicationAccount(id).subscribe((Data) => {
      console.log(data);
      var data = Data.json() ;
      if(data.length>0)
        {
          this.TotalDebit=data[0].TotalDebit;
          this.TotalCredit=data[0].TotalCredit
          this.Balance=this.TotalDebit-this.TotalCredit
        }
      this.transactionList=data;
      this.spinner.hide();
    }, error => { this.spinner.hide(), this.toastr.warning('Server Response...', error.statusText) });
  }

  formatCurrency(amount: number, currency: string): string {
    return `${amount} ${currency}`;
}

}
