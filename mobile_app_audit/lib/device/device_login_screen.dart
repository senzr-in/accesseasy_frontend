import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:accesseasy_shared/core/constants.dart';
import 'package:accesseasy_shared/services/auth_service.dart';

import '../auth/guard_kiosk_lock_screen.dart';
import '../auth/guard_session_service.dart';
import 'device_profile_service.dart';

class DeviceLoginScreen extends StatefulWidget {
  const DeviceLoginScreen({super.key});

  @override
  State<DeviceLoginScreen> createState() => _DeviceLoginScreenState();
}

class _DeviceLoginScreenState extends State<DeviceLoginScreen> {
  // Step 1: Admin Credentials -> Step 2: Site/Zone Assignment
  int _currentStep = 0;

  // Controllers for Admin Login
  final TextEditingController _emailOrPhoneController = TextEditingController();
  final TextEditingController _passwordOrOtpController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  // Provisioning data
  List<Map<String, dynamic>> _availableSites = [];
  List<Map<String, dynamic>> _availableZones = [];
  Map<String, dynamic>? _selectedSite;
  Map<String, dynamic>? _selectedZone;
  final TextEditingController _postNameController = TextEditingController(text: 'Main Gate');

  @override
  void initState() {
    super.initState();
    _checkExistingSession();
  }

  @override
  void dispose() {
    _emailOrPhoneController.dispose();
    _passwordOrOtpController.dispose();
    _postNameController.dispose();
    super.dispose();
  }

  Future<void> _checkExistingSession() async {
    final isLoggedIn = await AuthService.isLoggedIn();
    if (isLoggedIn) {
      setState(() => _currentStep = 1);
      _fetchSitesAndZones();
    }
  }

