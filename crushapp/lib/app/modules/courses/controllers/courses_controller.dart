import 'package:crushapp/app/helper/basecontroller.dart';
import 'package:crushapp/app/models/courseModel.dart';
import 'package:crushapp/app/models/excerciseModel.dart';
import 'package:crushapp/app/widgets/excerciseCard.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../../data/providers/api_Provider.dart';
import '../../../models/CourseMaterialMD.dart';

class CoursesController extends GetxController with BaseController {
  var courseList = <CourseModel>[].obs;
  var excerciseList = <ExcerciseModel>[].obs;
  bool isCammeraBusy=false;

  final count = 0.obs;
  @override
  void onInit() {
    super.onInit();
  }

  @override
  void onReady() {
    super.onReady();
  }

  getApplicantCourse() async {
    Future.delayed(Duration(seconds: 1), () {
      try {
        showLoading('Fetching Courses');
        final box = GetStorage();
        var token = box.read('token');
        ApiProvide().fetchApplicantCourses(token[0]).then((value) {
          courseList.value = value;
          hideLoading();
        }, onError: (err) {
          handleError(err);
        });
      } catch (exception) {
        handleError(exception);
        hideLoading();
      }
    });
  }
   void setDefaultPage(int? page) {
     final box = GetStorage();
    box.write('defaultPage', page);
  }
   int getDefaultPage() {
     final box = GetStorage();
     var defaultPage = box.read('defaultPage');
     if(defaultPage==null)
     {
      defaultPage=1;
     }
    return defaultPage;
  }

  getAllExcercise(CourseMaterialMD courseModel) async {
     var statusCamera = await Permission.camera.status;
     var statusStorage = await Permission.storage.status;
     var statusMic = await Permission.microphone.status;
     
      if(statusCamera.isGranted  && statusMic.isGranted)
      {
           Future.delayed(Duration(seconds: 1), () {
      try {
        showLoading('Fetching Exercise');
        excerciseList.value = [];
        ApiProvide().fetchExercise().then((value) {
          for (var q in value) {
            int questions = int.parse(courseModel.questions.toString());
            int startFrom = int.parse(q.startFrom.toString());
            int endFrom = int.parse(q.endFrom.toString());
            if (questions >= startFrom) {
              excerciseList.add(q);
            }
          }
          excerciseList.refresh();

          hideLoading();
        }, onError: (err) {
          handleError(err);
        });
      } catch (exception) {
        handleError(exception);
        hideLoading();
      }
    });
      }
      else{
            await Permission.camera.request();
        if (await Permission.camera.isPermanentlyDenied==false) {
        showDocumentVerification();
          
        }
      }
 
  }
void showDocumentVerification() {
    Get.dialog(
        barrierDismissible: true,
        Dialog(
          child: Container(
            height: 250,
            child: Padding(
              padding: const EdgeInsets.all(10.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Permissoin Requried',
                      style:
                          TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  Divider(),
                  SizedBox(
                    height: 2,
                  ),
                  Text(
                    'Dear Student we need camera and storage permission. please allow permission.',
                    style: TextStyle(height: 1.5, fontSize: 17),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        MaterialButton(
                            color: Colors.orange,
                            child: Text('Go to settings'),
                            onPressed: () {
                              openAppSettings();
                            }),
                      
                      ],
                    ),
                  )
                ],
              ),
            ),
          ),
        ));
  }

  @override
  void onClose() {
    super.onClose();
  }

  void increment() => count.value++;
}
