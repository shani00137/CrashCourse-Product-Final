import 'dart:async';

import 'package:crushapp/app/helper/basecontroller.dart';
import 'package:crushapp/app/models/chatModel.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';

import '../../../data/providers/api_Provider.dart';
import '../../../models/applicantModel.dart';

class ChatController extends GetxController with BaseController {
  //TODO: Implement ChatController
  RxList<ChatModel> chatList = <ChatModel>[].obs;
  RxList<ApplicantModel> applicantList = <ApplicantModel>[].obs;
  final offset = 0.0.obs;
  final RxInt activeAppUser = 0.obs;
  late Timer timer;

  ScrollController scrollController = ScrollController(
    initialScrollOffset: 0.0,
    keepScrollOffset: true,
  );

  @override
  void onInit() {
    initFirbaseNotification();
    super.onInit();
    scrollController.addListener(() {
      double offset = 0.9 * scrollController.position.maxScrollExtent;

      if (scrollController.position.pixels > offset) {
        print('scrollController offset > load more');
      }
    });
  }

  @override
  void onReady() {
    super.onReady();
  }

  initFirbaseNotification() {
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      RemoteNotification? notification = message.notification;
      AndroidNotification? android = message.notification?.android;
      if (notification != null && android != null) {
        getChatMessage();
      }
    });

    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      RemoteNotification? notification = message.notification;
      AndroidNotification? android = message.notification?.android;
      if (notification != null && android != null) {}
    });
  }

  getChatMessage() async {
    Future.delayed(Duration(seconds: 1), () {
      try {
        final box = GetStorage();
        var currentId = box.read('id');
        ApiProvide().fetchChatMessage(currentId).then((value) {
          chatList.value = value;
          chatList.refresh();
          moveScroll();
        }, onError: (err) {
          handleError(err);
        });
      } catch (exception) {
        handleError(exception);
        hideLoading();
      }
    });
  }

  sendchattMessage(String Message, ApplicantModel chatModel) {
    final box = GetStorage();
    var currentId = box.read('token');
    ChatModel chatModel1 = new ChatModel(isSender: true);
    chatModel1.isSender = true;
    chatModel1.message = "$Message";
    chatModel1.receiverId = chatModel.appUserid;
    chatModel1.appUserId = int.parse(currentId[0]);

    chatList.add(chatModel1);
    chatList.refresh();
    moveScroll();
    postMessage(chatModel1);
  }

  @override
  void onClose() {
    super.onClose();
    scrollController.dispose();
  }

  void moveScroll() {
    Future.delayed(Duration(seconds: 1), () {
      if (scrollController.hasClients) {
        scrollController.animateTo(
          scrollController.position.maxScrollExtent,
          curve: Curves.easeOut,
          duration: const Duration(milliseconds: 100),
        );
      }
    });
  }

  void getApplicants() {
    Future.delayed(Duration(seconds: 1), () {
      try {
        showLoading('Fetching Exercise');
        applicantList.value = [];
        ApiProvide().fetchApplicant().then((value) {
          applicantList.value = value;

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

  void setAppUser(id) async {
    final box = GetStorage();
    box.write('id', id);
  }

  void postMessage(ChatModel chatModel) {
    final box = GetStorage();
    var currentId = box.read('token');
    int id = int.parse(currentId[0]);
    if (id != 1) {
      chatModel.receiverId = 1;
    }
    try {
      Map jsonBody = {
        "appUserId": '${chatModel.appUserId}',
        "receiverId": '${chatModel.receiverId}',
        "message": '${chatModel.message}',
      };
      ApiProvide().saveChattMessage(jsonBody).then((value) {}, onError: (err) {
        handleError(err);
      });
    } catch (exception) {
      handleError(exception);
      hideLoading();
    }
  }

  seenMessage() async {
    try {
      final box = GetStorage();
      var currentId = box.read('id');
      ApiProvide().updateSeenMessage(currentId).then((value) {},
          onError: (err) {
        handleError(err);
      });
    } catch (exception) {
      handleError(exception);
      hideLoading();
    }
  }
}
