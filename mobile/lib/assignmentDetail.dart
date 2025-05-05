import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile/login.dart';
import 'package:mobile/main.dart';
import 'package:mobile/services/api/assignmentServices.dart';
import 'package:mobile/services/api/authServices.dart';
import 'package:nb_utils/nb_utils.dart';

class AssignmentDetailPage extends StatefulWidget {
  final String date;

  const AssignmentDetailPage({
    super.key,
    required this.date,
  });

  @override
  State<AssignmentDetailPage> createState() => _AssignmentDetailPageState();
}

class _AssignmentDetailPageState extends State<AssignmentDetailPage> {
  bool isLoading = true;
  Map<String, dynamic>? assignmentData;

  @override
  void initState() {
    _checkTokenExpiry();
    _getAssignment();
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

  Future<void> _getAssignment() async {
    try {
      final courierString = sp.getString('courier');
      if (courierString == null) {
        if (mounted) {
          setState(() {
            isLoading = false;
          });
        }
        return;
      }

      final courier = jsonDecode(courierString);
      final response =
          await AssignmentServices().getAssignment(courier['id'], widget.date);

      if (response['success'] == true) {
        if (mounted) {
          setState(() {
            assignmentData = response['data'];
            isLoading = false;
            print(assignmentData);
          });
        }
      }
    } catch (e) {
      toast('Error loading assignment data: $e');
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
        appBar: AppBar(
          title: Text('Detail Assignment'),
        ),
        body: isLoading
            ? const Center(child: CircularProgressIndicator())
            : const Center(child: Text('Fetched')));
  }
}
