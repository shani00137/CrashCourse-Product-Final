import 'package:badges/badges.dart';
import 'package:chat_bubbles/bubbles/bubble_special_three.dart';
import 'package:crushapp/app/models/applicantModel.dart';
import 'package:crushapp/app/models/chatModel.dart';

import 'package:flutter/material.dart';

import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';

import '../controllers/chat_controller.dart';

class ChatApplicantView extends GetView<ChatController> {
  var chatController = ChatController();
  @override
  Widget build(BuildContext context) {
    chatController.getApplicants();
    return Scaffold(
        appBar: AppBar(
          title: Text('Applicants'),
          backgroundColor: Colors.orange,
          centerTitle: true,
        ),
        body: Obx(
          (() => ListView.builder(
              shrinkWrap: true,
              itemCount: chatController.applicantList.length,
              itemBuilder: (context, index) {
                return applicantWidget(
                    chatController.applicantList[index], context);
              })),
        ));
  }

  Widget applicantWidget(ApplicantModel model, BuildContext context) {
    return Card(
        child: InkWell(
      onTap: (() => gotoChat(model)),
      child: ListTile(
          title: Text(
            '${model.firstName}' + ' ' + '${model.lastName}',
            style: TextStyle(fontSize: 16),
          ),
          subtitle: Text('${model.course}'),
          trailing: Container(
            height: 25,
            width: 25,
            decoration: BoxDecoration(
                color: Colors.red, borderRadius: BorderRadius.circular(100)),
            child: Center(
                child: Text(
              '${model.message}',
              style: TextStyle(color: Colors.white),
            )),
          )),
    ));
  }

  gotoChat(model) {
    chatController.setAppUser(model.appUserid);
    chatController.seenMessage();
    Get.toNamed('/chat', arguments: model);
  }
}
