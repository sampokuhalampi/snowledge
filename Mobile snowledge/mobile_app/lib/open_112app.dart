import 'package:external_app_launcher/external_app_launcher.dart';
import 'package:url_launcher/url_launcher.dart';

Future<void> open112() async {
  var isInstalled = await LaunchApp.isAppInstalled(
      androidPackageName: 'fi.digia.suomi112',
      iosUrlScheme: 'fi.digia.suomi112');
  print("isInstalled:${isInstalled.toString()}");
  if ((isInstalled.runtimeType == bool && isInstalled) ||
      (isInstalled.runtimeType == int && isInstalled == 1)) {
    await LaunchApp.openApp(
        androidPackageName: 'fi.digia.suomi112',
        iosUrlScheme: 'fi.digia.suomi112');
  } else {
    launch("tel:112");
  }
}
