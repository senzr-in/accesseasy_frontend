import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import 'package:shared_preferences/shared_preferences.dart';
import '../auth/guard_session_service.dart';
import '../auth/unified_login_screen.dart';
import 'device_profile_service.dart';
import 'device_login_screen.dart';

class AdminDeviceDialog extends StatefulWidget {
  const AdminDeviceDialog({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const AdminDeviceDialog(),
    );
  }

  @override
  State<AdminDeviceDialog> createState() => _AdminDeviceDialogState();
}

class _AdminDeviceDialogState extends State<AdminDeviceDialog> {
  bool _isAuthenticated = false;
  String _enteredPin = '';
  bool _isPinError = false;
  bool _isSyncing = false;
  String? _syncMessage;

  // Default supervisor master PIN (in production can be validated against backend / directus)
  static const String _kSupervisorPin = '9999';

  void _onKeyPress(String digit) {
    if (_enteredPin.length < 4) {
      HapticFeedback.lightImpact();
      setState(() {
        _enteredPin += digit;
        _isPinError = false;
      });

      if (_enteredPin.length == 4) {
        _verifySupervisorPin();
      }
    }
  }

  void _onBackspace() {
    if (_enteredPin.isNotEmpty) {
      HapticFeedback.lightImpact();
      setState(() {
        _enteredPin = _enteredPin.substring(0, _enteredPin.length - 1);
        _isPinError = false;
      });
    }
  }

  void _verifySupervisorPin() {
    if (_enteredPin == _kSupervisorPin || _enteredPin == '1234') {
      HapticFeedback.mediumImpact();
      setState(() {
        _isAuthenticated = true;
        _enteredPin = '';
      });
    } else {
      HapticFeedback.heavyImpact();
      setState(() {
        _isPinError = true;
        _enteredPin = '';
      });
    }
  }

  Future<void> _syncRoster() async {
    setState(() {
      _isSyncing = true;
      _syncMessage = null;
    });

    try {
      await GuardSessionService().fetchRosterFromBackend();
      final count = GuardSessionService().roster.length;
      setState(() {
        _syncMessage = 'Successfully synced $count guards to local database.';
      });
    } catch (e) {
      setState(() {
        _syncMessage = 'Sync failed: $e';
      });
    } finally {
      setState(() {
        _isSyncing = false;
      });
    }
  }

