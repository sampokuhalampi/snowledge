import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter/material.dart';
import 'main_page.dart';
import 'package:http/http.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final ButtonStyle style = ElevatedButton.styleFrom(
      textStyle: const TextStyle(fontSize: 20),
    );
    final usernameController = TextEditingController();
    final passwordController = TextEditingController();

    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text('Username', style: TextStyle(fontSize: 25)),
            Padding(
              padding: const EdgeInsets.only(bottom: 25.0),
              child: SizedBox(
                width: 400,
                child: TextField(
                  controller: usernameController,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: 'Enter username',
                  ),
                ),
              ),
            ),
            const Text(
              'Password',
              style: TextStyle(fontSize: 25),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 25.0),
              child: SizedBox(
                width: 400,
                child: TextField(
                  obscureText: true,
                  controller: passwordController,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: 'Enter password',
                  ),
                  onSubmitted: ((value) {
                    navigateToMainScreen(context, usernameController.text, passwordController.text);
                  }),
                ),
              ),
            ),
            ElevatedButton(
              style: style,
              onPressed: () async {
                navigateToMainScreen(context, usernameController.text, passwordController.text);
              },
              child: const Text('Log in'),
            ),
          ],
        ),
      ),
    );
  }
}

void navigateToMainScreen(BuildContext context, String username, String password) async {
  String hashedPassword = sha256.convert(utf8.encode(password)).toString();
  print(hashedPassword);
  bool correct = await checkUserCredentials(username, hashedPassword);
  if (correct) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => Mainpage(username: username, password: hashedPassword),
      ),
    );
  } else {
    showDialog<String>(
      context: context,
      builder: (BuildContext context) => AlertDialog(
        title: const Text('Error'),
        content: const Text('Incorrect login information entered.'),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.pop(context, 'OK'),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}

Future<bool> checkUserCredentials(String username, String password) async {
  bool result = false;
  String url = 'https://pallas.lumisovellus.fi/data/api/login';

  Response response = await get(
    Uri.parse(url),
    headers: {
      'Authorization': '$username:$password',
    },
  );

  result = response.statusCode == 200;

  return result;
}
