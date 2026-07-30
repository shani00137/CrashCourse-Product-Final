import 'package:crushapp/app/models/questionmodel.dart';
import 'package:flutter/material.dart';
import 'package:flutter_countdown_timer/flutter_countdown_timer.dart';
import 'package:flutter_html/flutter_html.dart';

import 'package:get/get.dart';


import '../../../data/static/static_colors.dart';
import '../../../widgets/myButton.dart';
import '../../../widgets/quizContainer.dart';
import '../controllers/taketest_controller.dart';

class TaketestView extends GetView<TaketestController> {
  var testId = Get.arguments;
  var takeTestController = TaketestController();
  final int _duration = 10;

  int currentPageIndex = 0;
  int pageCount = 1;
  int pageViewIndex = 0;

  final PageController pageController = PageController();
  @override
  Widget build(BuildContext context) {
    takeTestController.startTest(testId);
    return Obx(() => SafeArea(
            child: Scaffold(
          backgroundColor: Colors.grey,
          body: Column(
            children: [
              Container(
                margin: EdgeInsets.symmetric(horizontal: 10, vertical: 1),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    IconButton(
                        onPressed: () {
                          _lastQuiz();
                        },
                        icon: Icon(Icons.arrow_back_ios,
                            size: 25, color: Colors.white)),
                    Expanded(
                      child: Slider(
                        activeColor: Colors.white,
                        inactiveColor: Colors.white38,
                        thumbColor: Colors.white,
                        value: takeTestController.currentSliderValue.value
                            .toDouble(),
                        min: 0,
                        max: takeTestController.quizList.length > 0
                            ? double.parse(
                                takeTestController.quizList.length.toString())
                            : 100,
                        divisions: 52,
                        label: takeTestController.currentSliderValue.toString(),
                        onChanged: (double value) {
                          takeTestController.currentSliderValue.value =
                              value.toInt();
                        },
                        onChangeEnd: (double value) {
                          gotoPage(value);
                        },
                      ),
                    ),
                    IconButton(
                        onPressed: () {
                          _nextQuiz();
                        },
                        icon: Icon(Icons.arrow_forward_ios,
                            size: 25, color: Colors.white)),
                  ],
                ),
              ),
              Expanded(
                child: PageView.builder(
                    controller: pageController,
                    itemCount: takeTestController.quizList.length,
                    onPageChanged: getCurrentPage,
                    // itemCount: pageCount,
                    itemBuilder: (context, position) {
                      return myTestContainer(
                          takeTestController.quizList[position],
                          position,
                          position + 1,
                          takeTestController.quizList.length,
                          context);
                    }),
              ),
             
              MyButton(
                onPressed: () {
                  saveExam();
                },
                title: 'Finish Exam',
              )
              // Container(
              //   margin: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              //   child: Row(
              //     mainAxisAlignment: MainAxisAlignment.spaceBetween,
              //     children: [
              //       ElevatedButton(
              //         child: Text("Previous",
              //             style: GoogleFonts.rubik(fontSize: 15)),
              //         onPressed: () => _lastQuiz(),
              //         style: ElevatedButton.styleFrom(
              //           primary: Colors.orange[900],
              //           onPrimary: Colors.white,
              //           shape: RoundedRectangleBorder(
              //             borderRadius: BorderRadius.circular(10.0),
              //           ),
              //         ),
              //       ),
              //       ElevatedButton(
              //         child: Text(
              //           "     Next     ",
              //           style: GoogleFonts.rubik(fontSize: 15),
              //         ),
              //         onPressed: () => _nextQuiz(),
              //         style: ElevatedButton.styleFrom(
              //           primary: Colors.orange[900],
              //           onPrimary: Colors.white,
              //           shape: RoundedRectangleBorder(
              //             borderRadius: BorderRadius.circular(10.0),
              //           ),
              //         ),
              //       ),
              //     ],
              //   ),
              // )
            ],
          ),
        )));
  }

  myTestContainer(QuestionModel questionModel, int index, int quizNo,
      int questionCount, BuildContext context) {
    return Container(
        height: MediaQuery.of(context).size.height / 1.8,
        margin: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(5)),
        child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Obx(() => ListView(
                  children: [
                    SizedBox(
                      height: 10,
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        InkWell(
                            onTap: () {
                              takeTestController.selectedOptions(
                                  index,
                                  1,
                                  questionModel.questionId,
                                  questionModel.testId);
                            },
                            child: Text('QUESTIONS $quizNo OF $questionCount',
                                style: TextStyle(
                                    color: Colors.grey,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500))),
                        CountdownTimer(
                          endTime: takeTestController.count.value,
                          textStyle: TextStyle(
                              color: Colors.red,
                              fontSize: 16,
                              fontWeight: FontWeight.w500),
                          onEnd: () {
                            Get.back();
                            takeTestController.saveTest(testId);

                            Get.offAndToNamed('/home');
                          },
                        ),
                      ],
                    ),
                    SizedBox(
                      height: 10,
                    ),
                    Html(data: questionModel.questionContent, style: {
                      "html": Style(
                        color: Colors.black,
                        fontSize: FontSize.xLarge,

                        //              color: Colors.white,
                      )
                    }),
                    SizedBox(
                      height: 20,
                    ),
                    InkWell(
                        onTap: () {
                          // myNumber(5);
                          takeTestController.selectedOptions(index, 1,
                              questionModel.questionId, questionModel.testId);
                        },
                        child: Container(
                            decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(15),
                                color: takeTestController
                                            .quizList[index].isSelected ==
                                        1
                                    ? Colors.grey[200]!
                                    : Colors.white,
                                border: Border.all(
                                    color: questionModel.isSelected == 1
                                        ? StaticColors.primaryColor
                                        : Colors.grey[200]!)),
                            child: Padding(
                              padding: const EdgeInsets.all(5.0),
                              child: Center(
                                child: Html(
                                    data: questionModel.option1,
                                    style: {
                                      "html": Style(
                                          fontSize: FontSize.large,
                                          color: Colors.black)
                                    }),
                              ),
                            ))),
                    SizedBox(
                      height: 20,
                    ),
                    InkWell(
                      onTap: () {
                        takeTestController.selectedOptions(index, 2,
                            questionModel.questionId, questionModel.testId);
                      },
                      child: Container(
                          decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(15),
                              color: takeTestController
                                          .quizList[index].isSelected ==
                                      2
                                  ? Colors.grey[200]!
                                  : Colors.white,
                              border: Border.all(
                                  color: takeTestController
                                              .quizList[index].isSelected ==
                                          2
                                      ? StaticColors.primaryColor
                                      : Colors.grey[200]!)),
                          child: Padding(
                            padding: const EdgeInsets.all(5.0),
                            child: Center(
                              child: Html(data: questionModel.option2, style: {
                                "html": Style(
                                    fontSize: FontSize.large,
                                    color: Colors.black)
                              }),
                            ),
                          )),
                    ),
                    SizedBox(
                      height: 20,
                    ),
                    InkWell(
                      onTap: () {
                        takeTestController.selectedOptions(index, 3,
                            questionModel.questionId, questionModel.testId);
                      },
                      child: Container(
                          decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(15),
                              color: questionModel.isSelected == 3
                                  ? Colors.grey[200]!
                                  : Colors.white,
                              border: Border.all(
                                  color: questionModel.isSelected == 3
                                      ? StaticColors.primaryColor
                                      : Colors.grey[200]!)),
                          child: Padding(
                            padding: const EdgeInsets.all(5.0),
                            child: Center(
                              child: Html(data: questionModel.option3, style: {
                                "html": Style(
                                    fontSize: FontSize.large,
                                    color: Colors.black)
                              }),
                            ),
                          )),
                    ),
                    SizedBox(
                      height: 20,
                    ),
                    InkWell(
                      onTap: () {
                        takeTestController.selectedOptions(index, 4,
                            questionModel.questionId, questionModel.testId);
                      },
                      child: Container(
                          decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(15),
                              color: questionModel.isSelected == 4
                                  ? Colors.grey[200]!
                                  : Colors.white,
                              border: Border.all(
                                  color: questionModel.isSelected == 4
                                      ? StaticColors.primaryColor
                                      : Colors.grey[200]!)),
                          child: Padding(
                            padding: const EdgeInsets.all(5.0),
                            child: Center(
                              child: Html(data: questionModel.option4, style: {
                                "html": Style(
                                    fontSize: FontSize.large,
                                    color: Colors.black)
                              }),
                            ),
                          )),
                    ),
                    SizedBox(
                      height: 30,
                    ),
                  ],
                ))));
  }

  void saveQuizTest() {
    //takeTestController.saveQuizTest(takeTestController.quizList[0].testId);
    // Get.off(ResultPage(), duration: Duration(microseconds: 500));
  }

  _lastQuiz() {
    if (pageViewIndex != 0) pageViewIndex = pageViewIndex - 1;
    pageController.animateToPage(pageViewIndex,
        duration: Duration(seconds: 1), curve: Curves.easeIn);
  }

  _nextQuiz() {
    if (pageViewIndex < takeTestController.quizList.length) {
      pageViewIndex = pageViewIndex + 1;
      pageController.animateToPage(pageViewIndex,
          duration: Duration(seconds: 1), curve: Curves.easeIn);
    }
  }

  getCurrentPage(int page) {
    pageViewIndex = page;

    takeTestController.currentSliderValue.value = page;
  }

  void gotoPage(double value) {
    pageController.animateToPage(value.truncate(),
        duration: Duration(seconds: 1), curve: Curves.easeIn);
  }

  void saveExam() {
    Get.dialog(Dialog(
      child: Container(
        height: 190,
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
                'Are you sure to Submit Exam, Please note that blank answer considers as wrong attempt..',
                style: TextStyle(height: 1.5, fontSize: 14),
              ),
              MyButton(
                  onPressed: () {
                    Get.back();
                    takeTestController.saveTest(testId);

                    Get.offAndToNamed('/home');
                  },
                  title: 'Submit Now.')
            ],
          ),
        ),
      ),
    ));
  }
}
