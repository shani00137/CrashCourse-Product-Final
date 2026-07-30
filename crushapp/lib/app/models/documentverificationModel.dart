class DocumentVerificationMD {
  int? applicantId;
  String? photo;
  String? passport;
  String? matricMarketSheet;
  String? degree;
  String? experienceCertificate;
  String? registrationCertificate;
  String? additionalDocuments;
  String? degreeMarkSheet;
  String? intermediateMarkSheet;
  String? goodStandingDocuments;

  DocumentVerificationMD(
      {this.applicantId,
      this.photo,
      this.passport,
      this.matricMarketSheet,
      this.degree,
      this.experienceCertificate,
      this.registrationCertificate,
      this.additionalDocuments,
      this.degreeMarkSheet,
      this.intermediateMarkSheet,
      this.goodStandingDocuments});

  DocumentVerificationMD.fromJson(Map<String, dynamic> json) {
    applicantId = json['ApplicantId'];

    photo = json['Photo'];
    passport = json['Passport'];
    matricMarketSheet = json['MatricMarketSheet'];
    degree = json['Degree'];
    experienceCertificate = json['ExperienceCertificate'];
    registrationCertificate = json['RegistrationCertificate'];
    additionalDocuments = json['AdditionalDocuments'];
    degreeMarkSheet = json['DegreeMarkSheet'];
    intermediateMarkSheet = json['IntermediateMarkSheet'];
    goodStandingDocuments = json['GoodStandingDocuments'];
  }
}
