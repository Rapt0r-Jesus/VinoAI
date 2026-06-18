const express = require('express');
const router = express.Router();
const visionController = require('../controllers/VisionController');
const wineController = require('../controllers/WineController');
const responseBuilder = require('../services/ResponseBuilder');

// POST /api/v1/scan
router.post('/', async (req, res) => {
  const { image, format = 'jpeg' } = req.body;

  // Validation
  if (!image) {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'Missing required field: image' }
    });
  }

  try {
    // 1. Claude Vision → extrait les infos du label
    const visionData = await visionController.analyzeLabel(image);

    // 2. WineController → cherche dans cache ou GrapeMinds
    const wineData = await wineController.getWine(
      visionData.name,
      visionData.vintage,
      visionData.producer
    );

    // 3. ResponseBuilder → merge les deux sources
    const payload = responseBuilder.merge(visionData, wineData);

    return res.status(200).json(payload);

  } catch (error) {
    if (error.message.includes('EXTRACTION_FAILED')) {
      return res.status(422).json({
        error: { code: 'EXTRACTION_FAILED', message: 'Could not extract wine name from label' }
      });
    }
    if (error.message.includes('RATE_LIMITED') || error.message.includes('SERVER_ERROR')) {
      return res.status(503).json({
        error: { code: 'SERVICE_UNAVAILABLE', message: 'External service unavailable' }
      });
    }
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error' }
    });
  }
});

// GET /api/v1/wines/search
router.get('/wines/search', async (req, res) => {
  const { q, limit = 5 } = req.query;

  if (!q) {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'Missing required parameter: q' }
    });
  }

  try {
    const results = await wineController.searchWine(q, parseInt(limit));
    return res.status(200).json({ results, total: results.length });
  } catch (error) {
    return res.status(503).json({
      error: { code: 'SERVICE_UNAVAILABLE', message: 'GrapeMinds API unavailable' }
    });
  }
});

module.exports = router;