  Future<void> _handleAdminLogin() async {
    final identifier = _emailOrPhoneController.text.trim();
    final secret = _passwordOrOtpController.text.trim();

    if (identifier.isEmpty || secret.isEmpty) {
      setState(() => _errorMessage = 'Please enter Admin credentials');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // 1. Authenticate with Directus backend / AuthService
      final url = Uri.parse('$kBaseUrl/auth/login');
      final res = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': identifier.contains('@') ? identifier : '$identifier@accesseasy.com',
          'password': secret,
        }),
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body)['data'];
        final accessToken = data['access_token'] as String?;
        if (accessToken != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('auth_token', accessToken);
          await prefs.setString('token', accessToken);
          token = accessToken;
        }

        setState(() {
          _currentStep = 1;
        });
        await _fetchSitesAndZones();
      } else {
        setState(() => _errorMessage = 'Authentication failed. Please verify your Administrator credentials.');
      }
    } catch (e) {
      setState(() => _errorMessage = 'Network error: Unable to connect to server ($e)');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchSitesAndZones() async {
    setState(() => _isLoading = true);
    final prefs = await SharedPreferences.getInstance();
    final currentToken = token ?? prefs.getString('auth_token') ?? prefs.getString('token');

    try {
      if (currentToken != null && currentToken.isNotEmpty) {
        final sitesUrl = Uri.parse('$kBaseUrl/items/locationManagement?fields=id,locName,name,locAddress,locmark&limit=50');
        final res = await http.get(sitesUrl, headers: {'Authorization': 'Bearer $currentToken'}).timeout(const Duration(seconds: 8));
        if (res.statusCode == 200) {
          final list = jsonDecode(res.body)['data'] as List?;
          if (list != null && list.isNotEmpty) {
            _availableSites = list.map((e) {
              final m = Map<String, dynamic>.from(e);
              final siteName = m['locName']?.toString() ?? m['name']?.toString() ?? 'Site ${m['id']}';
              return {
                'id': m['id']?.toString() ?? '',
                'name': siteName,
                'address': m['locAddress']?.toString() ?? '',
              };
            }).toList();
          }
        }
      }
    } catch (_) {}

    // If backend did not return sites, provide default site options
    if (_availableSites.isEmpty) {
      final cachedSite = DeviceProfileService().currentProfile?.boundSiteName;
      final cachedId = DeviceProfileService().currentProfile?.boundSiteId;
      if (cachedSite != null && cachedId != null) {
        _availableSites = [{'id': cachedId, 'name': cachedSite}];
      } else {
        _availableSites = [{'id': 'site-default', 'name': 'Main Facility'}];
      }
    }

    _selectedSite = _availableSites.first;

    // Fetch or construct zones for selected site
    await _updateZonesForSite(_selectedSite!['id']);

    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _updateZonesForSite(String siteId) async {
    final prefs = await SharedPreferences.getInstance();
    final currentToken = token ?? prefs.getString('auth_token') ?? prefs.getString('token');
    
    List<Map<String, dynamic>> loadedZones = [];
    if (currentToken != null && currentToken.isNotEmpty) {
      try {
        final url = Uri.parse('$kBaseUrl/items/zones?filter[site][_eq]=$siteId&fields=id,zoneName,name,site&limit=50');
        final res = await http.get(url, headers: {'Authorization': 'Bearer $currentToken'}).timeout(const Duration(seconds: 8));
        if (res.statusCode == 200) {
          final list = jsonDecode(res.body)['data'] as List?;
          if (list != null && list.isNotEmpty) {
            loadedZones = list.map((z) {
              final m = Map<String, dynamic>.from(z);
              final zName = m['zoneName']?.toString() ?? m['name']?.toString() ?? 'Zone ${m['id']}';
              return {
                'id': m['id']?.toString() ?? '',
                'name': zName,
                'site_id': siteId,
              };
            }).toList();
          }
        }
      } catch (e) {
        debugPrint('Error fetching zones for site $siteId: $e');
      }
    }

    if (loadedZones.isEmpty) {
      loadedZones = [
        {'id': 'zone-general', 'name': 'General Perimeter Zone', 'site_id': siteId},
        {'id': 'zone-main', 'name': 'Main Building & Entryways', 'site_id': siteId},
      ];
    }

    if (mounted) {
      setState(() {
        _availableZones = loadedZones;
        _selectedZone = _availableZones.first;
      });
    }
  }

  Future<void> _completeDeviceProvisioning() async {
    if (_selectedSite == null || _selectedZone == null) {
      setState(() => _errorMessage = 'Please select a Site and Patrol Zone');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final siteId = _selectedSite!['id'].toString();
      final siteName = _selectedSite!['name']?.toString() ?? 'Main Site';
      final zoneId = _selectedZone!['id'].toString();
      final zoneName = _selectedZone!['name']?.toString() ?? 'Main Zone';
      final postName = _postNameController.text.trim().isNotEmpty ? _postNameController.text.trim() : 'Gate 1';

      // 1. Provision Device Profile
      await DeviceProfileService().provisionDevice(
        tenantId: tenant ?? 'default',
        siteId: siteId,
        siteName: siteName,
        zoneId: zoneId,
        zoneName: zoneName,
        postId: 'post-${DateTime.now().millisecondsSinceEpoch}',
        postName: postName,
        adminName: 'Supervisor',
      );

      // 2. Fetch and Cache Active Created Guards for this Site into SQLite
      await GuardSessionService().fetchRosterFromBackend();

      if (mounted) {
        // 3. Transition directly to Guard Kiosk
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            pageBuilder: (_, __, ___) => const GuardKioskLockScreen(),
            transitionsBuilder: (_, anim, __, child) => FadeTransition(opacity: anim, child: child),
            transitionDuration: const Duration(milliseconds: 500),
          ),
        );
      }
    } catch (e) {
      if (mounted) setState(() => _errorMessage = 'Provisioning error: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0B1320) : const Color(0xFFF8FAFC),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 12),
              // Top Brand Header
              Center(
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF2563EB).withValues(alpha: 0.12),
                      ),
                      child: const Icon(Icons.shield_rounded, size: 48, color: Color(0xFF2563EB)),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'AccessEasy Patrol',
                      style: GoogleFonts.inter(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Device Provisioning & Terminal Setup',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: const Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Step Progress Tracker
              Row(
                children: [
                  _buildStepIndicator(step: 0, label: '1. Admin Login', isDark: isDark),
                  Expanded(
                    child: Container(
                      height: 2,
                      color: _currentStep >= 1 ? const Color(0xFF2563EB) : const Color(0xFFCBD5E1),
                    ),
                  ),
                  _buildStepIndicator(step: 1, label: '2. Site Binding', isDark: isDark),
                ],
              ),

              const SizedBox(height: 28),

              if (_errorMessage != null) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.redAccent.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.redAccent.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline_rounded, color: Colors.redAccent, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: GoogleFonts.inter(fontSize: 12, color: Colors.redAccent, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // STEP 0: ADMIN LOGIN
              if (_currentStep == 0) ...[
                Text(
                  'Admin / Supervisor Authentication',
                  style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 4),
                Text(
                  'Only authorized administrators can provision this physical device.',
                  style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
                ),
                const SizedBox(height: 16),

                TextField(
                  controller: _emailOrPhoneController,
                  decoration: InputDecoration(
                    labelText: 'Admin Email / Phone',
                    prefixIcon: const Icon(Icons.person_outline_rounded),
                    filled: true,
                    fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 14),

                TextField(
                  controller: _passwordOrOtpController,
                  obscureText: true,
                  decoration: InputDecoration(
                    labelText: 'Password / Supervisor PIN',
                    prefixIcon: const Icon(Icons.lock_outline_rounded),
                    filled: true,
                    fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 24),

                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: _isLoading ? null : _handleAdminLogin,
                    child: _isLoading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : Text('Verify Admin & Continue', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700)),
                  ),
                ),
              ],

              // STEP 1: SITE & ZONE SELECTION
              if (_currentStep == 1) ...[
                Text(
                  'Assign Terminal Location',
                  style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 4),
                Text(
                  'Select the facility and guard post where this terminal will be stationed.',
                  style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
                ),
                const SizedBox(height: 18),

                // Site Dropdown
                Text('Site / Facility', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<Map<String, dynamic>>(
                      isExpanded: true,
                      value: _selectedSite,
                      items: _availableSites.map((site) {
                        return DropdownMenuItem<Map<String, dynamic>>(
                          value: site,
                          child: Text(site['name'] ?? site['id'], style: GoogleFonts.inter(fontSize: 13.5)),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setState(() {
                            _selectedSite = val;
                          });
                          _updateZonesForSite(val['id']);
                        }
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Zone Dropdown
                Text('Patrol Zone', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<Map<String, dynamic>>(
                      isExpanded: true,
                      value: _selectedZone,
                      items: _availableZones.map((zone) {
                        return DropdownMenuItem<Map<String, dynamic>>(
                          value: zone,
                          child: Text(zone['name'] ?? zone['id'], style: GoogleFonts.inter(fontSize: 13.5)),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setState(() => _selectedZone = val);
                        }
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Gate Post Name Input
                Text('Station / Gate Post Name', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                TextField(
                  controller: _postNameController,
                  decoration: InputDecoration(
                    hintText: 'e.g. Gate 1, North Checkpoint, Main Desk',
                    filled: true,
                    fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 28),

                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF15803D),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    icon: const Icon(Icons.check_circle_outline_rounded, size: 20),
                    label: _isLoading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : Text('Complete Setup & Open Guard Kiosk', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700)),
                    onPressed: _isLoading ? null : _completeDeviceProvisioning,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepIndicator({required int step, required String label, required bool isDark}) {
    final isActive = _currentStep >= step;
    return Row(
      children: [
        Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isActive ? const Color(0xFF2563EB) : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
          ),
          child: Center(
            child: Text(
              '${step + 1}',
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: isActive ? Colors.white : const Color(0xFF64748B),
              ),
            ),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11.5,
            fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
            color: isActive ? (isDark ? Colors.white : const Color(0xFF0F172A)) : const Color(0xFF64748B),
          ),
        ),
      ],
    );
  }
}
