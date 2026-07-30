import 'package:flutter/material.dart';

import 'package:get/get.dart';

import '../../../widgets/examSummaryCard.dart';
import '../../../widgets/testCard2.dart';

import '../controllers/result_controller.dart';

class ExamSummary extends GetView<ResultController> {
  var resultController = ResultController();
  var testId = Get.arguments;
  @override
  Widget build(BuildContext context) {
    resultController.getExamSummary(testId);
    return Scaffold(
        appBar: AppBar(
          title: const Text('Summary'),
          backgroundColor: Colors.orange[900],
          centerTitle: true,
        ),
        body: Obx(() {
          return ListView.builder(
              itemCount: resultController.summaryList.length,
              itemBuilder: (context, index) {
                return ExamSummaryCard(
                  questionModel: resultController.summaryList[index],
                );
              });
        }));
  }
}
