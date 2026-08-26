import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';

import '../device/device_security_service.dart';
import 'guard_session_service.dart';

class PinAuthDialog extends StatefulWidget {
  final GuardRosterMember member;
  final String title;
  final String subtitle;

  const PinAuthDialog({
    super.key,
    required this.member,
    this.title = 'Enter PIN',
    this.subtitle = 'Enter your 4-digit PIN',
  });

  static Future<bool?> show({
    required BuildContext context,
    required GuardRosterMember member,
    String title = 'Enter PIN',
    String subtitle = 'Enter your 4-digit PIN',
  }) {
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => PinAuthDialog(
        member: member,
        title: title,
        subtitle: subtitle,
      ),
    );
  }

  @override
  State<PinAuthDialog> createState() => _PinAuthDialogState();
}

class _PinAuthDialogState extends State<PinAuthDialog> {
  String _enteredPin = '';
  bool _isError = false;
  String? _errorMessage;
  int _lockoutSeconds = 0;
  Timer? _countdownTimer;

  @override
  void initState() {
    super.initState();
    _checkLockout();
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  void _checkLockout() {
    final status = DeviceSecurityService().checkLockout();
    if (status.isLockedOut) {
      setState(() {
        _lockoutSeconds = status.remainingSeconds;
        _errorMessage = status.requiresSupervisor
            ? 'Terminal Locked: Contact Supervisor to unlock.'
            : 'Too many attempts. Locked for ${_lockoutSeconds}s';
      });
      _startCountdown();
    }
  }

  void _startCountdown() {
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_lockoutSeconds > 1) {
        setState(() {
          _lockoutSeconds--;
          _errorMessage = 'Too many attempts. Locked for ${_lockoutSeconds}s';
        });
      } else {
        timer.cancel();
        if (mounted) {
          setState(() {
            _lockoutSeconds = 0;
            _errorMessage = null;
            _isError = false;
          });
        }
      }
    });
  }

  void _onKeyPress(String digit) {
    if (_lockoutSeconds > 0) {
      HapticFeedback.heavyImpact();
      return;
    }

    if (_enteredPin.length < 4) {
      HapticFeedback.lightImpact();
      setState(() {
        _enteredPin += digit;
        _isError = false;
        _errorMessage = null;
      });

      if (_enteredPin.length == 4) {
        _verifyPin();
      }
    }
  }

  void _onBackspace() {
    if (_enteredPin.isNotEmpty) {
      HapticFeedback.lightImpact();
      setState(() {
        _enteredPin = _enteredPin.substring(0, _enteredPin.length - 1);
        _isError = false;
      });
    }
  }

  Future<void> _verifyPin() async {
    final session = await GuardSessionService().authenticateWithPin(
      member: widget.member,
      enteredPin: _enteredPin,
    );

    if (session != null) {
      HapticFeedback.mediumImpact();
      if (mounted) Navigator.of(context).pop(true);
    } else {
      HapticFeedback.heavyImpact();
      final sec = DeviceSecurityService();
      final status = sec.checkLockout();

      setState(() {
        _isError = true;
        _enteredPin = '';
        if (status.isLockedOut) {
          _lockoutSeconds = status.remainingSeconds;
          _errorMessage = status.requiresSupervisor
              ? 'Terminal Locked: Contact Supervisor to unlock.'
              : 'Incorrect PIN. Locked for ${_lockoutSeconds}s';
          _startCountdown();
        } else {
          final remainingAttempts = 5 - status.failedAttempts;
          _errorMessage = 'Incorrect PIN. ${remainingAttempts > 0 ? '$remainingAttempts attempts left.' : ''}';
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 20,
        bottom: MediaQuery.of(context).padding.bottom + 20,
      ),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 20),

          // Guard Header Avatar
          CircleAvatar(
            radius: 28,
            backgroundColor: const Color(0xFF15803D).withValues(alpha: 0.15),
            child: Text(
              widget.member.name.isNotEmpty ? widget.member.name[0].toUpperCase() : 'G',
              style: GoogleFonts.inter(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF15803D),
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Guard Name & Badge
          Text(
            widget.member.name,
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
          Text(
            '${widget.member.badgeNumber} • ${widget.member.role ?? 'Security Officer'}',
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 18),

          // PIN Dots Indicator
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
                  color: _isError
                      ? Colors.redAccent
                      : (isFilled
                          ? const Color(0xFF15803D)
                          : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0))),
                  border: Border.all(
                    color: _isError
                        ? Colors.redAccent
                        : (isFilled
                            ? const Color(0xFF22C55E)
                            : (isDark ? const Color(0xFF475569) : const Color(0xFFCBD5E1))),
                    width: 1.5,
                  ),
                ),
              );
            }),
          ).animate(target: _isError ? 1 : 0).shake(duration: 400.ms, curve: Curves.easeInOut),

          if (_errorMessage != null) ...[
            const SizedBox(height: 12),
            Text(
              _errorMessage!,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.redAccent,
              ),
              textAlign: TextAlign.center,
            ),
          ],

          const SizedBox(height: 24),

          // Numeric Keypad Grid (1-9, Clear, 0, Backspace)
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 300),
            child: Column(
              children: [
                _buildKeyRow(['1', '2', '3'], isDark),
                const SizedBox(height: 12),
                _buildKeyRow(['4', '5', '6'], isDark),
                const SizedBox(height: 12),
                _buildKeyRow(['7', '8', '9'], isDark),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildActionButton(
                      icon: Icons.cancel_outlined,
                      label: 'Cancel',
                      isDark: isDark,
                      onTap: () => Navigator.of(context).pop(false),
                    ),
                    _buildKeyButton('0', isDark),
                    _buildActionButton(
                      icon: Icons.backspace_outlined,
                      isDark: isDark,
                      onTap: _onBackspace,
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
    final isDisabled = _lockoutSeconds > 0;

    return InkWell(
      onTap: isDisabled ? null : () => _onKeyPress(digit),
      borderRadius: BorderRadius.circular(35),
      child: Container(
        width: 68,
        height: 68,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
          border: Border.all(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
          ),
        ),
        child: Center(
          child: Text(
            digit,
            style: GoogleFonts.inter(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: isDisabled
                  ? (isDark ? const Color(0xFF475569) : const Color(0xFF94A3B8))
                  : (isDark ? Colors.white : const Color(0xFF0F172A)),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton({
    IconData? icon,
    String? label,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(35),
      child: SizedBox(
        width: 68,
        height: 68,
        child: Center(
          child: icon != null
              ? Icon(
                  icon,
                  size: 22,
                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                )
              : Text(
                  label ?? '',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                  ),
                ),
        ),
      ),
    );
  }
}
