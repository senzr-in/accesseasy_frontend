export const accessService = {
  /**
   * Get overall access control counts
   */
  async getAccessOverview() {
    return {
      granted: 12481,
      denied: 23,
      suspicious: 5,
      equipment: {
        doors: { online: 42, offline: 2, total: 44 },
        turnstiles: { online: 8, offline: 0, total: 8 },
        controllers: { online: 31, offline: 1, total: 32 }
      }
    };
  },

  /**
   * Get initial live access events stream
   */
  async getLiveEvents({ limit = 15 } = {}) {
    return [
      {
        id: 'ACC-901',
        time: '09:42:18',
        employee: 'Rajesh Kumar',
        department: 'Security',
        location: 'Main Gate B1',
        method: 'Face',
        result: 'Granted',
        avatar: null
      },
      {
        id: 'ACC-902',
        time: '09:41:53',
        employee: 'Priya Sundaram',
        department: 'Finance',
        location: 'Floor 2 East Wing',
        method: 'RFID',
        result: 'Granted',
        avatar: null
      },
      {
        id: 'ACC-903',
        time: '09:39:21',
        employee: 'Unknown / Unregistered',
        department: 'External',
        location: 'Server Room Vault',
        method: 'Face',
        result: 'Denied',
        reason: 'Unauthorized Zone Level',
        avatar: null
      },
      {
        id: 'ACC-904',
        time: '09:37:04',
        employee: 'Arun Kumar',
        department: 'Engineering',
        location: 'Building 3 Turnstile 01',
        method: 'Fingerprint',
        result: 'Granted',
        avatar: null
      },
      {
        id: 'ACC-905',
        time: '09:34:40',
        employee: 'Elena Rostova',
        department: 'Operations',
        location: 'Executive Suite Entry',
        method: 'Face',
        result: 'Granted',
        avatar: null
      },
      {
        id: 'ACC-906',
        time: '09:31:12',
        employee: 'Cardholder #88192',
        department: 'Visitor',
        location: 'R&D Lab South',
        method: 'RFID',
        result: 'Denied',
        reason: 'Expired Credential',
        avatar: null
      },
      {
        id: 'ACC-907',
        time: '09:28:55',
        employee: 'Sarah Jenkins',
        department: 'Human Resources',
        location: 'HQ Lobby Turnstile 03',
        method: 'Mobile Pass',
        result: 'Granted',
        avatar: null
      },
      {
        id: 'ACC-908',
        time: '09:22:10',
        employee: 'Amara Okonkwo',
        department: 'Engineering',
        location: 'Building 3 Level 4',
        method: 'Face',
        result: 'Granted',
        avatar: null
      }
    ];
  }
};
