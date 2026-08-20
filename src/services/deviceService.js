export const deviceService = {
  /**
   * Get equipment and device statuses
   */
  async getDevices({ category = 'all', status = 'all' } = {}) {
    const devices = [
      { id: 'DEV-01', name: 'Main Gate Face Terminal A', type: 'Face Terminal', ip: '192.168.1.101', status: 'Online', firmware: 'v2.4.1', syncStatus: 'Synced', lastHeartbeat: 'Just now' },
      { id: 'DEV-02', name: 'Main Gate Turnstile 01', type: 'Turnstile Controller', ip: '192.168.1.102', status: 'Online', firmware: 'v1.8.0', syncStatus: 'Synced', lastHeartbeat: 'Just now' },
      { id: 'DEV-03', name: 'Server Room Biometric Vault', type: 'Fingerprint & Face', ip: '192.168.1.105', status: 'Online', firmware: 'v2.4.1', syncStatus: 'Synced', lastHeartbeat: '1 min ago' },
      { id: 'DEV-04', name: 'East Wing Secondary Gate', type: 'RFID Reader', ip: '192.168.1.112', status: 'Offline', firmware: 'v1.6.3', syncStatus: 'Pending', lastHeartbeat: '45 mins ago' },
      { id: 'DEV-05', name: 'Building 3 Turnstile 02', type: 'Turnstile Controller', ip: '192.168.1.115', status: 'Offline', firmware: 'v1.8.0', syncStatus: 'Failed', lastHeartbeat: '2 hours ago' },
      { id: 'DEV-06', name: 'Exec Suite Access Point', type: 'Face Terminal', ip: '192.168.1.120', status: 'Online', firmware: 'v2.4.1', syncStatus: 'Synced', lastHeartbeat: 'Just now' }
    ];

    let filtered = [...devices];
    if (status !== 'all') {
      filtered = filtered.filter(d => d.status.toLowerCase() === status.toLowerCase());
    }
    return filtered;
  },

  /**
   * Register a new access device
   */
  async registerDevice(payload) {
    return {
      success: true,
      id: `DEV-${Math.floor(10 + Math.random() * 90)}`,
      ...payload,
      status: 'Online',
      syncStatus: 'Synced',
      registeredAt: new Date().toISOString()
    };
  }
};
