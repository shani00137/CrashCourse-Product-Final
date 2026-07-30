import 'package:crushapp/app/data/providers/api_Provider.dart';
import 'package:crushapp/app/models/documentverificationModel.dart';
import 'package:flutter/material.dart';

import 'package:get/get.dart';

import '../../../widgets/documentCard.dart';
import '../controllers/documentverification_controller.dart';
import 'uploadFile.dart';

class DocumentverificationView extends GetView<DocumentverificationController> {
  int currentPageIndex = 0;
  int pageCount = 1;
  int pageViewIndex = 0;
  var controller = DocumentverificationController();

  @override
  Widget build(BuildContext context) {
    controller.getDoucmentsDetails();
    return RefreshIndicator(
        onRefresh: _refresh,
        child: SafeArea(
          child: Scaffold(
              appBar: AppBar(
                title: const Text('Document Verification'),
                centerTitle: true,
                backgroundColor: Colors.orange[900],
              ),
              body: Obx(() {
                return ListView.builder(
                    itemCount: controller.documentList.length,
                    itemBuilder: (context, index) {
                      return documentList(controller.documentList[index]);
                    });
              })),
        ));
  }

  Widget documentList(DocumentVerificationMD documentList) {
    String photo = documentList.photo.toString();
    String degree = documentList.degree.toString();
    String matricMarketSheet = documentList.matricMarketSheet.toString();
    String passport = documentList.passport.toString();
    String intermediateMarkSheet =
        documentList.intermediateMarkSheet.toString();
    String goodStandingDocuments =
        documentList.goodStandingDocuments.toString();
    String registrationCertificate =
        documentList.registrationCertificate.toString();
    String experienceCertificate =
        documentList.experienceCertificate.toString();
    String degreeMarkSheet = documentList.degreeMarkSheet.toString();
    String additionalDocuments = documentList.additionalDocuments.toString();
    return Column(
      children: [
        DocumentCard(
          fileUrl: photo,
          onPressed: () {
            uplodFile('Photo');
          },
          title: 'Photo',
        ),
        DocumentCard(
          fileUrl: degree,
          onPressed: () {
            uplodFile('Degree');
          },
          title: 'Degree',
        ),
        DocumentCard(
          fileUrl: passport,
          onPressed: () {
            uplodFile('Passport');
          },
          title: 'Passport',
        ),
        DocumentCard(
          fileUrl: matricMarketSheet,
          onPressed: () {
            uplodFile('Matricsheetdegree');
          },
          title: 'Matric Mark Sheet',
        ),
        DocumentCard(
          fileUrl: intermediateMarkSheet,
          onPressed: () {
            uplodFile('IntermediateMarkSheet');
          },
          title: 'Intermediate MarkSheet',
        ),
        DocumentCard(
          fileUrl: degreeMarkSheet,
          onPressed: () {
            uplodFile('DegreeMarkSheet');
          },
          title: 'DegreeMark Sheet',
        ),
        DocumentCard(
          fileUrl: registrationCertificate,
          onPressed: () {
            uplodFile('RegistrationCertificate');
          },
          title: 'Registration Certificate',
        ),
        DocumentCard(
          fileUrl: experienceCertificate,
          onPressed: () {
            uplodFile('ExperienceCertificate');
          },
          title: 'Experience Certificate',
        ),
        DocumentCard(
          fileUrl: goodStandingDocuments,
          onPressed: () {
            uplodFile('GoodStandingDocuments');
          },
          title: 'Good Standing Documents',
        ),
        DocumentCard(
          fileUrl: additionalDocuments,
          onPressed: () {
            uplodFile('AdditionalDocuments');
          },
          title: 'Additional Documents',
        )
      ],
    );
  }

  uplodFile(String s) {
    Get.toNamed('/uploadFile', arguments: s);
  }

  Future<void> _refresh() async {
    controller.getDoucmentsDetails();
  }
}
