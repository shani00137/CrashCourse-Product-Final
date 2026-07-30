class ApplicantModel {
  int? appUserid;
  String? firstName;
  String? lastName;
  String? course;
  int? message;

  ApplicantModel(
      {this.appUserid,
      this.firstName,
      this.course,
      this.lastName,
      this.message});

  ApplicantModel.fromJson(Map<String, dynamic> json) {
    appUserid = json['AppUserId'];
    firstName = json['FirstName'];
    lastName = json['LastName'];
    course = json['Course'];
    message = json['Messages'];
  }
}
