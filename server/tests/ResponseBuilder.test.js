const responseBuilder = require('../services/ResponseBuilder');

describe('ResponseBuilder', () => {

  const visionData = {
    name: 'Château Margaux',
    vintage: 2018,
    producer: 'Château Margaux',
    region: 'Bordeaux',
  };

  const wineData = {
    grape: 'Cabernet Sauvignon',
    appellation: 'Margaux AOC',
    tasting_notes: 'Dark plum, cedar, long finish.',
    food_pairings: ['Lamb', 'Duck'],
    grapeminds_id: 'gm_001',
  };

  it('merges vision and wine data correctly', () => {
    const result = responseBuilder.merge(visionData, wineData);

    expect(result.name).toBe('Château Margaux');
    expect(result.vintage).toBe(2018);
    expect(result.grape).toBe('Cabernet Sauvignon');
    expect(result.appellation).toBe('Margaux AOC');
    expect(result.food_pairings).toEqual(['Lamb', 'Duck']);
  });

  it('replaces null fields with empty string', () => {
    const result = responseBuilder.merge(
      { name: 'Test Wine', vintage: null, producer: null, region: null },
      { grape: null, appellation: null, tasting_notes: null, food_pairings: [], grapeminds_id: null }
    );

    expect(result.producer).toBe('');
    expect(result.region).toBe('');
    expect(result.grape).toBe('');
    expect(result.food_pairings).toEqual([]);
  });

  it('toJSON returns a valid JSON string', () => {
    const payload = responseBuilder.merge(visionData, wineData);
    const json = responseBuilder.toJSON(payload);

    expect(typeof json).toBe('string');
    const parsed = JSON.parse(json);
    expect(parsed.name).toBe('Château Margaux');
  });

});
