import 'package:crushapp/app/helper/basecontroller.dart';
import 'package:crushapp/app/models/questionmodel.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';

import '../../../data/providers/api_Provider.dart';
import '../../../models/testhistorymodel.dart';

class ResultController extends GetxController with BaseController {
  final count = 0.obs;
  var testList = <TestHistoryModel>[].obs;
  var summaryList = <QuestionModel>[].obs;
  @override
  void onInit() {
    super.onInit();
  }

  @override
  void onReady() {
    super.onReady();
  }

  getUserResult() async {
    Future.delayed(Duration(seconds: 1), () {
      try {
        showLoading('Fetching Test History');
        final box = GetStorage();
        var token = box.read('token');
        ApiProvide().fetchuserTestresults(token[0]).then((value) {
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

  getExamSummary(id) async {
    Future.delayed(Duration(seconds: 1), () {
      try {
        showLoading('Fetching Test History');

        ApiProvide().fetchExamSummary(id).then((value) {
          summaryList.value = value;
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
