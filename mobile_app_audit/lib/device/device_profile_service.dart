import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import 'package:accesseasy_shared/core/constants.dart';

enum DeviceProvisionState {
  unprovisioned,
  provisioned,
  locked,
  revoked,
}

class DeviceProfile {
  final String deviceId;
  final String deviceName;
  final String? organizationId;
  final String? tenant;
  final String boundSiteId;
  final String boundSiteName;
  final String boundZoneId;
  final String boundZoneName;
  final String boundPostId;
  final String boundPostName;
  final String deviceSecret;
  final String appVersion;
  final int configVersion;
  final DeviceProvisionState securityState;
  final DateTime lastHeartbeat;
  final DateTime? provisionedAt;
  final String? provisionedBy;

  const DeviceProfile({
    required this.deviceId,
    required this.deviceName,
    this.organizationId,
    this.tenant,
    required this.boundSiteId,
    required this.boundSiteName,
    required this.boundZoneId,
    required this.boundZoneName,
    required this.boundPostId,
    required this.boundPostName,
    required this.deviceSecret,
    this.appVersion = '1.0.0',
    this.configVersion = 1,
    this.securityState = DeviceProvisionState.provisioned,
    required this.lastHeartbeat,
    this.provisionedAt,
    this.provisionedBy,
  });

  DeviceProfile copyWith({
    String? deviceId,
    String? deviceName,
    String? organizationId,
    String? tenant,
    String? boundSiteId,
    String? boundSiteName,
    String? boundZoneId,
    String? boundZoneName,
    String? boundPostId,
    String? boundPostName,
    String? deviceSecret,
    String? appVersion,
    int? configVersion,
    DeviceProvisionState? securityState,
    DateTime? lastHeartbeat,
    DateTime? provisionedAt,
    String? provisionedBy,
  }) {
    return DeviceProfile(
      deviceId: deviceId ?? this.deviceId,
      deviceName: deviceName ?? this.deviceName,
      organizationId: organizationId ?? this.organizationId,
      tenant: tenant ?? this.tenant,
      boundSiteId: boundSiteId ?? this.boundSiteId,
      boundSiteName: boundSiteName ?? this.boundSiteName,
      boundZoneId: boundZoneId ?? this.boundZoneId,
      boundZoneName: boundZoneName ?? this.boundZoneName,
      boundPostId: boundPostId ?? this.boundPostId,
      boundPostName: boundPostName ?? this.boundPostName,
      deviceSecret: deviceSecret ?? this.deviceSecret,
      appVersion: appVersion ?? this.appVersion,
      configVersion: configVersion ?? this.configVersion,
      securityState: securityState ?? this.securityState,
      lastHeartbeat: lastHeartbeat ?? this.lastHeartbeat,
      provisionedAt: provisionedAt ?? this.provisionedAt,
      provisionedBy: provisionedBy ?? this.provisionedBy,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'deviceId': deviceId,
      'deviceName': deviceName,
      'organizationId': organizationId,
      'tenant': tenant,
      'boundSiteId': boundSiteId,
      'boundSiteName': boundSiteName,
      'boundZoneId': boundZoneId,
      'boundZoneName': boundZoneName,
      'boundPostId': boundPostId,
      'boundPostName': boundPostName,
      'deviceSecret': deviceSecret,
      'appVersion': appVersion,
      'configVersion': configVersion,
      'securityState': securityState.name,
      'lastHeartbeat': lastHeartbeat.toIso8601String(),
      'provisionedAt': provisionedAt?.toIso8601String(),
      'provisionedBy': provisionedBy,
    };
  }

  factory DeviceProfile.fromJson(Map<String, dynamic> json) {
    return DeviceProfile(
      deviceId: json['deviceId'] ?? 'DEV-PATROL-DEFAULT',
      deviceName: json['deviceName'] ?? 'Patrol Terminal',
      organizationId: json['organizationId'],
      tenant: json['tenant'],
      boundSiteId: json['boundSiteId'] ?? '',
      boundSiteName: json['boundSiteName'] ?? '',
      boundZoneId: json['boundZoneId'] ?? '',
      boundZoneName: json['boundZoneName'] ?? '',
      boundPostId: json['boundPostId'] ?? '',
      boundPostName: json['boundPostName'] ?? '',
      deviceSecret: json['deviceSecret'] ?? '',
      appVersion: json['appVersion'] ?? '1.0.0',
      configVersion: json['configVersion'] ?? 1,
      securityState: DeviceProvisionState.values.firstWhere(
        (e) => e.name == json['securityState'],
        orElse: () => DeviceProvisionState.unprovisioned,
      ),
      lastHeartbeat: json['lastHeartbeat'] != null
          ? DateTime.tryParse(json['lastHeartbeat']) ?? DateTime.now()
          : DateTime.now(),
      provisionedAt: json['provisionedAt'] != null
          ? DateTime.tryParse(json['provisionedAt'])
          : null,
      provisionedBy: json['provisionedBy'],
    );
  }
}

class DeviceProfileService extends ChangeNotifier {
  static final DeviceProfileService _instance = DeviceProfileService._internal();
  factory DeviceProfileService() => _instance;
  DeviceProfileService._internal();

  static const String _kDeviceProfileKey = 'ae_patrol_device_profile';
  static const String _kDeviceIdKey = 'ae_patrol_hardware_device_id';

  DeviceProfile? _currentProfile;
  DeviceProfile? get currentProfile => _currentProfile;

