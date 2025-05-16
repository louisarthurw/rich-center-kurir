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

  Future<Map<String, dynamic>> getAssignmentByOrderId(
      int courier_id, int order_id) async {
    try {
      final endpoint =
          Uri.parse("${url}/api/couriers/assignment/$courier_id/id/$order_id");

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

  Future<Map<String, dynamic>> generateRoute(
      int courierId, String initial_location, dynamic dataa) async {
    try {
      final endpoint = Uri.parse("${url}/api/couriers/get-route");
      final response = await http.post(
        endpoint,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "courier_id": courierId,
          "initial_location": initial_location,
          "data": dataa
        }),
      );

      final data = jsonDecode(response.body);

      return data;
    } catch (e) {
      throw Exception('${e.toString()}');
    }
  }

  static Future<Map<String, dynamic>> uploadProofImage(
      int id, String image, String proof_coordinate, dynamic dataa) async {
    try {
      final endpoint = Uri.parse("${url}/api/couriers/upload-bukti-foto");
      final response = await http.put(
        endpoint,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "id": id,
          "image": image,
          "proof_coordinate": proof_coordinate,
          "data": dataa
        }),
      );

      final data = jsonDecode(response.body);

      return data;
    } catch (e) {
      throw Exception('${e.toString()}');
    }
  }
}
