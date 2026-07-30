// ignore_for_file: prefer_const_constructors

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../internetConnection/empty_failure_no_internet_view.dart';
import '../../../widgets/myButton.dart';
import '../../../widgets/textFiledContainer.dart';
import '../controllers/login_controller.dart';

class LoginView extends GetView<LoginController> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return SafeArea(
        child: Scaffold(
      body: SingleChildScrollView(
        child: GestureDetector(
          onTap: () => FocusScope.of(context).unfocus(),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Image.asset('assets/splash.png'),
              loginSection(),
            ],
          ),
        ),
      ),
    ));
  }

  loginSection() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        TextFiledContainer(
            controller: _usernameController,
            hintText: 'Name',
            lable: 'User Name',
            obscureText: false,
            prefixIcon: Icons.people),
        TextFiledContainer(
            controller: _passwordController,
            hintText: 'Password',
            lable: 'Password',
            obscureText: true,
            prefixIcon: Icons.lock),
        MyButton(
          onPressed: () {
            //FocusScope.of(context).unfocus();
            controller.getLogin(
                _usernameController.text, _passwordController.text);
          },
          title: 'Login',
        ),
        SizedBox(
          height: 10,
        ),
        Align(
          child: Text('prometricmcqs313@gmail.com',
              style: TextStyle(color: Colors.lightBlue)),
        ),
        Padding(
            padding: const EdgeInsets.all(5.0),
            child: Align(
                alignment: Alignment.center,
                child: InkWell(
                  onTap: () => gotoPrivacyPolicy(),
                  child: Text.rich(
                    TextSpan(children: [
                      TextSpan(
                          text: ' Terms of Services & Privacy Policy',
                          style: TextStyle(color: Colors.lightBlue))
                    ]),
                    textAlign: TextAlign.center,
                    style: TextStyle(height: 1.5),
                  ),
                ))),
      ],
    );
  }

  gotoPrivacyPolicy() {
    Get.toNamed('/privacypolicy');
  }
}
