import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';

import '../auth/guard_session_service.dart';
import '../database/patrol_database.dart';
import '../device/device_profile_service.dart';

// ─────────────────────────────────────────────────────────────
//  OfflineEventQueue — backed by SQLite sync_queue table
//  Public API is identical to the previous SharedPreferences
//  implementation so all callers (patrol_screen, sos, etc.)
//  continue to work without modification.
// ─────────────────────────────────────────────────────────────

class OfflinePatrolEvent {
  final String localEventId;
  final String deviceId;
  final String siteId;
  final String zoneId;
  final String guardId;
  final String guardSessionId;
  final String? patrolId;
  final String? checkpointId;
  final String eventType; // "checkpoint_scan", "incident_reported", "sos_triggered", "location_ping"
  final DateTime timestampDevice;
  final double? gpsLat;
  final double? gpsLng;
  final double? gpsAccuracy;
  final int sequenceNumber;
  final Map<String, dynamic>? payload;
  bool isSynced;

  OfflinePatrolEvent({
    required this.localEventId,
    required this.deviceId,
    required this.siteId,
    required this.zoneId,
    required this.guardId,
    required this.guardSessionId,
    this.patrolId,
    this.checkpointId,
    required this.eventType,
    required this.timestampDevice,
    this.gpsLat,
    this.gpsLng,
    this.gpsAccuracy,
    required this.sequenceNumber,
    this.payload,
    this.isSynced = false,
  });

  Map<String, dynamic> toJson() => {
        'localEventId': localEventId,
        'deviceId': deviceId,
        'siteId': siteId,
        'zoneId': zoneId,
        'guardId': guardId,
        'guardSessionId': guardSessionId,
        'patrolId': patrolId,
        'checkpointId': checkpointId,
        'eventType': eventType,
        'timestampDevice': timestampDevice.toIso8601String(),
        'gpsLat': gpsLat,
        'gpsLng': gpsLng,
        'gpsAccuracy': gpsAccuracy,
        'sequenceNumber': sequenceNumber,
        'payload': payload,
        'isSynced': isSynced,
      };

  factory OfflinePatrolEvent.fromDbRow(Map<String, dynamic> row) {
    Map<String, dynamic>? payloadMap;
    if (row['payload'] != null) {
      try {
        payloadMap = (row['payload'] as Map<String, dynamic>);
      } catch (_) {}
    }
    return OfflinePatrolEvent(
      localEventId: row['id'] as String? ?? '',
      deviceId: row['device_id'] as String? ?? '',
      siteId: row['site_id'] as String? ?? '',
      zoneId: row['zone_id'] as String? ?? '',
      guardId: row['guard_id'] as String? ?? '',
      guardSessionId: row['guard_session_id'] as String? ?? '',
      patrolId: row['patrol_id'] as String?,
      checkpointId: row['checkpoint_id'] as String?,
      eventType: row['event_type'] as String? ?? 'checkpoint_scan',
      timestampDevice: DateTime.tryParse(row['timestamp_device']?.toString() ?? '') ?? DateTime.now(),
      gpsLat: row['gps_lat'] != null ? (row['gps_lat'] as num).toDouble() : null,
      gpsLng: row['gps_lng'] != null ? (row['gps_lng'] as num).toDouble() : null,
      gpsAccuracy: row['gps_accuracy'] != null ? (row['gps_accuracy'] as num).toDouble() : null,
      sequenceNumber: row['sequence_number'] as int? ?? 0,
      payload: payloadMap,
      isSynced: (row['is_synced'] as int?) == 1,
    );
  }
}

class OfflineEventQueue {
  static final OfflineEventQueue _instance = OfflineEventQueue._internal();
  factory OfflineEventQueue() => _instance;
  OfflineEventQueue._internal();

  static int _globalSeq = 0;

  final PatrolDatabase _db = PatrolDatabase();

  Future<OfflinePatrolEvent> recordEvent({
    required String eventType,
    String? patrolId,
    String? checkpointId,
    double? gpsLat,
    double? gpsLng,
    double? gpsAccuracy,
    Map<String, dynamic>? payload,
  }) async {
    _globalSeq++;
    final session = GuardSessionService().activeSession;
    final dev = DeviceProfileService().currentProfile;
    final prefs = await SharedPreferences.getInstance();

    final effectiveGuardId = session?.guardId ?? prefs.getString('user_id') ?? prefs.getString('guard_emp_id') ?? 'G-OFFLINE';
    final effectiveSiteId = dev?.boundSiteId ?? prefs.getString('guard_site_id') ?? '';
    final effectiveZoneId = dev?.boundZoneId ?? '';

    final event = OfflinePatrolEvent(
      localEventId: 'EVT-${const Uuid().v4()}',
      deviceId: dev?.deviceId ?? prefs.getString('device_id') ?? 'DEV-DEFAULT',
      siteId: effectiveSiteId,
      zoneId: effectiveZoneId,
      guardId: effectiveGuardId,
      guardSessionId: session?.sessionId ?? 'GS-OFFLINE-RESERVE',
      patrolId: patrolId,
      checkpointId: checkpointId,
      eventType: eventType,
      timestampDevice: DateTime.now(),
      gpsLat: gpsLat,
      gpsLng: gpsLng,
      gpsAccuracy: gpsAccuracy,
      sequenceNumber: _globalSeq,
      payload: payload,
    );

    try {
      await _db.insertSyncEvent(event.toJson());
    } catch (e) {
      debugPrint('OfflineEventQueue: failed to persist event to SQLite — $e');
    }

    return event;
  }

  Future<List<OfflinePatrolEvent>> getPendingEvents() async {
    try {
      final rows = await _db.getPendingEvents();
      return rows.map((r) => OfflinePatrolEvent.fromDbRow(r)).toList();
    } catch (e) {
      debugPrint('OfflineEventQueue: getPendingEvents error — $e');
      return [];
    }
  }

  Future<List<OfflinePatrolEvent>> getAllEvents() async {
    try {
      final rows = await _db.getAllSyncEvents();
      return rows.map((r) => OfflinePatrolEvent.fromDbRow(r)).toList();
    } catch (e) {
      debugPrint('OfflineEventQueue: getAllEvents error — $e');
      return [];
    }
  }

  Future<void> markEventsSynced(List<String> eventIds) async {
    try {
      await _db.markEventsSynced(eventIds);
    } catch (e) {
      debugPrint('OfflineEventQueue: markEventsSynced error — $e');
    }
  }

  Future<int> getPendingCount() => _db.getPendingEventCount();

  Future<void> clearSynced() => _db.clearSyncedEvents();
}
