import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const db = new Database('m3allem.db');
export default db;

// Initialize Database Schema
export function initDb() {
  console.log("Initializing database schema...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS languages (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      native_name TEXT NOT NULL,
      is_rtl BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS translations (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL,
      language_code TEXT REFERENCES languages(code),
      value TEXT NOT NULL,
      UNIQUE(key, language_code)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      role TEXT CHECK(role IN ('client', 'artisan', 'seller', 'company', 'admin')),
      password_hash TEXT,
      verified BOOLEAN DEFAULT 0,
      email_verified BOOLEAN DEFAULT 0,
      verification_token TEXT,
      reset_token TEXT,
      reset_token_expires DATETIME,
      avatar_url TEXT,
      points INTEGER DEFAULT 0,
      preferred_language TEXT DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure columns exist for older database versions
  try { db.exec("ALTER TABLE users ADD COLUMN password_hash TEXT;"); } catch(e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN verified BOOLEAN DEFAULT 0;"); } catch(e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT;"); } catch(e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0;"); } catch(e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN preferred_language TEXT DEFAULT 'fr';"); } catch(e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN last_verified DATETIME;"); } catch(e) {}
  try { db.exec("ALTER TABLE translations ADD COLUMN language_code TEXT REFERENCES languages(code);"); } catch(e) {}
  try { db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_translations_key_lang ON translations(key, language_code);"); } catch(e) {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      name TEXT,
      description TEXT,
      logo_url TEXT,
      city TEXT,
      address TEXT,
      is_verified BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      store_id TEXT REFERENCES stores(id),
      name TEXT,
      description TEXT,
      price REAL,
      category TEXT,
      image_url TEXT,
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      name TEXT,
      description TEXT,
      logo_url TEXT,
      city TEXT,
      address TEXT,
      is_verified BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS otps (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      code TEXT,
      expires_at DATETIME,
      verified BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try { db.exec("ALTER TABLE otps ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;"); } catch(e) {}
  try { db.exec("ALTER TABLE otps ADD COLUMN verified BOOLEAN DEFAULT 0;"); } catch(e) {}
  try { db.exec("ALTER TABLE otps ADD COLUMN attempts INTEGER DEFAULT 0;"); } catch(e) {}
  try { db.exec("ALTER TABLE otps ADD COLUMN otp_hash TEXT;"); } catch(e) {}
  try { db.exec("ALTER TABLE otps ADD COLUMN channel TEXT CHECK(channel IN ('sms', 'whatsapp', 'email'));"); } catch(e) {}
  try { db.exec("ALTER TABLE artisan_verifications ADD COLUMN professional_license TEXT;"); } catch(e) {}
  try { db.exec("ALTER TABLE services ADD COLUMN artisan_id TEXT REFERENCES artisans(id);"); } catch(e) {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS phone_verifications (
      id TEXT PRIMARY KEY,
      phone_number TEXT,
      otp_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      attempts INTEGER DEFAULT 0,
      verified BOOLEAN DEFAULT 0
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS artisan_verifications (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      id_document TEXT,
      video_url TEXT,
      skills TEXT,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE,
      icon TEXT,
      commission_rate REAL, -- Nullable to use global settings
      is_active BOOLEAN DEFAULT 1,
      translations TEXT -- JSON: { [lang_code]: { name, description } }
    );

    CREATE TABLE IF NOT EXISTS artisans (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      category_id TEXT REFERENCES categories(id),
      bio TEXT,
      expertise TEXT,
      years_experience INTEGER DEFAULT 0,
      certifications TEXT,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      is_verified BOOLEAN DEFAULT 0,
      is_featured BOOLEAN DEFAULT 0,
      is_online BOOLEAN DEFAULT 0,
      city TEXT,
      latitude REAL,
      longitude REAL,
      service_radius REAL DEFAULT 10, -- in km
      preferred_cities TEXT, -- JSON array of city names
      working_hours TEXT -- JSON: { [day]: { start, end, active } }
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      artisan_id TEXT REFERENCES artisans(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS artisan_portfolio (
      id TEXT PRIMARY KEY,
      artisan_id TEXT REFERENCES artisans(id),
      title TEXT,
      description TEXT,
      image_url TEXT,
      video_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      category_id TEXT REFERENCES categories(id),
      artisan_id TEXT REFERENCES artisans(id),
      title TEXT,
      description TEXT,
      price REAL,
      category_name TEXT,
      image_url TEXT,
      translations TEXT, -- JSON: { [lang_code]: { title, description } }
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      client_id TEXT REFERENCES users(id),
      artisan_id TEXT REFERENCES artisans(id),
      service_id TEXT REFERENCES services(id),
      status TEXT CHECK(status IN ('pending', 'accepted', 'ongoing', 'completed', 'cancelled')),
      price REAL,
      commission_amount REAL,
      location_lat REAL,
      location_lng REAL,
      address TEXT,
      city TEXT,
      description TEXT,
      is_urgent BOOLEAN DEFAULT 0,
      proposed_price REAL,
      attachments TEXT,
      points_earned INTEGER DEFAULT 0,
      points_used INTEGER DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      scheduled_at DATETIME,
      started_at DATETIME,
      finished_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) UNIQUE,
      balance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      wallet_id TEXT REFERENCES wallets(id),
      amount REAL,
      type TEXT CHECK(type IN ('topup', 'payment', 'release', 'withdrawal', 'refund', 'commission')),
      status TEXT CHECK(status IN ('pending', 'completed', 'failed')),
      description TEXT,
      reference_id TEXT, -- order_id or external payment_id
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT REFERENCES orders(id),
      amount REAL,
      method TEXT CHECK(method IN ('cash', 'card', 'wallet', 'paypal', 'stripe', 'cmi')),
      status TEXT CHECK(status IN ('pending', 'completed', 'failed', 'escrow')),
      transaction_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id TEXT PRIMARY KEY,
      order_id TEXT REFERENCES bookings(id),
      client_id TEXT REFERENCES users(id),
      artisan_id TEXT REFERENCES artisans(id),
      stars INTEGER,
      review TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      order_id TEXT REFERENCES orders(id),
      sender_id TEXT REFERENCES users(id),
      receiver_id TEXT REFERENCES users(id),
      content TEXT,
      type TEXT CHECK(type IN ('text', 'voice')) DEFAULT 'text',
      audio_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      title TEXT,
      message TEXT,
      type TEXT CHECK(type IN ('push', 'email', 'reminder')),
      is_read BOOLEAN DEFAULT 0,
      link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      order_id TEXT REFERENCES orders(id),
      artisan_id TEXT REFERENCES artisans(id),
      price REAL,
      status TEXT CHECK(status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try { db.exec("ALTER TABLE artisans ADD COLUMN service_radius REAL DEFAULT 10;"); } catch(e) {}
  try { db.exec("ALTER TABLE artisans ADD COLUMN preferred_cities TEXT;"); } catch(e) {}
  try { db.exec("ALTER TABLE artisans ADD COLUMN working_hours TEXT;"); } catch(e) {}
  try { db.exec("ALTER TABLE bookings ADD COLUMN location_lat REAL;"); } catch(e) {}
  try { db.exec("ALTER TABLE bookings ADD COLUMN location_lng REAL;"); } catch(e) {}
  try { db.exec("ALTER TABLE bookings ADD COLUMN city TEXT;"); } catch(e) {}

  try { db.exec("ALTER TABLE orders ADD COLUMN proposed_price REAL;"); } catch(e) {}
  try { db.exec("ALTER TABLE orders ADD COLUMN attachments TEXT;"); } catch(e) {}
  try { db.exec("ALTER TABLE orders ADD COLUMN started_at DATETIME;"); } catch(e) {}
  try { db.exec("ALTER TABLE orders ADD COLUMN finished_at DATETIME;"); } catch(e) {}
  try { db.exec("ALTER TABLE orders ADD COLUMN points_earned INTEGER DEFAULT 0;"); } catch(e) {}
  try { db.exec("ALTER TABLE orders ADD COLUMN points_used INTEGER DEFAULT 0;"); } catch(e) {}
  try { db.exec("ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0;"); } catch(e) {}
  try { db.exec("ALTER TABLE orders ADD COLUMN package_id TEXT;"); } catch(e) {}
  try { db.exec("ALTER TABLE orders ADD COLUMN group_request_id TEXT;"); } catch(e) {}
  try { db.exec("ALTER TABLE orders ADD COLUMN commission_status TEXT CHECK(commission_status IN ('pending', 'paid')) DEFAULT 'pending';"); } catch(e) {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS packages (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      price REAL,
      discount_percentage REAL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS package_services (
      package_id TEXT REFERENCES packages(id),
      service_id TEXT REFERENCES services(id),
      PRIMARY KEY (package_id, service_id)
    );

    CREATE TABLE IF NOT EXISTS group_requests (
      id TEXT PRIMARY KEY,
      creator_id TEXT REFERENCES users(id),
      artisan_id TEXT REFERENCES artisans(id),
      service_id TEXT REFERENCES services(id),
      title TEXT,
      description TEXT,
      status TEXT CHECK(status IN ('recruiting', 'ready', 'accepted', 'completed', 'cancelled')) DEFAULT 'recruiting',
      min_participants INTEGER DEFAULT 2,
      max_participants INTEGER,
      current_price_per_user REAL,
      location_lat REAL,
      location_lng REAL,
      address TEXT,
      scheduled_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS group_request_participants (
      group_request_id TEXT REFERENCES group_requests(id),
      user_id TEXT REFERENCES users(id),
      status TEXT CHECK(status IN ('joined', 'paid', 'cancelled')) DEFAULT 'joined',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (group_request_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS disputes (
      id TEXT PRIMARY KEY,
      order_id TEXT REFERENCES orders(id),
      client_id TEXT REFERENCES users(id),
      artisan_id TEXT REFERENCES artisans(id),
      reason TEXT,
      description TEXT,
      status TEXT CHECK(status IN ('open', 'in_review', 'resolved', 'closed')) DEFAULT 'open',
      resolution TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cities (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscription_plans (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      price REAL,
      duration_days INTEGER,
      features TEXT, -- JSON string
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      action TEXT,
      entity_type TEXT,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      client_id TEXT REFERENCES users(id),
      artisan_id TEXT REFERENCES artisans(id),
      service_id TEXT REFERENCES services(id),
      delivery_method TEXT CHECK(delivery_method IN ('home_service', 'pickup')),
      location_lat REAL,
      location_lng REAL,
      city TEXT,
      proof_before_client TEXT,
      material_handling TEXT CHECK(material_handling IN ('client_provides', 'artisan_provides', 'buy_from_store')) DEFAULT 'client_provides',
      artisan_proposed_price REAL,
      artisan_proposal_comments TEXT,
      required_materials TEXT, -- JSON string
      client_approved_proposal BOOLEAN DEFAULT 0,
      proof_during_service TEXT,
      proof_after_service TEXT,
      price REAL,
      payment_method TEXT DEFAULT 'cash',
      payment_status TEXT CHECK(payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
      booking_status TEXT CHECK(booking_status IN ('pending', 'proposal_submitted', 'proposal_approved', 'en_route', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
      admin_amount REAL,
      artisan_amount REAL,
      scheduled_at DATETIME,
      is_urgent INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      attachments TEXT
    );
  `);

  try { db.exec("ALTER TABLE bookings ADD COLUMN material_handling TEXT CHECK(material_handling IN ('client_provides', 'artisan_provides', 'buy_from_store')) DEFAULT 'client_provides';"); } catch(e) {}
  try { db.exec("ALTER TABLE bookings ADD COLUMN material_cost REAL DEFAULT 0;"); } catch(e) {}
  try { db.exec("ALTER TABLE bookings ADD COLUMN attachments TEXT;"); } catch(e) {}

  // Seed initial settings if empty
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (settingsCount.count === 0) {
    const insertSetting = db.prepare('INSERT INTO settings (id, key, value) VALUES (?, ?, ?)');
    insertSetting.run(uuidv4(), 'commission_standard', '0.10');
    insertSetting.run(uuidv4(), 'commission_featured', '0.15');
    insertSetting.run(uuidv4(), 'commission_material_standard', '0.05');
    insertSetting.run(uuidv4(), 'commission_material_premium', '0.08');
    insertSetting.run(uuidv4(), 'platform_name', 'M3allem En Click');
    insertSetting.run(uuidv4(), 'contact_email', 'contact@m3allemenclick.ma');
    insertSetting.run(uuidv4(), 'support_phone', '+212 5 22 00 00 00');
    insertSetting.run(uuidv4(), 'commission_rate', '10'); 
    insertSetting.run(uuidv4(), 'commission_material_rate', '5');
    insertSetting.run(uuidv4(), 'default_language', 'en');
  } else {
    // Ensure all required keys exist
    const requiredKeys = [
      ['commission_standard', '0.10'],
      ['commission_featured', '0.15'],
      ['commission_material_standard', '0.05'],
      ['commission_material_premium', '0.08'],
      ['platform_name', 'M3allem En Click'],
      ['contact_email', 'contact@m3allemenclick.ma'],
      ['support_phone', '+212 5 22 00 00 00'],
      ['commission_rate', '10'],
      ['commission_material_rate', '5'],
      ['default_language', 'en']
    ];
    
    const insertIfMissing = db.prepare("INSERT OR IGNORE INTO settings (id, key, value) VALUES (?, ?, ?)");
    requiredKeys.forEach(([key, value]) => {
      insertIfMissing.run(uuidv4(), key, value);
    });
  }

  // Seed initial packages if empty
  const packagesCount = db.prepare('SELECT COUNT(*) as count FROM packages').get() as { count: number };
  if (packagesCount.count === 0) {
    const pkg1Id = uuidv4();
    const pkg2Id = uuidv4();
    
    db.prepare("INSERT INTO packages (id, name, description, price, discount_percentage) VALUES (?, ?, ?, ?, ?)")
      .run(pkg1Id, 'Home Essentials Bundle', 'Plumbing + Electricity + Painting. Perfect for a quick home refresh.', 1500, 15);
    
    db.prepare("INSERT INTO packages (id, name, description, price, discount_percentage) VALUES (?, ?, ?, ?, ?)")
      .run(pkg2Id, 'Deep Clean & Repair', 'Deep Cleaning + AC Maintenance + Minor Repairs.', 1200, 20);

    // Get some service IDs to link
    const services = db.prepare("SELECT id, name FROM services LIMIT 10").all() as any[];
    const plumbing = services.find(s => s.name.toLowerCase().includes('plumbing'))?.id;
    const electricity = services.find(s => s.name.toLowerCase().includes('electricity'))?.id;
    const painting = services.find(s => s.name.toLowerCase().includes('painting'))?.id;
    const cleaning = services.find(s => s.name.toLowerCase().includes('cleaning'))?.id;
    const ac = services.find(s => s.name.toLowerCase().includes('ac'))?.id;

    if (plumbing && electricity && painting) {
      const insertPackageService = db.prepare("INSERT INTO package_services (package_id, service_id) VALUES (?, ?)");
      insertPackageService.run(pkg1Id, plumbing);
      insertPackageService.run(pkg1Id, electricity);
      insertPackageService.run(pkg1Id, painting);
    }
    if (cleaning && ac) {
      const insertPackageService = db.prepare("INSERT INTO package_services (package_id, service_id) VALUES (?, ?)");
      insertPackageService.run(pkg2Id, cleaning);
      insertPackageService.run(pkg2Id, ac);
    }
  }
  // Seed initial group requests if empty
  const groupRequestsCount = db.prepare('SELECT COUNT(*) as count FROM group_requests').get() as { count: number };
  if (groupRequestsCount.count === 0) {
    const users = db.prepare("SELECT id FROM users LIMIT 5").all() as any[];
    const artisans = db.prepare("SELECT id FROM artisans LIMIT 5").all() as any[];
    const services = db.prepare("SELECT id FROM services LIMIT 5").all() as any[];

    if (users.length > 0 && artisans.length > 0 && services.length > 0) {
      db.prepare(`
        INSERT INTO group_requests (
          id, creator_id, artisan_id, service_id, title, description, 
          min_participants, max_participants, current_price_per_user, 
          address, location_lat, location_lng, scheduled_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(), users[0].id, artisans[0].id, services[0].id, 
        'Building AC Maintenance', 'Collective maintenance for all units in Building A.', 
        5, 20, 250, 
        'Maarif, Casablanca', 33.5731, -7.5898, 
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      );

      db.prepare(`
        INSERT INTO group_requests (
          id, creator_id, artisan_id, service_id, title, description, 
          min_participants, max_participants, current_price_per_user, 
          address, location_lat, location_lng, scheduled_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(), users[0].id, artisans[1].id, services[1].id, 
        'Neighborhood Security Setup', 'Group installation of smart doorbells and cameras.', 
        3, 10, 800, 
        'Anfa, Casablanca', 33.5883, -7.6324, 
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      );
    }
  }
  // Seed initial products if empty
  const productsCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (productsCount.count === 0) {
    // Need a seller user first
    const sellerId = uuidv4();
    const sellerPassword = bcrypt.hashSync('seller123', 10);
    db.prepare("INSERT OR IGNORE INTO users (id, name, phone, role, password_hash, verified) VALUES (?, ?, ?, 'seller', ?, 1)")
      .run(sellerId, 'BricoMaroc Seller', '0600000002', sellerPassword);
    
    const storeId = uuidv4();
    db.prepare("INSERT OR IGNORE INTO stores (id, user_id, name, description, city, address, is_verified) VALUES (?, ?, ?, ?, ?, ?, 1)")
      .run(storeId, sellerId, 'BricoMaroc', 'Your one-stop shop for construction materials.', 'Casablanca', '123 Brico St');

    const insertProduct = db.prepare("INSERT OR IGNORE INTO products (id, store_id, name, description, price, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    insertProduct.run(uuidv4(), storeId, 'Professional Tool Kit', 'Complete set for all your home repair needs.', 1200, 'Tools', 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&q=80&w=400', 15);
    insertProduct.run(uuidv4(), storeId, 'Smart LED Panel', 'Energy-efficient lighting for modern homes.', 450, 'Electrical', 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=400', 50);
    insertProduct.run(uuidv4(), storeId, 'Eco-Friendly Paint Set', 'Non-toxic, high-quality paint for interior walls.', 850, 'Painting', 'https://images.unsplash.com/photo-1589939705384-5185138a047a?auto=format&fit=crop&q=80&w=400', 8);
    insertProduct.run(uuidv4(), storeId, 'Digital Multimeter', 'Precise electrical measurements for pros.', 320, 'Electrical', 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&q=80&w=400', 25);
    insertProduct.run(uuidv4(), storeId, 'High-Pressure Washer', 'Powerful cleaning for outdoor surfaces.', 2400, 'Cleaning', 'https://images.unsplash.com/photo-1528190336454-13cd56b45b5a?auto=format&fit=crop&q=80&w=400', 3);
    insertProduct.run(uuidv4(), storeId, 'Safety Gear Bundle', 'Essential protection for construction sites.', 550, 'Safety', 'https://images.unsplash.com/photo-1597484662317-9bd773ee1663?auto=format&fit=crop&q=80&w=400', 120);
  }

  // Seed initial categories if empty
  const categoriesCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (categoriesCount.count === 0) {
    const insertCategory = db.prepare('INSERT INTO categories (id, name, icon, commission_rate) VALUES (?, ?, ?, ?)');
    const cats = [
      ['cat_1', 'Plumbing', 'Droplets', null],
      ['cat_2', 'Electricity', 'Zap', null],
      ['cat_3', 'Carpentry', 'Hammer', null],
      ['cat_4', 'Painting', 'Paintbrush', null],
      ['cat_5', 'Cleaning', 'Sparkles', null],
      ['cat_6', 'AC Repair', 'Wind', null],
      ['cat_7', 'Appliance Repair', 'Cpu', null],
      ['cat_8', 'Construction', 'HardHat', null],
      ['cat_9', 'Gardening', 'Leaf', null],
      ['cat_10', 'Smart Home', 'Smartphone', null],
    ];
    cats.forEach(cat => {
      insertCategory.run(cat[0], cat[1], cat[2], cat[3]);
    });
  }

  // Seed initial cities
  const citiesCount = db.prepare('SELECT COUNT(*) as count FROM cities').get() as { count: number };
  if (citiesCount.count === 0) {
    const insertCity = db.prepare('INSERT INTO cities (id, name) VALUES (?, ?)');
    ['Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Fes', 'Agadir', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan'].forEach(city => {
      insertCity.run(uuidv4(), city);
    });
  }

  // Seed initial subscription plans
  const plansCount = db.prepare('SELECT COUNT(*) as count FROM subscription_plans').get() as { count: number };
  if (plansCount.count === 0) {
    const insertPlan = db.prepare('INSERT INTO subscription_plans (id, name, description, price, duration_days, features) VALUES (?, ?, ?, ?, ?, ?)');
    insertPlan.run(uuidv4(), 'Basic', 'Free plan for individual artisans.', 0, 30, JSON.stringify(['Profile listing', '5 job requests/mo']));
    insertPlan.run(uuidv4(), 'Pro Artisan', 'Enhanced visibility and unlimited requests.', 199, 30, JSON.stringify(['Featured badge', 'Unlimited job requests', 'Priority support']));
    insertPlan.run(uuidv4(), 'Enterprise', 'For large service companies.', 999, 30, JSON.stringify(['Team management', 'Advanced analytics', 'Dedicated account manager']));
  }

  // Seed initial disputes if empty
  const disputesCount = db.prepare('SELECT COUNT(*) as count FROM disputes').get() as { count: number };
  if (disputesCount.count === 0) {
    const orders = db.prepare("SELECT id, client_id, artisan_id FROM orders LIMIT 3").all() as any[];
    if (orders.length > 0) {
      db.prepare("INSERT INTO disputes (id, order_id, client_id, artisan_id, reason, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(uuidv4(), orders[0].id, orders[0].client_id, orders[0].artisan_id, 'Service not as described', 'The artisan did not complete the painting as agreed.', 'open');
    }
  }

  // Seed initial artisans and portfolios if empty
  const artisansCount = db.prepare('SELECT COUNT(*) as count FROM artisans').get() as { count: number };
  if (artisansCount.count === 0) {
    const defaultHash = bcrypt.hashSync('password123', 10);
    const insertUser = db.prepare('INSERT OR IGNORE INTO users (id, name, phone, role, password_hash, verified, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const insertArtisan = db.prepare('INSERT OR IGNORE INTO artisans (id, user_id, category_id, bio, expertise, years_experience, certifications, rating, review_count, is_verified, is_online) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const insertPortfolio = db.prepare('INSERT OR IGNORE INTO artisan_portfolio (id, artisan_id, title, description, image_url, video_url) VALUES (?, ?, ?, ?, ?, ?)');

    // Seed admin
    insertUser.run('super_admin', 'Super Admin', '0699999999', 'admin', defaultHash, 1, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400');

    // Seed seller
    insertUser.run('seller_1', 'Brico Seller', '0611111111', 'seller', defaultHash, 1, 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80&w=400');
    db.prepare('INSERT OR IGNORE INTO stores (id, user_id, name, description, city, address, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)').run('store_1', 'seller_1', 'BricoMaroc', 'Your one-stop shop for construction materials.', 'Casablanca', '123 Brico St', 1);

    // Seed company
    insertUser.run('company_1', 'BuildPro Manager', '0622222222', 'company', defaultHash, 1, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400');
    db.prepare('INSERT OR IGNORE INTO companies (id, user_id, name, city, address, is_verified) VALUES (?, ?, ?, ?, ?, ?)').run('comp_1', 'company_1', 'BuildPro Construction', 'Rabat', '456 Build Ave', 1);

    const artisans = [
      {
        id: 'art_1',
        user_id: 'user_art_1',
        name: 'Karim Tazi',
        phone: '0612345678',
        category_id: 'cat_1',
        bio: 'Master Plumber with over 15 years of experience in residential and commercial plumbing.',
        expertise: 'Leak detection, pipe replacement, bathroom renovation',
        years_experience: 15,
        certifications: 'Certified Master Plumber (CMP), OSHA 30-Hour Construction Safety',
        rating: 4.9,
        review_count: 128,
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'art_2',
        user_id: 'user_art_2',
        name: 'Yassine Benani',
        phone: '0687654321',
        category_id: 'cat_2',
        bio: 'Senior Electrician specializing in smart home installations and industrial wiring.',
        expertise: 'Smart home setup, electrical safety audits, panel upgrades',
        years_experience: 10,
        certifications: 'Licensed Electrician, Smart Home Automation Specialist',
        rating: 4.8,
        review_count: 94,
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'art_3',
        user_id: 'user_art_3',
        name: 'Ahmed Sabiri',
        phone: '0600000001',
        category_id: 'cat_4',
        bio: 'Professional interior painter with a keen eye for detail and color harmony.',
        expertise: 'Wall painting, wallpaper installation, decorative finishes',
        years_experience: 8,
        certifications: 'Certified Lead Renovator',
        rating: 5.0,
        review_count: 42,
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'art_4',
        user_id: 'user_art_4',
        name: 'Sarah Mansouri',
        phone: '0600000005',
        category_id: 'cat_5',
        bio: 'Dedicated cleaning professional providing top-notch residential and office cleaning services.',
        expertise: 'Deep cleaning, office maintenance, eco-friendly products',
        years_experience: 5,
        certifications: 'ISSA Cleaning Industry Management Standard (CIMS)',
        rating: 4.7,
        review_count: 215,
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'art_5',
        user_id: 'user_art_5',
        name: 'Omar Mansouri',
        phone: '0600000003',
        category_id: 'cat_6',
        bio: 'Expert AC repair technician with fast response times.',
        expertise: 'AC installation, maintenance, repair',
        years_experience: 7,
        certifications: 'EPA Section 608 Certification',
        rating: 4.6,
        review_count: 67,
        avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'art_6',
        user_id: 'user_art_6',
        name: 'Said El Amrani',
        phone: '0600000004',
        category_id: 'cat_8',
        bio: 'Experienced construction worker and mason.',
        expertise: 'Masonry, tiling, general construction',
        years_experience: 12,
        certifications: 'Certified Masonry Contractor',
        rating: 4.9,
        review_count: 89,
        avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400'
      }
    ];

    artisans.forEach((a: any) => {
      insertUser.run(a.user_id, a.name, a.phone, a.role || 'artisan', defaultHash, 1, a.avatar_url);
      if ((a.role || 'artisan') === 'artisan') {
        insertArtisan.run(a.id, a.user_id, a.category_id, a.bio, a.expertise, a.years_experience, a.certifications, a.rating, a.review_count, 1, 1);
      }
      
      // Add some portfolio items
      if (a.id === 'art_1') {
        insertPortfolio.run('port_1', a.id, 'Bathroom Renovation', 'Complete overhaul of a luxury bathroom in Casablanca.', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800', null);
        insertPortfolio.run('port_2', a.id, 'Industrial Pipework', 'Installation of high-pressure water systems for a local factory.', 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800', 'https://www.w3schools.com/html/mov_bbb.mp4');
      } else if (a.id === 'art_2') {
        insertPortfolio.run('port_3', a.id, 'Smart Home Integration', 'Full automation of lighting and security for a modern villa.', 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800', null);
      } else if (a.id === 'art_3') {
        insertPortfolio.run('port_4', a.id, 'Modern Living Room', 'Elegant grey and gold theme for a spacious living area.', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800', null);
      } else if (a.id === 'art_4') {
        insertPortfolio.run('port_5', a.id, 'Office Deep Clean', 'Post-renovation cleaning for a 500sqm office space.', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=800', null);
      }
    });

    // Seed default settings
    const insertSetting = db.prepare("INSERT OR IGNORE INTO settings (id, key, value) VALUES (?, ?, ?)");
    insertSetting.run(uuidv4(), 'commission_standard', '0.10');
    insertSetting.run(uuidv4(), 'commission_featured', '0.15');
    insertSetting.run(uuidv4(), 'commission_material_standard', '0.05');
    insertSetting.run(uuidv4(), 'commission_material_premium', '0.08');

  // Seed initial languages if empty
  const languagesCount = db.prepare('SELECT COUNT(*) as count FROM languages').get() as { count: number };
  if (languagesCount.count === 0) {
    const insertLanguage = db.prepare('INSERT INTO languages (code, name, native_name, is_rtl, is_active) VALUES (?, ?, ?, ?, ?)');
    insertLanguage.run('en', 'English', 'English', 0, 1);
    insertLanguage.run('fr', 'French', 'Français', 0, 1);
    insertLanguage.run('ar', 'Arabic', 'العربية', 1, 1);
  }

  // Seed initial translations if empty
  const translationsCount = db.prepare('SELECT COUNT(*) as count FROM translations').get() as { count: number };
  if (translationsCount.count === 0) {
    const insertTranslation = db.prepare('INSERT INTO translations (id, key, language_code, value) VALUES (?, ?, ?, ?)');
    
    // UI Elements
    const ui = [
      { key: 'nav_home', fr: 'Accueil', en: 'Home', ar: 'الرئيسية' },
      { key: 'nav_find', fr: 'Trouver', en: 'Find', ar: 'بحث' },
      { key: 'nav_store', fr: 'Boutique', en: 'Store', ar: 'المتجر' },
      { key: 'nav_messages', fr: 'Messages', en: 'Messages', ar: 'الرسائل' },
      { key: 'nav_profile', fr: 'Profil', en: 'Profile', ar: 'الملف الشخصي' },
      { key: 'btn_book', fr: 'Réserver', en: 'Book Now', ar: 'احجز الآن' },
      { key: 'btn_chat', fr: 'Discuter', en: 'Chat', ar: 'دردشة' },
      { key: 'btn_login', fr: 'Connexion', en: 'Login', ar: 'تسجيل الدخول' },
      { key: 'btn_signup', fr: 'S\'inscrire', en: 'Sign Up', ar: 'إنشاء حساب' },
      { key: 'lang_switcher', fr: 'Langue', en: 'Language', ar: 'اللغة' },
    ];

    ui.forEach(u => {
      insertTranslation.run(uuidv4(), u.key, 'fr', u.fr);
      insertTranslation.run(uuidv4(), u.key, 'en', u.en);
      insertTranslation.run(uuidv4(), u.key, 'ar', u.ar);
    });

    // Booking Statuses
    const statuses = [
      { key: 'status_pending', fr: 'En attente', en: 'Pending', ar: 'قيد الانتظار' },
      { key: 'status_proposal_submitted', fr: 'Proposition soumise', en: 'Proposal Submitted', ar: 'تم تقديم الاقتراح' },
      { key: 'status_proposal_approved', fr: 'Proposition approuvée', en: 'Proposal Approved', ar: 'تمت الموافقة على الاقتراح' },
      { key: 'status_in_progress', fr: 'En cours', en: 'In Progress', ar: 'قيد التنفيذ' },
      { key: 'status_completed', fr: 'Terminé', en: 'Completed', ar: 'مكتمل' },
      { key: 'status_cancelled', fr: 'Annulé', en: 'Cancelled', ar: 'ملغى' }
    ];

    statuses.forEach(s => {
      insertTranslation.run(uuidv4(), s.key, 'fr', s.fr);
      insertTranslation.run(uuidv4(), s.key, 'en', s.en);
      insertTranslation.run(uuidv4(), s.key, 'ar', s.ar);
    });

    // Notifications
    const notifications = [
      { key: 'notif_new_booking_title', fr: 'Nouvelle demande', en: 'New Request', ar: 'طلب جديد' },
      { key: 'notif_new_booking_msg', fr: 'Vous avez une nouvelle demande de réservation.', en: 'You have a new booking request.', ar: 'لديك طلب حجز جديد.' },
      { key: 'notif_proposal_received_title', fr: 'Proposition reçue', en: 'Proposal Received', ar: 'تم استلام اقتراح' },
      { key: 'notif_proposal_received_msg', fr: 'L\'artisan a soumis une proposition.', en: 'The artisan has submitted a proposal.', ar: 'قدم الحرفي اقتراحًا.' },
      { key: 'notif_proposal_approved_title', fr: 'Proposition approuvée', en: 'Proposal Approved', ar: 'تمت الموافقة على الاقتراح' },
      { key: 'notif_proposal_approved_msg', fr: 'Le client a approuvé votre proposition. Vous pouvez commencer.', en: 'The client has approved your proposal. You can start.', ar: 'وافق العميل على اقتراحك. يمكنك البدء.' },
      { key: 'notif_status_updated_title', fr: 'Statut mis à jour', en: 'Status Updated', ar: 'تم تحديث الحالة' },
      { key: 'notif_status_updated_msg', fr: 'Le statut de votre réservation est maintenant: {{status}}', en: 'Your booking status is now: {{status}}', ar: 'حالة حجزك الآن هي: {{status}}' },
      { key: 'notif_proof_uploaded_title', fr: 'Preuve téléchargée', en: 'Proof Uploaded', ar: 'تم تحميل الإثبات' },
      { key: 'notif_proof_uploaded_msg', fr: 'L\'artisan a téléchargé une preuve pour le service.', en: 'The artisan has uploaded a proof for the service.', ar: 'قام الحرفي بتحميل إثبات للخدمة.' },
      { key: 'notif_new_job_request_title', fr: 'Nouvelle opportunité', en: 'New Job Opportunity', ar: 'فرصة عمل جديدة' },
      { key: 'notif_new_job_request_msg', fr: 'Une nouvelle demande pour {{service}} est disponible près de chez vous.', en: 'A new request for {{service}} is available near you.', ar: 'يتوفر طلب جديد لـ {{service}} بالقرب منك.' }
    ];

    notifications.forEach(n => {
      insertTranslation.run(uuidv4(), n.key, 'fr', n.fr);
      insertTranslation.run(uuidv4(), n.key, 'en', n.en);
      insertTranslation.run(uuidv4(), n.key, 'ar', n.ar);
    });
  }
  }
}
