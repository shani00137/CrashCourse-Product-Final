import 'package:badges/badges.dart' as badges;
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/src/foundation/key.dart';
import 'package:flutter/src/widgets/framework.dart';
import 'package:lottie/lottie.dart';

class MenuBox extends StatelessWidget {
  MenuBox(
      {required this.isNotified,
      required this.onPress,
      required this.icon,
      required this.tille,
      required this.count});
  final VoidCallback onPress;
  final String icon;
  String tille;
  int count;
  final bool isNotified;

  @override
  Widget build(BuildContext context) {
    return Card(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(15.0),
        ),
        elevation: 5, // Change this
        shadowColor: Colors.orange[900],
        child: InkWell(
          onTap: onPress,
          child: Container(
            height: 130,
            width: MediaQuery.of(context).size.width / 2.2,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                isNotified
                    ? badges.Badge(
                        showBadge: count == 0 ? false : true,
                        badgeContent: Text(
                          '$count',
                          style: TextStyle(color: Colors.white),
                        ),
                        child: Lottie.asset('$icon',width: 120,height: 90),
                      )
                    :  Lottie.asset('$icon',width: 120,height: 90 ),
                SizedBox(
                  height: 5,
                ),
                Text(
                  '$tille',
                  style: TextStyle(color: Colors.orange[900]),
                )
              ],
            ),
          ),
        ));
  }
}
