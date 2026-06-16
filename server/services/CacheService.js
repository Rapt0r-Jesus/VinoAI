const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

class CacheService {
  constructor() {
    this.db = new Database(path.join(__dirname, '../cache.db'));
    this.ttl = 86400; // 24 heures en secondes
    this._initTable();
  }

  _initTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS api_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cache_key TEXT NOT NULL UNIQUE,
        payload TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        ttl_seconds INTEGER NOT NULL,
        source TEXT
      )
    `);
  }

  buildCacheKey(name, vintage, producer) {
    const str = `${name}-${vintage || ''}-${producer || ''}`.toLowerCase();
    return crypto.createHash('md5').update(str).digest('hex');
  }

  get(key) {
    const row = this.db
      .prepare('SELECT * FROM api_cache WHERE cache_key = ?')
      .get(key);

    if (!row) return null;
    if (this.isExpired(row.created_at, row.ttl_seconds)) {
      this.delete(key);
      return null;
    }

    return JSON.parse(row.payload);
  }

  set(key, payload, source = 'grapeminds') {
    const now = Math.floor(Date.now() / 1000);
    this.db.prepare(`
      INSERT OR REPLACE INTO api_cache (cache_key, payload, created_at, ttl_seconds, source)
      VALUES (?, ?, ?, ?, ?)
    `).run(key, JSON.stringify(payload), now, this.ttl, source);
  }

  delete(key) {
    this.db.prepare('DELETE FROM api_cache WHERE cache_key = ?').run(key);
  }

  isExpired(createdAt, ttlSeconds) {
    const now = Math.floor(Date.now() / 1000);
    return (now - createdAt) > ttlSeconds;
  }
}

module.exports = new CacheService();
