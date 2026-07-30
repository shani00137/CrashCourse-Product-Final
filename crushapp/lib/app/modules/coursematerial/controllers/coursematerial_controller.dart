import 'package:crushapp/app/helper/basecontroller.dart';
import 'package:crushapp/app/models/CourseMaterialMD.dart';
import 'package:crushapp/app/models/courseModel.dart';
import 'package:crushapp/app/models/excerciseModel.dart';
import 'package:crushapp/app/widgets/excerciseCard.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../../data/providers/api_Provider.dart';

class CoursematerialController extends GetxController with BaseController {
  //TODO: Implement CoursematerialController

 var courseMaterialList = <CourseMaterialMD>[].obs;
  @override
  void onInit() {
    super.onInit();
  }

  @override
  void onReady() {
    super.onReady();
  }

  @override
  void onClose() {
    super.onClose();
  }

    getApplicantCourse(courseId) async {
    Future.delayed(Duration(seconds: 1), () {
      try {
        showLoading('Fetching Material');
        final box = GetStorage();
        var token = box.read('token');
        ApiProvide().fetchCourseMaterial(courseId).then((value) {
          courseMaterialList.value = value;
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
}
