import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@capacitor-community/sqlite', () => ({
  CapacitorSQLite: {},
  SQLiteConnection: class {
    async createConnection() {
      return {
        open: async () => {},
        execute: async () => {},
        query: async () => ({ values: [] }),
      };
    }
  },
  SQLiteDBConnection: class {},
}));

import initSqlJs from 'sql.js';
import { tableSchemas, runMigrations, DBLike } from '../lib/db';

class SqlJsDB implements DBLike {
  constructor(private db: any) {}

  async execute(sql: string): Promise<any> {
    this.db.run(sql);
  }

  async query(sql: string): Promise<{ values?: any[] }> {
    const res = this.db.exec(sql);
    if (res.length === 0) return { values: [] };
    const { columns, values } = res[0];
    const rows = values.map((row: any[]) => {
      const obj: Record<string, any> = {};
      row.forEach((v, i) => {
        obj[columns[i]] = v;
      });
      return obj;
    });
    return { values: rows };
  }
}

describe('database migrations', () => {
  let db: SqlJsDB;

  beforeEach(async () => {
    const SQL = await initSqlJs();
    db = new SqlJsDB(new SQL.Database());
    await runMigrations(db);
  });

  for (const [table, schema] of Object.entries(tableSchemas)) {
    it(`ensures ${table} has all columns`, async () => {
      const info = await db.query(`PRAGMA table_info(${table});`);
      const cols = info.values?.map((r: any) => r.name) ?? [];
      expect(cols).toEqual(expect.arrayContaining(Object.keys(schema.columns)));
    });
  }
});
