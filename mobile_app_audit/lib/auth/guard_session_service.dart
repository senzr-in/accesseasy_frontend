import 'package:onesignal_flutter/onesignal_flutter.dart';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import 'package:accesseasy_shared/core/constants.dart';

import '../database/patrol_database.dart';
import '../device/device_profile_service.dart';
import '../device/device_security_service.dart';

enum TerminalState {
  unprovisioned,
  deviceReady,
  authenticating,
  authenticated,
  shiftActive,
  guardLocked,
  handoverPending,
  shiftClosed,
}

class GuardRosterMember {
  final String guardId;
  final String name;
  final String badgeNumber;
  final String? nfcCardId;
  final String? qrBadgeCode;
  final String pinHash;
  final String? avatarUrl;
  final String? role;
  final bool isActive;

  const GuardRosterMember({
    required this.guardId,
    required this.name,
    required this.badgeNumber,
    this.nfcCardId,
    this.qrBadgeCode,
    required this.pinHash,
    this.avatarUrl,
    this.role,
    this.isActive = true,
  });

  Map<String, dynamic> toJson() => {
        'guardId': guardId,
        'name': name,
        'badgeNumber': badgeNumber,
        'nfcCardId': nfcCardId,
        'qrBadgeCode': qrBadgeCode,
        'pinHash': pinHash,
        'avatarUrl': avatarUrl,
        'role': role,
        'isActive': isActive,
      };

  factory GuardRosterMember.fromJson(Map<String, dynamic> json) => GuardRosterMember(
        guardId: json['guardId'] ?? '',
        name: json['name'] ?? '',
        badgeNumber: json['badgeNumber'] ?? '',
        nfcCardId: json['nfcCardId'],
        qrBadgeCode: json['qrBadgeCode'],
        pinHash: json['pinHash'] ?? '',
        avatarUrl: json['avatarUrl'],
        role: json['role'] ?? 'Security Officer',
        isActive: json['isActive'] ?? true,
      );
}

class GuardSession {
  final String sessionId;
  final String guardId;
  final String guardName;
  final String guardBadgeNumber;
  final String deviceId;
  final String siteId;
  final String zoneId;
  final DateTime sessionStartedAt;
  DateTime? sessionEndedAt;
  final String authMethod; // "nfc_pin", "roster_pin", "qr_pin", "supervisor"
  final String? attendanceId;

  GuardSession({
    required this.sessionId,
    required this.guardId,
    required this.guardName,
    required this.guardBadgeNumber,
    required this.deviceId,
    required this.siteId,
    required this.zoneId,
    required this.sessionStartedAt,
    this.sessionEndedAt,
    required this.authMethod,
    this.attendanceId,
  });

  Map<String, dynamic> toJson() => {
        'sessionId': sessionId,
        'guardId': guardId,
        'guardName': guardName,
        'guardBadgeNumber': guardBadgeNumber,
        'deviceId': deviceId,
        'siteId': siteId,
        'zoneId': zoneId,
        'sessionStartedAt': sessionStartedAt.toIso8601String(),
        'sessionEndedAt': sessionEndedAt?.toIso8601String(),
        'authMethod': authMethod,
        'attendanceId': attendanceId,
      };

  factory GuardSession.fromJson(Map<String, dynamic> json) => GuardSession(
        sessionId: json['sessionId'] ?? '',
        guardId: json['guardId'] ?? '',
        guardName: json['guardName'] ?? '',
        guardBadgeNumber: json['guardBadgeNumber'] ?? '',
        deviceId: json['deviceId'] ?? '',
        siteId: json['siteId'] ?? '',
        zoneId: json['zoneId'] ?? '',
        sessionStartedAt: DateTime.parse(json['sessionStartedAt']),
        sessionEndedAt: json['sessionEndedAt'] != null ? DateTime.parse(json['sessionEndedAt']) : null,
        authMethod: json['authMethod'] ?? 'roster_pin',
        attendanceId: json['attendanceId'],
      );
}

class GuardSessionService extends ChangeNotifier {
  static final GuardSessionService _instance = GuardSessionService._internal();
  factory GuardSessionService() => _instance;
  GuardSessionService._internal();

  static const String _kActiveSessionKey = 'ae_active_guard_session';
  // Roster is now stored in SQLite guard_roster table (PatrolDatabase)
  // _kRosterCacheKey in SharedPreferences is no longer used.
  final PatrolDatabase _patrolDb = PatrolDatabase();

