import 'package:crushapp/app/models/testhistorymodel.dart';
import 'package:crushapp/app/widgets/myButton.dart';
import 'package:flutter/material.dart';

import 'package:get/get.dart';

import '../../../widgets/testcard.dart';
import '../controllers/managetest_controller.dart';

class ManagetestView extends GetView<ManagetestController> {
  var testController = ManagetestController();
  @override
  Widget build(BuildContext context) {
    testController.getUserTestHistory();
    return Scaffold(
        appBar: AppBar(
          title: Text('Test history'),
          backgroundColor: Colors.orange[900],
          centerTitle: true,
        ),
        body: Obx(() {
          return ListView.builder(
              itemCount: testController.testList.length,
              itemBuilder: (context, index) {
                return TestCard(
                  data: testController.testList[index],
                  onPressed: () {
                    _gotoTest(testController.testList[index], context);
                  },
                );
              });
        }));
  }

  void _gotoTest(TestHistoryModel testList, BuildContext context) {
    if (testList.isCompleted == false) {
      Get.dialog(Dialog(
          child: Container(
        height: 220,
        child: Padding(
          padding: const EdgeInsets.all(10.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Confirmation..',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              SizedBox(
                height: 5,
              ),
              Text(
                'Note: Once you start the exam, the timer will start automatically. As the exam complete please submit exam, Exam result will shown as it complete..',
                style: TextStyle(height: 1.5, fontSize: 14),
              ),
              MyButton(
                  onPressed: () {
                    Get.back();
                    Get.toNamed('/taketest', arguments: testList.testId);
                  },
                  title: 'Agreed..')
            ],
          ),
        ),
      )));
    }
  }
}
