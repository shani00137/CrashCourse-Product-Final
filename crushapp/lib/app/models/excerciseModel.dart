class ExcerciseModel {
  int? exerciseRecordId;
  String? exercise;
  int? startFrom;
  int? endFrom;

  ExcerciseModel(
      {this.exerciseRecordId, this.exercise, this.startFrom, this.endFrom});

  ExcerciseModel.fromJson(Map<String, dynamic> json) {
    exerciseRecordId = json['ExerciseRecordId'];
    exercise = json['Exercise'];
    startFrom = json['StartFrom'];
    endFrom = json['EndFrom'];
  }
}
