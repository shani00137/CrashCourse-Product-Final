import 'dart:io';

import 'package:crushapp/app/models/applicantModel.dart';
import 'package:crushapp/app/modules/chat/controllers/chat_controller.dart';
import 'package:file_support/file_support.dart';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:image/image.dart' as img;

import '../../../widgets/menuBox.dart';
import '../../../widgets/welcomeCard.dart';
import '../controllers/home_controller.dart';

import 'dart:io' as io;

class HomeView extends GetView<HomeController> {
  final homeController = HomeController();
  final chatController = ChatController();
  @override
  Widget build(BuildContext context) {
    homeController.getUserInfo();
    homeController.getPendingExams();
    homeController.checkUserExpiry();
    homeController.checkUserDocumentVerfication();
    homeController.initFirbaseNotification();

    bool _canProcess = false;
    bool _isBusy = false;
    CustomPaint? _customPaint;
    String? _text;
    return Scaffold(
        backgroundColor: Colors.grey[200],
        appBar: AppBar(
          title: const Text('Crash Couse'),
          centerTitle: true,
          backgroundColor: Colors.orange[900],
        ),
        body: Obx(
          () => ListView(
            children: [
              WelComeCard(
                name: homeController.userinfo[1],
                email: homeController.userinfo[2],
                mobile: homeController.userinfo[4],
                onPressed: () {
                  goToDocumentsVersifications();
                },
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: MenuBox(
                  tille: 'Course',
                  isNotified: false,
                  onPress: () {
                    _gotoCourse();
                  },
                  icon: "assets/reading.json",
                  count: 0,
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  MenuBox(
                    tille: 'Result',
                    isNotified: false,
                    onPress: () {
                      gotoResult();
                    },
                    icon: "assets/result.json",
                    count: 0,
                  ),
                  SizedBox(
                    width: 10,
                  ),
                  MenuBox(
                    tille: 'Take Test',
                    onPress: () {
                      _gotoTest();
                    },
                    isNotified: true,
                    icon: "assets/quiz.json",
                    count: homeController.notificationCount.value,
                  ),
                ],
              ),
              SizedBox(
                height: 10,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  MenuBox(
                    tille: 'Setting',
                    onPress: () {
                      _gotoSetting();
                    },
                    isNotified: false,
                    icon: "assets/setting.json",
                    count: 0,
                  ),
                  SizedBox(
                    width: 10,
                  ),
                  MenuBox(
                    isNotified: false,
                    tille: 'Chat',
                    onPress: () {
                      _gotoChat();
                    },
                    icon: "assets/chat.json",
                    count: 0,
                  ),
                ],
              )
            ],
          ),
        ));
  }

  void _gotoTest() {
    Get.toNamed('/managetest');
  }

  void gotoResult() {
    Get.toNamed('/result');
  }

  void _gotoSetting() {
    Get.toNamed('/security');
  }

  void _gotoCourse() {
    Get.toNamed('/courses');
  }

  void _gotoChat() {
    final box = GetStorage();
    var currentId = box.read('token');
    if (currentId[0] == "1") {
      Get.toNamed('/chatapplicant');
    } else {
      int id = int.parse(currentId[0]);
      chatController.setAppUser(id);
      chatController.seenMessage();
      ApplicantModel model = new ApplicantModel();
      model.firstName = "Administrator";
      model.lastName = "";

      model.appUserid = int.parse(currentId[0]);
      Get.toNamed('/chat', arguments: model);
    }
  }

  goToDocumentsVersifications() {
    Get.toNamed('/documentverification');
  }
}
