import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

let sqlite: SQLiteConnection;
let db: SQLiteDBConnection;

export interface TableSchema {
  create: string;
  columns: Record<string, string>;
}

export const tableSchemas: Record<string, TableSchema> = {
  items: {
    create: `CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT
    );`,
    columns: {
      id: 'id TEXT PRIMARY KEY',
      name: 'name TEXT NOT NULL',
      price: 'price REAL NOT NULL',
      image: 'image TEXT',
    },
  },
  customers: {
    create: `CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT
    );`,
    columns: {
      id: 'id TEXT PRIMARY KEY',
      name: 'name TEXT NOT NULL',
      email: 'email TEXT',
      phone: 'phone TEXT',
    },
  },
  orders: {
    create: `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT,
      items TEXT,
      total REAL,
      is_synced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );`,
    columns: {
      id: 'id TEXT PRIMARY KEY',
      customer_id: 'customer_id TEXT',
      items: 'items TEXT',
      total: 'total REAL',
      is_synced: 'is_synced INTEGER DEFAULT 0',
      created_at: "created_at TEXT DEFAULT (datetime('now'))",
    },
  },
  barcodes: {
    create: `CREATE TABLE IF NOT EXISTS barcodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id TEXT,
      code TEXT UNIQUE
    );`,
    columns: {
      id: 'id INTEGER PRIMARY KEY AUTOINCREMENT',
      item_id: 'item_id TEXT',
      code: 'code TEXT UNIQUE',
    },
  },
  item_units: {
    create: `CREATE TABLE IF NOT EXISTS item_units (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      unit TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT
    );`,
    columns: {
      id: 'id TEXT PRIMARY KEY',
      item_id: 'item_id TEXT NOT NULL',
      unit: 'unit TEXT NOT NULL',
      price: 'price REAL NOT NULL',
      image: 'image TEXT',
    },
  },
};

export interface DBLike {
  execute: (sql: string) => Promise<any>;
  query: (sql: string) => Promise<{ values?: any[] }>;
}

const SCHEMA_VERSION = 1;

export const runMigrations = async (conn: DBLike): Promise<void> => {
  const versionRes = await conn.query('PRAGMA user_version');
  const currentVersion = versionRes.values?.[0]?.user_version ?? 0;

  for (const { create } of Object.values(tableSchemas)) {
    await conn.execute(create);
  }

  for (const [table, schema] of Object.entries(tableSchemas)) {
    const info = await conn.query(`PRAGMA table_info(${table});`);
    const existing = info.values?.map((r: any) => r.name) ?? [];
    for (const [col, def] of Object.entries(schema.columns)) {
      if (!existing.includes(col)) {
        await conn.execute(`ALTER TABLE ${table} ADD COLUMN ${def};`);
      }
    }
  }

  if (currentVersion < SCHEMA_VERSION) {
    await conn.execute(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }
};

export const dbReady = (async () => {
  sqlite = new SQLiteConnection(CapacitorSQLite);
  db = await sqlite.createConnection('app_db', false, 'no-encryption', 1, false);
  await db.open();
  await runMigrations(db);
})();

export interface Item {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
}

export interface OrderItem {
  itemId: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
}

export const bulkInsertItems = async (items: Item[]): Promise<void> => {
  const stmt = `INSERT OR REPLACE INTO items (id, name, price, image) VALUES (?, ?, ?, ?)`;
  for (const item of items) {
    await db.run(stmt, [item.id, item.name, item.price, item.image ?? null]);
  }
};

export const bulkInsertCustomers = async (customers: Customer[]): Promise<void> => {
  const stmt = `INSERT OR REPLACE INTO customers (id, name) VALUES (?, ?)`;
  for (const c of customers) {
    await db.run(stmt, [c.id, c.name]);
  }
};

export const createOrder = async (order: Order, isSynced = 1): Promise<void> => {
  const stmt = `INSERT INTO orders (id, customer_id, items, is_synced) VALUES (?, ?, ?, ?)`;
  const itemsJson = JSON.stringify(order.items);
  await db.run(stmt, [order.id, order.customerId, itemsJson, isSynced]);
};

export const getUnsyncedOrders = async (): Promise<Order[]> => {
  const result = await db.query(`SELECT id, customer_id, items FROM orders WHERE is_synced = 0`);
  const rows = result.values ?? [];
  return rows.map((r: any) => ({
    id: r.id,
    customerId: r.customer_id,
    items: JSON.parse(r.items) as OrderItem[],
  }));
};

export const markOrderSynced = async (id: string): Promise<void> => {
  await db.run(`UPDATE orders SET is_synced = 1 WHERE id = ?`, [id]);
};

export const getCustomersList = async (): Promise<Customer[]> => {
  const result = await db.query(`SELECT id, name FROM customers`);
  return result.values as Customer[] ?? [];
};

export const getItemsList = async (): Promise<Item[]> => {
  const result = await db.query(`SELECT id, name, price, image FROM items`);
  return (result.values as Item[] ?? []);
};
