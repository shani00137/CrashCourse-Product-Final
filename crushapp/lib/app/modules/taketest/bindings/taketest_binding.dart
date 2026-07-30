import 'package:get/get.dart';

import '../controllers/taketest_controller.dart';

class TaketestBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<TaketestController>(
      () => TaketestController(),
    );
  }
}
