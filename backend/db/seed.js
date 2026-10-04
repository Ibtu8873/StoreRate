const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { createTables } = require('./init');

async function seedData() {
  await createTables();

  // Check if users already exist
  const [existingUsers] = await db.query('SELECT COUNT(*) AS count FROM users');
  const count = existingUsers[0].count || existingUsers[0]['COUNT(*)'] || 0;
  if (count > 0) {
    console.log(`[Database Seed] Database already contains ${count} users. Skipping seeding.`);
    return;
  }

  console.log('[Database Seed] Seeding demo users, stores, and ratings...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const ownerPassword = await bcrypt.hash('Owner@123', 10);
  const userPassword = await bcrypt.hash('User@1234', 10);

  // 1. Insert Users
  // Admin
  const [adminRes] = await db.query(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    ['System Administrator Official', 'admin@ratehub.com', adminPassword, '100 Administrative Plaza, Silicon Boulevard, Suite 500, Metro City', 'admin']
  );

  // Owners
  const [owner1Res] = await db.query(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    ['Alexander Wright Store Owner', 'owner.alex@ratehub.com', ownerPassword, '250 Market Central Road, Retail District, Floor 2, Metro City', 'owner']
  );
  const owner1Id = owner1Res.insertId;

  const [owner2Res] = await db.query(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    ['Beatrice Morgan Store Owner', 'owner.beatrice@ratehub.com', ownerPassword, '742 Evergreen Galleria, North Wing, Avenue 4, Metro City', 'owner']
  );
  const owner2Id = owner2Res.insertId;

  // Normal Users
  const [user1Res] = await db.query(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    ['Christopher Nolan Consumer', 'user.chris@ratehub.com', userPassword, '12 Pinecrest Residences, Apartment 4B, South Suburbia, Metro City', 'user']
  );
  const user1Id = user1Res.insertId;

  const [user2Res] = await db.query(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    ['Diana Prince Prime Shopper', 'user.diana@ratehub.com', userPassword, '88 Horizon Heights, Penthouse 12, West Hills, Metro City', 'user']
  );
  const user2Id = user2Res.insertId;

  // 2. Insert Stores
  const [store1Res] = await db.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    ['Apex Electronics Superstore', 'contact@apexelectronics.com', '250 Market Central Road, Retail District, Floor 2, Metro City', owner1Id]
  );
  const store1Id = store1Res.insertId;

  const [store2Res] = await db.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    ['The Artisan Book & Coffee Co', 'hello@artisanbooks.com', '742 Evergreen Galleria, North Wing, Avenue 4, Metro City', owner2Id]
  );
  const store2Id = store2Res.insertId;

  const [store3Res] = await db.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    ['Green Valley Organic Market', 'support@greenvalleymarket.com', '104 Harvest Lane, Farmers Quarter, Sector 9, Metro City', owner1Id]
  );
  const store3Id = store3Res.insertId;

  // 3. Insert Ratings
  // Christopher rates Store 1 (5 stars) and Store 2 (4 stars)
  await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [user1Id, store1Id, 5]);
  await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [user1Id, store2Id, 4]);

  // Diana rates Store 1 (4 stars) and Store 3 (5 stars)
  await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [user2Id, store1Id, 4]);
  await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [user2Id, store3Id, 5]);

  console.log('[Database Seed] Demo data created successfully:');
  console.log(' - Admin: admin@ratehub.com / Admin@123');
  console.log(' - Owner 1: owner.alex@ratehub.com / Owner@123 (Apex Electronics & Green Valley)');
  console.log(' - Owner 2: owner.beatrice@ratehub.com / Owner@123 (The Artisan Book & Coffee)');
  console.log(' - User 1: user.chris@ratehub.com / User@1234');
  console.log(' - User 2: user.diana@ratehub.com / User@1234');
}

if (require.main === module) {
  seedData()
    .then(() => {
      console.log('[Database Seed] Seeding completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Database Seed Error]:', err);
      process.exit(1);
    });
}

module.exports = {
  seedData
};
