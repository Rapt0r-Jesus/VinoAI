jest.mock('axios');
const axios = require('axios');
const grapeMindsService = require('../services/GrapeMindsService');

describe('GrapeMindsService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches wine data correctly', async () => {
    axios.get.mockResolvedValue({
      data: {
        id: 'gm_001',
        grape: 'Cabernet Sauvignon',
        appellation: 'Pauillac AOC',
        tasting_notes: 'Dark plum, cedar, long finish.',
        food_pairings: ['Lamb', 'Duck'],
        producer_bio: 'Famous Bordeaux estate.',
      }
    });

    const result = await grapeMindsService.fetchWineData('Château Margaux', 2018);

    expect(result.grape).toBe('Cabernet Sauvignon');
    expect(result.appellation).toBe('Pauillac AOC');
    expect(result.grapeminds_id).toBe('gm_001');
  });

  it('throws NOT_FOUND on 404 response', async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } });

    await expect(grapeMindsService.fetchWineData('Unknown Wine'))
      .rejects.toThrow('NOT_FOUND');
  });

  it('throws RATE_LIMITED on 429 response', async () => {
    axios.get.mockRejectedValue({ response: { status: 429 } });

    await expect(grapeMindsService.fetchWineData('Château Margaux'))
      .rejects.toThrow('RATE_LIMITED');
  });

  it('searchByName returns results array', async () => {
    axios.get.mockResolvedValue({
      data: {
        results: [
          { name: 'Château Margaux 2018', vintage: 2018 }
        ]
      }
    });

    const results = await grapeMindsService.searchByName('Margaux');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Château Margaux 2018');
  });

});
