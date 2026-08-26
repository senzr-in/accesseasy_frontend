import 'dart:io';
import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:qr_code_scanner_plus/qr_code_scanner_plus.dart';
import 'dart:math' as math;
import 'package:pedometer/pedometer.dart';
import 'package:flutter_compass/flutter_compass.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:accesseasy_shared/core/constants.dart';
import 'package:accesseasy_shared/services/notification_service.dart';
import '../auth/guard_session_service.dart';
import '../auth/nfc_auth_service.dart';
import '../database/patrol_database.dart';
import '../device/device_profile_service.dart';
import '../offline/offline_event_queue.dart';

class PatrolScreen extends StatefulWidget {
  final Map<String, dynamic>? initialPatrol;
  const PatrolScreen({Key? key, this.initialPatrol}) : super(key: key);

  @override
  State<PatrolScreen> createState() => _PatrolScreenState();
}

class _PatrolScreenState extends State<PatrolScreen> {
  String _routeName = "Loading Route...";
  List<Map<String, dynamic>> _checkpoints = [];
  bool _isLoading = true;
  
  StreamSubscription<Position>? _positionStreamSubscription;
  DateTime? _lastGpsUploadTime;
  StreamSubscription<StepCount>? _stepCountStream;
  StreamSubscription<CompassEvent>? _compassStream;
  
  double? _currentLat;
  double? _currentLng;
  double _currentHeading = 0.0;
  int _lastStepCount = -1;
  String? _activePatrolId;
  Map<String, dynamic>? _currentPatrol;
  Timer? _pollTimer;
  Timer? _countdownTimer;
  bool _isCompleting = false;

  DateTime? _nextPatrolTime;
  Duration _timeToNextPatrol = Duration.zero;

  int _checkpointIntervalSecs = 0;
  DateTime? _lastScanTime;
  Duration _timeToNextCheckpoint = Duration.zero;

  int _patrolIntervalMins = 0;

