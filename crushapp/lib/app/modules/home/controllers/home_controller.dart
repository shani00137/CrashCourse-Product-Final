import 'dart:io';

import 'package:crushapp/app/helper/basecontroller.dart';
import 'package:crushapp/app/modules/chat/controllers/chat_controller.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../../../main.dart';
import '../../../data/providers/api_Provider.dart';
import '../../../widgets/myButton.dart';

class HomeController extends GetxController with BaseController {
  var userinfo = <String>[];
  var notificationCount = 0.obs;
  var chatController = ChatController();

  final count = 0.obs;

  @override
  void onInit() {
    _getPermission();
    super.onInit();
  }
  _getPermission()
  async {
       Map<Permission, PermissionStatus> status = await [
  Permission.camera,
  Permission.microphone,
  Permission.storage,

].request();
  }

  initFirbaseNotification() {
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      RemoteNotification? notification = message.notification;
      AndroidNotification? android = message.notification?.android;
      if (notification != null && android != null) {
        getPendingExams();

        flutterLocalNotificationsPlugin.show(
            notification.hashCode,
            notification.title,
            notification.body,
            NotificationDetails(
              android: AndroidNotificationDetails(
                channel.id,
                channel.name,                 
                color: Colors.blue,
                playSound: true,
                icon: '@mipmap/ic_launcher',
                 channelDescription: channel.description
               
              ),
            ));
        if (notification.title == "Account Block") {
          checkUserExpiry();
            _logoutUser();
        }
        if (notification.title == "Message") {}
        if(notification.title=="Screenshot")
        {
          var ImageUrl=_getImageUrl(notification);
          showNotificationDialog(ImageUrl,notification);

        }
      }
    });

    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      RemoteNotification? notification = message.notification;
      AndroidNotification? android = message.notification?.android;
      
      if (notification != null && android != null) {
            flutterLocalNotificationsPlugin.show(
            notification.hashCode,
            notification.title,
            notification.body,
            NotificationDetails(
              android: AndroidNotificationDetails(
                channel.id,
                channel.name,
                color: Colors.blue,
                playSound: true,
                icon: '@mipmap/ic_launcher',
                 channelDescription: channel.description
              ),
            ));

              Get.dialog(Dialog(
          child: Column(
            children: [
              Text('$notification.title'),
              SizedBox(height: 10,),
              Text('${notification.body}')
           
            ],
          ),
        ));
    
      }
    });
   
  }
String? _getImageUrl(RemoteNotification notification) {
  if (Platform.isIOS && notification.apple != null) return notification.apple?.imageUrl;
  if (Platform.isAndroid && notification.android != null) return notification.android?.imageUrl;
  return null;
}
  @override
  void onReady() {
    super.onReady();
  }

  void getUserInfo() {
    final box = GetStorage();
    var token = box.read('token');
    for (var d in token) {
      userinfo.add(d);
    }
  }

  getPendingExams() async {
    try {
      final box = GetStorage();
      var token = box.read('token');
      ApiProvide().fetchPendingExamCount(token[0]).then((value) {
        notificationCount.value = int.parse(value);
        notificationCount.refresh();
      }, onError: (err) {
        handleError(err);
      });
    } catch (exception) {
      handleError(exception);
      hideLoading();
    }
  }

  checkUserExpiry() async {
    try {
      final box = GetStorage();
      var token = box.read('token');
      ApiProvide().fetchUserExpiry(token[0]).then((value) {
        if (value == "false") {
          showExpiryAlert();
        }
      }, onError: (err) {
        handleError(err);
      });
    } catch (exception) {
      handleError(exception);
      hideLoading();
    }
  }

  checkUserDocumentVerfication() async {
    try {
      final box = GetStorage();
      var token = box.read('token');
      ApiProvide().fetchDocumentVerification(token[5]).then((value) {
        if (value == "false") {
          showDocumentVerification();
        }
      }, onError: (err) {
        handleError(err);
      });
    } catch (exception) {
      handleError(exception);
      hideLoading();
    }
  }

  void showExpiryAlert() {
    Get.dialog(
        barrierDismissible: false,
        Dialog(
          child: Container(
            height: 190,
            child: Padding(
              padding: const EdgeInsets.all(10.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Course Ended..',
                      style:
                          TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  SizedBox(
                    height: 5,
                  ),
                  Text(
                    'Dear Applicant your Course Session has been ended, thanks for join us..',
                    style: TextStyle(height: 1.5, fontSize: 14),
                  ),
                  MyButton(
                      onPressed: () {
                        _logoutUser();
                      },
                      title: 'Ok')
                ],
              ),
            ),
          ),
        ));
  }

  void showDocumentVerification() {
    Get.dialog(
        barrierDismissible: true,
        Dialog(
          child: Container(
            height: 200,
            child: Padding(
              padding: const EdgeInsets.all(10.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Documents Verification',
                      style:
                          TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  Divider(),
                  SizedBox(
                    height: 2,
                  ),
                  Text(
                    'Dear Applicant, please upload all documents..',
                    style: TextStyle(height: 1.5, fontSize: 17),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        MaterialButton(
                            color: Colors.orange,
                            child: Text('Ok'),
                            onPressed: () {
                              _gotoDocument();
                            }),
                        MaterialButton(
                            child: Text('Later on'),
                            onPressed: () {
                              Get.back();
                            })
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
  void onClose() {}
  void increment() => count.value++;

  void _logoutUser() {
    final box = GetStorage();
    box.remove('token');
    box.remove('isLogin');
    Get.offAllNamed('/login');
  }

  void _gotoDocument() {
    Get.back();
    Get.toNamed('/documentverification');
  }
  
  void showNotificationDialog(String? ImageUrl, var notification) {
      Get.dialog(Dialog(
          child: Container(
            height: 300,
            child: Padding(
              padding: const EdgeInsets.all(10.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Screenshot',
                      style:
                          TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  Divider(),
                  SizedBox(
                    height: 2,
                  ),
               Image.network(ImageUrl.toString(), height: 150,fit: BoxFit.fill, width:200
                , ),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                      
                        MaterialButton(
                          color: Colors.orange,
                          minWidth: 100,
                            child: Text('Ok'),
                            onPressed: () {
                              Get.back();
                            })
                      ],
                    ),
                  )
                ],
              ),
            ),
          ),
        ));
  }
}
