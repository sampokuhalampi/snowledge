import 'package:flutter/cupertino.dart';
import 'package:mobile_app/side_bar/gps_handler.dart';
import 'package:permission_handler/permission_handler.dart';

class WidgetsBindingObserverState<T extends StatefulWidget> extends State
    with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    setAppResumedWithAlwaysOnPermissionsTask(
        () => {GpsHandler.userReturnedToTheApp()});
    WidgetsBinding.instance!.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance!.removeObserver(this);
    super.dispose();
  }

  late Function() _appResumedWithAlwaysOnPermissions;

  ///the function will be run when user returns from the AppSettings, where he/she did give the app the alwaysOn location permissions.
  setAppResumedWithAlwaysOnPermissionsTask(Function() f) {
    _appResumedWithAlwaysOnPermissions = f;
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:
        if (GpsHandler.userInAppSettings) {
          GpsHandler.userReturnedToTheApp();
          Permission.locationAlways.isGranted.then((isGranted) {
            if (isGranted) {
              _appResumedWithAlwaysOnPermissions();
            }
          });
        }
        break;
      default:
        print("didChangeAppLifecycleState: ${state}");
        break;
    }
    if (state == AppLifecycleState.resumed) {}
  }

  @override
  Widget build(BuildContext context) {
    // override build in the class that extends this State
    throw UnimplementedError();
  }
}