  TerminalState _state = TerminalState.deviceReady;
  TerminalState get state => _state;

  GuardSession? _activeSession;
  GuardSession? get activeSession => _activeSession;
  bool get hasActiveSession => _activeSession != null;

  List<GuardRosterMember> _roster = [];
  List<GuardRosterMember> get roster => _roster;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();

    // ── One-time migration: old SharedPreferences offline queue → SQLite ──
    await _migrateOldOfflineQueue(prefs);

    // ── Migrate: remove stale SharedPreferences roster cache if it exists ──
    if (prefs.containsKey('ae_guard_roster_cache')) {
      await prefs.remove('ae_guard_roster_cache');
      debugPrint('GuardSessionService: purged legacy SharedPreferences roster cache');
    }

    // ── Load roster from SQLite ──
    try {
      final rows = await _patrolDb.loadRoster();
      _roster = rows.map((e) => GuardRosterMember.fromJson(e)).toList();
      debugPrint('GuardSessionService: loaded ${_roster.length} guards from SQLite');
    } catch (e) {
      debugPrint('GuardSessionService: SQLite roster load error — $e');
    }

    // If roster is still empty, fetch live from backend
    if (_roster.isEmpty) {
      await fetchRosterFromBackend();
    }

    // Load active session if any
    final sessionStr = prefs.getString(_kActiveSessionKey);
    if (sessionStr != null) {
      try {
        _activeSession = GuardSession.fromJson(jsonDecode(sessionStr));
        _state = TerminalState.shiftActive;
      } catch (e) {
        debugPrint('GuardSessionService: Error restoring guard session — $e');
        _state = TerminalState.deviceReady;
      }
    } else {
      _state = TerminalState.deviceReady;
    }
  }

  /// Migrates events from the legacy SharedPreferences queue into SQLite.
  /// Runs once per install, then cleans up the old key.
  Future<void> _migrateOldOfflineQueue(SharedPreferences prefs) async {
    const legacyKey = 'ae_offline_patrol_events_queue';
    if (!prefs.containsKey(legacyKey)) return;
    try {
      final rawList = prefs.getStringList(legacyKey) ?? [];
      int migrated = 0;
      for (final raw in rawList) {
        try {
          final json = jsonDecode(raw) as Map<String, dynamic>;
          final isSynced = json['isSynced'] as bool? ?? false;
          if (!isSynced) {
            await _patrolDb.insertSyncEvent({
              'localEventId': json['localEventId'] ?? 'EVT-MIGRATED-${const Uuid().v4()}',
              'deviceId': json['deviceId'] ?? '',
              'siteId': json['siteId'] ?? '',
              'zoneId': json['zoneId'] ?? '',
              'guardId': json['guardId'] ?? '',
              'guardSessionId': json['guardSessionId'] ?? '',
              'patrolId': json['patrolId'],
              'checkpointId': json['checkpointId'],
              'eventType': json['eventType'] ?? 'checkpoint_scan',
              'timestampDevice': json['timestampDevice'] ?? DateTime.now().toIso8601String(),
              'gpsLat': json['gpsLat'],
              'gpsLng': json['gpsLng'],
              'gpsAccuracy': json['gpsAccuracy'],
              'sequenceNumber': json['sequenceNumber'] ?? 0,
              'payload': json['payload'],
            });
            migrated++;
          }
        } catch (_) {}
      }
      await prefs.remove(legacyKey);
      if (migrated > 0) {
        debugPrint('GuardSessionService: migrated $migrated offline events from SharedPreferences → SQLite');
      }
    } catch (e) {
      debugPrint('GuardSessionService: old queue migration error — $e');
    }
  }

  Future<void> fetchRosterFromBackend() async {
    final prefs = await SharedPreferences.getInstance();
    final currentToken = token ?? prefs.getString('auth_token') ?? prefs.getString('token');
    final currentTenant = tenant ?? prefs.getString('tenant');

    final currentUserId = userid ?? prefs.getString('user_id');
    final currentUserName = userName ?? prefs.getString('user_name') ?? prefs.getString('guard_active_name');
    final currentGuardEmpId = guardEmpId ?? prefs.getString(kPrefGuardEmpId);

    if (currentToken != null && currentToken.isNotEmpty) {
      try {
        final tenantFilter = (currentTenant != null && currentTenant.isNotEmpty) ? 'filter[tenant][_eq]=$currentTenant&' : '';
        final url = Uri.parse('$kBaseUrl/items/personalModule?${tenantFilter}fields=id,employeeId,rfid,pin,role,assignedUser.*&limit=100');
        final res = await http.get(url, headers: {'Authorization': 'Bearer $currentToken'});
        if (res.statusCode == 200) {
          final list = jsonDecode(res.body)['data'] as List?;
          if (list != null && list.isNotEmpty) {
            final List<GuardRosterMember> loaded = [];
            for (var item in list) {
              final assignedUser = item['assignedUser'] is Map ? item['assignedUser'] : null;
              final firstName = assignedUser?['first_name'] ?? item['first_name'] ?? '';
              final lastName = assignedUser?['last_name'] ?? item['last_name'] ?? '';
              final fullName = ('$firstName $lastName').trim();
              final gName = fullName.isNotEmpty ? fullName : (item['employeeId']?.toString() ?? 'Security Guard');
              final pin = item['pin']?.toString() ?? '1234';
              final pinHash = DeviceSecurityService().hashPin(pin);
              final badgeNum = item['employeeId']?.toString() ?? item['id']?.toString() ?? '';
              final rfidVal = item['rfid']?.toString() ?? item['rfid_card']?.toString();
              loaded.add(
                GuardRosterMember(
                  guardId: item['id']?.toString() ?? '',
                  name: gName,
                  badgeNumber: badgeNum,
                  nfcCardId: rfidVal,
                  qrBadgeCode: item['qr_code']?.toString() ?? badgeNum,
                  pinHash: pinHash,
                  role: item['role']?.toString() ?? 'Security Guard',
                ),
              );
            }
            if (loaded.isNotEmpty) {
              await saveRoster(loaded);
              return;
            }
          }
        }
      } catch (e) {
        debugPrint('Error fetching roster from backend: $e');
      }
    }

    // If authenticated user is present, provide direct entry
    if (_roster.isEmpty && currentUserId != null && currentUserName != null && currentUserName.isNotEmpty) {
      _roster = [
        GuardRosterMember(
          guardId: currentGuardEmpId ?? currentUserId,
          name: currentUserName,
          badgeNumber: currentGuardEmpId ?? 'EMP-01',
          pinHash: DeviceSecurityService().hashPin('1234'),
          role: 'Security Officer',
        )
      ];
      await saveRoster(_roster);
    }
  }

  Future<void> saveRoster(List<GuardRosterMember> roster) async {
    _roster = roster;
    // Persist to SQLite guard_roster table
    try {
      await _patrolDb.saveRoster(roster.map((e) => e.toJson()).toList());
    } catch (e) {
      debugPrint('GuardSessionService: SQLite saveRoster error — $e');
    }
    notifyListeners();
  }

  Future<GuardSession?> authenticateWithPin({
    required GuardRosterMember member,
    required String enteredPin,
    String authMethod = 'roster_pin',
  }) async {
    final sec = DeviceSecurityService();
    final status = sec.checkLockout();
    if (status.isLockedOut) {
      return null;
    }

    final isValid = sec.verifyPin(enteredPin, member.pinHash);
    if (!isValid) {
      await sec.recordFailedAttempt();
      return null;
    }

    await sec.recordSuccessfulAuth();
    return await startGuardSession(member: member, authMethod: authMethod);
  }

  Future<GuardSession> startGuardSession({
    required GuardRosterMember member,
    required String authMethod,
  }) async {
    final devProfile = DeviceProfileService().currentProfile;
    final now = DateTime.now();
    final dateStr = "${now.year}${now.month.toString().padLeft(2, '0')}${now.day.toString().padLeft(2, '0')}";
    final sessionId = "GS-$dateStr-${const Uuid().v4().substring(0, 6).toUpperCase()}";

    // Sync global user state for the active guard
    userid = member.guardId;
    userName = member.name;
    guardEmpId = member.badgeNumber;

    _activeSession = GuardSession(
      sessionId: sessionId,
      guardId: member.guardId,
      guardName: member.name,
      guardBadgeNumber: member.badgeNumber,
      deviceId: devProfile?.deviceId ?? 'DEV-TERMINAL',
      siteId: devProfile?.boundSiteId ?? '',
      zoneId: devProfile?.boundZoneId ?? '',
      sessionStartedAt: now,
      authMethod: authMethod,
    );

    _state = TerminalState.authenticated;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kActiveSessionKey, jsonEncode(_activeSession!.toJson()));
    
    // Set guard name and ID in prefs for components
    await prefs.setString('guard_active_name', member.name);
    await prefs.setString('guard_active_id', member.guardId);
    await prefs.setString('guard_active_session_id', sessionId);

    // Sync OneSignal device token to Directus personalModule for Knative notification-service
    syncOneSignalPlayerId(member.guardId).catchError((_) {});

    notifyListeners();
    return _activeSession!;
  }

  void activateShift() {
    _state = TerminalState.shiftActive;
    notifyListeners();
  }

  void quickLock() {
    if (_activeSession != null) {
      _state = TerminalState.guardLocked;
      notifyListeners();
    }
  }

  Future<bool> quickUnlockWithPin(String enteredPin) async {
    if (_activeSession == null) return false;
    final member = _roster.firstWhere(
      (m) => _activeSession != null && m.guardId == _activeSession!.guardId,
      orElse: () => _roster.first,
    );

    final sec = DeviceSecurityService();
    final status = sec.checkLockout();
    if (status.isLockedOut) return false;

    final isValid = sec.verifyPin(enteredPin, member.pinHash);
    if (isValid) {
      await sec.recordSuccessfulAuth();
      _state = TerminalState.shiftActive;
      notifyListeners();
      return true;
    } else {
      await sec.recordFailedAttempt();
      return false;
    }
  }

  Future<void> endGuardSession() async {
    if (_activeSession != null) {
      _activeSession?.sessionEndedAt = DateTime.now();
    }

    _activeSession = null;
    _state = TerminalState.deviceReady;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kActiveSessionKey);
    await prefs.remove('guard_active_name');
    await prefs.remove('guard_active_id');
    await prefs.remove('guard_active_session_id');
    await prefs.remove('guard_is_checked_in');
    await prefs.remove('guard_is_on_break');
    await prefs.remove('guard_attendance_id');
    await prefs.remove('guard_app_usage_seconds');

    // ── Clear per-session SQLite data (cached logs)
    //    sync_queue and guard_roster are preserved so offline events can sync
    //    and subsequent created guards can log in even without internet connection.
    try {
      final db = _patrolDb;
      await db.clearOldLogs(keepDays: 0); // clear all cached logs
    } catch (e) {
      debugPrint('GuardSessionService: SQLite session clear error — $e');
    }

    notifyListeners();
  }

  GuardRosterMember? findMemberByEmpId(String empId) {
    final clean = empId.trim().toLowerCase();
    try {
      return _roster.firstWhere(
        (m) =>
            m.badgeNumber.toLowerCase() == clean ||
            m.guardId.toLowerCase() == clean ||
            m.name.toLowerCase() == clean,
      );
    } catch (_) {
      return null;
    }
  }

  GuardRosterMember? findMemberByNfc(String nfcCardId) {
    try {
      return _roster.firstWhere((m) => m.nfcCardId != null && m.nfcCardId!.toLowerCase() == nfcCardId.toLowerCase());
    } catch (_) {
      return null;
    }
  }

  GuardRosterMember? findMemberByQr(String qrCode) {
    try {
      return _roster.firstWhere((m) => m.qrBadgeCode != null && m.qrBadgeCode!.toLowerCase() == qrCode.toLowerCase());
    } catch (_) {
      return null;
    }
  }

  Future<void> syncOneSignalPlayerId(String guardId) async {
    try {
      final pushId = OneSignal.User.pushSubscription.id;
      if (pushId == null || pushId.isEmpty) return;

      final prefs = await SharedPreferences.getInstance();
      final currentToken = token ?? prefs.getString('auth_token') ?? prefs.getString('token');

      if (currentToken != null && currentToken.isNotEmpty) {
        final url = Uri.parse('$kBaseUrl/items/personalModule/$guardId');
        await http.patch(
          url,
          headers: {
            'Authorization': 'Bearer $currentToken',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({'playerId': pushId}),
        );
        debugPrint('[OneSignal] Registered playerId: $pushId for guard: $guardId');
      }
    } catch (e) {
      debugPrint('[OneSignal] Error registering playerId: $e');
    }
  }

}
