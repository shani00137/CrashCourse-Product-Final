import 'package:crushapp/app/models/testhistorymodel.dart';
import 'package:flutter/material.dart';
import 'package:percent_indicator/linear_percent_indicator.dart';

class LineProgressChart extends StatelessWidget {
  const LineProgressChart({required this.data});
  final TestHistoryModel data;

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Row(
        children: [
          new LinearPercentIndicator(
            width: MediaQuery.of(context).size.width - 80,
            lineHeight: 3.0,
            animation: true,
            animationDuration: 2000,
            trailing: Text('${data.rightQuestions}/' '${data.questions}'),
            percent: _getPercentage(double.parse(data.questions.toString()),
                double.parse(data.rightQuestions.toString())),
            backgroundColor: Colors.grey[200],
            progressColor: _color(double.parse(data.questions.toString()),
                double.parse(data.rightQuestions.toString())),
          ),
        ],
      ),
    );
  }

  double _getPercentage(double? debit, double? credit) {
    double response = 0;
    try {
      if (debit != null && credit != null) {
        String value = "";

        double percentage = credit / debit * 100;
        if (percentage == 100) {
          value = (percentage.round() - 1).toString();
        } else {
          value = (percentage.round()).toString();
        }

        value = "0." + value;
        response = double.parse(value);
      } else {
        response = 0;
      }
      return response;
    } catch (e) {
      response = 0;
    }
    return response;
  }

  Color _color(double debit, double credit) {
    Color selectedColor = Colors.blue;
    try {
      int percentage = (credit / debit * 100).round();
      if (percentage == 0.0) {
        selectedColor = Colors.red;
      }
      if (percentage >= 1 && percentage <= 20) {
        selectedColor = Colors.orange;
      }
      if (percentage >= 21 && percentage <= 30) {
        selectedColor = Colors.deepOrange;
      }
      if (percentage >= 31 && percentage <= 40) {
        selectedColor = Colors.blue;
      }
      if (percentage >= 41 && percentage <= 50) {
        selectedColor = Colors.blue;
      }
      if (percentage >= 51 && percentage <= 70) {
        selectedColor = Colors.lightGreen;
      }
      if (percentage >= 71 && percentage <= 90) {
        return Colors.green;
      }
      if (percentage >= 91 && percentage <= 100) {
        selectedColor = Colors.green;
      }
      if (percentage == 100) {
        selectedColor = Colors.green;
      }
      if (percentage > 100) {
        selectedColor = Colors.green;
      }
    } catch (e) {}

    return selectedColor;
  }
}
