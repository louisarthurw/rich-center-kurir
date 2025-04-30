import 'package:flutter/material.dart';
import 'package:mobile/login.dart';
import 'package:mobile/services/api/auth/authServices.dart';

class AssignmentsPage extends StatefulWidget {
  const AssignmentsPage({super.key});

  @override
  State<AssignmentsPage> createState() => _AssignmentsPageState();
}

class _AssignmentsPageState extends State<AssignmentsPage> {
  @override
  void initState() {
    _checkTokenExpiry();
    super.initState();
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
        title: const Text('Assignments'),
      ),
    );
  }
}
