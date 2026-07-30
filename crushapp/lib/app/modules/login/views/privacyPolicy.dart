// import 'dart:io';

// import 'package:flutter/cupertino.dart';
// import 'package:webview_flutter/webview_flutter.dart';

// import '../../../data/providers/api_Provider.dart';

// class PrivacyPolicy extends StatefulWidget {
//   @override
//   PrivacyPolicyState createState() => PrivacyPolicyState();
// }

// class PrivacyPolicyState extends State<PrivacyPolicy> {
//   String servername = ApiProvide.appBaseUrl;
//   @override
//   void initState() {
//     super.initState();
//     // Enable virtual display.
//     if (Platform.isAndroid) WebView.platform = AndroidWebView();
//   }

//   @override
//   Widget build(BuildContext context) {
//     return SafeArea(
//         child: WebView(
//       initialUrl:
//           'https://crashcourseonlincousre.blogspot.com/2022/06/privacy-policy-built-crash-app-app-as.html',
//     ));
//   }
// }
