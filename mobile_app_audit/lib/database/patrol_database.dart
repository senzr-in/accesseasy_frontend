import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

// ─────────────────────────────────────────────────────────────
//  PatrolDatabase  — SQLite singleton for all local persistence
//  Tables: sync_queue, guard_roster, patrol_logs,
//          checkpoints, patrols, incidents
// ─────────────────────────────────────────────────────────────

class PatrolDatabase {
  static final PatrolDatabase _instance = PatrolDatabase._internal();
  factory PatrolDatabase() => _instance;
  PatrolDatabase._internal();

  static const String _kDbName = 'patrol_app.db';
  static const int _kDbVersion = 1;

  Database? _db;

  Future<Database> get db async {
    _db ??= await _initDb();
    return _db!;
  }

  Future<Database> _initDb() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, _kDbName);
    return await openDatabase(
      path,
      version: _kDbVersion,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS sync_queue (
        id               TEXT PRIMARY KEY,
        device_id        TEXT NOT NULL DEFAULT '',
        site_id          TEXT NOT NULL DEFAULT '',
        zone_id          TEXT NOT NULL DEFAULT '',
        guard_id         TEXT NOT NULL DEFAULT '',
        guard_session_id TEXT NOT NULL DEFAULT '',
        patrol_id        TEXT,
        checkpoint_id    TEXT,
        event_type       TEXT NOT NULL,
        timestamp_device TEXT NOT NULL,
        gps_lat          REAL,
        gps_lng          REAL,
        gps_accuracy     REAL,
        sequence_number  INTEGER NOT NULL DEFAULT 0,
        payload          TEXT,
        is_synced        INTEGER NOT NULL DEFAULT 0,
        retry_count      INTEGER NOT NULL DEFAULT 0,
        created_at       TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS guard_roster (
        guard_id      TEXT PRIMARY KEY,
        name          TEXT NOT NULL DEFAULT '',
        badge_number  TEXT NOT NULL DEFAULT '',
        nfc_card_id   TEXT,
        qr_badge_code TEXT,
        pin_hash      TEXT NOT NULL DEFAULT '',
        avatar_url    TEXT,
        role          TEXT NOT NULL DEFAULT 'Security Guard',
        is_active     INTEGER NOT NULL DEFAULT 1
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS patrol_logs (
        id          TEXT PRIMARY KEY,
        category    TEXT NOT NULL DEFAULT 'shifts',
        title       TEXT NOT NULL DEFAULT '',
        subtitle    TEXT NOT NULL DEFAULT '',
        guard_name  TEXT NOT NULL DEFAULT '',
        guard_badge TEXT NOT NULL DEFAULT '',
        timestamp   TEXT NOT NULL,
        status      TEXT NOT NULL DEFAULT '',
        location    TEXT,
        tag_type    TEXT,
        is_offline  INTEGER NOT NULL DEFAULT 0
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS checkpoints (
        id              TEXT PRIMARY KEY,
        group_id        TEXT NOT NULL DEFAULT '',
        name            TEXT NOT NULL DEFAULT '',
        qr_code         TEXT,
        nfc_tag         TEXT,
        latitude        REAL,
        longitude       REAL,
        dwell_time      INTEGER NOT NULL DEFAULT 0,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        status          TEXT NOT NULL DEFAULT 'pending',
        last_scanned_at TEXT,
        tenant          TEXT NOT NULL DEFAULT ''
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS patrols (
        id               TEXT PRIMARY KEY,
        group_id         TEXT NOT NULL DEFAULT '',
        zone_name        TEXT NOT NULL DEFAULT '',
        name             TEXT NOT NULL DEFAULT '',
        status           TEXT NOT NULL DEFAULT 'scheduled',
        scheduled_time   TEXT,
        start_time       TEXT,
        end_time         TEXT,
        total_points     INTEGER NOT NULL DEFAULT 0,
        completed_points INTEGER NOT NULL DEFAULT 0,
        guard_id         TEXT NOT NULL DEFAULT '',
        date             TEXT NOT NULL DEFAULT '',
        tenant           TEXT NOT NULL DEFAULT ''
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS incidents (
        id               TEXT PRIMARY KEY,
        title            TEXT NOT NULL DEFAULT '',
        type             TEXT NOT NULL DEFAULT '',
        severity         TEXT NOT NULL DEFAULT 'low',
        description      TEXT NOT NULL DEFAULT '',
        location         TEXT NOT NULL DEFAULT '',
        latitude         REAL,
        longitude        REAL,
        image_path       TEXT,
        audio_path       TEXT,
        reported_by      TEXT NOT NULL DEFAULT '',
        guard_session_id TEXT NOT NULL DEFAULT '',
        status           TEXT NOT NULL DEFAULT 'open',
        date_created     TEXT NOT NULL,
        is_synced        INTEGER NOT NULL DEFAULT 0
      )
    ''');

    await db.execute('CREATE INDEX IF NOT EXISTS idx_sync_is_synced ON sync_queue(is_synced)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_sync_seq ON sync_queue(sequence_number)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_logs_category ON patrol_logs(category)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_logs_ts ON patrol_logs(timestamp)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_cp_group ON checkpoints(group_id)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_patrols_date ON patrols(date)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_incidents_synced ON incidents(is_synced)');

    debugPrint('PatrolDatabase: all tables created at version $version');
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    debugPrint('PatrolDatabase: upgrading from v$oldVersion to v$newVersion');
  }

  // ─────────────────────────────────────────────────────
  //  SYNC QUEUE
  // ─────────────────────────────────────────────────────

  Future<void> insertSyncEvent(Map<String, dynamic> event) async {
    final database = await db;
    await database.insert(
      'sync_queue',
      {
        'id': event['localEventId'],
        'device_id': event['deviceId'] ?? '',
        'site_id': event['siteId'] ?? '',
        'zone_id': event['zoneId'] ?? '',
        'guard_id': event['guardId'] ?? '',
        'guard_session_id': event['guardSessionId'] ?? '',
        'patrol_id': event['patrolId'],
        'checkpoint_id': event['checkpointId'],
        'event_type': event['eventType'] ?? '',
        'timestamp_device': event['timestampDevice'] ?? DateTime.now().toIso8601String(),
        'gps_lat': event['gpsLat'],
        'gps_lng': event['gpsLng'],
        'gps_accuracy': event['gpsAccuracy'],
        'sequence_number': event['sequenceNumber'] ?? 0,
        'payload': event['payload'] != null ? jsonEncode(event['payload']) : null,
        'is_synced': 0,
        'retry_count': 0,
        'created_at': DateTime.now().toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<Map<String, dynamic>>> getPendingEvents() async {
    final database = await db;
    final rows = await database.query(
      'sync_queue',
      where: 'is_synced = 0',
      orderBy: 'sequence_number ASC',
    );
    return rows.map((r) {
      final m = Map<String, dynamic>.from(r);
      if (m['payload'] != null) {
        try { m['payload'] = jsonDecode(m['payload'] as String); } catch (_) {}
      }
      return m;
    }).toList();
  }

  Future<List<Map<String, dynamic>>> getAllSyncEvents() async {
    final database = await db;
    final rows = await database.query('sync_queue', orderBy: 'sequence_number ASC');
    return rows.map((r) {
      final m = Map<String, dynamic>.from(r);
      if (m['payload'] != null) {
        try { m['payload'] = jsonDecode(m['payload'] as String); } catch (_) {}
      }
      return m;
    }).toList();
  }

  Future<void> markEventsSynced(List<String> ids) async {
    if (ids.isEmpty) return;
    final database = await db;
    final ph = List.filled(ids.length, '?').join(',');
    await database.rawUpdate('UPDATE sync_queue SET is_synced = 1 WHERE id IN ($ph)', ids);
  }

  Future<void> incrementRetryCount(String id) async {
    final database = await db;
    await database.rawUpdate(
      'UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?', [id]);
  }

  Future<int> getPendingEventCount() async {
    final database = await db;
    final r = await database.rawQuery('SELECT COUNT(*) as cnt FROM sync_queue WHERE is_synced = 0');
    return Sqflite.firstIntValue(r) ?? 0;
  }

  Future<void> updateAttendanceIdInQueue(String oldId, String newId) async {
    final database = await db;
    final pending = await database.query(
      'sync_queue',
      where: 'is_synced = 0 AND (event_type = ? OR event_type = ?)',
      whereArgs: ['attendance_checkout', 'attendance_break'],
    );
    for (final row in pending) {
      final payloadRaw = row['payload'];
      if (payloadRaw is String && payloadRaw.contains(oldId)) {
        final updatedPayload = payloadRaw.replaceAll(oldId, newId);
        await database.update(
          'sync_queue',
          {'payload': updatedPayload},
          where: 'id = ?',
          whereArgs: [row['id']],
        );
      }
    }
  }

  Future<void> clearSyncedEvents() async {
    final database = await db;
    await database.delete('sync_queue', where: 'is_synced = 1');
  }

  // ─────────────────────────────────────────────────────
  //  GUARD ROSTER
  // ─────────────────────────────────────────────────────

  Future<void> saveRoster(List<Map<String, dynamic>> guards) async {
    final database = await db;
    final batch = database.batch();
    batch.delete('guard_roster');
    for (final g in guards) {
      batch.insert('guard_roster', {
        'guard_id': g['guardId'] ?? '',
        'name': g['name'] ?? '',
        'badge_number': g['badgeNumber'] ?? '',
        'nfc_card_id': g['nfcCardId'],
        'qr_badge_code': g['qrBadgeCode'],
        'pin_hash': g['pinHash'] ?? '',
        'avatar_url': g['avatarUrl'],
        'role': g['role'] ?? 'Security Guard',
        'is_active': (g['isActive'] ?? true) ? 1 : 0,
      }, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
    debugPrint('PatrolDatabase: saved ${guards.length} roster members');
  }

  Future<List<Map<String, dynamic>>> loadRoster() async {
    final database = await db;
    final rows = await database.query('guard_roster', where: 'is_active = 1');
    return rows.map((r) => {
      'guardId': r['guard_id'],
      'name': r['name'],
      'badgeNumber': r['badge_number'],
      'nfcCardId': r['nfc_card_id'],
      'qrBadgeCode': r['qr_badge_code'],
      'pinHash': r['pin_hash'],
      'avatarUrl': r['avatar_url'],
      'role': r['role'],
      'isActive': (r['is_active'] as int?) == 1,
    }).toList();
  }

  Future<void> clearRoster() async {
    final database = await db;
    await database.delete('guard_roster');
  }

  Future<int> getRosterCount() async {
    final database = await db;
    final r = await database.rawQuery('SELECT COUNT(*) as cnt FROM guard_roster');
    return Sqflite.firstIntValue(r) ?? 0;
  }

  // ─────────────────────────────────────────────────────
  //  PATROL LOGS
  // ─────────────────────────────────────────────────────

  Future<void> insertLog(Map<String, dynamic> log) async {
    final database = await db;
    await database.insert('patrol_logs', {
      'id': log['id'],
      'category': log['category'] ?? 'shifts',
      'title': log['title'] ?? '',
      'subtitle': log['subtitle'] ?? '',
      'guard_name': log['guardName'] ?? '',
      'guard_badge': log['guardBadge'] ?? '',
      'timestamp': log['timestamp'] ?? DateTime.now().toIso8601String(),
      'status': log['status'] ?? '',
      'location': log['location'],
      'tag_type': log['tagType'],
      'is_offline': (log['isOffline'] ?? false) ? 1 : 0,
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> bulkInsertLogs(List<Map<String, dynamic>> logs) async {
    if (logs.isEmpty) return;
    final database = await db;
    final batch = database.batch();
    for (final log in logs) {
      batch.insert('patrol_logs', {
        'id': log['id'],
        'category': log['category'] ?? 'shifts',
        'title': log['title'] ?? '',
        'subtitle': log['subtitle'] ?? '',
        'guard_name': log['guardName'] ?? '',
        'guard_badge': log['guardBadge'] ?? '',
        'timestamp': log['timestamp'] ?? DateTime.now().toIso8601String(),
        'status': log['status'] ?? '',
        'location': log['location'],
        'tag_type': log['tagType'],
        'is_offline': (log['isOffline'] ?? false) ? 1 : 0,
      }, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> getLogs({String? category, String? date}) async {
    final database = await db;
    String? where;
    final List<dynamic> args = [];
    if (category != null && category != 'all') {
      where = 'category = ?';
      args.add(category);
    }
    if (date != null) {
      where = (where != null) ? '$where AND timestamp LIKE ?' : 'timestamp LIKE ?';
      args.add('$date%');
    }
    final rows = await database.query(
      'patrol_logs',
      where: where,
      whereArgs: args.isNotEmpty ? args : null,
      orderBy: 'timestamp DESC',
      limit: 200,
    );
    return rows.map((r) => {
      'id': r['id'],
      'category': r['category'],
      'title': r['title'],
      'subtitle': r['subtitle'],
      'guardName': r['guard_name'],
      'guardBadge': r['guard_badge'],
      'timestamp': r['timestamp'],
      'status': r['status'],
      'location': r['location'],
      'tagType': r['tag_type'],
      'isOffline': (r['is_offline'] as int?) == 1,
    }).toList();
  }

  Future<void> clearOldLogs({int keepDays = 30}) async {
    final database = await db;
    final cutoff = DateTime.now().subtract(Duration(days: keepDays)).toIso8601String();
    await database.delete('patrol_logs', where: 'timestamp < ?', whereArgs: [cutoff]);
  }

  // ─────────────────────────────────────────────────────
  //  CHECKPOINTS
  // ─────────────────────────────────────────────────────

  Future<void> cacheCheckpoints(List<Map<String, dynamic>> checkpoints, String groupId) async {
    final database = await db;
    final batch = database.batch();
    batch.delete('checkpoints', where: 'group_id = ?', whereArgs: [groupId]);
    for (final cp in checkpoints) {
      batch.insert('checkpoints', {
        'id': cp['id']?.toString() ?? '',
        'group_id': groupId,
        'name': cp['name'] ?? cp['checkpoint_id'] ?? '',
        'qr_code': cp['qr_code']?.toString() ?? cp['qrCode']?.toString(),
        'nfc_tag': cp['nfc_tag']?.toString() ?? cp['nfcTag']?.toString(),
        'latitude': cp['latitude'] != null ? (cp['latitude'] as num).toDouble() : null,
        'longitude': cp['longitude'] != null ? (cp['longitude'] as num).toDouble() : null,
        'dwell_time': cp['dwell_time'] ?? cp['dwellTime'] ?? 0,
        'sort_order': cp['sort_order'] ?? cp['sortOrder'] ?? 0,
        'status': 'pending',
        'last_scanned_at': null,
        'tenant': cp['tenant']?.toString() ?? '',
      }, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
    debugPrint('PatrolDatabase: cached ${checkpoints.length} checkpoints for group $groupId');
  }

  Future<List<Map<String, dynamic>>> getCheckpoints(String groupId) async {
    final database = await db;
    final rows = await database.query(
      'checkpoints',
      where: 'group_id = ?',
      whereArgs: [groupId],
      orderBy: 'sort_order ASC',
    );
    return rows.map((r) => Map<String, dynamic>.from(r)).toList();
  }

  Future<void> updateCheckpointStatus(String id, String status) async {
    final database = await db;
    await database.update('checkpoints',
      {'status': status, 'last_scanned_at': DateTime.now().toIso8601String()},
      where: 'id = ?', whereArgs: [id]);
  }

  Future<void> resetCheckpoints(String groupId) async {
    final database = await db;
    await database.update('checkpoints',
      {'status': 'pending', 'last_scanned_at': null},
      where: 'group_id = ?', whereArgs: [groupId]);
  }

  // ─────────────────────────────────────────────────────
  //  PATROLS
  // ─────────────────────────────────────────────────────

  Future<void> cachePatrols(List<Map<String, dynamic>> patrols) async {
    if (patrols.isEmpty) return;
    final database = await db;
    final batch = database.batch();
    for (final p in patrols) {
      batch.insert('patrols', {
        'id': p['id']?.toString() ?? '',
        'group_id': p['groupId']?.toString() ?? p['group_id']?.toString() ?? '',
        'zone_name': p['zoneName'] ?? p['zone_name'] ?? '',
        'name': p['name'] ?? '',
        'status': p['status'] ?? 'scheduled',
        'scheduled_time': p['scheduled_time']?.toString() ?? p['scheduledTime']?.toString(),
        'start_time': p['start_time']?.toString() ?? p['startTime']?.toString(),
        'end_time': p['end_time']?.toString() ?? p['endTime']?.toString(),
        'total_points': p['totalPoints'] ?? p['total_points'] ?? 0,
        'completed_points': p['completedPoints'] ?? p['completed_points'] ?? 0,
        'guard_id': p['guardId']?.toString() ?? p['guard_id']?.toString() ?? '',
        'date': p['date']?.toString() ?? '',
        'tenant': p['tenant']?.toString() ?? '',
      }, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> getPatrols({String? date, String? status}) async {
    final database = await db;
    String? where;
    final List<dynamic> args = [];
    if (date != null) { where = 'date = ?'; args.add(date); }
    if (status != null) {
      where = (where != null) ? '$where AND status = ?' : 'status = ?';
      args.add(status);
    }
    final rows = await database.query(
      'patrols',
      where: where,
      whereArgs: args.isNotEmpty ? args : null,
      orderBy: 'scheduled_time ASC',
    );
    return rows.map((r) => Map<String, dynamic>.from(r)).toList();
  }

  Future<void> updatePatrolStatus(String id, String status,
      {String? startTime, String? endTime}) async {
    final database = await db;
    final fields = <String, dynamic>{'status': status};
    if (startTime != null) fields['start_time'] = startTime;
    if (endTime != null) fields['end_time'] = endTime;
    await database.update('patrols', fields, where: 'id = ?', whereArgs: [id]);
  }

  // ─────────────────────────────────────────────────────
  //  INCIDENTS
  // ─────────────────────────────────────────────────────

  Future<void> insertIncident(Map<String, dynamic> incident) async {
    final database = await db;
    await database.insert('incidents', {
      'id': incident['id'],
      'title': incident['title'] ?? '',
      'type': incident['type'] ?? '',
      'severity': incident['severity'] ?? 'low',
      'description': incident['description'] ?? '',
      'location': incident['location'] ?? '',
      'latitude': incident['latitude'],
      'longitude': incident['longitude'],
      'image_path': incident['imagePath'],
      'audio_path': incident['audioPath'],
      'reported_by': incident['reportedBy'] ?? '',
      'guard_session_id': incident['guardSessionId'] ?? '',
      'status': incident['status'] ?? 'open',
      'date_created': incident['dateCreated'] ?? DateTime.now().toIso8601String(),
      'is_synced': 0,
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<List<Map<String, dynamic>>> getPendingIncidents() async {
    final database = await db;
    final rows = await database.query('incidents',
        where: 'is_synced = 0', orderBy: 'date_created ASC');
    return rows.map((r) => Map<String, dynamic>.from(r)).toList();
  }

  Future<void> markIncidentSynced(String id) async {
    final database = await db;
    await database.update('incidents', {'is_synced': 1},
        where: 'id = ?', whereArgs: [id]);
  }

  // ─────────────────────────────────────────────────────
  //  LIFECYCLE
  // ─────────────────────────────────────────────────────

  Future<void> close() async {
    if (_db != null) {
      await _db!.close();
      _db = null;
    }
  }

  /// Wipes all data — call on logout or factory reset
  Future<void> nukeAllData() async {
    final database = await db;
    for (final table in ['sync_queue', 'guard_roster', 'patrol_logs', 'checkpoints', 'patrols', 'incidents']) {
      await database.delete(table);
    }
    debugPrint('PatrolDatabase: all tables cleared');
  }
}
