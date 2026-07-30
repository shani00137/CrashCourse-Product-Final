class LoginModel {
  String? username;
  bool? isValid;
  String? response;
  int? appUserId;
  String? name;
  String? mobile;
  String? email;
  String? address;
  int? applicantId;

  LoginModel(
      {this.username,
      this.isValid,
      this.response,
      this.appUserId,
      this.name,
      this.mobile,
      this.email,
      this.address,
      this.applicantId});

  LoginModel.fromJson(Map<String, dynamic> json) {
    username = json['Username'];
    isValid = json['IsValid'];
    response = json['Response'];
    appUserId = json['AppUserId'];
    name = json['Name'];
    mobile = json['Mobile'];
    email = json['Email'];
    address = json['Address'];
    applicantId = json['ApplicantId'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['Username'] = this.username;

    data['IsValid'] = this.isValid;
    data['Response'] = this.response;
    data['AppUserId'] = this.appUserId;
    data['Name'] = this.name;
    data['Mobile'] = this.mobile;
    data['Email'] = this.email;
    data['Address'] = this.address;
    data['ApplicantId'] = this.address;
    return data;
  }
}
