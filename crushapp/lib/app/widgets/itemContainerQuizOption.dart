import 'package:crushapp/app/modules/taketest/controllers/taketest_controller.dart';

import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:get/get.dart';

class ItemContainerQuizOption extends StatelessWidget {
  final String title;
  final bool isRight;
  ItemContainerQuizOption({required this.title, required this.isRight});
  final TaketestController quizController = Get.put(TaketestController());
  @override
  Widget build(BuildContext context) {
    return GetBuilder<TaketestController>(
        init: TaketestController(), // INIT IT ONLY THE FIRST TIME
        builder: (_) => Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(10),
              child: isRight == true
                  ? Container(
                      height: 50,
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(15),
                          color: Colors.green[100]!,
                          border: Border.all(color: Colors.green)),
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Row(
                          children: [
                            Expanded(
                                child: Html(data: title, style: {
                              "html": Style(
                                  fontSize: FontSize.medium,
                                  textOverflow: TextOverflow.ellipsis,
                                  color: Colors.black)
                            })),
                            Icon(
                              Icons.check,
                              size: 25,
                            ),
                          ],
                        ),
                      ))
                  : Container(
                      height: 50,
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(15),
                          color: Colors.red[100]!,
                          border: Border.all(color: Colors.red)),
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Row(
                          children: [
                            Expanded(
                                child: Html(data: title, style: {
                              "html": Style(
                                  fontSize: FontSize.medium,
                                  textOverflow: TextOverflow.ellipsis,
                                  color: Colors.black)
                            })),
                            Icon(
                              Icons.cancel_outlined,
                              size: 25,
                            ),
                          ],
                        ),
                      )),
            )));
  }
}
