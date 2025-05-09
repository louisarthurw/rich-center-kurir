import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:mobile/login.dart';
import 'package:mobile/main.dart';
import 'package:mobile/services/api/assignmentServices.dart';
import 'package:mobile/services/api/authServices.dart';
import 'package:nb_utils/nb_utils.dart';

class AssignmentDetailPage extends StatefulWidget {
  final dynamic id;
  final String date;

  const AssignmentDetailPage({
    super.key,
    required this.id,
    required this.date,
  });

  @override
  State<AssignmentDetailPage> createState() => _AssignmentDetailPageState();
}

class _AssignmentDetailPageState extends State<AssignmentDetailPage> {
  bool isLoading = true;
  Map<String, dynamic>? assignmentData;
  Map<String, dynamic>? _selectedMarkerData;
  GoogleMapController? mapController;

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
        if (mounted) setState(() => isLoading = false);
        return;
      }

      final courier = jsonDecode(courierString);

      final response = widget.id == null
          ? await AssignmentServices().getAssignment(courier['id'], widget.date)
          : await AssignmentServices().getAssignmentByOrderId(courier['id'], widget.id);

      if (response['success'] == true && mounted) {
        setState(() {
          assignmentData = response['data'];
          isLoading = false;
        });
      }
    } catch (e) {
      toast('Error loading assignment data: $e');
      if (mounted) setState(() => isLoading = false);
    }
  }

  Set<Marker> _buildMarkers() {
    final Set<Marker> markers = {};

    final pickupList = assignmentData?['pickup_details'] ?? [];
    for (int i = 0; i < pickupList.length; i++) {
      final item = pickupList[i];
      final lat = double.tryParse(item['lat'] ?? '');
      final lng = double.tryParse(item['long'] ?? '');

      if (lat != null && lng != null) {
        markers.add(Marker(
          markerId: MarkerId('pickup_$i'),
          position: LatLng(lat, lng),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
          onTap: () {
            setState(() {
              _selectedMarkerData = {
                'type': 'pickup',
                'name': item['pickup_name'],
                'phone': item['pickup_phone_number'],
                'address': item['pickup_address'],
                'notes': item['pickup_notes'] ?? '',
                'take_on_behalf': item['take_package_on_behalf_of'] ?? '',
              };
            });
          },
        ));
      }
    }

    final deliveryGroups = assignmentData?['delivery_details'] ?? [];
    for (int i = 0; i < deliveryGroups.length; i++) {
      final group = deliveryGroups[i];
      for (int j = 0; j < group.length; j++) {
        final item = group[j];
        final lat = double.tryParse(item['lat'] ?? '');
        final lng = double.tryParse(item['long'] ?? '');

        if (lat != null && lng != null) {
          markers.add(Marker(
            markerId: MarkerId('delivery_${i}_$j'),
            position: LatLng(lat, lng),
            icon:
                BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
            onTap: () {
              setState(() {
                _selectedMarkerData = {
                  'type': 'delivery',
                  'id': item['order_detail_id'],
                  'name': item['delivery_name'],
                  'phone': item['delivery_phone_number'],
                  'address': item['delivery_address'],
                  'sender_name': item['sender_name'] ?? '',
                  'address_status': item['address_status'],
                  'proof_image': item['proof_image'] ?? '',
                };
              });
            },
          ));
        }
      }
    }

    return markers;
  }

  Widget _buildOverlayCard(Map<String, dynamic> data) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 6)],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  data['address'] ?? '-',
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
              GestureDetector(
                onTap: () => setState(() => _selectedMarkerData = null),
                child: const Icon(Icons.close),
              ),
            ],
          ),
          20.height,
          _infoLine("Nama", data['name'] ?? '-'),
          _infoLine("Nomor Telepon", data['phone'] ?? '-'),
          20.height,
          if (data['type'] == 'pickup') ...[
            _infoLine("Catatan",
                data['notes']?.isNotEmpty == true ? data['notes']! : "-"),
            _infoLine("Ambil paket di rumah orang lain",
                data['take_on_behalf']?.isNotEmpty == true ? "Ya" : "Tidak"),
            _infoLine(
                "Ambil kiriman atas nama",
                data['take_on_behalf']?.isNotEmpty == true
                    ? data['take_on_behalf']!
                    : "-"),
          ],
          if (data['type'] == 'delivery') ...[
            _infoLine("Dropship",
                data['sender_name']?.isNotEmpty == true ? "Ya" : "Tidak"),
            _infoLine(
                "Nama Pengirim",
                data['sender_name']?.isNotEmpty == true
                    ? data['sender_name']!
                    : "-"),
            // _infoLine("Status Pengiriman", data['address_status'] ?? "-"),
            // _infoLine(
            //     "Bukti Foto",
            //     data['proof_image']?.isNotEmpty == true
            //         ? data['proof_image']
            //         : "-"),
            // _infoLine("ID", data['id'].toString()),
          ],
        ],
      ),
    );
  }

  Widget _infoLine(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: RichText(
        text: TextSpan(
          style: const TextStyle(color: Colors.black),
          children: [
            TextSpan(
                text: "$label: ",
                style: const TextStyle(fontWeight: FontWeight.bold)),
            TextSpan(text: value),
          ],
        ),
      ),
    );
  }

  LatLng _getInitialCameraPosition() {
    final deliveryGroups = assignmentData?['delivery_details'];

    if (deliveryGroups != null && deliveryGroups.isNotEmpty) {
      final cluster = deliveryGroups[0];
      if (cluster.isNotEmpty) {
        final centroidStr = cluster[0]['cluster_centroid'];
        if (centroidStr != null && centroidStr.isNotEmpty) {
          final parts = centroidStr.split(',');

          if (parts.length == 2) {
            final lat = double.tryParse(parts[0].trim());
            final lng = double.tryParse(parts[1].trim());

            if (lat != null && lng != null) {
              return LatLng(lat, lng);
            }
          }
        }
      }
    }

    return const LatLng(-7.2575, 112.7521);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detail Assignment')),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Stack(
              children: [
                GoogleMap(
                  onMapCreated: (controller) => mapController = controller,
                  initialCameraPosition: CameraPosition(
                    target: _getInitialCameraPosition(),
                    zoom: 13,
                  ),
                  markers: _buildMarkers(),
                  onTap: (_) => setState(() => _selectedMarkerData = null),
                  mapToolbarEnabled: false,
                ),
                if (_selectedMarkerData != null)
                  Positioned(
                    top: _selectedMarkerData!['type'] == 'pickup' ? 40 : 60,
                    left: 0,
                    right: 0,
                    child: _buildOverlayCard(_selectedMarkerData!),
                  ),
              ],
            ),
    );
  }
}
