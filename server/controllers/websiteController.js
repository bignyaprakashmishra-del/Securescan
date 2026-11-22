// SecureScan Website Management & Ownership Verification Controller
const prisma = require('../config/db');
const { generateVerificationToken, verifyDomainOwnership } = require('../services/verification');

async function getWebsites(req, res, next) {
  try {
    const websites = await prisma.website.findMany({
      where: { userId: req.user.id },
      include: {
        scans: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ websites: websites });
  } catch (err) {
    next(err);
  }
}

async function createWebsite(req, res, next) {
  try {
    const domain = req.cleanedDomain;
    const userId = req.user.id;

    // Check if user already registered this domain
    const existing = await prisma.website.findFirst({
      where: {
        userId: userId,
        domain: domain,
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'You have already added this domain.' });
    }

    // Generate unique DNS verification token
    const verificationToken = generateVerificationToken();

    const website = await prisma.website.create({
      data: {
        domain: domain,
        verificationToken: verificationToken,
        userId: userId,
        isVerified: false,
      },
    });

    res.status(201).json({
      message: 'Domain added. Please complete DNS TXT verification.',
      website: website,
    });
  } catch (err) {
    next(err);
  }
}

async function verifyWebsite(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find website ensuring user ownership
    const website = await prisma.website.findFirst({
      where: { id: id, userId: userId },
    });

    if (!website) {
      return res.status(404).json({ error: 'Website domain not found.' });
    }

    if (website.isVerified) {
      return res.json({
        verified: true,
        message: 'Domain is already verified.',
        website: website,
      });
    }

    // Check if simulate mode requested (for testing without public DNS)
    const isSimulated = req.query.simulate === 'true' || req.body?.simulate === true;

    let verificationResult;
    if (isSimulated) {
      verificationResult = {
        verified: true,
        message: 'Domain ownership verified (Demonstration Mode / Local Testing).',
      };
    } else {
      // Execute genuine DNS TXT record check
      verificationResult = await verifyDomainOwnership(website.domain, website.verificationToken);
    }

    if (verificationResult.verified) {
      const updated = await prisma.website.update({
        where: { id: id },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
        },
      });

      return res.json({
        verified: true,
        message: verificationResult.message,
        website: updated,
      });
    }

    return res.status(400).json({
      verified: false,
      message: verificationResult.message,
      expectedRecord: verificationResult.expectedRecord,
      foundRecords: verificationResult.foundRecords,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteWebsite(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const website = await prisma.website.findFirst({
      where: { id: id, userId: userId },
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found or unauthorized.' });
    }

    await prisma.website.delete({
      where: { id: id },
    });

    res.json({ message: 'Website and associated scan history deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getWebsites,
  createWebsite,
  verifyWebsite,
  deleteWebsite,
};
