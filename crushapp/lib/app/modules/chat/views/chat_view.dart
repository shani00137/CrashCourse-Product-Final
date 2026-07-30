import 'package:chat_bubbles/bubbles/bubble_special_three.dart';
import 'package:crushapp/app/models/applicantModel.dart';
import 'package:crushapp/app/models/chatModel.dart';

import 'package:flutter/material.dart';

import 'package:get/get.dart';

import '../controllers/chat_controller.dart';

class ChatView extends GetView<ChatController> {
  final _chatInputText = TextEditingController();
  var chatController = ChatController();
  ScrollController _scrollController = new ScrollController();
  var model = Get.arguments;
  @override
  Widget build(BuildContext context) {
    chatController.initFirbaseNotification();
    chatController.getChatMessage();
    chatController.moveScroll();
    return Scaffold(
      appBar: AppBar(
        title: Text('${model.firstName}' + ' ' + '${model.lastName}'),
        backgroundColor: Colors.orange,
        centerTitle: true,
      ),
      body: Obx(() => Column(children: [
            Expanded(
                child: ListView.builder(
                    shrinkWrap: true,
                    controller: chatController.scrollController,
                    itemCount: chatController.chatList.length,
                    itemBuilder: (context, index) {
                      return chatWidget(
                          chatController.chatList[index], context);
                    })),
            Container(
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                          controller: _chatInputText,
                          decoration: InputDecoration(
                            contentPadding: EdgeInsets.symmetric(
                                vertical: 10, horizontal: 5),
                            enabledBorder: OutlineInputBorder(
                              borderSide:
                                  BorderSide(width: 1, color: Colors.orange),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(5),
                              borderSide:
                                  BorderSide(width: 1, color: Colors.orange),
                            ),
                            hintText: 'Message',
                            fillColor: Colors.red,
                            hintStyle: TextStyle(color: Colors.orange),
                          )),
                    ),
                    IconButton(
                        onPressed: () {
                          chatController.sendchattMessage(
                              _chatInputText.text, model);
                          _chatInputText.text = "";
                        },
                        icon: Icon(
                          Icons.send,
                          color: Colors.orange,
                        ))
                  ],
                ),
              ),
            ),
          ])),
    );
  }

  void _moveScroll() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        curve: Curves.easeOut,
        duration: const Duration(milliseconds: 300),
      );
    }
  }

  Widget chatWidget(ChatModel chatModel, context) {
    return Padding(
      padding: const EdgeInsets.all(4.0),
      child: Container(
          width: MediaQuery.of(context).size.width,
          child: BubbleSpecialThree(
            text: '${chatModel.message}',
            color: chatModel.isSender ? Colors.orange : Colors.grey,
            isSender: chatModel.isSender,
            textStyle: TextStyle(color: Colors.white, fontSize: 18),
          )),
    );
  }
}
