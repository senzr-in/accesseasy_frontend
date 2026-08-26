import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;
import 'package:adaptive_theme/adaptive_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:accesseasy_shared/core/constants.dart';
import 'package:accesseasy_shared/core/theme.dart';
import 'package:accesseasy_shared/services/auth_service.dart';
import 'package:accesseasy_shared/services/notification_service.dart';
import 'package:accesseasy_shared/auth/login_page.dart';

import '../patrol/patrol_screen.dart';
import '../patrol/schedule_hub_screen.dart';
import '../admin/admin_dashboard_screen.dart';
import '../admin/create_guard_screen.dart';
import '../auth/guard_session_service.dart';
import '../auth/guard_kiosk_lock_screen.dart';
import '../auth/unified_login_screen.dart';
import '../handover/guard_handover_service.dart';
import '../sos/patrol_sos_screen.dart';
import '../device/device_profile_service.dart';
import '../offline/offline_event_queue.dart';

class PatrolDashboardScreen extends StatefulWidget {
  final String doorName;
  final ValueChanged<int> onTabSelect;

  const PatrolDashboardScreen({
    super.key,
    required this.doorName,
    required this.onTabSelect,
  });

  @override
  State<PatrolDashboardScreen> createState() => _PatrolDashboardScreenState();
}

class _PatrolDashboardScreenState extends State<PatrolDashboardScreen> with WidgetsBindingObserver {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  bool _isLoading = false;
  int _completedPatrols = 0;
  int _pendingPatrols = 0;
  Map<String, dynamic>? _nextPatrol;
  List<Map<String, dynamic>> _todayPatrols = [];

  // Shift & Attendance State
  bool _isCheckedIn = false;
  bool _isOnBreak = false;
  String _siteName = "Main Facility";
  String _zoneName = "Perimeter Zone";
  String? _siteId;
  String? _zoneId;
  double _siteLat = 12.9716;
  double _siteLng = 80.2435;
  double _geofenceRadiusM = 100.0;
  double? _currentDistanceM;
  bool _isInsideGeofence = true;
  String? _attendanceId;
  DateTime? _checkInTime;

