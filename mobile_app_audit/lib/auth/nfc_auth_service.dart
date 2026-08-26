import 'package:nfc_manager/nfc_manager.dart';

typedef NfcCardDetectedCallback = void Function(String cardId);

class NfcAuthService {
  static final NfcAuthService _instance = NfcAuthService._internal();
  factory NfcAuthService() => _instance;
  NfcAuthService._internal();

  bool _isListening = false;
  bool get isListening => _isListening;

  Future<bool> isNfcAvailable() async {
    try {
      return await NfcManager.instance.isAvailable();
    } catch (_) {
      return false;
    }
  }

  Future<void> startListening({
    required NfcCardDetectedCallback onCardDetected,
    Function(String error)? onError,
  }) async {
    if (_isListening) return;

    final available = await isNfcAvailable();
    if (!available) {
      onError?.call('NFC is not supported or disabled on this device.');
      return;
    }

    _isListening = true;
    try {
      await NfcManager.instance.startSession(
        onDiscovered: (NfcTag tag) async {
          try {
            String? identifier;

            // Extract identifier based on tag technology
            final data = tag.data;
            if (data.containsKey('nfca')) {
              final idBytes = data['nfca']['identifier'] as List<dynamic>?;
              if (idBytes != null) {
                identifier = idBytes.map((e) => (e as int).toRadixString(16).padLeft(2, '0')).join(':').toUpperCase();
              }
            } else if (data.containsKey('mifareclassic')) {
              final idBytes = data['mifareclassic']['identifier'] as List<dynamic>?;
              if (idBytes != null) {
                identifier = idBytes.map((e) => (e as int).toRadixString(16).padLeft(2, '0')).join(':').toUpperCase();
              }
            } else if (data.containsKey('isodep')) {
              final idBytes = data['isodep']['identifier'] as List<dynamic>?;
              if (idBytes != null) {
                identifier = idBytes.map((e) => (e as int).toRadixString(16).padLeft(2, '0')).join(':').toUpperCase();
              }
            }

            identifier ??= 'NFC-${tag.data.hashCode.toRadixString(16).toUpperCase()}';

            onCardDetected(identifier);
          } catch (e) {
            onError?.call('Error processing NFC badge: $e');
          }
        },
      );
    } catch (e) {
      _isListening = false;
      onError?.call('Failed to start NFC scanner: $e');
    }
  }

  Future<void> stopListening() async {
    if (!_isListening) return;
    try {
      await NfcManager.instance.stopSession();
    } catch (_) {}
    _isListening = false;
  }
}
