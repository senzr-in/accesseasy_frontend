# AccessEasy Patrol — Mobile App Implementation Blueprint

This blueprint outlines the implementation for the Flutter Guard App located at `E:\APP\accesseasy_patrol_app`.

---

## 📱 Mobile Architecture Overview

```
lib/
├── models/
│   ├── checkpoint.dart
│   ├── patrol_run.dart
│   ├── patrol_log.dart
│   ├── guard_attendance.dart
│   └── geofence_violation.dart
├── services/
│   ├── api_service.dart
│   ├── offline_database_service.dart   (SQLite / Hive local storage)
│   ├── offline_sync_queue.dart         (FIFO event queue with retry backoff)
│   ├── geofence_service.dart           (4-tier GPS accuracy evaluator)
│   ├── background_sync_service.dart    (Workmanager periodic sync)
│   └── device_telemetry_service.dart   (Battery & heartbeat sender)
├── screens/
│   ├── attendance/
│   │   └── check_in_screen.dart        (Photo + GPS clock-in)
│   ├── patrol/
│   │   ├── patrol_execution_screen.dart(Live route checklist & scan)
│   │   ├── qr_scan_screen.dart         (Mobile scanner with NFC fallback)
│   │   └── evidence_capture_screen.dart(Photo + notes)
│   ├── incidents/
│   │   └── report_incident_screen.dart (Incident logger with audio/photo)
│   └── settings/
│       └── sync_diagnostics_screen.dart
└── widgets/
    ├── sync_status_bar.dart            (Shows green/amber/red sync indicator)
    ├── integrity_score_pill.dart
    └── gps_accuracy_indicator.dart
```

---

## 🔄 1. Offline-First Event Queue (`offline_sync_queue.dart`)

### Critical Directives:
1. **Immutable Device Timestamp**: Never rewrite `created_at_device` upon syncing. The server records `created_at_server` separately.
2. **Local FIFO Queue**: Checkpoint scans and attendance events are committed to SQLite locally first, marked `synced = 0`.
3. **Automatic Drain**: When network connectivity is restored (`connectivity_plus`), the sync worker drains the queue in chronological order.

```dart
class SyncItem {
  final String id;
  final String eventType; // 'CHECKPOINT_SCAN', 'ATTENDANCE_CLOCK_IN', 'INCIDENT_REPORT'
  final Map<String, dynamic> payload;
  final DateTime createdAtDevice;
  bool isSynced;
  int retryCount;

  SyncItem({
    required this.id,
    required this.eventType,
    required this.payload,
    required this.createdAtDevice,
    this.isSynced = false,
    this.retryCount = 0,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'event_type': eventType,
    'payload_json': jsonEncode(payload),
    'created_at_device': createdAtDevice.toIso8601String(),
    'is_synced': isSynced ? 1 : 0,
    'retry_count': retryCount,
  };
}
```

---

## 🎯 2. Mobile 4-Tier GPS Accuracy Evaluator (`geofence_service.dart`)

Matches the exact logic used on the Web frontend and Directus backend:

```dart
enum GeofenceVerdict { VALID, WARNING, UNCERTAIN, VIOLATION }

class GeofenceResult {
  final GeofenceVerdict verdict;
  final double distanceMeters;
  final double accuracyMeters;
  final String message;
  final int confidencePct;

  GeofenceResult({
    required this.verdict,
    required this.distanceMeters,
    required this.accuracyMeters,
    required this.message,
    required this.confidencePct,
  });
}

GeofenceResult evaluateScan({
  required double guardLat,
  required double guardLng,
  required double guardAccuracy,
  required double cpLat,
  required double cpLng,
  double cpRadius = 50.0,
}) {
  final double distanceM = Geolocator.distanceBetween(guardLat, guardLng, cpLat, cpLng);

  // Condition 1: High GPS noise indoors (> 50% radius or > 35m)
  if (guardAccuracy >= cpRadius * 0.5 || guardAccuracy > 35) {
    return GeofenceResult(
      verdict: GeofenceVerdict.UNCERTAIN,
      distanceMeters: distanceM,
      accuracyMeters: guardAccuracy,
      message: "GPS accuracy low (±${guardAccuracy.round()}m). Scan recorded with UNCERTAIN flag.",
      confidencePct: 45,
    );
  }

  // Condition 2: Clear scan inside radius
  if (distanceM <= cpRadius && guardAccuracy <= 15) {
    return GeofenceResult(
      verdict: GeofenceVerdict.VALID,
      distanceMeters: distanceM,
      accuracyMeters: guardAccuracy,
      message: "Verified on-site: ${distanceM.round()}m from checkpoint.",
      confidencePct: 98,
    );
  }

  // Condition 3: Warning margin
  if (distanceM <= cpRadius + (guardAccuracy * 0.6)) {
    return GeofenceResult(
      verdict: GeofenceVerdict.WARNING,
      distanceMeters: distanceM,
      accuracyMeters: guardAccuracy,
      message: "Close to perimeter edge (${distanceM.round()}m).",
      confidencePct: 75,
    );
  }

  // Condition 4: Out of boundary
  return GeofenceResult(
    verdict: GeofenceVerdict.VIOLATION,
    distanceMeters: distanceM,
    accuracyMeters: guardAccuracy,
    message: "Geofence violation: scanned ${distanceM.round()}m away (radius: ${cpRadius.round()}m).",
    confidencePct: 95,
  );
}
```

---

## 📡 3. Device Heartbeat & Telemetry (`device_telemetry_service.dart`)

```dart
class DeviceTelemetryService {
  static Future<void> sendHeartbeat() async {
    final battery = Battery();
    final batteryLevel = await battery.batteryLevel;
    final batteryState = await battery.batteryState;
    final position = await Geolocator.getCurrentPosition();

    final payload = {
      'battery_level': batteryLevel,
      'battery_charging': batteryState == BatteryState.charging,
      'gps_lat': position.latitude,
      'gps_lng': position.longitude,
      'last_heartbeat': DateTime.now().toUtc().toIso8601String(),
    };

    // Send to Directus or push to sync queue if offline
  }
}
```
