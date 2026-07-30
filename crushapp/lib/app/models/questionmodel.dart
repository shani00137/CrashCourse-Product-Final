class QuestionModel {
  int questionId;
  String questionContent;
  String rightOption;
  String option1;
  String option2;
  String option3;
  String option4;
  int isSelected;
  bool isViewAnswer;
  bool isSeen;
  String answer;
  String testId;
  DateTime? testStartTime;
  int duration;

  QuestionModel(
      {required this.questionId,
      required this.questionContent,
      required this.rightOption,
      required this.option1,
      required this.option2,
      required this.option3,
      required this.option4,
      required this.isSelected,
      required this.isViewAnswer,
      required this.answer,
      required this.isSeen,
      required this.testId,
      required this.testStartTime,
      required this.duration});

  factory QuestionModel.fromJson(Map<String, dynamic> json) {
    return new QuestionModel(
      testId: json["TestId"] ?? " ",
      questionId: json["QuestionId"] ?? " ",
      questionContent: json["QuestionContent"] ?? " ",
      rightOption: json["RightOption"] ?? " ",
      option1: json["Option1"] ?? " ",
      option2: json["Option2"] ?? " ",
      option3: json["Option3"] ?? " ",
      answer: json["Answer"] ?? " ",
      option4: json["Option4"] ?? " ",
      testStartTime: json["TestStartTime"] != null
          ? DateTime.parse(json["TestStartTime"])
          : DateTime.now(),
      duration: json["Duration"] != null ? json["Duration"] : 0,
      isSelected:
          json["isSelected"] != null ? int.parse(json["isSelected"]) : 0,
      isViewAnswer: false,
      isSeen: false,
    );
  }
}
