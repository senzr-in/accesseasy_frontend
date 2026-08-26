import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:intl/intl.dart';

import 'package:accesseasy_shared/core/constants.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../device/device_profile_service.dart';
import 'incident_detail_screen.dart';

class IncidentHistoryScreen extends StatefulWidget {
  const IncidentHistoryScreen({Key? key}) : super(key: key);

  @override
  State<IncidentHistoryScreen> createState() => _IncidentHistoryScreenState();
}

class _IncidentHistoryScreenState extends State<IncidentHistoryScreen> {
  List<dynamic> _incidents = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchHistory();
  }

  Future<void> _fetchHistory() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final currentToken = token ?? prefs.getString('auth_token') ?? prefs.getString('token');
      final currentTenant = tenant ?? DeviceProfileService().currentProfile?.tenant ?? prefs.getString('tenant') ?? 'default';

      if (currentToken == null || currentToken.isEmpty) {
        throw Exception('Not authenticated. Please log in.');
      }

      final url = Uri.parse('$kBaseUrl/items/patrol_alerts?filter[tenant][_eq]=$currentTenant&sort=-date_created&limit=50');
      final response = await http.get(
        url,
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _incidents = data['data'] ?? [];
        });
      } else {
        throw Exception('Failed to load history: ${response.statusCode}');
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Color _getSeverityColor(String sev) {
    switch (sev.toLowerCase()) {
      case 'critical': return Colors.redAccent;
      case 'high': return Colors.orangeAccent;
      case 'medium': return Colors.amber;
      case 'low': return Colors.greenAccent;
      default: return Colors.blueAccent;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF131720),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Incident History',
          style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.bold, color: Colors.white),
        ),
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.white))
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(LucideIcons.alertCircle, color: Colors.redAccent, size: 48),
                      const SizedBox(height: 16),
                      Text(
                        'Error loading history\n$_error',
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white54),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _fetchHistory,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1C212D),
                        ),
                        child: const Text('Retry', style: TextStyle(color: Colors.white)),
                      )
                    ],
                  ),
                )
              : _incidents.isEmpty
                  ? const Center(
                      child: Text(
                        'No incidents found.',
                        style: TextStyle(color: Colors.white54, fontSize: 16),
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _fetchHistory,
                      color: Colors.white,
                      backgroundColor: const Color(0xFF1C212D),
                      child: ListView.separated(
                        padding: const EdgeInsets.all(20),
                        itemCount: _incidents.length,
                        separatorBuilder: (context, index) => const SizedBox(height: 16),
                        itemBuilder: (context, index) {
                          final incident = _incidents[index];
                          final severity = incident['severity'] ?? 'unknown';
                          final dateStr = incident['date_created'];
                          String formattedDate = 'Unknown date';
                          if (dateStr != null) {
                            try {
                              final dt = DateTime.parse(dateStr).toLocal();
                              formattedDate = DateFormat('MMM dd, yyyy • hh:mm a').format(dt);
                            } catch (_) {}
                          }

                          return GestureDetector(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => IncidentDetailScreen(
                                    incident: Map<String, dynamic>.from(incident),
                                  ),
                                ),
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1C212D),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: Colors.white12),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          incident['type'] ?? 'Unknown Type',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: _getSeverityColor(severity).withOpacity(0.15),
                                          borderRadius: BorderRadius.circular(8),
                                          border: Border.all(color: _getSeverityColor(severity).withOpacity(0.5)),
                                        ),
                                        child: Text(
                                          severity.toUpperCase(),
                                          style: TextStyle(
                                            color: _getSeverityColor(severity),
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                      const Icon(LucideIcons.mapPin, color: Colors.white54, size: 14),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          incident['location'] ?? 'No location',
                                          style: const TextStyle(color: Colors.white70, fontSize: 14),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      const Icon(LucideIcons.clock, color: Colors.white54, size: 14),
                                      const SizedBox(width: 8),
                                      Text(
                                        formattedDate,
                                        style: const TextStyle(color: Colors.white54, fontSize: 13),
                                      ),
                                    ],
                                  ),
                                  if (incident['description'] != null && incident['description'].toString().isNotEmpty) ...[
                                    const SizedBox(height: 12),
                                    Text(
                                      incident['description'],
                                      style: const TextStyle(color: Colors.white54, fontSize: 14),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                  const SizedBox(height: 12),
                                  const Row(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      Text('View Details', style: TextStyle(color: Colors.cyanAccent, fontSize: 12, fontWeight: FontWeight.w600)),
                                      SizedBox(width: 4),
                                      Icon(LucideIcons.chevronRight, color: Colors.cyanAccent, size: 14),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
