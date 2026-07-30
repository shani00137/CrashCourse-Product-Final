import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_udid/flutter_udid.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:platform_device_id/platform_device_id.dart';
import '../../../data/providers/api_Provider.dart';
import '../../../helper/basecontroller.dart';
import '../../../models/loginModel.dart';
import '../../../utilites/toasMessage.dart';

class LoginController extends GetxController with BaseController {
  var loginInfoList = <LoginModel>[].obs;
  var connectionStatus = 0.obs;
  final count = 0.obs;
  FirebaseMessaging messaging = FirebaseMessaging.instance;
  @override
  // ignore: unnecessary_overrides
  void onReady() {

    super.onReady();
  }


  _registerNotification(id) async {
    try {
      final fcmToken = await FirebaseMessaging.instance.getToken();

      Map jsonBody = {
        "Token": fcmToken,
        "appUserId": "$id",
      };

      ApiProvide().updateUserToken(jsonBody).then((value) {}, onError: (err) {
        handleError(err);
      });
    } catch (exception) {
      handleError(exception);
      hideLoading();
    }
  }

  getLogin(userName, password) async {
    if (userName != null &&
        userName != "" &&
        password != null &&
        password != "")
      try {
        String? deviceId = await FlutterUdid.consistentUdid;
        Map jsonBody = {
          "Username": "$userName",
          "Password": "$password",
          "DeviceId": "$deviceId"
        };
        showLoading('Fetching account details');
        ApiProvide().getchLoginInformation(jsonBody).then((value) {
          loginInfoList.value = value;
          if (loginInfoList[0].isValid.toString() == "true") {
            List<String> myList = <String>[];
            myList.insert(0, loginInfoList[0].appUserId.toString());
            myList.insert(1, loginInfoList[0].name.toString());
            myList.insert(2, '${loginInfoList[0].email}');
            myList.insert(3, '${loginInfoList[0].address}');
            myList.insert(4, '${loginInfoList[0].mobile}');
            myList.insert(5, '${loginInfoList[0].applicantId}');
            hideLoading();
            saveToLocalStorage(myList);
            _registerNotification(loginInfoList[0].appUserId);
      
            Get.offAllNamed("/home");
          } else {
            hideLoading();
            ToastMessage.displayToast('${loginInfoList[0].response}');
          }
        }, onError: (err) {
          handleError(err);
        });
      } catch (exception) {
        handleError(exception);
        hideLoading();
      }
  }

  void saveToLocalStorage(List<String> myList) async {
    final box = GetStorage();
    box.write('token', myList);
    box.write('isLogin', true);
    box.write('isNotification', true);
  }
  
 
}
