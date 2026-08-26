import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:accesseasy_shared/core/constants.dart';

import '../database/patrol_database.dart';

// ─────────────────────────────────────────────────────────────
//  ConnectivitySyncService
//  Watches network connectivity and automatically drains the
//  SQLite sync_queue when the device comes back online.
//  Retries failed events up to [maxRetries] times.
// ─────────────────────────────────────────────────────────────

class ConnectivitySyncService {
  static final ConnectivitySyncService _instance = ConnectivitySyncService._internal();
  factory ConnectivitySyncService() => _instance;
  ConnectivitySyncService._internal();

  static const int maxRetries = 5;

  StreamSubscription<List<ConnectivityResult>>? _connectivitySub;
  bool _isSyncing = false;
  bool _isStarted = false;

  final PatrolDatabase _db = PatrolDatabase();

  /// Start watching connectivity. Call once from main.dart after login.
  void start() {
    if (_isStarted) return;
    _isStarted = true;

    _connectivitySub = Connectivity().onConnectivityChanged.listen((results) {
      final isOnline = results.any((r) => r != ConnectivityResult.none);
      if (isOnline) {
        debugPrint('ConnectivitySyncService: online — draining sync_queue');
        _drainQueue();
      }
    });

    // Also attempt an immediate drain in case we are already online
    Connectivity().checkConnectivity().then((results) {
      final isOnline = results.any((r) => r != ConnectivityResult.none);
      if (isOnline) _drainQueue();
    });

    debugPrint('ConnectivitySyncService: started');
  }

  void stop() {
    _connectivitySub?.cancel();
    _connectivitySub = null;
    _isStarted = false;
    debugPrint('ConnectivitySyncService: stopped');
  }

  Future<void> _drainQueue() async {
    if (_isSyncing) return;
    _isSyncing = true;

    try {
      final prefs = await SharedPreferences.getInstance();
      final authToken = token ?? prefs.getString('auth_token') ?? prefs.getString('token');
      if (authToken == null || authToken.isEmpty) {
        debugPrint('ConnectivitySyncService: no auth token — skipping sync');
        return;
      }

      final pending = await _db.getPendingEvents();
      if (pending.isEmpty) {
        debugPrint('ConnectivitySyncService: queue is empty');
        return;
      }

      debugPrint('ConnectivitySyncService: syncing ${pending.length} pending events');
      final synced = <String>[];

      for (final row in pending) {
        final id = row['id'] as String;
        final retryCount = (row['retry_count'] as int?) ?? 0;

        if (retryCount >= maxRetries) {
          debugPrint('ConnectivitySyncService: dropping event $id after $retryCount retries');
          await _db.markEventsSynced([id]); // mark done to prevent infinite loop
          continue;
        }

        // Small delay between requests to avoid flooding
        // Progressive backoff delay to avoid battery drain on weak cellular signal
        final backoffMs = (500 * (1 << (retryCount > 5 ? 5 : retryCount))).clamp(300, 15000);
        if (synced.isNotEmpty) {
          await Future.delayed(Duration(milliseconds: backoffMs));
        }

        final success = await _postEvent(row, authToken);
        if (success) {
          synced.add(id);
        } else {
          await _db.incrementRetryCount(id);
        }
      }

      if (synced.isNotEmpty) {
        await _db.markEventsSynced(synced);
        debugPrint('ConnectivitySyncService: synced ${synced.length}/${pending.length} events');
        try {
          final db = await _db.db;
          await db.rawDelete('DELETE FROM sync_queue WHERE is_synced = 1 AND timestamp_device < datetime("now", "-2 days")');
        } catch (_) {}
      }
    } catch (e) {
      debugPrint('ConnectivitySyncService: drain error — $e');
    } finally {
      _isSyncing = false;
    }
  }

