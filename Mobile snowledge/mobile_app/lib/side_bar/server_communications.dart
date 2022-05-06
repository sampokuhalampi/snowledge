import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile_app/help_need_over.dart';
import 'package:mobile_app/side_bar/side_bar_state.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'dart:io';

import '../help_needed_mode.dart';
import '../help_offered.dart';
import '../main.dart';
import '../notification_handler.dart';
import 'gps_handler.dart';

class ServerComms {
  static late Timer _timer;
  static String serverIP = '185.87.111.109';
  static Future<RawDatagramSocket> rDgS = RawDatagramSocket.bind(InternetAddress.anyIPv4, 50943);

  static bool _isOfferingHelp = false;

  ///Starts a timer. Avoid calling this again second time, before calling the stopSendingLocationMessages() method.
  static void startSendingLocationMessages() {
    if (SideBarState.gpsSwitchState) {
      messageToServer("LOCATION");
    }
    _timer = Timer.periodic(
      const Duration(seconds: 15),
      (Timer t) => {_listenServerTimerInsides(5)},
    );
  }

  static void _listenServerTimerInsides(int minutesBetweenLocationMessages) {
    print(_timer.tick);
    if (SideBarState.gpsSwitchState) {
      if ((_timer.tick % (4 * minutesBetweenLocationMessages) == 0) ||
          _isOfferingHelp && _timer.tick % (1 * minutesBetweenLocationMessages) == 0) {
        messageToServer("LOCATION");
      } else {
        messageToServer("KEEP_ALIVE");
      }
    }
  }

  static void stopSendingLocationMessages() {
    _timer.cancel();
  }

  static void startListeningServer() {
    listenServer();
  }

  static messageToServer(String messagetype) async {
    if (await Permission.location.isGranted) {
      String devId = await _getDeviceID();

      String message;
      switch (messagetype) {
        case 'LOCATION':
          List<String> list = await getTimeFNameLNameGps();
          message = '$messagetype:${list[0]}:$devId:${list[1]}:${list[2]}:${list[3]}';
          break;
        case 'HELP':
          List<String> list = await getTimeFNameLNameGps();
          message = '$messagetype:${list[0]}:$devId:${list[3]}';
          break;
        case 'HELP_DELETE':
          message = '$messagetype:$devId';
          break;
        case "HELP_RESPONSE:0":
          var messageParts = messagetype.split(':');
          message = '${messageParts[0]}:$devId:${messageParts[1]}';
          break;
        case "HELP_RESPONSE:1":
          _isOfferingHelp = true;
          var messageParts = messagetype.split(':');
          message = '${messageParts[0]}:$devId:${messageParts[1]}';
          break;
        case "DECLINE":
          _isOfferingHelp = false;
          message = '$messagetype:$devId';
          break;
        case "KEEP_ALIVE":
          message = '$messagetype:123';
          break;
        default:
          message = "invalid messagetype";
          break;
      }
      print(message);
      rDgS.then(
        (RawDatagramSocket udpSocket) {
          udpSocket.writeEventsEnabled = true;
          List<int> data = utf8.encode(message);
          udpSocket.send(data, InternetAddress(serverIP), 50943);
        },
      );
    } else {
      print("FAILED TO SEND MESSAGE BECAUSE OF THERE IS NO GPS PERMISSIONS GRANTED");
    }
  }

  static _getDeviceID() async {
    final DeviceInfoPlugin deviceInfoPlugin = DeviceInfoPlugin();
    String? devId = "notSet";
    if (Platform.isAndroid) {
      var build = await deviceInfoPlugin.androidInfo;
      devId = build.androidId;
    } else if (Platform.isIOS) {
      var data = await deviceInfoPlugin.iosInfo;
      devId = data.identifierForVendor;
    }
    return devId;
  }

  static listenServer() {
    rDgS.then((RawDatagramSocket udpSocket) {
      udpSocket.readEventsEnabled = true;
      print("socket: $udpSocket");
      String result;
      udpSocket.listen((event) async {
        // await NotificationHandler.pushUpNotification("65.010954,25.466237", "5km"); //TODO REMOVE
        print("recv e: $event");
        if (event == RawSocketEvent.read) {
          Datagram? dg = udpSocket.receive();
          result = utf8.decode(dg!.data);
          print("result: $result");
          List<String> resultParts = result.split(':');
          switch (resultParts[0]) {
            case "HELPER_ACCEPTED":
              //HELPER_ACCEPTED:ID:GPS
              List<String> res2 = resultParts[2].split(',');
              HelpNeededState.helperAmountUpdate(
                  1, resultParts[1], LatLng(double.parse(res2[0]), double.parse(res2[1])));
              break;
            case "HELPER_UPDATED":
              //HELP_UPDATED:ID:GPS
              List<String> res2 = resultParts[2].split(',');
              HelpNeededState.helperAmountUpdate(
                  0, resultParts[1], LatLng(double.parse(res2[0]), double.parse(res2[1])));
              break;
            case "HELPER_WITHDRAWN":
              //HELP_WITHDRAWN:ID
              HelpNeededState.helperAmountUpdate(-1, resultParts[1], LatLng(0, 0));
              break;
            case "HELP_TARGET_UPDATE":
              //HELP_TARGET_UPDATE:ID:GPS
              print("\'case \"HELP_TARGET_UPDATE\":\' - GPS: ${resultParts[2]}");
              List<String> res2 = resultParts[2].split(',');
              String devId = await _getDeviceID();
              print("resultParts[1] ${resultParts[1]}     devId ${devId}");
              if (resultParts[1] == devId) {
                HelpOfferedState.setToBeHelpedLatLng(LatLng(double.parse(res2[0]), double.parse(res2[1])));
              }
              break;
            case "NOTIFY":
              //NOTIFY:ID:GPS:DISTANCE:
              String devId = await _getDeviceID();
              if (resultParts[1] == devId) {
                await NotificationHandler.pushUpNotification(resultParts[2], resultParts[3]);
              }
              break;
            case "HELP_OVER":
              // HELP_OVER:ID
              String devId = await _getDeviceID();
              if (resultParts[1] == devId) {
                NotificationHandler.cancelPushUpNotification();
                try {
                  if (HelpOfferedState.pageOpen) {
                    await MyApp.navigatorKey.currentState
                        ?.push(MaterialPageRoute(builder: (context) => const HelpOver()));
                  }
                } catch (e) {
                  print(e.toString());
                }
              }
              break;
            default:
              print("invalid message: $result");
              return;
          }
        }
      }, onError: (error) {
        print("server listening error: $error");
      }, onDone: () {
        print("server listening done!");
      }, cancelOnError: true);
    });
  }

  static Future<List<String>> getTimeFNameLNameGps() async {
    var prefs = await SharedPreferences.getInstance();
    String fName = prefs.getString('fName')!;
    String lName = prefs.getString('lName')!;
    int time = (DateTime.now().millisecondsSinceEpoch / 1000).round();
    var gps = GpsHandler.gps;
    String _gps = '${gps.latitude},${gps.longitude}';
    return [time.toString(), fName, lName, _gps];
  }
}
