import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

import 'package:accesseasy_shared/core/constants.dart';
import 'package:accesseasy_shared/core/theme.dart';
import '../auth/guard_session_service.dart';
import '../database/patrol_database.dart';
import '../handover/guard_handover_service.dart';
import '../offline/offline_event_queue.dart';

// ─────────────────────────────────────────────────────────────
//  Guard Patrol — Activity & Audit Logs Screen
// ─────────────────────────────────────────────────────────────

enum PatrolLogCategory { all, checkpoints, tours, shifts, alerts }

class PatrolLogEntry {
  final String id;
  final PatrolLogCategory category;
  final String title;
  final String subtitle;
  final String guardName;
  final String guardBadge;
  final DateTime timestamp;
  final String status;
  final String? location;
  final String? tagType; // NFC, QR, GPS, MANUAL
  final bool isOffline;

  const PatrolLogEntry({
    required this.id,
    required this.category,
    required this.title,
    required this.subtitle,
    required this.guardName,
    required this.guardBadge,
    required this.timestamp,
    required this.status,
    this.location,
    this.tagType,
    this.isOffline = false,
  });
}

class LogsScreen extends StatefulWidget {
  const LogsScreen({super.key});

  @override
  State<LogsScreen> createState() => _LogsScreenState();
}

class _LogsScreenState extends State<LogsScreen> {
  PatrolLogCategory _selectedCategory = PatrolLogCategory.all;
  List<PatrolLogEntry> _allLogs = [];
  bool _isLoading = true;
  Timer? _refreshTimer;

  bool _isSearching = false;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  DateTime? _selectedDate;

  @override
  void initState() {
    super.initState();
    _loadFromLocalCache();
    _fetchPatrolLogs();
    _refreshTimer = Timer.periodic(const Duration(seconds: 8), (_) => _silentRefresh());
  }

