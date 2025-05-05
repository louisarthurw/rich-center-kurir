import 'dart:convert';
import '../constResources.dart';
import 'package:http/http.dart' as http;

class AssignmentServices {
  Future<Map<String, dynamic>> getAllAssignments(int courier_id) async {
    try {
      final endpoint = Uri.parse("${url}/api/couriers/assignments/$courier_id");
      final response = await http.get(
        endpoint,
        headers: {"Content-Type": "application/json"},
      );

      final data = jsonDecode(response.body);

      return data;
    } catch (e) {
      throw Exception('${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> getAssignment(
      int courier_id, String date) async {
    try {
      final endpoint =
          Uri.parse("${url}/api/couriers/assignment/$courier_id/$date");

      final response = await http.get(
        endpoint,
        headers: {"Content-Type": "application/json"},
      );

      final data = jsonDecode(response.body);

      return data;
    } catch (e) {
      throw Exception('${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> getServiceById(int id) async {
    try {
      final endpoint = Uri.parse("${url}/api/services/$id");
      final response = await http.get(
        endpoint,
        headers: {"Content-Type": "application/json"},
      );

      final data = jsonDecode(response.body);

      return data;
    } catch (e) {
      throw Exception('${e.toString()}');
    }
  }
}
