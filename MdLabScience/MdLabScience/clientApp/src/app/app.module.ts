import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy, DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from "ngx-spinner";

import {SpinnerLayoutComponent} from '../app/spinner-layout/spinner-layout.component'
import { ModalModule } from 'ngx-bootstrap/modal';
// NOT RECOMMENDED (Angular 9 doesn't support this kind of import)
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import {FilterPipe} from '../app/filter.pipe'
import { ToastrModule } from 'ngx-toastr';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { IconModule, IconSetModule, IconSetService } from '@coreui/icons-angular';
import { NgWizardModule, NgWizardConfig, THEME } from 'ng-wizard';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import { AppComponent } from './app.component';

// Import containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginComponent } from './views/login/login.component';




const APP_CONTAINERS = [
  DefaultLayoutComponent
];

import {
  AppAsideModule,
  AppBreadcrumbModule,
  AppHeaderModule,
  AppFooterModule,
  AppSidebarModule,
} from '@coreui/angular';

// Import routing module
import { AppRoutingModule } from './app.routing';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
// Import 3rd party components
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpProvierService } from '../providers/http-provier.service';
import { DataService } from '../providers/data.service';
import { Http, HttpModule } from '@angular/http';
import { UtilityService } from '../providers/utility.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { UserInfoComponent } from './views/user-info/user-info.component';
import { UserPermissionsComponent } from './views/user-permissions/user-permissions.component';
import { UserPagesComponent } from './views/user-pages/user-pages.component';
import { UserrolesComponent } from './views/userroles/userroles.component';
import { UsercontrollersComponent } from './views/usercontrollers/usercontrollers.component';
import { UserControllerPermissionComponent } from './views/user-controller-permission/user-controller-permission.component';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';


import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { RoundPipe } from '../providers/roundPipe';
import {BackUpdatabaseComponent} from './views/back-updatabase/back-updatabase.component';
import { CoursesComponent } from './views/courses/courses.component';
import { ApplicantsComponent } from './views/manageapplicants/applicants/applicants.component';
import {ViewQuestionsComponent} from './views/managequestions/view-questions/view-questions.component';
import { ApplicantsservicesComponent } from './views/manageapplicants/applicantsservices/applicantsservices.component';
import { ProgressbarModule,ProgressbarConfig } from 'ngx-bootstrap/progressbar';
import { CreateTestComponent } from './views/managequestions/create-test/create-test.component';
import { TestdetailsComponent } from './views/managequestions/testdetails/testdetails.component';
import { PrivacypolicyComponent } from './views/privacypolicy/privacypolicy.component';
import { AddupdatequestionComponent } from './views/managequestions/addupdatequestion/addupdatequestion.component';
import { AllapplicantsComponent } from './views/manageapplicants/applicants/allapplicants/allapplicants.component';
import { AuthGuard } from '../providers/AuthGuard';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { MobileusersComponent } from './views/appusers/mobileusers/mobileusers.component';
import { HttpClientModule } from '@angular/common/http';
import { UserscreenshotsComponent } from './views/userscreenshots/userscreenshots.component';
import { CertificatesComponent } from './views/certificates/certificates/certificates.component';
import { ApplicantInvoiceComponent } from './views/manageapplicants/applicant-invoice/applicant-invoice.component';
import { ViewCustomerAccountComponent } from './views/manageapplicants/view-customer-account/view-customer-account.component';
import { StudentregistrationComponent } from './views/manageapplicants/studentregistration/studentregistration.component';
const ngWizardConfig: NgWizardConfig = {
  theme: THEME.default
};

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    
    AppAsideModule,
    AppBreadcrumbModule.forRoot(),
    AppFooterModule,
    AppHeaderModule,
    AppSidebarModule,
    ProgressbarModule,
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    KeyboardShortcutsModule.forRoot()  ,
    AutocompleteLibModule,
  
    ChartsModule,
    BsDatepickerModule.forRoot(),
    IconModule,
    ModalModule.forRoot(),
    IconSetModule.forRoot(),
    NgWizardModule.forRoot(ngWizardConfig),
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot(),
    HttpClientModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    HttpModule,
    AngularEditorModule,
    FormsModule,
    ScrollingModule,
    NgxPaginationModule     ,
    NgSelectModule,
    InfiniteScrollModule ,
   
  ],
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    P404Component,
    P500Component,
    LoginComponent,
    ViewQuestionsComponent,
    SpinnerLayoutComponent,
    FilterPipe,
    RoundPipe,    
    DashboardComponent,
    UsercontrollersComponent,
    UserControllerPermissionComponent,
    BackUpdatabaseComponent,   
    UserInfoComponent,
    UserPermissionsComponent,
    UserPagesComponent,
    UserrolesComponent,
    CoursesComponent,
    ApplicantsComponent,
    ApplicantsservicesComponent,
    ViewCustomerAccountComponent,
    CreateTestComponent,
    TestdetailsComponent,
    PrivacypolicyComponent,
    AddupdatequestionComponent,
    AllapplicantsComponent,
    MobileusersComponent,
    UserscreenshotsComponent,
    CertificatesComponent,
    ApplicantInvoiceComponent,
    StudentregistrationComponent,
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },HttpProvierService,DataService,ProgressbarConfig,DatePipe,UtilityService,HttpClientModule,AuthGuard,
    ,IconSetService,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
