import '../offline/offline_event_queue.dart';
import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';

import 'package:accesseasy_shared/core/constants.dart';
import '../auth/guard_session_service.dart';
import '../device/device_profile_service.dart';
import 'incident_history_screen.dart';

class IncidentScreen extends StatefulWidget {
  const IncidentScreen({Key? key}) : super(key: key);

  @override
  State<IncidentScreen> createState() => _IncidentScreenState();
}

class _IncidentScreenState extends State<IncidentScreen> {
  final _formKey = GlobalKey<FormState>();
  final ImagePicker _picker = ImagePicker();

  String _selectedType = 'Security';
  String _severity = 'Medium';
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  File? _imageFile;
  bool _isSubmitting = false;
  Position? _livePosition;

  final List<Map<String, dynamic>> _categories = [
    {'name': 'Security', 'icon': LucideIcons.shieldAlert, 'color': Color(0xFFEF4444)},
    {'name': 'Hazard', 'icon': LucideIcons.alertTriangle, 'color': Color(0xFFF59E0B)},
    {'name': 'Repair', 'icon': LucideIcons.wrench, 'color': Color(0xFF3B82F6)},
    {'name': 'Parking', 'icon': LucideIcons.car, 'color': Color(0xFF8B5CF6)},
    {'name': 'Medical', 'icon': LucideIcons.heartPulse, 'color': Color(0xFFEC4899)},
    {'name': 'Other', 'icon': LucideIcons.helpCircle, 'color': Color(0xFF64748B)},
  ];

  @override
  void initState() {
    super.initState();
    _fetchLiveLocation();
  }

