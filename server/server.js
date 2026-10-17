import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;
const JWT_SECRET = process.env.JWT_SECRET || 'novamarket_super_enterprise_jwt_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend in production if built
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// In-Memory / File-Persisted Database
const DB_FILE = path.join(__dirname, 'database.json');

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading DB_FILE:', e);
  }
  return {
    users: [],
    orders: [],
    inventory: {},
    auditLogs: []
  };
}

function saveDB(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving DB_FILE:', e);
  }
}

let db = loadDB();

// Initialize superadmin if not present
(async () => {
  const superadminEmail = process.env.INITIAL_SUPERADMIN_EMAIL || 'admin@novamarket.uz';
  const superadminPass = process.env.INITIAL_SUPERADMIN_PASS || 'NovaMarket2026!Secure';
  const exists = db.users.find(u => u.email === superadminEmail);
  if (!exists) {
    const hashedPassword = await bcrypt.hash(superadminPass, 10);
    db.users.push({
      id: 'usr_superadmin_01',
      name: 'Super Administrator',
      email: superadminEmail,
      password: hashedPassword,
      role: 'superadmin',
      createdAt: new Date().toISOString()
    });
    saveDB(db);
    console.log(`[AUTH] Initial Superadmin seeded: ${superadminEmail}`);
  }
})();

// RBAC Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Autentifikatsiya tokeni topilmadi' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Token yaroqsiz yoki muddati o‘tgan' });
    req.user = user;
    next();
  });
}

function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Ushbu amalni bajarish uchun sizda yetarli ruxsat yo‘q'
      });
    }
    next();
  };
}

// ================= API ENDPOINTS =================

// 1. Health check (Crucial for Render / Monitoring)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'NovaMarket Enterprise API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 2. Authentication
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Barcha maydonlar to‘ldirilishi shart' });
    }
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Ushbu email bilan ro‘yxatdan o‘tilgan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: 'usr_' + Date.now(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'customer',
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDB(db);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true,
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Ro‘yxatdan o‘tishda xatolik yuz berdi' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email yoki parol noto‘g‘ri' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email yoki parol noto‘g‘ri' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Kirishda xatolik yuz berdi' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// 3. Orders with Server-Side Validation & Atomic Inventory Control
app.post('/api/orders', (req, res) => {
  try {
    const { items, customer, deliveryAddress, paymentMethod, installmentMonths } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Savatcha bo‘sh' });
    }
    if (!customer || !customer.phone || !customer.name) {
      return res.status(400).json({ success: false, message: 'Mijoz ma’lumotlari to‘liq emas' });
    }

    // Load server product catalog to re-validate prices independently
    const catalogPath = path.join(__dirname, '../src/data/products.js');
    let catalog = [];
    if (fs.existsSync(catalogPath)) {
      const catText = fs.readFileSync(catalogPath, 'utf8');
      const start = catText.indexOf('[');
      const end = catText.lastIndexOf(']') + 1;
      catalog = JSON.parse(catText.substring(start, end));
    }

    // Server-side calculation & Atomic Inventory Check
    let serverTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const catalogItem = catalog.find(c => c.id === item.id);
      if (!catalogItem) {
        return res.status(400).json({ success: false, message: `Mahsulot katalogda topilmadi: ID ${item.id}` });
      }

      const qty = parseInt(item.quantity, 10) || 1;
      if (qty <= 0) {
        return res.status(400).json({ success: false, message: 'Mahsulot miqdori musbat bo‘lishi shart' });
      }

      // Check current inventory
      const currentStock = db.inventory[item.id] !== undefined ? db.inventory[item.id] : (catalogItem.inStock || 25);
      if (currentStock < qty) {
        return res.status(400).json({
          success: false,
          message: `Omborda mahsulot yetarli emas: ${catalogItem.name}. Mavjud: ${currentStock} ta`
        });
      }

      // Decrement stock atomically
      db.inventory[item.id] = currentStock - qty;

      const unitPrice = catalogItem.price; // ALWAYS take server verified price
      serverTotal += unitPrice * qty;

      validatedItems.push({
        id: catalogItem.id,
        name: catalogItem.name,
        price: unitPrice,
        oldPrice: catalogItem.oldPrice,
        image: catalogItem.image,
        category: catalogItem.category,
        quantity: qty,
        itemTotal: unitPrice * qty
      });
    }

    const orderId = 'ORD-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 900 + 100);
    const orderDate = new Date();
    const deliveryDays = 1;
    const estimatedDelivery = new Date(orderDate.getTime() + deliveryDays * 24 * 60 * 60 * 1000).toISOString();

    const newOrder = {
      id: orderId,
      items: validatedItems,
      totalAmount: serverTotal,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim()
      },
      deliveryAddress: deliveryAddress || 'Toshkent shahri',
      deliveryDays,
      createdAt: orderDate.toISOString(),
      estimatedDelivery,
      paymentMethod: paymentMethod || 'cash',
      installmentMonths: installmentMonths || null,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: orderDate.toISOString(),
          note: 'Buyurtma tizimda qabul qilindi'
        }
      ]
    };

    db.orders.unshift(newOrder);

    // Audit log
    db.auditLogs.unshift({
      id: 'log_' + Date.now(),
      action: 'ORDER_CREATED',
      target: orderId,
      details: `Mijoz ${customer.name} tomonidan ${serverTotal.toLocaleString()} so'mlik buyurtma yaratildi`,
      performedBy: customer.name,
      timestamp: new Date().toISOString()
    });

    saveDB(db);

    res.json({
      success: true,
      message: 'Buyurtma muvaffaqiyatli qabul qilindi',
      order: newOrder
    });
  } catch (e) {
    console.error('Order creation error:', e);
    res.status(500).json({ success: false, message: 'Buyurtma yaratishda server xatoligi yuz berdi' });
  }
});

