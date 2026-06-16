jest.mock('../services/GrapeMindsService');
jest.mock('../services/CacheService');

const grapeMindsService = require('../services/GrapeMindsService');
const cacheService = require('../services/CacheService');
const wineController = require('../controllers/WineController');

describe('WineController', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns cached data without calling GrapeMinds', async () => {
    cacheService.buildCacheKey.mockReturnValue('abc123');
    cacheService.get.mockReturnValue({ grape: 'Merlot', appellation: 'Pomerol AOC' });

    const result = await wineController.getWine('Pétrus', 2015);

    expect(result.grape).toBe('Merlot');
    expect(grapeMindsService.fetchWineData).not.toHaveBeenCalled();
  });

  it('calls GrapeMinds on cache miss and saves to cache', async () => {
    cacheService.buildCacheKey.mockReturnValue('abc123');
    cacheService.get.mockReturnValue(null);
    grapeMindsService.fetchWineData.mockResolvedValue({
      grape: 'Cabernet Sauvignon',
      appellation: 'Pauillac AOC',
    });

    const result = await wineController.getWine('Château Latour', 2018);

    expect(grapeMindsService.fetchWineData).toHaveBeenCalledWith('Château Latour', 2018, null);
    expect(cacheService.set).toHaveBeenCalled();
    expect(result.grape).toBe('Cabernet Sauvignon');
  });

  it('searchWine calls GrapeMinds searchByName', async () => {
    grapeMindsService.searchByName.mockResolvedValue([
      { name: 'Château Margaux 2018' }
    ]);

    const results = await wineController.searchWine('Margaux');

    expect(grapeMindsService.searchByName).toHaveBeenCalledWith('Margaux', 5);
    expect(results).toHaveLength(1);
  });

});
