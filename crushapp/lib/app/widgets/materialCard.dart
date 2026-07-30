import 'package:crushapp/app/models/CourseMaterialMD.dart';
import 'package:crushapp/app/models/courseModel.dart';
import 'package:crushapp/app/models/excerciseModel.dart';
import 'package:flutter/material.dart';
import 'package:flutter/src/foundation/key.dart';
import 'package:flutter/src/widgets/framework.dart';


class MaterialCard extends StatelessWidget {
  MaterialCard({required this.model, required this.onPressed});
  final VoidCallback onPressed;
  final CourseMaterialMD model;

  @override
  Widget build(BuildContext context) {
    return Card(
        child: InkWell(
      onTap: onPressed,
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Container(
          height: 40,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: MediaQuery.of(context).size.width/1.2,
                child: Text(
                  '${model.fileName}',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
              
              Container(child: showMaterialIcon(model))
              
            ],
          ),
        ),
      ),
    ));
  }
  
  showMaterialIcon(CourseMaterialMD model) {
    if(model.materialType=="Video")
    {
      return Icon(Icons.video_call, color: Colors.orange,);
    }
    else if(model.materialType=="PDF")
    {
      return Icon(Icons.picture_as_pdf_outlined , color: Colors.orange);
    }
     else if(model.materialType=="Audio")
    {
      return Icon(Icons.audio_file, color: Colors.orange);
    }
     else if(model.materialType=="MCQS")
    {
      return Icon(Icons.text_format, color: Colors.orange);
    }
  }
}
