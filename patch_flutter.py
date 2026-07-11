import re
import json

path = r'e:\APP\Accesseasy_mobileapp\lib\home\dashboard_screen.dart'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if 'geolocator.dart' not in content:
    content = content.replace("import 'package:http/http.dart' as http;", "import 'package:http/http.dart' as http;\nimport 'package:geolocator/geolocator.dart';")

old_timer = """  void _startShiftTimer() {
    _shiftTimer?.cancel();
    _shiftTimer = Timer.periodic(const Duration(seconds: 1), (timer) async {
      _appUsageSeconds++;
      _updateDurationString();
      if (_appUsageSeconds % 5 == 0 && _prefs != null) {
        // Use cached prefs — no repeated disk init overhead
        _prefs!.setInt('guard_app_usage_seconds', _appUsageSeconds);
      }
    });
  }"""

new_timer = """  void _startShiftTimer() {
    _shiftTimer?.cancel();
    _shiftTimer = Timer.periodic(const Duration(seconds: 1), (timer) async {
      _appUsageSeconds++;
      _updateDurationString();
      if (_appUsageSeconds % 5 == 0 && _prefs != null) {
        // Use cached prefs — no repeated disk init overhead
        _prefs!.setInt('guard_app_usage_seconds', _appUsageSeconds);
      }
      
      // Upload location every 10 seconds to global users table
      if (_appUsageSeconds % 10 == 0 && userid != null) {
        try {
          bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
          if (serviceEnabled) {
            LocationPermission permission = await Geolocator.checkPermission();
            if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
              Position pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
              await http.patch(
                Uri.parse('$kBaseUrl/users/$userid'),
                headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
                body: jsonEncode({'currentLat': pos.latitude, 'currentLng': pos.longitude}),
              );
            }
          }
        } catch (e) {
          debugPrint('Global Location Update Error: $e');
        }
      }
    });
  }"""

content = content.replace(old_timer, new_timer)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched successfully!')