  @override
  void dispose() {
    _locationController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _fetchLiveLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return;

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) return;
      }
      if (permission == LocationPermission.deniedForever) return;

      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      ).timeout(const Duration(seconds: 4));

      if (mounted) {
        setState(() => _livePosition = pos);
      }
    } catch (_) {}
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? photo = await _picker.pickImage(
        source: source,
        imageQuality: 75,
        maxWidth: 1280,
      );
      if (photo != null && mounted) {
        HapticFeedback.selectionClick();
        setState(() => _imageFile = File(photo.path));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error selecting image: $e')),
        );
      }
    }
  }

  void _showImageSourceSheet() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 36,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Text(
                'Add Incident Photo',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : const Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(LucideIcons.camera, color: Color(0xFF007AFF)),
                title: Text('Take Photo with Camera', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(LucideIcons.image, color: Color(0xFF10B981)),
                title: Text('Choose from Gallery', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.gallery);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submitReport() async {
    if (!_formKey.currentState!.validate()) {
      HapticFeedback.heavyImpact();
      return;
    }

    setState(() => _isSubmitting = true);
    HapticFeedback.mediumImpact();

    try {
      if (token == null) throw Exception('Not authenticated');

      String? uploadedImageUrl;

      if (_imageFile != null) {
        var fileReq = http.MultipartRequest('POST', Uri.parse('$kBaseUrl/files'));
        fileReq.headers['Authorization'] = 'Bearer $token';

        final filename = 'incident_${DateTime.now().millisecondsSinceEpoch}.jpg';
        fileReq.files.add(await http.MultipartFile.fromPath(
          'file',
          _imageFile!.path,
          filename: filename,
        ));

        var streamedResponse = await fileReq.send();
        var uploadRes = await http.Response.fromStream(streamedResponse);

        if (uploadRes.statusCode == 200 || uploadRes.statusCode == 201) {
          final fileData = jsonDecode(uploadRes.body);
          final fileId = fileData['data']['id'];
          uploadedImageUrl = '$kBaseUrl/assets/$fileId';
        }
      }

      final locationText = _locationController.text.trim().isNotEmpty
          ? _locationController.text.trim()
          : (_livePosition != null
              ? 'GPS (${_livePosition!.latitude.toStringAsFixed(4)}, ${_livePosition!.longitude.toStringAsFixed(4)})'
              : 'Perimeter');

      final response = await http.post(
        Uri.parse('$kBaseUrl/items/patrol_alerts'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'tenant': tenant ?? DeviceProfileService().currentProfile?.tenant ?? 'default',
          'title': '$_selectedType at $locationText',
          'type': _selectedType,
          'severity': _severity.toLowerCase(),
          'location': locationText,
          'description': _descController.text.trim(),
          'latitude': _livePosition?.latitude,
          'longitude': _livePosition?.longitude,
          'gps_accuracy': _livePosition?.accuracy,
          'device_id': DeviceProfileService().currentProfile?.deviceId,
          'guard_session_id': GuardSessionService().activeSession?.sessionId,
          'reported_by': GuardSessionService().activeSession?.guardName ?? 'Mobile Guard',
          'status': 'open',
          if (uploadedImageUrl != null) 'image_url': uploadedImageUrl,
        }),
      );

      if (response.statusCode != 200 && response.statusCode != 204 && response.statusCode != 201) {
        throw Exception('Server error (${response.statusCode})');
      }

      if (mounted) {
        HapticFeedback.lightImpact();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                const SizedBox(width: 10),
                Text('Incident reported to Control Room', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
              ],
            ),
            backgroundColor: const Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
        );

        setState(() {
          _locationController.clear();
          _descController.clear();
          _imageFile = null;
          _severity = 'Medium';
          _selectedType = 'Security';
        });
      }
    } catch (e) {
      // Record in offline queue for automatic synchronization
      try {
        final locStr = _locationController.text.trim().isNotEmpty
            ? _locationController.text.trim()
            : (_livePosition != null ? 'GPS (${_livePosition!.latitude.toStringAsFixed(4)}, ${_livePosition!.longitude.toStringAsFixed(4)})' : 'Perimeter');
        final imagePath = _imageFile?.path;
        await OfflineEventQueue().recordEvent(
          eventType: 'incident_reported',
          gpsLat: _livePosition?.latitude,
          gpsLng: _livePosition?.longitude,
          gpsAccuracy: _livePosition?.accuracy,
          payload: {
            'title': '$_selectedType at $locStr',
            'type': _selectedType,
            'severity': _severity.toLowerCase(),
            'location': locStr,
            'description': _descController.text.trim(),
            'reported_by': GuardSessionService().activeSession?.guardName ?? 'Mobile Guard',
            'status': 'open',
            if (imagePath != null) 'local_image_path': imagePath,
          },
        );
      } catch (_) {}

      if (mounted) {
        HapticFeedback.lightImpact();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.cloud_off_rounded, color: Colors.white, size: 20),
                const SizedBox(width: 10),
                Expanded(child: Text('Incident queued offline (will auto-sync when online)', style: GoogleFonts.inter(fontWeight: FontWeight.w600))),
              ],
            ),
            backgroundColor: const Color(0xFFF59E0B),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
        );
        setState(() {
          _descController.clear();
          _locationController.clear();
          _imageFile = null;
        });
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E293B) : Colors.white;
    final inputBg = isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9);
    final borderColor = isDark ? Colors.white.withOpacity(0.08) : const Color(0xFFE2E8F0);

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        title: Text(
          'Report Incident',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w800,
            fontSize: 20,
            color: isDark ? Colors.white : const Color(0xFF0F172A),
          ),
        ),
        actions: [
          IconButton(
            tooltip: 'Incident History',
            icon: Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: borderColor),
              ),
              child: Icon(
                LucideIcons.history,
                size: 18,
                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
              ),
            ),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const IncidentHistoryScreen()),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 90), // Generous bottom padding for SOS button
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Category 2x3 Grid
                Text(
                  'SELECT CATEGORY',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                  ),
                ),
                const SizedBox(height: 8),

                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                    childAspectRatio: 2.3,
                  ),
                  itemCount: _categories.length,
                  itemBuilder: (context, index) {
                    final cat = _categories[index];
                    final isSelected = _selectedType == cat['name'];
                    final Color color = cat['color'];

                    return InkWell(
                      onTap: () {
                        HapticFeedback.selectionClick();
                        setState(() => _selectedType = cat['name']);
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 140),
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? color.withOpacity(isDark ? 0.22 : 0.12)
                              : cardBg,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected ? color : borderColor,
                            width: isSelected ? 1.8 : 1,
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              cat['icon'],
                              size: 15,
                              color: isSelected ? color : (isDark ? Colors.white70 : const Color(0xFF64748B)),
                            ),
                            const SizedBox(width: 5),
                            Flexible(
                              child: Text(
                                cat['name'],
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                  color: isSelected
                                      ? (isDark ? Colors.white : color)
                                      : (isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569)),
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 14),

                // 2. Incident Details Card
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: borderColor),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Severity Switcher
                      Row(
                        children: [
                          Text(
                            'Severity:',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.all(2.5),
                              decoration: BoxDecoration(
                                color: inputBg,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                children: [
                                  _buildSeverityOption('Low', const Color(0xFF10B981), isDark),
                                  _buildSeverityOption('Medium', const Color(0xFFF59E0B), isDark),
                                  _buildSeverityOption('Critical', const Color(0xFFEF4444), isDark),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 10),
                      Divider(color: borderColor, height: 1),
                      const SizedBox(height: 10),

                      // Location Input
                      TextFormField(
                        controller: _locationController,
                        style: GoogleFonts.inter(
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                          fontSize: 13.5,
                          fontWeight: FontWeight.w600,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Location / Floor / Landmark...',
                          hintStyle: GoogleFonts.inter(
                            color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
                            fontSize: 13,
                          ),
                          prefixIcon: const Icon(LucideIcons.mapPin, color: Color(0xFF007AFF), size: 16),
                          suffixIcon: _livePosition != null
                              ? Tooltip(
                                  message: 'GPS Attached',
                                  child: Container(
                                    margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF10B981).withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(Icons.gps_fixed, size: 11, color: Color(0xFF10B981)),
                                        const SizedBox(width: 3),
                                        Text(
                                          'GPS Auto',
                                          style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: const Color(0xFF10B981)),
                                        ),
                                      ],
                                    ),
                                  ),
                                )
                              : null,
                          filled: true,
                          fillColor: inputBg,
                          isDense: true,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                        ),
                      ),

                      const SizedBox(height: 10),

                      // Description Input
                      TextFormField(
                        controller: _descController,
                        minLines: 2,
                        maxLines: 3,
                        style: GoogleFonts.inter(
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                          fontSize: 13.5,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Brief description of what happened...',
                          hintStyle: GoogleFonts.inter(
                            color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
                            fontSize: 13,
                          ),
                          filled: true,
                          fillColor: inputBg,
                          isDense: true,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                          contentPadding: const EdgeInsets.all(10),
                        ),
                        validator: (v) => v == null || v.trim().isEmpty ? 'Please enter a description' : null,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // 3. Compact Photo Evidence Tile
                InkWell(
                  onTap: _showImageSourceSheet,
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: _imageFile != null ? const Color(0xFF10B981) : borderColor,
                      ),
                    ),
                    child: Row(
                      children: [
                        if (_imageFile != null)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.file(_imageFile!, width: 40, height: 40, fit: BoxFit.cover),
                          )
                        else
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF007AFF).withOpacity(0.12),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(LucideIcons.camera, color: Color(0xFF007AFF), size: 16),
                          ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _imageFile != null ? 'Photo Attached' : 'Attach Photo (Optional)',
                                style: GoogleFonts.inter(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w700,
                                  color: _imageFile != null ? const Color(0xFF10B981) : (isDark ? Colors.white : const Color(0xFF0F172A)),
                                ),
                              ),
                              Text(
                                _imageFile != null ? 'Tap to change photo' : 'Camera snapshot or gallery',
                                style: GoogleFonts.inter(
                                  fontSize: 10.5,
                                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (_imageFile != null)
                          IconButton(
                            icon: const Icon(Icons.close_rounded, size: 18, color: Colors.white70),
                            onPressed: () {
                              HapticFeedback.selectionClick();
                              setState(() => _imageFile = null);
                            },
                          )
                        else
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: inputBg,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '+ Add',
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF007AFF),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // 4. Submit Action Button
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _submitReport,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFEF4444),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(LucideIcons.send, size: 15),
                              const SizedBox(width: 8),
                              Text(
                                'Submit Report',
                                style: GoogleFonts.inter(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSeverityOption(String label, Color color, bool isDark) {
    final isSelected = _severity == label;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          HapticFeedback.selectionClick();
          setState(() => _severity = label);
        },
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 140),
          padding: const EdgeInsets.symmetric(vertical: 5),
          decoration: BoxDecoration(
            color: isSelected ? color.withOpacity(isDark ? 0.3 : 0.2) : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: isSelected ? color : Colors.transparent, width: 1.2),
          ),
          child: Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: isSelected ? color : (isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8)),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  label,
                  style: GoogleFonts.inter(
                    fontSize: 11.5,
                    fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                    color: isSelected ? (isDark ? Colors.white : color) : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
