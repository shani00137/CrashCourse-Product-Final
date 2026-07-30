import 'package:crushapp/app/models/questionmodel.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/src/foundation/key.dart';
import 'package:flutter/src/widgets/framework.dart';
import 'package:flutter_html/flutter_html.dart';

import '../data/static/static_colors.dart';

class ExamSummaryCard extends StatelessWidget {
  QuestionModel questionModel;
  ExamSummaryCard({required this.questionModel});

  @override
  Widget build(BuildContext context) {
    return Card(
        child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(children: [
              Html(data: questionModel.questionContent, style: {
                "html": Style(
                  color: Colors.black,
                  fontSize: FontSize.xLarge,
                )
              }),
              int.parse(questionModel.rightOption) == questionModel.isSelected
                  ? showRightOption(questionModel, context)
                  : showWrongAndRightOption(questionModel, context)
            ])));
  }

  showRightOption(QuestionModel questionModel, BuildContext context) {
    // ignore: unrelated_type_equality_checks
    if (int.parse(questionModel.rightOption) == 1) {
      return Row(
        children: [
          Icon(
            Icons.check_circle,
            color: Colors.green,
          ),
          SizedBox(
            width: 2,
          ),
          Container(
            width: MediaQuery.of(context).size.width - 50,
            child: Html(data: questionModel.option1, style: {
              "html": Style(
                color: Colors.black,
                fontSize: FontSize.large,
              )
            }),
          )
        ],
      );
    }
    if (int.parse(questionModel.rightOption) == 2) {
      return Row(
        children: [
          Icon(
            Icons.check_circle,
            color: Colors.green,
          ),
          SizedBox(
            width: 2,
          ),
          Container(
            width: MediaQuery.of(context).size.width - 50,
            child: Html(data: questionModel.option2, style: {
              "html": Style(
                color: Colors.black,
                fontSize: FontSize.large,
              )
            }),
          )
        ],
      );
    }
    if (int.parse(questionModel.rightOption) == 3) {
      return Row(
        children: [
          Icon(
            Icons.check_circle,
            color: Colors.green,
          ),
          SizedBox(
            width: 2,
          ),
          Container(
            width: MediaQuery.of(context).size.width - 50,
            child: Html(data: questionModel.option3, style: {
              "html": Style(
                color: Colors.black,
                fontSize: FontSize.large,
              )
            }),
          )
        ],
      );
    }
    if (int.parse(questionModel.rightOption) == 4) {
      return Row(
        children: [
          Icon(
            Icons.check_circle,
            color: Colors.green,
          ),
          SizedBox(
            width: 2,
          ),
          Container(
            width: MediaQuery.of(context).size.width - 50,
            child: Html(data: questionModel.option4, style: {
              "html": Style(
                color: Colors.black,
                fontSize: FontSize.large,
              )
            }),
          )
        ],
      );
    }
  }

  showWrongAndRightOption(QuestionModel questionModel, BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Icon(
              Icons.cancel,
              color: Colors.red,
            ),
            SizedBox(
              width: 2,
            ),
            questionModel.answer != null
                ? Container(
                    width: MediaQuery.of(context).size.width - 50,
                    child: Html(data: questionModel.answer, style: {
                      "html": Style(
                        color: Colors.black,
                        fontSize: FontSize.large,
                      )
                    }),
                  )
                : Text('Blank')
          ],
        ),
        showRightOption(questionModel, context)
      ],
    );
  }
}
