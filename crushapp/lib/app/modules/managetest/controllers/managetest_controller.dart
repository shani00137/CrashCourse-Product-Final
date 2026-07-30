import 'package:crushapp/app/helper/basecontroller.dart';
import 'package:crushapp/app/models/testhistorymodel.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';

import '../../../data/providers/api_Provider.dart';

class ManagetestController extends GetxController with BaseController {
  //TODO: Implement ManagetestController
  var testList = <TestHistoryModel>[].obs;
  final count = 0.obs;
  @override
  void onInit() {
    super.onInit();
  }

  @override
  void onReady() {
    super.onReady();
  }

  getUserTestHistory() async {
    Future.delayed(Duration(seconds: 1), () {
      try {
        showLoading('Fetching Test History');
        final box = GetStorage();
        var token = box.read('token');
        ApiProvide().fetchUserTestHistory(token[0]).then((value) {
          testList.value = value;
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

  @override
  void onClose() {}
  void increment() => count.value++;
}
