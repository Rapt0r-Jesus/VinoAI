const grapeMindsService = require('../services/GrapeMindsService');
const cacheService = require('../services/CacheService');

class WineController {
  async getWine(name, vintage = null, producer = null) {
    // 1. Vérifie le cache d'abord
    const cacheKey = cacheService.buildCacheKey(name, vintage, producer);
    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log('Cache hit for:', name);
      return cached;
    }

    // 2. Cache miss → appelle GrapeMinds
    console.log('Cache miss, fetching from GrapeMinds:', name);
    const wineData = await grapeMindsService.fetchWineData(name, vintage, producer);

    // 3. Sauvegarde dans le cache
    cacheService.set(cacheKey, wineData);

    return wineData;
  }

  async searchWine(query, limit = 5) {
    return await grapeMindsService.searchByName(query, limit);
  }

  buildCacheKey(name, vintage, producer) {
    return cacheService.buildCacheKey(name, vintage, producer);
  }
}

module.exports = new WineController();
