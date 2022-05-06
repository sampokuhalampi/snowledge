import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'dart:async';
import 'main_page_funcs.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_map_tappable_polyline/flutter_map_tappable_polyline.dart';
import 'package:intl/intl.dart';

class Mainpage extends StatefulWidget {
  const Mainpage({Key? key, required this.username, required this.password}) : super(key: key);
  final String username;
  final String password;

  @override
  State<Mainpage> createState() => _MainpageState();
}

class _MainpageState extends State<Mainpage> {
  TextEditingController controller = TextEditingController();
  String searchResult = '';
  int dropdownValue = 1;

  List<dynamic> myRawData = [];
  List<dynamic> helpData = [];
  List<dynamic> allData = [];
  List<Marker> myMarkers = [];
  List<TaggedPolyline> myMarkerLines = [];
  List<String> mapTemplates = [
    "https://api.maptiler.com/maps/winter/256/{z}/{x}/{y}.png?key=vIqtYxkJALvxfiyLqutC",
    "https://api.maptiler.com/maps/outdoor/256/{z}/{x}/{y}.png?key=vIqtYxkJALvxfiyLqutC",
  ];
  bool datatableState = true;
  String mapType = "https://api.maptiler.com/maps/winter/256/{z}/{x}/{y}.png?key=vIqtYxkJALvxfiyLqutC";
  late Timer timer;

  Future<void> updateMap() async {
    var selected = myRawData.where((item) => item.last == true);
    List<Marker> markers = [];
    List<TaggedPolyline> myLines = [];
    for (var user in selected) {
      String name = '${user[1]} ${user[2]}';
      var userData = await callHttp(
        'get/location',
        widget.username,
        widget.password,
        {
          'dev_id': user[0],
          'num_locations': dropdownValue,
        },
      );
      List<LatLng> line = [];
      int i = 0;
      for (var entry in userData) {
        DateTime time = DateTime.fromMillisecondsSinceEpoch(entry[1] * 1000);
        String formattedTime = DateFormat('dd.MM - HH:mm').format(time);
        LatLng point = LatLng(double.parse(entry[2]), double.parse(entry[3]));
        Marker? marker;
        if (i == 0) {
          int a = i + 1;
          marker = Marker(
            builder: (context) => PhysicalModel(
              color: Colors.transparent,
              child: Tooltip(
                message: '$a | $name | $formattedTime',
                child: const Center(
                  child: Text('⚫',
                      style: TextStyle(
                        fontSize: 12.5,
                      )),
                ),
              ),
            ),
            point: point,
          );
        } else {
          int a = i + 1;
          marker = Marker(
            builder: (context) => PhysicalModel(
              color: Colors.transparent,
              child: Tooltip(
                message: '$a | $name | $formattedTime',
                child: const Center(
                  child: Text('⬛',
                      style: TextStyle(
                        fontSize: 12.5,
                      )),
                ),
              ),
            ),
            point: point,
          );
        }
        i += 1;
        line.add(point);
        markers.add(marker);
      }
      myLines.add(TaggedPolyline(
        tag: name,
        points: line,
        color: Colors.deepOrangeAccent,
        strokeWidth: 3.0,
      ));
    }
    setState(() => {myMarkers = markers, myMarkerLines = myLines});
  }

  Future<void> updateData() async {
    if (!mounted) {
      timer.cancel();
      return;
    }
    List<dynamic> allUsers = await callHttp('get/users', widget.username, widget.password, null);
    List<dynamic> helpUsers = await callHttp('get/help', widget.username, widget.password, null);
    for (var _ in allUsers) {
      _.add(false);
    }
    for (var _ in helpUsers) {
      _.add(false);
    }
    setState(() {
      allData = allUsers;
      helpData = helpUsers;
      if (datatableState) {
        for (var key in allData) {
          if (myRawData.isNotEmpty) {
            for (var entry in myRawData) {
              if (key[0] == entry[0]) {
                key.last = entry.last;
              }
            }
          }
        }
        myRawData = allData;
      } else {
        for (var key in helpData) {
          if (myRawData.isNotEmpty) {
            for (var entry in myRawData) {
              if (key[0] == entry[0]) {
                key.last = entry.last;
              }
            }
          }
        }
        myRawData = helpData;
      }
    });
  }

  @override
  void initState() {
    updateData();
    timer = Timer.periodic(const Duration(seconds: 10), (timer) {
      updateData();
      updateMap();
    });
    super.initState();
  }

  @override
  void dispose() {
    timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: <Widget>[
          SizedBox(
            width: 450,
            child: ListView(
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.all(10.0),
                  child: SizedBox(
                    width: 450,
                    child: TextField(
                      textAlign: TextAlign.center,
                      controller: controller,
                      decoration: const InputDecoration(
                        hintText: 'Search',
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (value) {
                        setState(
                          () {
                            searchResult = value;
                          },
                        );
                      },
                    ),
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    ElevatedButton(
                      onPressed: datatableState
                          ? null
                          : () => {
                                setState(() {
                                  myRawData = allData;
                                  datatableState = true;
                                }),
                              },
                      child: const SizedBox(
                        width: 150,
                        child: Text(
                          'Kaikki',
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                    ElevatedButton(
                      onPressed: !datatableState
                          ? null
                          : () => {
                                setState(() {
                                  myRawData = helpData;
                                  datatableState = false;
                                }),
                              },
                      child: const SizedBox(
                        width: 150,
                        child: Text(
                          'Apua pyytäneet',
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ],
                ),
                createDataTable(myRawData, searchResult),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    const Text('Valitse '),
                    DropdownButton(
                      value: dropdownValue,
                      onChanged: (int? newValue) {
                        setState(
                          () => {
                            dropdownValue = newValue!,
                          },
                        );
                      },
                      items: const [
                        DropdownMenuItem(value: 1, child: Text('1')),
                        DropdownMenuItem(value: 2, child: Text('2')),
                        DropdownMenuItem(value: 3, child: Text('3')),
                        DropdownMenuItem(value: 4, child: Text('4')),
                      ],
                    ),
                    const Text(" viimeisintä sijaintia"),
                  ],
                ),
                Center(
                  child: SizedBox(
                    width: 130,
                    child: ElevatedButton(
                      onPressed: () async {
                        await updateMap();
                      },
                      child: const Text("Näytä sijainti"),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 80.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0),
                        child: ElevatedButton(
                          onPressed: () {
                            setState(() => {myMarkers = [], myMarkerLines = []});
                          },
                          child: const SizedBox(
                            width: 130,
                            child: Text(
                              'Tyhjennä kartta',
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0),
                        child: ElevatedButton(
                          onPressed: () {
                            setState(() {
                              if (mapType == mapTemplates[0]) {
                                mapType = mapTemplates[1];
                              } else {
                                mapType = mapTemplates[0];
                              }
                            });
                          },
                          child: const SizedBox(
                            width: 130,
                            child: Text(
                              'Vaihda kartan tyyppi',
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          createMap(context, 450, myMarkers, myMarkerLines, mapType),
        ],
      ),
    );
  }
}
