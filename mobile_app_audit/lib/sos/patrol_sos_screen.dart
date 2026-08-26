import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:accesseasy_shared/core/constants.dart';
import '../auth/guard_session_service.dart';
import '../device/device_profile_service.dart';
import '../offline/offline_event_queue.dart';

/// ─────────────────────────────────────────────────────────────
///  Patrol Emergency SOS Screen
///  Minimal Text • High Contrast • Icon-First • High Stress Ready
/// ─────────────────────────────────────────────────────────────

class PatrolSosScreen extends StatefulWidget {
  final String? initialCategory;

  const PatrolSosScreen({super.key, this.initialCategory});

  @override
  State<PatrolSosScreen> createState() => _PatrolSosScreenState();
}

class _PatrolSosScreenState extends State<PatrolSosScreen> with TickerProviderStateMixin {
  // SOS State
  bool _isSosTriggered = false;
  bool _isCountingDown = false;
  int _countdownSeconds = 5;
  Timer? _countdownTimer;
  Timer? _broadcastTimer;
  int _broadcastDurationSeconds = 0;

  // Selected Emergency Category
  String _selectedCategory = 'THREAT';

  // Audio Recording (Hands-Free Voice Note)
  final AudioRecorder _audioRecorder = AudioRecorder();
  bool _isRecordingVoice = false;
  int _voiceRecordDuration = 0;
  Timer? _voiceTimer;
  String? _recordedVoicePath;

  // Live Telemetry
  Position? _currentPosition;
  bool _isGpsLocked = false;
  StreamSubscription<Position>? _positionStream;

  // Visual Screen Strobe / Flash
  bool _isStrobeActive = false;
  Timer? _strobeTimer;
  bool _strobeWhite = false;

  // Hold-to-activate Animation Controller
  late AnimationController _holdController;

  final List<_EmergencyCategory> _categories = const [
    _EmergencyCategory(
      id: 'THREAT',
      label: 'INTRUDER',
      icon: LucideIcons.shieldAlert,
      color: Color(0xFFEF4444),
      description: 'Intruder / Threat / Trespass',
    ),
    _EmergencyCategory(
      id: 'MEDICAL',
      label: 'MEDICAL',
      icon: LucideIcons.heartPulse,
      color: Color(0xFFF43F5E),
      description: 'Injury / Unconscious / Illness',
    ),
    _EmergencyCategory(
      id: 'FIRE',
      label: 'FIRE',
      icon: LucideIcons.flame,
      color: Color(0xFFF97316),
      description: 'Fire / Smoke / Gas Leak',
    ),
    _EmergencyCategory(
      id: 'DURESS',
      label: 'DURESS',
      icon: LucideIcons.userX,
      color: Color(0xFFDC2626),
      description: 'Officer Under Attack',
    ),
    _EmergencyCategory(
      id: 'HAZARD',
      label: 'HAZARD',
      icon: LucideIcons.triangleAlert,
      color: Color(0xFFEAB308),
      description: 'Spill / Structural Hazard',
    ),
    _EmergencyCategory(
      id: 'BACKUP',
      label: 'BACKUP',
      icon: LucideIcons.users,
      color: Color(0xFF8B5CF6),
      description: 'Urgent Officer Assistance',
    ),
  ];

