import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

import '../widgets/rounded_elevated_button.dart';


class EmptyFailureNoInternetView extends StatelessWidget {
  EmptyFailureNoInternetView(
      {required this.title,
      required this.description,
      required this.buttonText,
      required this.onPressed});

  final String title, description, buttonText;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(left: 16, right: 16),
      child: Center(
        child: SingleChildScrollView(
          child: Column(
            children: [
              Lottie.asset(
                'assets/nointernet.json',
                height: 250,
                width: 250,
              ),
              SizedBox(
                height: 10,
              ),
              Text(
                title,
                style: TextStyle(fontSize: 16, color: Colors.black),
              ),
              SizedBox(
                height: 4,
              ),
              Text(description,
                  style: TextStyle(fontSize: 14, color: Colors.black)),
              SizedBox(
                height: 8,
              ),
              RoundedElevatedButton(
                width: 200,
                onPressed: onPressed,
                childText: buttonText,
              )
            ],
          ),
        ),
      ),
    );
  }
}