  /// Posts a single sync_queue row to the appropriate Directus endpoint.
  Future<bool> _postEvent(Map<String, dynamic> row, String authToken) async {
    try {
      final eventType = row['event_type'] as String? ?? '';
      final payloadRaw = row['payload'];
      Map<String, dynamic> payload = {};
      if (payloadRaw is Map) {
        payload = Map<String, dynamic>.from(payloadRaw);
      } else if (payloadRaw is String && payloadRaw.isNotEmpty) {
        try {
          final decoded = jsonDecode(payloadRaw);
          if (decoded is Map) {
            payload = Map<String, dynamic>.from(decoded);
          }
        } catch (_) {}
      }

      final String endpoint;
      final Map<String, dynamic> body;

      switch (eventType) {
        case 'attendance_checkin':
          endpoint = '$kBaseUrl/items/guard_attendance';
          final checkinBody = {
            'guard': row['guard_id'],
            'site': row['site_id'],
            'zone': row['zone_id'],
            'check_in_time': row['timestamp_device'],
            'status': 'present',
            'check_in_lat': row['gps_lat'],
            'check_in_lng': row['gps_lng'],
            'tenant': row['tenant'] ?? payload['tenant'],
            ...payload,
          };
          final clientTempId = checkinBody.remove('client_temp_id');
          final postRes = await http.post(
            Uri.parse(endpoint),
            headers: {
              'Authorization': 'Bearer $authToken',
              'Content-Type': 'application/json',
            },
            body: jsonEncode(checkinBody),
          ).timeout(const Duration(seconds: 15));

          if (postRes.statusCode == 200 || postRes.statusCode == 201) {
            if (clientTempId != null) {
              try {
                final resData = jsonDecode(postRes.body);
                final serverId = resData['data']?['id']?.toString();
                if (serverId != null) {
                  await _db.updateAttendanceIdInQueue(clientTempId.toString(), serverId);
                }
              } catch (_) {}
            }
            return true;
          }
          return false;

        case 'attendance_checkout':
          var attendanceId = payload['attendance_id'];
          // If attendanceId is still temporary, query the latest active attendance for this guard
          if (attendanceId != null && attendanceId.toString().startsWith('att-')) {
            try {
              final findRes = await http.get(
                Uri.parse('$kBaseUrl/items/guard_attendance?filter[guard][_eq]=${row['guard_id']}&filter[status][_in]=present,on_break&sort=-check_in_time&limit=1'),
                headers: {'Authorization': 'Bearer $authToken'},
              ).timeout(const Duration(seconds: 8));
              if (findRes.statusCode == 200) {
                final findData = jsonDecode(findRes.body);
                final activeRec = (findData['data'] as List?)?.firstOrNull;
                if (activeRec != null && activeRec['id'] != null) {
                  attendanceId = activeRec['id'].toString();
                }
              }
            } catch (_) {}
          }

          if (attendanceId != null && !attendanceId.toString().startsWith('att-')) {
            final patchRes = await http.patch(
              Uri.parse('$kBaseUrl/items/guard_attendance/$attendanceId'),
              headers: {
                'Authorization': 'Bearer $authToken',
                'Content-Type': 'application/json',
              },
              body: jsonEncode({
                'check_out_time': row['timestamp_device'],
                'status': 'off_duty',
                'check_out_lat': row['gps_lat'],
                'check_out_lng': row['gps_lng'],
              }),
            ).timeout(const Duration(seconds: 15));
            return patchRes.statusCode == 200 || patchRes.statusCode == 204;
          } else {
            // Create complete check-out record if no matching check-in found
            final createRes = await http.post(
              Uri.parse('$kBaseUrl/items/guard_attendance'),
              headers: {
                'Authorization': 'Bearer $authToken',
                'Content-Type': 'application/json',
              },
              body: jsonEncode({
                'guard': row['guard_id'],
                'site': row['site_id'],
                'zone': row['zone_id'],
                'check_out_time': row['timestamp_device'],
                'status': 'off_duty',
                'check_out_lat': row['gps_lat'],
                'check_out_lng': row['gps_lng'],
                'tenant': row['tenant'] ?? payload['tenant'],
              }),
            ).timeout(const Duration(seconds: 15));
            return createRes.statusCode == 200 || createRes.statusCode == 201;
          }

        case 'attendance_break':
          var attId = payload['attendance_id'];
          if (attId != null && attId.toString().startsWith('att-')) {
            try {
              final findRes = await http.get(
                Uri.parse('$kBaseUrl/items/guard_attendance?filter[guard][_eq]=${row['guard_id']}&filter[status][_in]=present,on_break&sort=-check_in_time&limit=1'),
                headers: {'Authorization': 'Bearer $authToken'},
              ).timeout(const Duration(seconds: 8));
              if (findRes.statusCode == 200) {
                final findData = jsonDecode(findRes.body);
                final activeRec = (findData['data'] as List?)?.firstOrNull;
                if (activeRec != null && activeRec['id'] != null) {
                  attId = activeRec['id'].toString();
                }
              }
            } catch (_) {}
          }

          if (attId != null && !attId.toString().startsWith('att-')) {
            final patchRes = await http.patch(
              Uri.parse('$kBaseUrl/items/guard_attendance/$attId'),
              headers: {
                'Authorization': 'Bearer $authToken',
                'Content-Type': 'application/json',
              },
              body: jsonEncode({
                'status': payload['status'] ?? 'on_break',
                if (payload['break_started_at'] != null) 'break_started_at': payload['break_started_at'],
                if (payload['break_ended_at'] != null) 'break_ended_at': payload['break_ended_at'],
              }),
            ).timeout(const Duration(seconds: 15));
            return patchRes.statusCode == 200 || patchRes.statusCode == 204;
          }
          return true;

        case 'guard_handover':
          endpoint = '$kBaseUrl/items/guard_handovers';
          body = {
            'tenant': row['tenant'] ?? 'default',
            'from_guard_id': row['guard_id'],
            'from_session_id': row['guard_session_id'],
            'site_id': row['site_id'],
            'timestamp': row['timestamp_device'],
            'latitude': row['gps_lat'],
            'longitude': row['gps_lng'],
            ...payload,
          };
          break;

        case 'checkpoint_scan':
          endpoint = '$kBaseUrl/items/patrol_logs';
          body = {
            'event_type': eventType,
            'guard_id': row['guard_id'],
            'guard_session_id': row['guard_session_id'],
            'patrol_id': row['patrol_id'],
            'checkpoint_id': row['checkpoint_id'],
            'site_id': row['site_id'],
            'zone_id': row['zone_id'],
            'device_id': row['device_id'],
            'timestamp_device': row['timestamp_device'],
            'gps_lat': row['gps_lat'],
            'gps_lng': row['gps_lng'],
            'gps_accuracy': row['gps_accuracy'],
            'sequence_number': row['sequence_number'],
            ...payload,
          };
          break;

        case 'incident_reported':
          endpoint = '$kBaseUrl/items/patrol_alerts';
          String? uploadedImageUrl;
          final localImg = payload['local_image_path'];
          if (localImg != null && localImg.toString().isNotEmpty) {
            try {
              final file = File(localImg.toString());
              if (await file.exists()) {
                final req = http.MultipartRequest('POST', Uri.parse('$kBaseUrl/files'));
                req.headers['Authorization'] = 'Bearer $authToken';
                req.files.add(await http.MultipartFile.fromPath('file', file.path));
                final streamedRes = await req.send().timeout(const Duration(seconds: 30));
                if (streamedRes.statusCode == 200 || streamedRes.statusCode == 201) {
                  final resStr = await streamedRes.stream.bytesToString();
                  final fileData = jsonDecode(resStr);
                  final fileId = fileData['data']?['id'];
                  if (fileId != null) {
                    uploadedImageUrl = '$kBaseUrl/assets/$fileId';
                  }
                }
              }
            } catch (e) {
              debugPrint('Error uploading offline incident photo: $e');
            }
          }

          final cleanPayload = Map<String, dynamic>.from(payload);
          cleanPayload.remove('local_image_path');
          if (uploadedImageUrl != null) {
            cleanPayload['image_url'] = uploadedImageUrl;
          }

          body = {
            'guard_id': row['guard_id'],
            'guard_session_id': row['guard_session_id'],
            'site_id': row['site_id'],
            'date_created': row['timestamp_device'],
            'source': 'mobile_offline',
            ...cleanPayload,
          };
          break;

        case 'sos_triggered':
          endpoint = '$kBaseUrl/items/patrol_alerts';
          String? uploadedAudioUrl;
          final localAudio = payload['audio_path'];
          if (localAudio != null && localAudio.toString().isNotEmpty && payload['is_api_synced'] != true) {
            try {
              final file = File(localAudio.toString());
              if (await file.exists()) {
                final req = http.MultipartRequest('POST', Uri.parse('$kBaseUrl/files'));
                req.headers['Authorization'] = 'Bearer $authToken';
                final fname = 'sos_voice_${DateTime.now().millisecondsSinceEpoch}.m4a';
                req.files.add(await http.MultipartFile.fromPath('file', file.path, filename: fname));
                final streamedRes = await req.send().timeout(const Duration(seconds: 30));
                if (streamedRes.statusCode == 200 || streamedRes.statusCode == 201) {
                  final resStr = await streamedRes.stream.bytesToString();
                  final fileData = jsonDecode(resStr);
                  final fileId = fileData['data']?['id'];
                  if (fileId != null) {
                    uploadedAudioUrl = '$kBaseUrl/assets/$fileId';
                  }
                }
              }
            } catch (e) {
              debugPrint('Error uploading offline SOS audio: $e');
            }
          }

          final cleanSosPayload = Map<String, dynamic>.from(payload);
          cleanSosPayload.remove('audio_path');
          cleanSosPayload.remove('is_api_synced');
          if (uploadedAudioUrl != null) {
            cleanSosPayload['audio_url'] = uploadedAudioUrl;
          }

          body = {
            'type': 'SOS',
            'severity': 'critical',
            'guard_id': row['guard_id'],
            'guard_session_id': row['guard_session_id'],
            'site_id': row['site_id'],
            'date_created': row['timestamp_device'],
            'gps_lat': row['gps_lat'],
            'gps_lng': row['gps_lng'],
            'source': 'mobile_offline',
            ...cleanSosPayload,
          };
          break;

        case 'location_ping':
          endpoint = '$kBaseUrl/items/tracking_points';
          body = {
            'patrol_id': row['patrol_id'] ?? payload['patrol_id'],
            'guard_id': row['guard_id'],
            'guard_session_id': row['guard_session_id'],
            'site_id': row['site_id'],
            'zone_id': row['zone_id'],
            'device_id': row['device_id'],
            'latitude': row['gps_lat'],
            'longitude': row['gps_lng'],
            'gps_accuracy': row['gps_accuracy'],
            'timestamp': row['timestamp_device'],
            ...payload,
          };
          break;

        default:
          endpoint = '$kBaseUrl/items/patrol_logs';
          body = {
            'event_type': eventType,
            'guard_id': row['guard_id'],
            'date_created': row['timestamp_device'],
            ...payload,
          };
      }

      final res = await http.post(
        Uri.parse(endpoint),
        headers: {
          'Authorization': 'Bearer $authToken',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 15));

      if (res.statusCode == 200 || res.statusCode == 201 || res.statusCode == 204) {
        return true;
      } else {
        debugPrint('ConnectivitySyncService: HTTP ${res.statusCode} for event ${row['id']}');
        return false;
      }
    } catch (e) {
      debugPrint('ConnectivitySyncService: post error for event ${row['id']} — $e');
      return false;
    }
  }

  /// Returns count of pending unsynced events.
  Future<int> getPendingCount() => _db.getPendingEventCount();
}
