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
      print('error: $e');
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

      final List<dynamic> pickupDetails = assignments['pickup_details'] ?? [];
      final List<dynamic> deliveryDetails =
          assignments['delivery_details'] ?? [];

      // Untuk service id 1 dan 2, group by date
      final regularServices = pickupDetails.where((pickup) {
        final serviceId = pickup['service_id'] as int?;
        return serviceId == 1 || serviceId == 2;
      }).toList();

      if (regularServices.isNotEmpty) {
        String serviceName = 'Unknown Service';
        String serviceImage = '';

        try {
          final firstPickup = regularServices[0] as Map<String, dynamic>;
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

        // Hitung jumlah pickup dan delivery untuk service 1 dan 2
        final regularPickupCount = regularServices.length;
        final regularDeliveryCount = deliveryDetails.where((delivery) {
          final deliveryMap = delivery as Map<String, dynamic>;
          return regularServices.any((pickup) {
            final pickupMap = pickup as Map<String, dynamic>;
            return pickupMap['order_id'] == deliveryMap['order_id'];
          });
        }).length;

        if (regularPickupCount > 0) {
          result.add({
            'id': null,
            'date': formattedDate,
            'pickupCount': regularPickupCount,
            'deliveryCount': regularDeliveryCount,
            'originalDate': jakartaDate,
            'assignments': {
              'pickup_details': regularServices,
              'delivery_details': deliveryDetails.where((delivery) {
                final deliveryMap = delivery as Map<String, dynamic>;
                return regularServices.any((pickup) {
                  final pickupMap = pickup as Map<String, dynamic>;
                  return pickupMap['order_id'] == deliveryMap['order_id'];
                });
              }).toList()
            },
            'serviceName': serviceName,
            'serviceImage': serviceImage,
            'isGrouped': true,
          });
        }
      }

      // Untuk service id 3 dan 4, buat per order (tidak digroup)
      final specialServices = pickupDetails.where((pickup) {
        final serviceId = pickup['service_id'] as int?;
        return serviceId == 3 || serviceId == 4;
      }).toList();

      for (var pickup in specialServices) {
        final pickupMap = pickup as Map<String, dynamic>;
        String serviceName = 'Unknown Service';
        String serviceImage = '';

        try {
          if (pickupMap['service_id'] != null) {
            final serviceResponse = await AssignmentServices()
                .getServiceById(pickupMap['service_id']);
            if (serviceResponse['success'] == true) {
              serviceName = serviceResponse['data']['name'] ?? serviceName;
              serviceImage = serviceResponse['data']['image'] ?? serviceImage;
            }
          }
        } catch (e) {
          print('Error fetching service details: $e');
        }

        // Hitung delivery untuk order ini saja
        final orderDeliveries = deliveryDetails.where((delivery) {
          final deliveryMap = delivery as Map<String, dynamic>;
          return deliveryMap['order_id'] == pickupMap['order_id'];
        }).toList();

        result.add({
          'id': pickupMap['order_id'],
          'date': formattedDate,
          'pickupCount': 1,
          'deliveryCount': orderDeliveries.length,
          'originalDate': jakartaDate,
          'assignments': {
            'pickup_details': [pickup],
            'delivery_details': orderDeliveries
          },
          'serviceName': serviceName,
          'serviceImage': serviceImage,
          'isGrouped': false,
        });
      }
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
              : _buildGroupedAssignments(),
    );
  }

  Widget _buildGroupedAssignments() {
    final Map<String, List<Map<String, dynamic>>> groupedByDate = {};

    for (final assignment in groupedAssignments) {
      final dateKey = assignment['date'];
      if (!groupedByDate.containsKey(dateKey)) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey]!.add(assignment);
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16.0),
      itemCount: groupedByDate.length,
      itemBuilder: (context, index) {
        final dateKey = groupedByDate.keys.elementAt(index);
        final assignmentsForDate = groupedByDate[dateKey]!;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              dateKey,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            2.height,
            ...assignmentsForDate
                .map((assignment) => _buildAssignmentItem(
                      id: assignment['id'],
                      date: assignment['originalDate'],
                      pickup: assignment['pickupCount'],
                      delivery: assignment['deliveryCount'],
                      serviceName: assignment['serviceName'],
                      serviceImage: assignment['serviceImage'],
                    ))
                .toList(),
          ],
        );
      },
    );
  }

  Widget _buildAssignmentItem({
    required dynamic id,
    required DateTime date,
    required int pickup,
    required int delivery,
    required String serviceName,
    required String serviceImage,
  }) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => AssignmentDetailPage(
              id: id,
              date: _formatDateOnly(date),
            ),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.black, width: 2),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                  color: Colors.grey[300],
                  border: Border.all(
                    color: Colors.black,
                  )),
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
    );
  }
}
