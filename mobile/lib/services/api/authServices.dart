import 'dart:convert';
import 'package:mobile/main.dart';
import '../constResources.dart';
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

  Future<Map<String, dynamic>> getCourierById(int id) async {
    try {
      final endpoint = Uri.parse('${url}/api/couriers/$id');
      final response = await http.get(
        endpoint,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        await sp.setString('courier', jsonEncode(data['data']));
      }

      return data;
    } catch (e) {
      throw Exception('${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> updateCourierProfile(
      int id, Map<String, dynamic> data) async {
    try {
      final endpoint = Uri.parse('${url}/api/couriers/$id');

      final response = await http.put(
        endpoint,
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode(data),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200 && responseData['success'] == true) {
        await sp.setString('courier', jsonEncode(responseData['data']));
      }

      return responseData;
    } catch (e) {
      throw Exception('${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> updateAvailabilityStatus(
      int id, String status) async {
    try {
      final endpoint = Uri.parse('${url}/api/couriers/availability-status/$id');

      final response = await http.put(
        endpoint,
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'availability_status': status}),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200 && responseData['success'] == true) {
        await sp.setString('courier', jsonEncode(responseData['data']));
      }

      return responseData;
    } catch (e) {
      throw Exception('${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> changePassword(int id, String password) async {
    try {
      final endpoint = Uri.parse("${url}/api/couriers/password/$id");
      final response = await http.put(
        endpoint,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"password": password}),
      );

      final data = jsonDecode(response.body);
      return data;
    } catch (e) {
      throw Exception('${e.toString()}');
    }
  }

  static Future<bool> isTokenValid() async {
    final token = sp.getString("token");
    final expiry = sp.getInt("token_expires_at");

    print('token: $token');

    if (token == null || expiry == null) return false;

    return DateTime.now().millisecondsSinceEpoch < expiry;
  }

  static Future<void> clearSession() async {
    await sp.remove("token");
    await sp.remove("token_expires_at");
    await sp.remove("courier");
  }
}
