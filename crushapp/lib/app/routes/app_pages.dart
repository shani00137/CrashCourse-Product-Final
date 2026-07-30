import 'package:get/get.dart';

import '../modules/chat/bindings/chat_binding.dart';
import '../modules/chat/views/chat_view.dart';
import '../modules/chat/views/chattApplicant.dart';
import '../modules/coursematerial/bindings/coursematerial_binding.dart';
import '../modules/coursematerial/views/coursematerial_view.dart';
import '../modules/courses/bindings/courses_binding.dart';
import '../modules/courses/views/courses_view.dart';
import '../modules/courses/views/excercise_view.dart';
import '../modules/courses/views/pdfview.dart';
import '../modules/courses/views/videoplayer.dart';
import '../modules/documentverification/bindings/documentverification_binding.dart';
import '../modules/documentverification/views/documentverification_view.dart';
import '../modules/documentverification/views/uploadFile.dart';
import '../modules/home/bindings/home_binding.dart';
import '../modules/home/views/home_view.dart';
import '../modules/login/bindings/login_binding.dart';
import '../modules/login/views/login_view.dart';
import '../modules/login/views/privacyPolicy.dart';
import '../modules/managetest/bindings/managetest_binding.dart';
import '../modules/managetest/views/managetest_view.dart';
import '../modules/questions/bindings/questions_binding.dart';
import '../modules/questions/views/questions_view.dart';
import '../modules/result/bindings/result_binding.dart';
import '../modules/result/views/examsummary.dart';
import '../modules/result/views/result_view.dart';
import '../modules/security/bindings/security_binding.dart';
import '../modules/security/views/security_view.dart';
import '../modules/taketest/bindings/taketest_binding.dart';
import '../modules/taketest/views/taketest_view.dart';

part 'app_routes.dart';

class AppPages {
  AppPages._();

  static const INITIAL = Routes.HOME;

  static final routes = [
    GetPage(
      name: _Paths.HOME,
      page: () => HomeView(),
      binding: HomeBinding(),
    ),
    GetPage(
      name: _Paths.LOGIN,
      page: () => LoginView(),
      binding: LoginBinding(),
    ),
    GetPage(
      name: _Paths.MANAGETEST,
      page: () => ManagetestView(),
      binding: ManagetestBinding(),
    ),
    GetPage(
      name: _Paths.TAKETEST,
      page: () => TaketestView(),
      binding: TaketestBinding(),
    ),
    GetPage(
      name: _Paths.RESULT,
      page: () => ResultView(),
      binding: ResultBinding(),
    ),
    GetPage(
      name: _Paths.SECURITY,
      page: () => SecurityView(),
      binding: SecurityBinding(),
    ),
    GetPage(
      name: _Paths.ExamSummary,
      page: () => ExamSummary(),
    ),
    GetPage(
      name: _Paths.COURSES,
      page: () => CoursesView(),
      binding: CoursesBinding(),
    ),
    GetPage(
      name: _Paths.EXERCISE,
      page: () => ExerciseView(),
      binding: CoursesBinding(),
    ),
    GetPage(
      name: _Paths.QUESTIONS,
      page: () => QuestionsView(),
      binding: QuestionsBinding(),
    ),
    GetPage(
      name: _Paths.CHAT,
      page: () => ChatView(),
      binding: ChatBinding(),
    ),
    GetPage(
      name: _Paths.CHATAPPLICANT,
      page: () => ChatApplicantView(),
    ),
    // GetPage(
    //   name: _Paths.PrivacyPolicy,
    //   page: () => PrivacyPolicy(),
    // ),
    GetPage(
      name: _Paths.PDFReader,
      page: () => PDFReader(),
    ),
    GetPage(
      name: _Paths.DOCUMENTVERIFICATION,
      page: () => DocumentverificationView(),
      binding: DocumentverificationBinding(),
    ),
    GetPage(
      name: _Paths.UPLOADFILE,
      page: () => uploadFile(),
      binding: DocumentverificationBinding(),
    ),
    GetPage(
      name: _Paths.COURSEMATERIAL,
      page: () =>  CoursematerialView(),
      binding: CoursematerialBinding(),
    ),
    GetPage(
      name: _Paths.CrashVideoPlayer,
      page: () => CrashVideoPlayer(),
    ),

  ];
}
