import 'package:flutter/material.dart';
import 'package:mobile_app/second_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

class FirstScreen extends StatelessWidget {
  const FirstScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: MyCustomForm(),
    );
  }
}

class MyCustomForm extends StatelessWidget {
  const MyCustomForm({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    TextEditingController fName = TextEditingController();
    TextEditingController lName = TextEditingController();

    return ListView(
      children: <Widget>[
        const SafeArea(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 7, vertical: 15),
            child: Text(
              'Tervetuloa!',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                height: 2,
                fontSize: 20,
              ),
            ),
          ),
        ),
        Container(
          margin: const EdgeInsets.all(15.0),
          padding: const EdgeInsets.all(3.0),
          decoration: BoxDecoration(border: Border.all(color: Colors.grey)),
          child: const Text(
              '\nSyötäthän oikean nimesi!\n\nNimeä käytetään sovelluksen GPS-toimintoon. Toiminnolla tuetaan Pallaksen Pöllöjä ja tarvittaessa pelastuslaitosta.\n',
              style: TextStyle(height: 1, fontSize: 15)),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          child: TextFormField(
            scrollPadding: const EdgeInsets.only(bottom: 40),
            controller: fName,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Anna etunimi',
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          child: TextFormField(
            scrollPadding: const EdgeInsets.only(bottom: 40),
            controller: lName,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Anna sukunimi',
            ),
          ),
        ),
        Center(
          child: ElevatedButton(
            child: const Text(
              'Seuraava',
            ),
            onPressed: () {
              int nameMaxLen = 30;
              if (fName.text.isEmpty || lName.text.isEmpty) {
                _showDialog(context, 'Täytä kaikki kentät!');
              } else if (fName.text.length > nameMaxLen || lName.text.length > nameMaxLen) {
                _showDialog(context, 'Yhden nimen enimmäispituus on ${nameMaxLen} merkkiä!');
              } else {
                _navigateToNextScreen(context, fName.text, lName.text);
              }
            },
            style: ElevatedButton.styleFrom(
                fixedSize: const Size(200, 50),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(50))),
          ),
        ),
        Center(
          child: Image.asset('assets/images/logo_transparent_black.png'),
        ),
      ],
    );
  }

  void _navigateToNextScreen(BuildContext context, String fName, String lName) {
    Future<SharedPreferences> prefs = SharedPreferences.getInstance();
    prefs.then((pref) {
      pref.setString('fName', fName);
      pref.setString('lName', lName);
    });
    Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const SecondScreen()),
        (route) => false);
  }
}

Future _showDialog(BuildContext context, String message) async {
  return await showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(message),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Ok'),
            ),
          ],
        );
      });
}
