import '../offline/offline_event_queue.dart';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import 'package:accesseasy_shared/core/constants.dart';

import '../auth/guard_kiosk_lock_screen.dart';
import '../auth/guard_session_service.dart';
import '../device/device_profile_service.dart';

class GuardHandoverRecord {
  final String handoverId;
  final String deviceId;
  final String siteId;
  final String zoneId;
  final String fromGuardId;
  final String fromGuardName;
  final String? toGuardId;
  final String? toGuardName;
  final String fromSessionId;
  final String? toSessionId;
  final DateTime handoverTime;
  final double? latitude;
  final double? longitude;
  final int shiftDurationSeconds;
  final int completedPatrols;
  final int pendingSyncCount;
  final String? notes;

  GuardHandoverRecord({
    required this.handoverId,
    required this.deviceId,
    required this.siteId,
    required this.zoneId,
    required this.fromGuardId,
    required this.fromGuardName,
    this.toGuardId,
    this.toGuardName,
    required this.fromSessionId,
    this.toSessionId,
    required this.handoverTime,
    this.latitude,
    this.longitude,
    required this.shiftDurationSeconds,
    required this.completedPatrols,
    this.pendingSyncCount = 0,
    this.notes,
  });

  Map<String, dynamic> toJson() => {
        'handoverId': handoverId,
        'deviceId': deviceId,
        'siteId': siteId,
        'zoneId': zoneId,
        'fromGuardId': fromGuardId,
        'fromGuardName': fromGuardName,
        'toGuardId': toGuardId,
        'toGuardName': toGuardName,
        'fromSessionId': fromSessionId,
        'toSessionId': toSessionId,
        'handoverTime': handoverTime.toIso8601String(),
        'latitude': latitude,
        'longitude': longitude,
        'shiftDurationSeconds': shiftDurationSeconds,
        'completedPatrols': completedPatrols,
        'pendingSyncCount': pendingSyncCount,
        'notes': notes,
      };

  factory GuardHandoverRecord.fromJson(Map<String, dynamic> json) => GuardHandoverRecord(
        handoverId: json['handoverId'] ?? '',
        deviceId: json['deviceId'] ?? '',
        siteId: json['siteId'] ?? '',
        zoneId: json['zoneId'] ?? '',
        fromGuardId: json['fromGuardId'] ?? '',
        fromGuardName: json['fromGuardName'] ?? '',
        toGuardId: json['toGuardId'],
        toGuardName: json['toGuardName'],
        fromSessionId: json['fromSessionId'] ?? '',
        toSessionId: json['toSessionId'],
        handoverTime: DateTime.tryParse(json['handoverTime'] ?? '') ?? DateTime.now(),
        latitude: json['latitude'] != null ? (json['latitude'] as num).toDouble() : null,
        longitude: json['longitude'] != null ? (json['longitude'] as num).toDouble() : null,
        shiftDurationSeconds: json['shiftDurationSeconds'] ?? 0,
        completedPatrols: json['completedPatrols'] ?? 0,
        pendingSyncCount: json['pendingSyncCount'] ?? 0,
        notes: json['notes'],
      );
}

class GuardHandoverService {
  static final GuardHandoverService _instance = GuardHandoverService._internal();
  factory GuardHandoverService() => _instance;
  GuardHandoverService._internal();

  static const String _kHandoverHistoryKey = 'ae_guard_handover_history';

  Future<GuardHandoverRecord> executeHandover({
    required BuildContext context,
    required int shiftDurationSeconds,
    required int completedPatrols,
    String? notes,
  }) async {
    final session = GuardSessionService().activeSession;
    final dev = DeviceProfileService().currentProfile;

    Position? pos;
    try {
      pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.medium),
      );
    } catch (_) {}

    final handover = GuardHandoverRecord(
      handoverId: 'HO-${const Uuid().v4().substring(0, 8).toUpperCase()}',
      deviceId: dev?.deviceId ?? 'DEV-UNKNOWN',
      siteId: dev?.boundSiteId ?? '',
      zoneId: dev?.boundZoneId ?? '',
      fromGuardId: session?.guardId ?? 'G-UNKNOWN',
      fromGuardName: session?.guardName ?? 'Guard',
      fromSessionId: session?.sessionId ?? 'GS-UNKNOWN',
      handoverTime: DateTime.now(),
      latitude: pos?.latitude,
      longitude: pos?.longitude,
      shiftDurationSeconds: shiftDurationSeconds,
      completedPatrols: completedPatrols,
      notes: notes,
    );

    // Save locally
    final prefs = await SharedPreferences.getInstance();
    final historyList = prefs.getStringList(_kHandoverHistoryKey) ?? [];
    historyList.add(jsonEncode(handover.toJson()));
    await prefs.setStringList(_kHandoverHistoryKey, historyList);

    // Attempt Directus sync
    if (token != null) {
      try {
        await http.post(
          Uri.parse('$kBaseUrl/items/guard_handovers'),
          headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
          body: jsonEncode(handover.toJson()),
        );
      } catch (e) {
        debugPrint('Handover record queued for offline sync: $e');
        try {
          await OfflineEventQueue().recordEvent(
            eventType: 'guard_handover',
            gpsLat: pos?.latitude,
            gpsLng: pos?.longitude,
            payload: handover.toJson(),
          );
        } catch (_) {}
      }
    }

    // End active session
    await GuardSessionService().endGuardSession();

    // Navigate to Kiosk Lock Screen
    if (context.mounted) {
      Navigator.of(context, rootNavigator: true).pushAndRemoveUntil(
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => const GuardKioskLockScreen(),
          transitionsBuilder: (_, anim, __, child) => FadeTransition(opacity: anim, child: child),
          transitionDuration: const Duration(milliseconds: 500),
        ),
        (route) => false,
      );
    }

    return handover;
  }

  Future<List<GuardHandoverRecord>> getHandoverHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final historyList = prefs.getStringList(_kHandoverHistoryKey) ?? [];
    return historyList.map<GuardHandoverRecord>((raw) => GuardHandoverRecord.fromJson(jsonDecode(raw))).toList();
  }
}
