import 'package:crushapp/app/widgets/myButton.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class DialogHelper {
  //show error dialog
  static void showErroDialog(
      {String title = 'Error', String? description = 'Something went wrong'}) {
    Get.dialog(
       barrierDismissible: false,
      Dialog(
        
        child: Container(
          height: 200,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(
                  title,
                  style: Get.textTheme.headline6,
                ),
                SizedBox(
                  height: 10,
                ),
                Text(
                  description ?? '',
                  style: Get.textTheme.headline6,
                ),
                SizedBox(
                  height: 10,
                ),
                MyButton(
                    onPressed: () {
                      if (Get.isDialogOpen!) Get.back();
                    },
                    title: 'Ok')
              ],
            ),
          ),
        ),
      ),
    );
  }

  //show toast
  //show snack bar
  //show loading
  static void showLoading([String? message]) {
    Get.dialog(
      Dialog(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Row(
            children: [
              CircularProgressIndicator(
                strokeWidth: 2.0,
                color: Colors.orange[900],
              ),
              SizedBox(width: 20),
              Text(message ?? 'Loading...'),
            ],
          ),
        ),
      ),
    );
  }

  //hide loading
  static void hideLoading() {
    if (Get.isDialogOpen!) Get.back();
  }
}
