import 'dart:convert';
import 'package:mobile/main.dart';
import '../../constResources.dart';
import 'package:http/http.dart' as http;

class AuthServices {
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final endpoint = Uri.parse("${url}/api/auth/login-kurir");
      final response = await http.post(
        endpoint,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"email": email, "password": password}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        await sp.setString("token", data["token"]);
        await sp.setInt("token_expires_at", data["expiresAt"]);
        await sp.setString("courier", jsonEncode(data["data"]));
      }
      
      return data;
    } catch (e) {
      throw Exception('${e.toString()}');
    }
  }

  static Future<bool> isTokenValid() async {
    final token = sp.getString("token");
    final expiry = sp.getInt("token_expires_at");

    if (token == null || expiry == null) return false;

    return DateTime.now().millisecondsSinceEpoch < expiry;
  }

  static Future<void> clearSession() async {
    await sp.remove("token");
    await sp.remove("token_expires_at");
    await sp.remove("courier");
  }
}
