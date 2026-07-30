import 'package:crushapp/app/models/courseModel.dart';
import 'package:flutter/material.dart';
import 'package:flutter/src/foundation/key.dart';
import 'package:flutter/src/widgets/framework.dart';


class CourseCard extends StatelessWidget {
  CourseCard(
      {required this.model, required this.onPressed, required this.onViewPDF});
  final VoidCallback onPressed;
  final VoidCallback onViewPDF;
  final CourseModel model;

  @override
  Widget build(BuildContext context) {
    return Card(
        child: InkWell(
      onTap: onPressed,
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              width: MediaQuery.of(context).size.width / 1.8,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${model.courseName}',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    overflow: TextOverflow.clip,
                  ),
                  SizedBox(
                    height: 5,
                  ),
                  Text(
                    'Questions : ${model.questions}',
                    style: TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                  SizedBox(
                    height: 5,
                  ),
                ],
              ),
            ),
            Icon(
              Icons.arrow_forward_ios
            )
          ],
        ),
      ),
    ));
  }
}
