import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'package:location/location.dart';
import 'package:mime/mime.dart';
import 'package:mobile/login.dart';
import 'package:mobile/main.dart';
import 'package:mobile/services/api/assignmentServices.dart';
import 'package:mobile/services/api/authServices.dart';
import 'package:mobile/services/constResources.dart';
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

  PolylinePoints polylinePoints = PolylinePoints();
  // menyimpan koordinat yang akan dilalui rute
  Map<PolylineId, Polyline> polylines = {};
  // menyimpan koordinat semua lokasi yang sudah diurutkan
  List<LatLng> routePoints = [];
  // menyimpan semua lokasi yang akan dilalui (tidak urut) dan detailnya
  List<Map<String, dynamic>> courierRouteSequence = [];
  String? initialCoordinate;

  final Location _location = Location();
  bool _isGeneratingRoute = false;

  File? _selectedImage;
  bool _isUploading = false;

  @override
  void initState() {
    _checkTokenExpiry();
    _getAssignment();
    super.initState();
  }

  Future<void> _checkTokenExpiry() async {
    final isValid = await AuthServices.isTokenValid();
    if (!isValid && mounted) {
      final courierString = sp.getString('courier');
      if (courierString == null) return;
      final courier = jsonDecode(courierString);
      int courierId = courier['id'];

      await AuthServices()
          .deleteFCMToken(courierId, sp.getString('fcm_token')!);

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
          : await AssignmentServices()
              .getAssignmentByOrderId(courier['id'], widget.id);

      if (response['success'] == true && mounted) {
        setState(() {
          assignmentData = response['data'];
          isLoading = false;
        });
        _buildRouteSequence();
      }
    } catch (e) {
      toast('Error loading assignment data: $e');
      if (mounted) setState(() => isLoading = false);
    }
  }

  void _buildRouteSequence() {
    if (assignmentData == null) return;

    final courierString = sp.getString('courier');
    if (courierString == null) return;
    final courier = jsonDecode(courierString);
    int courierId = courier['id'];

    courierRouteSequence.clear();
    routePoints.clear();
    polylines.clear();

    bool hasRouteSequence = false;

    final deliveryGroups = assignmentData?['delivery_details'] ?? [];
    if (deliveryGroups.isNotEmpty && deliveryGroups[0].isNotEmpty) {
      initialCoordinate =
          deliveryGroups[0][0]['initial_coordinate']?.toString();
    }

    // ambil koordinat awal kurir, simpan di courierRouteSequence
    if (initialCoordinate != null && initialCoordinate!.isNotEmpty) {
      final parts = initialCoordinate!.split(',');
      if (parts.length == 2) {
        final lat = double.tryParse(parts[0].trim());
        final lng = double.tryParse(parts[1].trim());
        if (lat != null && lng != null) {
          courierRouteSequence.add({
            'type': 'initial',
            'position': LatLng(lat, lng),
            'visit_order': 0,
            'title': 'Starting Point',
          });
          routePoints.add(LatLng(lat, lng));
          hasRouteSequence = true;
        }
      }
    }

    // rute hanya ada saat sudah generate route (ada koordinat awal kurir)
    if (hasRouteSequence) {
      // ambil koordinat pickup, simpan di courierRouteSequence
      final pickupList = assignmentData?['pickup_details'] ?? [];
      for (final pickup in pickupList) {
        try {
          final courierIdsStr = pickup['courier_id']?.toString();
          final visitOrdersStr = pickup['visit_order']?.toString();

          if (courierIdsStr == null || visitOrdersStr == null) continue;

          final courierIds = courierIdsStr
              .split(',')
              .map((e) => int.tryParse(e.trim()))
              .whereType<int>()
              .toList();
          final visitOrders = visitOrdersStr
              .split(',')
              .map((e) => int.tryParse(e.trim()))
              .whereType<int>()
              .toList();

          if (courierIds.isEmpty || visitOrders.isEmpty) continue;

          final courierIndex = courierIds.indexOf(courierId);
          if (courierIndex != -1 && courierIndex < visitOrders.length) {
            final visitOrder = visitOrders[courierIndex];
            final lat = double.tryParse(pickup['lat']?.toString() ?? '');
            final lng = double.tryParse(pickup['long']?.toString() ?? '');

            if (lat != null && lng != null) {
              courierRouteSequence.add({
                'type': 'pickup',
                'position': LatLng(lat, lng),
                'visit_order': visitOrder,
                'data': pickup,
                'title': pickup['pickup_name']?.toString() ?? 'Pickup Location',
                'address': pickup['pickup_address']?.toString() ??
                    'Alamat Pengambilan',
              });
            }
          }
        } catch (e) {
          debugPrint('Error processing pickup location: $e');
        }
      }

      // ambil koordinat delivery, simpan di courierRouteSequence
      for (final group in deliveryGroups) {
        for (final delivery in group) {
          try {
            final deliveryCourierId = delivery['courier_id'];
            final visitOrder = delivery['visit_order'];

            if (deliveryCourierId != courierId || visitOrder == null) continue;

            final lat = double.tryParse(delivery['lat']?.toString() ?? '');
            final lng = double.tryParse(delivery['long']?.toString() ?? '');

            if (lat != null && lng != null) {
              courierRouteSequence.add({
                'type': 'delivery',
                'position': LatLng(lat, lng),
                'visit_order': visitOrder is int
                    ? visitOrder
                    : int.tryParse(visitOrder.toString()) ?? 0,
                'data': delivery,
                'title': delivery['delivery_name']?.toString() ??
                    'Delivery Location',
                'address': delivery['delivery_address']?.toString() ??
                    'Alamat Pengiriman',
              });
            }
          } catch (e) {
            debugPrint('Error processing delivery location: $e');
          }
        }
      }

      // urutkan berdasarkan visit order
      courierRouteSequence.sort((a, b) {
        final aOrder = a['visit_order'] as int;
        final bOrder = b['visit_order'] as int;
        return aOrder.compareTo(bOrder);
      });

      // simpan urutan koordinat yang harus dituju berdasarkan visit order
      routePoints.clear();
      for (var point in courierRouteSequence) {
        routePoints.add(point['position'] as LatLng);
      }

      // buat polyline (rute)
      if (routePoints.length > 1) {
        _getPolyline();
      }
    }

    setState(() {});
  }

  Future<void> _getPolyline() async {
    if (routePoints.length < 2) return;

    try {
      List<PointLatLng> points = routePoints
          .map((latLng) => PointLatLng(latLng.latitude, latLng.longitude))
          .toList();

      PolylineResult result = await polylinePoints.getRouteBetweenCoordinates(
        googleApiKey: GOOGLE_MAPS_API_KEY,
        request: PolylineRequest(
          origin: points.first,
          destination: points.last,
          mode: TravelMode.driving,
          wayPoints: points.length > 2
              ? points
                  .sublist(1, points.length - 1)
                  .map((p) => PolylineWayPoint(
                      location: "${p.latitude},${p.longitude}"))
                  .toList()
              : [],
        ),
      );

      if (result.points.isNotEmpty) {
        List<LatLng> polylineCoordinates = result.points
            .map((point) => LatLng(point.latitude, point.longitude))
            .toList();

        PolylineId id = PolylineId('route');
        Polyline polyline = Polyline(
          polylineId: id,
          color: Colors.blue,
          points: polylineCoordinates,
          width: 4,
        );

        setState(() {
          polylines[id] = polyline;
        });
      }
    } catch (e) {
      debugPrint('Error getting polyline: $e');
    }
  }

  Set<Marker> _buildMarkers() {
    final Set<Marker> markers = {};

    final deliveryGroups = assignmentData?['delivery_details'] ?? [];
    final pickupList = assignmentData?['pickup_details'] ?? [];
    final courierString = sp.getString('courier');
    final courier = courierString != null ? jsonDecode(courierString) : null;
    final courierId = courier?['id'];

    // pickup markers
    for (int i = 0; i < pickupList.length; i++) {
      try {
        final pickup = pickupList[i];
        final lat = double.tryParse(pickup['lat']?.toString() ?? '');
        final lng = double.tryParse(pickup['long']?.toString() ?? '');

        if (lat != null && lng != null) {
          dynamic visitOrder;
          final courierIdsStr = pickup['courier_id']?.toString();
          final visitOrdersStr = pickup['visit_order']?.toString();

          if (courierId != null &&
              courierIdsStr != null &&
              visitOrdersStr != null) {
            try {
              final courierIds =
                  courierIdsStr.split(',').map((e) => e.trim()).toList();
              final visitOrders =
                  visitOrdersStr.split(',').map((e) => e.trim()).toList();

              final index = courierIds.indexOf(courierId.toString());
              if (index != -1 && index < visitOrders.length) {
                visitOrder = int.tryParse(visitOrders[index]) ?? 0;
              }
            } catch (e) {
              debugPrint('Error parsing visit order: $e');
            }
          }

          markers.add(Marker(
            markerId: MarkerId('pickup_$i'),
            position: LatLng(lat, lng),
            icon:
                BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
            onTap: () {
              setState(() {
                _selectedMarkerData = {
                  'type': 'pickup',
                  'name': pickup['pickup_name']?.toString() ?? '',
                  'phone': pickup['pickup_phone_number']?.toString() ?? '',
                  'address': pickup['pickup_address']?.toString() ?? '',
                  'notes': pickup['pickup_notes']?.toString() ?? '',
                  'take_on_behalf':
                      pickup['take_package_on_behalf_of']?.toString() ?? '',
                  'item_type': pickup['type']?.toString() ?? '',
                  'size':
                      '${pickup['length']?.toString() ?? ''} x ${pickup['width']?.toString() ?? ''} x ${pickup['height']?.toString() ?? ''}',
                  'visit_order': visitOrder,
                };
              });
            },
          ));
        }
      } catch (e) {
        debugPrint('Error creating pickup marker: $e');
      }
    }

    // delivery markers
    int deliveryIndex = 0;
    for (final group in deliveryGroups) {
      for (final delivery in group) {
        try {
          if (courierId != null && delivery['courier_id'] != courierId)
            continue;

          final lat = double.tryParse(delivery['lat']?.toString() ?? '');
          final lng = double.tryParse(delivery['long']?.toString() ?? '');

          if (lat != null && lng != null) {
            markers.add(Marker(
              markerId: MarkerId('delivery_${deliveryIndex++}'),
              position: LatLng(lat, lng),
              icon: BitmapDescriptor.defaultMarkerWithHue(
                  BitmapDescriptor.hueRed),
              onTap: () {
                setState(() {
                  _selectedMarkerData = {
                    'type': 'delivery',
                    'id': delivery['order_detail_id']?.toString(),
                    'name': delivery['delivery_name']?.toString() ?? '',
                    'phone':
                        delivery['delivery_phone_number']?.toString() ?? '',
                    'address': delivery['delivery_address']?.toString() ?? '',
                    'notes': delivery['delivery_notes']?.toString() ?? '',
                    'sender_name': delivery['sender_name']?.toString() ?? '',
                    'address_status': delivery['address_status']?.toString(),
                    'proof_image': delivery['proof_image']?.toString(),
                    'proof_coordinate':
                        delivery['proof_coordinate']?.toString(),
                    'visit_order': delivery['visit_order'],
                  };
                });
              },
            ));
          }
        } catch (e) {
          debugPrint('Error creating delivery marker: $e');
        }
      }
    }

    // initial marker (posisi awal kurir)
    for (int i = 0; i < courierRouteSequence.length; i++) {
      try {
        final point = courierRouteSequence[i];
        if (point['type'] == 'initial') {
          final position = point['position'] as LatLng;
          markers.add(Marker(
            markerId: MarkerId('initial_$i'),
            position: position,
            icon: BitmapDescriptor.defaultMarkerWithHue(
                BitmapDescriptor.hueYellow),
            onTap: () {
              setState(() {
                _selectedMarkerData = {
                  'type': 'initial',
                  'position': position,
                  'visit_order': point['visit_order'],
                  'title': point['title'] as String,
                };
              });
            },
          ));
        }
      } catch (e) {
        debugPrint('Error creating initial marker: $e');
      }
    }

    return markers;
  }

  Future<void> _handleImagePick(bool fromCamera) async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: fromCamera ? ImageSource.camera : ImageSource.gallery,
      );

      if (pickedFile != null) {
        setState(() => _selectedImage = File(pickedFile.path));
        await _uploadProofImage();
      }
    } catch (e) {
      toast('Error picking image: $e');
    }
  }

  Future<void> _uploadProofImage() async {
    if (_selectedImage == null || _selectedMarkerData == null) return;

    setState(() => _isUploading = true);

    try {
      // cek apakah location sevice aktif
      bool serviceEnabled = await _location.serviceEnabled();
      if (!serviceEnabled) {
        serviceEnabled = await _location.requestService();
        if (!serviceEnabled) {
          toast('Location services are disabled. Please enable them.');
          return;
        }
      }

      // cek apakah punya permission untuk mengambil lokasi
      PermissionStatus permissionStatus = await _location.hasPermission();
      if (permissionStatus == PermissionStatus.denied) {
        permissionStatus = await _location.requestPermission();
        if (permissionStatus != PermissionStatus.granted) {
          toast('Location permission is required to generate routes.');
          return;
        }
      }

      // ambil current location
      LocationData locationData = await _location.getLocation();

      // Convert image to base64
      final bytes = await _selectedImage!.readAsBytes();
      final mimeType = lookupMimeType(_selectedImage!.path);
      final base64Image = 'data:$mimeType;base64,${base64Encode(bytes)}';
      print(
          'id: ${_selectedMarkerData!['id']}, base64img: $base64Image, location: ${locationData.latitude},${locationData.longitude}');

      // Upload proof
      final response = await AssignmentServices.uploadProofImage(
        int.parse(_selectedMarkerData!['id']),
        base64Image,
        "${locationData.latitude},${locationData.longitude}",
        assignmentData,
      );

      if (response['success'] == true && mounted) {
        toast(response['message']);
        print('message: ${response['message']}');
        // Refresh the data
        await _getAssignment();
        setState(() {
          _selectedMarkerData = null;
          _selectedImage = null;
        });
      } else {
        toast(response['error'] ?? 'Gagal mengupload bukti foto');
      }
    } catch (e) {
      toast('Error upload bukti foto: $e');
    } finally {
      if (mounted) setState(() => _isUploading = false);
    }
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
                    data['type'] == 'initial'
                        ? 'Lokasi Awal Kurir'
                        : data['address']?.toString() ?? '-',
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 16)),
              ),
              GestureDetector(
                onTap: () => setState(() => _selectedMarkerData = null),
                child: const Icon(Icons.close),
              ),
            ],
          ),
          20.height,
          if (data['visit_order'] != null && !_showGenerateRouteButton())
            _infoLine("Urutan Rute", data['visit_order'].toString()),
          if (data['type'] != 'initial') ...[
            _infoLine("Nama", data['name']?.toString() ?? '-'),
            _infoLine("Nomor Telepon", data['phone']?.toString() ?? '-'),
            _infoLine(
                "Catatan",
                data['notes']?.toString().isNotEmpty == true
                    ? data['notes']!.toString()
                    : "-"),
            20.height,
          ],
          if (data['type'] == 'pickup') ...[
            _infoLine(
                "Ambil paket di rumah orang lain",
                data['take_on_behalf']?.toString().isNotEmpty == true
                    ? "Ya"
                    : "Tidak"),
            _infoLine(
                "Ambil kiriman atas nama",
                data['take_on_behalf']?.toString().isNotEmpty == true
                    ? data['take_on_behalf']!.toString()
                    : "-"),
            20.height,
            _infoLine("Jenis Barang", data['item_type']!.toString()),
            _infoLine("Ukuran Setiap Barang", data['size']!.toString()),
          ],
          if (data['type'] == 'delivery') ...[
            _infoLine(
                "Dropship",
                data['sender_name']?.toString().isNotEmpty == true
                    ? "Ya"
                    : "Tidak"),
            _infoLine(
                "Nama Pengirim",
                data['sender_name']?.toString().isNotEmpty == true
                    ? data['sender_name']!.toString()
                    : "-"),
            if (data['address_status'] != 'delivered' &&
                !_showGenerateRouteButton())
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 16),
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Upload Bukti Foto:',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 2),
                  _isUploading
                      ? const CircularProgressIndicator()
                      : Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                icon: const Icon(
                                  Icons.camera_alt,
                                  color: Colors.white,
                                ),
                                label: const Text('Ambil Foto'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.blue,
                                  foregroundColor: Colors.white,
                                ),
                                onPressed: () => _handleImagePick(true),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: ElevatedButton.icon(
                                icon: const Icon(
                                  Icons.photo_library,
                                  color: Colors.white,
                                ),
                                label: const Text('Dari Gallery'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.blue,
                                  foregroundColor: Colors.white,
                                ),
                                onPressed: () => _handleImagePick(false),
                              ),
                            ),
                          ],
                        ),
                ],
              ),
            if (data['address_status'] == 'delivered' &&
                data['proof_image'] != null)
              Column(
                children: [
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          contentPadding: EdgeInsets.zero,
                          content: Stack(
                            children: [
                              Image.network(data['proof_image']),
                              if (data['proof_coordinate'] != null)
                                Positioned(
                                  bottom: 0,
                                  right: 0,
                                  child: Container(
                                    color: Colors.black.withAlpha(204),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 4),
                                    child: Text(
                                      'Koordinat: ${data['proof_coordinate']}',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ),
                              Positioned(
                                top: 0,
                                right: 0,
                                child: Container(
                                  color: Colors.black.withAlpha(204),
                                  child: IconButton(
                                    icon: const Icon(Icons.close,
                                        color: Colors.white),
                                    onPressed: () => Navigator.pop(context),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Lihat Bukti Foto'),
                  ),
                ],
              ),
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
    if (routePoints.isNotEmpty) {
      return routePoints.first;
    }

    final deliveryGroups = assignmentData?['delivery_details'];
    if (deliveryGroups != null && deliveryGroups.isNotEmpty) {
      final cluster = deliveryGroups[0];
      if (cluster.isNotEmpty) {
        final centroidStr = cluster[0]['cluster_centroid']?.toString();
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

  bool _showGenerateRouteButton() {
    if (assignmentData == null) return false;

    bool hasInitialCoordinate = false;
    final deliveryGroups = assignmentData?['delivery_details'] ?? [];
    for (final group in deliveryGroups) {
      for (final delivery in group) {
        if (delivery['initial_coordinate'] != null) {
          hasInitialCoordinate = true;
          break;
        }
      }
      if (hasInitialCoordinate) break;
    }

    return !hasInitialCoordinate;
  }

  Future<void> _handleGenerateRoute() async {
    if (_isGeneratingRoute) return;

    setState(() => _isGeneratingRoute = true);

    try {
      // cek apakah location sevice aktif
      bool serviceEnabled = await _location.serviceEnabled();
      if (!serviceEnabled) {
        serviceEnabled = await _location.requestService();
        if (!serviceEnabled) {
          toast('Location services are disabled. Please enable them.');
          return;
        }
      }

      // cek apakah punya permission untuk mengambil lokasi
      PermissionStatus permissionStatus = await _location.hasPermission();
      if (permissionStatus == PermissionStatus.denied) {
        permissionStatus = await _location.requestPermission();
        if (permissionStatus != PermissionStatus.granted) {
          toast('Location permission is required to generate routes.');
          return;
        }
      }

      // ambil current location
      LocationData locationData = await _location.getLocation();
      String initialLocation =
          "${locationData.latitude},${locationData.longitude}";

      // ambil id kurir
      final courierString = sp.getString('courier');
      if (courierString == null) return;
      final courier = jsonDecode(courierString);
      int courierId = courier['id'];

      // call api
      final response = await AssignmentServices().generateRoute(
        courierId,
        initialLocation,
        assignmentData,
      );

      if (response['success'] == true && mounted) {
        toast('Route generated successfully');
        final widget_id = widget.id;
        final widget_date = widget.date;

        // refresh page
        Navigator.pop(context);
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => AssignmentDetailPage(
              id: widget_id,
              date: widget_date,
            ),
          ),
        );
      } else {
        toast('Failed to generate route: ${response['message']}');
      }
    } catch (e) {
      toast('Error: ${e.toString()}');
    } finally {
      if (mounted) {
        setState(() => _isGeneratingRoute = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Assignment'),
        actions: [
          if (!isLoading && courierRouteSequence.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.list),
              onPressed: () {
                int pickupCount = courierRouteSequence
                    .where((p) => p['type'] == 'pickup')
                    .length;
                int deliveryCount = courierRouteSequence
                    .where((p) => p['type'] == 'delivery')
                    .length;

                String formatTime(int seconds) {
                  if (seconds == null || seconds <= 0) return "0s";

                  int hours = seconds ~/ 3600;
                  int minutes = (seconds % 3600) ~/ 60;
                  int remainingSeconds = seconds % 60;

                  if (hours == 0 && minutes == 0) {
                    return '${remainingSeconds} detik';
                  } else if (hours == 0) {
                    return '${minutes.toString().padLeft(2, '0')} menit ${remainingSeconds.toString().padLeft(2, '0')} detik';
                  } else {
                    return '${hours.toString().padLeft(2, '0')} jam ${minutes.toString().padLeft(2, '0')} menit ${remainingSeconds.toString().padLeft(2, '0')} detik';
                  }
                }

                int totalSeconds = assignmentData?['delivery_details'][0][0]
                    ['total_travel_time'];

                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Detail Rute'),
                    content: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.store_mall_directory),
                                    const SizedBox(width: 8),
                                    Text('$pickupCount Lokasi Pengambilan'),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    const Icon(Icons.location_on),
                                    const SizedBox(width: 8),
                                    Text('$deliveryCount Lokasi Pengiriman'),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    const Icon(Icons.timer),
                                    const SizedBox(width: 8),
                                    Text(formatTime(totalSeconds)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const Divider(),
                          // urutan rute
                          ...courierRouteSequence.map((point) {
                            String additionalInfo = '';
                            final courierString = sp.getString('courier');
                            final courier = courierString != null
                                ? jsonDecode(courierString)
                                : null;
                            final courierId = courier?['id'];

                            if (point['type'] == 'delivery') {
                              // cari pickup location yang terkait dengan delivery ini
                              final deliveryData = point['data'];
                              final orderId = deliveryData['order_id'];

                              // cari pickup details untuk order ini
                              final pickupList =
                                  assignmentData?['pickup_details'] ?? [];
                              for (final pickup in pickupList) {
                                if (pickup['order_id'] == orderId) {
                                  final courierIdsStr =
                                      pickup['courier_id']?.toString();
                                  final visitOrdersStr =
                                      pickup['visit_order']?.toString();

                                  if (courierIdsStr != null &&
                                      visitOrdersStr != null) {
                                    final courierIds = courierIdsStr
                                        .split(',')
                                        .map((e) => e.trim())
                                        .toList();
                                    final visitOrders = visitOrdersStr
                                        .split(',')
                                        .map((e) => e.trim())
                                        .toList();

                                    // Cari index courier ini dalam daftar courier_ids
                                    final courierIndex = courierIds
                                        .indexOf(courierId.toString());
                                    if (courierIndex != -1 &&
                                        courierIndex < visitOrders.length) {
                                      final pickupVisitOrder =
                                          visitOrders[courierIndex];
                                      additionalInfo =
                                          'Mengantarkan barang dari lokasi nomor $pickupVisitOrder';
                                    }
                                  }
                                  break;
                                }
                              }
                            }

                            return ListTile(
                              contentPadding: EdgeInsets.zero,
                              leading: CircleAvatar(
                                backgroundColor: point['type'] == 'initial'
                                    ? Colors.yellow
                                    : point['type'] == 'pickup'
                                        ? Colors.blue
                                        : Colors.red,
                                child: Text(
                                  point['visit_order'].toString(),
                                  style: const TextStyle(color: Colors.white),
                                ),
                              ),
                              title: Text(
                                point['type'] == 'initial'
                                    ? (point['position'] != null
                                        ? '${point['position'].latitude},${point['position'].longitude}'
                                        : 'Location')
                                    : (point['address']?.toString() ??
                                        'Location'),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    point['type'] == 'initial'
                                        ? 'Lokasi Awal Kurir'
                                        : point['type'] == 'pickup'
                                            ? 'Lokasi Pengambilan'
                                            : 'Lokasi Pengiriman',
                                  ),
                                  if (additionalInfo.isNotEmpty)
                                    Text(additionalInfo,
                                        style: TextStyle(fontSize: 12)),
                                ],
                              ),
                            );
                          }).toList(),
                        ],
                      ),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Tutup'),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
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
                  polylines: Set<Polyline>.of(polylines.values),
                  onTap: (_) => setState(() => _selectedMarkerData = null),
                  mapToolbarEnabled: false,
                ),
                if (_selectedMarkerData != null)
                  Positioned(
                    top: _selectedMarkerData!['type'] == 'initial'
                        ? 180
                        : _selectedMarkerData!['type'] == 'pickup'
                            ? 20
                            : 40,
                    left: 0,
                    right: 0,
                    child: _buildOverlayCard(_selectedMarkerData!),
                  ),
                if (_showGenerateRouteButton())
                  Positioned(
                    bottom: 20,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: ElevatedButton(
                        onPressed: _handleGenerateRoute,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 24, vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: _isGeneratingRoute
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Text(
                                'Generate Route',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ),
                  ),
              ],
            ),
    );
  }
}
