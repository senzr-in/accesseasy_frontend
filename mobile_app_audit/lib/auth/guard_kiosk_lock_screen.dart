import 'dart:async';
import 'dart:convert';
import 'package:battery_plus/battery_plus.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:accesseasy_shared/core/constants.dart';

import '../admin/admin_dashboard_screen.dart';
import '../admin/create_guard_screen.dart';
import '../device/admin_device_dialog.dart';
import '../device/device_profile_service.dart';
import '../handover/guard_handover_service.dart';
import '../home/patrol_home_shell.dart';
import 'guard_session_service.dart';
import 'nfc_auth_service.dart';
import 'pin_auth_dialog.dart';

class GuardKioskLockScreen extends StatefulWidget {
  final bool isQuickLock;
  final String? outgoingGuardName;

  const GuardKioskLockScreen({
    super.key,
    this.isQuickLock = false,
    this.outgoingGuardName,
  });

  @override
  State<GuardKioskLockScreen> createState() => _GuardKioskLockScreenState();
}

class _GuardKioskLockScreenState extends State<GuardKioskLockScreen> {
  final Battery _battery = Battery();
  int _batteryLevel = 100;
  bool _isOnline = true;
  bool _isGpsGood = false;
  Timer? _clockTimer;
  DateTime _currentTime = DateTime.now();

  // Site selection state
  List<Map<String, dynamic>> _availableSites = [];
  bool _isLoadingSites = false;

