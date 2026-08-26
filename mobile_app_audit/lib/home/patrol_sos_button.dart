import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';

import 'package:accesseasy_shared/core/constants.dart';
import '../auth/guard_session_service.dart';
import '../device/device_profile_service.dart';
import '../sos/patrol_sos_screen.dart';

class PatrolSosButton extends StatefulWidget {
  const PatrolSosButton({super.key});

  @override
  State<PatrolSosButton> createState() => _PatrolSosButtonState();
}

class _PatrolSosButtonState extends State<PatrolSosButton> with SingleTickerProviderStateMixin {
  final AudioRecorder _audioRecorder = AudioRecorder();
  bool _isRecording = false;
  DateTime? _recordStartTime;
  Timer? _recordTimer;
  int _recordSeconds = 0;
  String? _recordedAudioPath;

  @override
  void dispose() {
    _recordTimer?.cancel();
    _audioRecorder.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    try {
      if (await _audioRecorder.hasPermission()) {
        HapticFeedback.heavyImpact();
        final dir = await getTemporaryDirectory();
        final path = '${dir.path}/sos_voice_${DateTime.now().millisecondsSinceEpoch}.m4a';

        await _audioRecorder.start(
          const RecordConfig(encoder: AudioEncoder.aacLc),
          path: path,
        );

        setState(() {
          _isRecording = true;
          _recordSeconds = 0;
          _recordedAudioPath = path;
          _recordStartTime = DateTime.now();
        });

        _recordTimer?.cancel();
        _recordTimer = Timer.periodic(const Duration(seconds: 1), (_) {
          if (mounted && _isRecording) {
            setState(() => _recordSeconds++);
          }
        });
      }
    } catch (e) {
      debugPrint('[PatrolSosButton] Start Record Error: $e');
    }
  }

