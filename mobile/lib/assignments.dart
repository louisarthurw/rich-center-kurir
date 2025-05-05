import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile/assignmentDetail.dart';
import 'package:mobile/login.dart';
import 'package:mobile/main.dart';
import 'package:mobile/services/api/assignmentServices.dart';
import 'package:mobile/services/api/authServices.dart';
import 'package:nb_utils/nb_utils.dart';
import 'package:intl/intl.dart';

class AssignmentsPage extends StatefulWidget {
  const AssignmentsPage({super.key});

  @override
  State<AssignmentsPage> createState() => _AssignmentsPageState();
}

class _AssignmentsPageState extends State<AssignmentsPage> {
  bool isLoading = true;
  Map<String, dynamic>? assignmentData;
  List<Map<String, dynamic>> groupedAssignments = [];

  @override
  void initState() {
    _checkTokenExpiry();
    _getAllAssignments();
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

  Future<void> _getAllAssignments() async {
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
          await AssignmentServices().getAllAssignments(courier['id']);

      if (response['success'] == true) {
        final processedAssignments =
            await _processAssignments(response['data']);
        if (mounted) {
          setState(() {
            assignmentData = response['data'];
            groupedAssignments = processedAssignments;
            isLoading = false;
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

  Future<List<Map<String, dynamic>>> _processAssignments(
      Map<String, dynamic> data) async {
    List<Map<String, dynamic>> result = [];

    for (var entry in data.entries) {
      final dateString = entry.key;
      final assignments = entry.value;

      final utcDate = DateTime.parse(dateString);
      final jakartaDate = utcDate.add(const Duration(hours: 7));
      final formattedDate = _formatDate(jakartaDate);

      final pickupCount = assignments['pickup_details']?.length ?? 0;
      final deliveryCount = assignments['delivery_details']?.length ?? 0;

      String serviceName = 'Unknown Service';
      String serviceImage = '';

      if (pickupCount > 0) {
        try {
          final firstPickup = assignments['pickup_details'][0];
          if (firstPickup['service_id'] != null) {
            final serviceResponse = await AssignmentServices()
                .getServiceById(firstPickup['service_id']);
            if (serviceResponse['success'] == true) {
              serviceName = serviceResponse['data']['name'] ?? serviceName;
              serviceImage = serviceResponse['data']['image'] ?? serviceImage;
            }
          }
        } catch (e) {
          print('Error fetching service details: $e');
        }
      }

      result.add({
        'date': formattedDate,
        'pickupCount': pickupCount,
        'deliveryCount': deliveryCount,
        'originalDate': jakartaDate,
        'assignments': assignments,
        'serviceName': serviceName,
        'serviceImage': serviceImage,
      });
    }

    result.sort((a, b) => b['originalDate'].compareTo(a['originalDate']));

    return result;
  }

  String _formatDate(DateTime date) {
    try {
      return DateFormat("EEEE, d MMMM yyyy", "id_ID").format(date);
    } catch (e) {
      print('Error formatting date: $e');
      return DateFormat("d MMM yyyy").format(date);
    }
  }

  String _formatDateOnly(DateTime date) {
    return DateFormat("yyyy-MM-dd").format(date);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text('Assignments'),
        ),
        body: isLoading
            ? const Center(child: CircularProgressIndicator())
            : groupedAssignments.isEmpty
                ? const Center(child: Text('Anda tidak memiliki assignment.'))
                : ListView.builder(
                    padding: const EdgeInsets.all(16.0),
                    itemCount: groupedAssignments.length,
                    itemBuilder: (context, index) {
                      final assignment = groupedAssignments[index];
                      return _buildAssignmentSection(
                        label: assignment['date'],
                        date: assignment['originalDate'],
                        pickup: assignment['pickupCount'],
                        delivery: assignment['deliveryCount'],
                        serviceName: assignment['serviceName'],
                        serviceImage: assignment['serviceImage'],
                      );
                    },
                  ));
  }

  Widget _buildAssignmentSection({
    required String label,
    required DateTime date,
    required int pickup,
    required int delivery,
    required String serviceName,
    required String serviceImage,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        2.height,
        GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => AssignmentDetailPage(
                  date: _formatDateOnly(date),
                ),
              ),
            );
          },
          child: Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.black),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 72,
                  height: 72,
                  color: Colors.grey[300],
                  child: serviceImage.isNotEmpty
                      ? Image.network(serviceImage, fit: BoxFit.cover)
                      : const Icon(Icons.image, size: 40),
                ),
                8.width,
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        serviceName,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '$pickup Alamat Pengambilan',
                        style: const TextStyle(fontSize: 16),
                      ),
                      Text(
                        '$delivery Alamat Pengiriman',
                        style: const TextStyle(fontSize: 16),
                      ),
                    ],
                  ),
                )
              ],
            ),
          ),
        ),
      ],
    );
  }
}
