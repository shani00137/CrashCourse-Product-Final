

import { FormBuilder } from '@angular/forms';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { HttpProvierService } from '../../../providers/http-provier.service';
import { formatDate } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap/modal';
import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  mainFigureList: any[];
  TotalPaid: any;
  TotalSale: any;
  Pending: any;
  TotalExpense: any;
  saleChartList: any[];
  lables: any=[];
  infoList:any=[];
  saleChartfig: any=[];
  lableslist: any=[];
  dateModel:any={}
  page:any;
  public barChartOptions: ChartOptions = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
  public lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // red
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartType = 'line';
  public barChartLabels: Label[]=['a'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public expenseChartLabels: Label[]=['a'];
  public expenseChartData: ChartDataSets[]=[{data:[0], label: 'Series A'}];
  public barChartData: ChartDataSets[]=[{data:[0], label: 'Series A'}];
  public pieChartLegend = true;
  
public SupplierpieChartLabels: Label[] = [ 'Invoice', 'Pending','Partial','Paid'];
public SupplierpieChartData: number[] = [0, 0,0,0];
public pieChartType: ChartType = 'pie';
public pieChartOptions: ChartOptions = {
  responsive: true,
  legend: {
    position: 'top',
  },

};
public pieChartColors = [
  {
    backgroundColor: ['rgba(255,0,0,0.3)', 'rgba(0,255,0,0.3)','rgb(6, 196, 206)','rgb(31, 99, 8)','rgba(0,0,255,0.3)'],
  },
];
public SupplierpieChartColors = [
  {
    backgroundColor: ['rgba(2, 200, 250)', 'rgba(217, 11, 11)','rgb(245, 151, 0)','rgb(0, 120, 28)'],
  },
];
  lableslistExpense: any=[];
  saleChartfigExpense: any=[];
  saleChartListExpense: any=[];
  InvoiceCount: any[];
  isUserStatus: boolean;
  Collection: any;
  Percentage: any;
  CommissionAmount: any;
  CurrentBalance: any;
  Remarks: any;
  CommsionAmountTake: any;
  DepositListCount: any=[];
  TotalOrders: any;
  TodayOrders: any;
  TodayOrder: any;
  Purchase: any;
  Pendings: any;
  TotalCustomer: any;
  TotayPurchase: any;
  TodayRecovery: any;
  TodayOrderCount: any;
  listData: any[];
  TotalRecovery: any;
  TodayRecoverySummary: any;
  TodayOrderCountSummary: any;
  TodayTotalAmountSummary: any;

 
public origin: any;
public destination: any;

@ViewChild('myModal', {static: false}) public myModal: ModalDirective;
  salemanName: any;
  locationList: any[];
  constructor(private http: Http,private formBuilder: FormBuilder, private toastr: ToastrService,private myHttpservie:HttpProvierService, private spinner: NgxSpinnerService) 
  {
    //this.sendNotification();
  }
  sendNotification()
  {
  

    let url = 'https://fcm.googleapis.com/fcm/send';
  let body = 
   {
     "notification": {
         "title": 'test',
         "body": 'check',
         "sound": "default",
         "click_action": "FLUTTER_NOTIFICATION_CLICK",
         "icon": "fcm_push_icon"
     },
     "data": {
         "Waqas hi": "This is a Firebase Cloud Messagin  hbhj g Device Gr new v Message!",
     },

     "to": 'ekBXO3IQQE-y4hCvSMRUch:APA91bF4Bj8-e9Qe_goQ337LLN6Zeh0upVPLJHw_KEFKhULgSPcK41jDMvPH6PdHj6sJ3t6e-uRvXpfS-hrqnfBqpMEKLflZwbgEemqCU-aJfj0xj5JnASOdHJWEUd0f2E8NsMsjazET'

   };
   let headers: Headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': 'key=AAAAQUgTkL4:APA91bFU5I1TlRANin_x9-OJ_KwSYjflenX92asVJnlUFiH7Q49g006Azzs49-5CVxOUzfhfb84Ac_RnpKSUKRfNUibJ-Hh5k7W7vp9H7cyDRwzRRpaOHq2B8FqxkobpyK1uui2UsLq9'
  });
  let options = new RequestOptions({ headers: headers });
  
   this.http.post(url, body, options).map(response => {
     return response;
   }).subscribe(data => {
      //post doesn't fire if it doesn't get subscribed to
      console.log(data);
   });
 

}
  ngOnInit(): void {
   // this.toastr.info("Payment Still pending.. Please pay our software payment..thanks","Alert")
     //this.geocoderService.suggest('Neude', {fq: 'bron:BAG'}).then(result => {  console.log(result) });

    //  if (navigator.geolocation) {
    //   navigator.geolocation.watchPosition(position => {
    //     this.lat = position.coords.latitude;
    //     this.lng = position.coords.longitude;
    //     this.zoom = 16;
    //     console.log("position", position)
    //   });
    // }else{
    //   console.log("User not allowed")
    // }
    //this.getDirection();


  }

  getDirection() {
    this.origin = { lat: 24.799448, lng: 120.979021 };
    this.destination = { lat: 24.799524, lng: 120.975017 };
  
    // Location within a string
    this.origin = 'Taipei Main Station';
    this.destination = 'Taiwan Presidential Office';

  }

 
 
}
