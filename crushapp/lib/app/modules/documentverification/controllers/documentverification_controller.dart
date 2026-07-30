import 'dart:io';

import 'package:crushapp/app/models/documentverificationModel.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';

import '../../../data/providers/api_Provider.dart';
import '../../../helper/basecontroller.dart';
import '../../../utilites/toasMessage.dart';
import '../../../widgets/myButton.dart';

class DocumentverificationController extends GetxController
    with BaseController {
  //TODO: Implement DocumentverificationController

  RxList<DocumentVerificationMD> documentList = <DocumentVerificationMD>[].obs;
  final count = 0.obs;
  RxBool isLoading = false.obs;
  @override
  void onInit() {
    super.onInit();
  }

  @override
  void onReady() {
    super.onReady();
  }

  @override
  void onClose() {
    super.onClose();
  }

  getDoucmentsDetails() async {
    isLoading.value = true;
    isLoading.refresh();
    Future.delayed(Duration(seconds: 1), () {
      try {
        final box = GetStorage();
        var token = box.read('token');
        showLoading('Fetch Doucments');

        ApiProvide().fetchDocumentVerificationByUser(token[5]).then((value) {
          documentList.value = value;
          documentList.refresh();
          isLoading.value = false;
          hideLoading();
        }, onError: (err) {
          handleError(err);
        });
      } catch (exception) {
        handleError(exception);
        hideLoading();
        reLoginRequest();
      }
    });
  }

  void reLoginRequest() {
    Get.dialog(
        barrierDismissible: false,
        Dialog(
          child: Container(
            height: 150,
            child: Padding(
              padding: const EdgeInsets.all(10.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Login',
                      style:
                          TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  SizedBox(
                    height: 5,
                  ),
                  Text(
                    'Dear Applicant you requred to re-login..',
                    style: TextStyle(height: 1.5, fontSize: 14),
                  ),
                  MyButton(
                      onPressed: () {
                        _logoutUser();
                      },
                      title: 'Ok')
                ],
              ),
            ),
          ),
        ));
  }

  void _logoutUser() {
    final box = GetStorage();
    box.remove('token');
    box.remove('isLogin');
    Get.offAllNamed('/login');
  }

  uploadPhoto(File file, String fileName) async {
    try {
      showLoading('Uploading');
      final box = GetStorage();
      var token = box.read('token');
      var name = file.path.split('/').last;
      var modiyName = fileName + "_" + name;
      ApiProvide().saveDocumentVersifications(file, token[5], modiyName).then(
          (value) {
        hideLoading();
        ToastMessage.displayToast(value);
        goBack();
        // Get.offAndToNamed('/documentverification');
        // Get.offNamedUntil('/documentverification', (route) => false);
      }, onError: (err) {
        handleError(err);
      });
    } catch (exception) {
      handleError(exception);
      hideLoading();
    }
  }

  void increment() => count.value++;
  void goBack() {
    Get.back();
    Future.delayed(Duration(seconds: 1), () {
      getDoucmentsDetails();
    });
  }
}
