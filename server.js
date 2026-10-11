import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const db = new Database('store.db');

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(__dirname)); // serves index.html

/* ---------- CREATE TABLES ---------- */
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    cat TEXT,
    stock INTEGER DEFAULT 0,
    delivery INTEGER DEFAULT 3,
    img TEXT,
    desc TEXT,
    createdAt INTEGER
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    createdAt INTEGER
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS stats (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

/* ---------- SEED PRODUCTS (first run only) ---------- */
const count = db.prepare('SELECT COUNT(*) as n FROM products').get().n;
if (count === 0) {
  const seed = [
    ['p1','AirPods Pro (2nd Gen)',49999,'Earbuds',14,3,'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=900&q=80','Active Noise Cancellation, Adaptive Transparency and Personalized Spatial Audio.'],
    ['p2','Studio Wireless Headphones',32500,'Audio',9,4,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80','Over-ear comfort with deep, balanced sound. 40-hour battery.'],
    ['p3','MacBook Air M2 13"',289999,'Laptops',5,5,'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80','Supercharged by the M2 chip. 18-hour battery life.'],
    ['p4','iPhone 15 Pro 256GB',349999,'Phones',7,4,'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=80','Forged in titanium with the A17 Pro chip.'],
    ['p5','Smart Watch Series 9',129999,'Wearables',11,3,'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80','Always-on Retina display, advanced health sensors.'],
    ['p6','Portable Bluetooth Speaker',12999,'Audio',22,2,'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80','360° room-filling sound. 24-hour playtime.'],
    ['p7','Mechanical Keyboard RGB',18500,'Accessories',16,3,'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80','Hot-swappable switches, per-key RGB lighting.'],
    ['p8','65W GaN Fast Charger',6499,'Accessories',34,2,'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80','Charge a laptop, phone and earbuds at once.']
  ];
  const ins = db.prepare(`INSERT INTO products (id,name,price,cat,stock,delivery,img,desc,createdAt)
                          VALUES (?,?,?,?,?,?,?,?,?)`);
  const now = Date.now();
  seed.forEach(p => ins.run(...p, now));
  console.log('✅ Seeded 8 demo products');
}

/* ---------- PRODUCTS API ---------- */
app.get('/api/products', (req, res) => {
  res.json(db.prepare('SELECT * FROM products ORDER BY createdAt DESC').all());
});

app.post('/api/products', (req, res) => {
  const p = req.body;
  const id = p.id || 'p' + Date.now().toString(36);
  db.prepare(`INSERT OR REPLACE INTO products (id,name,price,cat,stock,delivery,img,desc,createdAt)
              VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(id, p.name, p.price, p.cat, p.stock, p.delivery, p.img, p.desc, Date.now());
  res.json({ ok: true, id });
});

app.delete('/api/products/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/* ---------- ORDERS API ---------- */
app.get('/api/orders', (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all();
  res.json(rows.map(r => ({ ...JSON.parse(r.data), status: r.status })));
});

app.post('/api/orders', (req, res) => {
  const o = req.body;
  db.prepare('INSERT INTO orders (id, data, status, createdAt) VALUES (?,?,?,?)')
    .run(o.id, JSON.stringify(o), o.status || 'new', o.createdAt || Date.now());

  // reduce stock
  const upd = db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?');
  o.items.forEach(i => upd.run(i.qty, i.id));

  res.json({ ok: true, id: o.id });
});

app.patch('/api/orders/:id', (req, res) => {
  const { status, deliveryDays } = req.body;
  const row = db.prepare('SELECT data FROM orders WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const data = JSON.parse(row.data);
  if (deliveryDays) data.deliveryDays = deliveryDays;
  db.prepare('UPDATE orders SET status = ?, data = ? WHERE id = ?')
    .run(status || 'new', JSON.stringify(data), req.params.id);
  res.json({ ok: true });
});

app.delete('/api/orders/:id', (req, res) => {
  db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/* ---------- SETTINGS ---------- */
app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  res.json(Object.fromEntries(rows.map(r => [r.key, JSON.parse(r.value)])));
});

app.post('/api/settings', (req, res) => {
  const up = db.prepare('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)');
  Object.entries(req.body).forEach(([k, v]) => up.run(k, JSON.stringify(v)));
  res.json({ ok: true });
});

/* ---------- STATS ---------- */
app.get('/api/stats', (req, res) => {
  const row = db.prepare('SELECT value FROM stats WHERE key = ?').get('main');
  res.json(row ? JSON.parse(row.value) : { visits: 0, views: {}, events: [] });
});

app.post('/api/stats', (req, res) => {
  db.prepare('INSERT OR REPLACE INTO stats (key,value) VALUES (?,?)')
    .run('main', JSON.stringify(req.body));
  res.json({ ok: true });
});

/* ---------- START ---------- */
const PORT = 3000;

/* ---------- SEED DEFAULT SETTINGS ---------- */
const sc = db.prepare('SELECT COUNT(*) as n FROM settings').get().n;
if (sc === 0) {
  const defs = { storeName:'Accessories Store', password:'admin123', jazzcashNumber:'0300 1234567', jazzcashName:'Accessories Store', defaultDelivery:3, shippingFlat:0 };
  const up = db.prepare('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)');
  Object.keys(defs).forEach(k => up.run(k, JSON.stringify(defs[k])));
  console.log('Seeded default settings');
}

/* ---------- BULK SYNC ---------- */
app.post('/api/sync/:entity', (req, res) => {
  const entity = req.params.entity;
  const body = req.body;
  try {
    if (entity === 'products'){
      db.exec('DELETE FROM products');
      const ins = db.prepare('INSERT INTO products (id,name,price,cat,stock,delivery,img,desc,createdAt) VALUES (?,?,?,?,?,?,?,?,?)');
      (body || []).forEach(p => ins.run(p.id, p.name, p.price, p.cat || '', p.stock || 0, p.delivery || 3, p.img || '', p.desc || '', p.createdAt || Date.now()));
    } else if (entity === 'orders'){
      db.exec('DELETE FROM orders');
      const ins = db.prepare('INSERT INTO orders (id, data, status, createdAt) VALUES (?,?,?,?)');
      (body || []).forEach(o => ins.run(o.id, JSON.stringify(o), o.status || 'new', o.createdAt || Date.now()));
    } else if (entity === 'settings'){
      db.exec('DELETE FROM settings');
      const up = db.prepare('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)');
      Object.keys(body || {}).forEach(k => up.run(k, JSON.stringify(body[k])));
    } else if (entity === 'stats'){
      db.prepare('INSERT OR REPLACE INTO stats (key,value) VALUES (?,?)').run('main', JSON.stringify(body || {}));
    } else {
      return res.status(400).json({ error: 'Unknown entity' });
    }
    res.json({ ok: true });
  } catch(e){
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🛍️  Accessories Store running at:`);
  console.log(`    http://localhost:${PORT}\n`);
  console.log(`📦  Database file: store.db (in this folder)\n`);
});