import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LockoutStatus {
  final bool isLockedOut;
  final bool requiresSupervisor;
  final int remainingSeconds;
  final int failedAttempts;

  const LockoutStatus({
    required this.isLockedOut,
    this.requiresSupervisor = false,
    this.remainingSeconds = 0,
    required this.failedAttempts,
  });
}

class DeviceSecurityService {
  static final DeviceSecurityService _instance = DeviceSecurityService._internal();
  factory DeviceSecurityService() => _instance;
  DeviceSecurityService._internal();

  static const String _kFailedAttemptsKey = 'ae_sec_failed_pin_attempts';
  static const String _kLockoutUntilKey = 'ae_sec_lockout_until_timestamp';
  static const String _kSalt = 'AccessEasy_Patrol_Terminal_2026_Salt!';

  int _failedAttempts = 0;
  DateTime? _lockoutUntil;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _failedAttempts = prefs.getInt(_kFailedAttemptsKey) ?? 0;
    final lockMillis = prefs.getInt(_kLockoutUntilKey);
    if (lockMillis != null) {
      _lockoutUntil = DateTime.fromMillisecondsSinceEpoch(lockMillis);
    }
  }

  String hashPin(String pin, {String? guardId}) {
    final payload = '$_kSalt:${guardId ?? 'universal'}:$pin';
    return sha256.convert(utf8.encode(payload)).toString();
  }

  bool verifyPin(String enteredPin, String storedHash, {String? guardId}) {
    final calculatedHash = hashPin(enteredPin, guardId: guardId);
    return calculatedHash == storedHash;
  }

  LockoutStatus checkLockout() {
    final now = DateTime.now();

    if (_failedAttempts >= 10) {
      return LockoutStatus(
        isLockedOut: true,
        requiresSupervisor: true,
        remainingSeconds: 999999,
        failedAttempts: _failedAttempts,
      );
    }

    if (_lockoutUntil != null && _lockoutUntil!.isAfter(now)) {
      final remaining = _lockoutUntil!.difference(now).inSeconds;
      return LockoutStatus(
        isLockedOut: true,
        requiresSupervisor: false,
        remainingSeconds: remaining > 0 ? remaining : 0,
        failedAttempts: _failedAttempts,
      );
    }

    return LockoutStatus(
      isLockedOut: false,
      requiresSupervisor: false,
      remainingSeconds: 0,
      failedAttempts: _failedAttempts,
    );
  }

  Future<LockoutStatus> recordFailedAttempt() async {
    _failedAttempts++;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_kFailedAttemptsKey, _failedAttempts);

    final now = DateTime.now();
    if (_failedAttempts >= 10) {
      _lockoutUntil = now.add(const Duration(days: 365));
    } else if (_failedAttempts >= 5) {
      _lockoutUntil = now.add(const Duration(seconds: 120)); // 2 minutes
    } else if (_failedAttempts >= 3) {
      _lockoutUntil = now.add(const Duration(seconds: 30)); // 30 seconds
    }

    if (_lockoutUntil != null) {
      await prefs.setInt(_kLockoutUntilKey, _lockoutUntil!.millisecondsSinceEpoch);
    }

    return checkLockout();
  }

  Future<void> recordSuccessfulAuth() async {
    _failedAttempts = 0;
    _lockoutUntil = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kFailedAttemptsKey);
    await prefs.remove(_kLockoutUntilKey);
  }

  Future<void> supervisorResetLockout() async {
    await recordSuccessfulAuth();
  }
}
