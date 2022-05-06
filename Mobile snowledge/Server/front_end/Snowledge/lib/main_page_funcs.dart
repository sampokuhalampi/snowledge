import 'package:flutter/material.dart';
import 'package:http/http.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_map_tappable_polyline/flutter_map_tappable_polyline.dart';
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart';
import 'package:url_launcher/url_launcher_string.dart';

PaginatedDataTable createDataTable(List<dynamic> users, String searchValue) {
  return PaginatedDataTable(
    source: MyData(list: searchList(users, searchValue)),
    columns: createColumns(),
    rowsPerPage: 12,
    showCheckboxColumn: true,
    showFirstLastButtons: true,
  );
}

List searchList(List listToSearch, String searchedString) {
  List<dynamic> result = [];

  for (var entry in listToSearch) {
    String name = '${entry[1]} ${entry[2]}';
    name = name.toLowerCase();
    if (name.contains(searchedString.toLowerCase())) {
      result.add(entry);
    }
  }

  return result;
}

List<DataColumn> createColumns() {
  const TextStyle style = TextStyle(fontWeight: FontWeight.bold);
  return const [
    DataColumn(label: Text('Etunimi', style: style)),
    DataColumn(label: Text('Sukunimi', style: style)),
    DataColumn(label: Text('GPS', style: style)),
  ];
}

class MyData extends DataTableSource {
  MyData({required this.list});
  List<dynamic> list;
  List<dynamic> selectedRows = [];

  @override
  DataRow getRow(int index) {
    return DataRow(
      selected: list[index].last,
      cells: [
        DataCell(
          Container(
            width: 90,
            child: Text(list[index][1]),
          ),
        ),
        DataCell(
          Container(
            width: 90,
            child: Text(list[index][2]),
          ),
        ),
        DataCell(
          Container(
            width: 90,
            child: Text(
                '${double.parse(list[index][list[index].length - 3]).toStringAsFixed(5)},\n${double.parse(list[index][list[index].length - 2]).toStringAsFixed(5)}'),
          ),
        ),
      ],
      onSelectChanged: (val) {
        list[index].last = val!;
        if (val) {
          selectedRows.add(list[index]);
        } else {
          selectedRows.removeWhere((item) => item[0] == list[index][0]);
        }
        notifyListeners();
      },
    );
  }

  @override
  bool get isRowCountApproximate => false;

  @override
  int get rowCount => list.length;

  @override
  int get selectedRowCount => selectedRows.length;
}

Future<List> callHttp(String api, String username, String password, Map? body) async {
  String url = 'https://pallas.lumisovellus.fi/data/api/${api}';
  Response response;

  if (body == null) {
    response = await get(
      Uri.parse(url),
      headers: {'Authorization': '$username:$password'},
    );
  } else {
    response = await post(
      Uri.parse(url),
      headers: {'Authorization': '$username:$password'},
      body: jsonEncode(body),
    );
  }

  List<dynamic> result = jsonDecode(response.body);

  return result;
}

SizedBox createMap(
    BuildContext context, int width, List<Marker> markers, List<TaggedPolyline> polylines, String mapTemplate) {
  return SizedBox(
    width: MediaQuery.of(context).size.width - width,
    child: Stack(
      children: [
        FlutterMap(
          options: MapOptions(
            plugins: [
              TappablePolylineMapPlugin(),
            ],
            center: LatLng(68.07, 24.02),
            zoom: 13.0,
            maxZoom: 17.0,
          ),
          layers: [
            TileLayerOptions(
              // Pöllöille oma API avain!
              urlTemplate: mapTemplate,
            ),
            TappablePolylineLayerOptions(
              polylines: polylines,
            ),
            MarkerLayerOptions(
              markers: markers,
            ),
          ],
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
                  iconSize: 35,
                ),
              ),
            ],
          ),
        )
      ],
    ),
  );
}
