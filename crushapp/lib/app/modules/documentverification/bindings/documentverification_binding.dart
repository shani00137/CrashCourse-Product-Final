import 'package:get/get.dart';

import '../controllers/documentverification_controller.dart';

class DocumentverificationBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DocumentverificationController>(
      () => DocumentverificationController(),
    );
  }
}
