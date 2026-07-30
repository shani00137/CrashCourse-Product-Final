class CourseModel {
  int? courseId;
  int? courseCode;
  String? courseName;
  int? questions;
  String? courseUrl;

  CourseModel(
      {this.courseId,
      this.courseCode,
      this.courseName,
      this.questions,
      this.courseUrl});

  CourseModel.fromJson(Map<String, dynamic> json) {
    courseId = json['CourseId'];
    courseCode = json['CourseCode'];
    courseName = json['CourseName'];
    questions = json['Questions'];
    courseUrl = json['CourseUrl'];
  }
}
