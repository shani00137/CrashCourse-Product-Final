import 'package:get/get.dart';

import '../controllers/coursematerial_controller.dart';

class CoursematerialBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<CoursematerialController>(
      () => CoursematerialController(),
    );
  }
}
