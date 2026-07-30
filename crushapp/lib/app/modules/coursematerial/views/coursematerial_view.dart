import 'package:crushapp/app/models/CourseMaterialMD.dart';
import 'package:flutter/material.dart';

import 'package:get/get.dart';

import '../../../widgets/courseCard.dart';
import '../../../widgets/materialCard.dart';
import '../controllers/coursematerial_controller.dart';

class CoursematerialView extends GetView<CoursematerialController> {
  var courseMaterialController = CoursematerialController();
  var CourseMaterial = Get.arguments;
  @override
  Widget build(BuildContext context) {
     courseMaterialController.getApplicantCourse(CourseMaterial.courseId);
    return Scaffold(
        appBar: AppBar(
          title: Text('Course Material'),
          centerTitle: true,
          backgroundColor: Colors.orange[900],
        ),
      body: Obx(() {
          return ListView.builder(
              itemCount: courseMaterialController.courseMaterialList.length,
              itemBuilder: (context, index) {
                return MaterialCard(
                  model: courseMaterialController.courseMaterialList[index],
                  onPressed: () { 
                    viewMaterial(courseMaterialController.courseMaterialList[index]);

                   },
                
                );
              });
        })
    );
  }

  void viewMaterial(CourseMaterialMD value) {
    if(value.materialType=="PDF")
    {
      Get.toNamed('/pdfreader', arguments: value);
    }
    if(value.materialType=="Video")
    {
      Get.toNamed('/crashVideoPlayer', arguments: value);
    }
    if(value.materialType=="MCQS")
    {
      Get.toNamed('/excercise', arguments: value);
    }
  }
}
