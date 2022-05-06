import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile_app/side_bar/gps_handler.dart';
import 'package:mobile_app/side_bar/server_communications.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:url_launcher/url_launcher_string.dart';
import 'main_page.dart';

class HelpNeeded extends StatefulWidget {
  final bool tempGps;
  const HelpNeeded(this.tempGps, {Key? key}) : super(key: key);

  @override
  State<HelpNeeded> createState() => HelpNeededState();
}

class HelpNeededState extends State<HelpNeeded> {
  static late Timer _stateUpdateTimer;
  static late List<Marker> _markers = [];
  static List<Marker> _helpers = [];

  @override
  void dispose() {
    if (widget.tempGps) {
      GpsHandler.setGpsSetting(context, false);
      _markers.clear();
      _helpers.clear();
    }
    ServerComms.messageToServer('HELP_DELETE');
    _stateUpdateTimer.cancel();
    super.dispose();
  }

  @override
  initState() {
    super.initState();
    _stateUpdateTimer = Timer.periodic(
      const Duration(seconds: 2),
      (Timer t) => {
        getLatLng().then((usersLatLng) {
          setState(() {
            _markers = getMarkers(_helpers, usersLatLng);
          });
        })
      },
    );

    ServerComms.messageToServer("HELP");
  }

  static helperAmountUpdate(int diff, String id, LatLng gps) {
    switch (diff) {
      case -1:
        for (int i = 0; i < _helpers.length; i++) {
          if (_helpers[i].key.toString() == "[<'${id}'>]") {
            _helpers.remove(_helpers[i]);
          }
        }
        break;
      case 0:
        for (int i = 0; i < _helpers.length; i++) {
          if (_helpers[i].key.toString() == "[<'${id}'>]") {
            _helpers.remove(_helpers[i]);
            _helpers.add(newHelper(id, gps));
          }
        }
        break;
      case 1:
        _helpers.add(newHelper(id, gps));

        break;
      default:
        throw new Exception("Invalid input! the int diff value must be -1, 0 or 1");
        break;
    }
    getLatLng().then((usersLatLng) {
      _markers = getMarkers(_helpers, usersLatLng);
    });
  }

  static Future<LatLng> getLatLng() async {
    var location = await GpsHandler.gps;
    return await LatLng(location.latitude!, location.longitude!);
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        final value = await showDialog<bool>(
            context: context,
            builder: (context) {
              return AlertDialog(
                title: const Text('Haluatko lopettaa avunpyynnön?'),
                actions: [
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(false),
                    child: const Text('En'),
                  ),
                  ElevatedButton(
                      onPressed: () {
                        _markers.clear();
                        _helpers.clear();
                        Navigator.pushAndRemoveUntil(
                            context, MaterialPageRoute(builder: (context) => const MainPage()), (route) => false);
                      },
                      child: const Text('Kyllä')),
                ],
              );
            });
        if (value != null) {
          return Future.value(value);
        } else {
          return Future.value(false);
        }
      },
      child: SafeArea(
        child: Scaffold(
          appBar: AppBar(
            title: Text(
              'Avunpyyntö päällä\n\n Hyväksynyt: ${_helpers.length} henkilöä',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            automaticallyImplyLeading: false,
            backgroundColor: Colors.red[200],
            centerTitle: true,
            toolbarHeight: 100,
          ),
          body: Stack(
            children: [
              FlutterMap(
                options: MapOptions(
                  minZoom: 6,
                  maxZoom: 18,
                  center: LatLng(68.07, 24.02),
                  zoom: 11.0,
                ),
                layers: [
                  TileLayerOptions(urlTemplate: getSummerOrWinterMap()
                      // Pöllöille oma API avain!
                      ),
                  MarkerLayerOptions(
                    markers: _markers,
                    rotate: true,
                  ),
                ],
              ),
              Align(
                alignment: Alignment.bottomCenter,
                child: ElevatedButton(
                  onPressed: () async {
                    final value = await showDialog<bool>(
                        context: context,
                        builder: (context) {
                          return AlertDialog(
                            title: const Text('Haluatko lopettaa avunpyynnön?'),
                            actions: [
                              ElevatedButton(
                                onPressed: () => Navigator.of(context).pop(false),
                                child: const Text('En'),
                              ),
                              ElevatedButton(
                                  onPressed: () {
                                    _markers.clear();
                                    _helpers.clear();
                                    Navigator.pushAndRemoveUntil(context,
                                        MaterialPageRoute(builder: (context) => const MainPage()), (route) => false);
                                  },
                                  child: const Text('Kyllä')),
                            ],
                          );
                        });
                    if (value != null) {
                      return Future.value(value);
                    } else {
                      return Future.value(false);
                    }
                  },
                  child: const Text(
                    'Lopeta avun hälyttäminen',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                      primary: Colors.red[200],
                      fixedSize: const Size(200, 75),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                ),
              ),
              Align(
                alignment: Alignment.bottomLeft,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Tooltip(
                      message: "© MapTiler\n© OpenStreetMap contributors\nhttps://maptiler.com/",
                      child: IconButton(
                        onPressed: () async {
                          const url = "https://maptiler.com/";
                          if (await canLaunchUrlString(url)) {
                            await launchUrlString(url);
                          } else {
                            print('ERROR');
                          }
                        },
                        icon: Image.asset('assets/images/MapTiler.png'),
                        iconSize: 20,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  static String getSummerOrWinterMap() {
    int month = DateTime.now().month;
    if (month > 5 && month < 11) {
      return "https://api.maptiler.com/maps/outdoor/256/{z}/{x}/{y}.png?key=vIqtYxkJALvxfiyLqutC";
    }
    return "https://api.maptiler.com/maps/winter/256/{z}/{x}/{y}.png?key=vIqtYxkJALvxfiyLqutC";
  }

  static Marker newHelper(String id, LatLng gps) {
    return Marker(
      key: Key(id),
      width: 45.0,
      height: 20.0,
      point: gps,
      builder: (ctx) => Container(
        width: 1.0,
        height: 1.0,
        decoration: const BoxDecoration(
          color: Color.fromARGB(250, 239, 154, 154),
        ),
        child: const Align(
          alignment: Alignment.center,
          child: Text(
            'Avunantaja',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 8.0,
            ),
          ),
        ),
      ),
    );
  }

  static List<Marker> getMarkers(List<Marker> helpers, LatLng usersLatLng) {
    List<Marker> markers = [];
    markers.addAll(helpers);
    markers.add(
      Marker(
        width: 50.0,
        height: 30.0,
        point: usersLatLng,
        builder: (ctx) => Container(
          width: 1.0,
          height: 1.0,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.blue,
          ),
          child: const Align(
            alignment: Alignment.center,
            child: Text(
              'Olet\ntässä',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 8.0,
              ),
            ),
          ),
        ),
      ),
    );
    return markers;
  }
}
