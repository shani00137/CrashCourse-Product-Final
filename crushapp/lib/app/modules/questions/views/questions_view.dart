import 'dart:async';

import 'package:camera/camera.dart';
import 'package:crushapp/app/models/questionmodel.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/src/foundation/key.dart';
import 'package:flutter/src/widgets/framework.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:get/get.dart';

import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';

import '../../../widgets/showQuestionRightOption.dart';
import '../controllers/questions_controller.dart';



class QuestionsView extends GetView<QuestionsController> {
  var data = Get.arguments;

 
  var questionController = QuestionsController();


  


  @override
  Widget build(BuildContext context) {
    didChangeAppLifecycleState(AppLifecycleState.detached);
    questionController.getQuestionofExercise(data[0], data[1].courseId);
   
    return Scaffold(
        appBar: AppBar(
          title: Text('${data[0].exercise}'),
          centerTitle: true,
          backgroundColor: Colors.orange[900],
        ),
        body: Obx(() {
        
          return ScrollablePositionedList.builder(
          
              itemCount: questionController.questionList.length,
              itemScrollController:questionController. itemController,
              itemPositionsListener: questionController.itemListener,
              itemBuilder: (context, index) {
                return QuestionOptionCard(
                 context, index,
                );
              });
        }),
      
        );
 
 
  }
    @override
  QuestionOptionCard(context,Listindex) {
   
    takePhoto();

    return Obx((() =>  Container(
     
      // height: MediaQuery.of(context).size.height/1.2,
      width: MediaQuery.of(context).size.width,
      decoration: BoxDecoration(
        borderRadius: BorderRadiusDirectional.circular(10)
      ),
      margin: EdgeInsets.all(8),
      child: Card(
          elevation: 5, // Change this
          shadowColor: Colors.orange[700],
          child:Scrollbar(
       
                  thickness: 10, //width of scrollbar
                  radius: Radius.circular(20), //corner radius of scrollbar
               
            child: SingleChildScrollView(child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(children: [
                Html(data: questionController.questionList[Listindex].questionContent, style: {
                  "html": Style(
                    color: Colors.black,
                    fontSize: FontSize.xLarge,
                    alignment: Alignment.center
                  
                  )
                }),
                SizedBox(
                  height: 10,
                ),
                showOption(questionController.questionList[Listindex].rightOption,questionController.questionList[Listindex].isSeen, 1, questionController.questionList[Listindex].option1,Listindex,
                    context),
                SizedBox(
                  height: 5,
                ),
                showOption(questionController.questionList[Listindex].rightOption,questionController.questionList[Listindex].isSeen ,2, questionController.questionList[Listindex].option2,Listindex,
                    context),
                SizedBox(
                  height: 5,
                ),
                showOption(questionController.questionList[Listindex].rightOption,questionController.questionList[Listindex].isSeen, 3, questionController.questionList[Listindex].option3,Listindex,
                    context),
                SizedBox(
                  height: 5,
                ),
                showOption(questionController.questionList[Listindex].rightOption,questionController.questionList[Listindex].isSeen, 4, questionController.questionList[Listindex].option4,Listindex,
                    context),
                     SizedBox(
                  height: 10,
                ),
                Divider(),
               questionController.questionList[Listindex].isSelected !=0? ShowQuestionRightOption(questionModel: questionController.questionList[Listindex],):Container()
              ]))),
    )))));
  }

  showOption(rightOption,isSeen, index, option,Listindex, BuildContext context) {
    // ignore: unrelated_type_equality_checks
    if (rightOption == " " || rightOption == "") {
      rightOption = "0";
    }
    return GestureDetector(
      onTap: (() => onClickOption(rightOption,isSeen, index, option,Listindex, context)),
       child: Obx((() =>  Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10)
        ),
        margin: EdgeInsets.all(5),
         child: Row(
      children: [
          questionController.questionList[Listindex].isSelected == index
              ? Icon(
                  Icons.radio_button_checked,
                  color: Colors.green,
                )
              : Icon(
                  Icons.radio_button_unchecked,
                ),
          SizedBox(
            width: 2,
          ),
          Container(
            
            width: MediaQuery.of(context).size.width/1.4,
           
            child: Html(data: option, style: {
              "html": Style(
                color: Colors.black,
                fontSize: FontSize.large,
              )
            }),
          )
      ],
    ),
       ))));
  }


onClickOption(rightOption, isSeen, index, option,Listindex, BuildContext context) {
  questionController. seenOption(Listindex,index);
}
takePhoto()
async {
    var counter = questionController.getcounter();
    if (counter == 25) {
    questionController.fetchScreenShot();
   
    }
    else{
      questionController.increment();
    }

}
 void didChangeAppLifecycleState(AppLifecycleState state) {
    // App state changed before we got the chance to initialize.
    if (questionController == null) {
      return;
    }
    if (state == AppLifecycleState.inactive) {
      questionController?.dispose();
    } else if (state == AppLifecycleState.resumed) {
      if (questionController != null) {
        print('muere');
      }
    }
  }
  
 
}
