import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:mobile/login.dart';
import 'package:mobile/main.dart';
import 'package:mobile/services/api/auth/authServices.dart';
import 'package:nb_utils/nb_utils.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  Map<String, dynamic>? courierData;
  bool isLoading = true;

  @override
  void initState() {
    _checkTokenExpiry();
    _loadCourierData();
    super.initState();
  }

  Future<void> _loadCourierData() async {
    try {
      final courierString = sp.getString('courier');
      if (courierString == null) {
        setState(() {
          isLoading = false;
        });
        return;
      }

      final localData = jsonDecode(courierString);

      final response = await AuthServices().getCourierById(localData['id']);

      if (response['success'] == true) {
        if (response['data']['status'] != 'active') {
          _logout();
        }

        await sp.setString('courier', jsonEncode(response['data']));

        setState(() {
          courierData = response['data'];
          print(courierData);
        });
      }
    } catch (e) {
      toast('Error loading courier data: $e');
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _logout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Konfirmasi Logout'),
        content: const Text('Apakah Anda yakin ingin logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Logout', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await AuthServices.clearSession();
      if (mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => const Login()),
          (Route<dynamic> route) => false,
        );
      }
    }
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

  String _getRoleText(String role) {
    switch (role) {
      case 'regular':
        return 'Kurir Regular';
      case 'special':
        return 'Kurir Khusus';
      case 'car':
        return 'Kurir Mobil';
      default:
        return 'Kurir';
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
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : courierData == null
              ? const Center(child: Text('No courier data available'))
              : _buildProfileContent(),
    );
  }

  Widget _buildProfileContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: CircleAvatar(
              radius: 50,
              backgroundColor: Colors.grey[200],
              backgroundImage: const AssetImage('assets/default-profile.png'),
            ),
          ),
          16.height,
          Center(
            child: Column(
              children: [
                Text(
                  courierData!['name'],
                  style: const TextStyle(
                      fontSize: 24, fontWeight: FontWeight.bold),
                ),
                Text(
                  _getRoleText(courierData!['role']),
                  style: const TextStyle(fontSize: 20, color: Colors.grey),
                ),
              ],
            ),
          ),
          24.height,
          _buildTextField('Email', courierData!['email']),
          12.height,
          _buildTextField('Nomor Telepon', courierData!['phone_number']),
          12.height,
          _buildTextField('Alamat', courierData!['address']),
          20.height,
          _buildAvailabilityRadio(),
          20.height,
          ElevatedButton(
            onPressed: () {
              toast('pressed');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 48),
            ),
            child: const Text('Edit Profile'),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField(String label, String value) {
    return TextFormField(
      initialValue: value,
      readOnly: true,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
      ),
    );
  }

  Widget _buildAvailabilityRadio() {
    String status = courierData!['availability_status'];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Availability Status'),
        Row(
          children: [
            Radio<String>(
              value: 'available',
              groupValue: status,
              onChanged: (value) {
                if (value != null) {
                  setState(() {
                    courierData!['availability_status'] = value;
                  });
                  // sp.setString('courier', jsonEncode(courierData));
                  // TODO: backend ubah status di db
                  toast('Status diubah menjadi "$value"');
                }
              },
              activeColor: Colors.blue,
            ),
            const Text('Available'),
            20.width,
            Radio<String>(
              value: 'unavailable',
              groupValue: status,
              onChanged: (value) {
                if (value != null) {
                  setState(() {
                    courierData!['availability_status'] = value;
                  });
                  // sp.setString('courier', jsonEncode(courierData));
                  // TODO: backend ubah status di db
                  toast('Status diubah menjadi "$value"');
                }
              },
              activeColor: Colors.blue,
            ),
            const Text('Unavailable'),
          ],
        ),
      ],
    );
  }
}