  Future<void> _stopRecordingAndShowConfirmation() async {
    _recordTimer?.cancel();
    if (!_isRecording) return;

    final duration = _recordStartTime != null
        ? DateTime.now().difference(_recordStartTime!).inMilliseconds
        : 0;

    String? path;
    try {
      path = await _audioRecorder.stop();
    } catch (_) {}

    setState(() {
      _isRecording = false;
    });

    if (duration < 600) {
      // Single quick tap: Open full Emergency SOS page
      HapticFeedback.heavyImpact();
      if (mounted) {
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const PatrolSosScreen()),
        );
      }
      return;
    }

    HapticFeedback.vibrate();
    final actualPath = path ?? _recordedAudioPath;

    if (mounted) {
      _showSosConfirmationDialog(actualPath, _recordSeconds);
    }
  }

  Future<void> _cancelRecording() async {
    _recordTimer?.cancel();
    if (_isRecording) {
      try {
        await _audioRecorder.stop();
      } catch (_) {}
      setState(() => _isRecording = false);
    }
  }

  Future<void> _showSosConfirmationDialog(String? audioPath, int seconds) async {
    final confirmed = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _SosSendConfirmationModal(
        audioPath: audioPath,
        audioDurationSeconds: seconds,
      ),
    );

    if (confirmed == true && mounted) {
      _triggerSosAlert(audioPath);
    }
  }

  Future<void> _triggerSosAlert(String? audioPath) async {
    HapticFeedback.heavyImpact();

    // Get live GPS coordinates
    Position? pos;
    try {
      pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );
    } catch (_) {}

    final activeGuard = GuardSessionService().activeSession;
    final deviceProfile = DeviceProfileService().currentProfile;

    String? uploadedAudioUrl;

    // Upload audio file if recorded
    if (audioPath != null && File(audioPath).existsSync() && token != null) {
      try {
        var fileReq = http.MultipartRequest('POST', Uri.parse('$kBaseUrl/files'));
        fileReq.headers['Authorization'] = 'Bearer $token';
        final filename = 'sos_voice_${DateTime.now().millisecondsSinceEpoch}.m4a';
        fileReq.files.add(await http.MultipartFile.fromPath('file', audioPath, filename: filename));

        var streamedResponse = await fileReq.send();
        var uploadRes = await http.Response.fromStream(streamedResponse);
        if (uploadRes.statusCode == 200 || uploadRes.statusCode == 201) {
          final fileData = jsonDecode(uploadRes.body);
          final fileId = fileData['data']['id'];
          uploadedAudioUrl = '$kBaseUrl/assets/$fileId';
        }
      } catch (e) {
        debugPrint('[PatrolSosButton] Upload Audio Error: $e');
      }
    }

    try {
      if (token != null) {
        await http.post(
          Uri.parse('$kBaseUrl/items/patrol_alerts'),
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({
            'tenant': tenant ?? deviceProfile?.tenant ?? 'default',
            'title': '🚨 EMERGENCY SOS TRIGGERED by ${activeGuard?.guardName ?? 'Guard'}',
            'type': 'Emergency SOS',
            'severity': 'critical',
            'location': deviceProfile?.boundSiteName ?? 'Patrol Terminal',
            'description': uploadedAudioUrl != null
                ? 'EMERGENCY SOS with Voice Message attachment.'
                : 'EMERGENCY SOS activated from shared patrol device.',
            'latitude': pos?.latitude,
            'longitude': pos?.longitude,
            'gps_accuracy': pos?.accuracy,
            'device_id': deviceProfile?.deviceId,
            'guard_session_id': activeGuard?.sessionId,
            'reported_by': activeGuard?.guardName ?? 'Mobile Guard',
            'status': 'open',
            if (uploadedAudioUrl != null) 'audio_url': uploadedAudioUrl,
          }),
        );
      }
    } catch (e) {
      debugPrint('[PatrolSosButton] Alert Dispatch Error: $e');
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.warning_amber_rounded, color: Colors.white),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  uploadedAudioUrl != null
                      ? '🚨 EMERGENCY SOS & VOICE NOTE TRANSMITTED TO CONTROL ROOM!'
                      : '🚨 EMERGENCY SOS DISPATCHED TO CONTROL ROOM!',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          backgroundColor: const Color(0xFFDC2626),
          duration: const Duration(seconds: 6),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // Hide whenever keyboard is open so it never covers form inputs
    final isKeyboardOpen = MediaQuery.of(context).viewInsets.bottom > 0;
    if (isKeyboardOpen) {
      return const SizedBox.shrink();
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        // Pulsing Live Voice Recording Pill when pressed
        if (_isRecording) ...[
          Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF991B1B),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFEF4444), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFEF4444).withValues(alpha: 0.5),
                  blurRadius: 16,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                )
                    .animate(onPlay: (c) => c.repeat(reverse: true))
                    .scale(begin: const Offset(1, 1), end: const Offset(1.4, 1.4), duration: 400.ms),
                const SizedBox(width: 8),
                Text(
                  '🎙️ Recording (${_recordSeconds}s) • Release to Send',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ],

        // Press & Release SOS Button
        GestureDetector(
          onTapDown: (_) => _startRecording(),
          onTapUp: (_) => _stopRecordingAndShowConfirmation(),
          onTapCancel: () => _cancelRecording(),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Outer Glowing Pulsing Ring
              Container(
                width: _isRecording ? 72 : 62,
                height: _isRecording ? 72 : 62,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFFDC2626).withValues(alpha: _isRecording ? 0.5 : 0.2),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFDC2626).withValues(alpha: _isRecording ? 0.7 : 0.3),
                      blurRadius: _isRecording ? 24 : 10,
                      spreadRadius: _isRecording ? 6 : 1,
                    ),
                  ],
                ),
              ),

              // Inner Button Body
              AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                width: _isRecording ? 60 : 52,
                height: _isRecording ? 60 : 52,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: _isRecording
                        ? [const Color(0xFFF87171), const Color(0xFFDC2626)]
                        : [const Color(0xFFEF4444), const Color(0xFFB91C1C)],
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (_isRecording) ...[
                      const Icon(Icons.mic_rounded, color: Colors.white, size: 24),
                      Text(
                        'RELEASE',
                        style: GoogleFonts.inter(
                          fontSize: 8,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ] else ...[
                      Text(
                        'SOS',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Text(
                        'EMERGENCY',
                        style: GoogleFonts.inter(
                          fontSize: 6.5,
                          fontWeight: FontWeight.w800,
                          color: Colors.white.withValues(alpha: 0.85),
                          letterSpacing: 0.3,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  Send Confirmation Modal (Appears upon releasing the button)
// ─────────────────────────────────────────────────────────────

class _SosSendConfirmationModal extends StatefulWidget {
  final String? audioPath;
  final int audioDurationSeconds;

  const _SosSendConfirmationModal({
    this.audioPath,
    this.audioDurationSeconds = 0,
  });

  @override
  State<_SosSendConfirmationModal> createState() => _SosSendConfirmationModalState();
}

class _SosSendConfirmationModalState extends State<_SosSendConfirmationModal> {
  int _countdown = 6;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  void _startCountdown() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_countdown > 1) {
        setState(() => _countdown--);
      } else {
        _timer?.cancel();
        Navigator.of(context).pop(true); // Auto-confirm when timer expires
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hasAudio = widget.audioPath != null && widget.audioDurationSeconds > 0;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      decoration: const BoxDecoration(
        color: Color(0xFF1E1B1B),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(top: BorderSide(color: Color(0xFFDC2626), width: 2.5)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 18),

            // Pulsing Alarm Icon
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFDC2626).withValues(alpha: 0.2),
              ),
              child: const Icon(
                Icons.warning_rounded,
                size: 44,
                color: Color(0xFFEF4444),
              )
                  .animate(onPlay: (controller) => controller.repeat(reverse: true))
                  .scale(begin: const Offset(1, 1), end: const Offset(1.16, 1.16), duration: 600.ms),
            ),
            const SizedBox(height: 14),

            Text(
              'Send Emergency SOS?',
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 6),

            Text(
              'Alerts command center and transmits your live GPS location.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 12.5,
                color: const Color(0xFFD1D5DB),
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),

            // Voice Note Captured Info Banner
            if (hasAudio) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFF991B1B).withValues(alpha: 0.35),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.6)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.mic_rounded, color: Color(0xFFFCA5A5), size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Voice note recorded (${widget.audioDurationSeconds}s)',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const Icon(Icons.check_circle_rounded, color: Color(0xFF22C55E), size: 18),
                  ],
                ),
              ),
              const SizedBox(height: 14),
            ],

            // Auto-send countdown indicator
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
              decoration: BoxDecoration(
                color: const Color(0xFF7F1D1D).withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFDC2626).withValues(alpha: 0.5)),
              ),
              child: Text(
                'Sending in ${_countdown}s',
                style: GoogleFonts.inter(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFFFCA5A5),
                ),
              ),
            ),
            const SizedBox(height: 20),

            Row(
              children: [
                // Cancel Button
                Expanded(
                  child: SizedBox(
                    height: 48,
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white70,
                        side: const BorderSide(color: Colors.white24),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {
                        _timer?.cancel();
                        Navigator.of(context).pop(false);
                      },
                      child: Text(
                        'Cancel',
                        style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),

                // Confirm SOS Button
                Expanded(
                  child: SizedBox(
                    height: 48,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFDC2626),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {
                        _timer?.cancel();
                        Navigator.of(context).pop(true);
                      },
                      icon: const Icon(Icons.send_rounded, size: 18),
                      label: Text(
                        'Send Now',
                        style: GoogleFonts.inter(fontWeight: FontWeight.w800, fontSize: 13),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
