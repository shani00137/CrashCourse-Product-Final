import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';

class SecurityController extends GetxController {
  //TODO: Implement SecurityController

  final count = 0.obs;
  RxBool isSwitched = true.obs;
  @override
  void onInit() {
    super.onInit();
  }

  @override
  void onReady() {
    super.onReady();
  }

  void notificationPermissionChange(value) {
    isSwitched.value = value;
    final box = GetStorage();
    box.write('isNotification', value);
    isSwitched.refresh();
  }

  void getNotificationStatus() {
    final box = GetStorage();
    var status = box.read('isNotification');
    isSwitched.value = status;
    isSwitched.refresh();
  }

  void logout() {
    final box = GetStorage();
    box.remove('token');
    box.remove('isLogin');
    Get.offAllNamed('/login');
  }

  @override
  void onClose() {}
  void increment() => count.value++;
}
