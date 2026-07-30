import 'package:crushapp/app/widgets/myButton.dart';
import 'package:flutter/material.dart';

import 'package:get/get.dart';

import '../controllers/security_controller.dart';

class SecurityView extends GetView<SecurityController> {
  @override
  var securtyCountroller = SecurityController();
  Widget build(BuildContext context) {
    securtyCountroller.getNotificationStatus();
    return Scaffold(
        appBar: AppBar(
          title: Text('Setting'),
          backgroundColor: Colors.orange[900],
          centerTitle: true,
        ),
        body: Obx(
          () => Padding(
            padding: const EdgeInsets.all(8.0),
            child: ListView(
              children: [
                SizedBox(
                  height: 10,
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Text(
                          'Notifications',
                          style: TextStyle(fontSize: 15),
                        )
                      ],
                    ),
                    Switch(
                      value: securtyCountroller.isSwitched.value,
                      onChanged: (value) {
                        securtyCountroller.notificationPermissionChange(value);
                      },
                      activeTrackColor: Colors.lightBlue,
                      activeColor: Colors.blue,
                    ),
                  ],
                ),
                SizedBox(
                  height: 50,
                ),
                MyButton(
                    onPressed: () {
                      securtyCountroller.logout();
                    },
                    title: 'Logout')
              ],
            ),
          ),
        ));
  }
}