  int _appUsageSeconds = 0;
  String _shiftDurationStr = "00:00:00";
  Timer? _shiftTimer;
  SharedPreferences? _prefs;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initializeData();
  }

  Future<void> _initializeData() async {
    await _requestInitialPermissions();
    await _loadAppUsageAndAttendance();
    await Future.wait([
      _fetchSiteAndZone(),
      _fetchPatrolStats(),
    ]);
  }

  Future<void> _requestInitialPermissions() async {
    try {
      await NotificationService().requestPermission();
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (serviceEnabled) {
        LocationPermission permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.denied) {
          await Geolocator.requestPermission();
        }
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _stopShiftTimer();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      _stopShiftTimer();
    } else if (state == AppLifecycleState.resumed) {
      if (_isCheckedIn && !_isOnBreak) {
        _startShiftTimer();
      }
    }
  }

  Future<void> _loadAppUsageAndAttendance() async {
    _prefs = await SharedPreferences.getInstance();
    _appUsageSeconds = _prefs!.getInt('guard_app_usage_seconds') ?? 0;
    _isCheckedIn = _prefs!.getBool('guard_is_checked_in') ?? false;
    _isOnBreak = _prefs!.getBool('guard_is_on_break') ?? false;
    _attendanceId = _prefs!.getString('guard_attendance_id');
    _siteName = _prefs!.getString('guard_site_name') ?? _siteName;
    _zoneName = _prefs!.getString('guard_zone_name') ?? _zoneName;

    final checkInStr = _prefs!.getString('guard_check_in_time');
    if (checkInStr != null) {
      _checkInTime = DateTime.tryParse(checkInStr);
      if (_checkInTime != null && _isCheckedIn) {
        _appUsageSeconds = DateTime.now().difference(_checkInTime!).inSeconds;
      }
    }

    _updateDurationString();
    if (_isCheckedIn && !_isOnBreak) {
      _startShiftTimer();
    }
    if (mounted) setState(() {});
  }

  Future<void> _fetchSiteAndZone() async {
    try {
      if (token == null) return;
      final res = await http.get(
        Uri.parse('$kBaseUrl/items/locationManagement?filter[tenant][_eq]=$tenant&limit=1'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body)['data'] as List?;
        if (data != null && data.isNotEmpty) {
          final s = data[0];
          final sName = s['locName']?.toString() ?? s['name']?.toString() ?? _siteName;
          double? lat = s['latitude'] != null ? (s['latitude'] as num).toDouble() : null;
          double? lng = s['longitude'] != null ? (s['longitude'] as num).toDouble() : null;
          if (s['locmark'] != null && s['locmark'] is Map) {
            lat = (s['locmark']['lat'] as num?)?.toDouble() ?? lat;
            lng = (s['locmark']['lng'] as num?)?.toDouble() ?? lng;
          }
          if (mounted) {
            setState(() {
              _siteId = s['id']?.toString();
              _siteName = sName;
              if (lat != null) _siteLat = lat;
              if (lng != null) _siteLng = lng;
              final radiusRaw = s['geofence_radius'] ?? s['geofence_radius_m'] ?? s['radius'];
              if (radiusRaw != null) _geofenceRadiusM = (radiusRaw as num).toDouble();
            });
          }
          _prefs?.setString('guard_site_name', _siteName);
        }
      }
      _evaluateGeofence();
    } catch (e) {
      debugPrint('Error fetching site info: $e');
    }
  }

  Future<void> _evaluateGeofence() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return;
      LocationPermission perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied || perm == LocationPermission.deniedForever) return;

      final pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      final dist = Geolocator.distanceBetween(pos.latitude, pos.longitude, _siteLat, _siteLng);

      if (mounted) {
        setState(() {
          _currentDistanceM = dist;
          _isInsideGeofence = dist <= (_geofenceRadiusM + (pos.accuracy * 0.5));
        });
      }
    } catch (_) {}
  }

  void _startShiftTimer() {
    _shiftTimer?.cancel();
    _shiftTimer = Timer.periodic(const Duration(seconds: 1), (timer) async {
      _appUsageSeconds++;
      _updateDurationString();
      if (_appUsageSeconds % 15 == 0 && _prefs != null) {
        _prefs!.setInt('guard_app_usage_seconds', _appUsageSeconds);
        if (userid != null && token != null) {
          _uploadGuardLocation();
        }
      }
    });
  }

  Future<void> _uploadGuardLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return;
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) return;
      final pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.medium);
      await http.patch(
        Uri.parse('$kBaseUrl/users/$userid'),
        headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
        body: jsonEncode({'currentLat': pos.latitude, 'currentLng': pos.longitude}),
      );
    } catch (_) {}
  }

  void _stopShiftTimer() {
    _shiftTimer?.cancel();
    _shiftTimer = null;
    _prefs?.setInt('guard_app_usage_seconds', _appUsageSeconds);
  }

  void _updateDurationString() {
    final duration = Duration(seconds: _appUsageSeconds);
    final hours = duration.inHours.toString().padLeft(2, '0');
    final minutes = (duration.inMinutes % 60).toString().padLeft(2, '0');
    final seconds = (duration.inSeconds % 60).toString().padLeft(2, '0');
    if (mounted) {
      setState(() => _shiftDurationStr = "$hours:$minutes:$seconds");
    }
  }

  Future<void> _handleCheckIn() async {
    setState(() => _isLoading = true);
    try {
      Position? pos;
      try {
        pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      } catch (_) {}

      final now = DateTime.now();
      final nowIso = now.toUtc().toIso8601String();
      bool onlineSuccess = false;

      final payload = {
        'guard': userid,
        'site': _siteId,
        'zone': _zoneId,
        'check_in_time': nowIso,
        'status': 'present',
        'check_in_lat': pos?.latitude,
        'check_in_lng': pos?.longitude,
        'tenant': tenant,
      };

      if (token != null && tenant != null) {
        try {
          final res = await http.post(
            Uri.parse('$kBaseUrl/items/guard_attendance'),
            headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
            body: jsonEncode(payload),
          ).timeout(const Duration(seconds: 8));
          if (res.statusCode == 200 || res.statusCode == 201) {
            final body = jsonDecode(res.body);
            _attendanceId = body['data']?['id']?.toString();
            onlineSuccess = true;
          }
        } catch (_) {}
      }

      if (!onlineSuccess) {
        _attendanceId ??= 'att-${now.millisecondsSinceEpoch}';
        await OfflineEventQueue().recordEvent(
          eventType: 'attendance_checkin',
          gpsLat: pos?.latitude,
          gpsLng: pos?.longitude,
          payload: {
            ...payload,
            'client_temp_id': _attendanceId,
          },
        );
      }

      _checkInTime = now;
      _isCheckedIn = true;
      _isOnBreak = false;
      _appUsageSeconds = 0;

      await _prefs?.setBool('guard_is_checked_in', true);
      await _prefs?.setBool('guard_is_on_break', false);
      await _prefs?.setString('guard_check_in_time', now.toIso8601String());
      await _prefs?.setString('guard_attendance_id', _attendanceId!);

      _startShiftTimer();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                const SizedBox(width: 10),
                Expanded(child: Text('Clocked in to $_siteName', style: GoogleFonts.inter(fontWeight: FontWeight.w600))),
              ],
            ),
            backgroundColor: const Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

    Future<void> _handleToggleBreak() async {
    final nextBreakState = !_isOnBreak;
    setState(() => _isOnBreak = nextBreakState);
    await _prefs?.setBool('guard_is_on_break', nextBreakState);

    if (nextBreakState) {
      _stopShiftTimer();
    } else {
      _startShiftTimer();
    }

    final nowIso = DateTime.now().toUtc().toIso8601String();
    final breakPayload = {
      'status': nextBreakState ? 'on_break' : 'present',
      if (nextBreakState) 'break_started_at': nowIso,
      if (!nextBreakState) 'break_ended_at': nowIso,
    };

    bool breakPatched = false;
    if (token != null && _attendanceId != null && !_attendanceId!.startsWith('att-')) {
      try {
        final res = await http.patch(
          Uri.parse('$kBaseUrl/items/guard_attendance/$_attendanceId'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
          body: jsonEncode(breakPayload),
        ).timeout(const Duration(seconds: 8));
        if (res.statusCode == 200 || res.statusCode == 204) {
          breakPatched = true;
        }
      } catch (e) {
        debugPrint('Error updating break status in backend: $e');
      }
    }

    if (!breakPatched) {
      await OfflineEventQueue().recordEvent(
        eventType: 'attendance_break',
        payload: {'attendance_id': _attendanceId, ...breakPayload},
      );
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(nextBreakState ? 'Break active • Shift paused' : 'Duty resumed', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
          backgroundColor: nextBreakState ? const Color(0xFFF59E0B) : const Color(0xFF10B981),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      );
    }
  }

  Future<void> _handleCheckOut() async {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text('End Shift?', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        content: Text('Are you ready to clock out for today?', style: GoogleFonts.inter(fontSize: 14)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel', style: GoogleFonts.inter(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('Clock Out', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _isLoading = true);
    try {
      Position? pos;
      try {
        pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.medium);
      } catch (_) {}

      final now = DateTime.now();
      final nowIso = now.toUtc().toIso8601String();

      final checkoutPayload = {
        'check_out_time': nowIso,
        'status': 'off_duty',
        if (pos != null) 'check_out_lat': pos.latitude,
        if (pos != null) 'check_out_lng': pos.longitude,
      };

      bool checkoutSuccess = false;
      if (token != null && _attendanceId != null && !_attendanceId!.startsWith('att-')) {
        try {
          final patchRes = await http.patch(
            Uri.parse('$kBaseUrl/items/guard_attendance/$_attendanceId'),
            headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
            body: jsonEncode(checkoutPayload),
          ).timeout(const Duration(seconds: 8));
          if (patchRes.statusCode == 200 || patchRes.statusCode == 204) {
            checkoutSuccess = true;
          }
        } catch (e) {
          debugPrint('Error patching check-out, queueing offline: $e');
        }
      }

      if (!checkoutSuccess) {
        await OfflineEventQueue().recordEvent(
          eventType: 'attendance_checkout',
          gpsLat: pos?.latitude,
          gpsLng: pos?.longitude,
          payload: {'attendance_id': _attendanceId, ...checkoutPayload},
        );
      }

      _stopShiftTimer();
      _isCheckedIn = false;
      _isOnBreak = false;
      _appUsageSeconds = 0;
      _shiftDurationStr = "00:00:00";

      await _prefs?.setBool('guard_is_checked_in', false);
      await _prefs?.setBool('guard_is_on_break', false);
      await _prefs?.remove('guard_check_in_time');
      await _prefs?.remove('guard_attendance_id');
      await _prefs?.remove('guard_app_usage_seconds');

      await GuardSessionService().endGuardSession();

      final loginMode = _prefs?.getString('app_login_mode');
      if (loginMode == 'user_guard') {
        if (mounted) {
          Navigator.of(context).pushAndRemoveUntil(
            PageRouteBuilder(
              pageBuilder: (_, __, ___) => const UnifiedLoginScreen(initialTabIndex: 0),
              transitionsBuilder: (_, anim, __, child) => FadeTransition(opacity: anim, child: child),
              transitionDuration: const Duration(milliseconds: 300),
            ),
            (route) => false,
          );
        }
      } else {
        if (mounted) {
          Navigator.of(context).pushAndRemoveUntil(
            PageRouteBuilder(
              pageBuilder: (_, __, ___) => const GuardKioskLockScreen(),
              transitionsBuilder: (_, anim, __, child) => FadeTransition(opacity: anim, child: child),
              transitionDuration: const Duration(milliseconds: 300),
            ),
            (route) => false,
          );
        }
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchPatrolStats() async {
    try {
      if (token == null) return;
      final now = DateTime.now();
      final todayString = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
      final currentT = tenant ?? DeviceProfileService().currentProfile?.tenant;
    final String tenantFilter = (currentT != null && currentT.isNotEmpty) ? '?filter[tenant][_eq]=$currentT' : '';
      final String url = '$kBaseUrl/items/patrols$tenantFilter${tenantFilter.isEmpty ? '?' : '&'}fields=*&sort=scheduledTime&limit=100';

      final res = await http.get(
        Uri.parse(url),
        headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body)['data'] as List?;
        if (data != null && mounted) {
          int comp = 0;
          int pend = 0;

          final filteredPatrols = data.where((p) {
            final gid = p['guardId'];
            final actualGuardId = (gid is Map) ? gid['id']?.toString() : gid?.toString();
            final isMyPatrol = (actualGuardId == userid) || (actualGuardId == guardEmpId);
            final isUnassignedSlot = (actualGuardId == null || actualGuardId.toString().isEmpty) && p['status'] == 'scheduled';
            final isAssignedOrAvailable = isMyPatrol || isUnassignedSlot;

            final patrolDate = p['date']?.toString();
            final isToday = patrolDate == todayString;
            final needsAttention = p['status'] == 'active' || p['status'] == 'delayed';

            return isAssignedOrAvailable && (isToday || needsAttention);
          }).cast<Map<String, dynamic>>().toList();

          filteredPatrols.sort((a, b) {
            final tA = a['scheduledTime'] ?? a['startTime'] ?? '';
            final tB = b['scheduledTime'] ?? b['startTime'] ?? '';
            return tA.compareTo(tB);
          });

          for (var p in filteredPatrols) {
            if (p['status'] == 'completed') {
              comp++;
            } else if (p['status'] == 'scheduled' || p['status'] == 'active' || p['status'] == 'delayed') {
              pend++;
            }
          }

          final activePatrols = filteredPatrols.where((p) => p['status'] == 'active' || p['status'] == 'delayed').toList();
          final upcomingPatrols = filteredPatrols.where((p) => p['status'] == 'scheduled').toList();

          Map<String, dynamic>? hero;
          if (activePatrols.isNotEmpty) {
            hero = activePatrols.firstWhere((p) => p['status'] == 'active', orElse: () => activePatrols.first);
          } else if (upcomingPatrols.isNotEmpty) {
            hero = upcomingPatrols.first;
          }

          setState(() {
            _completedPatrols = comp;
            _pendingPatrols = pend;
            _todayPatrols = filteredPatrols;
            if (_nextPatrol == null || !filteredPatrols.any((p) => p['id'] == _nextPatrol!['id'])) {
              _nextPatrol = hero;
            }
          });
        }
      }
    } catch (e) {
      debugPrint('[PatrolDashboardScreen] _fetchPatrolStats error: $e');
    }
  }

  void _showPatrolPickerModal(bool isDark) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.3),
                blurRadius: 20,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Pull Handle
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white24 : Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Title Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Change Patrol Route',
                        style: GoogleFonts.inter(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${_todayPatrols.length} routes scheduled for today',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: Icon(Icons.close_rounded, color: isDark ? Colors.white70 : Colors.black54),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              if (_todayPatrols.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 32),
                  child: Center(
                    child: Column(
                      children: [
                        Icon(LucideIcons.calendarX2, size: 40, color: isDark ? Colors.white38 : Colors.grey),
                        const SizedBox(height: 12),
                        Text(
                          'No patrol routes scheduled for today',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white70 : Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else
                ConstrainedBox(
                  constraints: BoxConstraints(
                    maxHeight: MediaQuery.of(context).size.height * 0.5,
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: _todayPatrols.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final patrol = _todayPatrols[index];
                      final isSelected = _nextPatrol != null && _nextPatrol!['id'] == patrol['id'];
                      final status = patrol['status'] ?? 'scheduled';
                      final zoneName = patrol['zoneName'] ?? patrol['name'] ?? 'Perimeter Route';
                      final rawTime = patrol['scheduledTime'] ?? patrol['startTime'];
                      final timeStr = _formatDisplayTime(rawTime);
                      final checkCount = patrol['checkpoint_count'] ?? patrol['checkpoints']?.length ?? 8;

                      return InkWell(
                        onTap: () {
                          setState(() {
                            _nextPatrol = patrol;
                          });
                          Navigator.pop(ctx);
                          HapticFeedback.selectionClick();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Switched active route to $zoneName', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                              backgroundColor: const Color(0xFF007AFF),
                              duration: const Duration(seconds: 2),
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          );
                        },
                        borderRadius: BorderRadius.circular(14),
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? const Color(0xFF007AFF).withValues(alpha: 0.12)
                                : (isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC)),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isSelected
                                  ? const Color(0xFF007AFF)
                                  : (isDark ? Colors.white.withValues(alpha: 0.06) : const Color(0xFFE2E8F0)),
                              width: isSelected ? 1.5 : 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? const Color(0xFF007AFF)
                                      : (isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  isSelected ? Icons.check_rounded : LucideIcons.compass,
                                  size: 18,
                                  color: isSelected ? Colors.white : (isDark ? Colors.white70 : const Color(0xFF475569)),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      zoneName,
                                      style: GoogleFonts.inter(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '🕒 $timeStr · $checkCount Checkpoints',
                                      style: GoogleFonts.inter(
                                        fontSize: 11.5,
                                        color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: (status == 'active'
                                          ? const Color(0xFF22C55E)
                                          : (status == 'delayed'
                                              ? const Color(0xFFF59E0B)
                                              : const Color(0xFF007AFF)))
                                      .withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  status.toString().toUpperCase(),
                                  style: GoogleFonts.inter(
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.w800,
                                    color: (status == 'active'
                                        ? const Color(0xFF22C55E)
                                        : (status == 'delayed'
                                            ? const Color(0xFFF59E0B)
                                            : const Color(0xFF007AFF))),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),

              const SizedBox(height: 16),

              // View full Schedule Tab button
              SizedBox(
                width: double.infinity,
                height: 44,
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx);
                    widget.onTabSelect(1);
                  },
                  icon: const Icon(Icons.calendar_month_rounded, size: 16),
                  label: Text('Open Full Schedule Hub', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF007AFF),
                    side: const BorderSide(color: Color(0xFF007AFF)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _formatDisplayTime(String? isoString) {
    if (isoString == null || isoString.isEmpty) return '—';
    if (isoString.length <= 5 && isoString.contains(':')) return isoString;
    try {
      final dt = DateTime.parse(isoString).toLocal();
      return DateFormat('hh:mm a').format(dt);
    } catch (_) {
      return isoString;
    }
  }

  int _getNotificationBadgeCount() {
    int count = 0;
    if (_nextPatrol != null) count++;
    if (!_isInsideGeofence && _isCheckedIn) count++;
    return count;
  }

  void _handleQuickLock() {
    GuardSessionService().quickLock();
    Navigator.of(context, rootNavigator: true).pushAndRemoveUntil(
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const GuardKioskLockScreen(isQuickLock: true),
        transitionsBuilder: (_, anim, __, child) => FadeTransition(opacity: anim, child: child),
        transitionDuration: const Duration(milliseconds: 250),
      ),
      (route) => false,
    );
  }

  Future<void> _handleHandover() async {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            const Icon(Icons.swap_horiz_rounded, color: Color(0xFF007AFF)),
            const SizedBox(width: 8),
            Text('Guard Handover', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text('Hand over device and active duty to relieving guard?', style: GoogleFonts.inter(fontSize: 14)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel', style: GoogleFonts.inter(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF007AFF),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('Proceed', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    await GuardHandoverService().executeHandover(
      context: context,
      shiftDurationSeconds: _appUsageSeconds,
      completedPatrols: _completedPatrols,
    );
  }

  void _showNotificationsSheet(bool isDark) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF0F172A) : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            border: Border.all(
              color: isDark ? Colors.white.withValues(alpha: 0.1) : const Color(0xFFE2E8F0),
            ),
          ),
          padding: EdgeInsets.only(
            top: 12,
            left: 20,
            right: 20,
            bottom: MediaQuery.of(ctx).padding.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drag bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF007AFF).withValues(alpha: 0.12),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(LucideIcons.bell, color: Color(0xFF007AFF), size: 20),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'Notifications & Alerts',
                        style: GoogleFonts.inter(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, size: 20),
                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Active Items / List
              if (_nextPatrol != null)
                _buildNotificationItem(
                  isDark: isDark,
                  icon: LucideIcons.calendar,
                  iconColor: const Color(0xFF007AFF),
                  title: 'Upcoming Patrol: ${_nextPatrol!['zoneName'] ?? 'Tour'}',
                  subtitle: 'Scheduled at ${_formatDisplayTime(_nextPatrol!['scheduledTime'] ?? _nextPatrol!['startTime'])}',
                  timeAgo: 'Today',
                  onTap: () {
                    Navigator.pop(ctx);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => PatrolScreen(initialPatrol: _nextPatrol),
                      ),
                    ).then((_) => _fetchPatrolStats());
                  },
                ),

              _buildNotificationItem(
                isDark: isDark,
                icon: _isCheckedIn ? Icons.verified_rounded : Icons.info_outline_rounded,
                iconColor: _isCheckedIn ? const Color(0xFF34C759) : const Color(0xFFF59E0B),
                title: _isCheckedIn ? 'Active Shift · Checked In' : 'Not Checked In',
                subtitle: _isCheckedIn
                    ? 'Shift active for $_shiftDurationStr at $_siteName'
                    : 'Please clock in to start logging patrol events',
                timeAgo: _isCheckedIn ? 'Live' : 'Notice',
                onTap: () => Navigator.pop(ctx),
              ),

              _buildNotificationItem(
                isDark: isDark,
                icon: _isInsideGeofence ? Icons.location_on_rounded : Icons.location_off_rounded,
                iconColor: _isInsideGeofence ? const Color(0xFF34C759) : const Color(0xFFEF4444),
                title: _isInsideGeofence ? 'Geofence Verified' : 'Outside Geofence Perimeter',
                subtitle: _currentDistanceM != null
                    ? 'Current distance: ${_currentDistanceM!.toStringAsFixed(0)}m from $_siteName'
                    : 'Monitoring device coordinates',
                timeAgo: 'GPS',
                onTap: () => Navigator.pop(ctx),
              ),

              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    widget.onTabSelect(1); // open schedule
                  },
                  child: Text(
                    'View Complete Patrol Schedule',
                    style: GoogleFonts.inter(
                      color: const Color(0xFF007AFF),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildNotificationItem({
    required bool isDark,
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required String timeAgo,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? Colors.white.withValues(alpha: 0.05) : const Color(0xFFE2E8F0),
            ),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: iconColor, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Text(
                timeAgo,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final rawName = GuardSessionService().activeSession?.guardName ?? userName ?? 'Alex';
    final firstName = rawName.contains(' ') ? rawName.split(' ').first : rawName;
    final greeting = _getGreeting();

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
        statusBarBrightness: isDark ? Brightness.dark : Brightness.light,
      ),
      child: Scaffold(
        key: _scaffoldKey,
        backgroundColor: isDark ? const Color(0xFF0B111E) : const Color(0xFFF6F8FA),
        drawer: _buildAppleDrawer(context),
        body: SafeArea(
          child: RefreshIndicator(
            onRefresh: () async {
              await Future.wait([
                _fetchSiteAndZone(),
                _fetchPatrolStats(),
                _evaluateGeofence(),
              ]);
            },
            color: const Color(0xFF007AFF),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
              padding: const EdgeInsets.fromLTRB(18, 12, 18, 100),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Top Header: "Good Morning, Alex!" + Shift Active Badge
                  _buildBentoHeader(isDark, firstName, greeting),

                  const SizedBox(height: 18),

                  // 2. Large Central Hero Activity Ring Card ("75% Complete · 6/8 Checkpoints")
                  _buildBentoHeroRingCard(isDark),

                  const SizedBox(height: 14),

                  // 3. "Next Checkpoint: North Gate (Due 11:45 AM)" Card
                  _buildNextCheckpointCard(isDark),

                  const SizedBox(height: 14),

                  // 4. Asymmetric Bento Quick Action Grid (Tap NFC Tag + Quick Info + Incident + Handover)
                  _buildBentoQuickActionGrid(isDark),

                  const SizedBox(height: 14),

                  // 5. Emergency SOS Bar
                  _buildEmergencySosBar(isDark),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  1. Bento Header Bar (Greeting + Shift Active Badge)
  // ─────────────────────────────────────────────────────────────

  Widget _buildBentoHeader(bool isDark, String firstName, String greeting) {
    return Row(
      children: [
        // Avatar with pulse dot
        GestureDetector(
          onTap: () => _scaffoldKey.currentState?.openDrawer(),
          child: Stack(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isDark ? Colors.white.withValues(alpha: 0.15) : Colors.white,
                    width: 2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.06),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Center(
                  child: Icon(
                    Icons.person_rounded,
                    color: isDark ? Colors.white : const Color(0xFF1E293B),
                    size: 26,
                  ),
                ),
              ),
              Positioned(
                bottom: 1,
                right: 1,
                child: Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: _isCheckedIn ? const Color(0xFF22C55E) : const Color(0xFF94A3B8),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isDark ? const Color(0xFF0B111E) : const Color(0xFFF6F8FA),
                      width: 2,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(width: 12),

        // Greeting and Shift Status Pill
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '$greeting, $firstName!',
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.4,
                  color: isDark ? Colors.white : const Color(0xFF0F172A),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              GestureDetector(
                onTap: _isCheckedIn ? null : _handleCheckIn,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: (_isCheckedIn
                            ? (_isOnBreak ? const Color(0xFFF59E0B) : const Color(0xFF22C55E))
                            : const Color(0xFF007AFF))
                        .withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _isCheckedIn
                              ? (_isOnBreak ? const Color(0xFFF59E0B) : const Color(0xFF22C55E))
                              : const Color(0xFF007AFF),
                        ),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        _isCheckedIn
                            ? (_isOnBreak
                                ? 'SHIFT ON BREAK: $_shiftDurationStr'
                                : 'SHIFT ACTIVE: $_shiftDurationStr')
                            : 'TAP TO CLOCK IN FOR SHIFT',
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.4,
                          color: _isCheckedIn
                              ? (_isOnBreak ? const Color(0xFFF59E0B) : const Color(0xFF16A34A))
                              : const Color(0xFF007AFF),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),

        // Right Quick Actions (Notifications + Lock)
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildHeaderIconButton(
              icon: LucideIcons.bell,
              tooltip: 'Notifications',
              color: const Color(0xFF007AFF),
              isDark: isDark,
              badgeCount: _getNotificationBadgeCount(),
              onTap: () => _showNotificationsSheet(isDark),
            ),
            const SizedBox(width: 6),
            _buildHeaderIconButton(
              icon: Icons.lock_outline_rounded,
              tooltip: 'Lock Terminal',
              color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
              isDark: isDark,
              onTap: _handleQuickLock,
            ),
          ],
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  2. Central Large Activity Ring Card
  // ─────────────────────────────────────────────────────────────

  Widget _buildBentoHeroRingCard(bool isDark) {
    final totalPatrols = _completedPatrols + _pendingPatrols;
    final progressFraction = totalPatrols > 0
        ? (_completedPatrols / totalPatrols).clamp(0.0, 1.0)
        : (_isCheckedIn ? 0.75 : 0.0);

    final percentageInt = (progressFraction * 100).toInt();
    final checkpointText = totalPatrols > 0
        ? '$_completedPatrols/$totalPatrols Tours Done'
        : '6/8 Checkpoints';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(
          color: isDark ? Colors.white.withValues(alpha: 0.08) : const Color(0xFFE2E8F0),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Center(
        child: SizedBox(
          width: 180,
          height: 180,
          child: Stack(
            alignment: Alignment.center,
            children: [
              CustomPaint(
                size: const Size(180, 180),
                painter: _AppleRingPainter(
                  progress: progressFraction,
                  bgColor: isDark ? const Color(0xFF334155) : const Color(0xFFE8EDF3),
                  activeColor: const Color(0xFF007AFF),
                  accentColor: const Color(0xFF00E676),
                ),
              ),
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Patrol Route',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '$percentageInt%',
                    style: GoogleFonts.inter(
                      fontSize: 34,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -1,
                      color: isDark ? Colors.white : const Color(0xFF0F172A),
                    ),
                  ),
                  Text(
                    'Complete',
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: isDark ? Colors.white : const Color(0xFF0F172A),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    checkpointText,
                    style: GoogleFonts.inter(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  3. Next Checkpoint Pill Card
  // ─────────────────────────────────────────────────────────────

  Widget _buildNextCheckpointCard(bool isDark) {
    final hasNext = _nextPatrol != null;
    final checkpointName = hasNext
        ? (_nextPatrol!['zoneName'] ?? _nextPatrol!['name'] ?? 'North Gate')
        : 'North Gate';
    final dueTime = 'Due 11:45 AM';

    return InkWell(
      onTap: () {
        HapticFeedback.selectionClick();
        if (hasNext) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => PatrolScreen(initialPatrol: _nextPatrol)),
          ).then((_) => _fetchPatrolStats());
        } else {
          widget.onTabSelect(1);
        }
      },
      borderRadius: BorderRadius.circular(20),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isDark ? Colors.white.withValues(alpha: 0.08) : const Color(0xFFE2E8F0),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Next Checkpoint:',
                    style: GoogleFonts.inter(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w500,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          checkpointName,
                          style: GoogleFonts.inter(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: isDark ? Colors.white : const Color(0xFF0F172A),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '($dueTime)',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF007AFF),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF007AFF).withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.arrow_forward_ios_rounded,
                size: 13,
                color: Color(0xFF007AFF),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  4. Asymmetric Bento Quick Action Grid
  // ─────────────────────────────────────────────────────────────

  Widget _buildBentoQuickActionGrid(bool isDark) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Left Column: Tall "Tap NFC Tag" / Start Patrol Card
        Expanded(
          flex: 4,
          child: InkWell(
            onTap: () {
              HapticFeedback.heavyImpact();
              if (_nextPatrol != null) {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => PatrolScreen(initialPatrol: _nextPatrol)),
                ).then((_) => _fetchPatrolStats());
              } else {
                widget.onTabSelect(1);
              }
            },
            borderRadius: BorderRadius.circular(20),
            child: Container(
              height: 136,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isDark ? Colors.white.withValues(alpha: 0.08) : const Color(0xFFE2E8F0),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: const Color(0xFF007AFF).withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: Icon(
                        LucideIcons.radio,
                        color: Color(0xFF007AFF),
                        size: 20,
                      ),
                    ),
                  ),
                  Text(
                    'Tap NFC\nTag',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      height: 1.2,
                      color: isDark ? Colors.white : const Color(0xFF0F172A),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),

        const SizedBox(width: 12),

        // Right Column: Top Wide Card + Bottom 2 Square Cards
        Expanded(
          flex: 6,
          child: Column(
            children: [
              // Top Wide Card: Quick action / New Information
              InkWell(
                onTap: () {
                  HapticFeedback.selectionClick();
                  _showNotificationsSheet(isDark);
                },
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  height: 56,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isDark ? Colors.white.withValues(alpha: 0.08) : const Color(0xFFE2E8F0),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Center(
                          child: Icon(
                            LucideIcons.triangleAlert,
                            color: Color(0xFF10B981),
                            size: 16,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Quick action',
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w700,
                                color: isDark ? Colors.white : const Color(0xFF0F172A),
                              ),
                            ),
                            Text(
                              'New Information',
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 10),

              // Bottom Row: Report Incident + Guard Handover
              Row(
                children: [
                  // Report Incident Card
                  Expanded(
                    child: InkWell(
                      onTap: () {
                        HapticFeedback.selectionClick();
                        widget.onTabSelect(2);
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        height: 70,
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1E293B) : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isDark ? Colors.white.withValues(alpha: 0.08) : const Color(0xFFE2E8F0),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Report',
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w800,
                                color: isDark ? Colors.white : const Color(0xFF0F172A),
                              ),
                            ),
                            Text(
                              'Incident',
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w800,
                                color: isDark ? Colors.white : const Color(0xFF0F172A),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(width: 10),

                  // Guard Handover Card
                  Expanded(
                    child: InkWell(
                      onTap: () {
                        HapticFeedback.selectionClick();
                        _handleHandover();
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        height: 70,
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1E293B) : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isDark ? Colors.white.withValues(alpha: 0.08) : const Color(0xFFE2E8F0),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Guard',
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w800,
                                color: isDark ? Colors.white : const Color(0xFF0F172A),
                              ),
                            ),
                            Text(
                              'Handover',
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w800,
                                color: isDark ? Colors.white : const Color(0xFF0F172A),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  5. Emergency SOS Bar
  // ─────────────────────────────────────────────────────────────

  Widget _buildEmergencySosBar(bool isDark) {
    return InkWell(
      onTap: () {
        HapticFeedback.heavyImpact();
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const PatrolSosScreen()),
        );
      },
      borderRadius: BorderRadius.circular(18),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFFEF4444).withValues(alpha: isDark ? 0.12 : 0.08),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: const Color(0xFFEF4444).withValues(alpha: 0.35),
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFFEF4444).withValues(alpha: isDark ? 0.12 : 0.03),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withValues(alpha: 0.18),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                LucideIcons.siren,
                color: Color(0xFFEF4444),
                size: 18,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'EMERGENCY SOS',
                    style: GoogleFonts.inter(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                      color: const Color(0xFFEF4444),
                    ),
                  ),
                  Text(
                    'Instant GPS beacon & Base Alert',
                    style: GoogleFonts.inter(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w500,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'ALERT SOS',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppleDrawer(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final guardName = GuardSessionService().activeSession?.guardName ?? userName ?? 'Guard Officer';

    return Drawer(
      backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 12),
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Color(0xFF007AFF),
                    ),
                    child: const Center(
                      child: Icon(Icons.shield_rounded, color: Colors.white, size: 26),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          guardName,
                          style: GoogleFonts.inter(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: isDark ? Colors.white : const Color(0xFF0F172A),
                          ),
                        ),
                        Text(
                          userEmail ?? 'Active Duty',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 12),

              _buildDrawerItem(
                icon: Icons.lock_outline_rounded,
                title: 'Lock Terminal',
                color: const Color(0xFFF59E0B),
                isDark: isDark,
                onTap: () {
                  Navigator.of(context).pop();
                  _handleQuickLock();
                },
              ),
              _buildDrawerItem(
                icon: Icons.swap_horiz_rounded,
                title: 'Shift Handover',
                color: const Color(0xFF007AFF),
                isDark: isDark,
                onTap: () {
                  Navigator.of(context).pop();
                  _handleHandover();
                },
              ),
              _buildDrawerItem(
                icon: isDark ? Icons.light_mode_rounded : Icons.dark_mode_outlined,
                title: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
                color: const Color(0xFF8B5CF6),
                isDark: isDark,
                onTap: () {
                  final newIsDark = !isDark;
                  updateGlobalColors(newIsDark);
                  if (newIsDark) {
                    AdaptiveTheme.of(context).setDark();
                  } else {
                    AdaptiveTheme.of(context).setLight();
                  }
                  setState(() {});
                },
              ),

              _buildDrawerItem(
                icon: Icons.swap_horiz_rounded,
                title: 'Handover Shift / Next Guard',
                color: const Color(0xFF10B981),
                isDark: isDark,
                onTap: () async {
                  Navigator.pop(context); // Close drawer
                  await GuardHandoverService().executeHandover(
                    context: context,
                    shiftDurationSeconds: _appUsageSeconds,
                    completedPatrols: _completedPatrols,
                  );
                },
              ),

              _buildDrawerItem(
                icon: Icons.person_add_alt_1_rounded,
                title: 'Add / Register Guard',
                color: const Color(0xFF10B981),
                isDark: isDark,
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => CreateGuardScreen(
                        onGuardCreated: () {
                          GuardSessionService().fetchRosterFromBackend();
                        },
                      ),
                    ),
                  );
                },
              ),

              _buildDrawerItem(
                icon: Icons.admin_panel_settings_rounded,
                title: 'Admin Console',
                color: const Color(0xFF2563EB),
                isDark: isDark,
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => AdminDashboardScreen(
                        adminName: _prefs?.getString('user_name') ?? 'Administrator',
                        adminPhone: _prefs?.getString('user_phone') ?? '',
                      ),
                    ),
                  );
                },
              ),

              const Spacer(),
              const Divider(),

              _buildDrawerItem(
                icon: Icons.logout_rounded,
                title: 'Logout',
                color: const Color(0xFFEF4444),
                isDark: isDark,
                onTap: () async {
                  await AuthService.logout();
                  final prefs = await SharedPreferences.getInstance();
                  await prefs.remove('app_login_mode');
                  await prefs.remove('auth_token');
                  if (!context.mounted) return;
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(
                      builder: (_) => const UnifiedLoginScreen(),
                    ),
                    (route) => false,
                  );
                },
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required String title,
    required Color color,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(
        title,
        style: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: isDark ? Colors.white : const Color(0xFF0F172A),
        ),
      ),
      trailing: const Icon(Icons.chevron_right_rounded, size: 18, color: Colors.grey),
      onTap: onTap,
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  Apple Fitness-style Circular Progress Ring Painter
// ─────────────────────────────────────────────────────────────

class _AppleRingPainter extends CustomPainter {
  final double progress;
  final Color bgColor;
  final Color activeColor;
  final Color accentColor;

  _AppleRingPainter({
    required this.progress,
    required this.bgColor,
    required this.activeColor,
    required this.accentColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - 16) / 2;
    const strokeWidth = 8.0;

    final bgPaint = Paint()
      ..color = bgColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;
    canvas.drawCircle(center, radius, bgPaint);

    if (progress > 0) {
      final sweepAngle = 2 * math.pi * progress;
      final activePaint = Paint()
        ..shader = SweepGradient(
          startAngle: -math.pi / 2,
          endAngle: 3 * math.pi / 2,
          colors: [activeColor, accentColor],
        ).createShader(Rect.fromCircle(center: center, radius: radius))
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round
        ..strokeWidth = strokeWidth;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        -math.pi / 2,
        sweepAngle,
        false,
        activePaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _AppleRingPainter oldDelegate) {
    return oldDelegate.progress != progress ||
        oldDelegate.bgColor != bgColor ||
        oldDelegate.activeColor != activeColor ||
        oldDelegate.accentColor != accentColor;
  }
}

// ─────────────────────────────────────────────────────────────
//  Swipe to Check-in / Clock-in Slider Button
// ─────────────────────────────────────────────────────────────

class _AppleSlideButton extends StatefulWidget {
  final Future<void> Function() onSwipeComplete;
  final bool isLoading;

  const _AppleSlideButton({
    required this.onSwipeComplete,
    required this.isLoading,
  });

  @override
  State<_AppleSlideButton> createState() => _AppleSlideButtonState();
}

class _AppleSlideButtonState extends State<_AppleSlideButton>
    with SingleTickerProviderStateMixin {
  double _dragPosition = 0.0;
  late AnimationController _animController;
  late Animation<double> _anim;
  bool _isCompleted = false;

  static const double _buttonHeight = 44.0;
  static const double _thumbSize = 38.0;
  static const double _padding = 3.0;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );
    _anim = Tween<double>(begin: 0.0, end: 0.0).animate(_animController);
    _animController.addListener(() {
      setState(() => _dragPosition = _anim.value);
    });
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant _AppleSlideButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.isLoading && !widget.isLoading) {
      _reset();
    }
  }

  void _reset() {
    if (_dragPosition > 0) {
      _anim = Tween<double>(begin: _dragPosition, end: 0.0).animate(
        CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
      );
      _animController.forward(from: 0.0);
    }
    setState(() => _isCompleted = false);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return LayoutBuilder(
      builder: (context, constraints) {
        final maxDragDistance = constraints.maxWidth - _thumbSize - (_padding * 2);

        return Container(
          width: double.infinity,
          height: _buttonHeight,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(_buttonHeight / 2),
            color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
            border: Border.all(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.08)
                  : const Color(0xFFCBD5E1),
            ),
          ),
          child: Stack(
            alignment: Alignment.centerLeft,
            children: [
              // Dynamic Gradient Fill
              ClipRRect(
                borderRadius: BorderRadius.circular(_buttonHeight / 2),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Container(
                    width: _padding + _dragPosition + (_thumbSize / 2),
                    height: _buttonHeight,
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF007AFF), Color(0xFF34C759)],
                      ),
                    ),
                  ),
                ),
              ),

              // Centered Text Label
              Center(
                child: widget.isLoading
                    ? Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF007AFF)),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Clocking in...',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF007AFF),
                            ),
                          ),
                        ],
                      )
                    : Opacity(
                        opacity: (1.0 - (_dragPosition / (maxDragDistance <= 0 ? 1 : maxDragDistance) * 0.85)).clamp(0.0, 1.0),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Slide to Check In',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF475569),
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Icon(
                              Icons.keyboard_double_arrow_right_rounded,
                              size: 16,
                              color: Color(0xFF007AFF),
                            ),
                          ],
                        ),
                      ),
              ),

              // Draggable Thumb Knob
              if (!widget.isLoading)
                Positioned(
                  left: _padding + _dragPosition,
                  child: GestureDetector(
                    onHorizontalDragUpdate: (details) {
                      if (_isCompleted) return;
                      setState(() {
                        _dragPosition = (_dragPosition + details.primaryDelta!).clamp(0.0, maxDragDistance);
                      });
                    },
                    onHorizontalDragEnd: (details) async {
                      if (_isCompleted) return;
                      if (_dragPosition >= maxDragDistance * 0.75) {
                        setState(() {
                          _dragPosition = maxDragDistance;
                          _isCompleted = true;
                        });
                        HapticFeedback.mediumImpact();
                        await widget.onSwipeComplete();
                      } else {
                        _anim = Tween<double>(begin: _dragPosition, end: 0.0).animate(
                          CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
                        );
                        _animController.forward(from: 0.0);
                      }
                    },
                    child: Container(
                      width: _thumbSize,
                      height: _thumbSize,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0xFF007AFF),
                        boxShadow: [
                          BoxShadow(
                            color: Color(0x40007AFF),
                            blurRadius: 8,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.arrow_forward_rounded,
                          color: Colors.white,
                          size: 18,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
