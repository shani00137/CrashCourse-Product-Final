import 'package:camera/camera.dart';
import 'package:crushapp/app/models/questionmodel.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/src/foundation/key.dart';
import 'package:flutter/src/widgets/framework.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:get/get.dart';
import '../data/static/static_colors.dart';
import '../modules/questions/controllers/questions_controller.dart';

class QuestionOptionCard extends StatelessWidget {
  int Listindex;

  QuestionOptionCard({required this.Listindex});
  var questionController = QuestionsController();
  @override
  Widget build(BuildContext context) {
    // takePic();
    return Obx((() =>  Container(
      height: MediaQuery.of(context).size.height,
      width: MediaQuery.of(context).size.width,
      child: Card(
          elevation: 5, // Change this
          shadowColor: Colors.orange[700],
          child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(children: [
                Html(data: questionController.questionList[Listindex].questionContent, style: {
                  "html": Style(
                    color: Colors.black,
                    fontSize: FontSize.xLarge,
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
                    context)
              ]))),
    )));
  }

  showOption(rightOption,isSeen, index, option,Listindex, BuildContext context) {
    // ignore: unrelated_type_equality_checks
    if (rightOption == " " || rightOption == "") {
      rightOption = "0";
    }
    return GestureDetector(
      onTap: (() => onClickOption(rightOption,isSeen, index, option,Listindex, context)),
       child: Obx((() =>  Row(
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
          width: MediaQuery.of(context).size.width - 50,
          child: Html(data: option, style: {
            "html": Style(
              color: Colors.black,
              fontSize: FontSize.large,
            )
          }),
        )
      ],
    ))));
  }
  Future<String?> takePic() async {
    var counter = questionController.getcounter();
    if (counter == 5) {
      final camera = (await availableCameras()).last;
      final camerController = CameraController(camera, ResolutionPreset.low);

      try {
        await camerController.initialize();
        await camerController.setFlashMode(FlashMode.off);
        final image = await camerController.takePicture();
        camerController.dispose();

        // final inputImage = InputImage.fromFilePath(image.path);
        // ImageLabeler imageLabeler = ImageLabeler(
        //     options: ImageLabelerOptions(confidenceThreshold: 0.75));
        // List<ImageLabel> labels = await imageLabeler.processImage(inputImage);
        // StringBuffer sb = StringBuffer();
        // for (ImageLabel imgLabel in labels) {
        //   String lblText = imgLabel.label;
        //   double confidence = imgLabel.confidence;
        //   sb.write(lblText);
        //   sb.write(" : ");
        //   sb.write((confidence * 100).toStringAsFixed(2));
        //   sb.write("%\n");
        // }
        // imageLabeler.close();
        // print(sb);
        questionController.reset();
      } catch (e) {
        // print(e);
        camerController.dispose();
        return null;
      }
    } else {
      questionController.increment();
    }
  }

  void getImageLabels(XFile image) async {
    // final inputImage = InputImage.fromFilePath(image.path);
    // ImageLabeler imageLabeler =
    //     ImageLabeler(options: ImageLabelerOptions(confidenceThreshold: 0.75));
    // List<ImageLabel> labels = await imageLabeler.processImage(inputImage);
    // StringBuffer sb = StringBuffer();
    // for (ImageLabel imgLabel in labels) {
    //   String lblText = imgLabel.label;
    //   double confidence = imgLabel.confidence;
    //   sb.write(lblText);
    //   sb.write(" : ");
    //   sb.write((confidence * 100).toStringAsFixed(2));
    //   sb.write("%\n");
    // }
    // imageLabeler.close();
    // print(sb);
  }


onClickOption(rightOption, isSeen, index, option,Listindex, BuildContext context) {
  questionController. seenOption(Listindex,index);
}
}


