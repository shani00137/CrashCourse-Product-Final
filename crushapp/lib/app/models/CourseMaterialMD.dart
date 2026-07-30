class CourseMaterialMD {
  int? courseMaterialId;
  int? courseId;
  String? courseUrl;
  String? materialType;
  String? fileName;
  String? courseName;
  int ? questions;

  CourseMaterialMD(
      {this.courseMaterialId,
      this.courseId,
      this.courseUrl,
      this.materialType,
      this.fileName});

  CourseMaterialMD.fromJson(Map<String, dynamic> json) {
    courseMaterialId = json['CourseMaterialId'];
    courseId = json['CourseId'];
    courseUrl = json['CourseUrl'];
    materialType = json['MaterialType'];
    fileName = json['FileName'];
    courseName=json['courseName'];
    questions=json['Questions'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['CourseMaterialId'] = this.courseMaterialId;
    data['CourseId'] = this.courseId;
    data['CourseUrl'] = this.courseUrl;
    data['MaterialType'] = this.materialType;
    data['FileName'] = this.fileName;
    data['CourseName'] = this.courseName;
     data['Questions'] = this.questions;
    return data;
  }
}