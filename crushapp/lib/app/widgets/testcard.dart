// ignore_for_file: unnecessary_brace_in_string_interps

import 'package:crushapp/app/models/testhistorymodel.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/src/foundation/key.dart';
import 'package:flutter/src/widgets/framework.dart';
import 'package:intl/intl.dart';

class TestCard extends StatelessWidget {
  const TestCard({required this.data, required this.onPressed});
  final TestHistoryModel data;
  final VoidCallback onPressed;
  @override
  Widget build(BuildContext context) {
    String formattedDate = DateFormat('dd-MMM-yyyy')
        .format(DateTime.parse(data.testDate.toString()));
    return Padding(
        padding: const EdgeInsets.all(8.0),
        child: Container(
          height: 80,
          width: MediaQuery.of(context).size.width,
          child: InkWell(
              onTap: onPressed,
              child: Card(
                shadowColor: Colors.orange[700],
                elevation: 5,
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
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
                        height: 10,
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Questions: ${data.questions}',
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
                      )
                    ],
                  ),
                ),
              )),
        ));
  }
}
