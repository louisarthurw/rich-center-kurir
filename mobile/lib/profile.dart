import 'package:flutter/material.dart';
import 'package:mobile/login.dart';
import 'package:mobile/services/api/auth/authServices.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  @override
  void initState() {
    _checkTokenExpiry();
    super.initState();
  }
  
  Future<void> _logout() async {
    await AuthServices.clearSession();

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => const Login()),
      (Route<dynamic> route) => false,
    );
  }

  Future<void> _checkTokenExpiry() async {
    final isValid = await AuthServices.isTokenValid();
    if (!isValid && mounted) {
      await AuthServices.clearSession();
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => Login()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
            tooltip: 'Logout',
          ),
        ],
      ),
    );
  }
}
