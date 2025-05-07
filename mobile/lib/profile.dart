import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile/changePassword.dart';
import 'package:mobile/login.dart';
import 'package:mobile/main.dart';
import 'package:mobile/services/api/authServices.dart';
import 'package:nb_utils/nb_utils.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  Map<String, dynamic>? courierData;
  bool isLoading = true;
  bool isEditing = false;
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();

  @override
  void initState() {
    _checkTokenExpiry();
    _loadCourierData();
    super.initState();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _loadCourierData() async {
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

      final localData = jsonDecode(courierString);

      final response = await AuthServices().getCourierById(localData['id']);

      if (response['success'] == true) {
        if (response['data']['status'] != 'active') {
          _forceLogout();
        }

        await sp.setString('courier', jsonEncode(response['data']));
        _emailController.text = response['data']['email'];
        _phoneController.text = response['data']['phone_number'];
        _addressController.text = response['data']['address'];

        if (mounted) {
          setState(() {
            courierData = response['data'];
          });
        }
      }
    } catch (e) {
      toast('Error loading courier data');
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
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

  Future<void> _forceLogout() async {
    await AuthServices.clearSession();
    if (mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const Login()),
        (Route<dynamic> route) => false,
      );
    }
    toast('Akun Anda tidak aktif. Silakan hubungi admin.');
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

  Future<void> _toggleEdit() async {
    setState(() {
      isEditing = !isEditing;
      if (!isEditing) {
        _emailController.text = courierData!['email'];
        _phoneController.text = courierData!['phone_number'];
        _addressController.text = courierData!['address'];
        _formKey.currentState?.reset();
      }
    });
  }

  Future<void> _saveProfile() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        isLoading = true;
      });

      try {
        final response = await AuthServices().updateCourierProfile(
          courierData!['id'],
          {
            'name': courierData!['name'],
            'email': _emailController.text,
            'phone_number': _phoneController.text,
            'address': _addressController.text,
            'role': courierData!['role'],
            'status': courierData!['status'],
          },
        );

        if (response['success'] == true) {
          setState(() {
            courierData = response['data'];
            isEditing = false;
          });
          toast('Berhasil update profile');
        } else {
          toast(response['error']);
        }
      } catch (e) {
        toast('Error: ${e.toString()}');
      } finally {
        setState(() {
          isLoading = false;
        });
        print('data shared pref: ${sp.getString('courier')}');
      }
    }
  }

  Future<void> _updateAvailabilityStatus(String newStatus) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Konfirmasi Perubahan Status'),
        content: Text('Anda yakin ingin mengubah status menjadi $newStatus?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Ya', style: TextStyle(color: Colors.blue)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      setState(() {
        isLoading = true;
      });

      try {
        final response = await AuthServices().updateAvailabilityStatus(
          courierData!['id'],
          newStatus,
        );

        if (response['success'] == true) {
          setState(() {
            courierData = response['data'];
          });
          toast('Berhasil mengubah availability status menjadi $newStatus');
        } else {
          toast(response['message'] ?? 'Gagal mengubah status');
        }
      } catch (e) {
        toast('Error updating status: $e');
      } finally {
        setState(() {
          isLoading = false;
        });
        print('data shared pref: ${sp.getString('courier')}');
      }
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
              ? const Center(child: Text('Tidak dapat mengambil data kurir'))
              : _buildProfileContent(),
    );
  }

  Widget _buildProfileContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 32),
      child: Form(
        key: _formKey,
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
            8.height,
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
            16.height,
            _buildTextField('Email', _emailController, isEditing),
            12.height,
            _buildTextField('Nomor Telepon', _phoneController, isEditing),
            12.height,
            _buildTextField('Alamat', _addressController, isEditing),
            12.height,
            _buildAvailabilityRadio(),
            4.height,
            isEditing
                ? Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: _toggleEdit,
                              style: OutlinedButton.styleFrom(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 12),
                                side: const BorderSide(color: Colors.blue),
                              ),
                              child: const Text(
                                'Batal',
                                style: TextStyle(color: Colors.blue),
                              ),
                            ),
                          ),
                          16.width,
                          Expanded(
                            child: ElevatedButton(
                              onPressed: _saveProfile,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blue,
                                foregroundColor: Colors.white,
                                padding:
                                    const EdgeInsets.symmetric(vertical: 12),
                              ),
                              child: const Text('Simpan'),
                            ),
                          ),
                        ],
                      ),
                      8.height,
                      ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const ChangePasswordPage(),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 48),
                        ),
                        child: const Text('Ganti Password'),
                      ),
                    ],
                  )
                : Column(
                    children: [
                      ElevatedButton(
                        onPressed: _toggleEdit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 48),
                        ),
                        child: const Text('Edit Profile'),
                      ),
                      8.height,
                      ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const ChangePasswordPage(),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 48),
                        ),
                        child: const Text('Ganti Password'),
                      ),
                    ],
                  ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(
      String label, TextEditingController controller, bool editable) {
    return TextFormField(
      controller: controller,
      readOnly: !editable,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Field harus diisi';
        }
        if (label == 'Email' && !value.contains('@')) {
          return 'Email tidak valid';
        }
        if (label == 'Nomor Telepon' && !RegExp(r'^[0-9]+$').hasMatch(value)) {
          return 'Nomor telepon hanya boleh berisi angka';
        }
        return null;
      },
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
              onChanged: isEditing
                  ? null
                  : (value) {
                      if (value != null) {
                        _updateAvailabilityStatus(value);
                      }
                    },
              activeColor: Colors.blue,
              visualDensity:
                  const VisualDensity(horizontal: -4.0, vertical: -4.0),
            ),
            const Text('Available'),
            20.width,
            Radio<String>(
              value: 'unavailable',
              groupValue: status,
              onChanged: isEditing
                  ? null
                  : (value) {
                      if (value != null) {
                        _updateAvailabilityStatus(value);
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
