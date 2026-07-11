const fs = require('fs');
const path = 'e:\\APP\\Accesseasy_mobileapp\\lib\\home\\dashboard_screen.dart';
let content = fs.readFileSync(path, 'utf8');

const old = `  void _startShiftTimer() {
    _shiftTimer?.cancel();
    _shiftTimer = Timer.periodic(const Duration(seconds: 1), (timer) async {
      _appUsageSeconds++;
      _updateDurationString();
      if (_appUsageSeconds % 5 == 0 && _prefs != null) {
        // Use cached prefs \u2014 no repeated disk init overhead
        _prefs!.setInt('guard_app_usage_seconds', _appUsageSeconds);
      }
    });
  }`;

const replacement = `  void _startShiftTimer() {
    _shiftTimer?.cancel();
    _shiftTimer = Timer.periodic(const Duration(seconds: 1), (timer) async {
      _appUsageSeconds++;
      _updateDurationString();
      if (_appUsageSeconds % 5 == 0 && _prefs != null) {
        _prefs!.setInt('guard_app_usage_seconds', _appUsageSeconds);
      }
      // Upload guard location every 10 seconds
      if (_appUsageSeconds % 10 == 0 && userid != null && token != null) {
        _uploadGuardLocation();
      }
    });
  }

  Future<void> _uploadGuardLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return;
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) return;
      }
      final pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      await http.patch(
        Uri.parse('$kBaseUrl/users/$userid'),
        headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
        body: jsonEncode({'currentLat': pos.latitude, 'currentLng': pos.longitude}),
      );
      debugPrint('[Location] Uploaded: \${pos.latitude}, \${pos.longitude}');
    } catch (e) {
      debugPrint('[Location] Upload failed: \$e');
    }
  }`;

// Normalize CRLF to LF for matching, then replace
const normalized = content.replace(/\r\n/g, '\n');
if (!normalized.includes(old)) {
  console.error('Could not find target. Dumping lines 91-102:');
  console.error(normalized.split('\n').slice(90, 103).join('\n'));
  process.exit(1);
}
const patched = normalized.replace(old, replacement);
// Write back with original line endings
fs.writeFileSync(path, patched.replace(/\n/g, '\r\n'), 'utf8');
console.log('Patched successfully!');