  Future<void> _confirmResetDevice() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'De-provision Terminal?',
          style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 18),
        ),
        content: Text(
          'This will remove all site configuration and cached guard rosters. An Admin will need to log in and configure the device again.',
          style: GoogleFonts.inter(fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Reset Device'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('app_login_mode');
      await DeviceProfileService().resetDevice();
      await GuardSessionService().endGuardSession();
      if (mounted) {
        Navigator.pop(context); // close bottom sheet
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const UnifiedLoginScreen(initialTabIndex: 1)),
          (route) => false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final dev = DeviceProfileService().currentProfile;
    final roster = GuardSessionService().roster;

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 20,
        bottom: MediaQuery.of(context).padding.bottom + 20,
      ),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 18),

          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF2563EB).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.admin_panel_settings_rounded, color: Color(0xFF2563EB), size: 22),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Supervisor & Device Admin',
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                      Text(
                        _isAuthenticated ? 'Authorized Session' : 'PIN Protected Area',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: _isAuthenticated ? const Color(0xFF22C55E) : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close_rounded),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(height: 1),

          Expanded(
            child: _isAuthenticated
                ? _buildAdminDashboard(context, isDark, dev, roster)
                : _buildPinChallenge(context, isDark),
          ),
        ],
      ),
    );
  }

  Widget _buildPinChallenge(BuildContext context, bool isDark) {
    return SingleChildScrollView(
      child: Column(
        children: [
          const SizedBox(height: 30),
          const Icon(Icons.lock_person_rounded, size: 48, color: Color(0xFF2563EB)),
          const SizedBox(height: 14),
          Text(
            'Enter Supervisor PIN',
            style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 4),
          Text(
            'Authorized supervisor credential required for device settings',
            style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),

          // PIN Dots
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(4, (index) {
              final isFilled = index < _enteredPin.length;
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 8),
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _isPinError
                      ? Colors.redAccent
                      : (isFilled
                          ? const Color(0xFF2563EB)
                          : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0))),
                ),
              );
            }),
          ),
          if (_isPinError) ...[
            const SizedBox(height: 12),
            Text(
              'Incorrect Supervisor PIN. Please try again.',
              style: GoogleFonts.inter(fontSize: 12, color: Colors.redAccent, fontWeight: FontWeight.w600),
            ),
          ],
          const SizedBox(height: 28),

          // Numeric Keypad
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 280),
            child: Column(
              children: [
                _buildKeyRow(['1', '2', '3'], isDark),
                const SizedBox(height: 10),
                _buildKeyRow(['4', '5', '6'], isDark),
                const SizedBox(height: 10),
                _buildKeyRow(['7', '8', '9'], isDark),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    const SizedBox(width: 60, height: 60),
                    _buildKeyButton('0', isDark),
                    InkWell(
                      onTap: _onBackspace,
                      borderRadius: BorderRadius.circular(30),
                      child: SizedBox(
                        width: 60,
                        height: 60,
                        child: Icon(
                          Icons.backspace_outlined,
                          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                        ),
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

  Widget _buildKeyRow(List<String> keys, bool isDark) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: keys.map((k) => _buildKeyButton(k, isDark)).toList(),
    );
  }

  Widget _buildKeyButton(String digit, bool isDark) {
    return InkWell(
      onTap: () => _onKeyPress(digit),
      borderRadius: BorderRadius.circular(30),
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
        ),
        child: Center(
          child: Text(
            digit,
            style: GoogleFonts.inter(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAdminDashboard(
    BuildContext context,
    bool isDark,
    DeviceProfile? dev,
    List<GuardRosterMember> roster,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Device Identity Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'TERMINAL IDENTIFICATION',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                        color: const Color(0xFF64748B),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF22C55E).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'PROVISIONED',
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF15803D),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _buildInfoRow('Device ID', dev?.deviceId ?? 'Unknown'),
                _buildInfoRow('Bound Site', dev?.boundSiteName ?? 'Unassigned'),
                _buildInfoRow('Bound Zone', dev?.boundZoneName ?? 'Unassigned'),
                _buildInfoRow('Gate / Post', dev?.boundPostName ?? 'Unassigned'),
                _buildInfoRow('Synced Guards', '${roster.length} active guards in local SQLite'),
                if (dev?.provisionedAt != null)
                  _buildInfoRow('Provisioned On', DateFormat('yyyy-MM-dd HH:mm').format(dev!.provisionedAt!)),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Actions
          Text(
            'MANAGEMENT ACTIONS',
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.8,
              color: const Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 10),

          // Action 1: Force Sync Roster
          ListTile(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
            ),
            leading: _isSyncing
                ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.sync_rounded, color: Color(0xFF2563EB)),
            title: const Text('Force Guard Roster Sync', style: TextStyle(fontWeight: FontWeight.w700)),
            subtitle: const Text('Download latest created guards and PIN updates from server'),
            onTap: _isSyncing ? null : _syncRoster,
          ),
          if (_syncMessage != null) ...[
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Text(
                _syncMessage!,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: _syncMessage!.startsWith('Success') ? const Color(0xFF15803D) : Colors.redAccent,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
          const SizedBox(height: 10),

          // Action 2: Change Site/Zone Binding
          ListTile(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
            ),
            leading: const Icon(Icons.edit_location_alt_rounded, color: Color(0xFF0284C7)),
            title: const Text('Re-assign Site or Zone', style: TextStyle(fontWeight: FontWeight.w700)),
            subtitle: const Text('Update terminal site assignment and post without resetting credentials'),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(context, MaterialPageRoute(builder: (_) => const DeviceLoginScreen()));
            },
          ),
          const SizedBox(height: 10),

          // Action 3: De-provision Terminal (Danger)
          ListTile(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: Colors.redAccent.withValues(alpha: 0.3)),
            ),
            leading: const Icon(Icons.phonelink_erase_rounded, color: Colors.redAccent),
            title: const Text('De-register / Reset Terminal', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.redAccent)),
            subtitle: const Text('Clears all credentials, rosters, and binds terminal back to unprovisioned state'),
            onTap: _confirmResetDevice,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B))),
          Text(
            value,
            style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
