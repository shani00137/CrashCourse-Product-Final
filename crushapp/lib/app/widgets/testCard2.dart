// ignore_for_file: unnecessary_brace_in_string_interps

import 'package:crushapp/app/models/testhistorymodel.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/src/foundation/key.dart';
import 'package:flutter/src/widgets/framework.dart';
import 'package:intl/intl.dart';
import 'package:percent_indicator/percent_indicator.dart';

import 'lineProgresschart.dart';

class TestCard2 extends StatelessWidget {
  const TestCard2({required this.data, required this.onPressed});
  final TestHistoryModel data;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    String formattedDate = DateFormat('dd-MMM-yyyy')
        .format(DateTime.parse(data.testDate.toString()));
    String startTestDate = DateFormat('dd-MMM-yyyy')
        .format(DateTime.parse(data.testStartTime.toString()));
    return Padding(
        padding: const EdgeInsets.all(8.0),
        child: Card(
          elevation: 5,
          shadowColor: Colors.orange[700],
          child: InkWell(
              onTap: onPressed,
              child: Container(
                color: Colors.transparent,
                height: 150,
                width: MediaQuery.of(context).size.width,
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${data.courseName}',
                            style: TextStyle(
                                fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            '${formattedDate}',
                            style: TextStyle(fontSize: 12, color: Colors.grey),
                          )
                        ],
                      ),
                      SizedBox(
                        height: 15,
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Questions: ${data.questions}',
                            style: TextStyle(fontSize: 14),
                          ),
                          Text(
                            'Duration: ${data.duration}',
                            style: TextStyle(fontSize: 14),
                          ),
                          data.isCompleted.toString() == "true"
                              ? Text(
                                  'Completed',
                                  style: TextStyle(color: Colors.green),
                                )
                              : Text('Pending',
                                  style: TextStyle(color: Colors.red)),
                        ],
                      ),
                      SizedBox(
                        height: 15,
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Remarks: ${data.remarks}',
                            style: TextStyle(fontSize: 14),
                          ),
                          Text(
                            'Test Take on: ${startTestDate}',
                            style: TextStyle(fontSize: 14),
                          ),
                        ],
                      ),
                      SizedBox(
                        height: 20,
                      ),
                      LineProgressChart(data: data),
                    ],
                  ),
                ),
              )),
        ));
  }

  getPercentage() {
    double percentage = double.parse(data.rightQuestions.toString()) /
        double.parse(data.questions.toString()) /
        100;
    return Text(
      '$percentage%',
      style: new TextStyle(fontSize: 10.0, color: Colors.white),
    );
  }
}
