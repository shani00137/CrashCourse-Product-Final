import 'package:flutter/material.dart';
import 'package:flutter/src/foundation/key.dart';
import 'package:flutter/src/widgets/framework.dart';

import '../data/providers/api_Provider.dart';

class DocumentCard extends StatelessWidget {
  VoidCallback onPressed;
  String fileUrl;
  String title;
  DocumentCard(
      {required this.onPressed, required this.fileUrl, required this.title});

  @override
  Widget build(BuildContext context) {
    return Card(
        child: InkWell(
            onTap: onPressed,
            child: ListTile(
              leading: fileUrl == "null"
                  ? Icon(
                      Icons.question_mark_outlined,
                      size: 32,
                    )
                  : ClipOval(
                      child: Image.network(
                      ApiProvide.appBaseUrl + fileUrl,
                      fit: BoxFit.cover,
                      width: 60.0,
                      height: 70.0,
                    )),
              title: Text('$title'),
              trailing: fileUrl == "null"
                  ? Icon(
                      Icons.cancel,
                      color: Colors.red,
                    )
                  : Icon(
                      Icons.check,
                      color: Colors.green,
                    ),
            )));
  }
}