// 4. Update Order Status (RBAC protected)
const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'return_requested'],
  delivered: ['return_requested'],
  return_requested: ['returned', 'delivered'],
  cancelled: [],
  returned: []
};

app.patch('/api/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus, adminNote, performedBy } = req.body;

    const order = db.orders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });
    }

    const currentStatus = order.status;
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `'${currentStatus}' holatidan '${newStatus}' holatiga o‘tish mumkin emas`
      });
    }

    // Business rule: If cancelled, restore stock
    if (newStatus === 'cancelled' && currentStatus !== 'cancelled') {
      for (const it of order.items) {
        if (db.inventory[it.id] !== undefined) {
          db.inventory[it.id] += it.quantity;
        }
      }
    }

    order.status = newStatus;
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: adminNote || `Holat o‘zgartirildi: ${newStatus}`,
      performedBy: performedBy || 'Admin'
    });

    db.auditLogs.unshift({
      id: 'log_' + Date.now(),
      action: 'ORDER_STATUS_CHANGED',
      target: id,
      details: `${currentStatus} -> ${newStatus}. Izoh: ${adminNote || 'Yo‘q'}`,
      performedBy: performedBy || 'Admin',
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Holatni yangilashda xatolik' });
  }
});

// 5. Admin / Audit Logs & Inventory Endpoints
app.get('/api/admin/orders', (req, res) => {
  res.json({ success: true, orders: db.orders });
});

app.get('/api/admin/audit-logs', (req, res) => {
  res.json({ success: true, auditLogs: db.auditLogs });
});

app.get('/api/admin/inventory', (req, res) => {
  res.json({ success: true, inventory: db.inventory });
});

// 6. Automated Backup & Restore Endpoints
app.post('/api/admin/backup', (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filename = `backup_novamarket_${Date.now()}.json`;
    const filepath = path.join(backupDir, filename);

    const snapshot = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: db
    };

    fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), 'utf8');

    db.auditLogs.unshift({
      id: 'log_' + Date.now(),
      action: 'DATABASE_BACKUP_CREATED',
      target: filename,
      details: `Ma’lumotlar bazasining zaxira nusxasi yaratildi: ${filename}`,
      performedBy: 'System / Admin',
      timestamp: new Date().toISOString()
    });
    saveDB(db);

    res.json({
      success: true,
      message: 'Zaxira nusxasi muvaffaqiyatli yaratildi',
      filename,
      size: fs.statSync(filepath).size
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Zaxira nusxasi yaratishda xatolik' });
  }
});

app.post('/api/admin/restore', (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ success: false, message: 'Fayl nomi ko‘rsatilmadi' });
    }

    const filepath = path.join(__dirname, '../backups', filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ success: false, message: 'Zaxira fayli topilmadi' });
    }

    const snapshot = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    if (!snapshot.data || !Array.isArray(snapshot.data.orders)) {
      return res.status(400).json({ success: false, message: 'Zaxira fayli formati yaroqsiz' });
    }

    db = snapshot.data;
    saveDB(db);

    res.json({
      success: true,
      message: 'Ma’lumotlar bazasi zaxira nusxasidan muvaffaqiyatli tiklandi',
      restoredOrdersCount: db.orders.length,
      timestamp: snapshot.timestamp
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Qayta tiklashda xatolik yuz berdi' });
  }
});

// Fallback to index.html for SPA routing if dist exists
if (fs.existsSync(distPath)) {
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[NovaMarket Enterprise Server] running on http://localhost:${PORT}`);
    console.log(`[NovaMarket Enterprise Server] Healthcheck available at http://localhost:${PORT}/api/health`);
  });
}

export default app;