  /// Instantly renders cached logs from SQLite — no spinner, no network wait.
  Future<void> _loadFromLocalCache() async {
    try {
      final db = PatrolDatabase();
      final rows = await db.getLogs();
      if (rows.isEmpty) return;
      final cached = rows.map((r) {
        final catStr = r['category'] as String? ?? 'shifts';
        final cat = PatrolLogCategory.values.firstWhere(
          (c) => c.name == catStr,
          orElse: () => PatrolLogCategory.shifts,
        );
        return PatrolLogEntry(
          id: r['id'] as String? ?? '',
          category: cat,
          title: r['title'] as String? ?? '',
          subtitle: r['subtitle'] as String? ?? '',
          guardName: r['guardName'] as String? ?? '',
          guardBadge: r['guardBadge'] as String? ?? '',
          timestamp: DateTime.tryParse(r['timestamp'] as String? ?? '') ?? DateTime.now(),
          status: r['status'] as String? ?? '',
          location: r['location'] as String?,
          tagType: r['tagType'] as String?,
          isOffline: r['isOffline'] as bool? ?? false,
        );
      }).toList();
      if (!mounted) return;
      setState(() {
        _allLogs = cached;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('LogsScreen: SQLite cache load error — $e');
    }
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _silentRefresh() async {
    if (!mounted || _isSearching || _searchQuery.isNotEmpty || _selectedDate != null) return;
    _fetchPatrolLogs(isSilent: true);
  }

  Future<void> _fetchPatrolLogs({bool isSilent = false}) async {
    if (!isSilent) setState(() => _isLoading = true);

    final List<PatrolLogEntry> entries = [];

    // 1. Fetch Local / Offline Event Queue Scans
    try {
      final offlineEvents = await OfflineEventQueue().getAllEvents();
      for (var ev in offlineEvents) {
        final category = ev.eventType == 'checkpoint_scan'
            ? PatrolLogCategory.checkpoints
            : (ev.eventType.contains('handover') || ev.eventType.contains('attendance')
                ? PatrolLogCategory.shifts
                : PatrolLogCategory.alerts);

        entries.add(PatrolLogEntry(
          id: ev.localEventId,
          category: category,
          title: ev.payload?['checkpoint_name'] ?? ev.payload?['title'] ?? 'Patrol Checkpoint Scan',
          subtitle: 'Site: ${ev.siteId} • Event #${ev.sequenceNumber}',
          guardName: ev.guardId,
          guardBadge: 'ID: ${ev.guardId}',
          timestamp: ev.timestampDevice,
          status: ev.isSynced ? 'Synced' : 'Pending Sync',
          location: ev.zoneId,
          tagType: ev.payload?['scan_method'] ?? 'NFC/QR',
          isOffline: !ev.isSynced,
        ));
      }
    } catch (_) {}

    // 2. Fetch Handover History
    try {
      final handovers = await GuardHandoverService().getHandoverHistory();
      for (var h in handovers) {
        entries.add(PatrolLogEntry(
          id: h.handoverId,
          category: PatrolLogCategory.shifts,
          title: 'Shift Handover: ${h.fromGuardName} ➔ ${h.toGuardName ?? 'Next Shift'}',
          subtitle: 'Duration: ${(h.shiftDurationSeconds / 60).toStringAsFixed(0)} min • Patrols: ${h.completedPatrols}',
          guardName: h.fromGuardName,
          guardBadge: h.fromGuardId,
          timestamp: h.handoverTime,
          status: 'Completed',
          location: h.siteId,
          tagType: 'Handover',
        ));
      }
    } catch (_) {}

    // 3. Fetch Remote Patrol Alerts & Incidents from Directus
    if (token != null) {
      try {
        final alertUrl = Uri.parse('$kBaseUrl/items/patrol_alerts?filter[tenant][_eq]=$tenant&sort=-date_created&limit=30');
        final res = await http.get(alertUrl, headers: {'Authorization': 'Bearer $token'});
        if (res.statusCode == 200) {
          final data = jsonDecode(res.body)['data'] as List?;
          if (data != null) {
            for (var item in data) {
              final dt = DateTime.tryParse(item['date_created'] ?? '') ?? DateTime.now();
              entries.add(PatrolLogEntry(
                id: item['id']?.toString() ?? UniqueKey().toString(),
                category: PatrolLogCategory.alerts,
                title: item['title'] ?? 'Incident Alert',
                subtitle: item['description'] ?? item['type'] ?? 'Reported by Guard',
                guardName: item['reported_by'] ?? 'Security Officer',
                guardBadge: item['severity']?.toString().toUpperCase() ?? 'MEDIUM',
                timestamp: dt,
                status: item['status'] ?? 'Open',
                location: item['location'] ?? item['location_remark'],
                tagType: 'Alert',
              ));
            }
          }
        }
      } catch (_) {}

      // 4. Fetch Patrol Tours & Checkpoint Records from Directus
      try {
        final patrolUrl = Uri.parse('$kBaseUrl/items/patrols?filter[tenant][_eq]=$tenant&sort=-date_created&limit=25');
        final res = await http.get(patrolUrl, headers: {'Authorization': 'Bearer $token'});
        if (res.statusCode == 200) {
          final data = jsonDecode(res.body)['data'] as List?;
          if (data != null) {
            for (var p in data) {
              final dt = DateTime.tryParse(p['date_created'] ?? '') ?? DateTime.now();
              final status = p['status'] ?? 'pending';
              entries.add(PatrolLogEntry(
                id: p['id']?.toString() ?? UniqueKey().toString(),
                category: PatrolLogCategory.tours,
                title: p['name'] ?? 'Patrol Route Tour',
                subtitle: 'Checkpoints: ${p['completed_points'] ?? 0}/${p['total_points'] ?? 0}',
                guardName: p['assigned_guard_name'] ?? GuardSessionService().activeSession?.guardName ?? 'Patrol Guard',
                guardBadge: 'SEC-TOUR',
                timestamp: dt,
                status: status == 'completed' ? 'Completed' : (status == 'in_progress' ? 'In Progress' : 'Pending'),
                location: p['zone_name'] ?? 'Perimeter',
                tagType: 'Tour',
              ));
            }
          }
        }
      } catch (_) {}
    }

    // Sort descending by timestamp
    entries.sort((a, b) => b.timestamp.compareTo(a.timestamp));

    // ── Persist fresh logs to SQLite for offline / instant-load next session ──
    try {
      final db = PatrolDatabase();
      await db.bulkInsertLogs(entries.map((e) => {
        'id': e.id,
        'category': e.category.name,
        'title': e.title,
        'subtitle': e.subtitle,
        'guardName': e.guardName,
        'guardBadge': e.guardBadge,
        'timestamp': e.timestamp.toIso8601String(),
        'status': e.status,
        'location': e.location,
        'tagType': e.tagType,
        'isOffline': e.isOffline,
      }).toList());
    } catch (e) {
      debugPrint('LogsScreen: SQLite bulk-insert error — $e');
    }

    if (mounted) {
      setState(() {
        _allLogs = entries;
        _isLoading = false;
      });
    }
  }

  List<PatrolLogEntry> get _filteredLogs {
    return _allLogs.where((log) {
      // Category Filter
      if (_selectedCategory == PatrolLogCategory.checkpoints && log.category != PatrolLogCategory.checkpoints) return false;
      if (_selectedCategory == PatrolLogCategory.tours && log.category != PatrolLogCategory.tours) return false;
      if (_selectedCategory == PatrolLogCategory.shifts && log.category != PatrolLogCategory.shifts) return false;
      if (_selectedCategory == PatrolLogCategory.alerts && log.category != PatrolLogCategory.alerts) return false;

      // Date Filter
      if (_selectedDate != null) {
        if (log.timestamp.year != _selectedDate!.year ||
            log.timestamp.month != _selectedDate!.month ||
            log.timestamp.day != _selectedDate!.day) {
          return false;
        }
      }

      // Search Query
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        final matchTitle = log.title.toLowerCase().contains(query);
        final matchSub = log.subtitle.toLowerCase().contains(query);
        final matchGuard = log.guardName.toLowerCase().contains(query);
        final matchLoc = (log.location ?? '').toLowerCase().contains(query);
        if (!matchTitle && !matchSub && !matchGuard && !matchLoc) return false;
      }

      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final logs = _filteredLogs;

    return Scaffold(
      backgroundColor: isDark ? kBgDark : kBgLight,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header Bar ──────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (_isSearching)
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        autofocus: true,
                        style: GoogleFonts.inter(
                          color: isDark ? Colors.white : kTextPrimaryLight,
                          fontSize: 15,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Search checkpoints, guards, alerts...',
                          hintStyle: GoogleFonts.inter(
                            color: isDark ? const Color(0xFF64748B) : kTextSecondaryLight,
                            fontSize: 14,
                          ),
                          border: InputBorder.none,
                          prefixIcon: const Icon(Icons.search, size: 20, color: Color(0xFF22C55E)),
                          suffixIcon: IconButton(
                            icon: const Icon(Icons.close, size: 18),
                            onPressed: () {
                              setState(() {
                                _isSearching = false;
                                _searchQuery = '';
                                _searchController.clear();
                              });
                            },
                          ),
                        ),
                        onChanged: (val) => setState(() => _searchQuery = val),
                      ),
                    )
                  else ...[
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Activity Logs',
                          style: GoogleFonts.inter(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.5,
                            color: isDark ? Colors.white : kTextPrimaryLight,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Patrol scans and shift records',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: isDark ? const Color(0xFF94A3B8) : kTextSecondaryLight,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.search_rounded),
                          tooltip: 'Search logs',
                          onPressed: () => setState(() => _isSearching = true),
                        ),
                        IconButton(
                          icon: Icon(
                            _selectedDate != null ? Icons.calendar_month_rounded : Icons.calendar_today_outlined,
                            color: _selectedDate != null ? const Color(0xFF22C55E) : null,
                          ),
                          tooltip: 'Filter by date',
                          onPressed: () async {
                            final picked = await showDatePicker(
                              context: context,
                              initialDate: _selectedDate ?? DateTime.now(),
                              firstDate: DateTime.now().subtract(const Duration(days: 90)),
                              lastDate: DateTime.now().add(const Duration(days: 1)),
                            );
                            if (picked != null) {
                              setState(() => _selectedDate = picked);
                            } else if (_selectedDate != null) {
                              setState(() => _selectedDate = null);
                            }
                          },
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            // Category Filter Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
              child: Row(
                children: [
                  _buildFilterChip('All', PatrolLogCategory.all, isDark),
                  const SizedBox(width: 8),
                  _buildFilterChip('Checkpoints', PatrolLogCategory.checkpoints, isDark),
                  const SizedBox(width: 8),
                  _buildFilterChip('Tours', PatrolLogCategory.tours, isDark),
                  const SizedBox(width: 8),
                  _buildFilterChip('Shifts', PatrolLogCategory.shifts, isDark),
                  const SizedBox(width: 8),
                  _buildFilterChip('Alerts', PatrolLogCategory.alerts, isDark),
                ],
              ),
            ),

            if (_selectedDate != null) ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF22C55E).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF22C55E).withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Date: ${DateFormat('dd MMM yyyy').format(_selectedDate!)}',
                            style: const TextStyle(color: Color(0xFF22C55E), fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(width: 6),
                          GestureDetector(
                            onTap: () => setState(() => _selectedDate = null),
                            child: const Icon(Icons.cancel_rounded, size: 14, color: Color(0xFF22C55E)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 8),

            // ── Activity Log List ──────────────────────────────────────
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: Color(0xFF22C55E)))
                  : logs.isEmpty
                      ? _buildEmptyState(isDark)
                      : RefreshIndicator(
                          onRefresh: () => _fetchPatrolLogs(),
                          color: const Color(0xFF22C55E),
                          child: ListView.separated(
                            padding: const EdgeInsets.fromLTRB(20, 8, 20, 80),
                            itemCount: logs.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 10),
                            itemBuilder: (context, index) {
                              final log = logs[index];
                              return _buildLogCard(log, isDark);
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, PatrolLogCategory category, bool isDark) {
    final isSelected = _selectedCategory == category;
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        setState(() => _selectedCategory = category);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF15803D)
              : (isDark ? kCardDark : kCardLight),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF22C55E)
                : (isDark ? Colors.white.withValues(alpha: 0.08) : kDividerLight),
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12.5,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected
                ? Colors.white
                : (isDark ? const Color(0xFFCBD5E1) : kTextPrimaryLight),
          ),
        ),
      ),
    );
  }

  Widget _buildLogCard(PatrolLogEntry log, bool isDark) {
    final Color categoryColor;
    final IconData categoryIcon;

    switch (log.category) {
      case PatrolLogCategory.checkpoints:
        categoryColor = const Color(0xFF22C55E);
        categoryIcon = Icons.qr_code_scanner_rounded;
        break;
      case PatrolLogCategory.tours:
        categoryColor = const Color(0xFF3B82F6);
        categoryIcon = Icons.shield_outlined;
        break;
      case PatrolLogCategory.shifts:
        categoryColor = const Color(0xFFF59E0B);
        categoryIcon = Icons.swap_horiz_rounded;
        break;
      case PatrolLogCategory.alerts:
        categoryColor = const Color(0xFFEF4444);
        categoryIcon = Icons.warning_amber_rounded;
        break;
      case PatrolLogCategory.all:
        categoryColor = const Color(0xFF22C55E);
        categoryIcon = Icons.list_alt_rounded;
        break;
    }

    final timeStr = DateFormat('hh:mm:ss a').format(log.timestamp);
    final dateStr = DateFormat('dd MMM').format(log.timestamp);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? kCardDark : kCardLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: log.category == PatrolLogCategory.alerts
              ? const Color(0xFFEF4444).withValues(alpha: 0.3)
              : (isDark ? Colors.white.withValues(alpha: 0.06) : kDividerLight),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Category Icon Avatar
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: categoryColor.withValues(alpha: isDark ? 0.18 : 0.12),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: categoryColor.withValues(alpha: 0.3)),
            ),
            child: Icon(categoryIcon, size: 20, color: categoryColor),
          ),
          const SizedBox(width: 12),

          // Log Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        log.title,
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : kTextPrimaryLight,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      timeStr,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),

                Text(
                  log.subtitle,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),

                // Footer Metadata Badges
                Row(
                  children: [
                    // Guard Name Pill
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.person_outline_rounded, size: 11, color: Color(0xFF22C55E)),
                          const SizedBox(width: 4),
                          Text(
                            log.guardName,
                            style: GoogleFonts.inter(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w600,
                              color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 6),

                    // Status Pill
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                      decoration: BoxDecoration(
                        color: (log.isOffline ? Colors.orange : categoryColor).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        log.status,
                        style: GoogleFonts.inter(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w700,
                          color: log.isOffline ? Colors.orange : categoryColor,
                        ),
                      ),
                    ),

                    const Spacer(),

                    Text(
                      dateStr,
                      style: GoogleFonts.inter(
                        fontSize: 10.5,
                        color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.assignment_outlined,
            size: 56,
            color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
          ),
          const SizedBox(height: 14),
          Text(
            'No Logs Found',
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: isDark ? Colors.white70 : const Color(0xFF475569),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Activity records will appear here.',
            style: GoogleFonts.inter(
              fontSize: 12,
              color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF15803D),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => _fetchPatrolLogs(),
            icon: const Icon(Icons.refresh_rounded, size: 16),
            label: const Text('Refresh'),
          ),
        ],
      ),
    );
  }
}
