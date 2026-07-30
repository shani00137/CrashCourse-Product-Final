import 'package:crushapp/app/helper/basecontroller.dart';
import 'package:crushapp/app/modules/home/controllers/home_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../../data/providers/api_Provider.dart';
import '../../../models/questionmodel.dart';
import '../../../utilites/toasMessage.dart';
import '../../../widgets/myButton.dart';

class TaketestController extends GetxController with BaseController {
  RxList<QuestionModel> quizList = <QuestionModel>[].obs;
  var homeController = HomeController();
  final count = 0.obs;
  final currentSliderValue = 1.obs;

  DateTime startDate = DateTime.now();
  DateTime enddate = DateTime.now();
  @override
  void onInit() {
    super.onInit();
  }

  @override
  void onReady() {
    super.onReady();
  }

  startTest(id) {
    Future.delayed(Duration(milliseconds: 500), () {
      try {
        showLoading('Preparing Test...');
        ApiProvide().fetchUserTakenTestDetails(id).then((value) {
          quizList.value = value;
          quizList.refresh();
          update();
          //var end = start.add(Duration(minutes: 100));
          startDate = DateTime.parse(quizList[0].testStartTime.toString());

          Duration diff = enddate.difference(startDate);
          int mint = quizList[0].duration - diff.inMinutes;
          count.value =
              DateTime.now().millisecondsSinceEpoch + 1000 * mint * 60;
          count.refresh();
          if (mint < 0) {
            saveTest(id);
            Get.back();
            Get.offAndToNamed('/home');
          }
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

  saveTest(id) {
    Future.delayed(Duration(milliseconds: 500), () {
      try {
        showLoading('Please Wait ...');
        ApiProvide().saveUserTest(id).then((value) {
          hideLoading();
          ToastMessage.displayToast("Submit Sucessfuly..");
          homeController.getPendingExams();
        }, onError: (err) {
          handleError(err);
        });
      } catch (exception) {
        handleError(exception);
        hideLoading();
      }
    });
  }

  selectedOptions(index, option, quizNo, testId) {
    quizList[index].isSelected = option;
    quizList[index].answer = option.toString();
    String anawer = "";
    if (option == 1) {
      anawer = quizList[index].option1;
    }
    if (option == 2) {
      anawer = quizList[index].option2;
    }
    if (option == 3) {
      anawer = quizList[index].option3;
    }
    if (option == 4) {
      anawer = quizList[index].option4;
    }
    quizList.refresh();
    // PlaySound.playNow();
    try {
      Map jsonBody = {
        "QuestionId": "$quizNo",
        "TestId": "$testId",
        "isSelected": "$option",
        "Answer": "$anawer"
      };
      ApiProvide().saveUserAnswer(jsonBody).then((value) {}, onError: (err) {
        handleError(err);
      });
    } catch (exception) {
      handleError(exception);
      hideLoading();
    }
  }
}
