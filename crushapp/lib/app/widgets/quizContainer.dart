import 'package:crushapp/app/modules/taketest/controllers/taketest_controller.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/src/foundation/key.dart';
import 'package:flutter/src/widgets/framework.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:get/get.dart';
import 'package:get/get_state_manager/src/simple/get_state.dart';


import '../data/static/static_colors.dart';
import '../models/questionmodel.dart';
import 'itemContainerQuizOption.dart';

class QuizContainer extends StatefulWidget {
  final QuestionModel questionModel;
  final int index;
  final int questionCount;
  final int quizNo;
  PageController pageController;
  final Function(int) myNumber;
  QuizContainer(
      {required this.questionModel,
      required this.index,
      required this.questionCount,
      required this.quizNo,
      required this.pageController,
      required this.myNumber});

  @override
  State<QuizContainer> createState() => _QuizContainerState(this.questionModel,
      this.index, this.pageController, this.quizNo, this.questionCount);
}

class _QuizContainerState extends State<QuizContainer> {
  QuestionModel questionModel;
  int index;
  PageController pageController;
  int questionCount;
  int quizNo;
  _QuizContainerState(this.questionModel, this.index, this.pageController,
      this.questionCount, this.quizNo);
  var testController = TaketestController();
  @override
  Widget build(BuildContext context) {
    return Container(
        height: MediaQuery.of(context).size.height / 1.8,
        margin: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: GetBuilder<TaketestController>(
              init: TaketestController(), // INIT IT ONLY THE FIRST TIME
              builder: (_) => (ListView(
                    children: [
                      SizedBox(
                        height: 15,
                      ),
                      InkWell(
                          onTap: () {
                            testController.selectedOptions(index, 1,
                                questionModel.questionId, questionModel.testId);
                          },
                          child: Text('QUESTIONS $quizNo OF $questionCount',
                              style: TextStyle(
                                  color: Colors.grey,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500))),

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
                            // testController.selectedOptions(index, 1,
                            //     questionModel.questionId, questionModel.testId);
                          },
                          child: Container(
                              height: 50,
                              decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(15),
                                  color: questionModel.isSelected == 1
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
                                            fontSize: FontSize.medium,
                                            color: Colors.black)
                                      }),
                                ),
                              ))),
                      SizedBox(
                        height: 20,
                      ),
                      InkWell(
                        onTap: () {
                          testController.selectedOptions(index, 2,
                              questionModel.questionId, questionModel.testId);
                        },
                        child: Container(
                            height: 50,
                            decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(15),
                                color: questionModel.isSelected == 2
                                    ? Colors.grey[200]!
                                    : Colors.white,
                                border: Border.all(
                                    color: questionModel.isSelected == 2
                                        ? StaticColors.primaryColor
                                        : Colors.grey[200]!)),
                            child: Padding(
                              padding: const EdgeInsets.all(5.0),
                              child: Center(
                                child: Html(
                                    data: questionModel.option2,
                                    style: {
                                      "html": Style(
                                          fontSize: FontSize.medium,
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
                          testController.selectedOptions(index, 3,
                              questionModel.questionId, questionModel.testId);
                        },
                        child: Container(
                            height: 50,
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
                                child: Html(
                                    data: questionModel.option3,
                                    style: {
                                      "html": Style(
                                          fontSize: FontSize.medium,
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
                          testController.selectedOptions(index, 4,
                              questionModel.questionId, questionModel.testId);
                        },
                        child: Container(
                            height: 50,
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
                                child: Html(
                                    data: questionModel.option4,
                                    style: {
                                      "html": Style(
                                          fontSize: FontSize.medium,
                                          color: Colors.black)
                                    }),
                              ),
                            )),
                      ),
                      SizedBox(
                        height: 30,
                      ),
                      // questionModel.isSelected > 0
                      //     ? showRightAnswer(questionModel, index)
                      //     : Container(),
                      //   SizedBox(height: 20,),
                      //       Container(
                      //     height: 70,
                      //     child: Padding(
                      //       padding: const EdgeInsets.only(),
                      //       child: Center(
                      //         child: CircularCountDownTimer(
                      //           duration: 20,
                      //           initialDuration: 0,
                      //           controller: CountDownController(),
                      //           width: MediaQuery.of(context).size.width / 2,
                      //           height: MediaQuery.of(context).size.height / 2,
                      //           ringColor: Colors.grey[200]!,
                      //           ringGradient: null,
                      //           fillColor: Colors.purple[300]!,
                      //           fillGradient: null,
                      //           backgroundColor: Colors.purple[500],
                      //           backgroundGradient: null,
                      //           strokeWidth: 10.0,
                      //           strokeCap: StrokeCap.round,
                      //           textStyle: TextStyle(
                      //               fontSize: 33.0,
                      //               color: Colors.white,
                      //               fontWeight: FontWeight.bold),
                      //           isReverse: false,
                      //           isReverseAnimation: false,
                      //           isTimerTextShown: true,
                      //           autoStart: true,
                      //           onStart: () {
                      //             print('Countdown Started');
                      //           },
                      //           onComplete: () {
                      //             print('Countdown Ended');
                      //             gotoNextQuiz();
                      //           },
                      //         ),
                      //       ),
                      //     ),
                      //   ),
                    ],
                  ))),
        ));
  
  }



  void gotoNextQuiz() {
    pageController.nextPage(
        duration: Duration(seconds: 1), curve: Curves.easeInCubic);
  }
}
