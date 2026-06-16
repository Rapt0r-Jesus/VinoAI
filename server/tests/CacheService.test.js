const cacheService = require('../services/CacheService');

describe('CacheService', () => {

  beforeEach(() => {
    // Nettoie le cache avant chaque test
    cacheService.db.exec('DELETE FROM api_cache');
  });

  it('stores and retrieves a value correctly', () => {
    const key = cacheService.buildCacheKey('Château Margaux', 2018, null);
    const payload = { grape: 'Cabernet Sauvignon', appellation: 'Margaux AOC' };

    cacheService.set(key, payload);
    const result = cacheService.get(key);

    expect(result).not.toBeNull();
    expect(result.grape).toBe('Cabernet Sauvignon');
  });

  it('returns null for non-existent key', () => {
    const result = cacheService.get('non-existent-key');
    expect(result).toBeNull();
  });

  it('returns null for expired entry', () => {
    const key = cacheService.buildCacheKey('Expired Wine', 2020, null);
    const payload = { grape: 'Merlot' };

    // Insert avec created_at dans le passé (25h ago)
    const expiredTime = Math.floor(Date.now() / 1000) - 90000;
    cacheService.db.prepare(`
      INSERT INTO api_cache (cache_key, payload, created_at, ttl_seconds, source)
      VALUES (?, ?, ?, ?, ?)
    `).run(key, JSON.stringify(payload), expiredTime, 86400, 'test');

    const result = cacheService.get(key);
    expect(result).toBeNull();
  });

  it('buildCacheKey generates consistent hash', () => {
    const key1 = cacheService.buildCacheKey('Château Margaux', 2018, null);
    const key2 = cacheService.buildCacheKey('Château Margaux', 2018, null);
    expect(key1).toBe(key2);
  });

  it('isExpired returns true for old entries', () => {
    const oldTime = Math.floor(Date.now() / 1000) - 90000;
    expect(cacheService.isExpired(oldTime, 86400)).toBe(true);
  });

  it('isExpired returns false for recent entries', () => {
    const recentTime = Math.floor(Date.now() / 1000) - 100;
    expect(cacheService.isExpired(recentTime, 86400)).toBe(false);
  });

});
