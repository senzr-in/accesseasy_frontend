import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:intl/intl.dart';

import 'package:accesseasy_shared/core/constants.dart';
import 'package:accesseasy_shared/services/notification_service.dart';
import '../device/device_profile_service.dart';
import 'patrol_screen.dart';

class ScheduleHubScreen extends StatefulWidget {
  const ScheduleHubScreen({super.key});

  @override
  State<ScheduleHubScreen> createState() => _ScheduleHubScreenState();
}

class _ScheduleHubScreenState extends State<ScheduleHubScreen> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _patrols = [];

  @override
  void initState() {
    super.initState();
    _fetchTodaySchedule();
  }

  Future<void> _fetchTodaySchedule() async {
    setState(() => _isLoading = true);
    try {
      final now = DateTime.now();
      final todayString = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';

      print('[Patrol DEBUG] Fetching patrols for tenant: $tenant, date: $todayString');

      final currentT = tenant ?? DeviceProfileService().currentProfile?.tenant;
    final String tenantFilter = (currentT != null && currentT.isNotEmpty) ? '?filter[tenant][_eq]=$currentT' : '';
      final String url = '$kBaseUrl/items/patrols$tenantFilter${tenantFilter.isEmpty ? '?' : '&'}fields=*&sort=scheduledTime&limit=100';

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List allPatrols = data['data'] ?? [];

        final filteredPatrols = allPatrols.where((p) {
          final gid = p['guardId'];
          final actualGuardId = (gid is Map) ? gid['id']?.toString() : gid?.toString();
          
          final isMyPatrol = (actualGuardId == userid) || (actualGuardId == guardEmpId);
          final isUnassignedSlot = (actualGuardId == null || actualGuardId.toString().isEmpty) && p['status'] == 'scheduled';
          
          final isAssignedOrAvailable = isMyPatrol || isUnassignedSlot;
          
          final timeStr = p['scheduledTime']?.toString() ?? p['startTime']?.toString() ?? p['date_created']?.toString() ?? '';
          final isToday = timeStr.startsWith(todayString) || (p['date'] != null && p['date'].toString() == todayString) || timeStr.isEmpty;
          final needsAttention = p['status'] == 'active' || p['status'] == 'delayed' || p['status'] == 'scheduled';

          return isAssignedOrAvailable && (isToday || needsAttention);
        }).cast<Map<String, dynamic>>().toList();

        filteredPatrols.sort((a, b) {
          final tA = a['scheduledTime'] ?? a['startTime'] ?? '';
          final tB = b['scheduledTime'] ?? b['startTime'] ?? '';
          return tA.compareTo(tB);
        });

        setState(() {
          _patrols = filteredPatrols;
          _isLoading = false;
        });

        await NotificationService().cancelAll();
        for (var p in _patrols) {
          if (p['status'] == 'scheduled' && p['scheduledTime'] != null) {
            try {
              final scheduledTime = DateTime.parse(p['scheduledTime']).toLocal();
              if (scheduledTime.isAfter(now)) {
                final notificationId = p['id'].toString().hashCode;
                await NotificationService().schedulePatrolAlert(
                    notificationId, p['zoneName'] ?? 'Patrol', scheduledTime);
              }
            } catch (e) {
              debugPrint('Error scheduling notification: $e');
            }
          }
        }
      } else {
        print('[Patrol DEBUG] API Error: ${response.statusCode} - ${response.body}');
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      print('[Patrol DEBUG] Exception: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _formatDisplayTime(String? isoString) {
    if (isoString == null) return '—';
    if (isoString.length <= 5 && isoString.contains(':')) return isoString;
    try {
      final dt = DateTime.parse(isoString).toLocal();
      return DateFormat('hh:mm a').format(dt);
    } catch (e) {
      return isoString;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'active': return Colors.greenAccent;
      case 'scheduled': return Colors.indigoAccent;
      case 'missed': return Colors.redAccent;
      case 'completed': return Colors.blueGrey;
      case 'delayed': return Colors.orangeAccent;
      default: return Colors.white54;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'active': return LucideIcons.activity;
      case 'scheduled': return LucideIcons.clock;
      case 'missed': return LucideIcons.xCircle;
      case 'completed': return LucideIcons.checkCircle2;
      case 'delayed': return LucideIcons.alertTriangle;
      default: return LucideIcons.helpCircle;
    }
  }

  @override
  Widget build(BuildContext context) {
    final activePatrols = _patrols.where((p) => p['status'] == 'active' || p['status'] == 'delayed').toList();
    final upcomingPatrols = _patrols.where((p) => p['status'] == 'scheduled').toList();
    
    Map<String, dynamic>? heroPatrol;
    if (activePatrols.isNotEmpty) {
      heroPatrol = activePatrols.firstWhere((p) => p['status'] == 'active', orElse: () => activePatrols.first);
    } else if (upcomingPatrols.isNotEmpty) {
      heroPatrol = upcomingPatrols.first;
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0D0D0D),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Schedule',
          style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.bold, color: Colors.white, fontSize: 24),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, color: Colors.white70),
            onPressed: _fetchTodaySchedule,
          )
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: Colors.greenAccent))
        : RefreshIndicator(
            onRefresh: _fetchTodaySchedule,
            color: Colors.greenAccent,
            backgroundColor: const Color(0xFF1C212D),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              children: [
                if (heroPatrol != null) ...[
                  const Text('NEXT PATROL', style: TextStyle(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.5)),
                  const SizedBox(height: 12),
                  _buildHeroActionCard(heroPatrol),
                  const SizedBox(height: 40),
                ],

                const Text('TODAY\'S SCHEDULE', style: TextStyle(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.5)),
                const SizedBox(height: 12),
                
                if (_patrols.isEmpty)
                  const Padding(
                    padding: EdgeInsets.all(20),
                    child: Center(child: Text('No patrols scheduled for today.', style: TextStyle(color: Colors.white38))),
                  )
                else
                  ..._patrols.map((p) {
                    return _buildTimelineItem(p, isHero: p == heroPatrol);
                  }),
              ],
            ),
          ),
    );
  }

  Widget _buildHeroActionCard(Map<String, dynamic> patrol) {
    final status = patrol['status'] ?? 'unknown';
    final isActive = status == 'active';
    final isDelayed = status == 'delayed';
    final isRecurring = patrol['isRecurring'] == true;

    return GestureDetector(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => PatrolScreen(initialPatrol: patrol))).then((_) => _fetchTodaySchedule());
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: isActive
              ? [const Color(0xFF15803D), const Color(0xFF22C55E)]
              : (isDelayed 
                  ? [const Color(0xFFB45309), const Color(0xFFF59E0B)]
                  : [const Color(0xFF4338CA), const Color(0xFF6366F1)]),
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: (isActive ? Colors.greenAccent : (isDelayed ? Colors.orangeAccent : Colors.indigoAccent)).withOpacity(0.3),
              blurRadius: 20,
              offset: const Offset(0, 10),
            )
          ]
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(isActive ? LucideIcons.activity : (isDelayed ? LucideIcons.alertTriangle : LucideIcons.clock), color: Colors.white, size: 14),
                      const SizedBox(width: 6),
                      Text(
                        isActive ? 'IN PROGRESS' : (isDelayed ? 'DELAYED' : 'UPCOMING'),
                        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
                      ),
                    ],
                  ),
                ),
                if (isRecurring) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.25),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.white24),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(LucideIcons.repeat2, color: Colors.white, size: 12),
                        SizedBox(width: 4),
                        Text('Recurring', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1)),
                      ],
                    ),
                  ),
                ],
                const Spacer(),
                if (!isActive)
                  Text(_formatDisplayTime(patrol['scheduledTime'] ?? patrol['startTime']), style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
              ],
            ),
            const SizedBox(height: 20),
            Text(patrol['zoneName'] ?? 'Unknown Route', style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w900, height: 1.1)),
            const SizedBox(height: 8),
            if (!isActive && patrol['scheduledTime'] != null)
              Builder(builder: (context) {
                try {
                  final dt = DateTime.parse(patrol['scheduledTime']).toLocal();
                  final diff = dt.difference(DateTime.now());
                  if (diff.inMinutes > 0 && diff.inHours == 0) {
                    return Text('Starts in ${diff.inMinutes}m', style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 14, fontWeight: FontWeight.bold));
                  } else if (diff.inHours > 0) {
                    return Text('Starts in ${diff.inHours}h ${diff.inMinutes % 60}m', style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 14, fontWeight: FontWeight.bold));
                  } else {
                    return Text('Starting soon', style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 14, fontWeight: FontWeight.bold));
                  }
                } catch (e) {
                  return const SizedBox();
                }
              })
            else
              Text('Tap to resume', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
            const SizedBox(height: 24),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Center(
                child: Text(
                  isActive ? 'Resume Patrol' : 'Start Patrol',
                  style: TextStyle(
                    color: isActive ? const Color(0xFF15803D) : (isDelayed ? const Color(0xFFB45309) : const Color(0xFF4338CA)),
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1,
                  ),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineItem(Map<String, dynamic> patrol, {required bool isHero}) {
    final status = patrol['status'] ?? 'unknown';
    final isMissed = status == 'missed';
    
    return GestureDetector(
      onTap: () {
        if (status == 'active' || status == 'scheduled') {
          Navigator.push(context, MaterialPageRoute(builder: (_) => PatrolScreen(initialPatrol: patrol))).then((_) => _fetchTodaySchedule());
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1C212D),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isHero 
              ? (status == 'active' ? Colors.greenAccent.withOpacity(0.5) : Colors.indigoAccent.withOpacity(0.5)) 
              : (isMissed ? Colors.redAccent.withOpacity(0.3) : Colors.white12)
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _getStatusColor(status).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(_getStatusIcon(status), color: _getStatusColor(status), size: 18),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(patrol['zoneName'] ?? 'Unknown Route', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 4),
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      Text(_formatDisplayTime(patrol['scheduledTime'] ?? patrol['startTime']), style: const TextStyle(color: Colors.white54, fontSize: 13)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: _getStatusColor(status).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          status.toUpperCase(),
                          style: TextStyle(color: _getStatusColor(status), fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                        ),
                      ),
                      if (patrol['isRecurring'] == true) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            '+${patrol['remainingRounds']} more',
                            style: const TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            if (isHero)
               const Icon(LucideIcons.arrowUp, color: Colors.white24, size: 20)
          ],
        ),
      ),
    );
  }
}
