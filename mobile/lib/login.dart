import 'package:flutter/material.dart';
import 'package:mobile/components/dialog.dart';
import 'package:mobile/components/navbar.dart';
import 'package:mobile/services/api/auth/authServices.dart';
import 'package:nb_utils/nb_utils.dart';

class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: white,
      body: Center(
        child: SingleChildScrollView(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: 400,
              minHeight: context.height(),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo
                Image.asset(
                  'assets/rich-center-kurir-logo.png',
                  height: 160,
                ),
                60.height,

                Text(
                  'Selamat datang, Kurir!',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
                20.height,

                // Email TextField
                AppTextField(
                  controller: _emailController,
                  textFieldType: TextFieldType.EMAIL,
                  decoration: InputDecoration(
                    labelText: 'Email',
                    prefixIcon: const Icon(Icons.email),
                  ),
                ),
                20.height,

                // Password TextField
                AppTextField(
                  controller: _passwordController,
                  textFieldType: TextFieldType.PASSWORD,
                  decoration: InputDecoration(
                    labelText: 'Password',
                    prefixIcon: const Icon(Icons.lock),
                  ),
                  obscureText: false,
                ),
                80.height,

                // Login Button
                AppButton(
                  text: 'Login',
                  color: Colors.blue,
                  textColor: white,
                  width: context.width(),
                  onTap: () async {
                    try {
                      showDialogLoading(context);
                      final Map<String, dynamic> response = await AuthServices()
                          .login(
                              _emailController.text, _passwordController.text);

                      if (response['success']) {
                        Navigator.pop(context);
                        Navigator.pushReplacement(
                          // Ganti halaman login
                          context,
                          MaterialPageRoute(
                            builder: (context) => Home(),
                          ),
                        );
                      } else {
                        toast(response['message']);
                      }
                    } catch (e) {
                      toast(e.toString());
                    } finally {
                      if (Navigator.canPop(context)) {
                        Navigator.pop(context);
                      }
                    }
                  },
                ),
              ],
            ).paddingSymmetric(horizontal: 24),
          ),
        ),
      ),
    );
  }
}
