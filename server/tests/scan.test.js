jest.mock('../controllers/VisionController');
jest.mock('../controllers/WineController');
jest.mock('../services/ResponseBuilder');

const request = require('supertest');
const app = require('../server');
const visionController = require('../controllers/VisionController');
const wineController = require('../controllers/WineController');
const responseBuilder = require('../services/ResponseBuilder');

describe('POST /api/v1/scan', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when image field is missing', async () => {
    const res = await request(app)
      .post('/api/v1/scan')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('returns 200 with WinePayload on success', async () => {
    visionController.analyzeLabel.mockResolvedValue({
      name: 'Château Margaux', vintage: 2018,
      producer: 'Château Margaux', region: 'Bordeaux'
    });
    wineController.getWine.mockResolvedValue({
      grape: 'Cabernet Sauvignon', appellation: 'Margaux AOC',
      tasting_notes: 'Dark plum', food_pairings: ['Lamb']
    });
    responseBuilder.merge.mockReturnValue({
      name: 'Château Margaux', vintage: 2018,
      grape: 'Cabernet Sauvignon', food_pairings: ['Lamb']
    });

    const res = await request(app)
      .post('/api/v1/scan')
      .send({ image: 'fake-base64', format: 'jpeg' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Château Margaux');
  });

  it('returns 422 when label is unreadable', async () => {
    visionController.analyzeLabel.mockRejectedValue(
      new Error('EXTRACTION_FAILED: Could not extract wine name')
    );

    const res = await request(app)
      .post('/api/v1/scan')
      .send({ image: 'blurry-base64' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('EXTRACTION_FAILED');
  });

  it('returns 503 when external service is unavailable', async () => {
    visionController.analyzeLabel.mockRejectedValue(
      new Error('RATE_LIMITED: Too many requests')
    );

    const res = await request(app)
      .post('/api/v1/scan')
      .send({ image: 'fake-base64' });

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('SERVICE_UNAVAILABLE');
  });

});

describe('GET /api/v1/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
