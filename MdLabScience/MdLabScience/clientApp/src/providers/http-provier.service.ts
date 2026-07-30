import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpProvierService {
//public serverName="/";
public serverName="http://localhost:51267/";
  constructor(private http: Http,private httpClient: HttpClient) {
    if (environment.production) {
    this.serverName="https://crashcourseonlin.net/"
    }
   } 
   //RoleList//
   getUserRoleList() {
    
    return this.http.get(this.serverName+'api/UserRole/Get');
  }
  //getUserRole by id
  getUserRoleById(id: any) {
    return this.http.get(this.serverName+'api/UserRole/Details/' + id);
  }
  //update UserRole
  updateUserRole(detail: any) {
    return this.http.put(this.serverName+'api/UserRole/Edit', detail);
  }
  //save UserRole
  saveUserRole(detail: any) {
    return this.http.post(this.serverName+'api/UserRole/SaveUserRole', detail);
  }
  getUserPageList() {
    return this.http.get(this.serverName+'api/UserPages/GetList');
  }
    //get Menu list
    getMenuList() {
      return this.http.get(this.serverName+'api/UserPages/MenuList');
    }
     //UserPages list
  saveUserPage(detail: any) {
    return this.http.post(this.serverName+'api/UserPages/Save', detail);
  }
    //update UserPages
    updateUserPage(detail: any) {
      return this.http.put(this.serverName+'api/UserPages/Edit', detail);
    }
    //PermissionList
  getPermissionList() {
    return this.http.get(this.serverName+'api/UserPermission/Get');
  }
  getAllUserPermission(id) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/UserPermission/GetAllUserPermissions/'+id,{headers:headers});
  }
    //get User Controller
    getUserControllers() {
      const headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': sessionStorage.getItem("UserNo")
      });
      return this.http.get(this.serverName+'api/UserPermission/GetUserControllers',{ headers: headers });
    }
 
  getPermissionById(id: any) {
    return this.http.get(this.serverName+'api/UserPermission/Details/' + id);
  }
  //updatePermission
  savePermission(detail: any) {
    return this.http.post(this.serverName+'api/UserPermission/SaveUserPermission', detail);
  }
  //updatePermission
  saveUserController(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/UserPermission/SaveUserController', detail,{ headers: headers });
  }
  //Update User Permission
  updateUserController(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/UserPermission/UpdateUserController', detail,{ headers: headers });
  }
  deleteUserController(id: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/UserPermission/DeleteController/' + id,{ headers: headers });
  }
  deletePermission(id: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/UserPermission/Delete/' + id,{ headers: headers });
  }
  //get Pageslist
  getPagesList() {
    return this.http.get(this.serverName+'api/UserPages/Get');
  }
  createBackup(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/DataBackUp/CreateBackUp', detail,{headers:headers});
  }
  getAllBackUp() {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/DataBackUp/GetAllBackUp' ,{headers:headers});
  }
  //save UserInfo
  saveUserInfo(detail: any) {
    return this.http.post(this.serverName+'api/UserInfo/SaveUsers', detail);
  }
   //userlist
   getUserInfoList() {
    return this.http.get(this.serverName+'api/UserInfo/Get/');
  }
   //update UserInfo
   updateUserInfo(detail: any) {
    return this.http.put(this.serverName+'api/UserInfo/Edit', detail);
  }
  getLoginDetail(detail:any) {
    return this.http.post(this.serverName+'api/login/Details',detail);
  }
  

  
 
  resetUserPassword(id,password) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/login/ResetPassword/'+id+","+password,{headers:headers});
  }
  resetUserPasswordAppUser(id,password) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/login/ResetPasswordAppUser/'+id+","+password,{headers:headers});
  }
  forgetPassword(detail) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/login/RecoveryPassword',detail,{headers:headers});
  }
  changeUserStatus(id,status)
  {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/UserInfo/ChangeStatus/'+id+","+status,{headers:headers});
  }
  changeUserControllerPermissionStatus(details) {
    return this.http.post(this.serverName+'api/UserPermission/SaveUserControllerPermission/',details);
  }
  getAllMenuandPages(id) {
    return this.http.get(this.serverName+'api/UserPermission/GetManuePages/'+id);
  }
  ChanagePassword(Id,Old,newP) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/login/ChangePassword/'+Id+","+Old+","+newP,{headers:headers});
  }
  
  changeProductStatus(itemno) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Product/UpdateProductStatus/'+itemno ,{headers:headers});
  }

  getAllExcercise() {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Course/GetAllExercise',{headers:headers});
  }

  getCourses(detail) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/Course/GetAllCourses',detail ,{headers:headers});
  }
  GetCourseMaterial(detail) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Course/GetCourseMaterial/'+detail ,{headers:headers});
  }
  DeleteCourseMaterial(detail) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Course/DeleteCourseMaterial/'+detail ,{headers:headers});
  }
  getUserTestDetailsById(id) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/TakeTest/GetTestDetails/'+id,{headers:headers});
  }
  getRecentTest() {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/TakeTest/GetAppUserTest',{headers:headers});
  }
  getCountries() {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Course/GetCountryName',{headers:headers});
  }
  getActiveCourses() {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Course/GetActiveCourse',{headers:headers});
  }
  saveCourse(detail: any) {
   
    return this.http.post(this.serverName+'api/Course/SaveCourse', detail);
  }
  saveApplicantTest(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/TakeTest/PrepareTest', detail,{headers:headers});
  }

  updateCourse(detail: any) {
   
    return this.http.post(this.serverName+'api/Course/UpdateCourse', detail);
  }
  SaveCourseMaterial(formData: any) {
    const headers = new HttpHeaders({'Authorization':sessionStorage.getItem("Token")});
    const request = new HttpRequest('POST', this.serverName+"api/Course/SaveCourseMaterial", formData, {
     
      reportProgress: true,
      responseType: 'json'
    });
    return this.httpClient.request(request);
    // return this.http.post(this.serverName+'api/Course/SaveCourseMaterial', detail);
  }
  deleteCourse(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Course/DeleteCourse/'+detail,{headers:headers});
  }
  deleteAppUserTest(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/TakeTest/DeleteTest/'+detail,{headers:headers});
  }
  changeStatusOfCourse(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Course/ChangeStatus/'+ detail,{headers:headers});
  }
  changeStatusofApplicant(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Applicant/ChangeApplicantStatus/'+ detail,{headers:headers});
  }
  changeStatusofUsers(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/AppUser/ChangeStatus/'+ detail,{headers:headers});
  }

  saveStudent(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/Student/SaveStudent', detail,{headers:headers});
  }
  updateStudent(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/Course/UpdateStudent', detail,{headers:headers});
  }
  deleteStudent(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Course/DeleteStudent/'+detail,{headers:headers});
  }

  public exportStudentReport(startdate:any):Observable<any>{
    let options = new RequestOptions({responseType: ResponseContentType.Blob});
    return this.http.post(this.serverName+"api/Reports/ExportStudentReport",startdate  ,options)
        .map((response: Response) => <Blob>response.blob())  ;
  }
  saveApplicant(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/Applicant/SaveApplicants', detail,{headers:headers});
  }
  updateApplicant(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/Applicant/UpdateApplicants', detail,{headers:headers});
  }
  saveRegisterApplicant(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/Applicant/SaveCertificationApplicant', detail,{headers:headers});
  }
  getApplicants() {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Applicant/GetActiveApplicants',{headers:headers});
  }
  deleteRegistration(id) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Applicant/DeleteCertifiedApplicant/'+id,{headers:headers});
  }
  getAllApplicants(detail) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/Applicant/GetAllApplicants',detail,{headers:headers});
  }
  getApplicantsRegistrations(detail) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/Applicant/GetAllCertifiiedApplicant',detail,{headers:headers});
  }
  getActiveApplicants(id) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Applicant/GetActiveApplicantsByCourse/'+id,{headers:headers});
  }
  getAllQuestion(details) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Questions/GetAllQuestions/'+details ,{headers:headers});
  }
  getQuestionByExcercise(start,end,courseId) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Questions/TakeExercise/'+start+','+end+','+courseId ,{headers:headers});
  }
  deleteQuestion(id) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Questions/DeleteQuestion/'+id ,{headers:headers});
  }
  deleteMultQuestions(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/Questions/DeleteMultipleQuestions', detail,{headers:headers});
  }
  updateQuestion(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.put(this.serverName+'api/Questions/EditQuestion', detail,{headers:headers});
  }
  SaveQuestion(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/Questions/SaveQuestions', detail,{headers:headers});
  }
 
  public exportQuestionInExcel(startdate:any):Observable<any>{
    let options = new RequestOptions({responseType: ResponseContentType.Blob});
    return this.http.get(this.serverName+"api/Questions/ExportQuestion/"+startdate  ,options)
        .map((response: Response) => <Blob>response.blob())  ;
  }
  importQuestions(details)
  {
    return this.http.post(this.serverName+'api/Questions/ImportQuestion',details );
  }
  filterQuestions(catagoryId,subCatagoryId) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Questions/FilterQuestions/'+catagoryId+","+subCatagoryId ,{headers:headers});
  }
  saveAppUser(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/AppUser/SaveAppUser', detail,{headers:headers});
  }
  UpdateAppUser(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/AppUser/UpdateAppUser', detail,{headers:headers});
  }
  getAllAppUsers(detail) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/AppUser/GetAllUsers',detail ,{headers:headers});
  }
  GetUserScreenShots(detail) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/AppUser/GetUserScreenShots',detail ,{headers:headers});
  }
  deleteCAppUsers(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/AppUser/DeleteUser/'+detail,{headers:headers});
  }
  resetDeviceId(detail: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/AppUser/ResetDeviceId/'+detail,{headers:headers});
  }
  saveApplicantServices(detail: any) {
    const headers = new Headers({
    
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/Applicant/UpdateApplicantsServices', detail,{headers:headers});
  }
  getAplicantServicebyId(id) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Applicant/GetApplicantServiceById/'+id ,{headers:headers});
  }
  getNextQuestion(id) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Questions/GetNextQuestion/'+id,{headers:headers});
  }
  getLastQuestion(id) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Questions/GetLastQuestion/'+id,{headers:headers});
  }
  deleteInvoice(id) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Applicant/DeleteInvoiceNo/'+id ,{headers:headers});
  }
  getQuestionById(id) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Questions/GetQuestionById/'+id,{headers:headers});
  }
  public ExportCertificate(startdate:any):Observable<any>{
    let options = new RequestOptions({responseType: ResponseContentType.Blob});
    return this.http.post(this.serverName+"api/Certificate/ExportCertificate",startdate  ,options)
        .map((response: Response) => <Blob>response.blob())  ;
  }
  getApplicantInvoicesById(id) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Applicant/GetApplicantInvoice/'+id,{headers:headers});
  }
  public ExportInvoice(id:any){
    return this.serverName+"api/Certificate/ExportInvoice/"+id;
  }

  SaveApplicantInvoice(detail: any) {
    const headers = new Headers({
    
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.post(this.serverName+'api/Applicant/SaveApplicantInvoice', detail,{headers:headers});
  }
  getApplicationAccount(id) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': sessionStorage.getItem("UserNo")
    });
    return this.http.get(this.serverName+'api/Applicant/GetApplicantTransaction/'+id,{headers:headers});
  }
}

