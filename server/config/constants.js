// SecureScan Platform Constants & Configurations

module.exports = {
  // Scoring weights (Deductions from 100)
  SCORING: {
    BASE_SCORE: 100,
    DEDUCTIONS: {
      CRITICAL: 25,
      HIGH: 15,
      MEDIUM: 8,
      LOW: 3,
      INFORMATIONAL: 0,
    },
    GRADES: [
      { min: 95, grade: 'A+', risk: 'Low Risk' },
      { min: 88, grade: 'A', risk: 'Low Risk' },
      { min: 75, grade: 'B', risk: 'Moderate Risk' },
      { min: 55, grade: 'C', risk: 'Elevated Risk' },
      { min: 35, grade: 'D', risk: 'High Risk' },
      { min: 0, grade: 'F', risk: 'Critical Risk' },
    ],
  },

  // Scanner Operational Limits
  SCANNER: {
    TIMEOUT_MS: 7000,
    MAX_REDIRECTS: 3,
    MAX_RESPONSE_BYTES: 1024 * 1024, // 1MB maximum response inspection
    USER_AGENT: 'SecureScan-Auditor/1.0 (+https://securescan-security.onrender.com; Explainable Web Security Intelligence)',
  },

  // DNS TXT Verification constants
  VERIFICATION: {
    PREFIX: 'securescan-verify=',
    CHALLENGE_SUBDOMAIN_PREFIX: '_securescan-challenge',
  },

  // SSRF Disallowed IP Ranges (CIDRs and exact addresses)
  DISALLOWED_IP_RANGES: [
    // Loopback
    '127.0.0.0/8',
    '::1/128',
    // Private IPv4 (RFC 1918)
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
    // Link-Local / Cloud Metadata
    '169.254.0.0/16',
    'fe80::/10',
    // Carrier-Grade NAT (RFC 6598)
    '100.64.0.0/10',
    // Unique Local IPv6 (RFC 4193)
    'fc00::/7',
    // Multicast & Broadcast
    '224.0.0.0/4',
    '240.0.0.0/4',
    '255.255.255.255/32',
    'ff00::/8',
  ],

  // Specific Cloud Metadata IPs
  METADATA_IPS: [
    '169.254.169.254', // AWS, GCP, Azure metadata
    '169.254.169.253', // Azure internal DNS
    'fd00:ec2::254',    // AWS IPv6 metadata
  ],
};
