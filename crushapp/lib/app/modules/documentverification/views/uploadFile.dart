import 'dart:io';

import 'package:crushapp/app/widgets/myButton.dart';
import 'package:flutter/material.dart';
import 'package:flutter/src/foundation/key.dart';
import 'package:flutter/src/widgets/framework.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

import '../controllers/documentverification_controller.dart';

class uploadFile extends StatefulWidget {
  uploadFile({Key? key}) : super(key: key);

  @override
  State<uploadFile> createState() => _uploadFileState();
}

class _uploadFileState extends State<uploadFile> {
  final ImagePicker _picker = ImagePicker();
  var _image;
  String fileName = "";
  var title = Get.arguments;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('$title'),
        centerTitle: true,
        backgroundColor: Colors.orange[900],
      ),
      body: ListView(
        shrinkWrap: true,
        children: [
          _image != null
              ? Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Image.file(
                    _image,
                  ),
                )
              : GestureDetector(
                  onTap: () => _getFromGallery(),
                  child: Card(
                      child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Container(
                      decoration: BoxDecoration(color: Colors.grey[200]),
                      width: 250,
                      height: 400,
                      child: Icon(
                        Icons.image_search_rounded,
                        size: 100,
                        color: Colors.orange[800],
                      ),
                    ),
                  ))),
          MyButton(
              onPressed: () {
                _uploadFile();
              },
              title: 'Upload')
        ],
      ),
    );
  }

  _getFromGallery() async {
    // ignore: deprecated_member_use
    XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    setState(() {
      _image = File(image!.path);
    });
  }

  void _uploadFile() {
    if (_image != null) {
      var controller = DocumentverificationController();
      controller.uploadPhoto(_image, '$title');
    }
  }
}
