import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:mobile_app/first_screen.dart';

import 'help_offered.dart';
import 'main.dart';

class NotificationHandler {
  static final NotificationHandler _notificationService =
      NotificationHandler._internal();
  GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  static final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  factory NotificationHandler() {
    return _notificationService;
  }

  Future<void> init(context) async {
    final AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('logo_transparent_black');

    final IOSInitializationSettings initializationSettingsIOS =
        IOSInitializationSettings(
      requestSoundPermission: true,
      requestBadgePermission: true,
      requestAlertPermission: true,
      onDidReceiveLocalNotification: onDidReceiveLocalNotification,
    );

    final InitializationSettings initializationSettings =
        InitializationSettings(
            android: initializationSettingsAndroid,
            iOS: initializationSettingsIOS,
            macOS: null);

    await flutterLocalNotificationsPlugin.initialize(initializationSettings,
        onSelectNotification:
            onSelectNotification); //(context) => selectNotification
  }

  Future onSelectNotification(String? payload) async {
    try {
      await MyApp.navigatorKey.currentState
          ?.push(MaterialPageRoute(builder: (context) => HelpOffered(payload)));
    } catch (e) {
      print(e.toString());
    }
  }

  void onDidReceiveLocalNotification(
      int? id, String? title, String? body, String? payload) async {
    // display a dialog with the notification details, tap ok to go to another page
    try {
      await MyApp.navigatorKey.currentState
          ?.push(MaterialPageRoute(builder: (context) => const FirstScreen()));
    } catch (e) {
      print(e.toString());
    }
  }

  NotificationHandler._internal();

  static const IOSNotificationDetails _iosNotificationDetails =
      IOSNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
          badgeNumber: 1,
          attachments: null,
          subtitle: "",
          threadIdentifier: "threadID");

  static void cancelPushUpNotification({int id = 12345}) {
    flutterLocalNotificationsPlugin.cancel(id);
  }


  static Future<void> pushUpNotification(String coords, String distance,
      {int id = 12345}) async {
    String payload = coords + ':' + distance;
    flutterLocalNotificationsPlugin.show(
        id,
        "Avunpyyntö $distance päässä!",
        "Siirry katsomaan avuntarve ",
        const NotificationDetails(
            android: AndroidNotificationDetails(
                'your channel id', 'your channel name',
                channelDescription: 'your channel description',
                importance: Importance.max,
                priority: Priority.high,
                ticker: 'ticker'),
            iOS: _iosNotificationDetails),
        payload: payload);
  }
}
