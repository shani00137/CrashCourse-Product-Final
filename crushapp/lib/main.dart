import 'package:crushapp/app/modules/chat/controllers/chat_controller.dart';
import 'package:crushapp/app/modules/courses/controllers/courses_controller.dart';
import 'package:crushapp/app/modules/home/controllers/home_controller.dart';
import 'package:crushapp/app/modules/login/controllers/login_controller.dart';
import 'package:crushapp/app/modules/questions/controllers/questions_controller.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_windowmanager/flutter_windowmanager.dart';

import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';

import 'app/routes/app_pages.dart';

const AndroidNotificationChannel channel = AndroidNotificationChannel(
    'high_importance_channel', // id
    'High Importance Notifications', // title
    // description
    importance: Importance.high,
    playSound: true);

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print('A bg message just showed up :  ${message.messageId}');
}

Future<void> main() async {
  await GetStorage.init();
  await FlutterWindowManager.addFlags(FlutterWindowManager.FLAG_SECURE);
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  await flutterLocalNotificationsPlugin
      .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>()
      ?.createNotificationChannel(channel);

  await FirebaseMessaging.instance.setForegroundNotificationPresentationOptions(
    alert: true,
    badge: true,
    sound: true,
  );
  runApp(
    GetMaterialApp(
      title: "Application",
      initialRoute: getInialRoute(),
      debugShowCheckedModeBanner: false,
      defaultTransition: Transition.rightToLeftWithFade,
      getPages: AppPages.routes,
      initialBinding: Bind(),
    ),
  );
}

getInialRoute() {
  final store = GetStorage();
  var isLogin = store.read('isLogin');
  return isLogin == null ? Routes.LOGIN : Routes.HOME;
}

class Bind implements Bindings {
  @override
  void dependencies() {
    Get.put(HomeController());
    Get.put(ChatController());
    Get.put(CoursesController());
    Get.put(LoginController());
    Get.put(QuestionsController());
  }
}

Future<void> _messageHandler(RemoteMessage message) async {
  var homeController = HomeController();
  homeController.getPendingExams();
  //print('background message ${message.notification!.body}');
}