  bool _fiveMinWarningFired = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialPatrol != null) {
      _loadInitialPatrol(widget.initialPatrol!);
    } else {
      _fetchRouteData();
    }
  }

  Future<void> _loadInitialPatrol(Map<String, dynamic> patrol) async {
    setState(() => _isLoading = true);
    try {
      _currentPatrol = patrol;
      _activePatrolId = patrol['id'].toString();
      _routeName = "${patrol['zoneName'] ?? 'Active'} Route";
      
      final routeId = patrol['groupId'] is Map ? patrol['groupId']['id'] : patrol['groupId'];
      if (routeId != null) {
        final results = await Future.wait([
          http.get(
            Uri.parse('$kBaseUrl/items/checkpoints?filter[group_id][_eq]=$routeId&sort=sort_order'),
            headers: {'Authorization': 'Bearer $token'},
          ),
          http.get(
            Uri.parse('$kBaseUrl/items/patrols?filter[groupId][_eq]=$routeId&filter[status][_in]=scheduled,active&sort=scheduledTime&limit=3'),
            headers: {'Authorization': 'Bearer $token'},
          ),
        ]);

        final cpData = jsonDecode(results[0].body);
        final nextPatrolData = jsonDecode(results[1].body)['data'] as List? ?? [];
        
        final prefs = await SharedPreferences.getInstance();
        
        final lastScanIso = prefs.getString('patrol_${_activePatrolId}_lastScanTime');
        if (lastScanIso != null) {
          try {
            _lastScanTime = DateTime.parse(lastScanIso);
          } catch (_) {}
        }

        final hasLocalData = prefs.getKeys().any((k) => k.startsWith('patrol_${_activePatrolId}_cp_'));

        setState(() {
          _checkpoints = List<Map<String, dynamic>>.from(cpData['data']);
          for (var cp in _checkpoints) {
            final isLocallyCompleted = prefs.getBool('patrol_${_activePatrolId}_cp_${cp['id']}') ?? false;
            cp['status'] = isLocallyCompleted ? 'completed' : (hasLocalData ? (cp['status'] ?? 'pending') : 'pending');
          }
          if (_checkpoints.isNotEmpty) {
            final dwellTime = _checkpoints.first['dwell_time'];
            if (dwellTime != null) {
              _checkpointIntervalSecs = (dwellTime as num).toInt() * 60;
            }
          }
          _isLoading = false;
        });

        // ── Cache checkpoints & next patrols to SQLite ──
        if (routeId != null && _checkpoints.isNotEmpty) {
          try {
            await PatrolDatabase().cacheCheckpoints(_checkpoints, routeId.toString());
          } catch (e) {
            debugPrint('PatrolScreen: checkpoint cache error — $e');
          }
        }
        if (nextPatrolData.isNotEmpty) {
          try {
            await PatrolDatabase().cachePatrols(
              nextPatrolData.map((p) => Map<String, dynamic>.from(p)).toList());
          } catch (e) {
            debugPrint('PatrolScreen: patrol cache error — $e');
          }
        }

        if (nextPatrolData.length >= 2) {
          try {
            final t1 = DateTime.parse(nextPatrolData[0]['scheduledTime']);
            final t2 = DateTime.parse(nextPatrolData[1]['scheduledTime']);
            _patrolIntervalMins = t2.difference(t1).inMinutes.abs();
          } catch (_) {}
        }

        if (nextPatrolData.isNotEmpty) {
          for (var p in nextPatrolData) {
            final scheduledStr = p['scheduledTime'];
            if (scheduledStr != null) {
              try {
                final nextTime = DateTime.parse(scheduledStr).toLocal();
                if (nextTime.isAfter(DateTime.now())) {
                  setState(() => _nextPatrolTime = nextTime);
                  break;
                }
              } catch (_) {}
            }
          }
        }

        if (patrol['status'] == 'active' || patrol['status'] == 'scheduled') {
          _startLocationTracking();
          _startStatusPolling();
          _startCountdownTimer();
        }
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      print("Error loading initial patrol: $e");
      setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchRouteData() async {
    setState(() => _isLoading = true);
    try {
      final res = await http.get(
        Uri.parse('$kBaseUrl/items/patrols?filter[guardId][_eq]=$userid&filter[status][_eq]=active&limit=1'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body)['data'] as List?;
        if (data != null && data.isNotEmpty) {
          await _loadInitialPatrol(Map<String, dynamic>.from(data.first));
          return;
        }
      }
    } catch (e) {
      debugPrint('Error fetching active patrol: $e');
    }
    setState(() {
      _routeName = "No Active Route";
      _checkpoints = [];
      _isLoading = false;
    });

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (!mounted) return;
      final result = await Navigator.push<String>(
        context,
        MaterialPageRoute(builder: (_) => const FullScreenCheckpointScanner()),
      );
      if (result != null && result.isNotEmpty) {
        _handleDynamicClaim(result);
      } else {
        if (_checkpoints.isEmpty && mounted) {
           Navigator.of(context).pop();
        }
      }
    });
  }

  Future<void> _handleDynamicClaim(String scannedData) async {
    String? cpId;
    String? routeId;

    if (scannedData.startsWith('ACPT::')) {
      final parts = scannedData.split('::');
      if (parts.length >= 2) {
        cpId = parts[1];
        routeId = parts.length >= 3 ? parts[2] : null;
      }
    } else if (scannedData.startsWith('NFC::')) {
      cpId = scannedData.substring(5);
    } else {
      cpId = scannedData;
    }

    if (cpId == null || cpId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Invalid Checkpoint code')));
      return;
    }

    setState(() => _isLoading = true);

    try {
      final todayStr = DateTime.now().toIso8601String().split('T')[0];
      List<dynamic>? availablePatrols;

      if (routeId != null && routeId != 'null' && routeId != 'NONE') {
        final response = await http.get(
          Uri.parse('$kBaseUrl/items/patrols?filter[groupId][_eq]=$routeId&filter[tenant][_eq]=$tenant&filter[status][_in]=scheduled,missed,delayed&sort=scheduledTime'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
        );
        availablePatrols = jsonDecode(response.body)['data'] as List?;
      } else {
        final cpRes = await http.get(
          Uri.parse('$kBaseUrl/items/checkpoints?filter[checkpoint_id][_eq]=$cpId'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
        );
        final cpData = jsonDecode(cpRes.body)['data'] as List?;
        if (cpData != null && cpData.isNotEmpty) {
          final groupIds = cpData.map((e) => e['group_id']).where((id) => id != null).toSet().toList();
          if (groupIds.isNotEmpty) {
            final groupIdsStr = groupIds.join(',');
            final pRes = await http.get(
              Uri.parse('$kBaseUrl/items/patrols?filter[groupId][_in]=$groupIdsStr&filter[tenant][_eq]=$tenant&filter[status][_in]=scheduled,missed,delayed&sort=scheduledTime'),
              headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
            );
            availablePatrols = jsonDecode(pRes.body)['data'] as List?;
          }
        }
      }
      
      if (availablePatrols != null && availablePatrols.isNotEmpty) {
        final closestPatrol = availablePatrols.first;
      
        final verifyRes = await http.get(
          Uri.parse('$kBaseUrl/items/patrols/${closestPatrol['id']}?fields=status'),
          headers: {'Authorization': 'Bearer $token'},
        );
        if (verifyRes.statusCode == 200) {
          final currentStatus = jsonDecode(verifyRes.body)['data']['status'];
          if (currentStatus == 'active' || currentStatus == 'completed') {
            if (mounted) {
              setState(() => _isLoading = false);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Patrol was just claimed by another guard.')));
            }
            return;
          }
        }

        await http.patch(
          Uri.parse('$kBaseUrl/items/patrols/${closestPatrol['id']}'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
          body: jsonEncode({
            'status': 'active',
            'guardId': (userid != null && userid.toString().isNotEmpty) ? userid : (GuardSessionService().activeSession?.guardId),
            'guardName': (userName != null && userName!.isNotEmpty) ? userName : 'Mobile Guard'
          })
        );
        
        final pGroupId = closestPatrol['groupId'];
        final cpResponse = await http.get(
          Uri.parse('$kBaseUrl/items/checkpoints?filter[group_id][_eq]=$pGroupId&sort=sort_order'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
        );
        final cpData = jsonDecode(cpResponse.body);
        
        setState(() {
          _routeName = "${closestPatrol['zoneName']} Route";
          _checkpoints = List<Map<String, dynamic>>.from(cpData['data']);
          for (var cp in _checkpoints) {
             cp['status'] = cp['status'] ?? 'pending';
          }
          _isLoading = false;
        });
        
        _activePatrolId = closestPatrol['id'].toString();
        _startLocationTracking();
        _startStatusPolling();
        _startCountdownTimer();
        _processActualScan(0, scannedData);
        
      } else {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No scheduled patrols found for this route.')));
      }
    } catch (e) {
      setState(() => _isLoading = false);
      print("Claim Error: $e");
    }
  }

  Future<void> _processActualScan(int index, String scannedCode) async {
    final cp = _checkpoints[index];
    
    final expectedCpId = cp['checkpoint_id']?.toString() ?? cp['id']?.toString();
    final expectedNfcId = cp['nfc_id']?.toString() ?? cp['nfcTag']?.toString() ?? cp['nfc_tag']?.toString() ?? cp['tag_id']?.toString();

    bool isMatch = false;

    // 1. QR Code match (ACPT::<id>::<routeId> or ACPT::<id>)
    if (scannedCode.startsWith('ACPT::')) {
      final parts = scannedCode.split('::');
      if (parts.length >= 2 && (parts[1] == expectedCpId || parts[1] == cp['id']?.toString())) {
        isMatch = true;
      }
    } 
    // 2. Direct CP ID Match
    else if (scannedCode == expectedCpId || scannedCode == cp['id']?.toString()) {
      isMatch = true;
    }
    // 3. NFC Tag Match (NFC::<identifier>)
    else if (scannedCode.startsWith('NFC::')) {
      final nfcTag = scannedCode.substring(5);
      if (nfcTag == expectedCpId || (expectedNfcId != null && (nfcTag.toUpperCase() == expectedNfcId.toUpperCase() || nfcTag.replaceAll(':', '').toUpperCase() == expectedNfcId.replaceAll(':', '').toUpperCase()))) {
        isMatch = true;
      } else if (expectedNfcId == null && (nfcTag == expectedCpId || nfcTag.contains(expectedCpId ?? '___'))) {
        isMatch = true;
      }
    }
    // 4. Raw NFC UID or Tag
    else if (expectedNfcId != null && (scannedCode.toUpperCase() == expectedNfcId.toUpperCase() || scannedCode.replaceAll(':', '').toUpperCase() == expectedNfcId.replaceAll(':', '').toUpperCase())) {
      isMatch = true;
    }
    // 5. Fallback contains match
    else if (expectedCpId != null && scannedCode.contains(expectedCpId)) {
      isMatch = true;
    }

    if (!isMatch) {
      if (mounted) {
        HapticFeedback.vibrate();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Wrong Checkpoint (${cp['name'] ?? 'Target'}). Scanned: $scannedCode'),
            backgroundColor: Colors.redAccent,
            duration: const Duration(seconds: 4),
          ),
        );
      }
      return;
    }

    HapticFeedback.mediumImpact();

    final now = DateTime.now();
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    String dateStr = "${months[now.month - 1]} ${now.day}, ${now.year}";
    String timeStr = "${now.hour > 12 ? now.hour - 12 : (now.hour == 0 ? 12 : now.hour)}:${now.minute.toString().padLeft(2, '0')} ${now.hour >= 12 ? 'PM' : 'AM'}";
    String formattedTime = "$dateStr - $timeStr";
    
    setState(() {
      _checkpoints[index]['status'] = 'completed';
      _checkpoints[index]['scanned_at'] = formattedTime;
      _lastScanTime = now;
    });
    
    if (_activePatrolId != null) {
      SharedPreferences.getInstance().then((prefs) {
        prefs.setBool('patrol_${_activePatrolId}_cp_${cp['id']}', true);
        prefs.setString('patrol_${_activePatrolId}_lastScanTime', now.toIso8601String());
      });
    }

    try {
      if (cp['id'] != null) {
        Position? currentPos;
        try {
          bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
          if (serviceEnabled) {
            try {
              currentPos = await Geolocator.getCurrentPosition(
                desiredAccuracy: LocationAccuracy.bestForNavigation,
              ).timeout(const Duration(seconds: 5));
            } catch (e) {
              currentPos = await Geolocator.getLastKnownPosition();
            }
          }
        } catch(e) {
          print("Geotagging failed/timeout: $e");
        }

        final session = GuardSessionService().activeSession;
        final dev = DeviceProfileService().currentProfile;

        Map<String, dynamic> patchData = {
          'status': 'completed',
          'scanned_at': formattedTime,
          'scanned_by_guard': session?.guardId ?? userid,
          'guard_session_id': session?.sessionId,
          'device_id': dev?.deviceId,
        };
        if (currentPos != null) {
          patchData['latitude'] = currentPos.latitude;
          patchData['longitude'] = currentPos.longitude;
        }

        // Record in immutable offline queue
        await OfflineEventQueue().recordEvent(
          eventType: 'checkpoint_scan',
          patrolId: _activePatrolId,
          checkpointId: cp['id']?.toString(),
          gpsLat: currentPos?.latitude,
          gpsLng: currentPos?.longitude,
          gpsAccuracy: currentPos?.accuracy,
          payload: patchData,
        );

        if (_activePatrolId != null) {
          final prefs = await SharedPreferences.getInstance();
          prefs.setString('offline_sync_${_activePatrolId}_cp_${cp['id']}', jsonEncode(patchData));
        }

        // Log tour checkpoint scan to patrol_logs instead of overwriting master checkpoint definition
        final logPayload = {
          'patrol_id': _activePatrolId,
          'checkpoint_id': cp['id']?.toString(),
          'checkpoint_name': cp['name']?.toString() ?? '',
          'guard_id': session?.guardId ?? userid,
          'guard_name': session?.guardName ?? userName ?? 'Guard',
          'guard_session_id': session?.sessionId,
          'device_id': dev?.deviceId,
          'site_id': dev?.boundSiteId,
          'zone_id': dev?.boundZoneId,
          'timestamp': formattedTime,
          'date_created': DateTime.now().toUtc().toIso8601String(),
          'status': 'completed',
          'latitude': currentPos?.latitude,
          'longitude': currentPos?.longitude,
          'gps_accuracy': currentPos?.accuracy,
        };

        try {
          await http.post(
            Uri.parse('$kBaseUrl/items/patrol_logs'),
            headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
            body: jsonEncode(logPayload),
          );
        } catch (postErr) {
          debugPrint('Error posting patrol log to Directus: $postErr');
        }
        
        if (_activePatrolId != null) {
          final prefs = await SharedPreferences.getInstance();
          prefs.remove('offline_sync_${_activePatrolId}_cp_${cp['id']}');
        }
      }
    } catch (e) {
      print("Error updating checkpoint: $e");
    }
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${cp['name']} Confirmed!'),
          backgroundColor: Colors.green,
          duration: const Duration(seconds: 3),
        ),
      );
    }

    bool allScanned = _checkpoints.every((c) => c['status'] == 'scanned' || c['status'] == 'completed');
    if (allScanned && _activePatrolId != null && !_isCompleting) {
      _isCompleting = true;
      try {
        final missedCount = _checkpoints.where((c) => c['status'] == 'pending').length;
        final completedCount = _checkpoints.where((c) => c['status'] == 'scanned' || c['status'] == 'completed').length;
        final completionPayload = {
          'status': 'completed',
          'endTime': DateTime.now().toUtc().toIso8601String(),
          'missedCheckpoints': missedCount,
          'completed_points': completedCount,
          'total_points': _checkpoints.length,
        };
        await http.patch(
          Uri.parse('$kBaseUrl/items/patrols/$_activePatrolId'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
          body: jsonEncode(completionPayload),
        );
        _positionStreamSubscription?.cancel();
        _stepCountStream?.cancel();
        _compassStream?.cancel();

        await _notifyNextRecurringPatrol();
        
        if (_patrolIntervalMins > 0) {
          setState(() {
            _nextPatrolTime = now.add(Duration(minutes: _patrolIntervalMins));
            _fiveMinWarningFired = false;
          });
        }

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Patrol Completed!'),
              backgroundColor: Colors.indigoAccent,
              duration: Duration(seconds: 4),
            ),
          );
        }
      } catch(e) {
        print("Failed to complete patrol: $e");
      }
    }
  }

  Future<void> _notifyNextRecurringPatrol() async {
    if (_currentPatrol == null) return;
    final groupId = _currentPatrol!['groupId'];
    if (groupId == null) return;

    try {
      final nowIso = DateTime.now().toUtc().toIso8601String();
      final res = await http.get(
        Uri.parse(
          '$kBaseUrl/items/patrols'
          '?filter[groupId][_eq]=$groupId'
          '&filter[status][_eq]=scheduled'
          '&filter[scheduledTime][_gt]=$nowIso'
          '&sort=scheduledTime'
          '&limit=1'
        ),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body)['data'] as List?;
        if (data != null && data.isNotEmpty) {
          final next = data.first;
          final scheduledTimeStr = next['scheduledTime'];
          if (scheduledTimeStr != null) {
            final scheduledTime = DateTime.parse(scheduledTimeStr).toLocal();
            final notificationId = next['id'].toString().hashCode;
            await NotificationService().schedulePatrolAlert(
              notificationId,
              next['zoneName'] ?? 'Patrol',
              scheduledTime,
            );
            debugPrint("✅ Next patrol notification scheduled: ${next['zoneName']} at $scheduledTime");
          }
        }
      }
    } catch (e) {
      debugPrint("Error scheduling next patrol notification: $e");
    }
  }

  void _startLocationTracking() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    await Permission.activityRecognition.request();

    _compassStream = FlutterCompass.events?.listen((CompassEvent event) {
      if (event.heading != null) {
        _currentHeading = event.heading!;
      }
    });

    _positionStreamSubscription = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high, 
        distanceFilter: 10,
      ),
    ).listen((Position position) {
      if (position.accuracy < 25.0) {
        _currentLat = position.latitude;
        _currentLng = position.longitude;
        _uploadLocation(_currentLat!, _currentLng!, speed: position.speed, accuracy: position.accuracy);
      }
    });

    _stepCountStream = Pedometer.stepCountStream.listen((StepCount event) {
      if (_lastStepCount == -1) {
        _lastStepCount = event.steps;
        return;
      }
      
      int newSteps = event.steps - _lastStepCount;
      _lastStepCount = event.steps;

      if (newSteps > 0 && _currentLat != null && _currentLng != null) {
        double distanceMeters = newSteps * 0.76;
        const double r = 6378137;
        
        double headingRad = _currentHeading * (math.pi / 180.0);
        
        double dLat = distanceMeters * math.cos(headingRad);
        double dLng = distanceMeters * math.sin(headingRad);
        
        _currentLat = _currentLat! + (dLat / r) * (180.0 / math.pi);
        _currentLng = _currentLng! + (dLng / (r * math.cos(_currentLat! * math.pi / 180.0))) * (180.0 / math.pi);
      }
    });
  }

  void _uploadLocation(double lat, double lng, {double speed = 0.0, double accuracy = 5.0}) async {
    final now = DateTime.now();
    // Battery optimization: Throttle GPS network uploads to minimum 12-second intervals
    if (_lastGpsUploadTime != null && now.difference(_lastGpsUploadTime!).inSeconds < 12) {
      return;
    }
    _lastGpsUploadTime = now;

    if (_activePatrolId != null) {
      try {
        await http.patch(
          Uri.parse('$kBaseUrl/items/patrols/$_activePatrolId'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
          body: jsonEncode({'currentLat': lat, 'currentLng': lng}),
        );
      } catch (e) {
        debugPrint("GPS Update Error: $e");
      }

      try {
        int stepsToUpload = _lastStepCount == -1 ? 0 : _lastStepCount;
        await http.post(
          Uri.parse('$kBaseUrl/items/tracking_points'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
          body: jsonEncode({
            'patrol_id': _activePatrolId,
            'latitude': lat.toString(),
            'longitude': lng.toString(),
            'heading': _currentHeading,
            'speed': speed,
            'steps': stepsToUpload,
            'accuracy': accuracy
          }),
        );
      } catch (e) {
        debugPrint("Tracking Point Insert Error: $e");
      }
    }
  }

  void _startCountdownTimer() {
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      final now = DateTime.now();
      setState(() {
        if (_nextPatrolTime != null) {
          final diff = _nextPatrolTime!.difference(now);
          _timeToNextPatrol = diff.isNegative ? Duration.zero : diff;

          if (!_fiveMinWarningFired && diff.inSeconds > 0 && diff.inSeconds <= 300) {
            _fiveMinWarningFired = true;
            NotificationService().schedulePatrolAlert(
              999,
              _currentPatrol?['zoneName'] ?? 'Patrol',
              DateTime.now().add(const Duration(seconds: 1)),
            );
          }
        }

        if (_lastScanTime != null && _checkpointIntervalSecs > 0) {
          final nextCpTime = _lastScanTime!.add(Duration(seconds: _checkpointIntervalSecs));
          final diff = nextCpTime.difference(now);
          _timeToNextCheckpoint = diff.isNegative ? Duration.zero : diff;
        }
      });
    });
  }

  String _formatDuration(Duration d) {
    final h = d.inHours;
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return h > 0 ? '$h:$m:$s' : '$m:$s';
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _countdownTimer?.cancel();
    _positionStreamSubscription?.cancel();
    _stepCountStream?.cancel();
    _compassStream?.cancel();
    super.dispose();
  }

  void _startStatusPolling() {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 5), (_) async {
      if (!mounted || _activePatrolId == null) return;
      try {
        final prefs = await SharedPreferences.getInstance();
        final offlineKeys = prefs.getKeys().where((k) => k.startsWith('offline_sync_${_activePatrolId}_cp_')).toList();
        for (String key in offlineKeys) {
          final cpId = key.split('_cp_').last;
          final payloadStr = prefs.getString(key);
          if (payloadStr != null) {
            prefs.remove(key);
          }
        }

        final cpRes = await http.get(
          Uri.parse('$kBaseUrl/items/patrols/$_activePatrolId?fields=status,groupId'),
          headers: {'Authorization': 'Bearer $token'},
        );
        if (cpRes.statusCode == 200 && mounted) {
          final data = jsonDecode(cpRes.body)['data'];
          final serverStatus = data['status'];
          if (serverStatus == 'completed' && _checkpoints.any((c) => c['status'] == 'pending')) {
            final groupId = data['groupId'];
            if (groupId != null) {
              final cpListRes = await http.get(
                Uri.parse('$kBaseUrl/items/checkpoints?filter[group_id][_eq]=$groupId&sort=sort_order'),
                headers: {'Authorization': 'Bearer $token'},
              );
              if (cpListRes.statusCode == 200 && mounted) {
                final cpData = jsonDecode(cpListRes.body);
                setState(() {
                  final serverCps = List<Map<String, dynamic>>.from(cpData['data']);
                  for (int i = 0; i < _checkpoints.length && i < serverCps.length; i++) {
                    final serverStatus = serverCps[i]['status'];
                    if (serverStatus == 'completed' && _checkpoints[i]['status'] == 'pending') {
                      _checkpoints[i]['status'] = 'completed';
                      _checkpoints[i]['scanned_at'] = serverCps[i]['scanned_at'] ?? '—';
                    }
                  }
                });
              }
            }
          }
        }
      } catch (_) {}
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF131720),
        body: Center(child: CircularProgressIndicator(color: Colors.indigoAccent)),
      );
    }

    int completedCount = _checkpoints.where((c) => c['status'] == 'scanned' || c['status'] == 'completed').length;
    double progress = _checkpoints.isEmpty ? 0 : completedCount / _checkpoints.length;

    return Scaffold(
      backgroundColor: const Color(0xFF131720),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Patrol Route',
          style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.bold, color: Colors.white),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.all(20),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1C212D),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _routeName,
                        style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.indigoAccent.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '$completedCount / ${_checkpoints.length}',
                          style: const TextStyle(color: Colors.indigoAccent, fontWeight: FontWeight.bold),
                        ),
                      )
                    ],
                  ),
                  const SizedBox(height: 16),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: LinearProgressIndicator(
                      value: progress,
                      backgroundColor: Colors.white12,
                      color: Colors.indigoAccent,
                      minHeight: 8,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.indigoAccent.withOpacity(0.08),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.indigoAccent.withOpacity(0.2)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(children: [
                                const Icon(LucideIcons.mapPin, color: Colors.indigoAccent, size: 11),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: const Text('Next Checkpoint', 
                                    style: TextStyle(color: Colors.indigoAccent, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ]),
                              const SizedBox(height: 4),
                              Text(
                                _lastScanTime != null && _checkpointIntervalSecs > 0
                                  ? _formatDuration(_timeToNextCheckpoint)
                                  : (_checkpointIntervalSecs > 0
                                      ? '${_checkpointIntervalSecs ~/ 60}m'
                                      : '—'),
                                style: TextStyle(
                                  color: _lastScanTime != null ? Colors.white : Colors.white38,
                                  fontSize: 18, fontWeight: FontWeight.w900, fontFamily: 'monospace',
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.greenAccent.withOpacity(0.06),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.greenAccent.withOpacity(0.2)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(children: [
                                const Icon(LucideIcons.repeat2, color: Colors.greenAccent, size: 11),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: const Text('Next Patrol', 
                                    style: TextStyle(color: Colors.greenAccent, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ]),
                              const SizedBox(height: 4),
                              Text(
                                _nextPatrolTime != null
                                  ? _formatDuration(_timeToNextPatrol)
                                  : (_patrolIntervalMins > 0 ? 'every ${_patrolIntervalMins}m' : '—'),
                                style: TextStyle(
                                  color: _nextPatrolTime != null ? Colors.white : Colors.white38,
                                  fontSize: 18, fontWeight: FontWeight.w900, fontFamily: 'monospace',
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            Builder(
              builder: (context) {
                int nextIdx = _checkpoints.indexWhere(
                  (c) => c['status'] != 'completed' && c['status'] != 'scanned'
                );
                final nextCp = nextIdx != -1 ? _checkpoints[nextIdx] : null;
                final completedCps = _checkpoints.where((c) => c['status'] == 'scanned' || c['status'] == 'completed').toList().reversed.toList();
                
                final isScheduled = _currentPatrol?['status'] == 'scheduled';

                if (_checkpoints.isEmpty) {
                  return Expanded(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(LucideIcons.map, size: 48, color: Colors.white24),
                          const SizedBox(height: 16),
                          const Text('No checkpoints found.', style: TextStyle(color: Colors.white54)),
                          const SizedBox(height: 24),
                          ElevatedButton.icon(
                            onPressed: () async {
                              final result = await Navigator.push<String>(
                                context,
                                MaterialPageRoute(builder: (_) => const FullScreenCheckpointScanner()),
                              );
                              if (result != null && result.isNotEmpty) {
                                _handleDynamicClaim(result);
                              }
                            },
                            icon: const Icon(LucideIcons.scan, color: Colors.white),
                            label: const Text('Scan QR / Tap NFC', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF15803D),
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          )
                        ],
                      ),
                    ),
                  );
                }

                return Expanded(
                  child: Column(
                    children: [
                      Container(
                        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: isScheduled 
                              ? [const Color(0xFF4338CA), const Color(0xFF6366F1)]
                              : [const Color(0xFF15803D), const Color(0xFF22C55E)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: (isScheduled ? Colors.indigoAccent : Colors.greenAccent).withOpacity(0.3),
                              blurRadius: 20,
                              offset: const Offset(0, 10),
                            )
                          ]
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isScheduled ? 'READY TO START' : (nextCp != null ? 'NEXT CHECKPOINT' : 'PATROL COMPLETE'),
                              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              isScheduled 
                                ? 'Begin Route' 
                                : (nextCp != null ? nextCp['name'] : 'All checkpoints scanned!'),
                              style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900, height: 1.1),
                            ),
                            const SizedBox(height: 6),
                            if (nextCp != null && !isScheduled)
                              Text('Floor: ${nextCp['floor'] ?? 'Ground'}', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14)),
                            const SizedBox(height: 24),
                            
                            GestureDetector(
                              onTap: () async {
                                if (isScheduled) {
                                  if (_activePatrolId == null) {
                                    if (mounted) ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Patrol ID missing. Please try again.')));
                                    return;
                                  }
                                  setState(() {
                                    _currentPatrol!['status'] = 'active';
                                    _isLoading = true;
                                  });
                                  try {
                                    final prefs = await SharedPreferences.getInstance();
                                    final oldKeys = prefs.getKeys().where((k) => k.startsWith('patrol_${_activePatrolId}_')).toList();
                                    for (final k in oldKeys) { await prefs.remove(k); }

                                    setState(() {
                                      for (var cp in _checkpoints) {
                                        cp['status'] = 'pending';
                                        cp['scanned_at'] = null;
                                      }
                                    });

                                    await http.patch(
                                      Uri.parse('$kBaseUrl/items/patrols/$_activePatrolId'),
                                      headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
                                      body: jsonEncode({
                                        'status': 'active',
                                        'guardId': (userid != null && userid.toString().isNotEmpty) ? userid : null,
                                        'guardName': (userName != null && userName!.isNotEmpty) ? userName : 'Mobile Guard',
                                      }),
                                    );
                                    _startLocationTracking();
                                    _startStatusPolling();
                                    _startCountdownTimer();
                                  } catch (e) {
                                    print("Error starting: $e");
                                  } finally {
                                    setState(() => _isLoading = false);
                                  }
                                } else if (nextCp != null) {
                                  final result = await Navigator.push<String>(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => FullScreenCheckpointScanner(
                                        targetCheckpointName: nextCp['name'],
                                      ),
                                    ),
                                  );
                                  if (result != null) {
                                    _processActualScan(nextIdx, result);
                                  }
                                } else {
                                  if (_activePatrolId != null && _currentPatrol?['status'] == 'active' && !_isCompleting) {
                                    _isCompleting = true;
                                    setState(() => _isLoading = true);
                                    try {
                                      final missedCount = _checkpoints.where((c) => c['status'] != 'completed' && c['status'] != 'scanned').length;
                                      await http.patch(
                                        Uri.parse('$kBaseUrl/items/patrols/$_activePatrolId'),
                                        headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
                                        body: jsonEncode({'status': 'completed', 'missedCheckpoints': missedCount}),
                                      );
                                    } catch (e) {
                                      print("Complete error: $e");
                                    } finally {
                                      if (mounted) setState(() => _isLoading = false);
                                    }
                                  }
                                }
                              },
                              child: Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Center(
                                  child: Text(
                                    isScheduled 
                                      ? 'Start Route' 
                                      : (nextCp != null ? 'Scan QR / Tap NFC' : 'Patrol Completed'),
                                    style: TextStyle(
                                      color: isScheduled ? const Color(0xFF4338CA) : (nextCp != null ? const Color(0xFF15803D) : Colors.black87),
                                      fontWeight: FontWeight.w900,
                                      fontSize: 16,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            
                            if (!isScheduled) ...[
                              const SizedBox(height: 16),
                              GestureDetector(
                                onTap: () {
                                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Incident Reporting coming soon.')));
                                },
                                child: Center(
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(LucideIcons.alertTriangle, color: Colors.white.withOpacity(0.8), size: 16),
                                      const SizedBox(width: 6),
                                      Text('Report an Issue', style: TextStyle(color: Colors.white.withOpacity(0.8), fontWeight: FontWeight.bold, fontSize: 14)),
                                    ],
                                  ),
                                ),
                              ),
                            ]
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 12),
                      
                      if (completedCps.isNotEmpty) ...[
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                          child: Align(
                            alignment: Alignment.centerLeft,
                            child: Text(
                              'COMPLETED CHECKPOINTS (${completedCps.length}/${_checkpoints.length})',
                              style: const TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                            ),
                          ),
                        ),
                        Expanded(
                          child: ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                            itemCount: completedCps.length,
                            itemBuilder: (context, index) {
                              final cp = completedCps[index];
                              return Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.03),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(LucideIcons.checkCircle2, color: Colors.green, size: 20),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        cp['name'],
                                        style: const TextStyle(color: Colors.white54, decoration: TextDecoration.lineThrough),
                                      ),
                                    ),
                                    Text(
                                      cp['scanned_at']?.toString().split(' - ').last ?? '',
                                      style: const TextStyle(color: Colors.white38, fontSize: 12),
                                    )
                                  ],
                                ),
                              );
                            },
                          ),
                        ),
                      ] else ...[
                        const Expanded(child: SizedBox())
                      ]
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  Full-Screen Checkpoint Scanner (Simultaneous QR & NFC)
// ─────────────────────────────────────────────────────────────

