import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

let sqlite: SQLiteConnection;
let db: SQLiteDBConnection;

const tableSchemas: Record<string, string> = {
  items: `CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL
  );`,
  customers: `CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );`,
  orders: `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    items TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );`,
  barcodes: `CREATE TABLE IF NOT EXISTS barcodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id TEXT,
    code TEXT UNIQUE
  );`,
  shift_summaries: `CREATE TABLE IF NOT EXISTS shift_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    total_sales REAL
  );`
};

export const dbReady = (async () => {
  sqlite = new SQLiteConnection(CapacitorSQLite);
  db = await sqlite.createConnection('app_db', false, 'no-encryption', 1, false);
  await db.open();
  for (const schema of Object.values(tableSchemas)) {
    await db.execute(schema);
  }
})();

export interface Item {
  id: string;
  name: string;
  price: number;
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
  const stmt = `INSERT OR REPLACE INTO items (id, name, price) VALUES (?, ?, ?)`;
  for (const item of items) {
    await db.run(stmt, [item.id, item.name, item.price]);
  }
};

export const bulkInsertCustomers = async (customers: Customer[]): Promise<void> => {
  const stmt = `INSERT OR REPLACE INTO customers (id, name) VALUES (?, ?)`;
  for (const c of customers) {
    await db.run(stmt, [c.id, c.name]);
  }
};

export const createOrder = async (order: Order): Promise<void> => {
  const stmt = `INSERT INTO orders (id, customer_id, items) VALUES (?, ?, ?)`;
  const itemsJson = JSON.stringify(order.items);
  await db.run(stmt, [order.id, order.customerId, itemsJson]);
};

export const getCustomersList = async (): Promise<Customer[]> => {
  const result = await db.query(`SELECT id, name FROM customers`);
  return result.values as Customer[] ?? [];
};

export const getItemsList = async (): Promise<Item[]> => {
  const result = await db.query(`SELECT id, name, price FROM items`);
  return result.values as Item[] ?? [];
};
