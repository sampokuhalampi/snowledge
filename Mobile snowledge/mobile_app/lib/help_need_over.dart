import 'package:flutter/material.dart';
import 'main_page.dart';

class HelpOver extends StatelessWidget {
  const HelpOver({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    print(context.toString());
    return const Scaffold(
      body: OverPopUp(),
    );
  }
}

class OverPopUp extends StatelessWidget {
  const OverPopUp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: <Widget>[
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 75, vertical: 150),
            child: Text('Avuntarve ohi\nKiitos avusta!',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  height: 3,
                  fontSize: 30,
                )),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(50, 100, 50, 25),
            child: ElevatedButton(
              child: const Text(
                'OK',
              ),
              onPressed: () {
                Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (context) => const MainPage()),
                    (route) => false);
              },
              style: ElevatedButton.styleFrom(
                  fixedSize: const Size(200, 50),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(50))),
            ),
          ),
        ],
      ),
    );
  }
}
