import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile_app/side_bar/gps_handler.dart';
import 'package:mobile_app/side_bar/server_communications.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:url_launcher/url_launcher_string.dart';

import 'help_needed_mode.dart';
import 'main_page.dart';

class HelpOffered extends StatefulWidget {
  const HelpOffered(this.payload, {Key? key}) : super(key: key);
  final String? payload;

  @override
  State<HelpOffered> createState() => HelpOfferedState();
}

class HelpOfferedState extends State<HelpOffered> {
  bool _accepted = false;
  static bool _pageOpen = false;

  static bool get pageOpen => _pageOpen;
  static late Timer _stateUpdateTimer;
  static List<Marker> _markers = [];
  static LatLng _toBeHelpedLatLng = LatLng(0, 0);

  static late String _distance;
  @override
  initState() {
    _pageOpen = true;
    List<String> payloadparts = widget.payload!.split(':');
    _distance = payloadparts[1];
    List<String> gpsParts = payloadparts[0].split(',');
    _toBeHelpedLatLng = LatLng(double.parse(gpsParts[0]), double.parse(gpsParts[1]));
    super.initState();
    _stateUpdateTimer = Timer.periodic(
      const Duration(seconds: 2),
      (Timer t) => {
        getLatLng().then((usersLatLng) {
          setState(() {
            _markers = getMarkers(usersLatLng, _toBeHelpedLatLng);
          });
        })
      },
    );
  }

  @override
  void dispose() {
    if (_accepted) {
      ServerComms.messageToServer('DECLINE');
    }
    _pageOpen = false;
    _stateUpdateTimer.cancel();
    super.dispose();
  }

  static void setToBeHelpedLatLng(LatLng toBeHelpedLatLng) {
    _toBeHelpedLatLng = toBeHelpedLatLng;
  }

  Future<LatLng> getLatLng() async {
    var location = await GpsHandler.gps;
    return LatLng(location.latitude!, location.longitude!);
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        final value = await showDialog<bool>(
            context: context,
            builder: (context) {
              return AlertDialog(
                title: const Text('Haluatko perua avun tarjoamisen?'),
                actions: [
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(false),
                    child: const Text('En'),
                  ),
                  ElevatedButton(
                      onPressed: () {
                        ServerComms.messageToServer('DECLINE');
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
              _accepted ? 'Avuntarjoamistila' : 'Käyttäjä on pyytänyt apua $_distance päässä',
              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black, fontSize: 15),
            ),
            automaticallyImplyLeading: false,
            backgroundColor: Colors.red[200],
            centerTitle: true,
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
                  TileLayerOptions(urlTemplate: HelpNeededState.getSummerOrWinterMap()
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
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: _accepted ? returnbutton() : decisionbuttons(),
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

  List<Widget> decisionbuttons() {
    return <Widget>[
      ElevatedButton(
        onPressed: () {
          ServerComms.messageToServer('HELP_RESPONSE:0');
          Navigator.pushAndRemoveUntil(
              context, MaterialPageRoute(builder: (context) => const MainPage()), (route) => false);
        },
        child: const Text(
          'Hylkää',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        style: ElevatedButton.styleFrom(
            primary: Colors.red[200],
            fixedSize: const Size(175, 75),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
      ),
      ElevatedButton(
        onPressed: () {
          ServerComms.messageToServer('HELP_RESPONSE:1');
          setState(() {
            _accepted = true;
          });
        },
        child: const Text(
          'Hyväksy',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        style: ElevatedButton.styleFrom(
            primary: Colors.red[200],
            fixedSize: const Size(175, 75),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
      ),
    ];
  }

  List<Widget> returnbutton() {
    return <Widget>[
      ElevatedButton(
        onPressed: () async {
          final value = await showDialog<bool>(
              context: context,
              builder: (context) {
                return AlertDialog(
                  title: const Text('Haluatko lopettaa avuntarjoamisen?'),
                  actions: [
                    ElevatedButton(
                      onPressed: () => Navigator.of(context).pop(false),
                      child: const Text('En'),
                    ),
                    ElevatedButton(
                        onPressed: () {
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
        child: const Text(
          'Lopeta avuntarjoaminen',
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
    ];
  }

  List<Marker> getMarkers(LatLng usersLatLng, LatLng toBeHelpedLatLng) {
    return [
      getToBeHelpedMarker(usersLatLng),
      Marker(
        width: 45.0,
        height: 20.0,
        point: toBeHelpedLatLng,
        builder: (ctx) => Container(
          width: 1.0,
          height: 1.0,
          decoration: const BoxDecoration(
            color: Color.fromARGB(250, 239, 154, 154),
          ),
          child: const Align(
            alignment: Alignment.center,
            child: Text(
              'Avunpyytäjä',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 8.0,
              ),
            ),
          ),
        ),
      )
    ];
  }

  static Marker getToBeHelpedMarker(LatLng usersLatLng) {
    return Marker(
      width: 50.0,
      height: 30.0,
      point: usersLatLng,
      builder: (ctx) => Container(
        width: 1.0,
        height: 1.0,
        decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.blue),
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
    );
  }
}
