import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:mobile/main.dart';

class FirebaseMsg {
  final msgService = FirebaseMessaging.instance;

  initFCM() async {
    await msgService.requestPermission();

    var token = await msgService.getToken();
    await sp.setString('fcm_token', token!);
  }
}
