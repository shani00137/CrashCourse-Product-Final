

import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';

import '../models/questionmodel.dart';

class ShowQuestionRightOption extends StatelessWidget {
  QuestionModel questionModel;
   ShowQuestionRightOption({required this.questionModel});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.all(10),
      child: Column(
      children: [
       
          SizedBox(
            width: 2,
          ),
          showSelectedOption(questionModel,context),
              SizedBox(
            width: 5,
          ),
          questionModel.isSelected!=int.parse(questionModel.rightOption) ?
            showCorrectOption(questionModel,context):Container()
      ],
    ),
    );
  }
  
  showSelectedOption(QuestionModel,BuildContext context) {
    if(questionModel.isSelected==1)
    {
      return  Container(
        
        child: Row(
            children: [
                 questionModel.isSelected ==int.parse(questionModel.rightOption)
                  ? Icon(
                      Icons.radio_button_checked,
                      color: Colors.green,
                    )
                  : Icon(
                      Icons.cancel_outlined,
                      color: Colors.red,
                    ),
              Expanded(
                
                   
                    child: Html(data: questionModel.option1, style: {
                      "html": Style(
                        color: Colors.black,
                        fontSize: FontSize.large,
                      )
                    }),
                  ),
            ],
          
        ),
      );
    }
    else if(questionModel.isSelected==2)
    {
  return Row(
    children: [
         questionModel.isSelected ==int.parse(questionModel.rightOption)
              ? Icon(
                  Icons.radio_button_checked,
                  color: Colors.green,
                )
              : Icon(
                  Icons.cancel_outlined,
                  color: Colors.red,
                ),
      Container(
                width: MediaQuery.of(context).size.width/1.3,
               
                child: Html(data: questionModel.option2, style: {
                  "html": Style(
                    color: Colors.black,
                    fontSize: FontSize.large,
                  )
                }),
              ),
    ],
  );
    }
    else if(questionModel.isSelected==3)
    {
        return Row(
          
          children: [
               questionModel.isSelected ==int.parse(questionModel.rightOption)
              ? Icon(
                  Icons.radio_button_checked,
                  color: Colors.green,
                )
              : Icon(
                  Icons.cancel_outlined,
                  color: Colors.red,
                ),
            Container(
                width: MediaQuery.of(context).size.width/1.3,
               
                child: Html(data: questionModel.option3, style: {
                  "html": Style(
                    color: Colors.black,
                    fontSize: FontSize.large,
                  )
                }),
              ),
          ],
        );
    }
    else if(questionModel.isSelected==4)
    {
        return Row(
          children: [
               questionModel.isSelected ==int.parse(questionModel.rightOption)
              ? Icon(
                  Icons.radio_button_checked,
                  color: Colors.green,
                )
              : Icon(
                  Icons.cancel_outlined,
                  color: Colors.red,
                ),
            Container(
                width: MediaQuery.of(context).size.width/1.3,
               
                child: Html(data: questionModel.option4, style: {
                  "html": Style(
                    color: Colors.black,
                    fontSize: FontSize.large,
                  )
                }),
              ),
          ],
        );
    }
  }
  
  showCorrectOption(QuestionModel questionModel, BuildContext context) {
      if(int.parse( questionModel.rightOption)==1)
    {
      return Container(
        child: Row(
          children: [
                Icon(
                    Icons.radio_button_checked,
                    color: Colors.green,
                  ),
               
            Container(
                  width: MediaQuery.of(context).size.width/1.3,
                 
                  child: Html(data: questionModel.option1, style: {
                    "html": Style(
                      color: Colors.black,
                      fontSize: FontSize.large,
                    )
                  }),
                ),
          ],
        ),
      );
    }
     else  if(int.parse( questionModel.rightOption)==2)
    {
      return Container(
        child: Row(
          children: [
                Icon(
                    Icons.radio_button_checked,
                    color: Colors.green,
                  ),
               
            Container(
                  width: MediaQuery.of(context).size.width/1.3,
                 
                  child: Html(data: questionModel.option2, style: {
                    "html": Style(
                      color: Colors.black,
                      fontSize: FontSize.large,
                    )
                  }),
                ),
          ],
        ),
      );
    }
     else  if(int.parse( questionModel.rightOption)==3)
    {
      return Row(
        children: [
              Icon(
                  Icons.radio_button_checked,
                  color: Colors.green,
                ),
             
          Container(
                width: MediaQuery.of(context).size.width/1.3,
               
                child: Html(data: questionModel.option3, style: {
                  "html": Style(
                    color: Colors.black,
                    fontSize: FontSize.large,
                  )
                }),
              ),
        ],
      );
    }
     else  if(int.parse( questionModel.rightOption)==4)
    {
      return Container(
        child: Row(
          children: [
                Icon(
                    Icons.radio_button_checked,
                    color: Colors.green,
                  ),
               
            Container(
                  width: MediaQuery.of(context).size.width/1.3,
                 
                  child: Html(data: questionModel.option4, style: {
                    "html": Style(
                      color: Colors.black,
                      fontSize: FontSize.large,
                    )
                  }),
                ),
          ],
        ),
      );
    }
    
  }
}

     