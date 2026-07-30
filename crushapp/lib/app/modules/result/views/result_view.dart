import 'package:flutter/material.dart';

import 'package:get/get.dart';

import '../../../widgets/testCard2.dart';
import '../../../widgets/testcard.dart';
import '../../managetest/controllers/managetest_controller.dart';
import '../controllers/result_controller.dart';

class ResultView extends GetView<ResultController> {
  var resultController = ResultController();
  @override
  Widget build(BuildContext context) {
    resultController.getUserResult();
    return Scaffold(
        appBar: AppBar(
          title: Text('Exam Result'),
          backgroundColor: Colors.orange[900],
          centerTitle: true,
        ),
        body: Obx(() {
          return ListView.builder(
              itemCount: resultController.testList.length,
              itemBuilder: (context, index) {
                return TestCard2(
                  data: resultController.testList[index],
                  onPressed: () {
                    _gotoSummary(resultController.testList[index].testId);
                  },
                );
              });
        }));
  }

  void _gotoSummary(int? testId) {
    Get.toNamed('/examsummary', arguments: testId);
  }
}
