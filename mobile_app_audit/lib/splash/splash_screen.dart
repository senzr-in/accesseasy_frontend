import 'dart:convert';
import 'dart:io';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:permission_handler/permission_handler.dart';
import 'package:geolocator/geolocator.dart';

import 'package:accesseasy_shared/core/constants.dart';
import 'package:accesseasy_shared/services/auth_service.dart';
import 'package:accesseasy_shared/UI_components/log_helper.dart';

import 'package:shared_preferences/shared_preferences.dart';
import '../admin/admin_dashboard_screen.dart';
import '../home/patrol_home_shell.dart';
import '../device/device_profile_service.dart';
import '../device/device_security_service.dart';
import '../auth/guard_session_service.dart';
import '../auth/guard_kiosk_lock_screen.dart';
import '../auth/unified_login_screen.dart';

// ─────────────────────────────────────────────────────────────
//  Guard Patrol — Premium 3D Liquid Ripple Splash Screen
//  Features:
//  - Dead-Center 3D Floating Shield Logo (Y-Axis Spin & Drift)
//  - Highly Visible Smooth 3D Liquid Clay Concentric Waves
//  - Clean Transition to Access Guard Phone OTP Login Screen
// ─────────────────────────────────────────────────────────────

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  // ── Animation Controllers ───────────────────────────────────
  late AnimationController _entranceController;
  late AnimationController _driftController;
  late AnimationController _wavePulseController;

  // Entrance Timeline Animations
  late Animation<double> _logoFade;
  late Animation<double> _entranceScale;
  late Animation<double> _logoRotationY;
  late Animation<double> _waveExpandProgress;

  // Drift Tweens (Floating Anti-Gravity)
  late Animation<double> _driftY;
  late Animation<double> _driftTiltX;
  late Animation<double> _driftTiltY;

  // Boot status
  bool _isLoggedIn = false;
  bool _bootCompleted = false;

  // Palette
  static const Color _surfaceBg = Color(0xFFF1F4F8); // Smooth off-white liquid clay
  static const Color _brandBlue = Color(0xFF2563EB);
  static const Color _textHeading = Color(0xFF0F172A);
  static const Color _textBody = Color(0xFF475569);

  @override
  void initState() {
    super.initState();

    // 1. Entrance Sequence (2.2 seconds)
    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    );

    // 2. Anti-Gravity Floating Drift (3.2 seconds loop)
    _driftController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3200),
    );

    // 3. Continuous Smooth Liquid Wave Pulsing (3.5 seconds loop)
    _wavePulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3500),
    );

    // Drift Tweens
    _driftY = Tween<double>(begin: -6.0, end: 6.0).animate(
      CurvedAnimation(parent: _driftController, curve: Curves.easeInOut),
    );
    _driftTiltX = Tween<double>(begin: -0.04, end: 0.04).animate(
      CurvedAnimation(parent: _driftController, curve: Curves.easeInOut),
    );
    _driftTiltY = Tween<double>(begin: -0.04, end: 0.04).animate(
      CurvedAnimation(parent: _driftController, curve: Curves.easeInOut),
    );

    // Entrance Timeline
    _logoFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _entranceController,
        curve: const Interval(0.0, 0.25, curve: Curves.easeOutCubic),
      ),
    );

    _entranceScale = Tween<double>(begin: 0.80, end: 1.0).animate(
      CurvedAnimation(
        parent: _entranceController,
        curve: const Interval(0.0, 0.30, curve: Curves.easeOutBack),
      ),
    );

    // 360° 3D Y-Axis Rotation
    _logoRotationY = Tween<double>(begin: 0.0, end: 2 * math.pi).animate(
      CurvedAnimation(
        parent: _entranceController,
        curve: const Interval(0.18, 0.65, curve: Cubic(0.4, 0.0, 0.2, 1.0)),
      ),
    );

    // Smooth Liquid Wave Expansion
    _waveExpandProgress = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _entranceController,
        curve: const Interval(0.35, 0.85, curve: Curves.easeOutCubic),
      ),
    );

    _entranceController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _bootCompleted = true;
        _proceedToNextScreen();
      }
    });

    _startAppBoot();
  }

  @override
  void dispose() {
    _entranceController.dispose();
    _driftController.dispose();
    _wavePulseController.dispose();
    super.dispose();
  }

  Future<void> _startAppBoot() async {
    _entranceController.forward(from: 0.0);
    _driftController.repeat(reverse: true);
    _wavePulseController.repeat();

    await _checkPermissions();

    try {
      await DeviceProfileService().init();
      await DeviceSecurityService().init();
      await GuardSessionService().init();
      await AuthService.restoreSession();
      _isLoggedIn = await AuthService.isLoggedIn();
      await LogHelper.write('Patrol Boot — Logged In: $_isLoggedIn');
    } catch (e) {
      await LogHelper.write('Patrol Boot Error: $e');
    }

    if (_bootCompleted) {
      _proceedToNextScreen();
    }
  }

  Future<void> _proceedToNextScreen() async {
    if (!mounted) return;

    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;

    final currentToken = token ?? prefs.getString('auth_token') ?? prefs.getString('token');
    String? loginMode = prefs.getString('app_login_mode');

    // If logged in via AuthService, ensure role is validated
    if (_isLoggedIn && currentToken != null && currentToken.isNotEmpty) {
      try {
        final url = Uri.parse('$kBaseUrl/users/me?fields=*.*,role.name,role.admin_access,role.app_access');
        final res = await http.get(url, headers: {
          'Authorization': 'Bearer $currentToken',
          'Content-Type': 'application/json',
        }).timeout(const Duration(seconds: 8));

        if (res.statusCode == 200) {
          final data = jsonDecode(res.body)['data'];
          if (data != null) {
            final roleObj = data['role'];
            String roleName = '';
            bool hasAdminAccess = false;
            if (roleObj is Map) {
              roleName = roleObj['name']?.toString() ?? '';
              hasAdminAccess = roleObj['admin_access'] == true ||
                  roleName.toLowerCase().contains('admin') ||
                  roleName.toLowerCase().contains('supervisor') ||
                  roleName.toLowerCase().contains('manager');
            } else if (roleObj != null) {
              roleName = roleObj.toString();
              hasAdminAccess = roleName.toLowerCase().contains('admin');
            }

            if (hasAdminAccess) {
              loginMode = 'user_admin';
              await prefs.setString('app_login_mode', 'user_admin');
              final name = '${data['first_name'] ?? ''} ${data['last_name'] ?? ''}'.trim();
              if (name.isNotEmpty) await prefs.setString('user_name', name);
            }
          }
        } else if (res.statusCode == 401) {
          // Token expired -> wipe dead credentials and reset login mode
          await AuthService.logout();
          _isLoggedIn = false;
          loginMode = null;
        }
      } catch (_) {}
    }

    if (!mounted) return;

    if (loginMode == 'user_admin') {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => AdminDashboardScreen(
            adminName: prefs.getString('user_name') ?? 'Administrator',
            adminPhone: prefs.getString('user_phone') ?? '',
          ),
          transitionDuration: const Duration(milliseconds: 600),
          transitionsBuilder: (_, anim, __, child) =>
              FadeTransition(opacity: anim, child: child),
        ),
      );
    } else if (loginMode == 'user_guard') {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => const PatrolHomeShell(doorName: 'Main Gate'),
          transitionDuration: const Duration(milliseconds: 600),
          transitionsBuilder: (_, anim, __, child) =>
              FadeTransition(opacity: anim, child: child),
        ),
      );
    } else if (loginMode == 'device_kiosk') {
      if (GuardSessionService().hasActiveSession) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            pageBuilder: (_, __, ___) => const PatrolHomeShell(doorName: 'Main Gate'),
            transitionDuration: const Duration(milliseconds: 600),
            transitionsBuilder: (_, anim, __, child) =>
                FadeTransition(opacity: anim, child: child),
          ),
        );
      } else {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            pageBuilder: (_, __, ___) => const GuardKioskLockScreen(),
            transitionDuration: const Duration(milliseconds: 600),
            transitionsBuilder: (_, anim, __, child) =>
                FadeTransition(opacity: anim, child: child),
          ),
        );
      }
    } else {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => const UnifiedLoginScreen(),
          transitionDuration: const Duration(milliseconds: 600),
          transitionsBuilder: (_, anim, __, child) =>
              FadeTransition(opacity: anim, child: child),
        ),
      );
    }
  }

  Future<void> _checkPermissions() async {
    try {
      await _showLocationDisclosureDialog();
      while (true) {
        bool permGranted = await Permission.location.isGranted;
        if (!permGranted) {
          final requested = await [
            Permission.location,
            Permission.notification,
          ].request();
          if (requested[Permission.location]?.isGranted != true) {
            await _showMandatoryPermissionDialog();
            continue;
          }
        }
        bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
        if (!serviceEnabled) {
          await _showEnableServiceDialog();
          continue;
        }
        break;
      }
    } catch (_) {}
  }

  Future<void> _showMandatoryPermissionDialog() async {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Location Required',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w700,
            fontSize: 18,
            color: _textHeading,
          ),
        ),
        content: Text(
          'Location access is needed to verify checkpoints and patrols.',
          style: GoogleFonts.inter(fontSize: 14, color: _textBody),
        ),
        actions: [
          TextButton(
            onPressed: () {
              if (Platform.isAndroid) {
                SystemNavigator.pop();
              } else {
                exit(0);
              }
            },
            child: Text('Exit App', style: GoogleFonts.inter(color: const Color(0xFF64748B))),
          ),
          TextButton(
            onPressed: openAppSettings,
            child: Text('Settings', style: GoogleFonts.inter(color: _brandBlue)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: _brandBlue,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Navigator.of(context).pop(),
            child: Text('Retry', style: GoogleFonts.inter(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Future<void> _showEnableServiceDialog() async {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Enable GPS',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w700,
            fontSize: 18,
            color: _textHeading,
          ),
        ),
        content: Text(
          'Please turn on GPS to use the app.',
          style: GoogleFonts.inter(fontSize: 14, color: _textBody),
        ),
        actions: [
          TextButton(
            onPressed: Geolocator.openLocationSettings,
            child: Text('Settings', style: GoogleFonts.inter(color: _brandBlue)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: _brandBlue,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Navigator.of(context).pop(),
            child: Text('Retry', style: GoogleFonts.inter(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _surfaceBg,
      body: AnimatedBuilder(
        animation: Listenable.merge([_entranceController, _driftController, _wavePulseController]),
        builder: (context, child) {
          final logoFade = _logoFade.value;
          final entranceScale = _entranceScale.value;
          final rotationY = _logoRotationY.value;
          final waveExpand = _waveExpandProgress.value;
          final pulseVal = _wavePulseController.value;

          return Stack(
            fit: StackFit.expand,
            alignment: Alignment.center,
            children: [
              // ── 1. PROMINENT 3D LIQUID CLAY CONCENTRIC RIPPLE WAVES (DEAD CENTER) ──
              Positioned.fill(
                child: CustomPaint(
                  painter: _Prominent3DLiquidRipplePainter(
                    pulseValue: pulseVal,
                    expandProgress: waveExpand,
                  ),
                ),
              ),

              // ── 2. DEAD-CENTER FLOATING 3D SHIELD LOGO ──
              Center(
                child: Transform.translate(
                  offset: Offset(0, _driftY.value),
                  child: Transform.scale(
                    scale: entranceScale,
                    child: Transform(
                      transform: Matrix4.identity()
                        ..setEntry(3, 2, 0.0015)
                        ..rotateX(_driftTiltX.value)
                        ..rotateY(rotationY + _driftTiltY.value),
                      alignment: Alignment.center,
                      child: Opacity(
                        opacity: logoFade.clamp(0.0, 1.0),
                        child: Container(
                          width: 175,
                          height: 175,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            boxShadow: [
                              // Soft 3D elevation shadow directly behind logo
                              BoxShadow(
                                color: const Color(0xFF0F172A).withValues(alpha: 0.12),
                                blurRadius: 40,
                                spreadRadius: 4,
                                offset: const Offset(0, 16),
                              ),
                              BoxShadow(
                                color: _brandBlue.withValues(alpha: 0.10),
                                blurRadius: 30,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: Center(
                            child: Image.asset(
                              'assets/logoPatrol.png',
                              width: 165,
                              height: 165,
                              fit: BoxFit.contain,
                              errorBuilder: (_, __, ___) => const Icon(
                                Icons.shield_rounded,
                                size: 120,
                                color: _brandBlue,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),

              // ── 3. PINNED BOTTOM FOOTER "POWERED BY ACCESSEASY" ──
              Positioned(
                bottom: 36,
                left: 0,
                right: 0,
                child: SafeArea(
                  child: Center(
                    child: Opacity(
                      opacity: logoFade.clamp(0.0, 1.0),
                      child: RichText(
                        text: TextSpan(
                          style: GoogleFonts.inter(
                            fontSize: 16,
                            color: _textHeading,
                          ),
                          children: [
                            TextSpan(
                              text: 'Powered by ',
                              style: GoogleFonts.inter(
                                fontWeight: FontWeight.w400,
                                color: _textBody,
                              ),
                            ),
                            TextSpan(
                              text: 'AccessEasy',
                              style: GoogleFonts.inter(
                                fontWeight: FontWeight.w800,
                                color: _textHeading,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }


  Future<bool> _showLocationDisclosureDialog() async {
    final prefs = await SharedPreferences.getInstance();
    final alreadyDisclosed = prefs.getBool('location_disclosure_accepted') ?? false;
    if (alreadyDisclosed) return true;

    if (!mounted) return true;

    final accepted = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            const Icon(Icons.location_on_rounded, color: Color(0xFF10B981), size: 28),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Background Location Access',
                style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'AccessEasy Patrol collects location data in the background during active guard patrol shifts to enable:',
              style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFFCBD5E1), height: 1.4),
            ),
            const SizedBox(height: 12),
            _buildDisclosureItem(Icons.route_rounded, 'Real-time patrol route & tour breadcrumbs'),
            const SizedBox(height: 8),
            _buildDisclosureItem(Icons.security_rounded, 'Perimeter geofence breach safety alerts'),
            const SizedBox(height: 8),
            _buildDisclosureItem(Icons.sos_rounded, 'Immediate GPS emergency SOS dispatch'),
            const SizedBox(height: 12),
            Text(
              'Location data is transmitted securely to your organization\'s Control Room only while on active shift.',
              style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF94A3B8)),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Deny', style: GoogleFonts.inter(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('Agree & Continue', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (accepted == true) {
      await prefs.setBool('location_disclosure_accepted', true);
      return true;
    }
    return false;
  }

  Widget _buildDisclosureItem(IconData icon, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: const Color(0xFF10B981), size: 16),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: GoogleFonts.inter(fontSize: 12, color: Colors.white70),
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  PROMINENT 3D LIQUID CLAY CONCENTRIC RIPPLE WAVES PAINTER
//  Renders deep, smooth 3D concentric liquid ripples radiating
//  from the dead center of the screen behind the logo.
// ─────────────────────────────────────────────────────────────
class _Prominent3DLiquidRipplePainter extends CustomPainter {
  final double pulseValue;
  final double expandProgress;

  _Prominent3DLiquidRipplePainter({
    required this.pulseValue,
    required this.expandProgress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (expandProgress <= 0.01) return;

    // Dead center of the screen
    final center = Offset(size.width / 2, size.height / 2);

    // 5 Distinct Concentric Ripple Wave Radii
    final baseRadii = [88.0, 145.0, 215.0, 290.0, 375.0];

    for (int i = 0; i < baseRadii.length; i++) {
      final phase = (pulseValue + (i * 0.20)) % 1.0;
      final waveOscillation = math.sin(phase * 2 * math.pi) * 8.0;
      final radius = (baseRadii[i] + waveOscillation) * expandProgress;

      if (radius <= 0) continue;

      // ── Layer 1: Wide Deep Soft Shadow Ring (Liquid Depth & Crease) ──
      final shadowSpread = 10.0 + (i * 3.0);
      final shadowOpacity = (0.28 - (i * 0.04)).clamp(0.08, 0.35);
      final deepShadowPaint = Paint()
        ..color = const Color(0xFF64748B).withValues(alpha: shadowOpacity)
        ..style = PaintingStyle.stroke
        ..strokeWidth = shadowSpread
        ..maskFilter = MaskFilter.blur(BlurStyle.normal, 8.0 + (i * 1.5));

      canvas.drawCircle(center + const Offset(2.0, 4.5), radius, deepShadowPaint);

      // ── Layer 2: Main Clay Ridge Stroke ──
      final ridgeOpacity = (0.85 - (i * 0.08)).clamp(0.30, 0.95);
      final ridgePaint = Paint()
        ..color = const Color(0xFFCBD5E1).withValues(alpha: ridgeOpacity)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.5 + (i * 0.5);

      canvas.drawCircle(center, radius, ridgePaint);

      // ── Layer 3: Crisp Liquid Specular Highlight (Light reflected on wave crest) ──
      final highlightOpacity = (0.95 - (i * 0.10)).clamp(0.40, 1.0);
      final highlightPaint = Paint()
        ..color = Colors.white.withValues(alpha: highlightOpacity)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 4.0
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3.0);

      canvas.drawCircle(center + const Offset(-2.0, -3.0), radius, highlightPaint);

      // ── Layer 4: Ambient Blue Luminescence Sheen ──
      final glowPaint = Paint()
        ..color = const Color(0xFF3B82F6).withValues(alpha: (0.06 - (i * 0.009)).clamp(0.015, 0.08))
        ..style = PaintingStyle.stroke
        ..strokeWidth = 16.0 + (i * 4.0)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 12.0);

      canvas.drawCircle(center, radius, glowPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _Prominent3DLiquidRipplePainter oldDelegate) {
    return oldDelegate.pulseValue != pulseValue ||
        oldDelegate.expandProgress != expandProgress;
  }
}
