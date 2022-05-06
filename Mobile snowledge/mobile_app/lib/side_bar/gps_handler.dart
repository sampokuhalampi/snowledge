import 'dart:async';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:mobile_app/side_bar/side_bar_state.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:io';

import 'package:permission_handler/permission_handler.dart';
import 'package:location/location.dart';

class GpsHandler {
  //#region gps
  static late Timer _timer;
  static Location _location = new Location();

  static late LocationData _gps;
  static LocationData get gps => _gps;

  static bool _userInAppSettings = false;

  static bool get userInAppSettings => _userInAppSettings;
  static StreamSubscription<LocationData> listener = _location.onLocationChanged.listen((event) {});

  static userReturnedToTheApp() {
    _userInAppSettings = false;
  }

  ///Starts a timer. Avoid calling this again second time, before calling the stopUpdatingGpsVariable() method.
  static Future<void> startUpdatingGpsVariable() async {
    _gps = await _location.getLocation();
    _timer = Timer.periodic(
      const Duration(seconds: 5),
      (Timer t) async => {updateGpsVariable()},
    );
  }

  static Future<void> stopUpdatingGpsVariable() async {
    _timer.cancel();
  }

  static Future<void> updateGpsVariable({bool ignoreSwitch = false}) async {
    if (SideBarState.gpsSwitchState || ignoreSwitch) {
      _gps = await _location.getLocation();
    }
  }

  ///tries to set gps setting and returns the value that the setting ends up being.
  ///If insistAlwaysOn = false, make sure that setGpsSetting(false) is run after using the gps, to avoid unexpected behaviour.
  static Future<bool> setGpsSetting(context, bool value, {bool insistAlwaysOn = false}) async {
    _userInAppSettings = false;
    bool result = false;
    //gps services state and permissions
    if (value) {
      if (await checkGpsService()) {
        if (insistAlwaysOn) {
          _location.enableBackgroundMode(enable: true);
          if (await checkAndAskGpsAlwaysOnPermission(context)) {
            _saveGpsSetting(true);
            //gps always on background permissions granted => gps ON until turned off
            result = true;
          }
        } else {
          if (!await Permission.location.isGranted) {
            await Permission.location.request();
            if (await Permission.location.isGranted) {
              //permissions were not denied, => permissions granted and gps is ON for now.
              result = true;
            } else {
              result = await _showGPSDialog(
                  context,
                  false,
                  'Sovellus tarvitsee paikannukseen luvan käyttää sijaintia.\n\nSallitko sijaintiedon keräämisen?',
                  "Etene antamaan GPS luvat");
            }
          } else {
            result = true;
          }
        }
      }
    } else {
      _saveGpsSetting(false);
    }

    return result;
  }

  static Future<bool> checkAndAskGpsAlwaysOnPermission(context) async {
    //check permission
    if (!await Permission.locationAlways.isGranted) {
      if (Platform.isAndroid) {
        int androidVersion = int.parse((await DeviceInfoPlugin().androidInfo).version.release!.split('.')[0]);
        if (androidVersion > 10) {
          return await _askWhenInUseAndThenAlwaysLocationPermission(
              context,
              'Sovellus tarvitsee luvan käyttää sijaintia myös näytön ollessa kiinni.' +
                  '\n\nSallitko sijaintiedon keräämisen sovelluksen ollessa taustalla?' +
                  '\n\n->Sijainti: Salli aina',
              "Siirry asetuksiin");
        } else if (androidVersion == 10) {
          return await _askWhenInUseAndThenAlwaysLocationPermission(
              context,
              'Sovellus tarvitsee luvan käyttää sijaintia myös näytön ollessa kiinni.' +
                  '\n\nSallitko sijaintiedon keräämisen sovelluksen ollessa taustalla?' +
                  '\n\nkyllä?->Salli aina',
              "Seuraava");
        } else {
          await Permission.locationAlways.request();
          return await Permission.locationAlways.isGranted;
        }
      } else if (Platform.isIOS) {
        return await _askWhenInUseAndThenAlwaysLocationPermission(
            context,
            'Sovellus tarvitsee  luvan käyttää sijaintia myös näytön ollessa kiinni.' +
                '\n\nSallitko sijaintiedon keräämisen sovelluksen ollessa taustalla?',
            "Seuraava");
      } else {
        throw ErrorDescription("The platform must be either Android or IOS!");
      }
    }

    return true;
  }

  static Future<bool> _askWhenInUseAndThenAlwaysLocationPermission(
      BuildContext context, String dialogMessage, String buttonText) async {
    await Permission.locationWhenInUse.request();
    if (!(await Permission.locationWhenInUse.isGranted)) {
      return false;
    }
    return await _showGPSDialog(context, true, dialogMessage, buttonText);
  }

  ///check if phones gps is on
  static Future<bool> checkGpsService() async {
    //check serviceEnabled
    var serviceEnabled = await _location.serviceEnabled();
    if (!serviceEnabled) {
      serviceEnabled = await _location.requestService();
      if (!serviceEnabled) {
        return false;
      }
    }

    return true;
  }

  ///just reads the sharedPreferences value "isSharingLocation"
  static Future<bool> loadGpsSetting() async {
    SharedPreferences sharedPreferences = await SharedPreferences.getInstance();
    var loadedSetting = sharedPreferences.getBool("isSharingLocation");

    return loadedSetting ?? false;
  }

  ///save gps setting of the app
  static void _saveGpsSetting(bool value) async {
    //saves the setting
    if (value) {
      listener = _location.onLocationChanged.listen((event) {});
    } else {
      listener.cancel();
    }
    SharedPreferences sharedPreferences = await SharedPreferences.getInstance();
    await sharedPreferences.setBool("isSharingLocation", value);
  }

  static Future<bool> _showGPSDialog(context, bool insistAlwaysOn, String dialogMessage, String buttonText) async {
    bool result = false;
    await showDialog<void>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text(dialogMessage),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
            ),
            actions: <Widget>[
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop();
                },
                child: const Text('Peruuta'),
              ),
              ElevatedButton(
                onPressed: () async {
                  if (insistAlwaysOn) {
                    await Permission.locationAlways.request();
                    if (!(await Permission.locationAlways.isGranted)) {
                      if (await openAppSettings()) _userInAppSettings = true;
                    }
                    result = await Permission.locationAlways.isGranted;
                    Navigator.of(context).pop();
                  } else {
                    await Permission.location.request();
                    if (!(await Permission.location.isGranted)) {
                      if (await openAppSettings()) //TODO päätä kannattaako tämä pitää tässä
                        _userInAppSettings = true;
                    }
                    result = await Permission.location.isGranted;
                    Navigator.of(context).pop();
                  }
                },
                child: Text(buttonText),
              ),
            ],
          );
        });
    return result;
  }

//#endregion
}
