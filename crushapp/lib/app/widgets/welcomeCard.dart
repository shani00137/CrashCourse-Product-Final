import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class WelComeCard extends StatelessWidget {
  const WelComeCard(
      {required this.onPressed,
      required this.name,
      required this.email,
      required this.mobile});
  final String name;
  final String email;
  final String mobile;
  final VoidCallback onPressed;
  @override
  Widget build(BuildContext context) {
    return InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Container(
            height: 120,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                    color: Colors.black26,
                    offset: Offset(0, 1),
                    blurRadius: 3.0)
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(10.0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: MediaQuery.of(context).size.width / 1.2,
                        child: Center(
                          child: Text(
                            '$name',
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                                fontSize: 25,
                                color: Colors.orange[900],
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 8,
                      ),
                      email != "null"
                          ? Text(
                              '$email',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.orange[900],
                              ),
                            )
                          : Text(''),
                      SizedBox(
                        height: 8,
                      ),
                      mobile != "null"
                          ? Text(
                              '$mobile',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.orange[900],
                              ),
                            )
                          : Text(''),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ));
  }
}
