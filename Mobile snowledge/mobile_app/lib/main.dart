import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile_app/side_bar/server_communications.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'main_page.dart';
import 'first_screen.dart';

String? fName;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  Future<SharedPreferences> prefs = SharedPreferences.getInstance();

  ServerComms.startListeningServer();

  prefs.then((pref) {
    fName = pref.getString('fName');

    runApp(MyApp());
  });
}

class MyApp extends StatelessWidget {
  static final navigatorKey = new GlobalKey<NavigatorState>();

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      navigatorKey: navigatorKey,
      title: 'notification',
      home: (fName == null) ? FirstScreen() : MainPage(),
    );
  }
}
