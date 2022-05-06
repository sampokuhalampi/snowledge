import 'package:flutter/material.dart';
import 'package:mobile_app/side_bar/gps_handler.dart';
import 'package:mobile_app/widgets_binding_observer_state.dart';
import 'main_page.dart';

class SecondScreen extends StatefulWidget {
  const SecondScreen({Key? key}) : super(key: key);

  @override
  WidgetsBindingObserverState<SecondScreen> createState() =>
      _SecondScreenState();
}

class _SecondScreenState extends WidgetsBindingObserverState<SecondScreen> {
  @override
  void initState() {
    super.initState();
    setAppResumedWithAlwaysOnPermissionsTask(() => {
          Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (context) => const MainPage()),
              (route) => false)
        });
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: AskPermission(),
    );
  }
}

class AskPermission extends StatelessWidget {
  const AskPermission({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.center, children: <
        Widget>[
      const SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 7, vertical: 15),
          child: Text('Sovellus tarvitsee luvan käyttää laitteen sijaintia',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                height: 2,
                fontSize: 20,
              )),
        ),
      ),
      Container(
        margin: const EdgeInsets.all(15.0),
        padding: const EdgeInsets.all(10.0),
        decoration: BoxDecoration(border: Border.all(color: Colors.grey)),
        child: const Text(
            'Sovellus tarvitsee luvan käyttää sijaintia myös näytön ollessa kiinni.\n\nSallitko sijaintiedon keräämisen sovelluksen ollessa taustalla?\n\n*Luvat on mahdollista antaa myös myöhemmässä vaiheessa',
            style: TextStyle(height: 1, fontSize: 15)),
      ),
      Padding(
        padding: const EdgeInsets.fromLTRB(7, 100, 7, 15),
        child: Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: <
            Widget>[
          ElevatedButton(
            onPressed: () {
              Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (context) => const MainPage()),
                  (route) => false);
            },
            child: const Text(
              'Ohita',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.black,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            style: ElevatedButton.styleFrom(
                fixedSize: const Size(170, 70),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10))),
          ),
          ElevatedButton(
            onPressed: () async {
              if (await GpsHandler.checkAndAskGpsAlwaysOnPermission(context)) {
                Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (context) => const MainPage()),
                    (route) => false);
              }
            },
            child: const Text(
              'Anna luvat',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.black,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            style: ElevatedButton.styleFrom(
                fixedSize: const Size(170, 70),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10))),
          ),
        ]),
      ),
      Expanded(
          child: Align(
        alignment: Alignment.bottomCenter,
        child: Image.asset('assets/images/logo_transparent_black.png'),
      )),
    ]);
  }
}
