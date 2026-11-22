// SecureScan DNS TXT Ownership Verification Service
const dns = require('dns').promises;
const crypto = require('crypto');
const { VERIFICATION } = require('../config/constants');

/**
 * Generates a cryptographically strong unique verification token.
 */
function generateVerificationToken() {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * Verifies domain ownership by inspecting DNS TXT records.
 * Checks both:
 * 1. _securescan-challenge.<domain>
 * 2. <domain> (root TXT)
 */
async function verifyDomainOwnership(domain, expectedToken) {
  const challengeHostname = `${VERIFICATION.CHALLENGE_SUBDOMAIN_PREFIX}.${domain}`;
  const targetRecordValue = `${VERIFICATION.PREFIX}${expectedToken}`.trim();

  let foundRecords = [];
  let errors = [];

  // 1. Try querying challenge subdomain
  try {
    const subTxtRecords = await dns.resolveTxt(challengeHostname);
    // resolveTxt returns an array of chunks: [ ['chunk1', 'chunk2'], ['chunk3'] ]
    for (const recordArray of subTxtRecords) {
      foundRecords.push(recordArray.join(''));
    }
  } catch (err) {
    errors.push(`Subdomain (${challengeHostname}): ${err.code || err.message}`);
  }

  // 2. Try querying root domain TXT
  try {
    const rootTxtRecords = await dns.resolveTxt(domain);
    for (const recordArray of rootTxtRecords) {
      foundRecords.push(recordArray.join(''));
    }
  } catch (err) {
    errors.push(`Root domain (${domain}): ${err.code || err.message}`);
  }

  // Check if target record exists in found records
  const isMatch = foundRecords.some((val) => val.trim() === targetRecordValue);

  if (isMatch) {
    return {
      verified: true,
      matchedRecord: targetRecordValue,
      message: 'DNS TXT ownership successfully verified.',
    };
  }

  return {
    verified: false,
    foundRecords: foundRecords,
    expectedRecord: targetRecordValue,
    errors: errors,
    message: `Verification TXT record not detected. Expected "${targetRecordValue}" on host "${challengeHostname}" or "${domain}".`,
  };
}

module.exports = {
  generateVerificationToken,
  verifyDomainOwnership,
};
