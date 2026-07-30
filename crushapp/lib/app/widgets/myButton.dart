import 'package:flutter/material.dart';

// ignore: must_be_immutable
class MyButton extends StatelessWidget {
  @required
  VoidCallback onPressed;
  @required
  String title;

  MyButton({
    required this.onPressed,
    required this.title,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      child: Container(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 50,
              width: MediaQuery.of(context).size.width,
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(5), color: Colors.white),
              child: MaterialButton(
                color: Colors.red[600],
                child: Text(
                  '$title',
                  style: TextStyle(color: Colors.white),
                ),
                onPressed: onPressed,
              ),
            )
          ],
        ),
      ),
    );
  }
}
