import 'package:get/get.dart';

import '../controllers/managetest_controller.dart';

class ManagetestBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ManagetestController>(
      () => ManagetestController(),
    );
  }
}
