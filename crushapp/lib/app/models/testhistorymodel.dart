class TestHistoryModel {
  int? createdBy;
  String? courseName;
  bool? isCompleted;
  String? testDate;
  int? testId;
  int? questions;
  String? remarks;
  int? rightQuestions;
  String? testStartTime;
  int? duration;

  TestHistoryModel(
      {this.createdBy,
      this.courseName,
      this.isCompleted,
      this.testDate,
      this.testId,
      this.questions,
      this.remarks,
      this.rightQuestions,
      this.testStartTime,
      this.duration});

  TestHistoryModel.fromJson(Map<String, dynamic> json) {
    createdBy = json['CreatedBy'];
    courseName = json['CourseName'];
    isCompleted = json['IsCompleted'];
    testDate = json['TestDate'];
    testId = json['TestId'];
    questions = json['Questions'];
    remarks = json['Remarks'];
    rightQuestions = json['RightQuestions'];
    testStartTime = json['TestStartTime'];
    duration = json['Duration'];
  }
}