  // Search filter
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _initTerminalTelemetry();
    _startNfcListener();
    _loadAvailableSites();
    GuardSessionService().fetchRosterFromBackend().then((_) {
      if (mounted) setState(() {});
    });
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _currentTime = DateTime.now());
    });
  }

  @override
  void dispose() {
    _clockTimer?.cancel();
    _searchController.dispose();
    NfcAuthService().stopListening();
    super.dispose();
  }

  Future<void> _initTerminalTelemetry() async {
    try {
      final level = await _battery.batteryLevel;
      if (mounted) setState(() => _batteryLevel = level);
    } catch (_) {}

    try {
      final conn = await Connectivity().checkConnectivity();
      if (mounted) {
        setState(() => _isOnline = !conn.contains(ConnectivityResult.none));
      }
    } catch (_) {}

    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (serviceEnabled) {
        final perm = await Geolocator.checkPermission();
        if (perm == LocationPermission.always || perm == LocationPermission.whileInUse) {
          if (mounted) setState(() => _isGpsGood = true);
        }
      }
    } catch (_) {}
  }

  Future<void> _loadAvailableSites() async {
    setState(() => _isLoadingSites = true);
    try {
      final prefs = await SharedPreferences.getInstance();
      final currentToken = token ?? prefs.getString('auth_token') ?? prefs.getString('token');

      if (currentToken != null && currentToken.isNotEmpty) {
        final url = Uri.parse('$kBaseUrl/items/locationManagement?fields=id,locName,name,locAddress,locmark,geofence_radius,status&limit=50');
        final res = await http.get(url, headers: {'Authorization': 'Bearer $currentToken'});
        if (res.statusCode == 200) {
          final list = jsonDecode(res.body)['data'] as List?;
          if (list != null && list.isNotEmpty) {
            _availableSites = list.map((e) {
              final m = Map<String, dynamic>.from(e);
              final siteName = m['locName']?.toString() ?? m['name']?.toString() ?? 'Site ${m['id']}';
              double? lat = m['latitude'] != null ? (m['latitude'] as num).toDouble() : null;
              double? lng = m['longitude'] != null ? (m['longitude'] as num).toDouble() : null;
              if (m['locmark'] != null && m['locmark'] is Map) {
                lat = (m['locmark']['lat'] as num?)?.toDouble() ?? lat;
                lng = (m['locmark']['lng'] as num?)?.toDouble() ?? lng;
              }
              return {
                'id': m['id']?.toString() ?? '',
                'name': siteName,
                'latitude': lat,
                'longitude': lng,
                'address': m['locAddress']?.toString() ?? m['address']?.toString() ?? '',
              };
            }).toList();
          }
        }
      }
    } catch (_) {}

    if (_availableSites.isEmpty) {
      final currentSite = DeviceProfileService().currentProfile?.boundSiteName;
      final currentSiteId = DeviceProfileService().currentProfile?.boundSiteId;
      if (currentSite != null && currentSiteId != null) {
        _availableSites = [
          {'id': currentSiteId, 'name': currentSite}
        ];
      }
    }

    if (mounted) setState(() => _isLoadingSites = false);
  }

  void _showSiteSelectionSheet() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currentSiteName = DeviceProfileService().currentProfile?.boundSiteName ?? 'Main Security Facility';

    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Icon(Icons.business_rounded, color: Color(0xFF10B981), size: 22),
                const SizedBox(width: 10),
                Text(
                  'Select Facility / Site',
                  style: GoogleFonts.inter(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: isDark ? Colors.white : const Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'Guards and patrol routes will adapt to the selected facility.',
              style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
            ),
            const SizedBox(height: 16),
            Flexible(
              child: ListView.separated(
                shrinkWrap: true,
                itemCount: _availableSites.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, idx) {
                  final site = _availableSites[idx];
                  final isSelected = site['name'] == currentSiteName;

                  return InkWell(
                    borderRadius: BorderRadius.circular(14),
                    onTap: () async {
                      if (mounted) Navigator.pop(ctx);
                      final prefs = await SharedPreferences.getInstance();
                      final siteId = site['id']?.toString() ?? (DeviceProfileService().currentProfile?.boundSiteId ?? '');
                      final siteName = site['name']?.toString() ?? 'Main Facility';

                      await DeviceProfileService().provisionDevice(
                        tenantId: tenant ?? 'default',
                        siteId: siteId,
                        siteName: siteName,
                        zoneId: (DeviceProfileService().currentProfile?.boundZoneId ?? ''),
                        zoneName: 'Perimeter Patrol Zone',
                        postId: '',
                        postName: 'Main Gate Post',
                      );

                      await prefs.setString('guard_site_id', siteId);
                      await prefs.setString('guard_site_name', siteName);

                      // Refetch roster for new site
                      await GuardSessionService().fetchRosterFromBackend();
                      if (mounted) setState(() {});
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? const Color(0xFF10B981).withValues(alpha: 0.15)
                            : (isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9)),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF10B981) : Colors.transparent,
                          width: 1.5,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            isSelected ? Icons.check_circle_rounded : Icons.location_on_outlined,
                            color: isSelected ? const Color(0xFF10B981) : const Color(0xFF64748B),
                            size: 20,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              site['name'] ?? '',
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                                color: isSelected
                                    ? const Color(0xFF10B981)
                                    : (isDark ? Colors.white : const Color(0xFF0F172A)),
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
          ],
        ),
      ),
    );
  }

  void _startNfcListener() {
    NfcAuthService().startListening(
      onCardDetected: (cardId) async {
        HapticFeedback.mediumImpact();
        final member = GuardSessionService().findMemberByNfc(cardId);
        if (member != null && mounted) {
          final success = await PinAuthDialog.show(
            context: context,
            member: member,
            title: 'NFC Smart Badge Detected',
            subtitle: 'Enter PIN for ${member.name}',
          );
          if (success == true && mounted) {
            _onAuthenticationSuccess();
          }
        } else if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, color: Colors.white),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Text('Unassigned Badge: This card is not assigned to any guard in this roster.'),
                  ),
                ],
              ),
              backgroundColor: Colors.redAccent.shade700,
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 4),
            ),
          );
        }
      },
    );
  }

  void _onGuardSelected(GuardRosterMember member) async {
    final success = await PinAuthDialog.show(
      context: context,
      member: member,
    );

    if (success == true && mounted) {
      _onAuthenticationSuccess();
    }
  }

  void _showEmployeeIdLoginDialog() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final empIdController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 24,
          right: 24,
          top: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Enter Employee / Badge ID',
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: isDark ? Colors.white : const Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Multiple guards can use this device with their registered badge ID.',
              style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: empIdController,
              autofocus: true,
              textCapitalization: TextCapitalization.characters,
              decoration: InputDecoration(
                hintText: 'e.g. EMP-101 or Phone Number',
                prefixIcon: const Icon(Icons.badge_outlined),
                filled: true,
                fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  final id = empIdController.text.trim();
                  if (id.isEmpty) return;

                  final member = GuardSessionService().findMemberByEmpId(id);
                  if (member != null) {
                    Navigator.pop(ctx);
                    _onGuardSelected(member);
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Guard not found in site roster. Ask Admin to register this guard.'),
                        backgroundColor: Colors.redAccent,
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  }
                },
                child: const Text('Find Guard & Enter PIN', style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _onAuthenticationSuccess() {
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const PatrolHomeShell(
          doorName: 'Main Gate',
        ),
        transitionsBuilder: (_, anim, __, child) => FadeTransition(opacity: anim, child: child),
        transitionDuration: const Duration(milliseconds: 400),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final dev = DeviceProfileService().currentProfile;
    final roster = GuardSessionService().roster;
    final activeSession = GuardSessionService().activeSession;
    final currentSiteName = dev?.boundSiteName.isNotEmpty == true ? dev!.boundSiteName : 'Main Security Facility';

    final filteredRoster = _searchQuery.isEmpty
        ? roster
        : roster.where((m) =>
            m.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            m.badgeNumber.toLowerCase().contains(_searchQuery.toLowerCase())).toList();

    final timeStr = DateFormat('hh:mm a').format(_currentTime);
    final dateStr = DateFormat('EEEE, MMMM d, yyyy').format(_currentTime);

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0B1320) : const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Column(
          children: [
            // Top Terminal Header with Interactive Site Selector
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Interactive Site Dropdown Selector
                  InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: _showSiteSelectionSheet,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.business_rounded, size: 16, color: Color(0xFF10B981)),
                          const SizedBox(width: 6),
                          ConstrainedBox(
                            constraints: const BoxConstraints(maxWidth: 160),
                            child: Text(
                              currentSiteName,
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                color: isDark ? Colors.white : const Color(0xFF0F172A),
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(Icons.arrow_drop_down_rounded, size: 18, color: Color(0xFF10B981)),
                        ],
                      ),
                    ),
                  ),

                  // Health Status Badges + Admin Settings
                  Row(
                    children: [
                      _buildStatusPill(
                        icon: Icons.gps_fixed_rounded,
                        label: _isGpsGood ? 'GPS' : 'GPS',
                        isOk: _isGpsGood,
                        isDark: isDark,
                      ),
                      const SizedBox(width: 6),
                      _buildStatusPill(
                        icon: _isOnline ? Icons.wifi_rounded : Icons.wifi_off_rounded,
                        label: _isOnline ? 'Online' : 'Offline',
                        isOk: _isOnline,
                        isDark: isDark,
                      ),
                      const SizedBox(width: 6),
                      _buildStatusPill(
                        icon: Icons.battery_charging_full_rounded,
                        label: '$_batteryLevel%',
                        isOk: _batteryLevel > 20,
                        isDark: isDark,
                      ),
                      const SizedBox(width: 4),
                      IconButton(
                        icon: const Icon(Icons.admin_panel_settings_outlined, size: 20),
                        color: const Color(0xFF2563EB),
                        tooltip: 'Supervisor Settings',
                        onPressed: () => AdminDeviceDialog.show(context),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const Divider(height: 1, color: Color(0xFF1E293B)),

            // Center Shift Handover & Multiple Guard Login
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                child: Column(
                  children: [
                    // Header Logo & Clock
                    Image.asset(
                      'assets/logoPatrol.png',
                      height: 52,
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Icon(
                        Icons.shield_rounded,
                        size: 40,
                        color: Color(0xFF10B981),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      timeStr,
                      style: GoogleFonts.inter(
                        fontSize: 34,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -1,
                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                      ),
                    ),
                    Text(
                      dateStr,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Shift Handover Banner
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: isDark
                              ? [const Color(0xFF0F291E), const Color(0xFF0B1F17)]
                              : [const Color(0xFFDCFCE7), const Color(0xFFF0FDF4)],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: const Color(0xFF10B981).withValues(alpha: 0.35),
                          width: 1.2,
                        ),
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: const Color(0xFF10B981).withValues(alpha: 0.18),
                                ),
                                child: const Icon(Icons.swap_horiz_rounded, size: 22, color: Color(0xFF10B981)),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Shift Handover & Guard Login',
                                      style: GoogleFonts.inter(
                                        fontSize: 13.5,
                                        fontWeight: FontWeight.w800,
                                        color: isDark ? Colors.white : const Color(0xFF14532D),
                                      ),
                                    ),
                                    Text(
                                      'Tap smart badge, enter ID, or select your name below to start shift.',
                                      style: GoogleFonts.inter(
                                        fontSize: 11,
                                        color: isDark ? const Color(0xFF86EFAC) : const Color(0xFF15803D),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: _showEmployeeIdLoginDialog,
                                  icon: const Icon(Icons.badge_outlined, size: 15),
                                  label: const Text('Enter Badge ID'),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: isDark ? const Color(0xFF86EFAC) : const Color(0xFF15803D),
                                    side: BorderSide(
                                      color: isDark ? const Color(0xFF10B981).withValues(alpha: 0.5) : const Color(0xFF15803D),
                                    ),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    textStyle: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 18),

                    // Guard Search Filter
                    TextField(
                      controller: _searchController,
                      onChanged: (val) => setState(() => _searchQuery = val),
                      decoration: InputDecoration(
                        hintText: 'Search guard by name or ID...',
                        hintStyle: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF94A3B8)),
                        prefixIcon: const Icon(Icons.search_rounded, size: 18),
                        suffixIcon: _searchQuery.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear_rounded, size: 16),
                                onPressed: () {
                                  _searchController.clear();
                                  setState(() => _searchQuery = '');
                                },
                              )
                            : null,
                        filled: true,
                        fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
                        ),
                      ),
                    ),

                    const SizedBox(height: 14),

                    // Guard Roster Grid (Multiple Guards)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Guards on Duty (${filteredRoster.length})',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: isDark ? Colors.white : const Color(0xFF0F172A),
                          ),
                        ),
                        InkWell(
                          borderRadius: BorderRadius.circular(8),
                          onTap: () async {
                            await Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => CreateGuardScreen(
                                  onGuardCreated: () {
                                    GuardSessionService().fetchRosterFromBackend().then((_) {
                                      if (mounted) setState(() {});
                                    });
                                  },
                                ),
                              ),
                            );
                            if (mounted) {
                              await GuardSessionService().fetchRosterFromBackend();
                              setState(() {});
                            }
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.person_add_alt_1_rounded, size: 14, color: Color(0xFF10B981)),
                                const SizedBox(width: 4),
                                Text(
                                  '+ Add Guard',
                                  style: GoogleFonts.inter(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w700,
                                    color: const Color(0xFF10B981),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 10),

                    if (filteredRoster.isEmpty) ...[
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1E293B) : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                        ),
                        child: Column(
                          children: [
                            const Icon(Icons.people_outline_rounded, size: 38, color: Color(0xFF64748B)),
                            const SizedBox(height: 8),
                            Text(
                              'No guards registered for $currentSiteName',
                              style: GoogleFonts.inter(fontSize: 13, color: isDark ? Colors.white : const Color(0xFF0F172A), fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Register a guard now so they can log in with a 4-digit PIN or badge.',
                              style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFF94A3B8)),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 14),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF10B981),
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              onPressed: () async {
                                await Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => CreateGuardScreen(
                                      onGuardCreated: () {
                                        GuardSessionService().fetchRosterFromBackend().then((_) {
                                          if (mounted) setState(() {});
                                        });
                                      },
                                    ),
                                  ),
                                );
                                if (mounted) {
                                  await GuardSessionService().fetchRosterFromBackend();
                                  setState(() {});
                                }
                              },
                              icon: const Icon(Icons.add_rounded, size: 16),
                              label: const Text('+ Register Guard for this Site', style: TextStyle(fontWeight: FontWeight.w700)),
                            ),
                          ],
                        ),
                      ),
                    ] else ...[
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 10,
                          mainAxisSpacing: 10,
                          childAspectRatio: 1.6,
                        ),
                        itemCount: filteredRoster.length,
                        itemBuilder: (context, index) {
                          final member = filteredRoster[index];
                          return InkWell(
                            borderRadius: BorderRadius.circular(14),
                            onTap: () => _onGuardSelected(member),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.04),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      CircleAvatar(
                                        radius: 14,
                                        backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.15),
                                        child: Text(
                                          member.name.isNotEmpty ? member.name[0].toUpperCase() : 'G',
                                          style: GoogleFonts.inter(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w800,
                                            color: const Color(0xFF10B981),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          member.name,
                                          style: GoogleFonts.inter(
                                            fontSize: 12.5,
                                            fontWeight: FontWeight.w700,
                                            color: isDark ? Colors.white : const Color(0xFF0F172A),
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        'ID: ${member.badgeNumber}',
                                        style: GoogleFonts.inter(
                                          fontSize: 11,
                                          color: const Color(0xFF64748B),
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF10B981).withValues(alpha: 0.15),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          'PIN',
                                          style: GoogleFonts.inter(
                                            fontSize: 9.5,
                                            fontWeight: FontWeight.w800,
                                            color: const Color(0xFF10B981),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusPill({
    required IconData icon,
    required String label,
    required bool isOk,
    required bool isDark,
  }) {
    final color = isOk ? const Color(0xFF22C55E) : const Color(0xFFEF4444);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.w600, color: color),
          ),
        ],
      ),
    );
  }
}
