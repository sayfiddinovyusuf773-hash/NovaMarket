import assert from 'assert';
import http from 'http';

const BASE_URL = 'http://localhost:5050';

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5050,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5050,
      path,
      method: 'GET',
      headers: {}
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Healthcheck Test ---');
  const health = await get('/api/health');
  assert.strictEqual(health.status, 200);
  assert.strictEqual(health.data.status, 'healthy');
  console.log('✅ Healthcheck passed');

  console.log('--- 2. Superadmin Login Test ---');
  const login = await post('/api/auth/login', {
    email: 'admin@novamarket.uz',
    password: 'NovaMarket2026!Secure'
  });
  assert.strictEqual(login.status, 200);
  assert.strictEqual(login.data.success, true);
  assert.strictEqual(login.data.user.role, 'superadmin');
  const adminToken = login.data.token;
  console.log('✅ Superadmin authentication passed');

  console.log('--- 3. Server-Side Price Calculation & Order Creation ---');
  const orderRes = await post('/api/orders', {
    items: [{ id: 1001, quantity: 2, price: 100 }], // Send bogus price: server should ignore it and use real price
    customer: { name: 'Alisher Navoiy', phone: '+998901234567' },
    deliveryAddress: 'Toshkent sh., Chilonzor 19-mavze',
    paymentMethod: 'click'
  });
  assert.strictEqual(orderRes.status, 200);
  assert.strictEqual(orderRes.data.success, true);
  // Real item 1001 price is 16,890,000. For qty 2 = 33,780,000
  assert.strictEqual(orderRes.data.order.totalAmount, 33780000);
  assert.strictEqual(orderRes.data.order.items[0].price, 16890000);
  console.log(`✅ Server price protection verified: Client spoofed price 100 ignored, server calculated ${orderRes.data.order.totalAmount.toLocaleString()} UZS`);

  console.log('--- 4. Automated Backup & Recovery Validation ---');
  const backupRes = await post('/api/admin/backup', {}, adminToken);
  assert.strictEqual(backupRes.status, 200);
  assert.strictEqual(backupRes.data.success, true);
  assert.ok(backupRes.data.filename);
  console.log(`✅ Database backup created: ${backupRes.data.filename} (${backupRes.data.size} bytes)`);

  const restoreRes = await post('/api/admin/restore', { filename: backupRes.data.filename }, adminToken);
  assert.strictEqual(restoreRes.status, 200);
  assert.strictEqual(restoreRes.data.success, true);
  console.log(`✅ Test recovery passed: ${restoreRes.data.restoredOrdersCount} orders restored successfully`);

  console.log('\n🌟 ALL ENTERPRISE BACKEND SECURITY TESTS PASSED PERFECTLY! 🌟');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
