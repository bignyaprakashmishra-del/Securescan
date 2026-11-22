// SecureScan Live HTTP Server & API Integration Test
const http = require('http');
const assert = require('assert');
const app = require('../index');

async function testLiveApi() {
  const PORT = 5055;
  const server = app.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}...`);

    try {
      // 1. Test /api/health
      const healthData = await fetchJson(`http://localhost:${PORT}/api/health`);
      console.log('Health check response:', healthData);
      assert.strictEqual(healthData.status, 'healthy');
      assert.strictEqual(healthData.service, 'SecureScan Security Intelligence API');

      // 2. Test /api/demo/overview
      const demoOverview = await fetchJson(`http://localhost:${PORT}/api/demo/overview`);
      console.log('Demo overview targets count:', demoOverview.targets.length);
      assert.strictEqual(demoOverview.isDemo, true);
      assert.strictEqual(demoOverview.targets.length, 3);

      // 3. Test /api/demo/scans/retail
      const demoScan = await fetchJson(`http://localhost:${PORT}/api/demo/scans/retail`);
      console.log('Demo retail scan score:', demoScan.scan.score);
      assert.strictEqual(demoScan.scan.score, 48);
      assert.strictEqual(demoScan.scan.grade, 'D');

      // 4. Test Single-Port SPA Serving (Root /)
      const htmlContent = await fetchText(`http://localhost:${PORT}/`);
      assert.ok(htmlContent.includes('<div id="root"></div>') || htmlContent.includes('SecureScan'), 'Frontend HTML served properly');

      console.log('🎉 Live API integration and static serving verified successfully!');
      server.close(() => process.exit(0));
    } catch (err) {
      console.error('API Test Error:', err);
      server.close(() => process.exit(1));
    }
  });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

testLiveApi();
