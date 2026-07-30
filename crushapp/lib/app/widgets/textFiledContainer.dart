import 'package:flutter/material.dart';

// ignore: must_be_immutable
class TextFiledContainer extends StatelessWidget {
  @required
  TextEditingController controller;
  @required
  String hintText;
  @required
  String lable;
  bool obscureText;
  final IconData prefixIcon;
  TextFiledContainer(
      {required this.controller,
      required this.hintText,
      required this.lable,
      required this.prefixIcon,
      required this.obscureText});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      child: Container(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '$lable',
              style: TextStyle(),
            ),
            SizedBox(
              height: 10,
            ),
            Container(
              height: 50,
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(5),
                  color: (Colors.grey[200]!)),
              child: TextField(
                controller: controller,
                obscureText: obscureText,
                decoration: InputDecoration(
                    enabledBorder: OutlineInputBorder(
                      borderSide:
                          BorderSide(width: 0, color: Colors.transparent),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(5),
                      borderSide: BorderSide(width: 0),
                    ),
                    hintText: '$hintText',
                    fillColor: Colors.red,
                    hintStyle: TextStyle(color: Colors.grey),
                    prefixIcon: Icon(prefixIcon,
                        color: Theme.of(context).primaryColor)),
              ),
            )
          ],
        ),
      ),
    );
  }
}
