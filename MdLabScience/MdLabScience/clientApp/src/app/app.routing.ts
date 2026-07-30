import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { DefaultLayoutComponent } from './containers';

import { DashboardComponent } from './views/dashboard/dashboard.component';


import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginComponent } from './views/login/login.component';

import { UserControllerPermissionComponent } from './views/user-controller-permission/user-controller-permission.component';
import { UserInfoComponent } from './views/user-info/user-info.component';
import { UserPagesComponent } from './views/user-pages/user-pages.component';
import { UserPermissionsComponent } from './views/user-permissions/user-permissions.component';
import { UsercontrollersComponent } from './views/usercontrollers/usercontrollers.component';
import { UserrolesComponent } from './views/userroles/userroles.component';
import { ChangePasswordComponent } from './views/change-password/change-password.component';
import {BackUpdatabaseComponent} from './views/back-updatabase/back-updatabase.component';
import { ApplicantsComponent } from './views/manageapplicants/applicants/applicants.component';
import { CoursesComponent } from './views/courses/courses.component';
import {ViewQuestionsComponent} from './views/managequestions/view-questions/view-questions.component';
import { ApplicantsservicesComponent } from './views/manageapplicants/applicantsservices/applicantsservices.component';

import { CreateTestComponent } from './views/managequestions/create-test/create-test.component';
import { TestdetailsComponent } from './views/managequestions/testdetails/testdetails.component';
import { PrivacypolicyComponent } from './views/privacypolicy/privacypolicy.component';
import { AddupdatequestionComponent } from './views/managequestions/addupdatequestion/addupdatequestion.component';
import { AllapplicantsComponent } from './views/manageapplicants/applicants/allapplicants/allapplicants.component';
import { AuthGuard } from '../providers/AuthGuard';
import { MobileusersComponent } from './views/appusers/mobileusers/mobileusers.component';
import { UserscreenshotsComponent } from './views/userscreenshots/userscreenshots.component';
import { CertificatesComponent } from './views/certificates/certificates/certificates.component';
import { ApplicantInvoiceComponent } from './views/manageapplicants/applicant-invoice/applicant-invoice.component';
import { ViewCustomerAccountComponent } from './views/manageapplicants/view-customer-account/view-customer-account.component';
import { StudentregistrationComponent } from './views/manageapplicants/studentregistration/studentregistration.component';
export const routes: Routes = [
 
  {
    path: '404',
    component: P404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    component: P500Component,
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'privacypolicy',
    component: PrivacypolicyComponent,
    data: {
      title: 'privacypolicy'
    }
  },

 
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home'
    },
    children: [
      {
        path: '',
        component: DashboardComponent,canActivate:[AuthGuard],
        data: {
          title: 'Page 404'
        }
      },
      {
        path: 'base',
        loadChildren: () => import("./views/base/base.module").then(m => m.BaseModule)
      },
      {
        path: 'buttons',
        loadChildren: () => import('./views/buttons/buttons.module').then(m => m.ButtonsModule)
      },     
      
      {
        path: 'theme',
        loadChildren: () => import('./views/theme/theme.module').then(m => m.ThemeModule)
      },
      {
        path: 'widgets',
        loadChildren: () => import('./views/widgets/widgets.module').then(m => m.WidgetsModule)
      },
      {
        path: 'userroles', component: UserrolesComponent,canActivate:[AuthGuard]
      },
      {
        path: 'userpages', component: UserPagesComponent
      },
      {
        path: 'user-permissions', component: UserPermissionsComponent,canActivate:[AuthGuard]
      },
      {
        path: 'user-info', component: UserInfoComponent,canActivate:[AuthGuard]
      },
      
      {
        path:'usercontrollers',component:UsercontrollersComponent,canActivate:[AuthGuard]
      },
      {
        path:'user-controller-permission',component:UserControllerPermissionComponent,canActivate:[AuthGuard]
      },
    
      {
        path:'dashboard',component:DashboardComponent,canActivate:[AuthGuard]
      },
      {
        path:'change-password',component:ChangePasswordComponent,canActivate:[AuthGuard]
      }
      
      ,{
        path:'back-updatabase', component:BackUpdatabaseComponent,canActivate:[AuthGuard]
      }
      ,{
        path:'courses', component:CoursesComponent,
        canActivate:[AuthGuard]
      }
      ,{
        path:'applicants', component:ApplicantsComponent,
        canActivate:[AuthGuard]
      }
      ,{
        path:'applicantsservices', component:ApplicantsservicesComponent,
        canActivate:[AuthGuard]
      }
      ,{
        path:'view-questions', component:ViewQuestionsComponent
       
      }
   
      ,{
        path:'create-test', component:CreateTestComponent
        ,canActivate:[AuthGuard]
      }
      ,{
        path:'testdetails', component:TestdetailsComponent
        ,canActivate:[AuthGuard]
      },{
        path:'addupdatequestion', component:AddupdatequestionComponent
        ,canActivate:[AuthGuard]
      }
      ,{
        path:'allapplicants', component:AllapplicantsComponent
        ,canActivate:[AuthGuard]
      }
      ,{
        path:'mobileusers', component:MobileusersComponent
        ,canActivate:[AuthGuard]
      }
      ,{
        path:'userscreenshots', component:UserscreenshotsComponent
        ,canActivate:[AuthGuard]
      }
      ,{
        path:'certificates', component:CertificatesComponent
        ,canActivate:[AuthGuard]
      }
      ,{
        path:'applicant-invoice/:id', component:ApplicantInvoiceComponent
        ,canActivate:[AuthGuard]
      }
      ,{
        path:'view-customer-account/:id', component:ViewCustomerAccountComponent
        ,canActivate:[AuthGuard]
      }
      
      ,{
        path:'studentregistration', component:StudentregistrationComponent
        ,canActivate:[AuthGuard]
      }
      
      
      
      
    ]
  },
  { path: '**', component: P404Component }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
