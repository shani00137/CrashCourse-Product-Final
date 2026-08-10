import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:crushapp/app/models/applicantModel.dart';
import 'package:crushapp/app/models/chatModel.dart';
import 'package:crushapp/app/models/courseModel.dart';
import 'package:crushapp/app/models/excerciseModel.dart';
import 'package:crushapp/app/models/questionmodel.dart';
import 'package:crushapp/app/models/testhistorymodel.dart';
import 'package:get_storage/get_storage.dart';
import 'package:http/http.dart' as http;
import '../../helper/applicaitonexceptions.dart';
import '../../models/CourseMaterialMD.dart';
import '../../models/documentverificationModel.dart';
import '../../models/loginModel.dart';

class ApiProvide {
  static String appBaseUrl = "https://crashcourseonlin.net/";

  Map<String, String>? _authHeaders() {
    final box = GetStorage();
    final jwt = box.read('jwt')?.toString().trim() ?? '';
    if (jwt.isEmpty) return null;
    return {'Authorization': 'Bearer $jwt'};
  }

  Future<http.Response> _get(Uri url) {
    return http
        .get(url, headers: _authHeaders())
        .timeout(const Duration(seconds: 60));
  }

  Future<http.Response> _post(Uri url, dynamic body) {
    return http
        .post(url, body: body, headers: _authHeaders())
        .timeout(const Duration(seconds: 60));
  }

