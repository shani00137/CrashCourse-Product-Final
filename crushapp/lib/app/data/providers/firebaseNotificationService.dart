import 'package:firebase_messaging/firebase_messaging.dart';

class PushNotificationService {
  final FirebaseMessaging _fcm;

  PushNotificationService(this._fcm);

  Future initialise() async {
    String? token = await _fcm.getToken();
    print("FirebaseMessaging token: $token");
  }
}
