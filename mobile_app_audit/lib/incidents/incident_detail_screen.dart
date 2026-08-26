import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:accesseasy_shared/core/constants.dart';

class IncidentDetailScreen extends StatelessWidget {
  final Map<String, dynamic> incident;

  const IncidentDetailScreen({Key? key, required this.incident}) : super(key: key);

  Color _getSeverityColor(String sev) {
    switch (sev.toLowerCase()) {
      case 'critical': return Colors.redAccent;
      case 'high': return Colors.orangeAccent;
      case 'medium': return Colors.amber;
      case 'low': return Colors.greenAccent;
      default: return Colors.blueAccent;
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'open': return Colors.orangeAccent;
      case 'in_progress':
      case 'investigating': return Colors.cyanAccent;
      case 'resolved':
      case 'closed': return Colors.greenAccent;
      default: return Colors.white54;
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return 'Recent';
    try {
      final dt = (DateTime.tryParse(dateStr) ?? DateTime.now()).toLocal();
      return DateFormat('EEEE, MMM dd, yyyy • hh:mm a').format(dt);
    } catch (_) {
      return dateStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    final severity = incident['severity'] ?? 'unknown';
    final status = incident['status'] ?? 'unknown';
    final imageUrl = incident['image_url'];

    String descriptionText = (incident['description'] != null && incident['description'].toString().isNotEmpty)
        ? incident['description'].toString()
        : 'No description provided.';
        
    String? audioUrl;
    if (descriptionText.contains('[AUDIO_URL]:')) {
      final parts = descriptionText.split('[AUDIO_URL]:');
      descriptionText = parts[0].trim();
      audioUrl = parts[1].trim();
    }

    return Scaffold(
      backgroundColor: const Color(0xFF131720),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: imageUrl != null ? 280 : 120,
            pinned: true,
            backgroundColor: const Color(0xFF1C212D),
            iconTheme: const IconThemeData(color: Colors.white),
            flexibleSpace: FlexibleSpaceBar(
              background: imageUrl != null
                  ? Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.network(
                          imageUrl,
                          fit: BoxFit.cover,
                          headers: {
                            if (token != null) 'Authorization': 'Bearer $token',
                          },
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              color: const Color(0xFF1C212D),
                              child: const Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(LucideIcons.imageOff, color: Colors.white24, size: 48),
                                    SizedBox(height: 8),
                                    Text('Image unavailable', style: TextStyle(color: Colors.white24)),
                                  ],
                                ),
                              ),
                            );
                          },
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return Container(
                              color: const Color(0xFF1C212D),
                              child: const Center(
                                child: CircularProgressIndicator(color: Colors.white54, strokeWidth: 2),
                              ),
                            );
                          },
                        ),
                        Positioned.fill(
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.transparent,
                                  Colors.black.withOpacity(0.7),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    )
                  : Container(
                      color: const Color(0xFF1C212D),
                      child: const Center(
                        child: Icon(LucideIcons.shieldAlert, color: Colors.white24, size: 48),
                      ),
                    ),
              title: Text(
                incident['type'] ?? 'Incident Detail',
                style: const TextStyle(
                  fontFamily: 'Inter',
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  fontSize: 18,
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      _buildBadge(severity.toUpperCase(), _getSeverityColor(severity)),
                      const SizedBox(width: 10),
                      _buildBadge(status.toUpperCase(), _getStatusColor(status)),
                    ],
                  ),
                  const SizedBox(height: 24),

                  if (incident['title'] != null) ...[
                    Text(
                      incident['title'],
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  _buildInfoCard(
                    icon: LucideIcons.mapPin,
                    label: 'LOCATION',
                    value: incident['location'] ?? 'Not specified',
                    iconColor: Colors.cyanAccent,
                  ),
                  const SizedBox(height: 12),
                  _buildInfoCard(
                    icon: LucideIcons.clock,
                    label: 'REPORTED ON',
                    value: _formatDate(incident['date_created']),
                    iconColor: Colors.amber,
                  ),
                  const SizedBox(height: 12),
                  _buildInfoCard(
                    icon: LucideIcons.user,
                    label: 'REPORTED BY',
                    value: incident['reported_by'] ?? 'Unknown',
                    iconColor: Colors.greenAccent,
                  ),
                  const SizedBox(height: 24),

                  const Text(
                    'DESCRIPTION',
                    style: TextStyle(
                      color: Colors.white54,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1C212D),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.white10),
                    ),
                    child: Text(
                      descriptionText,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 15,
                        height: 1.6,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  if (audioUrl != null) ...[
                    const Text(
                      'AUDIO EVIDENCE',
                      style: TextStyle(
                         color: Colors.white54,
                         fontSize: 11,
                         fontWeight: FontWeight.bold,
                         letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 10),
                    GestureDetector(
                      onTap: () async {
                         final uri = Uri.parse(audioUrl!);
                         if (await canLaunchUrl(uri)) {
                           await launchUrl(uri, mode: LaunchMode.externalApplication);
                         }
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1C212D),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.white10),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: Colors.blueAccent.withOpacity(0.1),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(LucideIcons.mic, color: Colors.blueAccent, size: 20),
                            ),
                            const SizedBox(width: 16),
                            const Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Voice Recording', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                                  SizedBox(height: 4),
                                  Text('Tap to play audio in browser', style: TextStyle(color: Colors.white54, fontSize: 12)),
                                ],
                              ),
                            ),
                            const Icon(LucideIcons.externalLink, color: Colors.white38, size: 18),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  if (imageUrl != null) ...[
                    const Text(
                      'EVIDENCE PHOTO',
                      style: TextStyle(
                        color: Colors.white54,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 10),
                    GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => _FullScreenImageViewer(imageUrl: imageUrl),
                          ),
                        );
                      },
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: Container(
                          constraints: const BoxConstraints(maxHeight: 300),
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: const Color(0xFF1C212D),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: Colors.white10),
                          ),
                          child: Stack(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(14),
                                child: Image.network(
                                  imageUrl,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  headers: {
                                    if (token != null) 'Authorization': 'Bearer $token',
                                  },
                                  errorBuilder: (context, error, stackTrace) {
                                    return const SizedBox(
                                      height: 150,
                                      child: Center(
                                        child: Column(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            Icon(LucideIcons.imageOff, color: Colors.white24, size: 36),
                                            SizedBox(height: 8),
                                            Text('Image unavailable', style: TextStyle(color: Colors.white24, fontSize: 13)),
                                          ],
                                        ),
                                      ),
                                    );
                                  },
                                  loadingBuilder: (context, child, loadingProgress) {
                                    if (loadingProgress == null) return child;
                                    return const SizedBox(
                                      height: 150,
                                      child: Center(
                                        child: CircularProgressIndicator(color: Colors.white54, strokeWidth: 2),
                                      ),
                                    );
                                  },
                                ),
                              ),
                              Positioned(
                                bottom: 8,
                                right: 8,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withOpacity(0.6),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(LucideIcons.maximize2, color: Colors.white70, size: 14),
                                      SizedBox(width: 6),
                                      Text('Tap to enlarge', style: TextStyle(color: Colors.white70, fontSize: 11)),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.4)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String label,
    required String value,
    required Color iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1C212D),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: iconColor, size: 18),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white38,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FullScreenImageViewer extends StatelessWidget {
  final String imageUrl;

  const _FullScreenImageViewer({required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Center(
        child: InteractiveViewer(
          panEnabled: true,
          minScale: 0.5,
          maxScale: 4.0,
          child: Image.network(
            imageUrl,
            fit: BoxFit.contain,
            headers: {
              if (token != null) 'Authorization': 'Bearer $token',
            },
            errorBuilder: (context, error, stackTrace) {
              return const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(LucideIcons.imageOff, color: Colors.white24, size: 64),
                  SizedBox(height: 16),
                  Text('Failed to load image', style: TextStyle(color: Colors.white54)),
                ],
              );
            },
            loadingBuilder: (context, child, loadingProgress) {
              if (loadingProgress == null) return child;
              return const CircularProgressIndicator(color: Colors.white54, strokeWidth: 2);
            },
          ),
        ),
      ),
    );
  }
}
