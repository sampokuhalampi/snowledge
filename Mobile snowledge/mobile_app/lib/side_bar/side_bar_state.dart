import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:mobile_app/help_needed_mode.dart';
import 'package:mobile_app/side_bar/gps_handler.dart';
import 'package:mobile_app/side_bar/side_bar.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:url_launcher/url_launcher_string.dart';
import '../open_112app.dart';
import '../widgets_binding_observer_state.dart';

import 'server_communications.dart';

class SideBarState extends WidgetsBindingObserverState<SideBar> {
  String locationMessage = 'LOCATION';

  static bool _gpsSwitchState = false;

  static bool get gpsSwitchState => _gpsSwitchState;

  static void setGpsSwitchState(bool value) async {
    if (_gpsSwitchState != value) {
      _gpsSwitchState = value;
      if (value) {
        await GpsHandler.startUpdatingGpsVariable();
        ServerComms.startSendingLocationMessages();
      } else {
        GpsHandler.stopUpdatingGpsVariable();
        ServerComms.stopSendingLocationMessages();
      }
    }
  }

  @override
  void initState() {
    super.initState();
    setAppResumedWithAlwaysOnPermissionsTask(() => {
          setState(() {
            setGpsSwitchState(true);
          })
        });
    GpsHandler.loadGpsSetting().then((gpsOn) {
      setState(() {
        setGpsSwitchState(gpsOn);
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
        child: ListView(padding: EdgeInsets.zero, children: <Widget>[
      const Padding(
        padding: EdgeInsets.symmetric(horizontal: 5, vertical: 30),
        child: Text('Sijaintitiedon jakaminen',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              height: 3,
              fontSize: 25,
            )),
      ),
      const Padding(
        padding: EdgeInsets.symmetric(horizontal: 5, vertical: 20),
        child: Text(
            'Sovellus kerää käyttäjän sijaintitiedon ja säilöö sen pelastuslaitoksen käytettäväksi. Tapaturman sattuessa pelastuslaitos voi hyödyntää näitä tietoja pelastusoperaatiossa',
            style: TextStyle(
              height: 1,
              fontSize: 18,
            )),
      ),
      //
      Padding(
          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 20),
          child: TextButton(
            onPressed: () async {
              const url = "https://www.pallaksenpollot.com/privacypolicy";
              if (await canLaunchUrlString(url)) {
                await launchUrlString(url);
              } else {
                print('ERROR');
              }
            },
            child: const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "Privacy Policy",
                  textAlign: TextAlign.left,
                )),
          )),
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: <Widget>[
          const Text(' Sijainnin lähettäminen:', style: TextStyle(fontSize: 19)),
          FutureBuilder<bool?>(
              future: GpsHandler.loadGpsSetting(),
              builder: (context, _snapshot) {
                return Transform.scale(
                  scale: 1.5,
                  child: Switch(
                      value: _snapshot.data ?? false,
                      onChanged: (value) {
                        GpsHandler.setGpsSetting(context, value,
                                insistAlwaysOn: true)
                            .then((gpsOn) {
                          setState(() {
                            value = gpsOn;
                            setGpsSwitchState(value);
                          });
                        });
                      }),
                );
              })
        ],
      ),
      const Padding(
        padding: EdgeInsets.fromLTRB(1.0, 20.0, 80.0, 20.0),
        child: Text('Sijainti lähetetään palvelimelle 5 minuutin välein',
            textAlign: TextAlign.left,
            style: TextStyle(
              height: 1,
              fontSize: 16,
            )),
      ),

      Padding(
        padding: const EdgeInsets.fromLTRB(50.0, 75.0, 50.0, 15.0),
        child: ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
            _showDialog(context);
          },
          child: const Text(
            'Hätänappi',
          ),
          style: ElevatedButton.styleFrom(
              primary: Colors.red,
              fixedSize: const Size(150, 75),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(50))),
        ),
      ),

      const Padding(
        padding: EdgeInsets.fromLTRB(10.0, 15.0, 10.0, 10.0),
        child: Text(
            'Voit myös tarvittaessa soittaa\nPallaksen Pöllöjen päivystykseen.',
            style: TextStyle(
              height: 1,
              fontSize: 13,
            )),
      ),
      Padding(
        padding: const EdgeInsets.fromLTRB(10.0, 5.0, 10.0, 5.0),
        child: TextButton(
            onPressed: () => launch("tel:0405585493"),
            child: new Text("0405585493")),
      ),
    ]));
  }

  List<DropdownMenuItem<String>> get dropdownItems {
    List<DropdownMenuItem<String>> menuItems = [
      const DropdownMenuItem(child: Text("Lievä"), value: "Lievä"),
      const DropdownMenuItem(child: Text("Vakava"), value: "Vakava"),
    ];
    return menuItems;
  }

  String selectedValue = "Lievä";
  Future _showDialog(context) async {
    return await showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: Colors.red[200],
          title:  Text(
              'Painamalla hätänappia kaikki lähellä olevat sovelluksen käyttäjät saavat sijaintisi näkyviin.\n\nHUOM!\nVakavassa hädässä sovellus ${Platform.isIOS ? "aukaisee \"soita 112\" ilmoituksen näytön alareunaan jota painamalla puhelin soittaa hätänumeroon!" : " ohjaa automaattisesti 112 sovellukseen tai soittamaan hätänumeroon jos sovellusta ei ole ladattu!"}'),
          content: StatefulBuilder(
            builder: (BuildContext context, StateSetter setState) {
              return Column(mainAxisSize: MainAxisSize.min, children: <Widget>[
                Container(
                  height: 50.0,
                  width: 150.0,
                  alignment: Alignment.center,
                  margin: const EdgeInsets.fromLTRB(50, 20, 50, 50),
                  child: DropdownButton<String>(
                      style:
                          const TextStyle(color: Colors.black, fontSize: 30.0),
                      underline: Container(
                        height: 1,
                        width: 1,
                        color: Colors.black,
                        alignment: Alignment.center,
                      ),
                      value: selectedValue,
                      onChanged: (String? newValue) {
                        setState(() {
                          selectedValue = newValue!;
                        });
                      },
                      items: dropdownItems),
                ),
                FutureBuilder<bool?>(
                    future: GpsHandler.loadGpsSetting(),
                    builder: (context, _snapshot) {
                      return _helpButton(!(_snapshot.data ?? false), context);
                    })
              ]);
            },
          ),
        );
      },
    );
  }

  ElevatedButton _helpButton(bool gpsSettingIsOff, BuildContext contx) {
    return ElevatedButton(
      onPressed: () async {
        if (gpsSettingIsOff) {
          GpsHandler.setGpsSetting(contx, true, insistAlwaysOn: false)
              .then((gpsOn) async {
            if (gpsOn) {
              await GpsHandler.updateGpsVariable(ignoreSwitch: true);
              await ServerComms.messageToServer(locationMessage);
              if (selectedValue != "Lievä") {
                open112();
              }
              Navigator.of(contx).push(
                  MaterialPageRoute(builder: (contx) => HelpNeeded(true)));
            } else {
              showDialog<bool>(
                  context: contx,
                  builder: (contx) {
                    return AlertDialog(
                      title:
                          Text('Toiminto vaatii luvan käyttää laitteen GPS:ää'),
                      actions: [
                        ElevatedButton(
                          onPressed: () => Navigator.pop(contx),
                          child: Text('Ok'),
                        ),
                      ],
                    );
                  });
            }
          });
        } else {
          await ServerComms.messageToServer(locationMessage);
          if (selectedValue != "Lievä") {
            open112();
          }
          Navigator.of(contx)
              .push(MaterialPageRoute(builder: (contx) => HelpNeeded(false)));
        }
      },
      child: const Text(
        'Hälytä',
        style: TextStyle(
          color: Colors.black,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      style: ElevatedButton.styleFrom(
          primary: Colors.white,
          fixedSize: const Size(200, 75),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(50))),
    );
  }
}