class FullScreenCheckpointScanner extends StatefulWidget {
  final String? targetCheckpointName;
  const FullScreenCheckpointScanner({Key? key, this.targetCheckpointName}) : super(key: key);

  @override
  State<FullScreenCheckpointScanner> createState() => _FullScreenCheckpointScannerState();
}

class _FullScreenCheckpointScannerState extends State<FullScreenCheckpointScanner> with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'PatrolFullScreenQR');
  QRViewController? controller;
  bool _isScanned = false;
  bool _isFlashOn = false;
  late AnimationController _laserAnimController;
  late Animation<double> _laserAnimation;

  @override
  void initState() {
    super.initState();
    _laserAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);
    _laserAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _laserAnimController, curve: Curves.easeInOut),
    );

    _initNfcListener();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (controller == null) return;
    if (state == AppLifecycleState.paused) {
      controller?.pauseCamera();
    } else if (state == AppLifecycleState.resumed) {
      controller?.resumeCamera();
    }
  }

  Future<void> _initNfcListener() async {
    try {
      await NfcAuthService().startListening(
        onCardDetected: (cardId) {
          if (_isScanned || !mounted) return;
          _isScanned = true;
          HapticFeedback.heavyImpact();
          controller?.pauseCamera();
          if (mounted) {
            Navigator.of(context).pop('NFC::$cardId');
          }
        },
        onError: (err) {
          debugPrint('[NFC Scanner] Error: $err');
        },
      );
    } catch (e) {
      debugPrint('[NFC Scanner] Init Error: $e');
    }
  }

  @override
  void reassemble() {
    super.reassemble();
    if (Platform.isAndroid) {
      controller?.pauseCamera();
    }
    controller?.resumeCamera();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _laserAnimController.dispose();
    NfcAuthService().stopListening();
    controller?.dispose();
    super.dispose();
  }

  void _onQRViewCreated(QRViewController controller) {
    this.controller = controller;
    Future.delayed(const Duration(milliseconds: 250), () {
      controller.resumeCamera();
    });

    controller.scannedDataStream.listen((scanData) {
      if (!_isScanned && scanData.code != null && scanData.code!.isNotEmpty) {
        _isScanned = true;
        HapticFeedback.mediumImpact();
        controller.pauseCamera();
        if (mounted) {
          Navigator.of(context).pop(scanData.code);
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final scanAreaSize = math.min(size.width * 0.75, 280.0);

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. Full-screen Camera View
          QRView(
            key: qrKey,
            formatsAllowed: const [BarcodeFormat.qrcode],
            onQRViewCreated: _onQRViewCreated,
            onPermissionSet: (ctrl, p) {
              if (!p) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Camera Permission is required to scan checkpoints.')),
                );
                Navigator.of(context).pop();
              }
            },
          ),

          // 2. Dark Frosted Mask & Scanner Reticle
          _buildScannerOverlay(size, scanAreaSize),

          // 3. Animated Scanning Laser & Corner Reticle
          Center(
            child: SizedBox(
              width: scanAreaSize,
              height: scanAreaSize,
              child: AnimatedBuilder(
                animation: _laserAnimation,
                builder: (context, child) {
                  return CustomPaint(
                    painter: _LaserSweepPainter(progress: _laserAnimation.value),
                  );
                },
              ),
            ),
          ),

          // 4. Top Action Buttons (Close on left, Flash & Flip on right)
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildCircleButton(
                    icon: Icons.close_rounded,
                    onTap: () => Navigator.of(context).pop(),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _buildCircleButton(
                        icon: _isFlashOn ? Icons.flash_on : Icons.flash_off,
                        color: _isFlashOn ? Colors.yellow : Colors.white,
                        onTap: () async {
                          await controller?.toggleFlash();
                          final status = await controller?.getFlashStatus();
                          setState(() => _isFlashOn = status ?? false);
                        },
                      ),
                      const SizedBox(width: 8),
                      _buildCircleButton(
                        icon: Icons.cameraswitch_rounded,
                        onTap: () async {
                          await controller?.flipCamera();
                          setState(() {});
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // 5. Centered Mode Badge Pill
          Positioned(
            top: MediaQuery.of(context).padding.top + 16,
            left: 70,
            right: 120,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.75),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withOpacity(0.18)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(LucideIcons.scan, color: Color(0xFF22C55E), size: 14),
                    const SizedBox(width: 6),
                    Text(
                      'QR + NFC Active',
                      style: GoogleFonts.inter(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // 6. Target Checkpoint HUD Pill
          if (widget.targetCheckpointName != null)
            Positioned(
              top: MediaQuery.of(context).padding.top + 64,
              left: 20,
              right: 20,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B).withOpacity(0.85),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFF007AFF).withOpacity(0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(LucideIcons.mapPin, color: Color(0xFF007AFF), size: 16),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          'Target: ${widget.targetCheckpointName}',
                          style: GoogleFonts.inter(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // 7. Bottom NFC / QR Guidance Card
          Positioned(
            bottom: 20 + MediaQuery.of(context).padding.bottom,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A).withOpacity(0.95),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withOpacity(0.12)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.5),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF22C55E).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(LucideIcons.qrCode, color: Color(0xFF22C55E), size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Scan Checkpoint QR',
                              style: GoogleFonts.inter(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Position QR code inside the green target frame',
                              style: GoogleFonts.inter(
                                color: const Color(0xFF94A3B8),
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Divider(color: Colors.white.withOpacity(0.08), height: 1),
                  ),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF007AFF).withOpacity(0.18),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(Icons.nfc_rounded, color: Color(0xFF007AFF), size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Tap NFC Checkpoint Tag',
                              style: GoogleFonts.inter(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Hold phone back against NFC badge/tag to scan',
                              style: GoogleFonts.inter(
                                color: const Color(0xFF94A3B8),
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCircleButton({
    required IconData icon,
    required VoidCallback onTap,
    Color color = Colors.white,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(22),
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.55),
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white.withOpacity(0.15)),
        ),
        child: Center(
          child: Icon(icon, color: color, size: 22),
        ),
      ),
    );
  }

  Widget _buildScannerOverlay(Size screenSize, double scanAreaSize) {
    return ColorFiltered(
      colorFilter: ColorFilter.mode(
        Colors.black.withOpacity(0.65),
        BlendMode.srcOut,
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          Container(
            decoration: const BoxDecoration(
              color: Colors.black,
              backgroundBlendMode: BlendMode.dstOut,
            ),
          ),
          Center(
            child: Container(
              width: scanAreaSize,
              height: scanAreaSize,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LaserSweepPainter extends CustomPainter {
  final double progress;
  _LaserSweepPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final y = size.height * progress;
    final paint = Paint()
      ..shader = LinearGradient(
        colors: [
          Colors.transparent,
          const Color(0xFF22C55E).withOpacity(0.8),
          const Color(0xFF22C55E),
          const Color(0xFF22C55E).withOpacity(0.8),
          Colors.transparent,
        ],
        stops: const [0.0, 0.2, 0.5, 0.8, 1.0],
      ).createShader(Rect.fromLTWH(0, y - 2, size.width, 4))
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);

    // Corner guides
    final cornerPaint = Paint()
      ..color = const Color(0xFF22C55E)
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    const cornerLength = 28.0;

    // Top-Left
    canvas.drawLine(const Offset(0, 0), const Offset(cornerLength, 0), cornerPaint);
    canvas.drawLine(const Offset(0, 0), const Offset(0, cornerLength), cornerPaint);

    // Top-Right
    canvas.drawLine(Offset(size.width, 0), Offset(size.width - cornerLength, 0), cornerPaint);
    canvas.drawLine(Offset(size.width, 0), Offset(size.width, cornerLength), cornerPaint);

    // Bottom-Left
    canvas.drawLine(Offset(0, size.height), Offset(cornerLength, size.height), cornerPaint);
    canvas.drawLine(Offset(0, size.height), Offset(0, size.height - cornerLength), cornerPaint);

    // Bottom-Right
    canvas.drawLine(Offset(size.width, size.height), Offset(size.width - cornerLength, size.height), cornerPaint);
    canvas.drawLine(Offset(size.width, size.height), Offset(size.width, size.height - cornerLength), cornerPaint);
  }

  @override
  bool shouldRepaint(covariant _LaserSweepPainter oldDelegate) => oldDelegate.progress != progress;
}

