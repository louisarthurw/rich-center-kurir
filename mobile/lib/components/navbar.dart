import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/assignments.dart';
import 'package:mobile/profile.dart';
import 'package:nb_utils/nb_utils.dart';

class Home extends ConsumerStatefulWidget {
  const Home({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _HomeState();
}

class _HomeState extends ConsumerState<Home> {
  int _selectedIndex = 1;

  final screens = [
    AssignmentsPage(),
    ProfilePage(),
  ];

  final listBottomNavigation = [
    BottomNavigationBarItem(
      icon: Icon(Icons.assignment_outlined),
      label: 'Assignments',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.person),
      label: 'Profile',
    ),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: white,
      body: screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: white,
        selectedItemColor: Colors.blue[400],
        unselectedItemColor: Colors.grey[400],
        selectedLabelStyle: TextStyle(fontWeight: FontWeight.w600),
        unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w400),
        showUnselectedLabels: true,
        items: listBottomNavigation,
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
    );
  }
}
