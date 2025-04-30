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
    // 1. Add slight delay for splash screen visibility
    await Future.delayed(const Duration(milliseconds: 2000));

    // 2. Check authentication status
    final isAuthenticated = await _checkAuthentication();

    // 3. Navigate to appropriate page
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
      // 1. Check if token exists and is valid
      final isValid = await AuthServices.isTokenValid();
      
      // 2. Clear session if token is invalid
      if (!isValid) {
        await AuthServices.clearSession();
      }
      
      return isValid;
    } catch (e) {
      // Handle any errors during auth check
      debugPrint('Auth check error: $e');
      await AuthServices.clearSession();
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        color: Colors.blue[200],
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // 1. App Logo
              Image.asset(
                'assets/rich-center-kurir-logo.png',
                width: context.width() * 0.5,
                fit: BoxFit.contain,
              ),
              
              // 2. Spacer
              const SizedBox(height: 24),
              
              // 3. App Name
              Text(
                "Rich Center Kurir",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  shadows: [
                    Shadow(
                      blurRadius: 4,
                      offset: const Offset(2, 2),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}