  @override
  void initState() {
    super.initState();
    if (widget.initialCategory != null) {
      _selectedCategory = widget.initialCategory!;
    }

    _holdController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          _startCountdownToSos();
        }
      });

    _initGps();
  }

  @override
  void dispose() {
    _holdController.dispose();
    _countdownTimer?.cancel();
    _broadcastTimer?.cancel();
    _voiceTimer?.cancel();
    _strobeTimer?.cancel();
    _positionStream?.cancel();
    _audioRecorder.dispose();
    super.dispose();
  }

  // ── GPS Tracking ───────────────────────────────────────────

  Future<void> _initGps() async {
    try {
      final perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        await Geolocator.requestPermission();
      }

      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      ).timeout(const Duration(seconds: 4));

      if (mounted) {
        setState(() {
          _currentPosition = pos;
          _isGpsLocked = true;
        });
      }
    } catch (_) {}

    _positionStream = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 5,
      ),
    ).listen((pos) {
      if (mounted) {
        setState(() {
          _currentPosition = pos;
          _isGpsLocked = true;
        });
      }
    });
  }

  // ── Countdown & Trigger ────────────────────────────────────

  void _startCountdownToSos() {
    HapticFeedback.heavyImpact();
    setState(() {
      _isCountingDown = true;
      _countdownSeconds = 5;
    });

    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      HapticFeedback.mediumImpact();
      if (_countdownSeconds > 1) {
        setState(() => _countdownSeconds--);
      } else {
        _countdownTimer?.cancel();
        setState(() => _isCountingDown = false);
        _dispatchSosAlert();
      }
    });
  }

  void _cancelCountdown() {
    HapticFeedback.selectionClick();
    _countdownTimer?.cancel();
    setState(() {
      _isCountingDown = false;
      _countdownSeconds = 5;
    });
  }

  // ── SOS Dispatch Logic ─────────────────────────────────────

  Future<void> _dispatchSosAlert() async {
    HapticFeedback.heavyImpact();
    setState(() {
      _isSosTriggered = true;
      _broadcastDurationSeconds = 0;
    });

    // Start live broadcast timer
    _broadcastTimer?.cancel();
    _broadcastTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _broadcastDurationSeconds++);
    });

    // Auto-stop voice recording if running
    if (_isRecordingVoice) {
      await _stopVoiceRecording();
    }

    final activeGuard = GuardSessionService().activeSession;
    final deviceProfile = DeviceProfileService().currentProfile;
    final categoryObj = _categories.firstWhere(
      (c) => c.id == _selectedCategory,
      orElse: () => _categories.first,
    );

    // 1. Upload audio if voice note recorded
    String? uploadedAudioUrl;
    if (_recordedVoicePath != null && _recordedVoicePath!.isNotEmpty && File(_recordedVoicePath!).existsSync() && token != null) {
      try {
        var fileReq = http.MultipartRequest('POST', Uri.parse('$kBaseUrl/files'));
        fileReq.headers['Authorization'] = 'Bearer $token';
        final filename = 'sos_voice_${DateTime.now().millisecondsSinceEpoch}.m4a';
        fileReq.files.add(
          await http.MultipartFile.fromPath('file', _recordedVoicePath!, filename: filename),
        );

        var streamedResponse = await fileReq.send();
        var uploadRes = await http.Response.fromStream(streamedResponse);
        if (uploadRes.statusCode == 200 || uploadRes.statusCode == 201) {
          final fileData = jsonDecode(uploadRes.body);
          final fileId = fileData['data']['id'];
          uploadedAudioUrl = '$kBaseUrl/assets/$fileId';
        }
      } catch (e) {
        debugPrint('[PatrolSosScreen] Audio upload error: $e');
      }
    }

    // 2. Transmit to Backend API
    bool apiSuccess = false;
    try {
      if (token != null) {
        final res = await http.post(
          Uri.parse('$kBaseUrl/items/patrol_alerts'),
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({
            'tenant': tenant ?? deviceProfile?.tenant ?? 'default',
            'title': '🚨 EMERGENCY SOS: ${categoryObj.label} by ${activeGuard?.guardName ?? 'Guard'}',
            'type': categoryObj.label,
            'severity': 'critical',
            'location': deviceProfile?.boundSiteName ?? 'Patrol Terminal',
            'description': uploadedAudioUrl != null
                ? 'EMERGENCY SOS [${categoryObj.description}] with voice note.'
                : 'EMERGENCY SOS [${categoryObj.description}] from patrol device.',
            'latitude': _currentPosition?.latitude,
            'longitude': _currentPosition?.longitude,
            'gps_accuracy': _currentPosition?.accuracy,
            'device_id': deviceProfile?.deviceId,
            'guard_session_id': activeGuard?.sessionId,
            'reported_by': activeGuard?.guardName ?? 'Mobile Guard',
            'status': 'open',
            if (uploadedAudioUrl != null) 'audio_url': uploadedAudioUrl,
          }),
        );
        if (res.statusCode == 200 || res.statusCode == 201) {
          apiSuccess = true;
        }
      }
    } catch (e) {
      debugPrint('[PatrolSosScreen] Direct API Error: $e');
    }

    // 3. Fallback / Parallel: Offline Event Queue Persistence
    await OfflineEventQueue().recordEvent(
      eventType: 'sos_triggered',
      gpsLat: _currentPosition?.latitude,
      gpsLng: _currentPosition?.longitude,
      gpsAccuracy: _currentPosition?.accuracy,
      payload: {
        'category': categoryObj.id,
        'category_label': categoryObj.label,
        'audio_path': _recordedVoicePath,
        'is_api_synced': apiSuccess,
        'timestamp': DateTime.now().toIso8601String(),
        'site': deviceProfile?.boundSiteName,
        'guard': activeGuard?.guardName,
      },
    );
  }

  // ── Stand Down / Resolve SOS ───────────────────────────────

  Future<void> _standDownSos() async {
    HapticFeedback.mediumImpact();
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(LucideIcons.checkCircle2, color: Color(0xFF22C55E), size: 24),
            const SizedBox(width: 10),
            Text(
              'STAND DOWN',
              style: GoogleFonts.inter(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 16,
              ),
            ),
          ],
        ),
        content: Text(
          'Confirm resolution and notify Control Room that the emergency has ended?',
          style: GoogleFonts.inter(color: const Color(0xFF94A3B8), fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(
              'CANCEL',
              style: GoogleFonts.inter(color: Colors.white60, fontWeight: FontWeight.w600),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF22C55E),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(
              'CONFIRM RESOLVED',
              style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w800),
            ),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      _broadcastTimer?.cancel();
      setState(() {
        _isSosTriggered = false;
        _broadcastDurationSeconds = 0;
      });
      HapticFeedback.lightImpact();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Emergency alert closed. Status transmitted to HQ.',
            style: GoogleFonts.inter(fontWeight: FontWeight.w600),
          ),
          backgroundColor: const Color(0xFF16A34A),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  // ── Voice Memo (Hands-Free Zero Typing) ─────────────────────

  Future<void> _toggleVoiceRecording() async {
    if (_isRecordingVoice) {
      await _stopVoiceRecording();
    } else {
      await _startVoiceRecording();
    }
  }

  Future<void> _startVoiceRecording() async {
    try {
      if (await _audioRecorder.hasPermission()) {
        HapticFeedback.mediumImpact();
        final dir = await getTemporaryDirectory();
        final path = '${dir.path}/sos_voice_${DateTime.now().millisecondsSinceEpoch}.m4a';

        await _audioRecorder.start(
          const RecordConfig(encoder: AudioEncoder.aacLc),
          path: path,
        );

        setState(() {
          _isRecordingVoice = true;
          _voiceRecordDuration = 0;
          _recordedVoicePath = path;
        });

        _voiceTimer?.cancel();
        _voiceTimer = Timer.periodic(const Duration(seconds: 1), (_) {
          if (mounted && _isRecordingVoice) {
            setState(() => _voiceRecordDuration++);
          }
        });
      }
    } catch (e) {
      debugPrint('[PatrolSosScreen] Voice Record Start Error: $e');
    }
  }

  Future<void> _stopVoiceRecording() async {
    _voiceTimer?.cancel();
    if (!_isRecordingVoice) return;
    try {
      final path = await _audioRecorder.stop();
      if (path != null) {
        _recordedVoicePath = path;
      }
    } catch (_) {}
    HapticFeedback.lightImpact();
    setState(() => _isRecordingVoice = false);
  }

  // ── Emergency Direct Speed Dial ────────────────────────────

  Future<void> _callEmergencyNumber(String number) async {
    HapticFeedback.heavyImpact();
    final uri = Uri(scheme: 'tel', path: number);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      }
    } catch (e) {
      debugPrint('[PatrolSosScreen] Direct Dial Error: $e');
    }
  }

  // ── Emergency Screen Strobe ────────────────────────────────

  void _toggleStrobe() {
    HapticFeedback.mediumImpact();
    setState(() {
      _isStrobeActive = !_isStrobeActive;
    });

    if (_isStrobeActive) {
      _strobeTimer?.cancel();
      _strobeTimer = Timer.periodic(const Duration(milliseconds: 160), (_) {
        if (mounted && _isStrobeActive) {
          setState(() => _strobeWhite = !_strobeWhite);
        }
      });
    } else {
      _strobeTimer?.cancel();
      setState(() => _strobeWhite = false);
    }
  }

  // ── Formatting ─────────────────────────────────────────────

  String _formatTimer(int totalSeconds) {
    final minutes = (totalSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final activeGuard = GuardSessionService().activeSession;
    final deviceProfile = DeviceProfileService().currentProfile;

    final backgroundColor = _isStrobeActive
        ? (_strobeWhite ? const Color(0xFFEF4444) : const Color(0xFFFFFFFF))
        : const Color(0xFF0A0D14);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        systemNavigationBarColor: Color(0xFF0A0D14),
        systemNavigationBarIconBrightness: Brightness.light,
      ),
      child: Scaffold(
        backgroundColor: backgroundColor,
        body: SafeArea(
          child: _isSosTriggered ? _buildActiveSosBroadcastView() : _buildPrepareSosView(activeGuard, deviceProfile),
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  1. PREPARE SOS VIEW (Tactile, Low Text, High Speed)
  // ─────────────────────────────────────────────────────────────

  Widget _buildPrepareSosView(GuardSession? activeGuard, DeviceProfile? deviceProfile) {
    return Stack(
      children: [
        Column(
          children: [
            // ── Top Action Bar ──────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  // Back Button
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(LucideIcons.arrowLeft, color: Colors.white, size: 22),
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.white.withValues(alpha: 0.1),
                      padding: const EdgeInsets.all(10),
                    ),
                  ),
                  const SizedBox(width: 10),

                  // Header Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Color(0xFFEF4444),
                            shape: BoxShape.circle,
                          ),
                        )
                            .animate(onPlay: (c) => c.repeat(reverse: true))
                            .scale(begin: const Offset(1, 1), end: const Offset(1.4, 1.4), duration: 400.ms),
                        const SizedBox(width: 6),
                        Text(
                          'EMERGENCY SOS',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.8,
                            color: const Color(0xFFFCA5A5),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),

                  // Strobe Button
                  IconButton(
                    onPressed: _toggleStrobe,
                    icon: Icon(
                      _isStrobeActive ? LucideIcons.flashlightOff : LucideIcons.flashlight,
                      color: _isStrobeActive ? Colors.yellowAccent : Colors.white,
                      size: 20,
                    ),
                    style: IconButton.styleFrom(
                      backgroundColor: _isStrobeActive
                          ? Colors.yellow.withValues(alpha: 0.3)
                          : Colors.white.withValues(alpha: 0.1),
                      padding: const EdgeInsets.all(10),
                    ),
                  ),
                ],
              ),
            ),

            // ── Live Telemetry Strip ────────────────────────
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF141923),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
              ),
              child: Row(
                children: [
                  Icon(
                    _isGpsLocked ? LucideIcons.mapPinCheck : LucideIcons.mapPinOff,
                    size: 16,
                    color: _isGpsLocked ? const Color(0xFF22C55E) : const Color(0xFFF59E0B),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    _isGpsLocked
                        ? 'GPS ±${_currentPosition?.accuracy.toStringAsFixed(0) ?? '3'}m'
                        : 'Locating...',
                    style: GoogleFonts.inter(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: Colors.white70,
                    ),
                  ),
                  const Spacer(),
                  const Icon(LucideIcons.shield, size: 14, color: Color(0xFF94A3B8)),
                  const SizedBox(width: 4),
                  Text(
                    activeGuard?.guardName.split(' ').first ?? 'Guard',
                    style: GoogleFonts.inter(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: Colors.white70,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 6),

            // ── Main Scrollable Interactive Center ──────────
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  children: [
                    const SizedBox(height: 12),

                    // ── Hero SOS Big Button ─────────────────
                    _buildHeroSosButton(),

                    const SizedBox(height: 24),

                    // ── Category Grid (Icon-Driven) ─────────
                    _buildCategoryGrid(),

                    const SizedBox(height: 18),

                    // ── Hands-Free Audio Recorder ───────────
                    _buildVoiceRecorderCard(),

                    const SizedBox(height: 20),

                    // ── Speed-Dial Direct Emergency Hotlines
                    _buildSpeedDialHotlines(),

                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ],
        ),

        // ── Countdown Overlay Screen ─────────────────────────
        if (_isCountingDown) _buildCountdownOverlay(),
      ],
    );
  }

  // ── Hero Pulsing SOS Tactile Button ─────────────────────────

  Widget _buildHeroSosButton() {
    return Center(
      child: GestureDetector(
        onTapDown: (_) {
          HapticFeedback.heavyImpact();
          _holdController.forward();
        },
        onTapUp: (_) {
          if (_holdController.status != AnimationStatus.completed) {
            _holdController.reverse();
            // Single tap: also offers instant countdown
            _startCountdownToSos();
          }
        },
        onTapCancel: () {
          _holdController.reverse();
        },
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Outer Concentric Radar Waves
            Container(
              width: 178,
              height: 178,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFEF4444).withValues(alpha: 0.12),
              ),
            )
                .animate(onPlay: (c) => c.repeat())
                .scale(begin: const Offset(1, 1), end: const Offset(1.35, 1.35), duration: 1800.ms)
                .fadeOut(duration: 1800.ms),

            Container(
              width: 154,
              height: 154,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFEF4444).withValues(alpha: 0.22),
              ),
            )
                .animate(onPlay: (c) => c.repeat())
                .scale(begin: const Offset(1, 1), end: const Offset(1.22, 1.22), duration: 1200.ms)
                .fadeOut(duration: 1200.ms),

            // Animated Circular Progress Border
            AnimatedBuilder(
              animation: _holdController,
              builder: (context, child) {
                return SizedBox(
                  width: 136,
                  height: 136,
                  child: CircularProgressIndicator(
                    value: _holdController.value > 0 ? _holdController.value : null,
                    strokeWidth: 5,
                    backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.25),
                    valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                );
              },
            ),

            // Inner Vibrant Button Core
            Container(
              width: 124,
              height: 124,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const RadialGradient(
                  colors: [
                    Color(0xFFFF4D4D),
                    Color(0xFFDC2626),
                    Color(0xFF991B1B),
                  ],
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFEF4444).withValues(alpha: 0.6),
                    blurRadius: 28,
                    spreadRadius: 4,
                  ),
                ],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(LucideIcons.siren, color: Colors.white, size: 36),
                  const SizedBox(height: 2),
                  Text(
                    'SOS',
                    style: GoogleFonts.outfit(
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.5,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    'TAP / HOLD',
                    style: GoogleFonts.inter(
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                      color: Colors.white70,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Emergency Category Grid (2x3 Visual Grid) ───────────────

  Widget _buildCategoryGrid() {
    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: _categories.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 1.12,
      ),
      itemBuilder: (context, index) {
        final cat = _categories[index];
        final isSelected = _selectedCategory == cat.id;

        return GestureDetector(
          onTap: () {
            HapticFeedback.selectionClick();
            setState(() => _selectedCategory = cat.id);
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            decoration: BoxDecoration(
              color: isSelected ? cat.color.withValues(alpha: 0.22) : const Color(0xFF131823),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isSelected ? cat.color : Colors.white.withValues(alpha: 0.08),
                width: isSelected ? 2 : 1,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: cat.color.withValues(alpha: 0.4),
                        blurRadius: 14,
                        spreadRadius: 1,
                      )
                    ]
                  : [],
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  cat.icon,
                  size: 28,
                  color: isSelected ? cat.color : Colors.white70,
                ),
                const SizedBox(height: 6),
                Text(
                  cat.label,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: isSelected ? FontWeight.w900 : FontWeight.w700,
                    color: isSelected ? Colors.white : Colors.white60,
                    letterSpacing: 0.4,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // ── Voice Note Hands-Free Recorder Card ─────────────────────

  Widget _buildVoiceRecorderCard() {
    final hasAudio = _recordedVoicePath != null && File(_recordedVoicePath!).existsSync();

    return GestureDetector(
      onTap: _toggleVoiceRecording,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: _isRecordingVoice
              ? const Color(0xFF991B1B).withValues(alpha: 0.35)
              : const Color(0xFF131823),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: _isRecordingVoice
                ? const Color(0xFFEF4444)
                : (hasAudio ? const Color(0xFF22C55E) : Colors.white.withValues(alpha: 0.08)),
            width: _isRecordingVoice || hasAudio ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: _isRecordingVoice
                    ? const Color(0xFFEF4444)
                    : (hasAudio
                        ? const Color(0xFF22C55E).withValues(alpha: 0.2)
                        : Colors.white.withValues(alpha: 0.08)),
                shape: BoxShape.circle,
              ),
              child: Icon(
                _isRecordingVoice ? LucideIcons.square : LucideIcons.mic,
                color: _isRecordingVoice
                    ? Colors.white
                    : (hasAudio ? const Color(0xFF22C55E) : Colors.white70),
                size: 18,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _isRecordingVoice
                        ? 'RECORDING (${_voiceRecordDuration}s)'
                        : (hasAudio ? 'VOICE NOTE ATTACHED' : 'TAP FOR VOICE MEMO'),
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: _isRecordingVoice
                          ? const Color(0xFFFCA5A5)
                          : (hasAudio ? const Color(0xFF86EFAC) : Colors.white),
                      letterSpacing: 0.5,
                    ),
                  ),
                  Text(
                    _isRecordingVoice
                        ? 'Speak clearly into microphone'
                        : (hasAudio ? 'Will send audio with SOS' : 'No typing required'),
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: Colors.white54,
                    ),
                  ),
                ],
              ),
            ),
            if (_isRecordingVoice)
              Container(
                width: 10,
                height: 10,
                decoration: const BoxDecoration(
                  color: Color(0xFFEF4444),
                  shape: BoxShape.circle,
                ),
              )
                  .animate(onPlay: (c) => c.repeat(reverse: true))
                  .scale(begin: const Offset(1, 1), end: const Offset(1.5, 1.5), duration: 300.ms)
            else if (hasAudio)
              const Icon(LucideIcons.checkCircle2, color: Color(0xFF22C55E), size: 18),
          ],
        ),
      ),
    );
  }

  // ── Direct Speed Dial Hotlines ──────────────────────────────

  Widget _buildSpeedDialHotlines() {
    final contacts = [
      _HotlineItem(
        label: 'DISPATCH',
        number: '1800-PATROL',
        icon: LucideIcons.headset,
        color: const Color(0xFF3B82F6),
      ),
      _HotlineItem(
        label: 'POLICE',
        number: '112',
        icon: LucideIcons.shieldAlert,
        color: const Color(0xFFEF4444),
      ),
      _HotlineItem(
        label: 'AMBULANCE',
        number: '108',
        icon: LucideIcons.heartHandshake,
        color: const Color(0xFFEC4899),
      ),
      _HotlineItem(
        label: 'FIRE',
        number: '101',
        icon: LucideIcons.flame,
        color: const Color(0xFFF97316),
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            'DIRECT SPEED DIAL',
            style: GoogleFonts.inter(
              fontSize: 10.5,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.8,
              color: Colors.white54,
            ),
          ),
        ),
        Row(
          children: contacts.map((c) {
            return Expanded(
              child: GestureDetector(
                onTap: () => _callEmergencyNumber(c.number),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    color: c.color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: c.color.withValues(alpha: 0.35)),
                  ),
                  child: Column(
                    children: [
                      Icon(c.icon, color: c.color, size: 20),
                      const SizedBox(height: 4),
                      Text(
                        c.label,
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        c.number,
                        style: GoogleFonts.inter(
                          fontSize: 8.5,
                          fontWeight: FontWeight.w700,
                          color: Colors.white60,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  // ── 5-Second False Alarm Buffer Overlay ─────────────────────

  Widget _buildCountdownOverlay() {
    return Container(
      color: Colors.black.withValues(alpha: 0.88),
      padding: const EdgeInsets.all(24),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFEF4444).withValues(alpha: 0.2),
                border: Border.all(color: const Color(0xFFEF4444), width: 3),
              ),
              child: Center(
                child: Text(
                  '$_countdownSeconds',
                  style: GoogleFonts.outfit(
                    fontSize: 64,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                )
                    .animate(onPlay: (c) => c.repeat())
                    .scale(begin: const Offset(1, 1), end: const Offset(1.15, 1.15), duration: 500.ms),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'SENDING EMERGENCY SOS',
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                letterSpacing: 1,
                color: const Color(0xFFFCA5A5),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Broadcasting GPS & Category to Control Room',
              style: GoogleFonts.inter(fontSize: 12, color: Colors.white60),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF334155),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
                onPressed: _cancelCountdown,
                icon: const Icon(LucideIcons.x, size: 20),
                label: Text(
                  'CANCEL (FALSE ALARM)',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFEF4444),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: () {
                  _countdownTimer?.cancel();
                  setState(() => _isCountingDown = false);
                  _dispatchSosAlert();
                },
                icon: const Icon(LucideIcons.send, size: 18),
                label: Text(
                  'SEND IMMEDIATELY',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  2. ACTIVE SOS BROADCAST DASHBOARD (Post-Dispatch)
  // ─────────────────────────────────────────────────────────────

  Widget _buildActiveSosBroadcastView() {
    final categoryObj = _categories.firstWhere(
      (c) => c.id == _selectedCategory,
      orElse: () => _categories.first,
    );

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        children: [
          // ── Flashing Top Banner ───────────────────────────
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
            decoration: BoxDecoration(
              color: const Color(0xFFEF4444),
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFEF4444).withValues(alpha: 0.6),
                  blurRadius: 20,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.siren, color: Colors.white, size: 28)
                    .animate(onPlay: (c) => c.repeat(reverse: true))
                    .rotate(begin: -0.05, end: 0.05, duration: 250.ms),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'SOS BROADCAST ACTIVE',
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: 0.8,
                        ),
                      ),
                      Text(
                        'Control Room Dispatched • Live GPS Beacon',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Colors.white.withValues(alpha: 0.9),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // ── Broadcast Timer Circle ────────────────────────
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFF141923),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.4), width: 2),
            ),
            child: Column(
              children: [
                Icon(categoryObj.icon, size: 36, color: categoryObj.color),
                const SizedBox(height: 6),
                Text(
                  _formatTimer(_broadcastDurationSeconds),
                  style: GoogleFonts.outfit(
                    fontSize: 32,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
                Text(
                  categoryObj.label,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: categoryObj.color,
                    letterSpacing: 0.8,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // ── Telemetry Details ─────────────────────────────
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF131823),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    const Icon(LucideIcons.mapPin, color: Color(0xFF22C55E), size: 18),
                    const SizedBox(width: 10),
                    Text(
                      'GPS Position',
                      style: GoogleFonts.inter(color: Colors.white60, fontSize: 12),
                    ),
                    const Spacer(),
                    Text(
                      _currentPosition != null
                          ? '${_currentPosition!.latitude.toStringAsFixed(5)}, ${_currentPosition!.longitude.toStringAsFixed(5)}'
                          : 'Acquiring...',
                      style: GoogleFonts.inter(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                const Divider(color: Colors.white10, height: 20),
                Row(
                  children: [
                    const Icon(LucideIcons.radio, color: Color(0xFF38BDF8), size: 18),
                    const SizedBox(width: 10),
                    Text(
                      'Transmission',
                      style: GoogleFonts.inter(color: Colors.white60, fontSize: 12),
                    ),
                    const Spacer(),
                    Text(
                      'Transmitted & Queued',
                      style: GoogleFonts.inter(
                        color: const Color(0xFF38BDF8),
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const Spacer(),

          // ── Direct Call Control Room ──────────────────────
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF3B82F6),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: () => _callEmergencyNumber('1800-PATROL'),
              icon: const Icon(LucideIcons.phoneCall, size: 20),
              label: Text(
                'CALL CONTROL ROOM NOW',
                style: GoogleFonts.inter(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),

          const SizedBox(height: 12),

          // ── Stand Down / Resolve Button ───────────────────
          SizedBox(
            width: double.infinity,
            height: 50,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF22C55E),
                side: const BorderSide(color: Color(0xFF22C55E), width: 1.5),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: _standDownSos,
              icon: const Icon(LucideIcons.checkCheck, size: 18),
              label: Text(
                'RESOLVE / STAND DOWN',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _EmergencyCategory {
  final String id;
  final String label;
  final IconData icon;
  final Color color;
  final String description;

  const _EmergencyCategory({
    required this.id,
    required this.label,
    required this.icon,
    required this.color,
    required this.description,
  });
}

class _HotlineItem {
  final String label;
  final String number;
  final IconData icon;
  final Color color;

  const _HotlineItem({
    required this.label,
    required this.number,
    required this.icon,
    required this.color,
  });
}