  bool get isDeviceProvisioned {
    if (_currentProfile == null) return false;
    if (_currentProfile!.securityState != DeviceProvisionState.provisioned) return false;
    if (_currentProfile!.boundSiteId.isEmpty) return false;
    return true;
  }

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_kDeviceProfileKey);
    if (jsonStr != null) {
      try {
        final map = jsonDecode(jsonStr) as Map<String, dynamic>;
        _currentProfile = DeviceProfile.fromJson(map);
      } catch (e) {
        debugPrint('Error parsing device profile: $e');
      }
    }

    // Ensure persistent hardware device ID exists
    var hwId = prefs.getString(_kDeviceIdKey);
    if (hwId == null) {
      hwId = 'PATROL-${const Uuid().v4().substring(0, 8).toUpperCase()}';
      await prefs.setString(_kDeviceIdKey, hwId);
    }

    if (_currentProfile == null) {
      // Check legacy prefs if already logged in before
      final existingSiteId = prefs.getString('guard_site_id');
      final existingSiteName = prefs.getString('guard_site_name');
      final existingTenant = tenant ?? prefs.getString('tenant');

      if (existingSiteId != null && existingSiteId.isNotEmpty) {
        _currentProfile = DeviceProfile(
          deviceId: hwId,
          deviceName: 'Patrol Terminal (${hwId.substring(hwId.length - 4)})',
          tenant: existingTenant,
          boundSiteId: existingSiteId,
          boundSiteName: existingSiteName ?? 'Main Post',
          boundZoneId: prefs.getString('guard_zone_id') ?? '',
          boundZoneName: prefs.getString('guard_zone_name') ?? 'Main Zone',
          boundPostId: '',
          boundPostName: 'Gate 1',
          deviceSecret: const Uuid().v4(),
          securityState: DeviceProvisionState.provisioned,
          lastHeartbeat: DateTime.now(),
          provisionedAt: DateTime.now(),
        );
        await saveProfile(_currentProfile!);
      } else {
        _currentProfile = DeviceProfile(
          deviceId: hwId,
          deviceName: 'Unprovisioned Patrol Terminal',
          boundSiteId: '',
          boundSiteName: '',
          boundZoneId: '',
          boundZoneName: '',
          boundPostId: '',
          boundPostName: '',
          deviceSecret: const Uuid().v4(),
          securityState: DeviceProvisionState.unprovisioned,
          lastHeartbeat: DateTime.now(),
        );
      }
    }
  }

  Future<void> provisionDevice({
    required String tenantId,
    required String siteId,
    required String siteName,
    required String zoneId,
    required String zoneName,
    required String postId,
    required String postName,
    String? adminName,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    var hwId = prefs.getString(_kDeviceIdKey);
    if (hwId == null) {
      hwId = 'PATROL-${const Uuid().v4().substring(0, 8).toUpperCase()}';
      await prefs.setString(_kDeviceIdKey, hwId);
    }

    final newProfile = DeviceProfile(
      deviceId: hwId,
      deviceName: '$siteName - $postName',
      tenant: tenantId,
      organizationId: tenantId,
      boundSiteId: siteId,
      boundSiteName: siteName,
      boundZoneId: zoneId,
      boundZoneName: zoneName,
      boundPostId: postId,
      boundPostName: postName,
      deviceSecret: const Uuid().v4(),
      securityState: DeviceProvisionState.provisioned,
      lastHeartbeat: DateTime.now(),
      provisionedAt: DateTime.now(),
      provisionedBy: adminName ?? 'Admin',
    );

    await saveProfile(newProfile);

    // Sync to SharedPreferences for backward compatibility with shared modules
    await prefs.setString('guard_site_id', siteId);
    await prefs.setString('guard_site_name', siteName);
    await prefs.setString('guard_zone_id', zoneId);
    await prefs.setString('guard_zone_name', zoneName);
    await prefs.setString('tenant', tenantId);

    notifyListeners();
  }

  Future<void> saveProfile(DeviceProfile profile) async {
    _currentProfile = profile;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kDeviceProfileKey, jsonEncode(profile.toJson()));
    notifyListeners();
  }

  Future<void> updateHeartbeat() async {
    if (_currentProfile == null) return;
    _currentProfile = _currentProfile!.copyWith(lastHeartbeat: DateTime.now());
    await saveProfile(_currentProfile!);
  }

  Future<void> setSecurityState(DeviceProvisionState state) async {
    if (_currentProfile == null) return;
    _currentProfile = _currentProfile!.copyWith(securityState: state);
    await saveProfile(_currentProfile!);
  }

  Future<void> resetDevice() async {
    final prefs = await SharedPreferences.getInstance();
    final hwId = prefs.getString(_kDeviceIdKey) ?? 'PATROL-UNKNOWN';

    _currentProfile = DeviceProfile(
      deviceId: hwId,
      deviceName: 'Unprovisioned Patrol Terminal',
      boundSiteId: '',
      boundSiteName: '',
      boundZoneId: '',
      boundZoneName: '',
      boundPostId: '',
      boundPostName: '',
      deviceSecret: const Uuid().v4(),
      securityState: DeviceProvisionState.unprovisioned,
      lastHeartbeat: DateTime.now(),
    );

    await prefs.remove(_kDeviceProfileKey);
    await prefs.remove('guard_site_id');
    await prefs.remove('guard_site_name');
    await prefs.remove('guard_zone_id');
    await prefs.remove('guard_zone_name');
    await prefs.remove('auth_token');
    await prefs.remove('token');

    notifyListeners();
  }
}
