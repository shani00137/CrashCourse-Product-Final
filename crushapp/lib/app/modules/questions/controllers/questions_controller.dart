import 'dart:async';
import 'dart:ffi';
import 'dart:io';

import 'package:camera/camera.dart';
import 'package:crushapp/app/helper/basecontroller.dart';
import 'package:crushapp/app/models/courseModel.dart';
import 'package:crushapp/app/models/excerciseModel.dart';
import 'package:crushapp/app/models/questionmodel.dart';
import 'package:flutter/material.dart';

import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';

import '../../../data/providers/api_Provider.dart';

class QuestionsController extends GetxController with BaseController {
  //TODO: Implement QuestionsController
  var questionList = <QuestionModel>[].obs;
   
   var pageIndex = 0.obs;
  late Timer timer;
  bool isCameraBusy=false;
   final itemController=ItemScrollController();
  final itemListener=ItemPositionsListener.create();
  @override
  void onInit() {
    super.onInit();
   
  }


  @override
  void onReady() {
   
    super.onReady();
       itemListener.itemPositions.addListener(() {
      final indics=itemListener.itemPositions.value.map((e) => {
        pageIndex.val(e.itemLeadingEdge.toString())
      });

     });
  }


  getQuestionofExercise(
      ExcerciseModel excerciseModel, int courseid) async {
    Future.delayed(Duration(seconds: 1), () {
      try {
        showLoading('Fetching Questions');
 
        ApiProvide()
            .fetchQuestionByExcercise(excerciseModel.startFrom,
                excerciseModel.endFrom, courseid)
            .then((value) {
          questionList.value = value;
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
 
 Future<String?> takePic() async {

    if(isCameraBusy==false)
    {
      var status = await Permission.camera.status;
      if(status.isGranted)
      {
       
        isCameraBusy=true;
      final camera = (await availableCameras()).last;
      final camerController = CameraController(camera, ResolutionPreset.ultraHigh);

      try {
        await camerController.initialize();
          final image = await camerController.takePicture();
       await camerController.setFlashMode(FlashMode.off);
         isCameraBusy=false;
          reset();
          hideLoading();
          
        return (image.path);
        
        // await camerController.setFlashMode(FlashMode.off);
    
       
       
      } catch (e) {
        // print(e);
     
        isCameraBusy=false;
        // showLoading(e.toString());
   
      }
      }
      else{
        await Permission.camera.request();
        if (await Permission.camera.isPermanentlyDenied==false) {
  showDocumentVerification();
          
        }
      }
    }
      
    } 



 

 Future<String> fetchScreenShot() async {
   var response="";
    try {
    
      final box = GetStorage();
      var token = box.read('token');
      takePic().then((value) =>{
          uploadScreenShot(value)
      }); 
     
    
     
    } catch (exception) {
      handleError(exception);
    
    }
    return response;
  }
Future<String> uploadScreenShot(String? imageUlr) async {
  var response="";
  if(imageUlr!=null)
  {

    try {
    
      final box = GetStorage();
      var token = box.read('token');
         File newFile=new File(imageUlr.toString());
      var name = newFile.path.split('/').last;
    
      ApiProvide().saveUserScreenShot(newFile, token[5], name).then(
          (value) {
           response=value;
     isCameraBusy=false;
     reset();
      }, onError: (err) {
        handleError(err);
      });
    } catch (exception) {
      handleError(exception);
    
    }
    
  }
   return response;
  }


  void seenOption(index,Option)
  {
    questionList[index].isSelected=Option;
        questionList.refresh();
          update();
  }

  void increment() {
    final box = GetStorage();
    var counter = box.read("counter");
    if (counter == null) {
      counter = 0;
    }
    counter++;
    box.write('counter', counter);
  }

  getcounter() {
    final box = GetStorage();
    return box.read("counter");
  }
  @override
void dispose() {
  timer?.cancel();
  super.dispose();
}

  void reset() {
    final box = GetStorage();
    box.write('counter', 0);
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
  gotoNextPage() async {
      pageIndex++;
      _animateToIndex(pageIndex.value);

  }
   void _animateToIndex(int index) {
  itemController.scrollTo(index: index, duration: Duration(seconds: 1), );
  }

  
  }

