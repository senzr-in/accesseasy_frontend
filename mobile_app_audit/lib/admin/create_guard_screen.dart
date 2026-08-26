import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:accesseasy_shared/core/constants.dart';

import '../auth/guard_session_service.dart';
import '../device/device_security_service.dart';

class CreateGuardScreen extends StatefulWidget {
  final VoidCallback? onGuardCreated;

  const CreateGuardScreen({super.key, this.onGuardCreated});

  @override
  State<CreateGuardScreen> createState() => _CreateGuardScreenState();
}

class _CreateGuardScreenState extends State<CreateGuardScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _empIdController = TextEditingController();
  final TextEditingController _pinController = TextEditingController();
  final TextEditingController _rfidController = TextEditingController();

  String _selectedRole = 'Security Officer';
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    _empIdController.dispose();
    _pinController.dispose();
    _rfidController.dispose();
    super.dispose();
  }

  Future<void> _submitCreateGuard() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final firstName = _firstNameController.text.trim();
    final lastName = _lastNameController.text.trim();
    final phone = _phoneController.text.trim();
    final empId = _empIdController.text.trim().toUpperCase();
    final pin = _pinController.text.trim();
    final rfid = _rfidController.text.trim();

    try {
      final prefs = await SharedPreferences.getInstance();
      final currentToken = token ?? prefs.getString('auth_token') ?? prefs.getString('token');
      final currentTenant = tenant ?? prefs.getString('tenant') ?? 'default';

      final pinHash = DeviceSecurityService().hashPin(pin);

      // 1. Post to backend if token is available
      bool backendSuccess = false;
      String? backendGuardId;
      if (currentToken != null && currentToken.isNotEmpty) {
        try {
          final url = Uri.parse('$kBaseUrl/items/personalModule');
          final payload = {
            'first_name': firstName,
            'last_name': lastName,
            'phone': phone,
            'employee_id': empId,
            'pin': pin,
            'rfid_card': rfid.isNotEmpty ? rfid : null,
            'role': _selectedRole,
            'tenant': currentTenant,
            'status': 'active',
          };

          final res = await http.post(
            url,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $currentToken',
            },
            body: jsonEncode(payload),
          );

          if (res.statusCode == 200 || res.statusCode == 201) {
            backendSuccess = true;
            final bodyData = jsonDecode(res.body);
            final directusId = bodyData['data']?['id']?.toString();
            if (directusId != null && directusId.isNotEmpty) {
              backendGuardId = directusId;
            }
          }
        } catch (e) {
          debugPrint('Backend create guard error: $e');
        }
      }

      // 2. Always persist to local SQLite guard_roster table using real Directus ID
      final newMember = GuardRosterMember(
        guardId: backendGuardId ?? 'guard-${DateTime.now().millisecondsSinceEpoch}',
        name: '$firstName $lastName'.trim(),
        badgeNumber: empId,
        nfcCardId: rfid.isNotEmpty ? rfid : null,
        pinHash: pinHash,
        role: _selectedRole,
        isActive: true,
      );

      final currentRoster = List<GuardRosterMember>.from(GuardSessionService().roster);
      currentRoster.removeWhere((m) => m.badgeNumber == empId);
      currentRoster.insert(0, newMember);
      await GuardSessionService().saveRoster(currentRoster);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Guard ${newMember.name} ($empId) created successfully!'),
            backgroundColor: const Color(0xFF15803D),
            behavior: SnackBarBehavior.floating,
          ),
        );
        widget.onGuardCreated?.call();
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _errorMessage = 'Failed to create guard: $e');
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0B1320) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          'Create Guard',
          style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 18),
        ),
        backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Add Security Personnel',
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: isDark ? Colors.white : const Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Guards created here will be authorized to log into patrol devices and kiosks.',
                style: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF64748B)),
              ),
              const SizedBox(height: 20),

              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.redAccent.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.redAccent.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.redAccent, fontSize: 12),
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // First & Last Name
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _firstNameController,
                      decoration: InputDecoration(
                        labelText: 'First Name',
                        filled: true,
                        fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      validator: (v) => v?.trim().isEmpty == true ? 'Required' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _lastNameController,
                      decoration: InputDecoration(
                        labelText: 'Last Name',
                        filled: true,
                        fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      validator: (v) => v?.trim().isEmpty == true ? 'Required' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Phone Number
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  labelText: 'Phone Number',
                  prefixIcon: const Icon(Icons.phone_outlined),
                  hintText: 'e.g. +91 9876543210',
                  filled: true,
                  fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                validator: (v) => v?.trim().isEmpty == true ? 'Phone number is required' : null,
              ),
              const SizedBox(height: 16),

              // Employee ID / Badge Number
              TextFormField(
                controller: _empIdController,
                textCapitalization: TextCapitalization.characters,
                decoration: InputDecoration(
                  labelText: 'Employee / Badge ID',
                  prefixIcon: const Icon(Icons.badge_outlined),
                  hintText: 'e.g. SEC-101',
                  filled: true,
                  fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                validator: (v) => v?.trim().isEmpty == true ? 'Employee ID is required' : null,
              ),
              const SizedBox(height: 16),

              // 4-Digit PIN
              TextFormField(
                controller: _pinController,
                keyboardType: TextInputType.number,
                obscureText: true,
                maxLength: 4,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: InputDecoration(
                  labelText: '4-Digit Login PIN',
                  prefixIcon: const Icon(Icons.pin_outlined),
                  hintText: 'e.g. 1234',
                  counterText: '',
                  filled: true,
                  fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                validator: (v) {
                  if (v == null || v.trim().length != 4) {
                    return 'PIN must be exactly 4 digits';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Optional RFID / NFC Card UID
              TextFormField(
                controller: _rfidController,
                decoration: InputDecoration(
                  labelText: 'RFID / NFC Card UID (Optional)',
                  prefixIcon: const Icon(Icons.nfc_rounded),
                  hintText: 'e.g. 04:A2:B3:C4',
                  filled: true,
                  fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 16),

              // Role Selector
              Text('Guard Role', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: _selectedRole,
                    items: const [
                      DropdownMenuItem(value: 'Security Officer', child: Text('Security Officer / Guard')),
                      DropdownMenuItem(value: 'Patrol Commander', child: Text('Patrol Commander / Lead')),
                      DropdownMenuItem(value: 'Gate Sentinel', child: Text('Gate Sentinel / Post Guard')),
                    ],
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedRole = val);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 32),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  icon: const Icon(Icons.person_add_alt_1_rounded, size: 20),
                  label: _isLoading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text('Create & Register Guard', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700)),
                  onPressed: _isLoading ? null : _submitCreateGuard,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
