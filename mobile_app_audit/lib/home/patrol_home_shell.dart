import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'package:accesseasy_shared/core/constants.dart';
import 'package:accesseasy_shared/core/theme.dart';

import '../patrol/patrol_screen.dart';
import '../patrol/schedule_hub_screen.dart';
import '../incidents/incident_screen.dart';
import '../logs/logs_screen.dart';
import 'patrol_dashboard_screen.dart';

// ─────────────────────────────────────────────────────────────
//  Guard Patrol — Home Shell (Bottom Nav + Hero Center Scan)
// ─────────────────────────────────────────────────────────────

class PatrolHomeShell extends StatefulWidget {
  final String doorName;
  const PatrolHomeShell({super.key, required this.doorName});

  @override
  State<PatrolHomeShell> createState() => _PatrolHomeShellState();
}

class _PatrolHomeShellState extends State<PatrolHomeShell> {
  int _currentIndex = 0;
  late String _doorName;

  @override
  void initState() {
    super.initState();
    _doorName = widget.doorName;
    _fetchDoorName();
  }

  Future<void> _fetchDoorName() async {
    final prefs = await SharedPreferences.getInstance();
    final cachedDoor = prefs.getString('guard_door_name');

    if (mounted && cachedDoor != null && cachedDoor.isNotEmpty) {
      setState(() => _doorName = cachedDoor);
    }

    if (userid == null) return;
    try {
      final url = Uri.parse(
          '$kBaseUrl/items/personalModule?filter[assignedUser][_eq]=$userid&fields[]=id&fields[]=assigned_door.*');
      final res = await http.get(url, headers: {'Authorization': 'Bearer $token'});
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body)['data'] as List?;
        if (data != null && data.isNotEmpty) {
          final pmId = data[0]['id']?.toString();
          if (pmId != null && pmId.isNotEmpty) {
            guardEmpId = pmId;
            await prefs.setString(kPrefGuardEmpId, pmId);
          }
          final assignedDoor = data[0]['assigned_door'];
          if (assignedDoor != null && assignedDoor is Map) {
            final name = assignedDoor['doorName']?.toString();
            if (name != null && name.isNotEmpty) {
              await prefs.setString('guard_door_name', name);
              if (mounted) setState(() => _doorName = name);
            }
          }
        }
      }
    } catch (e) {
      print('[PatrolHomeShell] _fetchDoorName Error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      PatrolDashboardScreen(
        doorName: _doorName,
        onTabSelect: (actionIndex) {
          setState(() => _currentIndex = actionIndex);
        },
      ),
      const ScheduleHubScreen(),
      const IncidentScreen(),
      const LogsScreen(),
    ];

    final safeIndex = _currentIndex.clamp(0, pages.length - 1);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
        statusBarBrightness: isDark ? Brightness.dark : Brightness.light,
        systemNavigationBarColor: isDark ? kCardDark : kCardLight,
        systemNavigationBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: isDark ? const Color(0xFF0D0D0D) : const Color(0xFFF8FAFC),
        body: IndexedStack(index: safeIndex, children: pages),
        bottomNavigationBar: _PatrolNavBar(
          currentIndex: safeIndex,
          onTap: (i) {
            HapticFeedback.selectionClick();
            setState(() => _currentIndex = i);
          },
          onScanTap: () {
            HapticFeedback.heavyImpact();
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const PatrolScreen()),
            );
          },
        ),
      ),
    );
  }
}

class _PatrolNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final VoidCallback onScanTap;

  const _PatrolNavBar({
    required this.currentIndex,
    required this.onTap,
    required this.onScanTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: 66 + MediaQuery.of(context).padding.bottom,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        border: Border(
          top: BorderSide(
            color: isDark ? Colors.white.withValues(alpha: 0.06) : const Color(0xFFE2E8F0),
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.topCenter,
        children: [
          // Nav buttons row
          Padding(
            padding: EdgeInsets.only(bottom: MediaQuery.of(context).padding.bottom),
            child: Row(
              children: [
                // Left Item 1: Home (index 0)
                Expanded(
                  child: _buildNavButton(
                    index: 0,
                    icon: Icons.grid_view_rounded,
                    label: 'Home',
                    isDark: isDark,
                  ),
                ),
                // Left Item 2: Schedule (index 1)
                Expanded(
                  child: _buildNavButton(
                    index: 1,
                    icon: Icons.calendar_month_rounded,
                    label: 'Schedule',
                    isDark: isDark,
                  ),
                ),

                // Center gap for the center Scan button
                const SizedBox(width: 72),

                // Right Item 1: Report (index 2)
                Expanded(
                  child: _buildNavButton(
                    index: 2,
                    icon: Icons.report_problem_outlined,
                    label: 'Report',
                    isDark: isDark,
                  ),
                ),
                // Right Item 2: Logs (index 3)
                Expanded(
                  child: _buildNavButton(
                    index: 3,
                    icon: Icons.receipt_long_rounded,
                    label: 'Logs',
                    isDark: isDark,
                  ),
                ),
              ],
            ),
          ),

          // Integrated Center Elevated Scan Button
          Positioned(
            top: -18,
            child: GestureDetector(
              onTap: onScanTap,
              behavior: HitTestBehavior.opaque,
              child: Container(
                width: 58,
                height: 58,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF2563EB), Color(0xFF007AFF), Color(0xFF38BDF8)],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF007AFF).withValues(alpha: 0.4),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                  border: Border.all(
                    color: isDark ? const Color(0xFF0F172A) : Colors.white,
                    width: 3.5,
                  ),
                ),
                child: const Center(
                  child: Icon(
                    Icons.qr_code_scanner_rounded,
                    color: Colors.white,
                    size: 26,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavButton({
    required int index,
    required IconData icon,
    required String label,
    required bool isDark,
  }) {
    final active = currentIndex == index;
    return GestureDetector(
      onTap: () => onTap(index),
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: active ? 20 : 0,
            height: 3,
            margin: const EdgeInsets.only(bottom: 5),
            decoration: BoxDecoration(
              color: const Color(0xFF007AFF),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Icon(
            icon,
            size: 22,
            color: active
                ? const Color(0xFF007AFF)
                : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
          ),
          const SizedBox(height: 3),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 10.5,
              fontWeight: active ? FontWeight.w700 : FontWeight.w500,
              color: active
                  ? const Color(0xFF007AFF)
                  : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
            ),
          ),
        ],
      ),
    );
  }
}