  Future<List<LoginModel>> getchLoginInformation(data) async {
    var responseJson = "";
    try {
      var url = Uri.parse('${appBaseUrl}api/login/AppUserDetails');

      var response = await _post(url, data);
      if (response.statusCode == 200) {
        responseJson = response.body;
        return (json.decode(response.body) as List)
            .map((data) => LoginModel.fromJson(data))
            .toList();
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    return jsonDecode(responseJson);
  }

  Future<void> updateUserToken(data) async {
    var responseJson = "";
    try {
      var url = Uri.parse('${appBaseUrl}api/AppUser/UpdateToken');

      var response =
          await _post(url, data);
      if (response.statusCode == 200) {
        responseJson = response.body;
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    return jsonDecode(responseJson);
  }

  Future<List<TestHistoryModel>> fetchUserTestHistory(id) async {
    var responseJson = "";
    try {
      var url = Uri.parse('${appBaseUrl}api/TakeTest/GetTestHistory/$id');

      var response = await _get(url);
      if (response.statusCode == 200) {
        responseJson = response.body;
        return (json.decode(response.body) as List)
            .map((data) => TestHistoryModel.fromJson(data))
            .toList();
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    return jsonDecode(responseJson);
  }

  Future<List<CourseModel>> fetchApplicantCourses(id) async {
    var responseJson = "";
    try {
      var url = Uri.parse('${appBaseUrl}api/Applicant/GetApplicantCourses/$id');

      var response = await _get(url);
      if (response.statusCode == 200) {
        responseJson = response.body;
        return (json.decode(response.body) as List)
            .map((data) => CourseModel.fromJson(data))
            .toList();
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    return jsonDecode(responseJson);
  }

    Future<List<CourseMaterialMD>> fetchCourseMaterial(id) async {
    var responseJson = "";
    try {
      var url = Uri.parse('${appBaseUrl}api/Course/GetCourseMaterial/$id');

      var response = await _get(url);
      if (response.statusCode == 200) {
        responseJson = response.body;
        return (json.decode(response.body) as List)
            .map((data) => CourseMaterialMD.fromJson(data))
            .toList();
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    return jsonDecode(responseJson);
  }

  Future<List<ExcerciseModel>> fetchExercise() async {
    var responseJson = "";
    try {
      var url = Uri.parse('${appBaseUrl}api/Course/GetAllExercise');

      var response = await _get(url);
      if (response.statusCode == 200) {
        responseJson = response.body;
        return (json.decode(response.body) as List)
            .map((data) => ExcerciseModel.fromJson(data))
            .toList();
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    return jsonDecode(responseJson);
  }

  Future<List<ApplicantModel>> fetchApplicant() async {
    var responseJson = "";
    try {
      var url = Uri.parse('${appBaseUrl}api/AppUser/GetActiveAppUser');

      var response = await _get(url);
      if (response.statusCode == 200) {
        responseJson = response.body;
        return (json.decode(response.body) as List)
            .map((data) => ApplicantModel.fromJson(data))
            .toList();
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    return jsonDecode(responseJson);
  }

  Future<List<TestHistoryModel>> fetchuserTestresults(id) async {
    var responseJson = "";
    try {
      var url = Uri.parse('${appBaseUrl}api/TakeTest/GetAppUserTestResult/$id');

      var response = await _get(url);
      if (response.statusCode == 200) {
        responseJson = response.body;
        return (json.decode(response.body) as List)
            .map((data) => TestHistoryModel.fromJson(data))
            .toList();
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    return jsonDecode(responseJson);
  }

  Future<String> fetchPendingExamCount(id) async {
    var responseJson = "";
    try {
      var url = Uri.parse('${appBaseUrl}api/AppUser/UserPendingExamCount/$id');

      var response = await _get(url);
      if (response.statusCode == 200) {
        responseJson = response.body;
        return responseJson;
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    return jsonDecode(responseJson);
  }

  Future<String> fetchUserExpiry(id) async {
    var responseJson = "";
    try {
      var url = Uri.parse('${appBaseUrl}api/AppUser/CheckAppUserStatus/$id');

      var response = await _get(url);
      if (response.statusCode == 200) {
        responseJson = response.body;
        return responseJson;
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    return jsonDecode(responseJson);
  }

  Future<String> fetchDocumentVerification(id) async {
    var responseJson = "";
    try {
      var url =
          Uri.parse('${appBaseUrl}api/Applicant/ApplicantCompleteProfile/$id');

      var response = await _get(url);
      if (response.statusCode == 200) {
        responseJson = response.body;
        return responseJson;
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    return jsonDecode(responseJson);
  }

  Future<List<ChatModel>> fetchChatMessage(id) async {
     var responseJson = "";
    if(id!=null)
    {
 var responseJson = "";
    try {
      var url = Uri.parse('${appBaseUrl}api/AppUser/GetChatMessage/$id');

      var response = await _get(url);
      if (response.statusCode == 200) {
        responseJson = response.body;
        return (json.decode(response.body) as List)
            .map((data) => ChatModel.fromJson(data))
            .toList();
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    
    }
    return jsonDecode(responseJson);
   
  }

  Future<void> updateSeenMessage(id) async {
    try {
      var url = Uri.parse('${appBaseUrl}api/AppUser/SeenMessage/$id');

      var response = await _get(url);
      if (response.statusCode == 200) {}
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
  }

  Future<List<QuestionModel>> fetchUserTakenTestDetails(id) async {
    var responseJson = "";
    try {
      var url = Uri.parse('${appBaseUrl}api/TakeTest/TakeTestByUser/$id');

      var response = await _get(url);
      if (response.statusCode == 200) {
        responseJson = response.body;
        return (json.decode(response.body) as List)
            .map((data) => QuestionModel.fromJson(data))
            .toList();
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException(e.toString());
    }
    return jsonDecode(responseJson);
  }

  Future<String> saveUserTest(id) async {
    var responseJson = "";
    try {
      var url = Uri.parse('${appBaseUrl}api/TakeTest/SaveTest/$id');

      var response = await _get(url);
      if (response.statusCode == 200) {
        responseJson = response.body;
        return responseJson;
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    return jsonDecode(responseJson);
  }

  Future<void> saveUserAnswer(details) async {
    var responseJson = "";
    try {
      var url = Uri.parse('${appBaseUrl}api/TakeTest/UserTestUpdate');
      var response =
          await _post(url, details);
      if (response.statusCode == 200) {}
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
  }

  Future<List<QuestionModel>> fetchExamSummary(id) async {
    var responseJson = "";
    try {
      var url = Uri.parse('${appBaseUrl}api/TakeTest/GetTestSummary/$id');

      var response = await _get(url);
      if (response.statusCode == 200) {
        responseJson = response.body;
        return (json.decode(response.body) as List)
            .map((data) => QuestionModel.fromJson(data))
            .toList();
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    return jsonDecode(responseJson);
  }

  Future<List<QuestionModel>> fetchQuestionByExcercise(
      start, end, courseid) async {
    var responseJson = "";
    try {
      var url = Uri.parse(
          '${appBaseUrl}api/Questions/TakeExercise/$start,$end,$courseid');

      var response = await _get(url);
      if (response.statusCode == 200) {
        responseJson = response.body;
        return (json.decode(response.body) as List)
            .map((data) => QuestionModel.fromJson(data))
            .toList();
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    return jsonDecode(responseJson);
  }

  Future<void> saveChattMessage(data) async {
    var responseJson = "";
    try {
      var url = Uri.parse('${appBaseUrl}api/AppUser/ChatMessageSend');

      var response =
          await _post(url, data);
      if (response.statusCode == 200) {
        responseJson = response.body;
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
  }

  Future<String> saveDocumentVersifications(File file, userNo, fileName) async {
    var responseJson = "";
    try {
      var url =
          Uri.parse('${appBaseUrl}api/Applicant/UpdateApplicantsServices');
      http.MultipartRequest request = new http.MultipartRequest("POST", url);
      final _h = _authHeaders();
      if (_h != null) request.headers.addAll(_h);

      http.MultipartFile multipartFile = await http.MultipartFile.fromPath(
          'Photo', file.path,
          filename: fileName);
      request.fields['ApplicantId'] = userNo;
      request.files.add(multipartFile);
      http.StreamedResponse response = await request.send();
      if (response.statusCode == 200) {
        return responseJson = "Update Successfuly.";
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    return responseJson;
  }

  Future<List<DocumentVerificationMD>> fetchDocumentVerificationByUser(
      id) async {
    var responseJson = "";
    try {
      var url =
          Uri.parse('${appBaseUrl}api/Applicant/GetApplicantServiceById/$id');

      var response = await _get(url);
      if (response.statusCode == 200) {
        responseJson = response.body;
        return (json.decode(response.body) as List)
            .map((data) => DocumentVerificationMD.fromJson(data))
            .toList();
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    return jsonDecode(responseJson);
  }
   Future<String> saveUserScreenShot(File file, userNo, fileName) async {
    var responseJson = "";
    try {
      var url =
          Uri.parse('${appBaseUrl}api/Applicant/SaveUserScreenShot');
      http.MultipartRequest request = new http.MultipartRequest("POST", url);
      final _h = _authHeaders();
      if (_h != null) request.headers.addAll(_h);

      http.MultipartFile multipartFile = await http.MultipartFile.fromPath(
          'Photo', file.path,
          filename: fileName);
      request.fields['ApplicantId'] = userNo;
      request.files.add(multipartFile);
      http.StreamedResponse response = await request.send();
      if (response.statusCode == 200) {
        return responseJson = "Update Successfuly.";
      }
    } on SocketException catch (e) {
      throw FetchDataException('No Internet connection');
      // ignore: nullable_type_in_catch_clause
    } on TimeoutException {
      throw ApiNotRespondingException('API not responded in time');
    } on FormatException {
      throw FetchDataException('Error occured with code ');
    } catch (e) {
      throw FetchDataException('Error occured with code ');
    }
    return responseJson;
  }

}
