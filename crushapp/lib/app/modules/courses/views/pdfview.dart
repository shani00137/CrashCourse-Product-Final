import 'dart:async';

import 'package:advance_pdf_viewer_fork/advance_pdf_viewer_fork.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_cached_pdfview/flutter_cached_pdfview.dart';
import 'package:crushapp/app/models/courseModel.dart';
import 'package:flutter/material.dart';
import 'package:flutter/src/foundation/key.dart';
import 'package:flutter/src/widgets/framework.dart';
import 'package:get/get.dart';
import 'package:flutter_pdfview/flutter_pdfview.dart';
import 'package:get_storage/get_storage.dart';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../data/providers/api_Provider.dart';
import '../../questions/controllers/questions_controller.dart';
import '../controllers/courses_controller.dart';
import 'dart:io';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
class PDFReader extends StatefulWidget {
  @override
  State<PDFReader> createState() => _PDFReaderState();
}

class _PDFReaderState extends State<PDFReader> {
final storage = FlutterSecureStorage();
   String urlPDFPath = "";
  bool exists = true;
  int ? _totalPages = 0;
  int? _currentPage = 0;
  int defaultPage=1;
  bool pdfReady = false;
  late PDFViewController _pdfViewController;
  bool loaded = false;
  @override
  bool _isLoading = true;
  String Url = "";
  var courseModel = Get.arguments;
  int totalPages=0;
  String progressText='Please wait..';
  late PDFDocument document;
  bool _usePDFListView = false;
  @override
  void initState() {
    
  
    super.initState();
    // loadDocument();
     Url = ApiProvide.appBaseUrl + courseModel.courseUrl.toString();
   getFileFromUrl(Url, courseModel.fileName).then(
  (File? value) {
    if (value != null) {
      setState(() {
        urlPDFPath = value.path;
        loaded = true;
        exists = true;
      });
    } else {
      setState(() {
        exists = false;
      });
    }
  },
);

    var courseController=CoursesController();
  defaultPage=courseController.getDefaultPage() as int;
  }


  takePhoto()
async {
  var questionController = QuestionsController();
    var counter = questionController.getcounter();
    if (counter == 25) {
    questionController.fetchScreenShot();
    questionController.reset();
    }
    else{
      questionController.increment();
    }

}


  loadDocument() async {
    // ignore: non_constant_identifier_names
    // Url = ApiProvide.appBaseUrl + courseModel.courseUrl.toString();

    // document = await PDFDocument.fromURL(Url);
    // setState(() => _isLoading = false);
  }
  void _gotoNextPage() {
    if(_totalPages!>_currentPage!)
    {
      int current=_currentPage!;
      
_pdfViewController.setPage(current);
    }
    
  }
//   Future<File> getFileFromUrl(String url, String? name) async {
//   var fileName = name;
//   try {
//     var dir = await getApplicationDocumentsDirectory();
//     File file = File("${dir.path}/$fileName.pdf");

//     // Check if the file already exists
//     // if (await file.exists()) {
//     //   return file;
//     // }

//     // File doesn't exist, start downloading
//     var response = await http.get(Uri.parse(url));
//     var contentLength = response.contentLength ?? -1;

//     // Create a Completer to allow awaiting the completion of the download
//     var completer = Completer<File>();
//     var fileStream = file.openWrite();

//     // Track the download progress manually
//     var receivedBytes = 0.0;
//     response.bodyBytes.forEach((chunk) {
//       fileStream.write(chunk);
//         var isCompleted = false;
//       receivedBytes += chunk.bitLength;

//       // Calculate progress percentage
//       var progress = receivedBytes / contentLength;
//       setState(() {
//         var progressString =
//           'Download progress: ${(progress * 100).toStringAsFixed(2)}%';
//         progressText=progressString;
//       });
//         if (!isCompleted && receivedBytes >= contentLength) {
//         completer.complete(file); // Complete the completer
//         isCompleted = true; // Update the flag to indicate completion
//         fileStream.close(); // Close the stream after completing the completer
//       }
//         if (receivedBytes >= contentLength) {
//         completer.complete(file); // Complete the completer before closing the stream
//         fileStream.close(); // Close the stream after completing the completer
//       }
//       // print('Download progress: ${(progress * 100).toStringAsFixed(2)}%');

//       // Notify listeners about the progress
//       if (receivedBytes >= contentLength) {
//         fileStream.close();
//         completer.complete(file);
//       }
//     });

//     return completer.future;
//   } catch (e) {
//     throw Exception("Error downloading or writing file: $e");
//   }
// }
Future<File?> getFileFromUrl(String url, String fileName) async {

  try {
    var dir = await getApplicationDocumentsDirectory();
    String filePath = "${dir.path}/$fileName.pdf";

    // Check if the file already exists in secure storage
    String? storedFilePath = await storage.read(key: fileName);
    if (storedFilePath != null) {
      return File(storedFilePath);
    }

    // File doesn't exist in secure storage, start downloading
    var dio = Dio();
    await dio.download(url, filePath, onReceiveProgress: (receivedBytes, totalBytes) {
      var progress = receivedBytes / totalBytes;
      var progressString = 'Download in progress: ${(progress * 100).toStringAsFixed(2)}%';
      setState(() {
        progressText=progressString;
      });
    });

    // Save the file path to secure storage
    await storage.write(key: fileName, value: filePath);

    return File(filePath);
  } catch (e) {
    throw Exception("Error downloading or writing file: $e");
  }
}
   void requestPersmission() async {
   final status = await Permission.storage.request();
  }
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text('${courseModel.fileName}'),
          centerTitle: true,
          backgroundColor: Colors.orange[900],
          actions: [
           Padding(
             padding: const EdgeInsets.symmetric(vertical: 10,horizontal: 5),
             child: Text('Page $_currentPage'+' of '+'$_totalPages' ),
           )
          ],
          
        ),
         floatingActionButton: FloatingActionButton(
        onPressed: () {
          _gotoNextPage();
        },
        child: Icon(Icons.arrow_downward, color: Colors.white, size: 29,),
        backgroundColor:Colors.orange,
        tooltip: 'Go to Next Page',
        elevation: 5,
        splashColor: Colors.orange[900],
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
        body:loaded==false? Center(child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            CircularProgressIndicator( // Circular progress indicator
              valueColor: AlwaysStoppedAnimation<Color>(Colors.orange), // Set color to orange
            ),
            SizedBox(height: 20,),
            Text('$progressText'),
              SizedBox(height: 20,),
               Text('Please dont back or close application', style: TextStyle(color: Colors.red),),
          ],
        ),): PDFView(
          filePath: urlPDFPath,
          autoSpacing: true,
          enableSwipe: true,
          pageSnap: true,
          swipeHorizontal: false,
          nightMode: false,
        pageFling: true,
        fitEachPage: true,
        fitPolicy: FitPolicy.BOTH,
        
          onError: (e) {
            //Show some error message or UI
          },
           onPageChanged: (int? page, int? total) {
            setState(() {
              int? count = page;
               var courseController = CoursesController();
              courseController.setDefaultPage(page);
              _currentPage=count!+1;
              takePhoto();
            });
          },
          onRender: (_pages) {
            setState(() {
              _totalPages = _pages;
              pdfReady = true;
            });
          },
          onViewCreated: (PDFViewController vc) {
            setState(() {
              _pdfViewController = vc;
              
       
            });
          },
          defaultPage: defaultPage,
         
          onPageError: (page, e) {},
        ));
  }
  
 
}


