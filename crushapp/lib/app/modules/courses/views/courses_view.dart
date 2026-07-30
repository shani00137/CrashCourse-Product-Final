import 'package:crushapp/app/models/courseModel.dart';
import 'package:flutter/material.dart';

import 'package:get/get.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../../utilites/toasMessage.dart';
import '../../../widgets/courseCard.dart';
import '../../../widgets/testcard.dart';
import '../controllers/courses_controller.dart';

class CoursesView extends GetView<CoursesController> {
  var courseController = CoursesController();
  @override
  Widget build(BuildContext context) {
    courseController.getApplicantCourse();
    return Scaffold(
        appBar: AppBar(
          title: Text('Courses'),
          centerTitle: true,
          backgroundColor: Colors.orange[900],
        ),
        body: Obx(() {
          return ListView.builder(
              itemCount: courseController.courseList.length,
              itemBuilder: (context, index) {
                return CourseCard(
                  model: courseController.courseList[index],
                  onPressed: () {
                    _gotoExercise(courseController.courseList[index]);
                  },
                  onViewPDF: () {
                    _gotoPDFView(courseController.courseList[index]);
                  },
                );
              });
        }));
  }

  void _gotoExercise(CourseModel courseList) {
    Get.toNamed('/coursematerial', arguments: courseList);
  }

  Future<void> _gotoPDFView(CourseModel courseList) async {
      var statusCamera = await Permission.camera.status;
   
     var statusMic = await Permission.microphone.status;
     
    if(statusCamera.isGranted  && statusMic.isGranted)
    {
    if (courseList.courseUrl != null) {

      Get.toNamed('/pdfreader', arguments: courseList);
    } else {
      ToastMessage.displayToast('PDF of Course not available.');
    }
  }else{
      courseController.showDocumentVerification();
  }
  }
}
