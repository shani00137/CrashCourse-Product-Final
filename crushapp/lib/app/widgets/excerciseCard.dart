import 'package:crushapp/app/models/courseModel.dart';
import 'package:crushapp/app/models/excerciseModel.dart';
import 'package:flutter/material.dart';
import 'package:flutter/src/foundation/key.dart';
import 'package:flutter/src/widgets/framework.dart';


class ExerciseCard extends StatelessWidget {
  ExerciseCard({required this.model, required this.onPressed});
  final VoidCallback onPressed;
  final ExcerciseModel model;

  @override
  Widget build(BuildContext context) {
    return Card(
        child: InkWell(
      onTap: onPressed,
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${model.exercise}',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(
              height: 5,
            ),
            Text(
              'Questions : ${model.startFrom} to ${model.endFrom}',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            )
          ],
        ),
      ),
    ));
  }
}
