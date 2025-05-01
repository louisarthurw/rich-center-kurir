import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/components/navbar.dart';
import 'package:mobile/login.dart';
import 'package:mobile/services/api/auth/authServices.dart';
import 'package:nb_utils/nb_utils.dart';

class SplashScreenPage extends ConsumerStatefulWidget {
  const SplashScreenPage({Key? key}) : super(key: key);

  @override
  ConsumerState<SplashScreenPage> createState() => _SplashScreenPageState();
}

class _SplashScreenPageState extends ConsumerState<SplashScreenPage> {
  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    await Future.delayed(const Duration(milliseconds: 2000));

    final isAuthenticated = await _checkAuthentication();

    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => isAuthenticated ? const Home() : const Login(),
        ),
      );
    }
  }

  Future<bool> _checkAuthentication() async {
    try {
      // cek apakah token masih belum expired
      final isValid = await AuthServices.isTokenValid();

      // hapus session jika token expired
      if (!isValid) {
        await AuthServices.clearSession();
      }

      return isValid;
    } catch (e) {
      debugPrint('Auth check error: $e');
      await AuthServices.clearSession();
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        color: Colors.blue[800],
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(
                'assets/rich-center-kurir-logo.png',
                width: context.width() * 0.5,
                fit: BoxFit.contain,
              ),
              const SizedBox(height: 24),
              Text(
                "Rich Center Kurir",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
