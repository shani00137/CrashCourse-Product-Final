import 'package:crushapp/app/models/excerciseModel.dart';
import 'package:flutter/material.dart';

import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';

import '../../../widgets/excerciseCard.dart';

import '../controllers/courses_controller.dart';

class ExerciseView extends GetView<CoursesController> {
  var courseController = CoursesController();
  var courseModel = Get.arguments;
  @override
  Widget build(BuildContext context) {
    courseController.getAllExcercise(courseModel);
    return Scaffold(
        appBar: AppBar(
          title: Text('Exercise'),
          centerTitle: true,
          backgroundColor: Colors.orange[900],
        ),
        body: Obx(() {
          return ListView.builder(
              itemCount: courseController.excerciseList.length,
              itemBuilder: (context, index) {
                return ExerciseCard(
                  model: courseController.excerciseList[index],
                  onPressed: () {
                    _gotoQuestions(courseController.excerciseList[index]);
                  },
                );
              });
        }));
  }

  void _gotoQuestions(ExcerciseModel excerciseList) {
    final box = GetStorage();
    box.write('counter', 0);
    Get.toNamed('/questions', arguments: [excerciseList, courseModel]);
  }
}
